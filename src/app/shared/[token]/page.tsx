"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchGrantByTokenHash, fetchSemanticMemories, fetchEpisodicMemories, fetchInstructions } from "@/lib/arkiv/queries";
import { parseEntityPayload, decryptPayload } from "@/lib/crypto/encryption";
import { decryptMasterKeyFromShare, hashShareToken } from "@/lib/crypto/shareTokens";
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
  const [grantNote, setGrantNote] = useState("");
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

        // Read encryptedDek from plaintext attribute — accessible without the owner's masterKey
        const encryptedDek = grantAttrs.encryptedDek as string | undefined;
        if (!encryptedDek) {
          setStatus("error");
          return;
        }

        // Derive shareKey from token → decrypt the owner's masterKey
        const grantMasterKey = await decryptMasterKeyFromShare(encryptedDek, token, grantOwner);

        // Fetch grant note from encrypted payload (best-effort; not required for access)
        try {
          const grantPayload = parseEntityPayload(getEntityPayloadText(grantEntity));
          if (grantPayload) {
            // payload is encrypted with owner's masterKey — skip decryption, use attribute instead
          }
          setGrantNote((grantAttrs.purpose as string) ?? "");
        } catch {}

        // Fetch semantic memories
        if (grantScope === "semantic" || grantScope === "full") {
          const entities = await fetchSemanticMemories(grantOwner as Hex, 0, 50);
          const decoded: import("@/lib/arkiv/schemas").SemanticMemory[] = [];
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

        // Fetch episodic memories
        if (grantScope === "episodic" || grantScope === "full") {
          const entities = await fetchEpisodicMemories(grantOwner as Hex, 30);
          const decoded: import("@/lib/arkiv/schemas").EpisodicMemory[] = [];
          for (const entity of entities) {
            const attrs = parseEntityAttributes(entity as Parameters<typeof parseEntityAttributes>[0]);
            const encrypted = parseEntityPayload(getEntityPayloadText(entity));
            if (!encrypted) continue;
            try {
              const payload = await decryptPayload<EpisodicMemoryPayload>(encrypted, grantMasterKey);
              decoded.push({
                entityKey: entity.key,
                agentId: (attrs.agentId as AgentId) ?? "claude",
                sessionId: (attrs.sessionId as string) ?? "",
                importance: (attrs.importance as number) ?? 50,
                topic: (attrs.topic as Topic) ?? "project",
                createdAt: (attrs.createdAt as number) ?? 0,
                sessionDate: (attrs.sessionDate as number) ?? 0,
                payload,
              });
            } catch {}
          }
          setEpisodes(decoded);
        }

        // Fetch instructions (full scope only)
        if (grantScope === "full") {
          const entities = await fetchInstructions(grantOwner as Hex);
          const decoded: import("@/lib/arkiv/schemas").Instruction[] = [];
          for (const entity of entities) {
            const attrs = parseEntityAttributes(entity as Parameters<typeof parseEntityAttributes>[0]);
            const encrypted = parseEntityPayload(getEntityPayloadText(entity));
            if (!encrypted) continue;
            try {
              const payload = await decryptPayload<InstructionPayload>(encrypted, grantMasterKey);
              decoded.push({
                entityKey: entity.key,
                scope: (attrs.scope as InstructionScope) ?? "global",
                agentId: (attrs.agentId as AgentId) ?? "any",
                priority: (attrs.priority as number) ?? 5,
                isActive: attrs.isActive === 1,
                category: (attrs.category as InstructionCategory) ?? "behavior",
                createdAt: (attrs.createdAt as number) ?? 0,
                payload,
              });
            } catch {}
          }
          setInstructions(decoded);
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

  const totalCount = memories.length + episodes.length + instructions.length;

  return (
    <div className="min-h-screen bg-[#060810] px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
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

        {grantNote && (
          <p className="text-sm text-[#4F5E7A] mb-8 pl-[52px]">{grantNote}</p>
        )}

        {totalCount === 0 ? (
          <div className="text-center py-12 text-[#4F5E7A]">
            No memories available in this share.
          </div>
        ) : (
          <div className="space-y-6">
            {memories.length > 0 && (
              <section>
                <p className="text-xs font-mono text-[#4F5E7A] uppercase tracking-wider mb-3">
                  Semantic Memories ({memories.length})
                </p>
                <div className="space-y-3">
                  {memories.map((m) => (
                    <SemanticCard key={m.entityKey} memory={m} />
                  ))}
                </div>
              </section>
            )}

            {episodes.length > 0 && (
              <section>
                <p className="text-xs font-mono text-[#4F5E7A] uppercase tracking-wider mb-3">
                  Episodes ({episodes.length})
                </p>
                <div className="space-y-3">
                  {episodes.map((e) => (
                    <EpisodicCard key={e.entityKey} episode={e} />
                  ))}
                </div>
              </section>
            )}

            {instructions.length > 0 && (
              <section>
                <p className="text-xs font-mono text-[#4F5E7A] uppercase tracking-wider mb-3">
                  Instructions ({instructions.length})
                </p>
                <div className="space-y-3">
                  {instructions.map((i) => (
                    <InstructionCard key={i.entityKey} instruction={i} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
