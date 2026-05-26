"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useExoAuth } from "@/hooks/useExoAuth";
import { useImportContext } from "@/contexts/ImportContext";
import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import { ChainWriteProgress } from "@/components/ui/ChainWriteProgress";
import { guessTopic } from "@/lib/ai/memoryExtractor";
import { Upload, FileText, Link2, MessageSquare, CheckCircle, Circle, Loader2, ChevronRight, ArrowLeft, Zap } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ImportMode = "chatgpt" | "text" | "url" | "questionnaire";

interface ExtractedFact {
  content: string;
  topic: string;
  importance: number;
  selected: boolean;
}

const QUESTIONNAIRE = [
  { id: "role", question: "What is your current professional role or title?" },
  { id: "goals", question: "What are your top 3 goals for the next 6 months?" },
  { id: "skills", question: "What are your strongest technical or professional skills?" },
  { id: "projects", question: "What projects are you currently working on?" },
  { id: "tools", question: "What tools and technologies do you use daily?" },
  { id: "learning", question: "What are you currently learning or studying?" },
  { id: "challenges", question: "What is your biggest current challenge or blocker?" },
  { id: "preferences", question: "How do you prefer to communicate? (e.g., concise, detailed, with examples)" },
  { id: "timezone", question: "What timezone do you work in and what are your typical working hours?" },
  { id: "writing_style", question: "How would you describe your writing style and tone?" },
  { id: "expertise", question: "What topics can you speak authoritatively about?" },
  { id: "values", question: "What professional values or principles guide your work?" },
  { id: "avoid", question: "What should AI assistants avoid when working with you?" },
  { id: "background", question: "What is your educational or career background?" },
  { id: "output_format", question: "What format do you prefer for AI responses? (e.g., bullet points, prose, code-first)" },
  { id: "context", question: "What context should AI always know about your work environment?" },
  { id: "deadlines", question: "Do you have any important upcoming deadlines or milestones?" },
  { id: "team", question: "Do you work solo or with a team? Describe your collaboration style." },
  { id: "memory_focus", question: "What is the most important thing for your AI to always remember about you?" },
  { id: "custom", question: "Anything else you'd like your AI to know?" },
];

export default function ImportPage() {
  const router = useRouter();
  const { authenticated, ready, walletAddress, masterKey, getWalletClient } = useExoAuth();
  const { startImport } = useImportContext();

  useEffect(() => {
    if (ready && !authenticated) router.push("/");
  }, [ready, authenticated, router]);

  const [mode, setMode] = useState<ImportMode | null>(null);
  const [step, setStep] = useState<"input" | "review" | "writing" | "done">("input");
  const [facts, setFacts] = useState<ExtractedFact[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [questAnswers, setQuestAnswers] = useState<Record<string, string>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [txHash, setTxHash] = useState<string | undefined>();
  const [showProgress, setShowProgress] = useState(false);
  const [writtenCount, setWrittenCount] = useState(0);
  const [autoApprove, setAutoApprove] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsExtracting(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      // ChatGPT export format: conversations array
      const conversations = parsed.conversations ?? parsed ?? [];
      const conversationText = conversations
        .slice(0, 20) // limit to first 20 conversations
        .map((conv: { mapping?: Record<string, { message?: { content?: { parts?: string[] }; author?: { role?: string } } }> }) => {
          const messages = Object.values(conv.mapping ?? {})
            .filter((node: { message?: { content?: { parts?: string[] } } }) => node.message?.content?.parts)
            .map((node: { message?: { content?: { parts?: string[] }; author?: { role?: string } } }) => `${node.message?.author?.role}: ${node.message?.content?.parts?.join("")}`)
            .join("\n");
          return messages;
        })
        .join("\n\n---\n\n");

      await extractFacts(conversationText.slice(0, 8000));
    } catch {
      alert("Failed to parse ChatGPT export. Make sure you uploaded the conversations.json file.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleUrlExtract = async () => {
    if (!urlInput.trim()) return;
    setIsExtracting(true);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput }),
      });
      const data = await res.json();
      await extractFacts(data.text ?? "");
    } catch {
      alert("Failed to extract content from URL.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleTextExtract = async () => {
    if (!textInput.trim()) return;
    setIsExtracting(true);
    try {
      await extractFacts(textInput);
    } finally {
      setIsExtracting(false);
    }
  };

  const extractFacts = async (text: string) => {
    const res = await fetch("/api/extract-facts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    const extracted: ExtractedFact[] = (data.facts ?? []).map((f: { content: string; topic?: string; importance?: number }) => ({
      content: f.content,
      topic: (f.topic as ReturnType<typeof guessTopic>) ?? guessTopic(f.content),
      importance: f.importance ?? 65,
      selected: true,
    }));
    setFacts(extracted);
    setStep("review");
  };

  const handleQuestionnaireComplete = async () => {
    setIsExtracting(true);
    try {
      const text = QUESTIONNAIRE.map((q) => `Q: ${q.question}\nA: ${questAnswers[q.id] ?? ""}`)
        .filter((_, i) => questAnswers[QUESTIONNAIRE[i].id])
        .join("\n\n");
      await extractFacts(text);
    } finally {
      setIsExtracting(false);
    }
  };

  const modeLabel: Record<ImportMode, string> = {
    chatgpt: "ChatGPT Import",
    text: "Text Import",
    url: "URL Import",
    questionnaire: "20-Question Setup",
  };

  const handleBulkWrite = async () => {
    const selected = facts.filter((f) => f.selected);
    if (!selected.length || !masterKey) return;

    if (autoApprove) {
      startImport(selected, modeLabel[mode ?? "text"]);
      router.push("/memory");
      return;
    }

    // Manual path: full-screen overlay, stays on page
    setStep("writing");
    setShowProgress(true);

    const wc = await getWalletClient();
    if (!wc) { setStep("review"); return; }

    const { createSemanticMemory } = await import("@/lib/arkiv/entities");
    const { encryptPayload } = await import("@/lib/crypto/encryption");
    const key = masterKey as CryptoKey;

    let lastTx = "";
    for (const fact of selected) {
      try {
        const encryptedPayload = await encryptPayload(
          { content: fact.content, source: "user_stated" as const, confidence: 0.85, tags: [], relatedKeys: [] },
          key
        );
        const result = await createSemanticMemory(wc, {
          topic: fact.topic as ReturnType<typeof guessTopic>,
          importance: fact.importance,
          agentId: "claude",
          confirmed: true,
          encryptedPayload,
        });
        lastTx = result.txHash;
        setWrittenCount((c) => c + 1);
      } catch {
        // continue writing remaining facts
      }
    }
    setTxHash(lastTx);
    setStep("done");
  };

  const modeCards: { id: ImportMode; icon: React.ReactNode; label: string; description: string }[] = [
    {
      id: "chatgpt",
      icon: <Upload className="w-5 h-5" />,
      label: "ChatGPT Export",
      description: "Upload your conversations.json from OpenAI data export",
    },
    {
      id: "text",
      icon: <FileText className="w-5 h-5" />,
      label: "Paste Text",
      description: "Paste any text — notes, bios, documents — and extract facts",
    },
    {
      id: "url",
      icon: <Link2 className="w-5 h-5" />,
      label: "Import from URL",
      description: "Extract content from a webpage, blog post, or profile",
    },
    {
      id: "questionnaire",
      icon: <MessageSquare className="w-5 h-5" />,
      label: "20-Question Setup",
      description: "Answer 20 questions to seed your sovereign memory from scratch",
    },
  ];

  return (
    <div className="min-h-screen bg-[#060810]">
      <TopBar />
      <Sidebar />

      <main className="pt-14 lg:pl-56">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-8">
            {mode && step === "input" && (
              <button
                onClick={() => setMode(null)}
                className="p-1.5 text-[#4F5E7A] hover:text-[#8B9CC8] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-[#F0F4FF]">Import Memory</h1>
              <p className="text-sm text-[#8B9CC8] mt-1">
                Migrate your AI context from anywhere into sovereign on-chain memory
              </p>
            </div>
          </div>

          {/* Mode selection */}
          {!mode && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {modeCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => setMode(card.id)}
                  className="p-5 bg-[#121A2E] border border-[rgba(0,212,170,0.08)] rounded-xl text-left hover:border-[rgba(0,212,170,0.25)] transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[rgba(0,212,170,0.08)] border border-[rgba(0,212,170,0.15)] flex items-center justify-center text-[#00D4AA] mb-4 group-hover:bg-[rgba(0,212,170,0.12)] transition-colors">
                    {card.icon}
                  </div>
                  <p className="text-sm font-semibold text-[#F0F4FF] mb-1">{card.label}</p>
                  <p className="text-xs text-[#4F5E7A]">{card.description}</p>
                </button>
              ))}
            </div>
          )}

          {/* ChatGPT import */}
          {mode === "chatgpt" && step === "input" && (
            <div className="space-y-6">
              <div className="p-5 bg-[#121A2E] border border-[rgba(0,212,170,0.08)] rounded-xl">
                <p className="text-sm font-medium text-[#F0F4FF] mb-2">How to get your ChatGPT export</p>
                <ol className="text-xs text-[#8B9CC8] space-y-1 list-decimal list-inside">
                  <li>Go to ChatGPT → Settings → Data Controls</li>
                  <li>Click "Export data" and confirm via email</li>
                  <li>Download the ZIP and extract conversations.json</li>
                  <li>Upload it here</li>
                </ol>
              </div>
              <div
                className="border-2 border-dashed border-[rgba(0,212,170,0.2)] rounded-xl p-12 text-center cursor-pointer hover:border-[rgba(0,212,170,0.4)] transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                {isExtracting ? (
                  <Loader2 className="w-8 h-8 text-[#00D4AA] animate-spin mx-auto mb-3" />
                ) : (
                  <Upload className="w-8 h-8 text-[#4F5E7A] mx-auto mb-3" />
                )}
                <p className="text-sm text-[#8B9CC8]">
                  {isExtracting ? "Extracting facts from your conversations..." : "Click to upload conversations.json"}
                </p>
                <p className="text-xs text-[#4F5E7A] mt-1">JSON files only</p>
                <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFileUpload} />
              </div>
            </div>
          )}

          {/* Text import */}
          {mode === "text" && step === "input" && (
            <div className="space-y-4">
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste any text here — your bio, notes, past conversations, work history, preferences..."
                rows={12}
                className="w-full px-4 py-3 bg-[#121A2E] border border-[rgba(0,212,170,0.12)] rounded-xl text-sm text-[#F0F4FF] placeholder-[#4F5E7A] focus:outline-none focus:border-[rgba(0,212,170,0.35)] resize-none transition-colors"
              />
              <Button
                variant="primary"
                className="w-full"
                disabled={!textInput.trim() || isExtracting}
                loading={isExtracting}
                onClick={handleTextExtract}
              >
                Extract Facts from Text
              </Button>
            </div>
          )}

          {/* URL import */}
          {mode === "url" && step === "input" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#8B9CC8] mb-2 uppercase tracking-wider">URL</label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/about-me"
                  className="w-full px-3 py-2.5 bg-[#121A2E] border border-[rgba(0,212,170,0.12)] rounded-xl text-sm text-[#F0F4FF] placeholder-[#4F5E7A] focus:outline-none focus:border-[rgba(0,212,170,0.35)] transition-colors"
                />
              </div>
              <Button
                variant="primary"
                className="w-full"
                disabled={!urlInput.trim() || isExtracting}
                loading={isExtracting}
                onClick={handleUrlExtract}
              >
                Extract & Import
              </Button>
            </div>
          )}

          {/* Questionnaire */}
          {mode === "questionnaire" && step === "input" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs text-[#4F5E7A] font-mono">
                <span>Question {currentQ + 1} of {QUESTIONNAIRE.length}</span>
                <span>{Math.round(((currentQ) / QUESTIONNAIRE.length) * 100)}% complete</span>
              </div>
              <div className="w-full bg-[#192235] rounded-full h-1">
                <div
                  className="bg-[#00D4AA] h-1 rounded-full transition-all"
                  style={{ width: `${(currentQ / QUESTIONNAIRE.length) * 100}%` }}
                />
              </div>

              <div className="p-6 bg-[#121A2E] border border-[rgba(0,212,170,0.08)] rounded-xl">
                <p className="text-base font-medium text-[#F0F4FF] mb-4">
                  {QUESTIONNAIRE[currentQ].question}
                </p>
                <textarea
                  key={currentQ}
                  value={questAnswers[QUESTIONNAIRE[currentQ].id] ?? ""}
                  onChange={(e) =>
                    setQuestAnswers((prev) => ({ ...prev, [QUESTIONNAIRE[currentQ].id]: e.target.value }))
                  }
                  placeholder="Your answer..."
                  rows={4}
                  className="w-full px-3 py-2.5 bg-[#192235] border border-[rgba(0,212,170,0.12)] rounded-xl text-sm text-[#F0F4FF] placeholder-[#4F5E7A] focus:outline-none focus:border-[rgba(0,212,170,0.35)] resize-none transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.metaKey) {
                      if (currentQ < QUESTIONNAIRE.length - 1) setCurrentQ((c) => c + 1);
                    }
                  }}
                />
              </div>

              <div className="flex gap-3">
                {currentQ > 0 && (
                  <Button variant="secondary" onClick={() => setCurrentQ((c) => c - 1)}>
                    Back
                  </Button>
                )}
                {currentQ < QUESTIONNAIRE.length - 1 ? (
                  <Button
                    variant="primary"
                    className="flex-1 gap-1.5"
                    onClick={() => setCurrentQ((c) => c + 1)}
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    className="flex-1"
                    disabled={isExtracting}
                    loading={isExtracting}
                    onClick={handleQuestionnaireComplete}
                  >
                    Extract & Review Memories
                  </Button>
                )}
              </div>
              <p className="text-[10px] text-[#4F5E7A] text-center font-mono">
                Cmd+Enter to advance · Skip any question
              </p>
            </div>
          )}

          {/* Review step */}
          {step === "review" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#F0F4FF]">
                    {facts.filter((f) => f.selected).length} of {facts.length} facts selected
                  </p>
                  <p className="text-xs text-[#4F5E7A] mt-0.5">
                    Review and select which memories to import
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFacts((f) => f.map((fact) => ({ ...fact, selected: true })))}
                    className="text-xs text-[#00D4AA] hover:underline"
                  >
                    Select all
                  </button>
                  <span className="text-[#4F5E7A]">·</span>
                  <button
                    onClick={() => setFacts((f) => f.map((fact) => ({ ...fact, selected: false })))}
                    className="text-xs text-[#4F5E7A] hover:text-[#8B9CC8]"
                  >
                    Deselect all
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {facts.map((fact, i) => (
                  <div
                    key={i}
                    onClick={() =>
                      setFacts((prev) =>
                        prev.map((f, j) => (j === i ? { ...f, selected: !f.selected } : f))
                      )
                    }
                    className={cn(
                      "p-4 rounded-xl border cursor-pointer transition-all",
                      fact.selected
                        ? "bg-[#121A2E] border-[rgba(0,212,170,0.25)]"
                        : "bg-[#0C1120] border-[rgba(255,255,255,0.04)] opacity-50"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0">
                        {fact.selected ? (
                          <CheckCircle className="w-4 h-4 text-[#00D4AA]" />
                        ) : (
                          <Circle className="w-4 h-4 text-[#4F5E7A]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#F0F4FF] leading-relaxed">{fact.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] font-mono text-[#8B9CC8] bg-[#192235] px-2 py-0.5 rounded-full">
                            {fact.topic}
                          </span>
                          <span className="text-[10px] text-[#4F5E7A]">
                            importance {fact.importance}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Auto-approve toggle */}
              <button
                onClick={() => setAutoApprove((v) => !v)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all",
                  autoApprove
                    ? "bg-[rgba(0,212,170,0.06)] border-[rgba(0,212,170,0.2)]"
                    : "bg-[#0C1120] border-[rgba(255,255,255,0.06)]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Zap className={cn("w-4 h-4", autoApprove ? "text-[#00D4AA]" : "text-[#4F5E7A]")} />
                  <div className="text-left">
                    <p className={cn("text-xs font-semibold", autoApprove ? "text-[#F0F4FF]" : "text-[#8B9CC8]")}>
                      Auto-approve all transactions
                    </p>
                    <p className="text-[10px] text-[#4F5E7A] mt-0.5">
                      {autoApprove
                        ? "Runs in background — you can close this page"
                        : "You will confirm each transaction manually"}
                    </p>
                  </div>
                </div>
                <div
                  className={cn(
                    "w-9 h-5 rounded-full transition-colors relative flex-shrink-0",
                    autoApprove ? "bg-[#00D4AA]" : "bg-[#192235]"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                      autoApprove ? "translate-x-[18px]" : "translate-x-0.5"
                    )}
                  />
                </div>
              </button>

              <div className="flex gap-3 pt-1">
                <Button variant="secondary" onClick={() => setStep("input")}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  disabled={facts.filter((f) => f.selected).length === 0}
                  onClick={handleBulkWrite}
                >
                  {autoApprove
                    ? `Start Import in Background (${facts.filter((f) => f.selected).length})`
                    : `Write ${facts.filter((f) => f.selected).length} Memories to Arkiv`}
                </Button>
              </div>
            </div>
          )}

          {/* Done step */}
          {step === "done" && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-[rgba(0,212,170,0.1)] border border-[rgba(0,212,170,0.2)] flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-[#00D4AA]" />
              </div>
              <h2 className="text-xl font-bold text-[#F0F4FF] mb-2">Import Complete</h2>
              <p className="text-sm text-[#8B9CC8] mb-6">
                {writtenCount} memories written to Arkiv and encrypted with your master key.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="secondary" onClick={() => router.push("/memory")}>
                  View Memory
                </Button>
                <Button variant="primary" onClick={() => router.push("/chat")}>
                  Chat with Your AI
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <ChainWriteProgress
        isOpen={showProgress && step === "writing"}
        txHash={txHash}
        entityType="memory"
        onDone={() => setShowProgress(false)}
      />
    </div>
  );
}
