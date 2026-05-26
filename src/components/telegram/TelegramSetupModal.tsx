"use client";

import { useState, useCallback } from "react";
import { Send, X, ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

interface Props {
  walletAddress: string | null;
  onConnected: (username: string) => void;
  onDismiss: () => void;
}

const STEPS = [
  {
    n: 1,
    text: "Open Telegram and search for ",
    link: { label: "@BotFather", href: "https://t.me/BotFather" },
    detail: "BotFather is Telegram's official bot manager.",
  },
  {
    n: 2,
    text: 'Send /newbot and follow the prompts to name your bot',
    detail: "You'll choose a display name and a unique @username ending in \"bot\".",
  },
  {
    n: 3,
    text: "BotFather will send you a token. Copy it.",
    detail: "It looks like: 123456789:ABCDEFabcdef...",
  },
  {
    n: 4,
    text: "Paste your token below and click Connect",
    detail: null,
    isAction: true,
  },
];

export function TelegramSetupModal({ walletAddress, onConnected, onDismiss }: Props) {
  const [botToken, setBotToken] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleConnect = useCallback(async () => {
    if (!botToken.trim() || !walletAddress) return;
    setConnecting(true);
    setError("");
    try {
      const res = await fetch("/api/telegram/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botToken: botToken.trim(), walletAddress }),
      });
      const data = await res.json() as { ok?: boolean; username?: string; error?: string };
      if (!data.ok || !data.username) throw new Error(data.error ?? "Connection failed");
      localStorage.setItem("exo:telegram:username", data.username);
      setSuccess(true);
      setTimeout(() => onConnected(data.username!), 900);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection failed");
    } finally {
      setConnecting(false);
    }
  }, [botToken, walletAddress, onConnected]);

  const handleDismiss = useCallback(() => {
    localStorage.setItem("exo:telegram:onboarding:dismissed", "1");
    onDismiss();
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in px-4">
      <div className="bg-[#121A2E] border border-[rgba(0,212,170,0.2)] rounded-2xl p-8 w-full max-w-lg shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[rgba(0,212,170,0.1)] border border-[rgba(0,212,170,0.2)] flex items-center justify-center">
              <Send className="w-4 h-4 text-[#00D4AA]" />
            </div>
            <h2 className="text-base font-bold text-[#F0F4FF]">Connect Your Telegram Bot</h2>
          </div>
          <button
            onClick={handleDismiss}
            className="text-[#4F5E7A] hover:text-[#8B9CC8] transition-colors p-1 -mr-1 -mt-1"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-[#8B9CC8] mb-6 pl-[42px]">
          Chat with your AI on Telegram. Save memories to the chain with one tap.
        </p>

        {/* Steps */}
        <div className="space-y-4 mb-6">
          {STEPS.map((step) => (
            <div key={step.n} className="flex gap-3">
              {/* Number badge */}
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-mono font-semibold transition-colors",
                  step.isAction
                    ? "bg-[rgba(0,212,170,0.12)] border border-[rgba(0,212,170,0.4)] text-[#00D4AA]"
                    : "bg-[#192235] border border-[rgba(255,255,255,0.06)] text-[#4F5E7A]"
                )}
              >
                {success && step.isAction ? <Check className="w-3 h-3" /> : step.n}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#F0F4FF] leading-snug">
                  {step.text}
                  {"link" in step && step.link && (
                    <a
                      href={step.link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00D4AA] hover:text-[#00FFD1] inline-flex items-center gap-0.5 transition-colors"
                    >
                      {step.link.label}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </p>
                {step.detail && (
                  <p className="text-xs text-[#4F5E7A] mt-0.5 font-mono">{step.detail}</p>
                )}

                {/* Token input lives inside step 4 */}
                {step.isAction && (
                  <div className="mt-3 space-y-2">
                    <input
                      type="password"
                      value={botToken}
                      onChange={(e) => { setBotToken(e.target.value); setError(""); }}
                      onKeyDown={(e) => { if (e.key === "Enter") handleConnect(); }}
                      placeholder="123456789:ABCDEFabcdef..."
                      disabled={connecting || success}
                      className="w-full px-3 py-2 bg-[#060810] border border-[rgba(0,212,170,0.2)] rounded-lg text-sm text-[#F0F4FF] font-mono placeholder-[#4F5E7A] focus:outline-none focus:border-[rgba(0,212,170,0.5)] transition-colors disabled:opacity-50"
                    />
                    {error && (
                      <p className="text-xs text-red-400">{error}</p>
                    )}
                    {success && (
                      <p className="text-xs text-[#00D4AA]">Bot connected! Opening your dashboard...</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[rgba(255,255,255,0.04)]">
          <Button variant="ghost" size="sm" onClick={handleDismiss} disabled={connecting || success}>
            Skip for now
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleConnect}
            disabled={!botToken.trim() || connecting || !walletAddress || success}
            loading={connecting}
            className="gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            {success ? "Connected!" : "Connect Bot"}
          </Button>
        </div>

        {!walletAddress && (
          <p className="text-xs text-[#4F5E7A] text-center mt-3">
            Waiting for wallet connection...
          </p>
        )}
      </div>
    </div>
  );
}
