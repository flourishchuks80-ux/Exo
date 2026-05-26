"use client";

import { useState } from "react";
import { Trash2, FileText, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { MemoryTypePill } from "@/components/ui/MemoryTypePill";
import { ArkivEntityBadge } from "@/components/ui/ArkivEntityBadge";
import { EncryptionIndicator } from "@/components/ui/EncryptionIndicator";
import { Button } from "@/components/ui/Button";
import { formatRelative, formatBytes } from "@/lib/utils/format";
import type { ContextDocument } from "@/lib/arkiv/schemas";

interface DocumentCardProps {
  doc: ContextDocument;
  onDelete?: (entityKey: string) => void;
  deleting?: boolean;
}

export function DocumentCard({ doc, onDelete, deleting }: DocumentCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="group bg-[#121A2E] border border-[rgba(0,212,170,0.08)] hover:border-[rgba(0,212,170,0.2)] rounded-xl p-4 transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-amber-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <MemoryTypePill type="document" />
            <span className="text-[10px] font-mono text-amber-300/70 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
              {doc.docType.replace(/_/g, " ")}
            </span>
          </div>

          <h3 className="text-sm font-medium text-[#F0F4FF]">{doc.payload.title}</h3>
          <p className="text-xs text-[#8B9CC8] mt-1 leading-relaxed line-clamp-2">{doc.payload.summary}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3 text-xs text-[#4F5E7A]">
        <span>{doc.payload.wordCount.toLocaleString()} words</span>
        <span>{formatBytes(doc.sizeBytes)}</span>
        <span>{formatRelative(doc.updatedAt)}</span>
        {doc.tags && (
          <span className="text-[#8B9CC8]">{doc.tags}</span>
        )}
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[rgba(255,255,255,0.04)]">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-[#4F5E7A] hover:text-[#8B9CC8] transition-colors"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          on-chain details
        </button>
        <EncryptionIndicator className="ml-auto" />
        {onDelete && (
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete(doc.entityKey)}
            loading={deleting}
            className="h-6 text-[10px] px-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </div>

      {expanded && (
        <div className="mt-3 animate-slide-in-up">
          <ArkivEntityBadge entityKey={doc.entityKey} />
        </div>
      )}
    </div>
  );
}
