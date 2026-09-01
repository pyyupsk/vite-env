import type { AnyEnvDefinition } from "./types";
import { parseSync, Visitor } from "oxc-parser";
import type {
  Program,
  BinaryExpression,
  TemplateLiteral,
  TemplateElement,
  Expression,
} from "@oxc-project/types";

type LeakReport = {
  key: string;
  chunk: string;
};

type BundleChunk = {
  type: string;
  code?: string;
  moduleIds?: string[];
};

const NODE_MODULES_RE = /[\\/]node_modules[\\/]/;

function isVendorChunk(chunk: BundleChunk): boolean {
  const ids = chunk.moduleIds ?? [];
  return ids.length > 0 && ids.every((id) => NODE_MODULES_RE.test(id));
}

/**
 * Early-exit guard for base64/hex decode attempts.
 * Returns true if the decoded length could possibly match the server value length.
 *
 * - Base64 encoded length ≈ 4/3 × original length
 * - Hex encoded length = 2 × original length
 * - So: decoded length for hex = literalLen / 2
 * - decoded length for base64 ≈ literalLen * 3 / 4
 * - Server value length should be in range [hex_decoded, base64_decoded]
 */
function couldBeEncoded(literalLen: number, serverValLen: number): boolean {
  if (serverValLen === 0 || literalLen === 0) return false;
  const hexDecoded = Math.floor(literalLen / 2);
  const base64Decoded = Math.floor((literalLen * 3) / 4);
  return serverValLen >= hexDecoded - 2 && serverValLen <= base64Decoded + 2;
}

/**
 * Attempt to decode base64 and check if it matches the server value.
 */
function tryBase64Decode(literal: string, serverVal: string): boolean {
  try {
    if (!/^[A-Za-z0-9+/]+=*$/.test(literal)) return false;
    const decoded = Buffer.from(literal, "base64").toString("utf-8");
    return decoded === serverVal || decoded.includes(serverVal) || serverVal.includes(decoded);
  } catch {
    return false;
  }
}

/**
 * Attempt to decode hex and check if it matches the server value.
 */
function tryHexDecode(literal: string, serverVal: string): boolean {
  try {
    if (!/^[0-9a-fA-F]+$/.test(literal)) return false;
    if (literal.length % 2 !== 0) return false;
    const decoded = Buffer.from(literal, "hex").toString("utf-8");
    return decoded === serverVal || decoded.includes(serverVal) || serverVal.includes(decoded);
  } catch {
    return false;
  }
}

/**
 * Check if a literal string matches a server value using fuzzy matching.
 * Returns true if the literal is a leak of the server value.
 *
 * Matching rules:
 * - Exact match: literal === serverVal
 * - Concatenation/template literal: literal starts or ends with serverVal
 *   e.g., `"prefix-" + SECRET` → literal "prefix-super-secret" ends with serverVal
 *   e.g., `SECRET + "-suffix"` → literal "super-secret-suffix" starts with serverVal
 * - Encoded values: base64/hex decode attempts with early-exit guard
 *
 * Does NOT match when serverVal is just a substring in the middle (avoids false positives):
 *   e.g., literal "connect-to-postgres-primary-host" should NOT flag serverVal "postgres-primary"
 */
function matchesServerValue(literal: string, serverVal: string): boolean {
  if (literal === serverVal) return true;

  if (literal.startsWith(serverVal) || literal.endsWith(serverVal)) {
    return true;
  }

  if (literal.length < 8) return false;
  const serverValByteLen = Buffer.byteLength(serverVal, "utf8");
  if (!couldBeEncoded(literal.length, serverValByteLen)) return false;

  if (tryBase64Decode(literal, serverVal)) return true;
  if (tryHexDecode(literal, serverVal)) return true;

  return false;
}

/**
 * Collect all string-like values from the AST.
 * Handles string literals, template literals, and statically evaluable concatenations.
 */
function collectStringValues(node: Program): string[] {
  const values: string[] = [];

  function evaluateToString(node: unknown): string | null {
    if (!node || typeof node !== "object") return null;
    const n = node as Record<string, unknown> & { type: string };

    if (n.type === "Literal" && typeof n.value === "string") {
      return n.value;
    }

    if (n.type === "TemplateLiteral") {
      const tpl = n as unknown as TemplateLiteral;
      const quasis = tpl.quasis;
      const expressions = tpl.expressions;
      if (!quasis || quasis.length === 0) return null;
      if (expressions && expressions.length > 0) {
        const exprValues = expressions.map((e) => evaluateToString(e as Expression));
        if (exprValues.some((v): v is null => v === null)) return null;
        let result = quasis[0].value?.cooked ?? "";
        for (let i = 0; i < exprValues.length; i++) {
          result += exprValues[i]! + (quasis[i + 1]?.value?.cooked ?? "");
        }
        return result;
      }
      return quasis[0].value?.cooked ?? null;
    }

    if (n.type === "BinaryExpression" && n.operator === "+") {
      const bin = n as unknown as BinaryExpression;
      const left = evaluateToString(bin.left);
      const right = evaluateToString(bin.right);
      if (left !== null && right !== null) {
        return left + right;
      }
    }

    if (n.type === "TemplateElement") {
      const el = n as unknown as TemplateElement;
      if (el.value && typeof el.value.cooked === "string") {
        return el.value.cooked;
      }
    }

    return null;
  }

  const visitor = new Visitor({
    Literal(n) {
      if (n.type === "Literal" && typeof n.value === "string") {
        values.push(n.value);
      }
    },
    TemplateElement(n: TemplateElement) {
      if (n.value && typeof n.value.cooked === "string") {
        values.push(n.value.cooked);
      }
    },
    BinaryExpression(n: BinaryExpression) {
      if (n.operator === "+") {
        const evaluated = evaluateToString(n);
        if (evaluated !== null) values.push(evaluated);
      }
    },
    TemplateLiteral(n: TemplateLiteral) {
      const evaluated = evaluateToString(n);
      if (evaluated !== null) values.push(evaluated);
    },
  });

  visitor.visit(node);
  return values;
}

/**
 * Scans client-destined chunks for server-only var values appearing as quoted
 * string literals using AST parsing. Bare substring matches are ignored — only
 * quoted literals indicate a real bundler-inlined leak. Values < 8 chars are skipped.
 * Pure vendor chunks (all modules from node_modules) are excluded to avoid
 * false positives from libraries that happen to contain the same string values.
 *
 * Uses oxc-parser for accurate AST-based detection, catching:
 * - Exact string literal matches
 * - Template literal parts
 * - Concatenated strings (via startsWith/endsWith matching)
 * - Base64/hex encoded values (with early-exit guard)
 */
export function detectServerLeak(
  def: AnyEnvDefinition,
  data: Record<string, unknown>,
  bundle: Record<string, BundleChunk>,
  onSkipped?: (keys: string[]) => void,
): LeakReport[] {
  const serverKeys = new Set(Object.keys(def.server ?? {}));

  const shortSecrets = Object.entries(data).filter(
    (entry): entry is [string, string] =>
      serverKeys.has(entry[0]) && typeof entry[1] === "string" && entry[1].length < 8,
  );

  if (shortSecrets.length > 0 && onSkipped) {
    onSkipped(shortSecrets.map(([k]) => k));
  }

  const serverSecrets = Object.entries(data).filter(
    (entry): entry is [string, string] =>
      serverKeys.has(entry[0]) && typeof entry[1] === "string" && entry[1].length >= 8,
  );

  const chunks = Object.entries(bundle).filter(
    ([, chunk]) => chunk.type === "chunk" && !!chunk.code && !isVendorChunk(chunk),
  );

  const leaks: LeakReport[] = [];

  for (const [chunkName, chunk] of chunks) {
    let parsed: Program;
    try {
      const result = parseSync(chunkName, chunk.code!, { astType: "js" });
      if (result.errors.length > 0) continue;
      parsed = result.program;
    } catch {
      continue;
    }

    const stringValues = collectStringValues(parsed);

    for (const [key, value] of serverSecrets) {
      const isLeak = stringValues.some((sv) => matchesServerValue(sv, value));
      if (isLeak) {
        leaks.push({ key, chunk: chunkName });
      }
    }
  }

  return leaks;
}
