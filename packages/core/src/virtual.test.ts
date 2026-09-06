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
    it("should inline validated values (same as build-time)", () => {
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

      expect(result.code).toContain("postgresql://validated");
      expect(result.code).toContain("validated-secret");
      expect(result.code).toContain("https://api.validated.com");
      expect(result.code).not.toContain("process.env");
    });

    it("should handle non-identifier keys with bracket notation", () => {
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

      expect(result.code).toContain('"LOG-LEVEL": "debug"');
      expect(result.code).toContain('"API_KEY": "secret"');
      expect(result.code).toContain('"VITE_APP-NAME": "my-app"');
      expect(result.code).not.toContain("process.env");
    });

    it("should use validated defaults/transformations from schema", () => {
      const def = {
        server: {
          PORT: { _def: { defaultValue: () => 3000 } } as any,
          NODE_ENV: { _def: { defaultValue: () => "production" } } as any,
        },
      };
      const data = {
        PORT: 3000,
        NODE_ENV: "production",
      };

      const result = buildServerModule(def, data, "process-env");

      expect(result.code).toContain("3000");
      expect(result.code).toContain("production");
      expect(result.code).not.toContain("process.env");
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

      const matches = result.code.match(/"SHARED_KEY": "value"/g);
      expect(matches).toHaveLength(1);
    });
  });
});
