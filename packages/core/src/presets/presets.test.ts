import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { defineEnv, validateEnv } from "../schema";
import { netlify } from "./netlify";
import { railway } from "./railway";
import { vercel } from "./vercel";

describe("defineEnv presets merge", () => {
  it("presets: [] is identical to no presets key", () => {
    const withEmpty = defineEnv({ presets: [], server: { FOO: z.string() } });
    const withNone = defineEnv({ server: { FOO: z.string() } });
    expect(Object.keys(withEmpty.server)).toEqual(Object.keys(withNone.server));
  });

  it("presets are retained on the return value for validation-time detection", () => {
    const result = defineEnv({ presets: [vercel], server: { MY_VAR: z.string() } });
    expect(result.presets).toEqual([vercel]);
  });

  it("preset server keys appear in the merged return", () => {
    const result = defineEnv({ presets: [vercel], server: { MY_VAR: z.string() } });
    expect(result.server).toHaveProperty("VERCEL_ENV");
    expect(result.server).toHaveProperty("MY_VAR");
  });

  it("user server field wins over preset field with same key", () => {
    const stricterSchema = z.string().min(10);
    const result = defineEnv({
      presets: [vercel],
      server: { VERCEL_URL: stricterSchema },
    });
    expect(result.server.VERCEL_URL).toBe(stricterSchema);
  });

  it("warns when user field overrides a preset field", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    defineEnv({ presets: [vercel], server: { VERCEL_URL: z.string() } });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("VERCEL_URL"));
    warn.mockRestore();
  });

  it("warns when two presets share a key", () => {
    const duplicate = { server: { RAILWAY_ENVIRONMENT_ID: z.string() } };
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    defineEnv({ presets: [railway, duplicate] });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("RAILWAY_ENVIRONMENT_ID"));
    warn.mockRestore();
  });

  it("merges server keys from multiple presets", () => {
    const result = defineEnv({ presets: [vercel, railway] });
    expect(result.server).toHaveProperty("VERCEL_ENV");
    expect(result.server).toHaveProperty("RAILWAY_ENVIRONMENT_ID");
  });

  it("last preset wins when two presets share a key", () => {
    const first = { server: { SHARED: z.string().min(1) } };
    const second = { server: { SHARED: z.string().min(5) } };
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = defineEnv({ presets: [first, second] });
    warn.mockRestore();
    expect(result.server!.SHARED).toBe(second.server.SHARED);
  });

  it("throws when a preset client key lacks VITE_ prefix", () => {
    const badPreset = { client: { NO_PREFIX: z.string() } };
    expect(() => defineEnv({ presets: [badPreset] })).toThrow(
      '[vite-env] Client env var "NO_PREFIX" must be prefixed with VITE_',
    );
  });
});

describe("preset platform detection", () => {
  it("passes locally when platform vars are absent and platform not detected", () => {
    const def = defineEnv({
      presets: [vercel],
      server: { MY_SECRET: z.string() },
      client: { VITE_APP_NAME: z.string() },
    });
    const result = validateEnv(def, { MY_SECRET: "sec", VITE_APP_NAME: "app" });
    expect(result.success).toBe(true);
  });

  it("fails on the platform when required preset vars are missing", () => {
    const def = defineEnv({ presets: [vercel] });
    const result = validateEnv(def, { VERCEL: "1" });
    expect(result.success).toBe(false);
    const paths = result.errors.map((e) => e.path[0]);
    expect(paths).toContain("VERCEL_ENV");
    expect(paths).toContain("VERCEL_URL");
  });

  it("passes on the platform when all required preset vars are present", () => {
    const def = defineEnv({ presets: [vercel] });
    const result = validateEnv(def, {
      VERCEL: "1",
      VERCEL_ENV: "production",
      VERCEL_URL: "myapp-abc123.vercel.app",
      VERCEL_PROJECT_PRODUCTION_URL: "myapp.vercel.app",
      VERCEL_DEPLOYMENT_ID: "dpl_123",
    });
    expect(result.success).toBe(true);
  });

  it("user-overridden preset key stays required even when platform not detected", () => {
    const def = defineEnv({
      presets: [vercel],
      server: { VERCEL_ENV: z.enum(["production", "preview", "development"]) },
    });
    const result = validateEnv(def, {});
    expect(result.success).toBe(false);
    expect(result.errors.map((e) => e.path[0])).toEqual(["VERCEL_ENV"]);
  });

  it("detects railway via RAILWAY_ENVIRONMENT_ID", () => {
    const def = defineEnv({ presets: [railway] });
    expect(validateEnv(def, {}).success).toBe(true);
    expect(validateEnv(def, { RAILWAY_ENVIRONMENT_ID: "env_1" }).success).toBe(false);
  });

  it("detects netlify via NETLIFY=true", () => {
    const def = defineEnv({ presets: [netlify] });
    expect(validateEnv(def, {}).success).toBe(true);
    expect(validateEnv(def, { NETLIFY: "true" }).success).toBe(false);
  });

  it("two undetected presets sharing a key relax it once without double-wrapping", () => {
    const shared = z.string().min(1);
    const first = { server: { SHARED: shared }, detect: () => false };
    const second = { server: { SHARED: shared }, detect: () => false };
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const def = defineEnv({ presets: [first, second] });
    warn.mockRestore();
    expect(validateEnv(def, {}).success).toBe(true);
    expect(validateEnv(def, { SHARED: "value" }).success).toBe(true);
    expect(validateEnv(def, { SHARED: "" }).success).toBe(false);
  });

  it("preset without detect stays strict everywhere", () => {
    const def = defineEnv({ presets: [{ server: { ALWAYS_REQUIRED: z.string() } }] });
    expect(validateEnv(def, {}).success).toBe(false);
  });
});
