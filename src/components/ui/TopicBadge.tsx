import { cn } from "@/lib/utils/cn";

const TOPIC_COLORS: Record<string, string> = {
  profession: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  expertise: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
  project: "bg-[rgba(0,212,170,0.08)] text-[#00D4AA] border-[rgba(0,212,170,0.2)]",
  preference: "bg-violet-500/10 text-violet-300 border-violet-500/20",
  communication_style: "bg-pink-500/10 text-pink-300 border-pink-500/20",
  goal: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  constraint: "bg-red-500/10 text-red-300 border-red-500/20",
  relationship: "bg-rose-500/10 text-rose-300 border-rose-500/20",
  location: "bg-sky-500/10 text-sky-300 border-sky-500/20",
  schedule: "bg-orange-500/10 text-orange-300 border-orange-500/20",
  health: "bg-green-500/10 text-green-300 border-green-500/20",
  finance: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
  learning: "bg-teal-500/10 text-teal-300 border-teal-500/20",
  values: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  background: "bg-slate-500/10 text-slate-300 border-slate-500/20",
};

export function TopicBadge({ topic, className }: { topic: string; className?: string }) {
  const colorClass = TOPIC_COLORS[topic] ?? "bg-slate-500/10 text-slate-300 border-slate-500/20";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-mono font-medium tracking-wide",
        colorClass,
        className
      )}
    >
      {topic.replace(/_/g, " ")}
    </span>
  );
}
