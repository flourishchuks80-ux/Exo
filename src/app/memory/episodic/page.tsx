"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useExoAuth } from "@/hooks/useExoAuth";
import { useEpisodicMemory } from "@/hooks/useEpisodicMemory";
import { EpisodicCard } from "@/components/memory/EpisodicCard";
import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import { Clock, Plus, Loader2 } from "lucide-react";

export default function EpisodicMemoryPage() {
  const router = useRouter();
  const { authenticated, ready, walletAddress, masterKey } = useExoAuth();

  useEffect(() => {
    if (ready && !authenticated) router.push("/");
  }, [ready, authenticated, router]);

  const { data: episodes, isLoading } = useEpisodicMemory(walletAddress, masterKey);

  return (
    <div className="min-h-screen bg-[#060810]">
      <TopBar />
      <Sidebar />

      <main className="pt-14 lg:pl-56">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#F0F4FF]">Episodic Memory</h1>
              <p className="text-sm text-[#8B9CC8] mt-1">
                {episodes?.length ?? 0} conversation episodes on Arkiv Braga
              </p>
            </div>
            <Link href="/chat">
              <Button size="sm" variant="primary" className="gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                New Chat
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-[#00D4AA] animate-spin" />
            </div>
          ) : episodes && episodes.length > 0 ? (
            <div className="space-y-3">
              {episodes.map((e) => (
                <EpisodicCard key={e.entityKey} episode={e} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Clock className="w-10 h-10 text-[#4F5E7A] mb-4" />
              <p className="text-[#8B9CC8] text-sm mb-4">No episodic memories yet.</p>
              <p className="text-xs text-[#4F5E7A] mb-6">
                Episodes are created automatically when you chat with your AI.
              </p>
              <Link href="/chat">
                <Button variant="primary" size="sm" className="gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Start a conversation
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
