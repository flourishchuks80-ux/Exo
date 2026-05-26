import { Lock } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function EncryptionIndicator({ className }: { className?: string }) {
  return (
    <div
      title="Encrypted with AES-256-GCM — only your key can read this"
      className={cn(
        "inline-flex items-center gap-1 text-[#8B5CF6] text-[10px] font-mono cursor-help",
        className
      )}
    >
      <Lock className="w-2.5 h-2.5" />
      <span>AES-256-GCM</span>
    </div>
  );
}
