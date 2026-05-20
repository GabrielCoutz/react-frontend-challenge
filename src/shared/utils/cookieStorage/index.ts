const SECRET =
  import.meta.env.VITE_COOKIE_SIGNING_SECRET ?? "dev-secret-change-in-prod";
const COOKIE_NAME = "auth-token";
const MAX_AGE = 60 * 60 * 24 * 7;
const isSecure = location.protocol === "https:";

async function getCryptoKey(usage: "sign" | "verify"): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    [usage],
  );
}

function toBase64Url(buffer: ArrayBuffer): string {
  return btoa(
    Array.from(new Uint8Array(buffer), (b) => String.fromCharCode(b)).join(""),
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function fromBase64Url(b64url: string): Uint8Array<ArrayBuffer> {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), "=");
  const chars = atob(padded);
  const result = new Uint8Array(chars.length);
  for (let i = 0; i < chars.length; i++) {
    result[i] = chars.charCodeAt(i);
  }
  return result;
}

async function signValue(value: string): Promise<string> {
  const key = await getCryptoKey("sign");
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value),
  );
  return toBase64Url(sig);
}

async function verifySignature(
  value: string,
  signature: string,
): Promise<boolean> {
  try {
    const key = await getCryptoKey("verify");
    const sigBytes = fromBase64Url(signature);
    return await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      new TextEncoder().encode(value),
    );
  } catch {
    return false;
  }
}

export async function setSignedAuthToken(token: string): Promise<void> {
  const sig = await signValue(token);
  const secure = isSecure ? "; Secure" : "";
  // base64url uses only A-Za-z0-9-_ — safe for cookie values without encoding
  document.cookie = `${COOKIE_NAME}=${token}.${sig}; max-age=${MAX_AGE}; path=/; SameSite=Strict${secure}`;
}

export async function getSignedAuthToken(): Promise<string | null> {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`),
  );
  if (!match) return null;

  const raw = match[1];
  if (!raw || !raw.includes(".")) return null;

  const lastDot = raw.lastIndexOf(".");
  if (lastDot === -1) return null;

  const value = raw.slice(0, lastDot);
  const sig = raw.slice(lastDot + 1);

  return (await verifySignature(value, sig)) ? value : null;
}

export function removeAuthToken(): void {
  document.cookie = `${COOKIE_NAME}=; max-age=0; path=/; SameSite=Strict`;
}
