import { describe, expect, it } from "vitest";
import { detectServerLeak } from "./leak";

function serverDef(key: string) {
  return { server: { [key]: {} as any } };
}

function singleChunk(code: string) {
  return { "main.js": { type: "chunk", code } };
}

describe("detectServerLeak", () => {
  it("should detect server values in client chunks", () => {
    const def = {
      server: { SECRET_KEY: {} as any },
      client: { VITE_PUB: {} as any },
    };
    const data = { SECRET_KEY: "super-secret-value-here", VITE_PUB: "public" };
    const bundle = singleChunk('const x = "super-secret-value-here"');

    const leaks = detectServerLeak(def, data, bundle);

    expect(leaks).toHaveLength(1);
    expect(leaks[0]).toEqual({ key: "SECRET_KEY", chunk: "main.js" });
  });

  it("should not flag client values", () => {
    const def = {
      server: { SECRET: {} as any },
      client: { VITE_PUB: {} as any },
    };
    const data = { SECRET: "long-secret-value", VITE_PUB: "public-value-here" };
    const leaks = detectServerLeak(def, data, singleChunk('const x = "public-value-here"'));
    expect(leaks).toHaveLength(0);
  });

  it("should skip values shorter than 8 chars", () => {
    const def = serverDef("SHORT");
    expect(detectServerLeak(def, { SHORT: "abc" }, singleChunk('const x = "abc"'))).toHaveLength(0);
  });

  it("should skip non-string values", () => {
    const def = serverDef("NUM");
    expect(
      detectServerLeak(def, { NUM: 12345678 as unknown } as any, singleChunk("const x = 12345678")),
    ).toHaveLength(0);
  });

  it("should skip non-chunk bundle entries", () => {
    const def = serverDef("SECRET");
    const bundle = { "style.css": { type: "asset", code: "long-secret-value" } };
    expect(detectServerLeak(def, { SECRET: "long-secret-value" }, bundle)).toHaveLength(0);
  });

  it("should skip chunks without code", () => {
    const def = serverDef("SECRET");
    expect(
      detectServerLeak(def, { SECRET: "long-secret-value" }, { "main.js": { type: "chunk" } }),
    ).toHaveLength(0);
  });

  it("should detect leaks across multiple chunks", () => {
    const def = serverDef("SECRET");
    const bundle = {
      "a.js": { type: "chunk", code: "safe code here" },
      "b.js": { type: "chunk", code: `const x = "leaked-secret-value"` },
    };

    const leaks = detectServerLeak(def, { SECRET: "leaked-secret-value" }, bundle);
    expect(leaks).toHaveLength(1);
    expect(leaks[0].chunk).toBe("b.js");
  });

  it("should not flag bare substring match (false positive)", () => {
    const def = serverDef("DB_URL");
    const bundle = singleChunk(`var t="connect-to-postgres-primary-host"`);
    expect(detectServerLeak(def, { DB_URL: "postgres-primary" }, bundle)).toHaveLength(0);
  });

  it.each([
    ["double quotes", (v: string) => `const x = "${v}"`],
    ["single quotes", (v: string) => `const x = '${v}'`],
    ["backticks", (v: string) => `const x = \`${v}\``],
  ])("should detect value quoted with %s", (_, wrap) => {
    const def = serverDef("SECRET");
    const value = "quoted-secret-val";
    const leaks = detectServerLeak(def, { SECRET: value }, singleChunk(wrap(value)));
    expect(leaks).toHaveLength(1);
    expect(leaks[0].key).toBe("SECRET");
  });

  it("should not flag mismatched quote delimiters", () => {
    const def = serverDef("SECRET");
    expect(
      detectServerLeak(
        def,
        { SECRET: "mismatched-quote-val" },
        singleChunk(`var x = 'mismatched-quote-val"`),
      ),
    ).toHaveLength(0);
  });

  it("should detect value with regex special chars (e.g. URL)", () => {
    const def = serverDef("API_URL");
    const leaks = detectServerLeak(
      def,
      { API_URL: "https://api.example.com/v1" },
      singleChunk(`fetch("https://api.example.com/v1")`),
    );
    expect(leaks).toHaveLength(1);
    expect(leaks[0].key).toBe("API_URL");
  });

  it("should handle empty server definition", () => {
    const def = { client: { VITE_X: {} as any } };
    expect(
      detectServerLeak(def, { VITE_X: "some-value-here" }, singleChunk("some-value-here")),
    ).toHaveLength(0);
  });
});
