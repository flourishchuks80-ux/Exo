import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { type, messages, memoryData } = await req.json();

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  if (type === "session") {
    const convo = (messages as { role: string; content: string }[])
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `Analyze this conversation and extract a JSON object with: summary (1 sentence), keyDecisions (array of strings), openThreads (array of strings), topic (one of: profession/project/preference/goal/background/expertise/communication_style/constraint). Conversation:\n\n${convo}\n\nRespond only with the JSON object.`,
        },
      ],
    });

    try {
      const text = response.content[0].type === "text" ? response.content[0].text : "{}";
      const data = JSON.parse(text.replace(/```json\n?|\n?```/g, ""));
      return NextResponse.json(data);
    } catch {
      return NextResponse.json({
        summary: "Session completed.",
        keyDecisions: [],
        openThreads: [],
        topic: "project",
      });
    }
  }

  if (type === "snapshot") {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Based on this memory data, generate a JSON object with: aiSummary (2-3 sentence narrative about who this user is), topTopics (array of top 5 topics), recentThemes (array of 3 themes from recent activity), memoryHealthScore (0-100 number). Memory data:\n${JSON.stringify(memoryData)}\n\nRespond only with the JSON object.`,
        },
      ],
    });

    try {
      const text = response.content[0].type === "text" ? response.content[0].text : "{}";
      const data = JSON.parse(text.replace(/```json\n?|\n?```/g, ""));
      return NextResponse.json(data);
    } catch {
      return NextResponse.json({
        aiSummary: "Memory snapshot created.",
        topTopics: [],
        recentThemes: [],
        memoryHealthScore: 50,
      });
    }
  }

  if (type === "extract-facts") {
    const convo = (messages as { role: string; content: string }[])
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `From this conversation, extract a JSON array of facts about the user. Each fact should have: content (1 sentence fact), topic (one of: profession/project/preference/goal/background/expertise/communication_style/constraint), importance (1-100), confidence (0-1), tags (array of strings). Only extract clear factual statements about the user. Conversation:\n\n${convo}\n\nRespond only with a JSON array.`,
        },
      ],
    });

    try {
      const text = response.content[0].type === "text" ? response.content[0].text : "[]";
      const facts = JSON.parse(text.replace(/```json\n?|\n?```/g, ""));
      return NextResponse.json({ facts });
    } catch {
      return NextResponse.json({ facts: [] });
    }
  }

  return NextResponse.json({ error: "Unknown type" }, { status: 400 });
}
