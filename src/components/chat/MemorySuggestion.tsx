"use client";

import { X, Brain, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface MemorySuggestionProps {
  suggestion: string;
  onSave: () => void;
  onDismiss: () => void;
  saving?: boolean;
}

export function MemorySuggestion({ suggestion, onSave, onDismiss, saving }: MemorySuggestionProps) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 bg-[rgba(0,212,170,0.06)] border border-[rgba(0,212,170,0.15)] rounded-xl mt-3 animate-slide-in-up">
      <Brain className="w-4 h-4 text-[#00D4AA] flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[#00D4AA] mb-0.5">Memory suggestion</p>
        <p className="text-xs text-[#8B9CC8] leading-relaxed">{suggestion}</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button size="sm" variant="outline" onClick={onSave} loading={saving} className="h-7 text-xs px-2 gap-1">
          <Check className="w-3 h-3" />
          Save
        </Button>
        <button onClick={onDismiss} className="w-7 h-7 flex items-center justify-center text-[#4F5E7A] hover:text-[#8B9CC8] transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
