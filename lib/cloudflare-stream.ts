import jwt from "jsonwebtoken";

export type SignedVideoResult =
  | { ok: true; url: string; expiresAt: number }
  | { ok: false; reason: "credentials_missing" | "sign_error"; detail?: string };

/**
 * Generates a Cloudflare Stream signed iframe URL for the given video UID.
 * Does NOT perform auth/subscription checks — callers are responsible for that.
 */
export async function generateSignedVideoUrl(
  publicId: string
): Promise<SignedVideoResult> {
  const keyId = process.env.CLOUDFLARE_STREAM_KEY_ID;
  const privateKey = process.env.CLOUDFLARE_STREAM_PRIVATE_KEY;
  const customerSubdomain = process.env.CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN;

  if (!keyId || !privateKey || !customerSubdomain) {
    return { ok: false, reason: "credentials_missing" };
  }

  try {
    const signingKey = resolveSigningKey(privateKey);
    const expiresAt = Math.floor(Date.now() / 1000) + 7200;

    const token = jwt.sign(
      {
        sub: publicId,
        kid: keyId,
        exp: expiresAt,
        downloadable: false,
        accessRules: [{ type: "any", action: "allow" }],
      },
      signingKey,
      { algorithm: "RS256", keyid: keyId }
    );

    const url = `https://customer-${customerSubdomain}.cloudflarestream.com/${token}/iframe`;
    return { ok: true, url, expiresAt };
  } catch (e) {
    return { ok: false, reason: "sign_error", detail: String(e) };
  }
}

function resolveSigningKey(privateKey: string): jwt.Secret {
  let key = privateKey.trim();

  // Decode base64-encoded keys (Vercel workaround)
  if (!key.startsWith("{") && !key.includes("-----BEGIN")) {
    try {
      const decoded = Buffer.from(key, "base64").toString("utf-8");
      if (decoded.includes("-----BEGIN")) key = decoded.trim();
    } catch {
      // not base64 — proceed as-is
    }
  }

  // JWK format
  if (key.startsWith("{") && key.endsWith("}")) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createPrivateKey } = require("crypto");
    return createPrivateKey({ key: JSON.parse(key), format: "jwk" });
  }

  // PEM format — fix escaped newlines
  let pem = key.replace(/\\n/g, "\n");

  // Self-heal PEM corrupted by Vercel UI (spaces instead of newlines)
  const startMatch = pem.match(/-----BEGIN [A-Z ]*KEY-----/);
  const endMatch = pem.match(/-----END [A-Z ]*KEY-----/);
  if (startMatch && endMatch && !pem.includes("\n")) {
    const startStr = startMatch[0];
    const endStr = endMatch[0];
    const startIdx = pem.indexOf(startStr) + startStr.length;
    const endIdx = pem.indexOf(endStr);
    if (startIdx > -1 && endIdx > -1 && startIdx < endIdx) {
      const body = pem.substring(startIdx, endIdx).replace(/\s+/g, "");
      const formatted = body.match(/.{1,64}/g)?.join("\n") ?? body;
      pem = `${startStr}\n${formatted}\n${endStr}`;
    }
  }

  return pem;
}
