import { describe, expect, it } from "vitest";
import { loadEnvConfig } from "./config";
import { writeFileSync, unlinkSync, mkdirSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

function tmpFile(name: string, content: string) {
  const dir = join(tmpdir(), "vite-env-config-test");
  mkdirSync(dir, { recursive: true });
  const p = join(dir, name);
  writeFileSync(p, content);
  return p;
}

describe("loadEnvConfig", () => {
  it("should throw when config does not export an object", async () => {
    const p = tmpFile("bad-string.ts", "export default 'not-an-object'");
    await expect(loadEnvConfig(p)).rejects.toThrow(/must export an object \(got string\)/);
    unlinkSync(p);
  });
});
