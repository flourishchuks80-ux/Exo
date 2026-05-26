"use client";

import { useEffect, useRef } from "react";
import { Check, Loader2, X } from "lucide-react";
import { useImportContext } from "@/contexts/ImportContext";
import { cn } from "@/lib/utils/cn";

export function ImportBubble() {
  const { job, dismiss } = useImportContext();
  const autoDismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (job.status === "done") {
      autoDismissRef.current = setTimeout(dismiss, 8000);
    }
    return () => {
      if (autoDismissRef.current) clearTimeout(autoDismissRef.current);
    };
  }, [job.status, dismiss]);

  if (job.status === "idle") return null;

  const progress = job.total > 0 ? job.written / job.total : 0;
  const isDone = job.status === "done";

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 w-72 rounded-2xl border shadow-2xl transition-all duration-300",
        isDone
          ? "bg-[#121A2E] border-[rgba(0,212,170,0.35)]"
          : "bg-[#121A2E] border-[rgba(0,212,170,0.15)]"
      )}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            {isDone ? (
              <div className="w-6 h-6 rounded-full bg-[rgba(0,212,170,0.15)] flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5 text-[#00D4AA]" />
              </div>
            ) : (
              <Loader2 className="w-4 h-4 text-[#00D4AA] animate-spin flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-xs font-semibold text-[#F0F4FF]">
                {isDone ? "Import complete" : "Importing memories…"}
              </p>
              <p className="text-[10px] text-[#8B9CC8] font-mono mt-0.5 truncate max-w-[160px]">
                {job.label}
              </p>
            </div>
          </div>
          {isDone && (
            <button
              onClick={dismiss}
              className="text-[#4F5E7A] hover:text-[#8B9CC8] transition-colors mt-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="w-full h-1.5 bg-[#192235] rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-[#00D4AA] rounded-full transition-all duration-300"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[10px] text-[#8B9CC8] font-mono">
            {job.written} / {job.total} memories
            {job.failed > 0 && (
              <span className="text-[#FF6B6B] ml-1">({job.failed} failed)</span>
            )}
          </p>
          {!isDone && (
            <p className="text-[10px] text-[#4F5E7A]">Running in background</p>
          )}
          {isDone && (
            <p className="text-[10px] text-[#00D4AA]">Stored on-chain ✓</p>
          )}
        </div>
      </div>
    </div>
  );
}
