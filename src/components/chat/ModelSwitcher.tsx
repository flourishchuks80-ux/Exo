"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

export type ModelId = "claude" | "gpt" | "gemini";

const MODELS: { id: ModelId; label: string; description: string }[] = [
  { id: "claude", label: "Claude", description: "claude-sonnet-4-6" },
  { id: "gpt", label: "GPT-4o", description: "gpt-4o" },
  { id: "gemini", label: "Gemini", description: "gemini-pro" },
];

interface ModelSwitcherProps {
  value: ModelId;
  onChange: (model: ModelId) => void;
}

export function ModelSwitcher({ value, onChange }: ModelSwitcherProps) {
  const [open, setOpen] = useState(false);
  const current = MODELS.find((m) => m.id === value) ?? MODELS[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#192235] border border-[rgba(0,212,170,0.15)] hover:border-[rgba(0,212,170,0.3)] transition-colors text-sm"
      >
        <span className="text-[#F0F4FF] font-medium">{current.label}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-[#4F5E7A] transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-[#192235] border border-[rgba(0,212,170,0.15)] rounded-xl shadow-xl overflow-hidden z-50 animate-slide-in-up">
          <div className="px-3 py-2 border-b border-[rgba(0,212,170,0.08)]">
            <p className="text-[10px] font-mono text-[#4F5E7A] uppercase tracking-wider">Same memory. Any model.</p>
          </div>
          {MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => { onChange(model.id); setOpen(false); }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#121A2E] transition-colors text-left",
                model.id === value && "bg-[rgba(0,212,170,0.08)]"
              )}
            >
              <div>
                <p className={cn("text-sm font-medium", model.id === value ? "text-[#00D4AA]" : "text-[#F0F4FF]")}>
                  {model.label}
                </p>
                <p className="text-[10px] text-[#4F5E7A] font-mono">{model.description}</p>
              </div>
              {model.id === value && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00D4AA]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
