import jwt from "jsonwebtoken";
import crypto from "crypto";

interface JwkKey {
  kty: string;
  n: string;
  e: string;
  kid: string;
  use?: string;
  alg?: string;
}

interface CachedKeys {
  keys: JwkKey[];
  expiresAt: number;
}

const keyCache = new Map<string, CachedKeys>();

async function getSigningKey(kid: string, tenantId: string): Promise<string> {
  const uri = `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`;
  let cached = keyCache.get(uri);
  if (!cached || cached.expiresAt < Date.now()) {
    const res = await fetch(uri);
    if (!res.ok) throw new Error(`Failed to fetch JWKS: ${res.status}`);
    const data = await res.json();
    cached = { keys: data.keys, expiresAt: Date.now() + 3_600_000 };
    keyCache.set(uri, cached);
  }
  const jwk = cached.keys.find((k) => k.kid === kid);
  if (!jwk) throw new Error("No signing key found for kid: " + kid);
  const pubKey = crypto.createPublicKey({ format: "jwk", key: { kty: jwk.kty, n: jwk.n, e: jwk.e } }) as crypto.KeyObject;
  return pubKey.export({ format: "pem", type: "spki" }).toString();
}

export async function validateMicrosoftToken(
  idToken: string,
  tenantId: string,
  clientId: string,
): Promise<{ oid: string; email: string; name: string; preferred_username?: string }> {
  const decoded = jwt.decode(idToken, { complete: true }) as { header: { kid?: string } } | null;
  if (!decoded?.header?.kid) throw new Error("Invalid ID token: missing kid");
  const pem = await getSigningKey(decoded.header.kid, tenantId);
  const payload = jwt.verify(idToken, pem, {
    issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
    audience: clientId,
    algorithms: ["RS256"],
  }) as Record<string, unknown>;
  const oid = payload.oid as string;
  if (!oid) throw new Error("Missing oid claim");
  return {
    oid,
    email: (payload.email as string) || (payload.preferred_username as string) || "",
    name: (payload.name as string) || (payload.preferred_username as string) || "",
    preferred_username: payload.preferred_username as string | undefined,
  };
}
