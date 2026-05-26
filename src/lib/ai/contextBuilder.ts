import type { SemanticMemory, EpisodicMemory, Instruction, ContextDocument } from "@/lib/arkiv/schemas";

export interface ExoContext {
  instructions: Instruction[];
  semanticMemories: SemanticMemory[];
  recentEpisodes: EpisodicMemory[];
  documents: ContextDocument[];
  userAddress: string;
}

export function buildContextSummary(ctx: ExoContext): string {
  const lines: string[] = [];

  if (ctx.instructions.length > 0) {
    lines.push("═══ STANDING INSTRUCTIONS ═══");
    for (const inst of ctx.instructions) {
      lines.push(`[Priority ${inst.priority}][${inst.category.toUpperCase()}] ${inst.payload.instruction}`);
      if (inst.payload.rationale) {
        lines.push(`  Rationale: ${inst.payload.rationale}`);
      }
    }
    lines.push("");
  }

  if (ctx.semanticMemories.length > 0) {
    lines.push("═══ WHO THEY ARE ═══");
    for (const mem of ctx.semanticMemories) {
      const confirmed = mem.confirmed ? "✓" : "~";
      lines.push(`${confirmed} [${mem.topic}] ${mem.payload.content}`);
    }
    lines.push("");
  }

  if (ctx.recentEpisodes.length > 0) {
    lines.push("═══ RECENT CONTEXT ═══");
    for (const ep of ctx.recentEpisodes) {
      const date = new Date(ep.createdAt).toLocaleDateString();
      lines.push(`Session (${date}, via ${ep.agentId}): ${ep.payload.summary}`);
      if (ep.payload.openThreads.length > 0) {
        lines.push(`  Open: ${ep.payload.openThreads.join(", ")}`);
      }
    }
    lines.push("");
  }

  if (ctx.documents.length > 0) {
    lines.push("═══ ACTIVE DOCUMENTS ═══");
    for (const doc of ctx.documents) {
      lines.push(`[${doc.docType}] "${doc.payload.title}": ${doc.payload.summary}`);
    }
  }

  return lines.join("\n");
}

export function extractMemorySources(
  ctx: ExoContext,
  responseText: string
): { entityKey: string; type: string; topic?: string; preview: string }[] {
  const sources: { entityKey: string; type: string; topic?: string; preview: string }[] = [];

  // Check which semantic memories are likely referenced in the response
  for (const mem of ctx.semanticMemories) {
    const keywords = mem.payload.content.split(" ").filter((w) => w.length > 4).slice(0, 5);
    const isReferenced = keywords.some((kw) =>
      responseText.toLowerCase().includes(kw.toLowerCase())
    );
    if (isReferenced) {
      sources.push({
        entityKey: mem.entityKey,
        type: "semantic",
        topic: mem.topic,
        preview: mem.payload.content.slice(0, 80),
      });
    }
  }

  // Instructions are always active
  for (const inst of ctx.instructions) {
    sources.push({
      entityKey: inst.entityKey,
      type: "instruction",
      preview: inst.payload.instruction.slice(0, 80),
    });
  }

  // Check recent episodes
  for (const ep of ctx.recentEpisodes) {
    const words = ep.payload.summary.split(" ").filter((w) => w.length > 4).slice(0, 5);
    const isReferenced = words.some((w) =>
      responseText.toLowerCase().includes(w.toLowerCase())
    );
    if (isReferenced) {
      sources.push({
        entityKey: ep.entityKey,
        type: "episodic",
        preview: ep.payload.summary.slice(0, 80),
      });
    }
  }

  return sources;
}
