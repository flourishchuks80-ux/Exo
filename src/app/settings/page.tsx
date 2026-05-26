"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useExoAuth } from "@/hooks/useExoAuth";
import { useMemoryHealth } from "@/hooks/useMemoryHealth";
import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import { Shield, Key, Wallet, ExternalLink, Copy, Check, LogOut, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SettingItem {
  label: string;
  value: string;
  mono?: boolean;
  status?: "active" | "warning" | "inactive";
  action?: { label: string; onClick: () => void; icon?: React.ReactNode } | null;
  actionId?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { authenticated, ready, walletAddress, masterKey, logout } = useExoAuth();
  const { data: health } = useMemoryHealth(walletAddress);

  useEffect(() => {
    if (ready && !authenticated) router.push("/");
  }, [ready, authenticated, router]);

  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const sections: { title: string; icon: React.ReactNode; items: SettingItem[] }[] = [
    {
      title: "Wallet & Identity",
      icon: <Wallet className="w-4 h-4" />,
      items: [
        {
          label: "Connected Address",
          value: walletAddress ?? "Not connected",
          mono: true,
          action: walletAddress
            ? { label: "Copy", onClick: () => copy(walletAddress, "address") }
            : null,
          actionId: "address",
        },
        {
          label: "Network",
          value: "Arkiv Braga Testnet (Chain ID: 60138453102)",
          mono: true,
        },
        {
          label: "Explorer",
          value: "explorer.braga.hoodi.arkiv.network",
          action: walletAddress
            ? {
                label: "View wallet",
                onClick: () => window.open(`https://explorer.braga.hoodi.arkiv.network/address/${walletAddress}`, "_blank"),
                icon: <ExternalLink className="w-3 h-3" />,
              }
            : null,
          actionId: "explorer",
        },
      ],
    },
    {
      title: "Encryption",
      icon: <Key className="w-4 h-4" />,
      items: [
        {
          label: "Encryption Status",
          value: masterKey ? "Active — AES-256-GCM master key in memory" : "No key (connect wallet)",
          status: masterKey ? "active" : "inactive",
        },
        {
          label: "Key Derivation",
          value: "HKDF(wallet signature, address salt) — deterministic, never stored",
          mono: true,
        },
        {
          label: "Server Access",
          value: "None — all encryption/decryption is client-side only",
        },
      ],
    },
    {
      title: "Sovereignty",
      icon: <Shield className="w-4 h-4" />,
      items: [
        {
          label: "Memory Health Score",
          value: health ? `${health.score}/100 — ${health.label}` : "Loading...",
          status: health ? (health.score >= 70 ? "active" : "warning") : undefined,
        },
        {
          label: "Data Ownership",
          value: "100% on-chain — entities owned by your wallet address",
        },
        {
          label: "Platform Lock-in",
          value: "None — export anytime via Arkiv SDK, no vendor dependency",
        },
      ],
    },
  ];

  const envVars = [
    { key: "NEXT_PUBLIC_PRIVY_APP_ID", desc: "Privy application ID" },
    { key: "ANTHROPIC_API_KEY", desc: "Claude API key (server-side only)" },
    { key: "OPENAI_API_KEY", desc: "GPT-4 API key (server-side only)" },
    { key: "GOOGLE_GENERATIVE_AI_API_KEY", desc: "Gemini API key (server-side only)" },
    { key: "NEXT_PUBLIC_APP_URL", desc: "Your deployment URL for share links" },
  ];

  return (
    <div className="min-h-screen bg-[#060810]">
      <TopBar />
      <Sidebar />

      <main className="pt-14 lg:pl-56">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#F0F4FF]">Settings</h1>
            <p className="text-sm text-[#8B9CC8] mt-1">
              Wallet, encryption, and sovereignty configuration
            </p>
          </div>

          <div className="space-y-6">
            {sections.map((section) => (
              <div key={section.title} className="p-5 bg-[#121A2E] border border-[rgba(0,212,170,0.08)] rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-[#00D4AA]">{section.icon}</div>
                  <h2 className="text-sm font-semibold text-[#F0F4FF]">{section.title}</h2>
                </div>
                <div className="space-y-3">
                  {section.items.map((item) => (
                    <div key={item.label} className="flex items-start justify-between gap-4 py-2 border-b border-[rgba(255,255,255,0.04)] last:border-0">
                      <div className="min-w-0">
                        <p className="text-xs text-[#4F5E7A] mb-0.5">{item.label}</p>
                        <p className={cn(
                          "text-sm break-all",
                          item.mono ? "font-mono text-[#8B9CC8] text-xs" : "text-[#F0F4FF]",
                          item.status === "active" ? "!text-[#00D4AA]" : "",
                          item.status === "warning" ? "!text-amber-400" : "",
                          item.status === "inactive" ? "!text-[#4F5E7A]" : "",
                        )}>
                          {item.value}
                        </p>
                      </div>
                      {item.action && (
                        <button
                          onClick={item.action.onClick}
                          className="flex items-center gap-1 text-xs text-[#00D4AA] hover:text-[#00B8A0] transition-colors flex-shrink-0"
                        >
                          {copied === item.actionId ? <Check className="w-3 h-3" /> : (item.action.icon ?? <Copy className="w-3 h-3" />)}
                          {copied === item.actionId ? "Copied" : item.action.label}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Environment variables reference */}
            <div className="p-5 bg-[#121A2E] border border-[rgba(0,212,170,0.08)] rounded-xl">
              <h2 className="text-sm font-semibold text-[#F0F4FF] mb-4">Required Environment Variables</h2>
              <div className="space-y-2">
                {envVars.map((v) => (
                  <div key={v.key} className="flex items-center justify-between gap-4 py-2 border-b border-[rgba(255,255,255,0.04)] last:border-0">
                    <div>
                      <p className="text-xs font-mono text-[#00D4AA]">{v.key}</p>
                      <p className="text-xs text-[#4F5E7A]">{v.desc}</p>
                    </div>
                    <button
                      onClick={() => copy(v.key, v.key)}
                      className="text-[#4F5E7A] hover:text-[#8B9CC8] transition-colors"
                    >
                      {copied === v.key ? <Check className="w-3.5 h-3.5 text-[#00D4AA]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Danger zone */}
            <div className="p-5 bg-[#1A1020] border border-red-500/20 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <h2 className="text-sm font-semibold text-red-400">Account</h2>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#F0F4FF]">Sign out</p>
                  <p className="text-xs text-[#4F5E7A] mt-0.5">
                    Clears your in-memory encryption key. On-chain data is always safe.
                  </p>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => logout?.()}
                  className="gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
