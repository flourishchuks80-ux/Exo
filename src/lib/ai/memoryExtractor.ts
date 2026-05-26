import type { Topic } from "@/lib/arkiv/constants";
import { TOPIC_TAXONOMY } from "@/lib/arkiv/constants";

export interface ExtractedFact {
  content: string;
  topic: Topic;
  importance: number;
  confidence: number;
  tags: string[];
}

export async function extractFactsFromConversation(
  messages: { role: string; content: string }[]
): Promise<ExtractedFact[]> {
  const response = await fetch("/api/extract-facts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) return [];

  const data = await response.json();
  return (data.facts ?? []) as ExtractedFact[];
}

export async function generateSessionSummary(
  messages: { role: string; content: string }[]
): Promise<{
  summary: string;
  keyDecisions: string[];
  openThreads: string[];
  topic: Topic;
}> {
  const response = await fetch("/api/snapshot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "session", messages }),
  });

  if (!response.ok) {
    return {
      summary: "Session summary unavailable.",
      keyDecisions: [],
      openThreads: [],
      topic: "project",
    };
  }

  const data = await response.json();
  return {
    summary: data.summary ?? "Session completed.",
    keyDecisions: data.keyDecisions ?? [],
    openThreads: data.openThreads ?? [],
    topic: (TOPIC_TAXONOMY.includes(data.topic) ? data.topic : "project") as Topic,
  };
}

export function guessTopic(content: string): Topic {
  const lower = content.toLowerCase();
  if (lower.includes("work") || lower.includes("job") || lower.includes("career")) return "profession";
  if (lower.includes("project") || lower.includes("build") || lower.includes("product")) return "project";
  if (lower.includes("prefer") || lower.includes("like") || lower.includes("love")) return "preference";
  if (lower.includes("goal") || lower.includes("target") || lower.includes("aim")) return "goal";
  if (lower.includes("background") || lower.includes("degree") || lower.includes("university")) return "background";
  if (lower.includes("expertise") || lower.includes("expert") || lower.includes("skill")) return "expertise";
  if (lower.includes("communicate") || lower.includes("style") || lower.includes("tone")) return "communication_style";
  if (lower.includes("constraint") || lower.includes("cannot") || lower.includes("limit")) return "constraint";
  if (lower.includes("relationship") || lower.includes("team") || lower.includes("partner")) return "relationship";
  if (lower.includes("learn") || lower.includes("study") || lower.includes("course")) return "learning";
  return "project";
}
