"use client";

import { Loader2, CheckCircle, Brain } from "lucide-react";

interface ContextLoaderProps {
  status: "idle" | "loading" | "ready" | "error";
  semanticCount: number;
  instructionCount: number;
  episodicCount: number;
}

export function ContextLoader({ status, semanticCount, instructionCount, episodicCount }: ContextLoaderProps) {
  if (status === "idle") return null;

  if (status === "loading") {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-[rgba(0,212,170,0.06)] border border-[rgba(0,212,170,0.15)] rounded-xl mb-4">
        <Loader2 className="w-4 h-4 text-[#00D4AA] animate-spin flex-shrink-0" />
        <span className="text-sm text-[#8B9CC8] font-mono">
          Loading your memory from Arkiv Braga...
        </span>
      </div>
    );
  }

  if (status === "ready") {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-[rgba(0,212,170,0.06)] border border-[rgba(0,212,170,0.15)] rounded-xl mb-4 animate-fade-in">
        <CheckCircle className="w-4 h-4 text-[#00D4AA] flex-shrink-0" />
        <div className="flex items-center gap-3 text-xs font-mono text-[#8B9CC8]">
          <span>
            <span className="text-[#00D4AA] font-semibold">{semanticCount}</span> facts
          </span>
          <span className="text-[#4F5E7A]">·</span>
          <span>
            <span className="text-[#00D4AA] font-semibold">{instructionCount}</span> instructions
          </span>
          <span className="text-[#4F5E7A]">·</span>
          <span>
            <span className="text-[#00D4AA] font-semibold">{episodicCount}</span> recent sessions
          </span>
          <span className="text-[#4F5E7A] hidden sm:inline">· loaded from Arkiv Braga</span>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-4">
        <Brain className="w-4 h-4 text-red-400 flex-shrink-0" />
        <span className="text-sm text-red-300">
          Could not load memory from Arkiv. Using default context.
        </span>
      </div>
    );
  }

  return null;
}
