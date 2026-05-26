import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { messages, text } = await req.json();
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const convo = text
    ? (text as string)
    : (messages as { role: string; content: string }[])
        .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
        .join("\n\n");

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `From this conversation, extract a JSON array of facts about the user. Each fact: content (1 sentence), topic (profession/project/preference/goal/background/expertise/communication_style/constraint), importance (1-100), confidence (0-1), tags (array). Only clear factual statements. Conversation:\n\n${convo}\n\nRespond only with a JSON array, no markdown.`,
        },
      ],
    });

    const responseText = response.content[0].type === "text" ? response.content[0].text : "[]";
    const facts = JSON.parse(responseText.replace(/```json\n?|\n?```/g, "").trim());
    return NextResponse.json({ facts: Array.isArray(facts) ? facts : [] });
  } catch {
    return NextResponse.json({ facts: [] });
  }
}
