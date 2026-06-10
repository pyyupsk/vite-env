import { defineStandardEnv } from "@vite-env/core";
import * as v from "valibot";

export default defineStandardEnv({
  server: {
    DATABASE_URL: v.pipe(v.string(), v.url()),
    JWT_SECRET: v.pipe(v.string(), v.minLength(32)),
  },
  client: {
    VITE_API_URL: v.pipe(v.string(), v.url()),
    VITE_APP_NAME: v.pipe(v.string(), v.minLength(1)),
  },
});
