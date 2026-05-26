"use client";

import { ExternalLink, Activity } from "lucide-react";
import { MemoryTypePill } from "@/components/ui/MemoryTypePill";
import { formatRelative, getTxUrl, truncateHex } from "@/lib/utils/format";

interface ActivityItem {
  entityKey: string;
  type: string;
  txHash?: string;
  timestamp: number;
}

interface OnChainActivityProps {
  items: ActivityItem[];
}

export function OnChainActivity({ items }: OnChainActivityProps) {
  if (items.length === 0) {
    return (
      <div className="bg-[#121A2E] border border-[rgba(0,212,170,0.08)] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-[#00D4AA]" />
          <h3 className="text-sm font-medium text-[#F0F4FF]">On-Chain Activity</h3>
        </div>
        <div className="text-center py-6 text-[#4F5E7A] text-sm">
          No activity yet. Add your first memory.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#121A2E] border border-[rgba(0,212,170,0.08)] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-[#00D4AA]" />
        <h3 className="text-sm font-medium text-[#F0F4FF]">On-Chain Activity</h3>
        <span className="ml-auto text-[10px] text-[#4F5E7A] font-mono">Arkiv Braga</span>
      </div>

      <div className="space-y-2">
        {items.slice(0, 10).map((item, i) => (
          <div
            key={`${item.entityKey}-${i}`}
            className="flex items-center gap-3 py-2 border-b border-[rgba(255,255,255,0.03)] last:border-0"
          >
            <MemoryTypePill type={item.type} />
            <span className="text-xs font-mono text-[#4F5E7A] flex-1 truncate">
              {truncateHex(item.entityKey)}
            </span>
            <span className="text-xs text-[#4F5E7A]">{formatRelative(item.timestamp)}</span>
            {item.txHash && (
              <a
                href={getTxUrl(item.txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00D4AA] hover:text-[#00FFD1] transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        ))}
      </div>

      <p className="text-[10px] text-[#4F5E7A] text-center mt-3">
        Everything here is independently verifiable on Arkiv
      </p>
    </div>
  );
}
