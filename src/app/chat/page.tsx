"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useExoAuth } from "@/hooks/useExoAuth";
import { useSemanticMemory } from "@/hooks/useSemanticMemory";
import { useInstructions } from "@/hooks/useInstructions";
import { useEpisodicMemory } from "@/hooks/useEpisodicMemory";
import { useDocuments } from "@/hooks/useDocuments";
import { useSaveEpisodicMemory } from "@/hooks/useEpisodicMemory";
import { useCreateSemanticMemory } from "@/hooks/useSemanticMemory";
import { TopBar } from "@/components/layout/TopBar";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ContextLoader } from "@/components/chat/ContextLoader";
import { MemorySourcePanel } from "@/components/chat/MemorySourcePanel";
import { MemorySuggestion } from "@/components/chat/MemorySuggestion";
import { ModelSwitcher, type ModelId } from "@/components/chat/ModelSwitcher";
import { Button } from "@/components/ui/Button";
import { buildSystemPrompt, buildDemoSystemPrompt } from "@/lib/ai/systemPrompt";
import { extractMemorySources } from "@/lib/ai/contextBuilder";
import { generateSessionSummary } from "@/lib/ai/memoryExtractor";
import { guessTopic } from "@/lib/ai/memoryExtractor";
import type { ExoContext } from "@/lib/ai/contextBuilder";
import { Send, Loader2, ChevronRight, ChevronLeft, Brain, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Message {
  role: "user" | "assistant";
  content: string;
  id: string;
}

interface MemorySource {
  entityKey: string;
  type: string;
  topic?: string;
  preview: string;
}

function ChatContent() {
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";
  const { authenticated, walletAddress, masterKey, getWalletClient } = useExoAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [contextStatus, setContextStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [exoContext, setExoContext] = useState<ExoContext | null>(null);
  const [memorySources, setMemorySources] = useState<MemorySource[]>([]);
  const [activeModel, setActiveModel] = useState<ModelId>("gemini");
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [showPanel, setShowPanel] = useState(true);
  const [showMobilePanel, setShowMobilePanel] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(`0x${Date.now().toString(16)}`);

  const { data: semanticMemories } = useSemanticMemory(
    (!isDemo && authenticated) ? walletAddress : null,
    masterKey
  );
  const { data: instructions } = useInstructions(
    (!isDemo && authenticated) ? walletAddress : null,
    masterKey
  );
  const { data: episodes } = useEpisodicMemory(
    (!isDemo && authenticated) ? walletAddress : null,
    masterKey
  );
  const { data: documents } = useDocuments(
    (!isDemo && authenticated) ? walletAddress : null,
    masterKey
  );

  const saveEpisodic = useSaveEpisodicMemory(walletAddress, masterKey);
  const saveSemantic = useCreateSemanticMemory(walletAddress, masterKey);

  // Build context when memory loads
  useEffect(() => {
    if (isDemo) {
      setContextStatus("ready");
      return;
    }

    if (!authenticated || !walletAddress) return;

    setContextStatus("loading");
    // Context is ready when any data loads
    if (semanticMemories !== undefined || instructions !== undefined) {
      const ctx: ExoContext = {
        instructions: (instructions ?? []).filter((i) => i.isActive),
        semanticMemories: (semanticMemories ?? []).filter((m) => m.importance >= 40),
        recentEpisodes: (episodes ?? []).slice(0, 5),
        documents: (documents ?? []),
        userAddress: walletAddress,
      };
      setExoContext(ctx);
      setContextStatus("ready");
    }
  }, [isDemo, authenticated, walletAddress, semanticMemories, instructions, episodes, documents]);

  const getSystemPrompt = useCallback((): string => {
    if (isDemo) return buildDemoSystemPrompt();
    if (exoContext) return buildSystemPrompt(exoContext);
    return "You are Exo, a helpful AI assistant. The user has not yet set up their sovereign memory.";
  }, [isDemo, exoContext]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const userMsg: Message = { role: "user", content: trimmed, id: `u-${Date.now()}` };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);
    setShowSuggestion(false);

    const assistantId = `a-${Date.now()}`;
    let assistantContent = "";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          systemPrompt: getSystemPrompt(),
          model: activeModel,
        }),
      });

      if (!response.ok) throw new Error("API error");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", id: assistantId },
      ]);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: assistantContent } : m))
        );
      }

      // Update memory sources
      if (exoContext && assistantContent) {
        const sources = extractMemorySources(exoContext, assistantContent);
        setMemorySources(sources);

        // Extract memory suggestion from response
        const suggestionMatch = assistantContent.match(
          /(?:save|remember|note).*?["']([^"']{20,150})["']/i
        );
        if (suggestionMatch && authenticated) {
          setSuggestion(suggestionMatch[1]);
          setShowSuggestion(true);
        }
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Error: Could not reach the AI. Please try again." }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }, [input, messages, isStreaming, getSystemPrompt, activeModel, exoContext, authenticated]);

  const handleSaveSuggestion = async () => {
    if (!suggestion || !authenticated) return;
    try {
      await saveSemantic.mutateAsync({
        topic: guessTopic(suggestion),
        importance: 65,
        agentId: activeModel,
        confirmed: false,
        payload: {
          content: suggestion,
          source: "ai_inferred",
          confidence: 0.8,
          tags: [],
          relatedKeys: [],
        },
        getWalletClient,
      });
      setShowSuggestion(false);
    } catch (err) {
      console.error("Failed to save suggestion:", err);
    }
  };

  const handleSessionEnd = async () => {
    if (!authenticated || messages.length < 2) return;
    try {
      const summary = await generateSessionSummary(
        messages.map((m) => ({ role: m.role, content: m.content }))
      );
      await saveEpisodic.mutateAsync({
        agentId: activeModel,
        sessionId: sessionId.current,
        importance: 70,
        topic: summary.topic,
        payload: {
          summary: summary.summary,
          keyDecisions: summary.keyDecisions,
          openThreads: summary.openThreads,
          linkedSemanticKeys: memorySources.filter((s) => s.type === "semantic").map((s) => s.entityKey),
        },
        getWalletClient,
      });
    } catch (err) {
      console.error("Failed to save session:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#060810]">
      <TopBar />

      <div className="flex flex-1 overflow-hidden pt-14">
        {/* Chat area */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Chat header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(0,212,170,0.08)] bg-[#0C1120]">
            <div className="flex items-center gap-3">
              <ModelSwitcher value={activeModel} onChange={setActiveModel} />
              {isDemo && (
                <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                  DEMO MODE
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {authenticated && messages.length >= 2 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSessionEnd}
                  className="text-xs"
                >
                  Save Session
                </Button>
              )}
              {/* Mobile sources chip */}
              {memorySources.length > 0 && (
                <button
                  onClick={() => setShowMobilePanel(true)}
                  className="lg:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(0,212,170,0.1)] text-[#00D4AA] text-xs font-medium"
                >
                  <Brain className="w-3.5 h-3.5" />
                  {memorySources.length}
                </button>
              )}
              {/* Desktop panel toggle */}
              <button
                onClick={() => setShowPanel(!showPanel)}
                className="hidden lg:block p-1.5 text-[#4F5E7A] hover:text-[#8B9CC8] transition-colors"
              >
                {showPanel ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            <ContextLoader
              status={contextStatus}
              semanticCount={semanticMemories?.length ?? 0}
              instructionCount={instructions?.length ?? 0}
              episodicCount={episodes?.length ?? 0}
            />

            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <div className="w-12 h-12 rounded-2xl bg-[rgba(0,212,170,0.1)] border border-[rgba(0,212,170,0.2)] flex items-center justify-center mb-4">
                  <span className="text-[#00D4AA] font-bold font-mono">EX</span>
                </div>
                <h3 className="text-lg font-bold text-[#F0F4FF] mb-2">
                  {isDemo ? "Demo: Riku's AI Memory" : "Your Sovereign AI"}
                </h3>
                <p className="text-sm text-[#8B9CC8] max-w-sm">
                  {isDemo
                    ? "This AI knows Riku Tanaka's complete context from Arkiv. Try asking what he's working on."
                    : contextStatus === "ready"
                    ? `Your context is loaded. ${semanticMemories?.length ?? 0} facts, ${instructions?.length ?? 0} instructions ready.`
                    : "Connect your wallet to load your sovereign memory."}
                </p>
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {["What am I working on?", "What are my standing instructions?", "Summarize my background"].map((q) => (
                    <button
                      key={q}
                      onClick={() => { setInput(q); }}
                      className="px-3 py-1.5 text-xs text-[#8B9CC8] bg-[#192235] border border-[rgba(0,212,170,0.12)] rounded-lg hover:border-[rgba(0,212,170,0.25)] hover:text-[#F0F4FF] transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                role={msg.role}
                content={msg.content}
                isStreaming={isStreaming && i === messages.length - 1 && msg.role === "assistant"}
              />
            ))}

            {showSuggestion && authenticated && (
              <MemorySuggestion
                suggestion={suggestion}
                onSave={handleSaveSuggestion}
                onDismiss={() => setShowSuggestion(false)}
                saving={saveSemantic.isPending}
              />
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-[rgba(0,212,170,0.08)] bg-[#0C1120]">
            <div className="flex gap-3 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Message your AI..."
                rows={1}
                className="flex-1 px-4 py-3 bg-[#192235] border border-[rgba(0,212,170,0.12)] rounded-xl text-sm text-[#F0F4FF] placeholder-[#4F5E7A] focus:outline-none focus:border-[rgba(0,212,170,0.35)] resize-none transition-colors"
                style={{ minHeight: "44px", maxHeight: "120px" }}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isStreaming}
                variant="primary"
                className="h-11 w-11 p-0 flex-shrink-0"
              >
                {isStreaming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-[10px] text-[#4F5E7A] text-center mt-2 font-mono">
              Shift+Enter for new line · Context from Arkiv Braga · Encrypted client-side
            </p>
          </div>
        </div>

        {/* Memory sources panel */}
        {showPanel && (
          <div className="w-72 flex-shrink-0 hidden lg:block">
            <MemorySourcePanel
              sources={memorySources}
              instructionCount={
                isDemo ? 4 : (instructions?.filter((i) => i.isActive).length ?? 0)
              }
            />
          </div>
        )}
      </div>

      {/* Mobile memory sources bottom sheet */}
      {showMobilePanel && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowMobilePanel(false)}
          />
          <div className="relative bg-[#060810] rounded-t-2xl max-h-[70vh] overflow-y-auto border-t border-[rgba(0,212,170,0.1)]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(0,212,170,0.06)]">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#00D4AA]" />
                <span className="text-sm font-semibold text-[#F0F4FF]">Memory Sources</span>
              </div>
              <button
                onClick={() => setShowMobilePanel(false)}
                className="p-1 text-[#4F5E7A] hover:text-[#8B9CC8] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <MemorySourcePanel
              sources={memorySources}
              instructionCount={isDemo ? 4 : (instructions?.filter((i) => i.isActive).length ?? 0)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#060810] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#00D4AA] animate-spin" />
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
