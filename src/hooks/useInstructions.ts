"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchInstructions } from "@/lib/arkiv/queries";
import { createInstruction, updateInstruction } from "@/lib/arkiv/entities";
import { encryptPayload, decryptPayload, parseEntityPayload } from "@/lib/crypto/encryption";
import { parseEntityAttributes, getEntityPayloadText } from "@/lib/utils/format";
import type { Instruction, InstructionPayload, EncryptedPayload } from "@/lib/arkiv/schemas";
import type { InstructionCategory, InstructionScope, AgentId } from "@/lib/arkiv/constants";
import type { Hex } from "@arkiv-network/sdk";

export function useInstructions(
  walletAddress: string | null,
  masterKey: CryptoKey | null
) {
  return useQuery({
    queryKey: ["instructions", walletAddress],
    enabled: !!walletAddress && !!masterKey,
    queryFn: async (): Promise<Instruction[]> => {
      const entities = await fetchInstructions(walletAddress as Hex);
      const instructions: Instruction[] = [];

      for (const entity of entities) {
        const attrs = parseEntityAttributes(entity as Parameters<typeof parseEntityAttributes>[0]);
        const encrypted = parseEntityPayload(getEntityPayloadText(entity));
        if (!encrypted || !masterKey) continue;

        try {
          const payload = await decryptPayload<InstructionPayload>(encrypted, masterKey);
          instructions.push({
            entityKey: entity.key,
            scope: (attrs.scope as InstructionScope) ?? "global",
            agentId: (attrs.agentId as AgentId) ?? "any",
            priority: (attrs.priority as number) ?? 5,
            isActive: attrs.isActive === 1,
            category: (attrs.category as InstructionCategory) ?? "behavior",
            createdAt: (attrs.createdAt as number) ?? Date.now(),
            payload,
          });
        } catch {
          // skip
        }
      }

      return instructions.sort((a, b) => b.priority - a.priority);
    },
    staleTime: 30_000,
  });
}

export function useCreateInstruction(walletAddress: string | null, masterKey: CryptoKey | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      scope: InstructionScope;
      agentId: AgentId;
      priority: number;
      category: InstructionCategory;
      payload: InstructionPayload;
      getWalletClient: () => Promise<import("@arkiv-network/sdk").WalletArkivClient | null>;
    }) => {
      if (!masterKey) throw new Error("Encryption key not available");
      const walletClient = await params.getWalletClient();
      if (!walletClient) throw new Error("Wallet not connected");

      const encryptedPayload = await encryptPayload(params.payload, masterKey);
      return createInstruction(walletClient, {
        scope: params.scope,
        agentId: params.agentId,
        priority: params.priority,
        category: params.category,
        encryptedPayload,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instructions", walletAddress] });
      qc.invalidateQueries({ queryKey: ["memory-health", walletAddress] });
    },
  });
}
