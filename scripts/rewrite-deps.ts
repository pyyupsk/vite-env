#!/usr/bin/env bun
/**
 * Rewrites workspace:* and catalog: protocols in package.json dependencies
 * to concrete semver ranges before npm publish. Run via prepack/postpack.
 *
 * Usage (from package directory):
 *   bun ../../scripts/rewrite-deps.ts rewrite   # prepack
 *   bun ../../scripts/rewrite-deps.ts restore   # postpack
 */

import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const pkgDir = process.cwd();
const pkgPath = resolve(pkgDir, "package.json");
const backupPath = resolve(pkgDir, "package.json.bak");

function readJson(p: string): Record<string, unknown> {
  return JSON.parse(readFileSync(p, "utf8"));
}

// Bun stores catalog/catalogs inside the workspaces object, not at root level.
// Shape: { packages: string[], catalog?: {...}, catalogs?: { label: {...} } }
function buildCatalogMap(rootPkg: Record<string, unknown>): Map<string, string> {
  const map = new Map<string, string>();
  const ws = rootPkg.workspaces as
    | {
        packages?: string[];
        catalog?: Record<string, string>;
        catalogs?: Record<string, Record<string, string>>;
      }
    | undefined;

  for (const [name, range] of Object.entries(ws?.catalog ?? {})) {
    map.set(`catalog:##${name}`, range);
  }

  for (const [label, entries] of Object.entries(ws?.catalogs ?? {})) {
    for (const [name, range] of Object.entries(entries)) {
      map.set(`catalog:${label}##${name}`, range);
    }
  }

  return map;
}

function buildWorkspaceMap(rootPkg: Record<string, unknown>): Map<string, string> {
  const map = new Map<string, string>();
  const ws = rootPkg.workspaces as { packages?: string[] } | string[] | undefined;
  const patterns: string[] = Array.isArray(ws) ? ws : (ws?.packages ?? []);

  for (const pattern of patterns) {
    const glob = new Bun.Glob(`${pattern}/package.json`);
    for (const rel of glob.scanSync({ cwd: root })) {
      try {
        const wPkg = readJson(resolve(root, rel));
        const name = wPkg.name as string;
        const version = wPkg.version as string;
        if (name && version) map.set(name, version);
      } catch {
        // skip unreadable
      }
    }
  }

  return map;
}

function resolveDepValue(
  name: string,
  value: string,
  catalogMap: Map<string, string>,
  workspaceMap: Map<string, string>,
): string {
  if (value.startsWith("workspace:")) {
    const resolved = workspaceMap.get(name);
    if (!resolved) throw new Error(`workspace dep "${name}" not found in monorepo`);
    return `^${resolved}`;
  }

  if (value.startsWith("catalog:")) {
    const label = value.slice("catalog:".length);
    const key = label ? `catalog:${label}##${name}` : `catalog:##${name}`;
    const resolved = catalogMap.get(key);
    if (!resolved) throw new Error(`catalog entry "${value}" for "${name}" not found`);
    return resolved;
  }

  return value;
}

function rewrite(): void {
  if (existsSync(backupPath)) {
    console.error("[rewrite-deps] backup already exists; run restore first");
    process.exit(1);
  }

  const rootPkg = readJson(resolve(root, "package.json"));
  const catalogMap = buildCatalogMap(rootPkg);
  const workspaceMap = buildWorkspaceMap(rootPkg);

  const pkg = readJson(pkgPath);
  writeFileSync(backupPath, JSON.stringify(pkg, null, 2) + "\n");

  for (const field of ["dependencies", "optionalDependencies", "peerDependencies"] as const) {
    const deps = pkg[field] as Record<string, string> | undefined;
    if (!deps) continue;
    for (const [name, value] of Object.entries(deps)) {
      deps[name] = resolveDepValue(name, value, catalogMap, workspaceMap);
    }
  }

  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  console.log(`[rewrite-deps] rewrote ${pkgPath}`);
}

function restore(): void {
  if (!existsSync(backupPath)) return;
  renameSync(backupPath, pkgPath);
  console.log(`[rewrite-deps] restored ${pkgPath}`);
}

const cmd = process.argv[2];
if (cmd === "rewrite") rewrite();
else if (cmd === "restore") restore();
else {
  console.error("Usage: rewrite-deps.ts rewrite|restore");
  process.exit(1);
}
