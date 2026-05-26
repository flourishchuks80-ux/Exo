import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

function makeModel() {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY not set");
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
}

export async function POST(req: NextRequest) {
  try {
    const { type, messages, memoryData } = await req.json();

    if (type === "session") {
      try {
        const model = makeModel();
        const convo = (messages as { role: string; content: string }[])
          .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
          .join("\n\n");

        const result = await model.generateContent(
          `Analyze this conversation and extract a JSON object with: summary (1 sentence), keyDecisions (array of strings), openThreads (array of strings), topic (one of: profession/project/preference/goal/background/expertise/communication_style/constraint). Conversation:\n\n${convo}\n\nRespond only with the JSON object, no markdown.`
        );
        const text = result.response.text().replace(/```json\n?|\n?```/g, "").trim();
        const data = JSON.parse(text);
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
      try {
        const model = makeModel();
        const result = await model.generateContent(
          `Based on this memory data, generate a JSON object with: aiSummary (2-3 sentence narrative about who this user is), topTopics (array of top 5 topics), recentThemes (array of 3 themes from recent activity), memoryHealthScore (0-100 number). Memory data:\n${JSON.stringify(memoryData)}\n\nRespond only with the JSON object, no markdown.`
        );
        const text = result.response.text().replace(/```json\n?|\n?```/g, "").trim();
        const data = JSON.parse(text);
        return NextResponse.json(data);
      } catch {
        return NextResponse.json({
          aiSummary: "Memory snapshot created.",
          topTopics: memoryData?.topics ?? [],
          recentThemes: [],
          memoryHealthScore: 50,
        });
      }
    }

    if (type === "extract-facts") {
      try {
        const model = makeModel();
        const convo = (messages as { role: string; content: string }[])
          .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
          .join("\n\n");

        const result = await model.generateContent(
          `From this conversation, extract a JSON array of facts about the user. Each fact: content (1 sentence), topic (one of: profession/project/preference/goal/background/expertise/communication_style/constraint), importance (1-100), confidence (0-1), tags (string array). Only clear factual statements. Conversation:\n\n${convo}\n\nRespond only with a JSON array, no markdown.`
        );
        const text = result.response.text().replace(/```json\n?|\n?```/g, "").trim();
        const facts = JSON.parse(text);
        return NextResponse.json({ facts: Array.isArray(facts) ? facts : [] });
      } catch {
        return NextResponse.json({ facts: [] });
      }
    }

    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
