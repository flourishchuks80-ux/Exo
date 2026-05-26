"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import { useExoAuth } from "@/hooks/useExoAuth";
import { useCreateSemanticMemory } from "@/hooks/useSemanticMemory";
import { TOPIC_TAXONOMY } from "@/lib/arkiv/constants";
import type { Topic } from "@/lib/arkiv/constants";
import { Shield, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

type FactData = {
  content: string;
  topic: string;
  importance: number;
  confidence: number;
  tags: string[];
  walletAddress: string;
};

function normalizeTopic(t: string): Topic {
  return (TOPIC_TAXONOMY as readonly string[]).includes(t) ? (t as Topic) : "preference";
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        close: () => void;
        expand: () => void;
      };
    };
  }
}

const topicColor: Record<string, string> = {
  profession: "#00D4AA", expertise: "#00D4AA", project: "#7C70F0",
  preference: "#F0A070", goal: "#70B0F0", background: "#8B9CC8",
  constraint: "#F07070", communication_style: "#70D4B0",
};

function ApproveContent() {
  const searchParams = useSearchParams();
  const { authenticated, ready, walletAddress, masterKey, isKeyDerived, isDerivingKey, encryptionError, hasEmbeddedWallet, initEncryption, login, getWalletClient } = useExoAuth();
  const createMemory = useCreateSemanticMemory(walletAddress, masterKey);

  const [fact, setFact] = useState<FactData | null>(null);
  const [parseError, setParseError] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [keyRetries, setKeyRetries] = useState(0);
  const [keyWaiting, setKeyWaiting] = useState(true);

  useEffect(() => {
    const raw = searchParams.get("data");
    if (!raw) { setParseError(true); return; }
    try {
      const b64 = raw
        .replace(/-/g, "+")
        .replace(/_/g, "/")
        .padEnd(raw.length + (4 - (raw.length % 4)) % 4, "=");
      const decoded = JSON.parse(atob(b64)) as FactData;
      setFact(decoded);
    } catch {
      setParseError(true);
    }
  }, [searchParams]);

  // Explicitly trigger key derivation when authenticated — the Telegram WebView
  // may not have the embedded wallet ready when useExoAuth's own effect fires.
  useEffect(() => {
    if (authenticated && !isKeyDerived && !isDerivingKey) {
      initEncryption();
    }
  }, [authenticated, isKeyDerived, isDerivingKey, initEncryption, keyRetries]);

  // Give the wallet up to 4 seconds to load before showing the key-unavailable error.
  // In Telegram WebApp, Privy's useWallets() can populate later than the auth state.
  useEffect(() => {
    if (isKeyDerived) { setKeyWaiting(false); return; }
    const t = setTimeout(() => setKeyWaiting(false), 4000);
    return () => clearTimeout(t);
  }, [isKeyDerived, keyRetries]);

  const handleSave = useCallback(async () => {
    if (!fact || !authenticated || !masterKey || status === "saving" || status === "saved") return;
    setStatus("saving");
    try {
      await createMemory.mutateAsync({
        topic: normalizeTopic(fact.topic),
        importance: Math.min(100, Math.max(1, fact.importance)),
        agentId: "claude",
        confirmed: false,
        payload: {
          content: fact.content,
          source: "ai_inferred",
          confidence: fact.confidence ?? 0.8,
          tags: Array.isArray(fact.tags) ? fact.tags : [],
          relatedKeys: [],
        },
        getWalletClient,
      });
      setStatus("saved");
      setTimeout(() => window.Telegram?.WebApp?.close(), 1500);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Unknown error");
      setStatus("error");
    }
  }, [fact, authenticated, masterKey, status, createMemory, getWalletClient]);

  const accentColor = fact ? (topicColor[fact.topic] ?? "#8B9CC8") : "#00D4AA";

  if (parseError) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
        <p className="text-[#F0F4FF] font-semibold">Invalid memory data</p>
        <p className="text-xs text-[#4F5E7A] mt-1">This link may have expired or been corrupted.</p>
      </div>
    );
  }

  if (!fact) {
    return (
      <div className="flex items-center justify-center flex-1">
        <Loader2 className="w-6 h-6 text-[#00D4AA] animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
        onLoad={() => {
          window.Telegram?.WebApp?.ready();
          window.Telegram?.WebApp?.expand();
        }}
      />

      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          <Shield className="w-4 h-4" style={{ color: accentColor }} />
        </div>
        <span className="text-sm font-semibold text-[#F0F4FF]">Save to Arkiv</span>
      </div>

      {/* Memory card */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="p-4 bg-[#121A2E] border border-[rgba(0,212,170,0.08)] rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
            >
              {fact.topic}
            </span>
            <span className="text-xs text-[#4F5E7A]">Importance {fact.importance}/100</span>
          </div>
          <p className="text-[#F0F4FF] text-sm leading-relaxed">{fact.content}</p>
          {fact.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {fact.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-[#192235] text-[#4F5E7A]">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-[#4F5E7A] text-center">
          Encrypted with your wallet key · Stored on Arkiv Braga
        </p>
      </div>

      {/* Actions */}
      <div className="mt-6 space-y-3">
        {status === "saved" ? (
          <div className="flex items-center justify-center gap-2 py-3">
            <CheckCircle className="w-5 h-5 text-[#00D4AA]" />
            <span className="text-sm font-medium text-[#00D4AA]">Saved to your memory</span>
          </div>
        ) : status === "error" ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs">{errorMsg || "Failed to save. Please try again."}</span>
            </div>
            <button
              onClick={() => setStatus("idle")}
              className="w-full py-3 rounded-xl text-sm font-semibold text-[#F0F4FF] bg-[#192235] border border-[rgba(0,212,170,0.2)]"
            >
              Retry
            </button>
          </div>
        ) : !ready ? (
          <div className="flex items-center justify-center py-3">
            <Loader2 className="w-5 h-5 text-[#4F5E7A] animate-spin" />
          </div>
        ) : !authenticated ? (
          <button
            onClick={() => login?.()}
            className="w-full py-3 rounded-xl text-sm font-semibold text-[#060810] transition-opacity active:opacity-80"
            style={{ backgroundColor: accentColor }}
          >
            Connect Wallet to Save
          </button>
        ) : isDerivingKey || (keyWaiting && !isKeyDerived) ? (
          <div className="flex flex-col items-center gap-2 py-3">
            <span className="flex items-center gap-2 text-sm text-[#8B9CC8]">
              <Loader2 className="w-4 h-4 animate-spin text-[#00D4AA]" />
              {isDerivingKey ? "Preparing encryption key…" : "Loading wallet…"}
            </span>
            <p className="text-[10px] text-[#4F5E7A] text-center">
              {isDerivingKey ? "Deriving your sovereign key from wallet signature" : "Connecting your embedded wallet"}
            </p>
          </div>
        ) : !isKeyDerived ? (
          <div className="space-y-2">
            {!hasEmbeddedWallet ? (
              <div className="flex items-start gap-2 text-[#F0A070] text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>No embedded wallet found. Open the main Exo app first to set up your wallet, then try again.</span>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-[#F0A070] text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{encryptionError ?? "Encryption key unavailable. Tap retry to initialise."}</span>
              </div>
            )}
            <button
              onClick={() => { setKeyWaiting(true); setKeyRetries((n) => n + 1); }}
              className="w-full py-3 rounded-xl text-sm font-semibold text-[#F0F4FF] bg-[#192235] border border-[rgba(0,212,170,0.2)]"
            >
              Retry Key Setup
            </button>
          </div>
        ) : (
          <button
            onClick={handleSave}
            disabled={status === "saving"}
            className="w-full py-3 rounded-xl text-sm font-semibold text-[#060810] transition-opacity active:opacity-80 disabled:opacity-60"
            style={{ backgroundColor: accentColor }}
          >
            {status === "saving" ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Encrypting &amp; signing…
              </span>
            ) : (
              "Encrypt & Save to Arkiv"
            )}
          </button>
        )}
        <button
          onClick={() => window.Telegram?.WebApp?.close()}
          className="w-full py-2 text-xs text-[#4F5E7A]"
        >
          Dismiss
        </button>
      </div>
    </>
  );
}

export default function TelegramApprovePage() {
  return (
    <div className="min-h-screen bg-[#060810] flex flex-col p-5">
      <Suspense
        fallback={
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="w-6 h-6 text-[#00D4AA] animate-spin" />
          </div>
        }
      >
        <ApproveContent />
      </Suspense>
    </div>
  );
}
