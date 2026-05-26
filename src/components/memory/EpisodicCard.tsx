"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Circle } from "lucide-react";
import { MemoryTypePill } from "@/components/ui/MemoryTypePill";
import { TopicBadge } from "@/components/ui/TopicBadge";
import { ArkivEntityBadge } from "@/components/ui/ArkivEntityBadge";
import { EncryptionIndicator } from "@/components/ui/EncryptionIndicator";
import { formatDate } from "@/lib/utils/format";
import type { EpisodicMemory } from "@/lib/arkiv/schemas";

const AGENT_COLORS: Record<string, string> = {
  claude: "text-[#00D4AA]",
  gpt: "text-emerald-400",
  gemini: "text-blue-400",
};

export function EpisodicCard({ episode }: { episode: EpisodicMemory }) {
  const [expanded, setExpanded] = useState(false);
  const agentColor = AGENT_COLORS[episode.agentId] ?? "text-[#8B9CC8]";

  return (
    <div className="bg-[#121A2E] border border-[rgba(0,212,170,0.08)] hover:border-[rgba(0,212,170,0.15)] rounded-xl p-4 transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <Circle className="w-2 h-2 fill-[#00D4AA] text-[#00D4AA]" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <MemoryTypePill type="episodic" />
            <TopicBadge topic={episode.topic} />
            <span className={`text-[10px] font-mono ${agentColor}`}>via {episode.agentId}</span>
            <span className="text-[10px] text-[#4F5E7A] ml-auto">{formatDate(episode.createdAt)}</span>
          </div>

          <p className="text-sm text-[#F0F4FF] leading-relaxed">{episode.payload.summary}</p>

          {episode.payload.keyDecisions.length > 0 && (
            <div className="mt-2">
              <p className="text-[10px] text-[#4F5E7A] mb-1 font-mono">KEY DECISIONS</p>
              <ul className="space-y-0.5">
                {episode.payload.keyDecisions.map((d, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-[#8B9CC8]">
                    <span className="text-[#00D4AA] flex-shrink-0">→</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {episode.payload.openThreads.length > 0 && (
            <div className="mt-2">
              <p className="text-[10px] text-amber-400 mb-1 font-mono">OPEN THREADS</p>
              <ul className="space-y-0.5">
                {episode.payload.openThreads.map((t, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-amber-300/70">
                    <span className="flex-shrink-0">○</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[rgba(255,255,255,0.04)]">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-[#4F5E7A] hover:text-[#8B9CC8] transition-colors"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          on-chain details
        </button>
        <EncryptionIndicator className="ml-auto" />
      </div>

      {expanded && (
        <div className="mt-3 animate-slide-in-up">
          <ArkivEntityBadge entityKey={episode.entityKey} />
        </div>
      )}
    </div>
  );
}
