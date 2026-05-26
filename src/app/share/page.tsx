"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useExoAuth } from "@/hooks/useExoAuth";
import { useQuery } from "@tanstack/react-query";
import { fetchAccessGrants } from "@/lib/arkiv/queries";
import { deleteEntity } from "@/lib/arkiv/entities";
import { decryptPayload, parseEntityPayload } from "@/lib/crypto/encryption";
import { parseEntityAttributes, formatDate, getEntityPayloadText } from "@/lib/utils/format";
import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import { Share2, Plus, Trash2, Clock, Loader2 } from "lucide-react";
import type { Hex } from "@arkiv-network/sdk";
import type { GrantPayload } from "@/lib/arkiv/schemas";

export default function SharePage() {
  const router = useRouter();
  const { authenticated, ready, walletAddress, masterKey, getWalletClient } = useExoAuth();

  useEffect(() => {
    if (ready && !authenticated) router.push("/");
  }, [ready, authenticated, router]);

  const { data: grants, isLoading, refetch } = useQuery({
    queryKey: ["grants", walletAddress],
    enabled: !!walletAddress && !!masterKey,
    queryFn: async () => {
      const entities = await fetchAccessGrants(walletAddress as Hex);
      const result = [];
      for (const entity of entities) {
        const attrs = parseEntityAttributes(entity as Parameters<typeof parseEntityAttributes>[0]);
        const encrypted = parseEntityPayload(getEntityPayloadText(entity));
        if (!encrypted || !masterKey) continue;
        try {
          const payload = await decryptPayload<GrantPayload>(encrypted, masterKey);
          result.push({
            entityKey: entity.key,
            granteeWallet: (attrs.granteeWallet as string) ?? "",
            scope: (attrs.scope as string) ?? "semantic",
            purpose: (attrs.purpose as string) ?? "",
            grantedAt: (attrs.grantedAt as number) ?? Date.now(),
            tokenHash: (attrs.tokenHash as string) ?? "",
            payload,
          });
        } catch {}
      }
      return result;
    },
    staleTime: 30_000,
  });

  const handleRevoke = async (entityKey: string) => {
    const wc = await getWalletClient();
    if (!wc) return;
    await deleteEntity(wc, entityKey as Hex);
    refetch();
  };

  return (
    <div className="min-h-screen bg-[#060810]">
      <TopBar />
      <Sidebar />

      <main className="pt-14 lg:pl-56">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[#F0F4FF]">Share Center</h1>
              <p className="text-sm text-[#8B9CC8] mt-1">
                Time-scoped, encrypted memory sharing with cryptographic access control
              </p>
            </div>
            <Link href="/share/new">
              <Button variant="primary" size="sm" className="gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Create Grant
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-[#00D4AA] animate-spin" />
            </div>
          ) : !grants || grants.length === 0 ? (
            <div className="text-center py-20">
              <Share2 className="w-10 h-10 text-[#4F5E7A] mx-auto mb-4" />
              <p className="text-[#8B9CC8] mb-4">No active access grants.</p>
              <Link href="/share/new">
                <Button variant="primary" size="sm" className="gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Create your first grant
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {grants.map((grant) => (
                <div
                  key={grant.entityKey}
                  className="p-4 bg-[#121A2E] border border-[rgba(0,212,170,0.08)] rounded-xl flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-[rgba(0,212,170,0.06)] border border-[rgba(0,212,170,0.15)] flex items-center justify-center flex-shrink-0">
                    <Share2 className="w-5 h-5 text-[#00D4AA]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-[#F0F4FF] truncate">
                        {grant.payload.grantNote || grant.purpose || "Unnamed grant"}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        grant.scope === "full" ? "bg-[rgba(0,212,170,0.12)] text-[#00D4AA]" :
                        grant.scope === "semantic" ? "bg-[rgba(99,102,241,0.12)] text-indigo-400" :
                        grant.scope === "episodic" ? "bg-[rgba(168,85,247,0.12)] text-purple-400" :
                        "bg-[rgba(245,158,11,0.12)] text-amber-400"
                      }`}>
                        {grant.scope}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#4F5E7A]">
                      <Clock className="w-3 h-3" />
                      <span>Created {formatDate(grant.grantedAt)}</span>
                      <span className="font-mono">
                        {grant.granteeWallet === "link-based" || !grant.granteeWallet
                          ? "link-based"
                          : `${grant.granteeWallet.slice(0, 10)}...`}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleRevoke(grant.entityKey)}
                    className="flex-shrink-0 gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Revoke
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
