import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { z } from "zod";
import { defineEnv } from "./schema";
import { defineStandardEnv } from "./standard";

vi.mock("vite", () => ({
  loadEnv: vi.fn(() => ({ VITE_APP_URL: "http://localhost:3000" })),
}));

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

describe("loadEnv (Zod)", () => {
  beforeEach(() => {
    process.env["DATABASE_URL"] = "http://db.example.com";
    process.env["SECRET_KEY"] = "supersecretkey";
    process.env["VITE_APP_URL"] = "http://localhost:3000";
  });

  afterEach(() => {
    delete process.env["DATABASE_URL"];
    delete process.env["SECRET_KEY"];
    delete process.env["VITE_APP_URL"];
  });

  it("returns server, client, all namespaces", async () => {
    const { loadEnv } = await import("./load");
    const result = await loadEnv(makeConfig());

    expect(result.server).toMatchObject({
      DATABASE_URL: "http://db.example.com",
      SECRET_KEY: "supersecretkey",
      VITE_APP_URL: "http://localhost:3000",
    });
    expect(result.client).toMatchObject({
      VITE_APP_URL: "http://localhost:3000",
    });
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
});

describe("loadEnv (Standard Schema)", () => {
  beforeEach(() => {
    process.env["DATABASE_URL"] = "http://db.example.com";
    process.env["SECRET_KEY"] = "supersecretkey";
    process.env["VITE_APP_URL"] = "http://localhost:3000";
  });

  afterEach(() => {
    delete process.env["DATABASE_URL"];
    delete process.env["SECRET_KEY"];
    delete process.env["VITE_APP_URL"];
  });

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
      DATABASE_URL: "http://db.example.com",
      SECRET_KEY: "supersecretkey",
    });
    expect(result.client).toMatchObject({
      VITE_APP_URL: "http://localhost:3000",
    });
  });
});
