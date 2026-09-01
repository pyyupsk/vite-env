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
  } = {},
) {
  const def = overrides.def ?? serverDef("SECRET");
  const data = overrides.data ?? { SECRET: "super-secret-value-here" };
  const bundle = overrides.bundle ?? singleChunk('const x = "super-secret-value-here"');
  const expectedLeaks = overrides.expectedLeaks ?? [{ key: "SECRET", chunk: "main.js" }];

  return { def, data, bundle, expectedLeaks };
}

describe("detectServerLeak", () => {
  it("should detect server values in client chunks", () => {
    const { def, data, bundle, expectedLeaks } = createTestCase({
      def: { server: { SECRET_KEY: {} as any }, client: { VITE_PUB: {} as any } },
      data: { SECRET_KEY: "super-secret-value-here", VITE_PUB: "public" },
      bundle: singleChunk('const x = "super-secret-value-here"'),
      expectedLeaks: [{ key: "SECRET_KEY", chunk: "main.js" }],
    });

    const leaks = detectServerLeak(def, data, bundle);

    expect(leaks).toHaveLength(expectedLeaks.length);
    expect(leaks[0]).toEqual(expectedLeaks[0]);
  });

  it("should not flag client values", () => {
    const { def, data, bundle } = createTestCase({
      def: { server: { SECRET: {} as any }, client: { VITE_PUB: {} as any } },
      data: { SECRET: "long-secret-value", VITE_PUB: "public-value-here" },
      bundle: singleChunk('const x = "public-value-here"'),
      expectedLeaks: [],
    });

    const leaks = detectServerLeak(def, data, bundle);

    expect(leaks).toHaveLength(0);
  });

  it("should skip values shorter than 8 chars", () => {
    const { def, data, bundle } = createTestCase({
      def: serverDef("SHORT"),
      data: { SHORT: "abc" },
      bundle: singleChunk('const x = "abc"'),
      expectedLeaks: [],
    });

    expect(detectServerLeak(def, data, bundle)).toHaveLength(0);
  });

  it("should skip non-string values", () => {
    const { def, data, bundle } = createTestCase({
      def: serverDef("NUM"),
      data: { NUM: 12345678 as unknown } as any,
      bundle: singleChunk("const x = 12345678"),
      expectedLeaks: [],
    });

    expect(detectServerLeak(def, data, bundle)).toHaveLength(0);
  });

  it("should skip non-chunk bundle entries", () => {
    const { def, data, bundle } = createTestCase({
      def: serverDef("SECRET"),
      data: { SECRET: "long-secret-value" },
      bundle: { "style.css": { type: "asset", code: "long-secret-value" } },
      expectedLeaks: [],
    });

    expect(detectServerLeak(def, data, bundle)).toHaveLength(0);
  });

  it("should skip chunks without code", () => {
    const { def, data, bundle } = createTestCase({
      def: serverDef("SECRET"),
      data: { SECRET: "long-secret-value" },
      bundle: { "main.js": { type: "chunk" } },
      expectedLeaks: [],
    });

    expect(detectServerLeak(def, data, bundle)).toHaveLength(0);
  });

  it("should detect leaks across multiple chunks", () => {
    const { def, data, bundle, expectedLeaks } = createTestCase({
      def: serverDef("SECRET"),
      data: { SECRET: "leaked-secret-value" },
      bundle: {
        "a.js": { type: "chunk", code: "safe code here" },
        "b.js": { type: "chunk", code: `const x = "leaked-secret-value"` },
      },
      expectedLeaks: [{ key: "SECRET", chunk: "b.js" }],
    });

    const leaks = detectServerLeak(def, data, bundle);

    expect(leaks).toHaveLength(expectedLeaks.length);
    expect(leaks[0].chunk).toBe(expectedLeaks[0].chunk);
  });

  it("should not flag bare substring match (false positive)", () => {
    const { def, data, bundle } = createTestCase({
      def: serverDef("DB_URL"),
      data: { DB_URL: "postgres-primary" },
      bundle: singleChunk(`var t="connect-to-postgres-primary-host"`),
      expectedLeaks: [],
    });

    expect(detectServerLeak(def, data, bundle)).toHaveLength(0);
  });

  it.each([
    ["double quotes", (v: string) => `const x = "${v}"`],
    ["single quotes", (v: string) => `const x = '${v}'`],
    ["backticks", (v: string) => `const x = \`${v}\``],
  ])("should detect value quoted with %s", (_, wrap) => {
    const { def, data, bundle, expectedLeaks } = createTestCase({
      data: { SECRET: "quoted-secret-val" },
      bundle: singleChunk(wrap("quoted-secret-val")),
      expectedLeaks: [{ key: "SECRET", chunk: "main.js" }],
    });

    const leaks = detectServerLeak(def, data, bundle);

    expect(leaks).toHaveLength(expectedLeaks.length);
    expect(leaks[0].key).toBe(expectedLeaks[0].key);
  });

  it("should not flag mismatched quote delimiters", () => {
    const { def, data, bundle } = createTestCase({
      data: { SECRET: "mismatched-quote-val" },
      bundle: singleChunk(`var x = 'mismatched-quote-val"`),
      expectedLeaks: [],
    });

    expect(detectServerLeak(def, data, bundle)).toHaveLength(0);
  });

  it("should detect value with regex special chars (e.g. URL)", () => {
    const { def, data, bundle, expectedLeaks } = createTestCase({
      def: serverDef("API_URL"),
      data: { API_URL: "https://api.example.com/v1" },
      bundle: singleChunk(`fetch("https://api.example.com/v1")`),
      expectedLeaks: [{ key: "API_URL", chunk: "main.js" }],
    });

    const leaks = detectServerLeak(def, data, bundle);

    expect(leaks).toHaveLength(expectedLeaks.length);
    expect(leaks[0].key).toBe(expectedLeaks[0].key);
  });

  it("should handle empty server definition", () => {
    const { def, data, bundle } = createTestCase({
      def: { client: { VITE_X: {} as any } },
      data: { VITE_X: "some-value-here" },
      bundle: singleChunk("some-value-here"),
      expectedLeaks: [],
    });

    expect(detectServerLeak(def, data, bundle)).toHaveLength(0);
  });

  it("should skip pure vendor chunks (all modules from node_modules)", () => {
    const { def, data, bundle } = createTestCase({
      def: serverDef("DB_URL"),
      data: { DB_URL: "postgresql://localhost:5432/mydb" },
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
      expectedLeaks: [],
    });

    expect(detectServerLeak(def, data, bundle)).toHaveLength(0);
  });

  it("should scan mixed chunks (user + vendor modules)", () => {
    const { def, data, bundle, expectedLeaks } = createTestCase({
      def: serverDef("API_SECRET"),
      data: { API_SECRET: "secret-api-key-value" },
      bundle: {
        "main.js": {
          type: "chunk",
          code: `const s = "secret-api-key-value"`,
          moduleIds: ["/project/src/app.ts", "/project/node_modules/some-lib/index.js"],
        },
      },
      expectedLeaks: [{ key: "API_SECRET", chunk: "main.js" }],
    });

    const leaks = detectServerLeak(def, data, bundle);

    expect(leaks).toHaveLength(expectedLeaks.length);
    expect(leaks[0].chunk).toBe(expectedLeaks[0].chunk);
  });

  it("should scan chunks with no moduleIds (legacy/external chunks)", () => {
    const { def, data, bundle, expectedLeaks } = createTestCase({
      def: serverDef("TOKEN"),
      data: { TOKEN: "leaked-token-value" },
      bundle: {
        "entry.js": {
          type: "chunk",
          code: `const t = "leaked-token-value"`,
        },
      },
      expectedLeaks: [{ key: "TOKEN", chunk: "entry.js" }],
    });

    const leaks = detectServerLeak(def, data, bundle);

    expect(leaks).toHaveLength(expectedLeaks.length);
  });

  describe("template literals", () => {
    it.each([
      ["quasi literal", "const x = `super-secret-value-here`", "super-secret-value-here"],
      ["with expression", 'const x = "prefix-super-secret-value-here"', "super-secret-value-here"],
    ])("should detect server value in %s", (_, code, secret) => {
      const { def, data, bundle, expectedLeaks } = createTestCase({
        data: { SECRET: secret },
        bundle: singleChunk(code),
        expectedLeaks: [{ key: "SECRET", chunk: "main.js" }],
      });

      const leaks = detectServerLeak(def, data, bundle);

      expect(leaks).toHaveLength(expectedLeaks.length);
      expect(leaks[0].key).toBe(expectedLeaks[0].key);
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
        data: { SECRET: secret },
        bundle: singleChunk(code),
        expectedLeaks: [{ key: "SECRET", chunk: "main.js" }],
      });

      const leaks = detectServerLeak(def, data, bundle);

      expect(leaks).toHaveLength(expectedLeaks.length);
      expect(leaks[0].key).toBe(expectedLeaks[0].key);
    });

    it("should not detect server value in middle of string (false positive)", () => {
      const { def, data, bundle } = createTestCase({
        def: serverDef("DB_URL"),
        data: { DB_URL: "postgres-primary" },
        bundle: singleChunk('var t="connect-to-postgres-primary-host"'),
        expectedLeaks: [],
      });

      expect(detectServerLeak(def, data, bundle)).toHaveLength(0);
    });
  });

  describe("encoded values", () => {
    const secret = "super-secret-value";

    it.each([
      ["base64", Buffer.from(secret).toString("base64")],
      ["hex", Buffer.from(secret).toString("hex")],
    ])("should detect %s encoded server value", (_, encoded) => {
      const { def, data, bundle, expectedLeaks } = createTestCase({
        data: { SECRET: secret },
        bundle: singleChunk(`const x = "${encoded}"`),
        expectedLeaks: [{ key: "SECRET", chunk: "main.js" }],
      });

      const leaks = detectServerLeak(def, data, bundle);

      expect(leaks).toHaveLength(expectedLeaks.length);
      expect(leaks[0].key).toBe(expectedLeaks[0].key);
    });

    it("should not attempt decode for short literals", () => {
      const { def, data, bundle } = createTestCase({
        data: { SECRET: "abc" },
        bundle: singleChunk('const x = "abc"'),
        expectedLeaks: [],
      });

      expect(detectServerLeak(def, data, bundle)).toHaveLength(0);
    });
  });
});
