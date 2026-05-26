import Link from "next/link";
import { Brain, Clock, Zap, Share2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  href: string;
  color: string;
  bgColor: string;
}

function StatCard({ label, value, icon: Icon, href, color, bgColor }: StatCardProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-4 bg-[#121A2E] border border-[rgba(0,212,170,0.08)] hover:border-[rgba(0,212,170,0.2)] rounded-xl transition-all duration-200 group"
    >
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", bgColor)}>
        <Icon className={cn("w-5 h-5", color)} />
      </div>
      <div>
        <p className="text-2xl font-bold font-mono text-[#F0F4FF]">{value}</p>
        <p className="text-xs text-[#4F5E7A]">{label}</p>
      </div>
    </Link>
  );
}

interface StatsRowProps {
  semanticCount: number;
  episodicCount: number;
  instructionCount: number;
  documentCount: number;
}

export function StatsRow({ semanticCount, episodicCount, instructionCount, documentCount }: StatsRowProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        label="Semantic facts"
        value={semanticCount}
        icon={Brain}
        href="/memory/semantic"
        color="text-purple-400"
        bgColor="bg-purple-500/10"
      />
      <StatCard
        label="Episodes recorded"
        value={episodicCount}
        icon={Clock}
        href="/memory/episodic"
        color="text-blue-400"
        bgColor="bg-blue-500/10"
      />
      <StatCard
        label="Active instructions"
        value={instructionCount}
        icon={Zap}
        href="/memory/instructions"
        color="text-[#00D4AA]"
        bgColor="bg-[rgba(0,212,170,0.08)]"
      />
      <StatCard
        label="Context documents"
        value={documentCount}
        icon={Share2}
        href="/memory/documents"
        color="text-amber-400"
        bgColor="bg-amber-500/10"
      />
    </div>
  );
}
