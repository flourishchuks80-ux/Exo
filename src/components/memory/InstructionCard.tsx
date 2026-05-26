"use client";

import { useState } from "react";
import { Trash2, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { MemoryTypePill } from "@/components/ui/MemoryTypePill";
import { ArkivEntityBadge } from "@/components/ui/ArkivEntityBadge";
import { EncryptionIndicator } from "@/components/ui/EncryptionIndicator";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import type { Instruction } from "@/lib/arkiv/schemas";

const CATEGORY_COLORS: Record<string, string> = {
  tone: "bg-pink-500/10 text-pink-300 border-pink-500/20",
  format: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  behavior: "bg-[rgba(0,212,170,0.08)] text-[#00D4AA] border-[rgba(0,212,170,0.2)]",
  constraint: "bg-red-500/10 text-red-300 border-red-500/20",
  trigger: "bg-amber-500/10 text-amber-300 border-amber-500/20",
};

interface InstructionCardProps {
  instruction: Instruction;
  onDelete?: (entityKey: string) => void;
  deleting?: boolean;
}

export function InstructionCard({ instruction, onDelete, deleting }: InstructionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const categoryColor = CATEGORY_COLORS[instruction.category] ?? "bg-slate-500/10 text-slate-300 border-slate-500/20";

  return (
    <div className="group bg-[#121A2E] border border-[rgba(0,212,170,0.08)] hover:border-[rgba(0,212,170,0.2)] rounded-xl p-4 transition-all duration-200">
      <div className="flex items-start gap-3">
        {/* Priority badge */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[rgba(0,212,170,0.08)] border border-[rgba(0,212,170,0.2)] flex items-center justify-center">
          <span className="text-[#00D4AA] font-bold font-mono text-sm">{instruction.priority}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <MemoryTypePill type="instruction" />
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-mono font-medium",
                categoryColor
              )}
            >
              {instruction.category}
            </span>
            <span className="text-[10px] font-mono text-[#4F5E7A]">
              {instruction.scope} · {instruction.agentId}
            </span>
          </div>

          <p className="text-sm text-[#F0F4FF] leading-relaxed">
            {instruction.payload.instruction}
          </p>

          {instruction.payload.rationale && (
            <p className="text-xs text-[#8B9CC8] mt-1.5 italic">
              Why: {instruction.payload.rationale}
            </p>
          )}
        </div>

        {!instruction.isActive && (
          <span className="flex-shrink-0 text-[10px] font-mono text-[#4F5E7A] bg-[#192235] px-2 py-0.5 rounded">
            paused
          </span>
        )}
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
        {onDelete && (
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete(instruction.entityKey)}
            loading={deleting}
            className="h-6 text-[10px] px-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </div>

      {expanded && (
        <div className="mt-3 animate-slide-in-up">
          <ArkivEntityBadge entityKey={instruction.entityKey} />
        </div>
      )}
    </div>
  );
}
