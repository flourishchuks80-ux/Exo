"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useExoAuth } from "@/hooks/useExoAuth";
import { useInstructions } from "@/hooks/useInstructions";
import { useDeleteMemory } from "@/hooks/useSemanticMemory";
import { InstructionCard } from "@/components/memory/InstructionCard";
import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import { Zap, Plus, Search, Loader2 } from "lucide-react";

export default function InstructionsPage() {
  const router = useRouter();
  const { authenticated, ready, walletAddress, masterKey, getWalletClient } = useExoAuth();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (ready && !authenticated) router.push("/");
  }, [ready, authenticated, router]);

  const { data: instructions, isLoading } = useInstructions(walletAddress, masterKey);
  const deleteMutation = useDeleteMemory(walletAddress);

  const filtered = (instructions ?? []).filter((i) =>
    search ? i.payload.instruction.toLowerCase().includes(search.toLowerCase()) : true
  );

  const handleDelete = async (entityKey: string) => {
    await deleteMutation.mutateAsync({ entityKey, getWalletClient });
  };

  return (
    <div className="min-h-screen bg-[#060810]">
      <TopBar />
      <Sidebar />

      <main className="pt-14 lg:pl-56">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#F0F4FF]">Instructions</h1>
              <p className="text-sm text-[#8B9CC8] mt-1">
                {instructions?.length ?? 0} behavioral rules stored on Arkiv Braga
              </p>
            </div>
            <Link href="/memory/new">
              <Button size="sm" variant="primary" className="gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Add Instruction
              </Button>
            </Link>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4F5E7A]" />
            <input
              type="text"
              placeholder="Search instructions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#121A2E] border border-[rgba(0,212,170,0.12)] rounded-xl text-sm text-[#F0F4FF] placeholder-[#4F5E7A] focus:outline-none focus:border-[rgba(0,212,170,0.35)] transition-colors"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-[#00D4AA] animate-spin" />
            </div>
          ) : filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map((i) => (
                <InstructionCard
                  key={i.entityKey}
                  instruction={i}
                  onDelete={handleDelete}
                  deleting={deleteMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Zap className="w-10 h-10 text-[#4F5E7A] mb-4" />
              <p className="text-[#8B9CC8] text-sm mb-4">No instructions yet.</p>
              <p className="text-xs text-[#4F5E7A] mb-6">
                Instructions tell your AI how to respond — tone, format, preferences.
              </p>
              <Link href="/memory/new">
                <Button variant="primary" size="sm" className="gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Add your first instruction
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
