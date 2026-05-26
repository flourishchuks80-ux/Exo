"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useExoAuth } from "@/hooks/useExoAuth";
import { useMemoryHealth } from "@/hooks/useMemoryHealth";
import { useSemanticMemory } from "@/hooks/useSemanticMemory";
import { useEpisodicMemory } from "@/hooks/useEpisodicMemory";
import { SovereigntyRing } from "@/components/dashboard/SovereigntyRing";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { OnChainActivity } from "@/components/dashboard/OnChainActivity";
import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import { TelegramSetupModal } from "@/components/telegram/TelegramSetupModal";
import { Brain, Plus, MessageSquare, Camera, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { authenticated, ready, walletAddress, masterKey } = useExoAuth();

  useEffect(() => {
    if (ready && !authenticated) router.push("/");
  }, [ready, authenticated, router]);

  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState<string | null>(null);

  useEffect(() => {
    if (!authenticated) return;
    const connected = localStorage.getItem("exo:telegram:username");
    const dismissed = localStorage.getItem("exo:telegram:onboarding:dismissed");
    setTelegramUsername(connected);
    if (!connected && !dismissed) setShowTelegramModal(true);
  }, [authenticated]);

  const { data: health, isLoading: healthLoading } = useMemoryHealth(walletAddress);
  const { data: semanticMemories } = useSemanticMemory(walletAddress, masterKey);
  const { data: episodes } = useEpisodicMemory(walletAddress, masterKey);

  // Build activity feed from recent memories
  const activityItems = [
    ...(semanticMemories ?? []).slice(0, 5).map((m) => ({
      entityKey: m.entityKey,
      type: "semantic" as const,
      timestamp: m.updatedAt,
    })),
    ...(episodes ?? []).slice(0, 5).map((e) => ({
      entityKey: e.entityKey,
      type: "episodic" as const,
      timestamp: e.createdAt,
    })),
  ]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);

  if (!ready || (!authenticated && ready)) {
    return (
      <div className="min-h-screen bg-[#060810] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#00D4AA] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060810]">
      <TopBar />
      <Sidebar />

      <main className="pt-14 lg:pl-56">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Page header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[#F0F4FF]">Memory Dashboard</h1>
              <p className="text-sm text-[#8B9CC8] mt-1">
                Your sovereign AI memory on Arkiv Braga
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/memory/new">
                <Button size="sm" variant="secondary" className="gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Add Memory
                </Button>
              </Link>
              <Link href="/chat">
                <Button size="sm" variant="primary" className="gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Chat
                </Button>
              </Link>
            </div>
          </div>

          {/* Health ring + stats */}
          <div className="grid lg:grid-cols-[auto_1fr] gap-8 mb-8">
            <div className="flex items-center justify-center lg:justify-start">
              {healthLoading ? (
                <div className="w-[200px] h-[200px] flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-[#00D4AA] animate-spin" />
                </div>
              ) : (
                <SovereigntyRing
                  score={health?.score ?? 0}
                  label={health?.label ?? "No Memory Yet"}
                  statusLine={health?.statusLine ?? "Start building your AI's memory."}
                />
              )}
            </div>

            <div className="flex flex-col justify-center gap-4">
              <StatsRow
                semanticCount={health?.semanticCount ?? 0}
                episodicCount={health?.episodicCount ?? 0}
                instructionCount={health?.instructionCount ?? 0}
                documentCount={health?.documentCount ?? 0}
              />

              {/* Quick links */}
              <div className="flex flex-wrap gap-2 mt-2">
                <Link href="/import">
                  <Button size="sm" variant="ghost" className="text-xs gap-1.5">
                    <Brain className="w-3 h-3" />
                    Import from ChatGPT
                  </Button>
                </Link>
                <Link href="/snapshot">
                  <Button size="sm" variant="ghost" className="text-xs gap-1.5">
                    <Camera className="w-3 h-3" />
                    Create Snapshot
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Activity feed */}
          <OnChainActivity items={activityItems} />

          {/* No memory onboarding */}
          {!healthLoading && (health?.semanticCount ?? 0) === 0 && (
            <div className="mt-8 p-6 bg-[#121A2E] border border-[rgba(0,212,170,0.15)] rounded-2xl text-center">
              <Brain className="w-10 h-10 text-[#00D4AA] mx-auto mb-3" />
              <h3 className="text-lg font-bold text-[#F0F4FF] mb-2">
                Your AI doesn't know you yet.
              </h3>
              <p className="text-sm text-[#8B9CC8] mb-6 max-w-md mx-auto">
                Add your first memory and your AI will immediately know who you are, what you're working on, and how you think — across every session, every model.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/memory/new">
                  <Button variant="primary" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add First Memory
                  </Button>
                </Link>
                <Link href="/import">
                  <Button variant="secondary" className="gap-2">
                    Import from ChatGPT
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {showTelegramModal && (
        <TelegramSetupModal
          walletAddress={walletAddress}
          onConnected={(username) => {
            setTelegramUsername(username);
            setShowTelegramModal(false);
          }}
          onDismiss={() => setShowTelegramModal(false)}
        />
      )}
    </div>
  );
}
