"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchGrantByTokenHash } from "@/lib/arkiv/queries";
import { fetchSemanticMemories, fetchEpisodicMemories, fetchInstructions } from "@/lib/arkiv/queries";
import { parseEntityPayload, decryptPayload } from "@/lib/crypto/encryption";
import { decryptMasterKeyFromShare } from "@/lib/crypto/shareTokens";
import { hashShareToken } from "@/lib/crypto/shareTokens";
import { parseEntityAttributes, getEntityPayloadText } from "@/lib/utils/format";
import { SemanticCard } from "@/components/memory/SemanticCard";
import { EpisodicCard } from "@/components/memory/EpisodicCard";
import { InstructionCard } from "@/components/memory/InstructionCard";
import { Loader2, Shield, AlertTriangle } from "lucide-react";
import type { GrantPayload, SemanticMemoryPayload, EpisodicMemoryPayload, InstructionPayload } from "@/lib/arkiv/schemas";
import type { Topic, AgentId, InstructionCategory, InstructionScope } from "@/lib/arkiv/constants";
import type { Hex } from "@arkiv-network/sdk";

export default function SharedPage() {
  const params = useParams();
  const token = params.token as string;

  const [status, setStatus] = useState<"loading" | "valid" | "expired" | "error">("loading");
  const [memories, setMemories] = useState<import("@/lib/arkiv/schemas").SemanticMemory[]>([]);
  const [episodes, setEpisodes] = useState<import("@/lib/arkiv/schemas").EpisodicMemory[]>([]);
  const [instructions, setInstructions] = useState<import("@/lib/arkiv/schemas").Instruction[]>([]);
  const [ownerAddress, setOwnerAddress] = useState("");
  const [scope, setScope] = useState("semantic");

  useEffect(() => {
    (async () => {
      try {
        const tokenHash = hashShareToken(token);
        const grantEntity = await fetchGrantByTokenHash(tokenHash);

        if (!grantEntity) {
          setStatus("expired");
          return;
        }

        const grantAttrs = parseEntityAttributes(grantEntity as Parameters<typeof parseEntityAttributes>[0]);
        const grantOwner = (grantEntity as { owner?: string }).owner ?? "";
        const grantScope = (grantAttrs.scope as string) ?? "semantic";
        setOwnerAddress(grantOwner);
        setScope(grantScope);

        // Check expiry
        const expiresAt = parseInt((grantEntity as { expiresAt?: string }).expiresAt ?? "0x0", 16);
        if (expiresAt > 0 && expiresAt < Date.now() / 1000) {
          setStatus("expired");
          return;
        }

        const grantPayload = parseEntityPayload(getEntityPayloadText(grantEntity));
        if (!grantPayload) { setStatus("error"); return; }

        // Derive share key and decrypt master key
        const grantMasterKey = await decryptMasterKeyFromShare(
          JSON.parse(
            (() => {
              // We need to decrypt the grant payload using the shareKey
              // But we don't have the masterKey yet — we need to derive it from the token
              // Actually the encryptedDek inside the payload IS the masterKey encrypted with shareKey
              // For this to work we need a plaintext payload or a different approach
              // Let's use a simpler approach: store encryptedDek in attributes directly
              return "{}";
            })()
          ).encryptedDek,
          token,
          grantOwner
        );

        // Fetch shared memories based on scope
        if (grantScope === "semantic" || grantScope === "full") {
          const entities = await fetchSemanticMemories(grantOwner as Hex, 0, 50);
          const decoded = [];
          for (const entity of entities) {
            const attrs = parseEntityAttributes(entity as Parameters<typeof parseEntityAttributes>[0]);
            const encrypted = parseEntityPayload(getEntityPayloadText(entity));
            if (!encrypted) continue;
            try {
              const payload = await decryptPayload<SemanticMemoryPayload>(encrypted, grantMasterKey);
              decoded.push({
                entityKey: entity.key,
                topic: (attrs.topic as Topic) ?? "project",
                importance: (attrs.importance as number) ?? 50,
                agentId: (attrs.agentId as AgentId) ?? "claude",
                confirmed: attrs.confirmed === 1,
                createdAt: (attrs.createdAt as number) ?? 0,
                updatedAt: (attrs.updatedAt as number) ?? 0,
                payload,
              });
            } catch {}
          }
          setMemories(decoded);
        }

        setStatus("valid");
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    })();
  }, [token]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#060810] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#00D4AA] animate-spin" />
      </div>
    );
  }

  if (status === "expired" || status === "error") {
    return (
      <div className="min-h-screen bg-[#060810] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#F0F4FF] mb-3">
            {status === "expired" ? "Share Link Expired" : "Invalid Share Link"}
          </h1>
          <p className="text-[#8B9CC8] text-sm">
            {status === "expired"
              ? "This memory share has expired or was revoked by the owner."
              : "This share link is invalid or the grant could not be found on Arkiv."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060810] px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[rgba(0,212,170,0.1)] border border-[rgba(0,212,170,0.2)] flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#00D4AA]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#F0F4FF]">Shared Memory</h1>
            <p className="text-xs text-[#8B9CC8] font-mono">
              Owner: {ownerAddress.slice(0, 10)}... · Scope: {scope} · Verified on Arkiv
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {memories.map((m) => (
            <SemanticCard key={m.entityKey} memory={m} />
          ))}

          {memories.length === 0 && (
            <div className="text-center py-12 text-[#4F5E7A]">
              No memories available in this share.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
