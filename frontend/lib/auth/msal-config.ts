import { PublicClientApplication, type Configuration } from "@azure/msal-browser";

const TENANT_ID = process.env.NEXT_PUBLIC_MS_GRAPH_TENANT_ID || "23cf3d56-3e1a-4888-8830-e6ed670099ec";
const CLIENT_ID = process.env.NEXT_PUBLIC_MS_GRAPH_CLIENT_ID || "a4974c1b-0c48-40b0-974c-de4e8ebcd85c";

const msalConfig: Configuration = {
  auth: {
    clientId: CLIENT_ID,
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
    redirectUri: typeof window !== "undefined" ? window.location.origin : undefined,
  },
  cache: { cacheLocation: "localStorage" },
};

let msalInstance: PublicClientApplication | null = null;

export function getMsalInstance(): PublicClientApplication {
  if (!msalInstance) {
    msalInstance = new PublicClientApplication(msalConfig);
  }
  return msalInstance;
}
