import Anthropic from "@anthropic-ai/sdk";

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

async function callClaude(client: Anthropic, userMessage: string): Promise<string> {
  const resp = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: `You are Exo, a sovereign AI memory assistant. You help users capture and organise their knowledge on the Arkiv blockchain. Be concise and conversational — 2-3 sentences max. When users share facts about themselves, acknowledge them naturally. You cannot access the user's stored memories in this context.`,
    messages: [{ role: "user", content: userMessage }],
  });
  return resp.content[0].type === "text" ? resp.content[0].text : "";
}

async function extractFacts(client: Anthropic, messages: { role: string; content: string }[]): Promise<ExtractedFact[]> {
  const convo = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
  const resp = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `From this conversation, extract a JSON array of facts about the user. Each fact: content (1 sentence), topic (profession/project/preference/goal/background/expertise/communication_style/constraint), importance (1-100), confidence (0-1), tags (array). Only clear factual statements. Conversation:\n\n${convo}\n\nRespond only with a JSON array, no markdown.`,
      },
    ],
  });
  const text = resp.content[0].type === "text" ? resp.content[0].text : "[]";
  try {
    const facts = JSON.parse(text.replace(/```json\n?|\n?```/g, "").trim());
    return Array.isArray(facts) ? facts : [];
  } catch {
    return [];
  }
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

  // Create client inside the handler so process.env is definitely resolved
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    await tg(botToken, "sendMessage", {
      chat_id: chatId,
      text: "⚠️ AI unavailable right now. Please try again later.",
    });
    return new Response("OK");
  }
  const anthropic = new Anthropic({ apiKey });

  // Run AI response and fact extraction in parallel
  const [aiReply, facts] = await Promise.all([
    callClaude(anthropic, text),
    extractFacts(anthropic, [{ role: "user", content: text }]),
  ]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://exo-xi.vercel.app";

  // Send AI reply first (fall back to plain text if Markdown fails)
  await tg(botToken, "sendMessage", {
    chat_id: chatId,
    text: aiReply,
    parse_mode: "Markdown",
  }).catch(() =>
    tg(botToken, "sendMessage", { chat_id: chatId, text: aiReply })
  );

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
