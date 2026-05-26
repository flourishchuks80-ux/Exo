import { ExternalLink, Shield, Lock } from "lucide-react";
import { truncateHex, getExplorerUrl } from "@/lib/utils/format";

interface ArkivEntityBadgeProps {
  entityKey: string;
  owner?: string;
  creator?: string;
  showFull?: boolean;
}

export function ArkivEntityBadge({
  entityKey,
  owner,
  creator,
  showFull = false,
}: ArkivEntityBadgeProps) {
  const explorerUrl = getExplorerUrl(entityKey);

  return (
    <div className="rounded-lg border border-[rgba(0,212,170,0.12)] bg-[rgba(0,212,170,0.04)] p-3 space-y-1.5 font-mono text-xs">
      <div className="flex items-center gap-2 text-[#8B9CC8]">
        <span className="text-[#00D4AA]">⛓</span>
        <span className="text-[#4F5E7A]">Arkiv Braga</span>
        <span className="text-[#00D4AA] truncate">
          {showFull ? entityKey : truncateHex(entityKey)}
        </span>
      </div>

      {creator && (
        <div className="flex items-center gap-2 text-[#4F5E7A]">
          <Shield className="w-3 h-3 text-[#8B5CF6]" />
          <span>Written by</span>
          <span className="text-[#8B9CC8]">{truncateHex(creator)}</span>
          <span className="text-[#4F5E7A] text-[10px]">(immutable)</span>
        </div>
      )}

      {owner && (
        <div className="flex items-center gap-2 text-[#4F5E7A]">
          <span className="text-[#3B82F6]">👤</span>
          <span>Owned by</span>
          <span className="text-[#8B9CC8]">{owner === creator ? "You" : truncateHex(owner)}</span>
        </div>
      )}

      <div className="flex items-center gap-2 text-[#4F5E7A]">
        <Lock className="w-3 h-3 text-[#8B5CF6]" />
        <span>AES-256-GCM encrypted</span>
      </div>

      <a
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-[#00D4AA] hover:text-[#00FFD1] transition-colors group w-fit"
      >
        <ExternalLink className="w-3 h-3" />
        <span>View on Explorer</span>
      </a>
    </div>
  );
}
