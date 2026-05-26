"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useExoAuth } from "@/hooks/useExoAuth";
import { useCreateSemanticMemory } from "@/hooks/useSemanticMemory";
import { useCreateInstruction } from "@/hooks/useInstructions";
import { useCreateDocument } from "@/hooks/useDocuments";
import { ChainWriteProgress } from "@/components/ui/ChainWriteProgress";
import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import { TOPIC_TAXONOMY, INSTRUCTION_CATEGORIES, INSTRUCTION_SCOPES, DOCUMENT_TYPES } from "@/lib/arkiv/constants";
import { guessTopic } from "@/lib/ai/memoryExtractor";
import { Brain, Zap, FileText, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Topic, InstructionCategory, InstructionScope, DocumentType } from "@/lib/arkiv/constants";

type MemoryType = "semantic" | "instruction" | "document";

const TYPE_OPTIONS = [
  {
    id: "semantic" as MemoryType,
    icon: Brain,
    title: "Semantic Fact",
    description: "Something your AI should always know about you",
    color: "border-purple-500/30 bg-purple-500/5 hover:border-purple-500/50",
    activeColor: "border-purple-500 bg-purple-500/10",
  },
  {
    id: "instruction" as MemoryType,
    icon: Zap,
    title: "Instruction",
    description: "A rule your AI must follow in every conversation",
    color: "border-[rgba(0,212,170,0.2)] bg-[rgba(0,212,170,0.04)] hover:border-[rgba(0,212,170,0.4)]",
    activeColor: "border-[#00D4AA] bg-[rgba(0,212,170,0.08)]",
  },
  {
    id: "document" as MemoryType,
    icon: FileText,
    title: "Document",
    description: "A file or reference your AI can always access",
    color: "border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40",
    activeColor: "border-amber-500 bg-amber-500/10",
  },
] as const;

export default function AddMemoryPage() {
  const router = useRouter();
  const { walletAddress, masterKey, getWalletClient } = useExoAuth();
  const [step, setStep] = useState(1);
  const [memoryType, setMemoryType] = useState<MemoryType>("semantic");
  const [showProgress, setShowProgress] = useState(false);
  const [txHash, setTxHash] = useState<string | undefined>();

  // Semantic form state
  const [topic, setTopic] = useState<Topic>("project");
  const [content, setContent] = useState("");
  const [importance, setImportance] = useState(70);
  const [tags, setTags] = useState("");

  // Instruction form state
  const [instCategory, setInstCategory] = useState<InstructionCategory>("behavior");
  const [instScope, setInstScope] = useState<InstructionScope>("global");
  const [instPriority, setInstPriority] = useState(7);
  const [instText, setInstText] = useState("");
  const [instRationale, setInstRationale] = useState("");

  // Document form state
  const [docTitle, setDocTitle] = useState("");
  const [docType, setDocType] = useState<DocumentType>("notes");
  const [docContent, setDocContent] = useState("");
  const [docTags, setDocTags] = useState("");

  const createSemantic = useCreateSemanticMemory(walletAddress, masterKey);
  const createInstruction = useCreateInstruction(walletAddress, masterKey);
  const createDocument = useCreateDocument(walletAddress, masterKey);

  const handleSubmit = async () => {
    setShowProgress(true);
    try {
      if (memoryType === "semantic") {
        const result = await createSemantic.mutateAsync({
          topic,
          importance,
          agentId: "claude",
          confirmed: true,
          payload: {
            content,
            source: "user_stated",
            confidence: 1.0,
            tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
            relatedKeys: [],
          },
          getWalletClient,
        });
        setTxHash(result.txHash);
      } else if (memoryType === "instruction") {
        const result = await createInstruction.mutateAsync({
          scope: instScope,
          agentId: "any",
          priority: instPriority,
          category: instCategory,
          payload: {
            instruction: instText,
            rationale: instRationale || undefined,
          },
          getWalletClient,
        });
        setTxHash(result.txHash);
      } else {
        const wordCount = docContent.split(/\s+/).length;
        const summary = docContent.slice(0, 200) + (docContent.length > 200 ? "..." : "");
        const result = await createDocument.mutateAsync({
          docType,
          title: docTitle,
          tags: docTags,
          payload: {
            title: docTitle,
            content: docContent,
            summary,
            wordCount,
            language: "en",
          },
          getWalletClient,
        });
        setTxHash(result.txHash);
      }
    } catch (err) {
      console.error("Failed to create memory:", err);
      setShowProgress(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060810]">
      <TopBar />
      <Sidebar />

      <main className="pt-14 lg:pl-56">
        <div className="max-w-2xl mx-auto px-6 py-8">
          {/* Back */}
          <button
            onClick={() => step > 1 ? setStep(step - 1) : router.push("/memory")}
            className="flex items-center gap-1.5 text-sm text-[#4F5E7A] hover:text-[#8B9CC8] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {step > 1 ? "Back" : "Memory Browser"}
          </button>

          <h1 className="text-2xl font-bold text-[#F0F4FF] mb-2">Add Memory</h1>
          <p className="text-sm text-[#8B9CC8] mb-8">
            Step {step} of 3 — {step === 1 ? "Choose type" : step === 2 ? "Enter content" : "Preview & save"}
          </p>

          {/* Progress bar */}
          <div className="flex gap-1 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  s <= step ? "bg-[#00D4AA]" : "bg-[#192235]"
                )}
              />
            ))}
          </div>

          {/* Step 1: Type selection */}
          {step === 1 && (
            <div className="space-y-3">
              {TYPE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setMemoryType(option.id)}
                  className={cn(
                    "w-full flex items-start gap-4 p-5 rounded-xl border transition-all text-left",
                    memoryType === option.id ? option.activeColor : option.color
                  )}
                >
                  <div className="w-10 h-10 rounded-lg bg-[#192235] flex items-center justify-center flex-shrink-0">
                    <option.icon className="w-5 h-5 text-[#8B9CC8]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#F0F4FF]">{option.title}</p>
                    <p className="text-sm text-[#8B9CC8] mt-0.5">{option.description}</p>
                  </div>
                </button>
              ))}

              <Button
                variant="primary"
                className="w-full mt-4 gap-2"
                onClick={() => setStep(2)}
              >
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Step 2: Content */}
          {step === 2 && (
            <div className="space-y-5">
              {memoryType === "semantic" && (
                <>
                  <div>
                    <label className="block text-xs font-mono text-[#8B9CC8] mb-2 uppercase tracking-wider">Topic</label>
                    <select
                      value={topic}
                      onChange={(e) => setTopic(e.target.value as Topic)}
                      className="w-full px-3 py-2.5 bg-[#121A2E] border border-[rgba(0,212,170,0.12)] rounded-xl text-sm text-[#F0F4FF] focus:outline-none focus:border-[rgba(0,212,170,0.35)] transition-colors"
                    >
                      {TOPIC_TAXONOMY.map((t) => (
                        <option key={t} value={t} className="bg-[#121A2E]">
                          {t.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#8B9CC8] mb-2 uppercase tracking-wider">Content</label>
                    <textarea
                      value={content}
                      onChange={(e) => {
                        setContent(e.target.value);
                        if (e.target.value.length > 10) setTopic(guessTopic(e.target.value));
                      }}
                      placeholder="Something your AI should always know about you..."
                      rows={4}
                      className="w-full px-3 py-2.5 bg-[#121A2E] border border-[rgba(0,212,170,0.12)] rounded-xl text-sm text-[#F0F4FF] placeholder-[#4F5E7A] focus:outline-none focus:border-[rgba(0,212,170,0.35)] resize-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#8B9CC8] mb-2 uppercase tracking-wider">
                      Importance: {importance} — {importance >= 80 ? "Critical" : importance >= 50 ? "Important" : "Background"}
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={100}
                      value={importance}
                      onChange={(e) => setImportance(parseInt(e.target.value))}
                      className="w-full accent-[#00D4AA]"
                    />
                    <div className="flex justify-between text-[10px] text-[#4F5E7A] mt-1 font-mono">
                      <span>Background</span>
                      <span>Important</span>
                      <span>Critical</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#8B9CC8] mb-2 uppercase tracking-wider">Tags (comma separated)</label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="web3, engineering, defi"
                      className="w-full px-3 py-2.5 bg-[#121A2E] border border-[rgba(0,212,170,0.12)] rounded-xl text-sm text-[#F0F4FF] placeholder-[#4F5E7A] focus:outline-none focus:border-[rgba(0,212,170,0.35)] transition-colors"
                    />
                  </div>
                </>
              )}

              {memoryType === "instruction" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-[#8B9CC8] mb-2 uppercase tracking-wider">Category</label>
                      <select
                        value={instCategory}
                        onChange={(e) => setInstCategory(e.target.value as InstructionCategory)}
                        className="w-full px-3 py-2.5 bg-[#121A2E] border border-[rgba(0,212,170,0.12)] rounded-xl text-sm text-[#F0F4FF] focus:outline-none focus:border-[rgba(0,212,170,0.35)] transition-colors"
                      >
                        {INSTRUCTION_CATEGORIES.map((c) => (
                          <option key={c} value={c} className="bg-[#121A2E]">{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-[#8B9CC8] mb-2 uppercase tracking-wider">Scope</label>
                      <select
                        value={instScope}
                        onChange={(e) => setInstScope(e.target.value as InstructionScope)}
                        className="w-full px-3 py-2.5 bg-[#121A2E] border border-[rgba(0,212,170,0.12)] rounded-xl text-sm text-[#F0F4FF] focus:outline-none focus:border-[rgba(0,212,170,0.35)] transition-colors"
                      >
                        {INSTRUCTION_SCOPES.map((s) => (
                          <option key={s} value={s} className="bg-[#121A2E]">{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#8B9CC8] mb-2 uppercase tracking-wider">
                      Priority: {instPriority} — {instPriority >= 8 ? "Critical" : instPriority >= 5 ? "High" : "Standard"}
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={instPriority}
                      onChange={(e) => setInstPriority(parseInt(e.target.value))}
                      className="w-full accent-[#00D4AA]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#8B9CC8] mb-2 uppercase tracking-wider">Instruction</label>
                    <textarea
                      value={instText}
                      onChange={(e) => setInstText(e.target.value)}
                      placeholder="Always be direct. Skip preamble. Lead with the answer."
                      rows={3}
                      className="w-full px-3 py-2.5 bg-[#121A2E] border border-[rgba(0,212,170,0.12)] rounded-xl text-sm text-[#F0F4FF] placeholder-[#4F5E7A] focus:outline-none focus:border-[rgba(0,212,170,0.35)] resize-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#8B9CC8] mb-2 uppercase tracking-wider">
                      Rationale (optional)
                    </label>
                    <input
                      type="text"
                      value={instRationale}
                      onChange={(e) => setInstRationale(e.target.value)}
                      placeholder="Why does this rule exist?"
                      className="w-full px-3 py-2.5 bg-[#121A2E] border border-[rgba(0,212,170,0.12)] rounded-xl text-sm text-[#F0F4FF] placeholder-[#4F5E7A] focus:outline-none focus:border-[rgba(0,212,170,0.35)] transition-colors"
                    />
                  </div>
                </>
              )}

              {memoryType === "document" && (
                <>
                  <div>
                    <label className="block text-xs font-mono text-[#8B9CC8] mb-2 uppercase tracking-wider">Title</label>
                    <input
                      type="text"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      placeholder="Q2 Product Roadmap"
                      className="w-full px-3 py-2.5 bg-[#121A2E] border border-[rgba(0,212,170,0.12)] rounded-xl text-sm text-[#F0F4FF] placeholder-[#4F5E7A] focus:outline-none focus:border-[rgba(0,212,170,0.35)] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#8B9CC8] mb-2 uppercase tracking-wider">Document Type</label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value as DocumentType)}
                      className="w-full px-3 py-2.5 bg-[#121A2E] border border-[rgba(0,212,170,0.12)] rounded-xl text-sm text-[#F0F4FF] focus:outline-none focus:border-[rgba(0,212,170,0.35)] transition-colors"
                    >
                      {DOCUMENT_TYPES.map((t) => (
                        <option key={t} value={t} className="bg-[#121A2E]">{t.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#8B9CC8] mb-2 uppercase tracking-wider">Content</label>
                    <textarea
                      value={docContent}
                      onChange={(e) => setDocContent(e.target.value)}
                      placeholder="Paste your document content here..."
                      rows={8}
                      className="w-full px-3 py-2.5 bg-[#121A2E] border border-[rgba(0,212,170,0.12)] rounded-xl text-sm text-[#F0F4FF] placeholder-[#4F5E7A] focus:outline-none focus:border-[rgba(0,212,170,0.35)] resize-none transition-colors font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#8B9CC8] mb-2 uppercase tracking-wider">Tags</label>
                    <input
                      type="text"
                      value={docTags}
                      onChange={(e) => setDocTags(e.target.value)}
                      placeholder="product, roadmap, q2"
                      className="w-full px-3 py-2.5 bg-[#121A2E] border border-[rgba(0,212,170,0.12)] rounded-xl text-sm text-[#F0F4FF] placeholder-[#4F5E7A] focus:outline-none focus:border-[rgba(0,212,170,0.35)] transition-colors"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button variant="primary" onClick={() => setStep(3)} className="flex-1 gap-2">
                  Preview <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="p-4 bg-[#121A2E] border border-[rgba(0,212,170,0.12)] rounded-xl">
                <p className="text-[10px] font-mono text-[#4F5E7A] uppercase tracking-wider mb-3">Preview — what your AI will see</p>

                {memoryType === "semantic" && (
                  <div className="space-y-2 text-sm">
                    <p className="text-[#4F5E7A] font-mono">[{topic}] (importance: {importance})</p>
                    <p className="text-[#F0F4FF]">{content}</p>
                    {tags && <p className="text-[#8B9CC8] text-xs">Tags: {tags}</p>}
                  </div>
                )}

                {memoryType === "instruction" && (
                  <div className="space-y-2 text-sm">
                    <p className="text-[#4F5E7A] font-mono">[Priority {instPriority}][{instCategory.toUpperCase()}] {instScope}</p>
                    <p className="text-[#F0F4FF]">{instText}</p>
                    {instRationale && <p className="text-[#8B9CC8] text-xs italic">Rationale: {instRationale}</p>}
                  </div>
                )}

                {memoryType === "document" && (
                  <div className="space-y-2 text-sm">
                    <p className="text-[#4F5E7A] font-mono">[{docType}] "{docTitle}"</p>
                    <p className="text-[#F0F4FF]">{docContent.slice(0, 300)}{docContent.length > 300 ? "..." : ""}</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-[rgba(0,212,170,0.04)] border border-[rgba(0,212,170,0.12)] rounded-xl text-xs text-[#8B9CC8] font-mono space-y-1">
                <p>→ Payload will be AES-256-GCM encrypted in your browser</p>
                <p>→ Signed by your wallet ({`${(walletAddress ?? "").slice(0, 10)}...`})</p>
                <p>→ Written to Arkiv Braga testnet</p>
                <p>→ Your wallet is the immutable $creator</p>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  loading={createSemantic.isPending || createInstruction.isPending || createDocument.isPending}
                  className="flex-1 gap-2"
                >
                  Encrypt & Write to Arkiv
                </Button>
              </div>

              {(createSemantic.isError || createInstruction.isError || createDocument.isError) && (
                <p className="text-red-400 text-sm text-center">
                  Failed to write to Arkiv. Make sure your wallet is connected and has GLM tokens.
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      <ChainWriteProgress
        isOpen={showProgress}
        txHash={txHash}
        entityType={memoryType}
        onDone={() => {
          setTimeout(() => {
            setShowProgress(false);
            router.push("/memory");
          }, 1500);
        }}
      />
    </div>
  );
}
