"use client";

import { useEffect, useState } from "react";
import { useExoAuth } from "@/hooks/useExoAuth";
import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { countEntitiesByType, countAllEntities, fetchAllExoEntities, fetchAllExoEntitiesGlobal } from "@/lib/arkiv/queries";
import { getExplorerUrl, getTxUrl } from "@/lib/utils/format";
import { parseEntityAttributes } from "@/lib/utils/format";
import { ExternalLink, Copy, Check, RefreshCw, Loader2, Shield, Database } from "lucide-react";
import type { Hex } from "@arkiv-network/sdk";

interface EntitySummary {
  key: string;
  type: string;
  owner: string;
  createdAt: number;
}

interface EntityCounts {
  semantic: number;
  episodic: number;
  instruction: number;
  document: number;
  grant: number;
  snapshot: number;
  total: number;
}

export default function VerifyPage() {
  const { walletAddress } = useExoAuth();
  const [counts, setCounts] = useState<EntityCounts | null>(null);
  const [entities, setEntities] = useState<EntitySummary[]>([]);
  const [globalEntities, setGlobalEntities] = useState<EntitySummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [tab, setTab] = useState<"mine" | "global">("mine");

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [globalResult] = await Promise.all([
        fetchAllExoEntitiesGlobal(50),
      ]);

      const globalSummary: EntitySummary[] = globalResult.entities.map((e) => {
        const attrs = parseEntityAttributes(e as Parameters<typeof parseEntityAttributes>[0]);
        return {
          key: e.key,
          type: (attrs.type as string) ?? "unknown",
          owner: (e as { owner?: string }).owner ?? "",
          createdAt: (attrs.createdAt as number) ?? 0,
        };
      });
      setGlobalEntities(globalSummary);

      if (walletAddress) {
        const [sem, epi, inst, doc, grant, snap, total, myEntities] = await Promise.all([
          countEntitiesByType(walletAddress as Hex, "semantic"),
          countEntitiesByType(walletAddress as Hex, "episodic"),
          countEntitiesByType(walletAddress as Hex, "instruction"),
          countEntitiesByType(walletAddress as Hex, "document"),
          countEntitiesByType(walletAddress as Hex, "grant"),
          countEntitiesByType(walletAddress as Hex, "snapshot"),
          countAllEntities(walletAddress as Hex),
          fetchAllExoEntities(walletAddress as Hex),
        ]);

        setCounts({
          semantic: sem as number,
          episodic: epi as number,
          instruction: inst as number,
          document: doc as number,
          grant: grant as number,
          snapshot: snap as number,
          total: total as number,
        });

        const mySummary: EntitySummary[] = myEntities.entities.map((e) => {
          const attrs = parseEntityAttributes(e as Parameters<typeof parseEntityAttributes>[0]);
          return {
            key: e.key,
            type: (attrs.type as string) ?? "unknown",
            owner: (e as { owner?: string }).owner ?? "",
            createdAt: (attrs.createdAt as number) ?? 0,
          };
        });
        setEntities(mySummary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [walletAddress]);

  const sdkSnippet = `import { createPublicClient, http } from "@arkiv-network/sdk";
import { braga } from "@arkiv-network/sdk/chains";
import { eq } from "@arkiv-network/sdk/query";

const client = createPublicClient({ chain: braga, transport: http() });

const result = await client
  .buildQuery()
  .where([
    eq("app", "exo:v1"),
    eq("type", "semantic"),
  ])
  .ownedBy("${walletAddress ?? "0xYOUR_WALLET"}")
  .withPayload(true)
  .withAttributes(true)
  .limit(50)
  .fetch();

console.log(result.entities);`;

  const typeColors: Record<string, string> = {
    semantic: "text-purple-400 bg-purple-400/10",
    episodic: "text-blue-400 bg-blue-400/10",
    instruction: "text-amber-400 bg-amber-400/10",
    document: "text-green-400 bg-green-400/10",
    grant: "text-pink-400 bg-pink-400/10",
    snapshot: "text-cyan-400 bg-cyan-400/10",
    unknown: "text-[#4F5E7A] bg-[#192235]",
  };

  return (
    <div className="min-h-screen bg-[#060810]">
      <TopBar />
      <Sidebar />

      <main className="pt-14 lg:pl-56">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[#F0F4FF]">Arkiv Verification</h1>
              <p className="text-sm text-[#8B9CC8] mt-1">
                Live entity counts and explorer links — all data from Braga testnet
              </p>
            </div>
            <button
              onClick={loadData}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-sm text-[#4F5E7A] hover:text-[#8B9CC8] transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {/* Live counts */}
          {walletAddress && counts && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
              {(["semantic", "episodic", "instruction", "document", "grant", "snapshot"] as const).map((type) => (
                <div key={type} className="p-3 bg-[#121A2E] border border-[rgba(0,212,170,0.08)] rounded-xl text-center">
                  <p className="text-2xl font-bold font-mono text-[#F0F4FF]">{counts[type]}</p>
                  <p className="text-[10px] text-[#4F5E7A] mt-0.5">{type}</p>
                </div>
              ))}
            </div>
          )}

          {walletAddress && counts && (
            <div className="p-4 bg-[rgba(0,212,170,0.04)] border border-[rgba(0,212,170,0.15)] rounded-xl mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-[#00D4AA]" />
                <div>
                  <p className="text-sm font-medium text-[#F0F4FF]">
                    {counts.total} entities owned by your wallet
                  </p>
                  <p className="text-xs text-[#8B9CC8] font-mono">{walletAddress}</p>
                </div>
              </div>
              <a
                href={`https://explorer.braga.hoodi.arkiv.network/address/${walletAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-[#00D4AA] hover:underline"
              >
                Explorer <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-[#121A2E] rounded-lg mb-4 w-fit">
            <button
              onClick={() => setTab("mine")}
              className={`px-4 py-1.5 rounded-md text-sm transition-all ${tab === "mine" ? "bg-[#192235] text-[#F0F4FF]" : "text-[#4F5E7A] hover:text-[#8B9CC8]"}`}
            >
              My Entities
            </button>
            <button
              onClick={() => setTab("global")}
              className={`px-4 py-1.5 rounded-md text-sm transition-all ${tab === "global" ? "bg-[#192235] text-[#F0F4FF]" : "text-[#4F5E7A] hover:text-[#8B9CC8]"}`}
            >
              Global (all exo:v1)
            </button>
          </div>

          {/* Entity list */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-[#00D4AA] animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {(tab === "mine" ? entities : globalEntities).map((e) => (
                <div
                  key={e.key}
                  className="p-3 bg-[#121A2E] border border-[rgba(0,212,170,0.06)] rounded-xl flex items-center gap-3"
                >
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full flex-shrink-0 ${typeColors[e.type] ?? typeColors.unknown}`}>
                    {e.type}
                  </span>
                  <code className="text-xs font-mono text-[#8B9CC8] flex-1 truncate">{e.key}</code>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => copy(e.key, e.key)}
                      className="text-[#4F5E7A] hover:text-[#8B9CC8] transition-colors"
                    >
                      {copied === e.key ? <Check className="w-3.5 h-3.5 text-[#00D4AA]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <a
                      href={getExplorerUrl(e.key)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#4F5E7A] hover:text-[#00D4AA] transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}

              {((tab === "mine" ? entities : globalEntities).length === 0) && !isLoading && (
                <div className="text-center py-12">
                  <Database className="w-8 h-8 text-[#4F5E7A] mx-auto mb-3" />
                  <p className="text-sm text-[#4F5E7A]">
                    {tab === "mine" && !walletAddress
                      ? "Connect your wallet to see your entities"
                      : "No entities found on Arkiv yet"}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* SDK query snippet */}
          <div className="mt-8 p-5 bg-[#121A2E] border border-[rgba(0,212,170,0.08)] rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-[#F0F4FF]">Live Arkiv SDK Query</p>
              <button
                onClick={() => copy(sdkSnippet, "snippet")}
                className="flex items-center gap-1 text-xs text-[#4F5E7A] hover:text-[#8B9CC8] transition-colors"
              >
                {copied === "snippet" ? <Check className="w-3.5 h-3.5 text-[#00D4AA]" /> : <Copy className="w-3.5 h-3.5" />}
                {copied === "snippet" ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="text-xs font-mono text-[#8B9CC8] overflow-x-auto whitespace-pre leading-relaxed">
              {sdkSnippet}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
}
