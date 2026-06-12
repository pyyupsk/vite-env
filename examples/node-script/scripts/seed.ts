import { loadEnv } from "@vite-env/core/load";
import config from "../env";

const { server, client } = await loadEnv(config);

// server → all validated vars (server + client)
console.log("Connecting to DB:", server.DATABASE_URL);
console.log("App:", client.VITE_APP_NAME);

// simulate seed work
console.log("Seeding database...");
console.log("Done.");
