import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages, text } = await req.json();

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json({ facts: [] });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const convo = text
      ? (text as string)
      : (messages as { role: string; content: string }[])
          .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
          .join("\n\n");

    try {
      const result = await model.generateContent(
        `From this text, extract a JSON array of facts about the user. Each fact: content (1 sentence), topic (one of: profession/project/preference/goal/background/expertise/communication_style/constraint), importance (1-100), confidence (0-1), tags (string array). Only extract clear factual statements about the user. Text:\n\n${convo}\n\nRespond only with a JSON array, no markdown.`
      );
      const responseText = result.response.text().replace(/```json\n?|\n?```/g, "").trim();
      const facts = JSON.parse(responseText);
      return NextResponse.json({ facts: Array.isArray(facts) ? facts : [] });
    } catch {
      return NextResponse.json({ facts: [] });
    }
  } catch {
    return NextResponse.json({ facts: [] });
  }
}
