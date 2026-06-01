import { env } from "../config/env";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";
const SITE_HOST = "onlinefcu.sharepoint.com";

async function getToken(): Promise<string | null> {
  if (!env.MS_GRAPH_TENANT_ID || !env.MS_GRAPH_CLIENT_ID || !env.MS_GRAPH_CLIENT_SECRET) return null;
  const body = new URLSearchParams({
    client_id: env.MS_GRAPH_CLIENT_ID,
    client_secret: env.MS_GRAPH_CLIENT_SECRET,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  });
  const resp = await fetch(`https://login.microsoftonline.com/${env.MS_GRAPH_TENANT_ID}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!resp.ok) return null;
  const data = await resp.json() as { access_token: string };
  return data.access_token;
}

async function getSiteId(token: string, retries = 2): Promise<string> {
  for (let i = 0; i <= retries; i++) {
    const resp = await fetch(`${GRAPH_BASE}/sites/${SITE_HOST}:/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (resp.ok) {
      const data = await resp.json() as { id: string };
      return data.id;
    }
    if (i < retries) await new Promise(r => setTimeout(r, 500));
  }
  throw new Error("Failed to resolve SharePoint site ID");
}

const FOLDER_PATH = "ExerciseVideos";

export async function uploadToSharepoint(
  fileName: string,
  mimeType: string,
  fileBuffer: Buffer
): Promise<{ webUrl: string }> {
  const token = await getToken();
  if (!token) throw new Error("Microsoft Graph not configured");

  const siteId = await getSiteId(token);

  const uploadResp = await fetch(
    `${GRAPH_BASE}/sites/${siteId}/drive/root:/${FOLDER_PATH}/${fileName}:/content`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": mimeType,
      },
      body: new Uint8Array(fileBuffer),
    }
  );
  if (!uploadResp.ok) {
    const err = await uploadResp.text();
    throw new Error(`SharePoint upload failed (${uploadResp.status}): ${err}`);
  }
  const item = await uploadResp.json() as { webUrl?: string; id: string };
  return { webUrl: item.webUrl || `${GRAPH_BASE}/sites/${siteId}/drive/items/${item.id}` };
}
