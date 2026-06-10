import { env } from "virtual:env/client";

document.getElementById("app")!.innerHTML = `
  <h1>${env.VITE_APP_NAME}</h1>
  <p>Netlify vars (CONTEXT, DEPLOY_URL, …) are server-only — validated at build, never bundled here.</p>
  <pre>${JSON.stringify(env, null, 2)}</pre>
`;
