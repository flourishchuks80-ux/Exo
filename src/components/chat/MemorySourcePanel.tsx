"use client";

import { ExternalLink, Brain } from "lucide-react";
import { MemoryTypePill } from "@/components/ui/MemoryTypePill";
import { TopicBadge } from "@/components/ui/TopicBadge";
import { truncateHex, getExplorerUrl } from "@/lib/utils/format";

interface MemorySource {
  entityKey: string;
  type: string;
  topic?: string;
  preview: string;
}

interface MemorySourcePanelProps {
  sources: MemorySource[];
  instructionCount: number;
}

export function MemorySourcePanel({ sources, instructionCount }: MemorySourcePanelProps) {
  const semanticSources = sources.filter((s) => s.type === "semantic");
  const episodicSources = sources.filter((s) => s.type === "episodic");
  const instructionSources = sources.filter((s) => s.type === "instruction");

  return (
    <div className="h-full flex flex-col border-l border-[rgba(0,212,170,0.08)] bg-[#0C1120]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[rgba(0,212,170,0.08)]">
        <Brain className="w-4 h-4 text-[#00D4AA]" />
        <h3 className="text-sm font-medium text-[#F0F4FF]">Memory Sources</h3>
        <span className="ml-auto text-xs text-[#4F5E7A] font-mono">{sources.length + instructionCount} active</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {instructionCount > 0 && (
          <div>
            <p className="text-[10px] font-mono text-[#4F5E7A] mb-2 uppercase tracking-wider">
              Active Instructions ({instructionCount})
            </p>
            <div className="space-y-1">
              {instructionSources.slice(0, 3).map((src) => (
                <SourceRow key={src.entityKey} source={src} />
              ))}
              {instructionCount > instructionSources.length && (
                <p className="text-[10px] text-[#4F5E7A] font-mono pl-2">
                  +{instructionCount - instructionSources.length} more
                </p>
              )}
            </div>
          </div>
        )}

        {semanticSources.length > 0 && (
          <div>
            <p className="text-[10px] font-mono text-[#4F5E7A] mb-2 uppercase tracking-wider">
              Semantic Memory ({semanticSources.length})
            </p>
            <div className="space-y-1">
              {semanticSources.map((src) => (
                <SourceRow key={src.entityKey} source={src} />
              ))}
            </div>
          </div>
        )}

        {episodicSources.length > 0 && (
          <div>
            <p className="text-[10px] font-mono text-[#4F5E7A] mb-2 uppercase tracking-wider">
              Episode Context ({episodicSources.length})
            </p>
            <div className="space-y-1">
              {episodicSources.map((src) => (
                <SourceRow key={src.entityKey} source={src} />
              ))}
            </div>
          </div>
        )}

        {sources.length === 0 && instructionCount === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <Brain className="w-8 h-8 text-[#4F5E7A] mb-2" />
            <p className="text-xs text-[#4F5E7A]">Send a message to see<br />which memories are used</p>
          </div>
        )}
      </div>

      <div className="px-3 py-2 border-t border-[rgba(0,212,170,0.06)]">
        <p className="text-[10px] text-[#4F5E7A] text-center">
          All data from Arkiv Braga · Decrypted client-side
        </p>
      </div>
    </div>
  );
}

function SourceRow({ source }: { source: MemorySource }) {
  return (
    <div className="group p-2 rounded-lg hover:bg-[#192235] transition-colors">
      <div className="flex items-center gap-2 mb-1">
        <MemoryTypePill type={source.type} />
        {source.topic && <TopicBadge topic={source.topic} />}
      </div>
      <p className="text-[10px] text-[#8B9CC8] leading-relaxed line-clamp-2">{source.preview}...</p>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[9px] font-mono text-[#4F5E7A]">{truncateHex(source.entityKey, 4)}</span>
        <a
          href={getExplorerUrl(source.entityKey)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#00D4AA] opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  );
}
