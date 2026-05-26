import { fetchSemanticMemories, fetchInstructions, fetchEpisodicMemories } from "@/lib/arkiv/queries";
import { parseEntityAttributes } from "@/lib/utils/format";
import type { Hex } from "@arkiv-network/sdk";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("wallet") as Hex | null;
  if (!wallet) return Response.json({ context: "" });

  const [semanticEntities, instructionEntities, episodicEntities] = await Promise.all([
    fetchSemanticMemories(wallet, 0, 50).catch(() => [] as Awaited<ReturnType<typeof fetchSemanticMemories>>),
    fetchInstructions(wallet, 20).catch(() => [] as Awaited<ReturnType<typeof fetchInstructions>>),
    fetchEpisodicMemories(wallet, 5).catch(() => [] as Awaited<ReturnType<typeof fetchEpisodicMemories>>),
  ]);

  // Build context from public attributes — payload content is encrypted
  const topicCounts: Record<string, number> = {};
  for (const e of semanticEntities) {
    const attrs = parseEntityAttributes(e);
    const topic = (attrs.topic as string) ?? "general";
    topicCounts[topic] = (topicCounts[topic] ?? 0) + 1;
  }

  if (semanticEntities.length === 0 && instructionEntities.length === 0) {
    return Response.json({ context: "" });
  }

  const topicLines = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([t, n]) => `  • ${t} (${n})`)
    .join("\n");

  const lines: string[] = [
    "═══ USER MEMORY PROFILE (Arkiv blockchain — topic metadata only) ═══",
  ];

  if (semanticEntities.length > 0) {
    lines.push(`Semantic memories (${semanticEntities.length} total across these topics):\n${topicLines}`);
  }
  if (instructionEntities.length > 0) {
    lines.push(`Standing instructions: ${instructionEntities.length} active`);
  }
  if (episodicEntities.length > 0) {
    lines.push(`Recent session summaries: ${episodicEntities.length}`);
  }
  lines.push(
    "Memory content is encrypted — acknowledge these topic areas as relevant to this user and ask follow-up questions about them naturally."
  );

  return Response.json({ context: lines.join("\n") });
}
