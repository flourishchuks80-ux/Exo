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
        `Extract a JSON array of genuine facts about the USER from this text.

ONLY extract:
- Factual statements the user made about THEMSELVES (who they are, what they do, goals, skills, background, preferences)
- Facts must be stated by the user, not inferred from questions they asked

DO NOT extract:
- Questions or requests the user made (e.g. "user asked for a summary" is NOT a fact)
- Commands or instructions the user gave the AI
- Things the AI said
- Meta-statements about the conversation

Return [] if no genuine user self-descriptions are found.

Each fact: { content (1 concise sentence), topic (one of: profession/project/preference/goal/background/expertise/communication_style/constraint), importance (1-100), confidence (0.0-1.0), tags (string[]) }
Only include facts with confidence >= 0.65.

Text:
${convo}

Respond only with a JSON array, no markdown.`
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
