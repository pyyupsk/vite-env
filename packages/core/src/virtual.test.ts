import { describe, expect, it } from "vitest";
import { buildClientModule, buildServerModule } from "./virtual";

describe("buildClientModule", () => {
  it("should include only client keys", () => {
    const def = {
      server: { SECRET: {} as any },
      client: { VITE_API: {} as any, VITE_NODE_ENV: {} as any },
    };
    const data = {
      SECRET: "hidden",
      VITE_API: "https://api.example.com",
      VITE_NODE_ENV: "production",
    };

    const result = buildClientModule(def, data);

    expect(result.moduleType).toBe("js");
    expect(result.code).toContain("VITE_API");
    expect(result.code).toContain("VITE_NODE_ENV");
    expect(result.code).not.toContain("SECRET");
    expect(result.code).not.toContain("hidden");
  });

  it("should return frozen object export", () => {
    const result = buildClientModule({ client: { VITE_X: {} as any } }, { VITE_X: "val" });

    expect(result.code).toContain("Object.freeze");
    expect(result.code).toContain("export const env");
    expect(result.code).toContain("export default env");
  });

  it("should handle empty definition", () => {
    const result = buildClientModule({}, { FOO: "bar" });

    expect(result.code).toContain("Object.freeze({})");
  });
});

describe("buildServerModule", () => {
  it("should include all data", () => {
    const def = {
      server: { SECRET: {} as any },
      client: { VITE_API: {} as any },
    };
    const data = {
      SECRET: "hidden",
      VITE_API: "https://api.example.com",
    };

    const result = buildServerModule(def, data);

    expect(result.moduleType).toBe("js");
    expect(result.code).toContain("SECRET");
    expect(result.code).toContain("VITE_API");
  });

  it("should return frozen object export", () => {
    const result = buildServerModule({}, { KEY: "val" });

    expect(result.code).toContain("Object.freeze");
    expect(result.code).toContain("export const env");
    expect(result.code).toContain("export default env");
  });

  describe("serverRuntime: build-time (default)", () => {
    it("should inline values as frozen object", () => {
      const def = {
        server: { SECRET: {} as any },
        client: { VITE_API: {} as any },
      };
      const data = {
        SECRET: "build-time-secret",
        VITE_API: "https://api.example.com",
      };

      const result = buildServerModule(def, data, "build-time");

      expect(result.code).toContain("build-time-secret");
      expect(result.code).toContain("https://api.example.com");
      expect(result.code).not.toContain("process.env");
    });

    it("should use default when serverRuntime not provided", () => {
      const def = { server: { KEY: {} as any } };
      const data = { KEY: "inline-value" };

      const result = buildServerModule(def, data);

      expect(result.code).toContain("inline-value");
      expect(result.code).not.toContain("process.env");
    });
  });

  describe("serverRuntime: process-env", () => {
    it("should emit process.env references instead of inlined values", () => {
      const def = {
        server: { DATABASE_URL: {} as any, JWT_SECRET: {} as any },
        client: { VITE_API_URL: {} as any },
      };
      const data = {
        DATABASE_URL: "postgresql://validated",
        JWT_SECRET: "validated-secret",
        VITE_API_URL: "https://api.validated.com",
      };

      const result = buildServerModule(def, data, "process-env");

      expect(result.code).toContain('"DATABASE_URL": process.env["DATABASE_URL"]');
      expect(result.code).toContain('"JWT_SECRET": process.env["JWT_SECRET"]');
      expect(result.code).toContain('"VITE_API_URL": process.env["VITE_API_URL"]');
    });

    it("should never contain actual secret values, only the keys", () => {
      const def = {
        server: { DATABASE_URL: {} as any, JWT_SECRET: {} as any },
      };
      const data = {
        DATABASE_URL: "postgresql://super-secret-host",
        JWT_SECRET: "extremely-sensitive-value",
      };

      const result = buildServerModule(def, data, "process-env");

      expect(result.code).not.toContain("postgresql://super-secret-host");
      expect(result.code).not.toContain("extremely-sensitive-value");
    });

    it("should use bracket notation for non-identifier keys", () => {
      const def = {
        server: { "LOG-LEVEL": {} as any, API_KEY: {} as any },
        client: { "VITE_APP-NAME": {} as any },
      };
      const data = {
        "LOG-LEVEL": "debug",
        API_KEY: "secret",
        "VITE_APP-NAME": "my-app",
      };

      const result = buildServerModule(def, data, "process-env");

      expect(result.code).toContain('"LOG-LEVEL": process.env["LOG-LEVEL"]');
      expect(result.code).toContain('"API_KEY": process.env["API_KEY"]');
      expect(result.code).toContain('"VITE_APP-NAME": process.env["VITE_APP-NAME"]');
      expect(result.code).not.toContain("debug");
      expect(result.code).not.toContain('"secret"');
      expect(result.code).not.toContain("my-app");
    });

    it("should handle empty definition", () => {
      const result = buildServerModule({}, {}, "process-env");

      expect(result.code).toContain("Object.freeze({");
      expect(result.code).toContain("export default env");
    });

    it("should deduplicate overlapping server and client keys", () => {
      const def = {
        server: { SHARED_KEY: {} as any },
        client: { SHARED_KEY: {} as any },
      };

      const result = buildServerModule(def, { SHARED_KEY: "value" }, "process-env");

      const matches = result.code.match(/"SHARED_KEY": process\.env\["SHARED_KEY"\]/g);
      expect(matches).toHaveLength(1);
    });

    it("should only reference keys present in the definition, not stray data keys", () => {
      const def = {
        server: { KNOWN_KEY: {} as any },
      };
      const data = {
        KNOWN_KEY: "value",
        UNRELATED_KEY: "other",
      };

      const result = buildServerModule(def, data, "process-env");

      expect(result.code).toContain('"KNOWN_KEY": process.env["KNOWN_KEY"]');
      expect(result.code).not.toContain("UNRELATED_KEY");
    });
  });
});
