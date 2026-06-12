import { describe, expect, it, vi, beforeEach, afterEach, type MockInstance } from "vitest";
import { z } from "zod";
import path from "node:path";
import { defineEnv } from "./schema";
import { defineStandardEnv } from "./standard";

vi.mock("vite", () => ({
  loadEnv: vi.fn(() => ({ VITE_APP_URL: "http://localhost:3000" })),
}));

const TEST_ENV = {
  DATABASE_URL: "http://db.example.com",
  SECRET_KEY: "supersecretkey",
  VITE_APP_URL: "http://localhost:3000",
} as const;

const makeConfig = () =>
  defineEnv({
    server: {
      DATABASE_URL: z.url(),
      SECRET_KEY: z.string().min(8),
    },
    client: {
      VITE_APP_URL: z.url(),
    },
  });

beforeEach(() => {
  for (const [k, v] of Object.entries(TEST_ENV)) process.env[k] = v;
});

afterEach(() => {
  for (const k of Object.keys(TEST_ENV)) delete process.env[k];
  vi.clearAllMocks();
});

describe("loadEnv (Zod)", () => {
  it("returns server, client, all namespaces", async () => {
    const { loadEnv } = await import("./load");
    const result = await loadEnv(makeConfig());

    expect(result.server).toMatchObject({
      DATABASE_URL: TEST_ENV.DATABASE_URL,
      SECRET_KEY: TEST_ENV.SECRET_KEY,
      VITE_APP_URL: TEST_ENV.VITE_APP_URL,
    });
    expect(result.client).toMatchObject({ VITE_APP_URL: TEST_ENV.VITE_APP_URL });
    expect(result.all).toBe(result.server);
  });

  it("client contains only VITE_ keys", async () => {
    const { loadEnv } = await import("./load");
    const result = await loadEnv(makeConfig());

    expect(Object.keys(result.client)).toEqual(["VITE_APP_URL"]);
    expect(result.client).not.toHaveProperty("DATABASE_URL");
    expect(result.client).not.toHaveProperty("SECRET_KEY");
  });

  it("throws on validation failure", async () => {
    delete process.env["DATABASE_URL"];
    const { loadEnv } = await import("./load");
    await expect(loadEnv(makeConfig())).rejects.toThrow("[vite-env] Validation failed");
  });

  it("passes mode to viteLoadEnv", async () => {
    const vite = await import("vite");
    const spy = vite.loadEnv as unknown as MockInstance;
    const { loadEnv } = await import("./load");
    await loadEnv(makeConfig(), { mode: "production" });
    expect(spy).toHaveBeenLastCalledWith("production", expect.any(String), "");
  });

  it("resolves envDir and passes to viteLoadEnv", async () => {
    const vite = await import("vite");
    const spy = vite.loadEnv as unknown as MockInstance;
    const { loadEnv } = await import("./load");
    const envDir = "custom/dir";
    await loadEnv(makeConfig(), { envDir });
    expect(spy).toHaveBeenLastCalledWith(expect.any(String), path.resolve(envDir), "");
  });
});

describe("loadEnv (Standard Schema)", () => {
  it("returns server, client, all for standard schema config", async () => {
    const { loadEnv } = await import("./load");
    const config = defineStandardEnv({
      server: {
        DATABASE_URL: z.url(),
        SECRET_KEY: z.string().min(8),
      },
      client: {
        VITE_APP_URL: z.url(),
      },
    });

    const result = await loadEnv(config);

    expect(result.server).toMatchObject({
      DATABASE_URL: TEST_ENV.DATABASE_URL,
      SECRET_KEY: TEST_ENV.SECRET_KEY,
    });
    expect(result.client).toMatchObject({ VITE_APP_URL: TEST_ENV.VITE_APP_URL });
    expect(result.all).toBe(result.server);
  });
});
