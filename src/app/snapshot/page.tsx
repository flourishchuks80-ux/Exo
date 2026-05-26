"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useExoAuth } from "@/hooks/useExoAuth";
import { useSnapshots, useCreateSnapshot } from "@/hooks/useSnapshots";
import { useMemoryHealth } from "@/hooks/useMemoryHealth";
import { useSemanticMemory } from "@/hooks/useSemanticMemory";
import { useEpisodicMemory } from "@/hooks/useEpisodicMemory";
import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import { ChainWriteProgress } from "@/components/ui/ChainWriteProgress";
import { formatDate } from "@/lib/utils/format";
import { Camera, Plus, Loader2, Clock } from "lucide-react";

export default function SnapshotPage() {
  const router = useRouter();
  const { authenticated, ready, walletAddress, masterKey, getWalletClient } = useExoAuth();

  useEffect(() => {
    if (ready && !authenticated) router.push("/");
  }, [ready, authenticated, router]);

  const { data: snapshots, isLoading } = useSnapshots(walletAddress, masterKey);
  const { data: health } = useMemoryHealth(walletAddress);
  const { data: semanticMemories } = useSemanticMemory(walletAddress, masterKey);
  const { data: episodes } = useEpisodicMemory(walletAddress, masterKey);
  const createSnapshot = useCreateSnapshot(walletAddress, masterKey);
  const [showProgress, setShowProgress] = useState(false);
  const [txHash, setTxHash] = useState<string | undefined>();

  const handleCreateSnapshot = async () => {
    setShowProgress(true);
    try {
      // Generate AI summary via API
      const response = await fetch("/api/snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "snapshot",
          memoryData: {
            semanticCount: semanticMemories?.length ?? 0,
            episodicCount: episodes?.length ?? 0,
            topics: Array.from(new Set(semanticMemories?.map((m) => m.topic) ?? [])),
          },
        }),
      });
      const snapshotData = await response.json();

      const version = (snapshots?.length ?? 0) + 1;
      const result = await createSnapshot.mutateAsync({
        version,
        semanticCount: semanticMemories?.length ?? 0,
        episodicCount: episodes?.length ?? 0,
        totalEntities: (semanticMemories?.length ?? 0) + (episodes?.length ?? 0),
        payload: {
          aiSummary: snapshotData.aiSummary ?? "Snapshot created.",
          topTopics: snapshotData.topTopics ?? [],
          recentThemes: snapshotData.recentThemes ?? [],
          memoryHealthScore: health?.score ?? 50,
          entityKeyIndex: [
            ...(semanticMemories?.map((m) => m.entityKey) ?? []),
            ...(episodes?.map((e) => e.entityKey) ?? []),
          ],
        },
        getWalletClient,
      });
      setTxHash(result.txHash);
    } catch (err) {
      console.error(err);
      setShowProgress(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060810]">
      <TopBar />
      <Sidebar />

      <main className="pt-14 lg:pl-56">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[#F0F4FF]">Memory Snapshots</h1>
              <p className="text-sm text-[#8B9CC8] mt-1">
                Version history for your sovereign AI memory
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              className="gap-1.5"
              onClick={handleCreateSnapshot}
              loading={createSnapshot.isPending}
            >
              <Camera className="w-3.5 h-3.5" />
              Create Snapshot
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-[#00D4AA] animate-spin" />
            </div>
          ) : !snapshots || snapshots.length === 0 ? (
            <div className="text-center py-20">
              <Camera className="w-10 h-10 text-[#4F5E7A] mx-auto mb-4" />
              <p className="text-[#8B9CC8] mb-4">No snapshots yet.</p>
              <p className="text-sm text-[#4F5E7A] mb-6">
                Create a snapshot to version your AI memory state.
              </p>
              <Button variant="primary" size="sm" onClick={handleCreateSnapshot} className="gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Create First Snapshot
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {snapshots.map((snap) => (
                <div
                  key={snap.entityKey}
                  className="p-5 bg-[#121A2E] border border-[rgba(0,212,170,0.08)] rounded-xl"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#192235] border border-[rgba(255,255,255,0.06)] flex items-center justify-center">
                        <span className="text-[#00D4AA] font-bold font-mono text-sm">v{snap.version}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#F0F4FF]">Snapshot v{snap.version}</p>
                        <p className="text-xs text-[#4F5E7A] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(snap.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold font-mono text-[#00D4AA]">
                        {snap.payload.memoryHealthScore}
                      </p>
                      <p className="text-[10px] text-[#4F5E7A]">health score</p>
                    </div>
                  </div>

                  <p className="text-sm text-[#8B9CC8] leading-relaxed mb-4">
                    {snap.payload.aiSummary}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-[#4F5E7A] border-t border-[rgba(255,255,255,0.04)] pt-3">
                    <span>{snap.semanticCount} semantic</span>
                    <span>{snap.episodicCount} episodes</span>
                    <span>{snap.totalEntities} total entities</span>
                    {snap.payload.topTopics.length > 0 && (
                      <span className="ml-auto">
                        Topics: {snap.payload.topTopics.slice(0, 3).join(", ")}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <ChainWriteProgress
        isOpen={showProgress && !txHash}
        txHash={txHash}
        entityType="snapshot"
        onDone={() => {
          setShowProgress(false);
          setTxHash(undefined);
        }}
      />
    </div>
  );
}
