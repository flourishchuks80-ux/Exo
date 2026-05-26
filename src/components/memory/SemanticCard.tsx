"use client";

import { useState } from "react";
import { Edit3, Trash2, ChevronDown, ChevronUp, Check } from "lucide-react";
import { MemoryTypePill } from "@/components/ui/MemoryTypePill";
import { TopicBadge } from "@/components/ui/TopicBadge";
import { ArkivEntityBadge } from "@/components/ui/ArkivEntityBadge";
import { EncryptionIndicator } from "@/components/ui/EncryptionIndicator";
import { Button } from "@/components/ui/Button";
import { formatRelative } from "@/lib/utils/format";
import type { SemanticMemory } from "@/lib/arkiv/schemas";

interface SemanticCardProps {
  memory: SemanticMemory;
  onDelete?: (entityKey: string) => void;
  deleting?: boolean;
}

export function SemanticCard({ memory, onDelete, deleting }: SemanticCardProps) {
  const [expanded, setExpanded] = useState(false);

  const importanceColor =
    memory.importance >= 80
      ? "text-[#00D4AA]"
      : memory.importance >= 50
      ? "text-amber-400"
      : "text-[#4F5E7A]";

  const importanceLabel =
    memory.importance >= 80 ? "Critical" : memory.importance >= 50 ? "Important" : "Background";

  return (
    <div className="group bg-[#121A2E] border border-[rgba(0,212,170,0.08)] hover:border-[rgba(0,212,170,0.2)] rounded-xl p-4 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <MemoryTypePill type="semantic" />
            <TopicBadge topic={memory.topic} />
            {memory.confirmed && (
              <span className="inline-flex items-center gap-1 text-[10px] text-[#00D4AA] font-mono">
                <Check className="w-2.5 h-2.5" />
                confirmed
              </span>
            )}
          </div>

          <p className="text-sm text-[#F0F4FF] leading-relaxed">
            {memory.payload.content}
          </p>
        </div>

        {/* Importance badge */}
        <div className="flex-shrink-0 text-right">
          <div className={`text-lg font-bold font-mono ${importanceColor}`}>
            {memory.importance}
          </div>
          <div className="text-[10px] text-[#4F5E7A]">{importanceLabel}</div>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-4 mt-3 text-xs text-[#4F5E7A]">
        <span>{formatRelative(memory.updatedAt)}</span>
        <span>via {memory.agentId}</span>
        <span>{memory.payload.source.replace(/_/g, " ")}</span>
        <EncryptionIndicator className="ml-auto" />
      </div>

      {/* Tags */}
      {memory.payload.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {memory.payload.tags.map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] bg-[#192235] text-[#8B9CC8] font-mono">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Expand / actions */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[rgba(255,255,255,0.04)]">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-[#4F5E7A] hover:text-[#8B9CC8] transition-colors"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? "Hide" : "Show"} on-chain details
        </button>

        <div className="flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
          {onDelete && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => onDelete(memory.entityKey)}
              loading={deleting}
              className="h-6 text-[10px] px-2"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-3 animate-slide-in-up">
          <ArkivEntityBadge entityKey={memory.entityKey} />
        </div>
      )}
    </div>
  );
}
