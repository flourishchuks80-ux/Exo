import { cn } from "@/lib/utils/cn";
import type { EntityType } from "@/lib/arkiv/constants";

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  semantic: {
    label: "SEMANTIC",
    color: "text-purple-300",
    bg: "bg-purple-500/10 border-purple-500/20",
    dot: "bg-purple-400",
  },
  episodic: {
    label: "EPISODIC",
    color: "text-blue-300",
    bg: "bg-blue-500/10 border-blue-500/20",
    dot: "bg-blue-400",
  },
  instruction: {
    label: "INSTRUCTION",
    color: "text-[#00D4AA]",
    bg: "bg-[rgba(0,212,170,0.08)] border-[rgba(0,212,170,0.2)]",
    dot: "bg-[#00D4AA]",
  },
  document: {
    label: "DOCUMENT",
    color: "text-amber-300",
    bg: "bg-amber-500/10 border-amber-500/20",
    dot: "bg-amber-400",
  },
  grant: {
    label: "GRANT",
    color: "text-pink-300",
    bg: "bg-pink-500/10 border-pink-500/20",
    dot: "bg-pink-400",
  },
  snapshot: {
    label: "SNAPSHOT",
    color: "text-slate-300",
    bg: "bg-slate-500/10 border-slate-500/20",
    dot: "bg-slate-400",
  },
};

export function MemoryTypePill({
  type,
  className,
}: {
  type: string;
  className?: string;
}) {
  const config = TYPE_CONFIG[type] ?? {
    label: type.toUpperCase(),
    color: "text-slate-300",
    bg: "bg-slate-500/10 border-slate-500/20",
    dot: "bg-slate-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono font-semibold tracking-wider",
        config.color,
        config.bg,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}
