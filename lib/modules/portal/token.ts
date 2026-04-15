import crypto from "crypto";

const SECRET =
  process.env.PORTAL_SECRET ??
  process.env.SESSION_SECRET ??
  "tigerfix-portal-dev-secret";

export function signFolio(folio: string): string {
  const h = crypto.createHmac("sha256", SECRET).update(folio).digest("base64url");
  return h.slice(0, 16);
}

export function verifyFolio(folio: string, token: string): boolean {
  const expected = signFolio(folio);
  if (expected.length !== token.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(token)
  );
}

export function portalUrl(folio: string, base = ""): string {
  return `${base}/p/${encodeURIComponent(folio)}/${signFolio(folio)}`;
}
