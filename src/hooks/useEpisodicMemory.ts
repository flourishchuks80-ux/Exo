"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchEpisodicMemories } from "@/lib/arkiv/queries";
import { createEpisodicMemory } from "@/lib/arkiv/entities";
import { encryptPayload, decryptPayload, parseEntityPayload } from "@/lib/crypto/encryption";
import { parseEntityAttributes, getEntityPayloadText } from "@/lib/utils/format";
import type { EpisodicMemory, EpisodicMemoryPayload } from "@/lib/arkiv/schemas";
import type { AgentId, Topic } from "@/lib/arkiv/constants";
import type { Hex } from "@arkiv-network/sdk";

export function useEpisodicMemory(
  walletAddress: string | null,
  masterKey: CryptoKey | null
) {
  return useQuery({
    queryKey: ["episodic-memory", walletAddress],
    enabled: !!walletAddress && !!masterKey,
    queryFn: async (): Promise<EpisodicMemory[]> => {
      const entities = await fetchEpisodicMemories(walletAddress as Hex);
      const episodes: EpisodicMemory[] = [];

      for (const entity of entities) {
        const attrs = parseEntityAttributes(entity as Parameters<typeof parseEntityAttributes>[0]);
        const encrypted = parseEntityPayload(getEntityPayloadText(entity));
        if (!encrypted || !masterKey) continue;

        try {
          const payload = await decryptPayload<EpisodicMemoryPayload>(encrypted, masterKey);
          episodes.push({
            entityKey: entity.key,
            agentId: (attrs.agentId as AgentId) ?? "claude",
            sessionId: (attrs.sessionId as string) ?? "",
            importance: (attrs.importance as number) ?? 50,
            topic: (attrs.topic as Topic) ?? "project",
            createdAt: (attrs.createdAt as number) ?? Date.now(),
            sessionDate: (attrs.sessionDate as number) ?? 0,
            payload,
          });
        } catch {
          // skip
        }
      }

      return episodes.sort((a, b) => b.createdAt - a.createdAt);
    },
    staleTime: 30_000,
  });
}

export function useSaveEpisodicMemory(walletAddress: string | null, masterKey: CryptoKey | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      agentId: AgentId;
      sessionId: string;
      importance: number;
      topic: Topic;
      payload: EpisodicMemoryPayload;
      getWalletClient: () => Promise<import("@arkiv-network/sdk").WalletArkivClient | null>;
    }) => {
      if (!masterKey) throw new Error("Encryption key not available");
      const walletClient = await params.getWalletClient();
      if (!walletClient) throw new Error("Wallet not connected");

      const encryptedPayload = await encryptPayload(params.payload, masterKey);
      return createEpisodicMemory(walletClient, {
        agentId: params.agentId,
        sessionId: params.sessionId,
        importance: params.importance,
        topic: params.topic,
        encryptedPayload,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["episodic-memory", walletAddress] });
      qc.invalidateQueries({ queryKey: ["memory-health", walletAddress] });
    },
  });
}
