"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSnapshots } from "@/lib/arkiv/queries";
import { createMemorySnapshot } from "@/lib/arkiv/entities";
import { encryptPayload, decryptPayload, parseEntityPayload } from "@/lib/crypto/encryption";
import { parseEntityAttributes, getEntityPayloadText } from "@/lib/utils/format";
import type { MemorySnapshot, SnapshotPayload } from "@/lib/arkiv/schemas";
import type { Hex } from "@arkiv-network/sdk";

export function useSnapshots(
  walletAddress: string | null,
  masterKey: CryptoKey | null
) {
  return useQuery({
    queryKey: ["snapshots", walletAddress],
    enabled: !!walletAddress && !!masterKey,
    queryFn: async (): Promise<MemorySnapshot[]> => {
      const entities = await fetchSnapshots(walletAddress as Hex);
      const snapshots: MemorySnapshot[] = [];

      for (const entity of entities) {
        const attrs = parseEntityAttributes(entity as Parameters<typeof parseEntityAttributes>[0]);
        const encrypted = parseEntityPayload(getEntityPayloadText(entity));
        if (!encrypted || !masterKey) continue;

        try {
          const payload = await decryptPayload<SnapshotPayload>(encrypted, masterKey);
          snapshots.push({
            entityKey: entity.key,
            version: (attrs.version as number) ?? 1,
            semanticCount: (attrs.semanticCount as number) ?? 0,
            episodicCount: (attrs.episodicCount as number) ?? 0,
            totalEntities: (attrs.totalEntities as number) ?? 0,
            createdAt: (attrs.createdAt as number) ?? Date.now(),
            payload,
          });
        } catch {
          // skip
        }
      }

      return snapshots.sort((a, b) => b.version - a.version);
    },
    staleTime: 120_000,
  });
}

export function useCreateSnapshot(walletAddress: string | null, masterKey: CryptoKey | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      version: number;
      semanticCount: number;
      episodicCount: number;
      totalEntities: number;
      payload: SnapshotPayload;
      getWalletClient: () => Promise<import("@arkiv-network/sdk").WalletArkivClient | null>;
    }) => {
      if (!masterKey) throw new Error("Encryption key not available");
      const walletClient = await params.getWalletClient();
      if (!walletClient) throw new Error("Wallet not connected");

      const encryptedPayload = await encryptPayload(params.payload, masterKey);
      return createMemorySnapshot(walletClient, {
        version: params.version,
        semanticCount: params.semanticCount,
        episodicCount: params.episodicCount,
        totalEntities: params.totalEntities,
        encryptedPayload,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["snapshots", walletAddress] });
    },
  });
}
