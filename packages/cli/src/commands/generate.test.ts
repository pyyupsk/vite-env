import { describe, expect, it } from "vitest";
import { z } from "zod";
import { buildHint, generateCommand, getDefault } from "./generate";

describe("generateCommand", () => {
  it("should be a valid command definition", () => {
    expect(generateCommand).toBeDefined();
  });

  it("should have correct meta description", () => {
    const def = generateCommand as any;
    expect(def.meta?.description ?? def.description).toContain(".env.example");
  });

  it("should define config and output args", () => {
    const def = generateCommand as any;
    expect(def.args?.config.default).toBe("env.ts");
    expect(def.args?.output.default).toBe(".env.example");
  });
});

describe("zod schema introspection (generate helpers)", () => {
  it("should recognize ZodString", () => {
    expect(z.string()).toBeInstanceOf(z.ZodString);
  });

  it("should recognize ZodNumber", () => {
    expect(z.number()).toBeInstanceOf(z.ZodNumber);
  });

  it("should recognize ZodBoolean", () => {
    expect(z.boolean()).toBeInstanceOf(z.ZodBoolean);
  });

  it("should recognize ZodEnum with options", () => {
    const schema = z.enum(["a", "b", "c"]);
    expect(schema).toBeInstanceOf(z.ZodEnum);
    expect(schema.options).toEqual(["a", "b", "c"]);
  });

  it("should recognize ZodOptional", () => {
    const schema = z.string().optional();
    expect(schema).toBeInstanceOf(z.ZodOptional);
  });

  it("should recognize ZodDefault", () => {
    const schema = z.string().default("hello");
    expect(schema).toBeInstanceOf(z.ZodDefault);
  });

  it("should unwrap ZodOptional to inner type", () => {
    const schema = z.string().optional();
    const inner = schema.unwrap();
    expect(inner).toBeInstanceOf(z.ZodString);
  });

  it("should recognize z.stringbool() as boolean hint via ZodPipe", () => {
    const schema = z.stringbool() as unknown as z.ZodTypeAny;
    expect(buildHint(schema)).toBe("boolean (true | false | 1 | 0)");
  });

  it("should extract default from z.stringbool().default()", () => {
    const schema = z.stringbool().default(false) as unknown as z.ZodTypeAny;
    expect(getDefault(schema)).toBe("false");
  });
});
