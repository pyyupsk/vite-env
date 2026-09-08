import { describe, expect, it } from "vitest";
import { detectServerLeak } from "./leak";

function serverDef(key: string) {
  return { server: { [key]: {} as any } };
}

function singleChunk(code: string) {
  return { "main.js": { type: "chunk", code } };
}

function createTestCase(
  overrides: {
    def?: { server?: Record<string, any>; client?: Record<string, any> };
    data?: Record<string, any>;
    bundle?: Record<string, { type: string; code?: string; moduleIds?: string[] }>;
    expectedLeaks?: { key: string; chunk: string }[];
    secretKey?: string;
    secretValue?: string;
    chunkName?: string;
    chunkCode?: string;
  } = {},
) {
  const secretKey = overrides.secretKey ?? "SECRET";
  const secretValue = overrides.secretValue ?? "super-secret-value-here";
  const chunkName = overrides.chunkName ?? "main.js";
  const chunkCode = overrides.chunkCode ?? `const x = "${secretValue}"`;

  const def = overrides.def ?? serverDef(secretKey);
  const data = overrides.data ?? { [secretKey]: secretValue };
  const bundle = overrides.bundle ?? singleChunk(chunkCode);
  const expectedLeaks =
    overrides.expectedLeaks ??
    (Object.keys(def.server ?? {}).length > 0 ? [{ key: secretKey, chunk: chunkName }] : []);

  return { def, data, bundle, expectedLeaks };
}

function expectLeaks(
  leaks: { key: string; chunk: string }[],
  expected: { key: string; chunk: string }[],
) {
  expect(leaks).toHaveLength(expected.length);
  expected.forEach((exp, i) => {
    expect(leaks[i].key).toBe(exp.key);
    expect(leaks[i].chunk).toBe(exp.chunk);
  });
}

function expectNoLeaks(leaks: { key: string; chunk: string }[]) {
  expect(leaks).toHaveLength(0);
}

function expectNoLeaksForCode(code: string, serverValue = "long-secret-value") {
  const def = { server: { SECRET: {} as any } };
  const data = { SECRET: serverValue };
  const bundle = { "main.js": { type: "chunk", code } };
  expectNoLeaks(detectServerLeak(def, data, bundle));
}

describe("detectServerLeak", () => {
  it("should detect server values in client chunks", () => {
    const { def, data, bundle, expectedLeaks } = createTestCase({
      def: { server: { SECRET_KEY: {} as any }, client: { VITE_PUB: {} as any } },
      secretKey: "SECRET_KEY",
      secretValue: "super-secret-value-here",
    });

    expectLeaks(detectServerLeak(def, data, bundle), expectedLeaks);
  });

  it("should not flag client values", () => {
    const { def, data, bundle } = createTestCase({
      def: { server: { SECRET: {} as any }, client: { VITE_PUB: {} as any } },
      secretValue: "long-secret-value",
      chunkCode: 'const x = "public-value-here"',
    });

    expectNoLeaks(detectServerLeak(def, data, bundle));
  });

  it("should skip values shorter than 8 chars", () => {
    const { def, data, bundle } = createTestCase({
      secretKey: "SHORT",
      secretValue: "abc",
      chunkCode: 'const x = "abc"',
    });

    expectNoLeaks(detectServerLeak(def, data, bundle));
  });

  it("should skip non-string values", () => {
    const { def, data, bundle } = createTestCase({
      secretKey: "NUM",
      secretValue: "12345678",
      chunkCode: "const x = 12345678",
    });

    expectNoLeaks(detectServerLeak(def, data, bundle));
  });

  it("should skip non-chunk bundle entries", () => {
    const { def, data, bundle } = createTestCase({
      bundle: { "style.css": { type: "asset", code: "long-secret-value" } },
    });

    expectNoLeaks(detectServerLeak(def, data, bundle));
  });

  it("should skip chunks without code", () => {
    const { def, data, bundle } = createTestCase({
      bundle: { "main.js": { type: "chunk" } },
    });

    expectNoLeaks(detectServerLeak(def, data, bundle));
  });

  it("should detect leaks across multiple chunks", () => {
    const { def, data, bundle, expectedLeaks } = createTestCase({
      secretKey: "SECRET",
      secretValue: "leaked-secret-value",
      chunkName: "b.js",
      bundle: {
        "a.js": { type: "chunk", code: "safe code here" },
        "b.js": { type: "chunk", code: `const x = "leaked-secret-value"` },
      },
    });

    expectLeaks(detectServerLeak(def, data, bundle), expectedLeaks);
  });

  it("should not flag bare substring match (false positive)", () => {
    const { def, data, bundle } = createTestCase({
      secretKey: "DB_URL",
      secretValue: "postgres-primary",
      chunkCode: `var t="connect-to-postgres-primary-host"`,
    });

    expectNoLeaks(detectServerLeak(def, data, bundle));
  });

  it.each([
    ["double quotes", (v: string) => `const x = "${v}"`],
    ["single quotes", (v: string) => `const x = '${v}'`],
    ["backticks", (v: string) => `const x = \`${v}\``],
  ])("should detect value quoted with %s", (_, wrap) => {
    const { def, data, bundle, expectedLeaks } = createTestCase({
      secretValue: "quoted-secret-val",
      chunkCode: wrap("quoted-secret-val"),
    });

    expectLeaks(detectServerLeak(def, data, bundle), expectedLeaks);
  });

  it("should not flag mismatched quote delimiters", () => {
    const { def, data, bundle } = createTestCase({
      secretValue: "mismatched-quote-val",
      chunkCode: `var x = 'mismatched-quote-val"`,
    });

    expectNoLeaks(detectServerLeak(def, data, bundle));
  });

  it("should detect value with regex special chars (e.g. URL)", () => {
    const { def, data, bundle, expectedLeaks } = createTestCase({
      secretKey: "API_URL",
      secretValue: "https://api.example.com/v1",
      chunkCode: `fetch("https://api.example.com/v1")`,
    });

    expectLeaks(detectServerLeak(def, data, bundle), expectedLeaks);
  });

  it("should handle empty server definition", () => {
    const { def, data, bundle } = createTestCase({
      def: { client: { VITE_X: {} as any } },
      secretKey: "VITE_X",
      secretValue: "some-value-here",
      chunkCode: "some-value-here",
    });

    expectNoLeaks(detectServerLeak(def, data, bundle));
  });

  it("should skip pure vendor chunks (all modules from node_modules)", () => {
    const { def, data, bundle } = createTestCase({
      secretKey: "DB_URL",
      secretValue: "postgresql://localhost:5432/mydb",
      bundle: {
        "vendor.js": {
          type: "chunk",
          code: `const x = "postgresql://localhost:5432/mydb"`,
          moduleIds: [
            "/project/node_modules/pg/lib/client.js",
            "/project/node_modules/pg/index.js",
          ],
        },
      },
    });

    expectNoLeaks(detectServerLeak(def, data, bundle));
  });

  it("should scan mixed chunks (user + vendor modules)", () => {
    const { def, data, bundle, expectedLeaks } = createTestCase({
      secretKey: "API_SECRET",
      secretValue: "secret-api-key-value",
      bundle: {
        "main.js": {
          type: "chunk",
          code: `const s = "secret-api-key-value"`,
          moduleIds: ["/project/src/app.ts", "/project/node_modules/some-lib/index.js"],
        },
      },
    });

    expectLeaks(detectServerLeak(def, data, bundle), expectedLeaks);
  });

  it("should scan chunks with no moduleIds (legacy/external chunks)", () => {
    const { def, data, bundle, expectedLeaks } = createTestCase({
      secretKey: "TOKEN",
      secretValue: "leaked-token-value",
      chunkName: "entry.js",
      bundle: {
        "entry.js": {
          type: "chunk",
          code: `const t = "leaked-token-value"`,
        },
      },
    });

    expectLeaks(detectServerLeak(def, data, bundle), expectedLeaks);
  });

  describe("template literals", () => {
    it.each([
      ["quasi literal", "const x = `super-secret-value-here`", "super-secret-value-here"],
      ["with expression", 'const x = "prefix-super-secret-value-here"', "super-secret-value-here"],
    ])("should detect server value in %s", (_, code, secret) => {
      const { def, data, bundle, expectedLeaks } = createTestCase({
        secretValue: secret,
        chunkCode: code,
      });

      expectLeaks(detectServerLeak(def, data, bundle), expectedLeaks);
    });
  });

  describe("concatenation", () => {
    it.each([
      [
        "end of concatenated string",
        'const x = "prefix-super-secret-value-here"',
        "super-secret-value-here",
      ],
      [
        "start of concatenated string",
        'const x = "super-secret-value-here-suffix"',
        "super-secret-value-here",
      ],
    ])("should detect server value at %s", (_, code, secret) => {
      const { def, data, bundle, expectedLeaks } = createTestCase({
        secretValue: secret,
        chunkCode: code,
      });

      expectLeaks(detectServerLeak(def, data, bundle), expectedLeaks);
    });

    it("should not detect server value in middle of string (false positive)", () => {
      const { def, data, bundle } = createTestCase({
        secretKey: "DB_URL",
        secretValue: "postgres-primary",
        chunkCode: 'var t="connect-to-postgres-primary-host"',
      });

      expectNoLeaks(detectServerLeak(def, data, bundle));
    });
  });

  describe("onSkipped callback", () => {
    it("should call onSkipped with short secret keys", () => {
      const skipped: string[] = [];
      const def = { server: { SHORT: {} as any, LONG: {} as any } };
      const data = { SHORT: "abc", LONG: "long-value-here" };
      const bundle = { "main.js": { type: "chunk", code: `const x = "long-value-here"` } };

      detectServerLeak(def, data, bundle, (keys) => skipped.push(...keys));
      expect(skipped).toContain("SHORT");
      expect(skipped).not.toContain("LONG");
    });
  });

  describe("parse errors", () => {
    it("should skip chunks with invalid JS syntax", () => {
      const def = { server: { SECRET: {} as any } };
      const data = { SECRET: "long-secret-value" };
      const bundle = { "bad.js": { type: "chunk", code: "const = =$==" } };

      expectNoLeaks(detectServerLeak(def, data, bundle));
    });
  });

  describe("evaluateLiteral / evaluateNodeToString edge cases", () => {
    it("should not flag non-string literals (number)", () => {
      expectNoLeaksForCode("const x = 12345678");
    });

    it("should not flag non-string literals (boolean)", () => {
      expectNoLeaksForCode("const x = true");
    });
  });

  describe("evaluateBinaryExpression edge cases", () => {
    it("should not evaluate non-+ binary expressions", () => {
      expectNoLeaksForCode('const x = "a" * "b"');
    });
  });

  describe("evaluateTemplateLiteral edge cases", () => {
    it("should not crash on template literal with unresolvable expressions", () => {
      expectNoLeaksForCode("const x = `${unknownVar}text`");
    });
  });

  describe("couldBeEncoded edge cases", () => {
    it("should return false when server value length is 0", () => {
      expectNoLeaksForCode('const x = ""', "");
    });
  });

  describe("tryBase64Decode / tryHexDecode edge cases", () => {
    it("should not flag non-base64, non-hex strings", () => {
      expectNoLeaksForCode('const x = "not-base64-or-hex!!!"');
    });

    it("should not flag odd-length hex strings", () => {
      expectNoLeaksForCode('const x = "abc12zz"');
    });
  });

  describe("encoded values", () => {
    const secret = "super-secret-value";

    it.each([
      ["base64", Buffer.from(secret).toString("base64")],
      ["hex", Buffer.from(secret).toString("hex")],
    ])("should detect %s encoded server value", (_, encoded) => {
      const { def, data, bundle, expectedLeaks } = createTestCase({
        secretValue: secret,
        chunkCode: `const x = "${encoded}"`,
      });

      expectLeaks(detectServerLeak(def, data, bundle), expectedLeaks);
    });

    it("should not attempt decode for short literals", () => {
      const { def, data, bundle } = createTestCase({
        secretValue: "abc",
        chunkCode: 'const x = "abc"',
      });

      expectNoLeaks(detectServerLeak(def, data, bundle));
    });
  });
});
