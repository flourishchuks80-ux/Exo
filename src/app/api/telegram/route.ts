export const runtime = "edge";

type ExtractedFact = {
  content: string;
  topic: string;
  importance: number;
  confidence: number;
  tags: string[];
};

function decodeSecret(secret: string): { walletAddress: string; botToken: string } | null {
  try {
    const b64 = secret
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(secret.length + (4 - (secret.length % 4)) % 4, "=");
    const decoded = atob(b64);
    const pipe = decoded.indexOf("|");
    if (pipe === -1) return null;
    return { walletAddress: decoded.slice(0, pipe), botToken: decoded.slice(pipe + 1) };
  } catch {
    return null;
  }
}

async function tg(token: string, method: string, body: object): Promise<void> {
  await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function getAiReply(userMessage: string, baseUrl: string): Promise<string> {
  const resp = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: userMessage }],
      systemPrompt:
        "You are Exo, a sovereign AI memory assistant. Be concise and conversational — 2-3 sentences max. When users share facts about themselves, acknowledge them naturally. You cannot access the user's stored memories in this context.",
      model: "claude",
    }),
  });
  if (!resp.ok) throw new Error(`chat ${resp.status}`);
  return resp.text();
}

async function getExtractedFacts(userMessage: string, baseUrl: string): Promise<ExtractedFact[]> {
  const resp = await fetch(`${baseUrl}/api/extract-facts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: userMessage }] }),
  });
  if (!resp.ok) return [];
  const data = await resp.json() as { facts?: ExtractedFact[] };
  return Array.isArray(data.facts) ? data.facts : [];
}

export async function POST(req: Request) {
  const secret = req.headers.get("x-telegram-bot-api-secret-token") ?? "";
  const creds = decodeSecret(secret);
  if (!creds) return new Response("Unauthorized", { status: 401 });

  const { walletAddress, botToken } = creds;

  let update: { message?: { text?: string; chat?: { id: number } } };
  try {
    update = await req.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const msg = update.message;
  if (!msg?.text || !msg.chat) return new Response("OK");

  const chatId = msg.chat.id;
  const text = msg.text;

  if (text.startsWith("/start")) {
    await tg(botToken, "sendMessage", {
      chat_id: chatId,
      text: "👋 I'm your Exo memory assistant.\n\nChat with me — I'll identify things worth saving to your sovereign Arkiv memory and send you a button to approve each one on-chain.",
    });
    return new Response("OK");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://exo-xi.vercel.app";

  // Run AI response and fact extraction in parallel via existing working routes
  const [aiReply, facts] = await Promise.all([
    getAiReply(text, appUrl),
    getExtractedFacts(text, appUrl),
  ]);

  // Send AI reply (fall back to plain text if Markdown causes issues)
  await tg(botToken, "sendMessage", {
    chat_id: chatId,
    text: aiReply,
    parse_mode: "Markdown",
  }).catch(() => tg(botToken, "sendMessage", { chat_id: chatId, text: aiReply }));

  // Send save buttons for high-importance facts
  const highFacts = facts.filter((f) => f.importance >= 60);
  await Promise.all(
    highFacts.map((fact) => {
      const data = btoa(JSON.stringify({ ...fact, walletAddress }))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
      return tg(botToken, "sendMessage", {
        chat_id: chatId,
        text: `💡 *Memory worth saving:*\n_${fact.content}_`,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "Save to Arkiv →", web_app: { url: `${appUrl}/telegram/approve?data=${data}` } }],
          ],
        },
      });
    })
  );

  return new Response("OK");
}
