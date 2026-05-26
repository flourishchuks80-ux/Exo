"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSemanticMemories } from "@/lib/arkiv/queries";
import { createSemanticMemory, updateSemanticMemory, deleteEntity } from "@/lib/arkiv/entities";
import { encryptPayload, decryptPayload, parseEntityPayload } from "@/lib/crypto/encryption";
import { parseEntityAttributes, getEntityPayloadText } from "@/lib/utils/format";
import type { SemanticMemory, SemanticMemoryPayload, EncryptedPayload } from "@/lib/arkiv/schemas";
import type { Topic, AgentId } from "@/lib/arkiv/constants";
import type { Hex } from "@arkiv-network/sdk";

export function useSemanticMemory(
  walletAddress: string | null,
  masterKey: CryptoKey | null
) {
  return useQuery({
    queryKey: ["semantic-memory", walletAddress],
    enabled: !!walletAddress && !!masterKey,
    queryFn: async (): Promise<SemanticMemory[]> => {
      const entities = await fetchSemanticMemories(walletAddress as Hex);
      const memories: SemanticMemory[] = [];

      for (const entity of entities) {
        const attrs = parseEntityAttributes(entity as Parameters<typeof parseEntityAttributes>[0]);
        const encrypted = parseEntityPayload(getEntityPayloadText(entity));
        if (!encrypted || !masterKey) continue;

        try {
          const payload = await decryptPayload<SemanticMemoryPayload>(encrypted, masterKey);
          memories.push({
            entityKey: entity.key,
            topic: (attrs.topic as Topic) ?? "project",
            importance: (attrs.importance as number) ?? 50,
            agentId: (attrs.agentId as AgentId) ?? "claude",
            confirmed: attrs.confirmed === 1,
            createdAt: (attrs.createdAt as number) ?? Date.now(),
            updatedAt: (attrs.updatedAt as number) ?? Date.now(),
            payload,
          });
        } catch {
          // Skip entities that fail decryption (wrong key)
        }
      }

      return memories.sort((a, b) => b.importance - a.importance);
    },
    staleTime: 30_000,
  });
}

export function useCreateSemanticMemory(walletAddress: string | null, masterKey: CryptoKey | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      topic: Topic;
      importance: number;
      agentId: AgentId;
      confirmed: boolean;
      payload: SemanticMemoryPayload;
      getWalletClient: () => Promise<import("@arkiv-network/sdk").WalletArkivClient | null>;
    }) => {
      if (!masterKey) throw new Error("Encryption key not available");
      const walletClient = await params.getWalletClient();
      if (!walletClient) throw new Error("Wallet not connected");

      const encryptedPayload = await encryptPayload(params.payload, masterKey);
      return createSemanticMemory(walletClient, {
        topic: params.topic,
        importance: params.importance,
        agentId: params.agentId,
        confirmed: params.confirmed,
        encryptedPayload,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["semantic-memory", walletAddress] });
      qc.invalidateQueries({ queryKey: ["memory-health", walletAddress] });
    },
  });
}

export function useDeleteMemory(walletAddress: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      entityKey,
      getWalletClient,
    }: {
      entityKey: string;
      getWalletClient: () => Promise<import("@arkiv-network/sdk").WalletArkivClient | null>;
    }) => {
      const walletClient = await getWalletClient();
      if (!walletClient) throw new Error("Wallet not connected");
      return deleteEntity(walletClient, entityKey as Hex);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["semantic-memory", walletAddress] });
      qc.invalidateQueries({ queryKey: ["instructions", walletAddress] });
      qc.invalidateQueries({ queryKey: ["documents", walletAddress] });
      qc.invalidateQueries({ queryKey: ["memory-health", walletAddress] });
    },
  });
}
