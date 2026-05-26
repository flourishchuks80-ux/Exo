"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useExoAuth } from "@/hooks/useExoAuth";
import { createAccessGrant } from "@/lib/arkiv/entities";
import { encryptPayload } from "@/lib/crypto/encryption";
import { generateShareToken, hashShareToken, encryptMasterKeyForShare, buildShareUrl } from "@/lib/crypto/shareTokens";
import { ChainWriteProgress } from "@/components/ui/ChainWriteProgress";
import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Copy, Check } from "lucide-react";
import type { GrantScope } from "@/lib/arkiv/constants";
import type { Hex } from "@arkiv-network/sdk";

const EXPIRY_OPTIONS = [
  { value: 1, label: "1 day" },
  { value: 3, label: "3 days" },
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
];

export default function NewGrantPage() {
  const router = useRouter();
  const { walletAddress, masterKey, getWalletClient } = useExoAuth();

  const [scope, setScope] = useState<GrantScope>("semantic");
  const [purpose, setPurpose] = useState("");
  const [expiryDays, setExpiryDays] = useState(7);
  const [granteeWallet, setGranteeWallet] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [txHash, setTxHash] = useState<string | undefined>();
  const [showProgress, setShowProgress] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!walletAddress || !masterKey) return;
    setIsCreating(true);
    setShowProgress(true);

    try {
      const shareToken = await generateShareToken();
      const tokenHash = hashShareToken(shareToken);
      const encryptedDek = await encryptMasterKeyForShare(masterKey, shareToken, walletAddress);

      const walletClient = await getWalletClient();
      if (!walletClient) throw new Error("Wallet not connected");

      const encryptedPayload = await encryptPayload({
        encryptedDek,
        allowedTopics: scope === "full" ? [] : [scope],
        grantNote: purpose,
        accessLog: [],
      }, masterKey);

      const result = await createAccessGrant(walletClient, {
        granteeWallet: granteeWallet || "link-based",
        scope,
        tokenHash,
        purpose,
        encryptedPayload,
        expiryDays,
      });

      setTxHash(result.txHash);
      setShareLink(buildShareUrl(shareToken));
    } catch (err) {
      console.error(err);
      setShowProgress(false);
    } finally {
      setIsCreating(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#060810]">
      <TopBar />
      <Sidebar />

      <main className="pt-14 lg:pl-56">
        <div className="max-w-lg mx-auto px-6 py-8">
          <button
            onClick={() => router.push("/share")}
            className="flex items-center gap-1.5 text-sm text-[#4F5E7A] hover:text-[#8B9CC8] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Share Center
          </button>

          <h1 className="text-2xl font-bold text-[#F0F4FF] mb-2">Create Access Grant</h1>
          <p className="text-sm text-[#8B9CC8] mb-8">
            Time-scoped, encrypted access. Revocable anytime.
          </p>

          {!shareLink ? (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-mono text-[#8B9CC8] mb-2 uppercase tracking-wider">Scope</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["semantic", "episodic", "documents", "full"] as GrantScope[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setScope(s)}
                      className={`px-3 py-2 rounded-lg border text-sm transition-all ${scope === s
                        ? "border-[#00D4AA] bg-[rgba(0,212,170,0.1)] text-[#00D4AA]"
                        : "border-[rgba(0,212,170,0.12)] text-[#8B9CC8] hover:border-[rgba(0,212,170,0.25)]"
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8B9CC8] mb-2 uppercase tracking-wider">Purpose (required)</label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="NS hackathon project collaboration"
                  className="w-full px-3 py-2.5 bg-[#121A2E] border border-[rgba(0,212,170,0.12)] rounded-xl text-sm text-[#F0F4FF] placeholder-[#4F5E7A] focus:outline-none focus:border-[rgba(0,212,170,0.35)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8B9CC8] mb-2 uppercase tracking-wider">Grantee Wallet (optional)</label>
                <input
                  type="text"
                  value={granteeWallet}
                  onChange={(e) => setGranteeWallet(e.target.value)}
                  placeholder="0x... (leave blank for link-based access)"
                  className="w-full px-3 py-2.5 bg-[#121A2E] border border-[rgba(0,212,170,0.12)] rounded-xl text-sm text-[#F0F4FF] placeholder-[#4F5E7A] font-mono focus:outline-none focus:border-[rgba(0,212,170,0.35)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8B9CC8] mb-2 uppercase tracking-wider">Expires In</label>
                <div className="flex gap-2 flex-wrap">
                  {EXPIRY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setExpiryDays(opt.value)}
                      className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${expiryDays === opt.value
                        ? "border-[#00D4AA] bg-[rgba(0,212,170,0.1)] text-[#00D4AA]"
                        : "border-[rgba(0,212,170,0.12)] text-[#8B9CC8] hover:border-[rgba(0,212,170,0.25)]"
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full"
                onClick={handleCreate}
                disabled={!purpose || isCreating}
                loading={isCreating}
              >
                Generate Share Link
              </Button>
            </div>
          ) : (
            <div className="space-y-4 animate-slide-in-up">
              <div className="p-4 bg-[rgba(0,212,170,0.06)] border border-[rgba(0,212,170,0.2)] rounded-xl">
                <p className="text-[#00D4AA] font-medium text-sm mb-3">Grant created on Arkiv!</p>
                <p className="text-xs text-[#8B9CC8] mb-3">
                  Share this link. Anyone with it can read your {scope} memories until {expiryDays === 1 ? "tomorrow" : `${expiryDays} days from now`}.
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-[10px] font-mono text-[#00D4AA] bg-[#121A2E] px-3 py-2 rounded-lg break-all">
                    {shareLink}
                  </code>
                  <Button size="sm" variant="outline" onClick={copyLink} className="flex-shrink-0">
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </div>
              <Button variant="secondary" className="w-full" onClick={() => router.push("/share")}>
                Back to Share Center
              </Button>
            </div>
          )}
        </div>
      </main>

      <ChainWriteProgress
        isOpen={showProgress && !shareLink}
        txHash={txHash}
        entityType="access grant"
        onDone={() => setShowProgress(false)}
      />
    </div>
  );
}
