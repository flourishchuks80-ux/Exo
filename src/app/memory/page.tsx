"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useExoAuth } from "@/hooks/useExoAuth";
import { useSemanticMemory, useDeleteMemory } from "@/hooks/useSemanticMemory";
import { useInstructions } from "@/hooks/useInstructions";
import { useDocuments } from "@/hooks/useDocuments";
import { useEpisodicMemory } from "@/hooks/useEpisodicMemory";
import { SemanticCard } from "@/components/memory/SemanticCard";
import { InstructionCard } from "@/components/memory/InstructionCard";
import { DocumentCard } from "@/components/memory/DocumentCard";
import { EpisodicCard } from "@/components/memory/EpisodicCard";
import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import { Brain, Zap, FileText, Clock, Plus, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const TABS = [
  { id: "semantic", label: "Semantic", icon: Brain },
  { id: "episodic", label: "Episodic", icon: Clock },
  { id: "instructions", label: "Instructions", icon: Zap },
  { id: "documents", label: "Documents", icon: FileText },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function MemoryPage() {
  const router = useRouter();
  const { authenticated, ready, walletAddress, masterKey, getWalletClient } = useExoAuth();
  const [activeTab, setActiveTab] = useState<TabId>("semantic");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (ready && !authenticated) router.push("/");
  }, [ready, authenticated, router]);

  const { data: semanticMemories, isLoading: semLoading } = useSemanticMemory(walletAddress, masterKey);
  const { data: instructions, isLoading: instLoading } = useInstructions(walletAddress, masterKey);
  const { data: documents, isLoading: docsLoading } = useDocuments(walletAddress, masterKey);
  const { data: episodes, isLoading: epLoading } = useEpisodicMemory(walletAddress, masterKey);
  const deleteMutation = useDeleteMemory(walletAddress);

  const filteredSemantic = (semanticMemories ?? []).filter((m) =>
    search ? m.payload.content.toLowerCase().includes(search.toLowerCase()) || m.topic.includes(search.toLowerCase()) : true
  );
  const filteredInstructions = (instructions ?? []).filter((i) =>
    search ? i.payload.instruction.toLowerCase().includes(search.toLowerCase()) : true
  );
  const filteredDocuments = (documents ?? []).filter((d) =>
    search ? d.payload.title.toLowerCase().includes(search.toLowerCase()) || d.payload.summary.toLowerCase().includes(search.toLowerCase()) : true
  );

  const isLoading = semLoading || instLoading || docsLoading || epLoading;

  const handleDelete = async (entityKey: string) => {
    await deleteMutation.mutateAsync({ entityKey, getWalletClient });
  };

  return (
    <div className="min-h-screen bg-[#060810]">
      <TopBar />
      <Sidebar />

      <main className="pt-14 lg:pl-56">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#F0F4FF]">Memory Browser</h1>
              <p className="text-sm text-[#8B9CC8] mt-1">
                {(semanticMemories?.length ?? 0) + (instructions?.length ?? 0) + (documents?.length ?? 0) + (episodes?.length ?? 0)} entities on Arkiv Braga
              </p>
            </div>
            <Link href="/memory/new">
              <Button size="sm" variant="primary" className="gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Add Memory
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4F5E7A]" />
            <input
              type="text"
              placeholder="Search memories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#121A2E] border border-[rgba(0,212,170,0.12)] rounded-xl text-sm text-[#F0F4FF] placeholder-[#4F5E7A] focus:outline-none focus:border-[rgba(0,212,170,0.35)] transition-colors"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-[#121A2E] border border-[rgba(0,212,170,0.08)] rounded-xl p-1">
            {TABS.map((tab) => {
              const count = tab.id === "semantic" ? (semanticMemories?.length ?? 0)
                : tab.id === "instructions" ? (instructions?.length ?? 0)
                : tab.id === "documents" ? (documents?.length ?? 0)
                : (episodes?.length ?? 0);

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                    activeTab === tab.id
                      ? "bg-[rgba(0,212,170,0.12)] text-[#00D4AA]"
                      : "text-[#4F5E7A] hover:text-[#8B9CC8]"
                  )}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="text-[10px] opacity-60">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-[#00D4AA] animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {activeTab === "semantic" &&
                (filteredSemantic.length > 0 ? (
                  filteredSemantic.map((m) => (
                    <SemanticCard
                      key={m.entityKey}
                      memory={m}
                      onDelete={handleDelete}
                      deleting={deleteMutation.isPending}
                    />
                  ))
                ) : (
                  <EmptyState type="semantic" />
                ))}

              {activeTab === "episodic" &&
                (episodes && episodes.length > 0 ? (
                  episodes.map((e) => <EpisodicCard key={e.entityKey} episode={e} />)
                ) : (
                  <EmptyState type="episodic" />
                ))}

              {activeTab === "instructions" &&
                (filteredInstructions.length > 0 ? (
                  filteredInstructions.map((i) => (
                    <InstructionCard
                      key={i.entityKey}
                      instruction={i}
                      onDelete={handleDelete}
                      deleting={deleteMutation.isPending}
                    />
                  ))
                ) : (
                  <EmptyState type="instruction" />
                ))}

              {activeTab === "documents" &&
                (filteredDocuments.length > 0 ? (
                  filteredDocuments.map((d) => (
                    <DocumentCard
                      key={d.entityKey}
                      doc={d}
                      onDelete={handleDelete}
                      deleting={deleteMutation.isPending}
                    />
                  ))
                ) : (
                  <EmptyState type="document" />
                ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function EmptyState({ type }: { type: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Brain className="w-10 h-10 text-[#4F5E7A] mb-4" />
      <p className="text-[#8B9CC8] text-sm mb-4">No {type} memories yet.</p>
      <Link href="/memory/new">
        <Button variant="primary" size="sm" className="gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          Add your first {type} memory
        </Button>
      </Link>
    </div>
  );
}
