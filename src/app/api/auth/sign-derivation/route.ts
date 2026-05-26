export const runtime = "edge";

const PRIVY_API = "https://api.privy.io/v1";
const SIGN_MESSAGE = (address: string) =>
  `Exo sovereign memory key derivation v1 — ${address}`;

function b64urlToBytes(s: string): Uint8Array {
  const b64 = s
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(s.length + (4 - (s.length % 4)) % 4, "=");
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

async function verifyPrivyToken(token: string, appId: string): Promise<string | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  let header: { alg?: string; kid?: string };
  let payload: { sub?: string; aud?: string | string[]; exp?: number; iss?: string };
  try {
    header = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[0])));
    payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[1])));
  } catch {
    return null;
  }

  if (!payload.exp || payload.exp * 1000 < Date.now()) return null;
  if (payload.iss !== "privy.io") return null;

  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!aud.includes(appId)) return null;

  const jwksResp = await fetch("https://auth.privy.io/.well-known/jwks.json").catch(() => null);
  if (!jwksResp?.ok) return null;

  const { keys } = (await jwksResp.json()) as { keys: (JsonWebKey & { kid?: string })[] };
  const jwk = header.kid ? keys.find((k) => k.kid === header.kid) : keys[0];
  if (!jwk) return null;

  const alg = header.alg ?? "ES256";
  let cryptoKey: CryptoKey;
  try {
    if (alg.startsWith("ES")) {
      cryptoKey = await crypto.subtle.importKey(
        "jwk", jwk,
        { name: "ECDSA", namedCurve: "P-256" },
        false, ["verify"]
      );
    } else {
      cryptoKey = await crypto.subtle.importKey(
        "jwk", jwk,
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false, ["verify"]
      );
    }
  } catch {
    return null;
  }

  const signingInput = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
  // Copy into a fresh ArrayBuffer to satisfy crypto.subtle.verify's strict BufferSource type
  const sig = new Uint8Array(b64urlToBytes(parts[2]));
  const algParams = alg.startsWith("ES")
    ? { name: "ECDSA", hash: "SHA-256" }
    : { name: "RSASSA-PKCS1-v1_5" };

  try {
    const valid = await crypto.subtle.verify(algParams, cryptoKey, sig, signingInput);
    if (!valid) return null;
  } catch {
    return null;
  }

  return payload.sub ?? null;
}

function privyHeaders(appId: string, appSecret: string): Record<string, string> {
  return {
    Authorization: `Basic ${btoa(`${appId}:${appSecret}`)}`,
    "privy-app-id": appId,
    "Content-Type": "application/json",
  };
}

export async function POST(req: Request) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const appSecret = process.env.PRIVY_APP_SECRET;
  if (!appId || !appSecret) {
    return new Response("Server signing not configured", { status: 503 });
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return new Response("Unauthorized", { status: 401 });

  const privyUserId = await verifyPrivyToken(token, appId);
  if (!privyUserId) return new Response("Invalid token", { status: 401 });

  let body: { walletAddress?: string };
  try {
    body = (await req.json()) as { walletAddress?: string };
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const { walletAddress } = body;
  if (!walletAddress || !/^0x[0-9a-fA-F]{40}$/i.test(walletAddress)) {
    return new Response("Invalid wallet address", { status: 400 });
  }

  const headers = privyHeaders(appId, appSecret);

  // Resolve Privy's internal wallet ID from the Ethereum address
  const walletResp = await fetch(`${PRIVY_API}/wallets/address`, {
    method: "POST",
    headers,
    body: JSON.stringify({ address: walletAddress }),
  });
  if (!walletResp.ok) {
    const err = await walletResp.text().catch(() => "wallet lookup failed");
    return new Response(`Wallet lookup failed: ${err}`, { status: 502 });
  }

  const wallet = (await walletResp.json()) as { id: string; owner_id: string };

  // Verify the wallet belongs to the authenticated Privy user
  if (wallet.owner_id !== privyUserId) {
    return new Response("Forbidden", { status: 403 });
  }

  // Sign the key derivation message server-side
  const signResp = await fetch(`${PRIVY_API}/wallets/${wallet.id}/rpc`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      method: "personal_sign",
      params: { message: SIGN_MESSAGE(walletAddress), encoding: "utf-8" },
    }),
  });
  if (!signResp.ok) {
    const err = await signResp.text().catch(() => "signing failed");
    return new Response(`Signing failed: ${err}`, { status: 502 });
  }

  const signData = (await signResp.json()) as { data?: { signature?: string } };
  const signature = signData.data?.signature;
  if (!signature) {
    return new Response("No signature returned from Privy", { status: 502 });
  }

  return Response.json({ signature });
}
