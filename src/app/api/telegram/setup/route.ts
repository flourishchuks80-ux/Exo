export async function POST(req: Request) {
  const { botToken, walletAddress } = await req.json();
  if (!botToken || !walletAddress) {
    return Response.json({ error: "botToken and walletAddress required" }, { status: 400 });
  }

  const raw = `${walletAddress}|${botToken}`;
  const secret = btoa(raw)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  if (secret.length > 256) {
    return Response.json({ error: "Encoded secret exceeds Telegram's 256-char limit" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://exo-xi.vercel.app";

  const whResp = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: `${appUrl}/api/telegram`,
      secret_token: secret,
      allowed_updates: ["message"],
    }),
  });
  const wh = await whResp.json() as { ok: boolean; description?: string };
  if (!wh.ok) {
    return Response.json({ error: wh.description ?? "Failed to set webhook" }, { status: 400 });
  }

  const meResp = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
  const me = await meResp.json() as { ok: boolean; result?: { username: string; first_name: string } };

  return Response.json({
    ok: true,
    username: me.result?.username ?? "",
    firstName: me.result?.first_name ?? "",
  });
}

export async function DELETE(req: Request) {
  const { botToken } = await req.json();
  if (!botToken) return Response.json({ error: "botToken required" }, { status: 400 });

  const resp = await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ drop_pending_updates: false }),
  });
  const result = await resp.json() as { ok: boolean; description?: string };
  if (!result.ok) {
    return Response.json({ error: result.description }, { status: 400 });
  }
  return Response.json({ ok: true });
}
