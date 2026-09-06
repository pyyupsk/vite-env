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
    it("should emit process.env reads for all keys", () => {
      const def = {
        server: { DATABASE_URL: {} as any, JWT_SECRET: {} as any },
        client: { VITE_API_URL: {} as any },
      };
      const data = {
        DATABASE_URL: "postgresql://placeholder",
        JWT_SECRET: "build-time-secret",
        VITE_API_URL: "https://api.example.com",
      };

      const result = buildServerModule(def, data, "process-env");

      expect(result.code).toContain("DATABASE_URL: process.env.DATABASE_URL");
      expect(result.code).toContain("JWT_SECRET: process.env.JWT_SECRET");
      expect(result.code).toContain("VITE_API_URL: process.env.VITE_API_URL");
      expect(result.code).not.toContain("postgresql://placeholder");
      expect(result.code).not.toContain("build-time-secret");
      expect(result.code).not.toContain("https://api.example.com");
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

      const matches = result.code.match(/SHARED_KEY: process\.env\.SHARED_KEY/g);
      expect(matches).toHaveLength(1);
    });
  });
});
