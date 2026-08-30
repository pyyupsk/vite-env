import type { StandardSchemaV1 } from "@standard-schema/spec";
import { describe, expect, it } from "vitest";
import { defineStandardEnv, isStandardEnvDefinition, validateStandardEnv } from "./standard";

function mockSchema(
  validator: (
    input: unknown,
  ) => { value: unknown } | { issues: { message: string; path?: readonly PropertyKey[] }[] },
): StandardSchemaV1 {
  return {
    "~standard": {
      version: 1,
      vendor: "test",
      validate: validator,
    },
  } as StandardSchemaV1;
}

function stringSchema() {
  return mockSchema((input) => {
    if (typeof input === "string" && input.length > 0) return { value: input };
    return { issues: [{ message: "Expected non-empty string" }] };
  });
}

function urlSchema() {
  return mockSchema((input) => {
    if (typeof input === "string" && URL.canParse(input)) return { value: input };
    return { issues: [{ message: "Invalid URL" }] };
  });
}

describe("defineStandardEnv", () => {
  it("should return definition with _standard marker", () => {
    const def = defineStandardEnv({
      client: { VITE_API_URL: stringSchema() },
      server: { DB_URL: urlSchema() },
    });
    expect(def._standard).toBe(true);
    expect(def.client).toBeDefined();
    expect(def.server).toBeDefined();
  });

  it("should throw if client key is missing VITE_ prefix", () => {
    expect(() =>
      defineStandardEnv({
        client: { API_URL: stringSchema() },
      }),
    ).toThrow("must be prefixed with VITE_");
  });

  it("should allow server keys without VITE_ prefix", () => {
    const def = defineStandardEnv({
      server: { DATABASE_URL: urlSchema() },
    });
    expect(def.server).toBeDefined();
  });

  it("should allow empty definition", () => {
    const def = defineStandardEnv({});
    expect(def._standard).toBe(true);
  });
});

describe("defineStandardEnv with custom clientPrefix", () => {
  it("should accept custom string prefix", () => {
    const def = defineStandardEnv({
      clientPrefix: "PUBLIC_",
      client: { PUBLIC_API_URL: stringSchema() },
    });
    expect(def.clientPrefix).toEqual(["PUBLIC_"]);
  });

  it("should accept custom array prefix", () => {
    const def = defineStandardEnv({
      clientPrefix: ["PUBLIC_", "APP_"],
      client: { PUBLIC_API_URL: stringSchema(), APP_NAME: stringSchema() },
    });
    expect(def.clientPrefix).toEqual(["PUBLIC_", "APP_"]);
  });

  it("should throw when client key lacks custom prefix (string)", () => {
    expect(() =>
      defineStandardEnv({
        clientPrefix: "PUBLIC_",
        client: { API_URL: stringSchema() },
      }),
    ).toThrow("must be prefixed with PUBLIC_");
  });

  it("should throw when client key lacks custom prefix (array)", () => {
    expect(() =>
      defineStandardEnv({
        clientPrefix: ["PUBLIC_", "APP_"],
        client: { MY_KEY: stringSchema() },
      }),
    ).toThrow("must be prefixed with PUBLIC_ or APP_");
  });

  it("should allow server keys without prefix", () => {
    expect(() =>
      defineStandardEnv({
        clientPrefix: "PUBLIC_",
        server: { DATABASE_URL: urlSchema() },
      }),
    ).not.toThrow();
  });

  it("should not include clientPrefix in result when not explicitly specified", () => {
    const def = defineStandardEnv({
      client: { VITE_API_URL: stringSchema() },
    });
    expect(def.clientPrefix).toBeUndefined();
  });
});

describe("isStandardEnvDefinition", () => {
  it("should return true for standard definitions", () => {
    const def = defineStandardEnv({ client: { VITE_X: stringSchema() } });
    expect(isStandardEnvDefinition(def)).toBe(true);
  });

  it("should return false for plain objects", () => {
    expect(isStandardEnvDefinition({ client: {} })).toBe(false);
  });

  it("should return false for null/undefined", () => {
    expect(isStandardEnvDefinition(null)).toBe(false);
    expect(isStandardEnvDefinition(undefined)).toBe(false);
  });
});

describe("validateStandardEnv", () => {
  it("should validate successfully with correct env", async () => {
    const def = defineStandardEnv({
      server: { DB_URL: urlSchema() },
      client: { VITE_NAME: stringSchema() },
    });
    const result = await validateStandardEnv(def, {
      DB_URL: "https://db.example.com",
      VITE_NAME: "my-app",
    });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      DB_URL: "https://db.example.com",
      VITE_NAME: "my-app",
    });
  });

  it("should return errors for invalid env", async () => {
    const def = defineStandardEnv({
      client: { VITE_URL: urlSchema() },
    });
    const result = await validateStandardEnv(def, {
      VITE_URL: "not-a-url",
    });
    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toContain("Invalid URL");
  });

  it("should report missing required env vars", async () => {
    const def = defineStandardEnv({
      client: { VITE_KEY: stringSchema() },
    });
    const result = await validateStandardEnv(def, {});
    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
  });

  it("should collect errors from multiple keys", async () => {
    const def = defineStandardEnv({
      server: { SECRET: stringSchema() },
      client: { VITE_URL: urlSchema() },
    });
    const result = await validateStandardEnv(def, {
      SECRET: "",
      VITE_URL: "bad",
    });
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });

  it("should use transformed values from validator", async () => {
    const upperSchema = mockSchema((input) => {
      if (typeof input !== "string") return { issues: [{ message: "Expected string" }] };
      return { value: input.toUpperCase() };
    });
    const def = defineStandardEnv({
      client: { VITE_MODE: upperSchema },
    });
    const result = await validateStandardEnv(def, { VITE_MODE: "dev" });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ VITE_MODE: "DEV" });
  });
});
