"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchDocuments } from "@/lib/arkiv/queries";
import { createContextDocument } from "@/lib/arkiv/entities";
import { encryptPayload, decryptPayload, parseEntityPayload } from "@/lib/crypto/encryption";
import { parseEntityAttributes, getEntityPayloadText } from "@/lib/utils/format";
import type { ContextDocument, DocumentPayload } from "@/lib/arkiv/schemas";
import type { DocumentType } from "@/lib/arkiv/constants";
import type { Hex } from "@arkiv-network/sdk";

export function useDocuments(
  walletAddress: string | null,
  masterKey: CryptoKey | null
) {
  return useQuery({
    queryKey: ["documents", walletAddress],
    enabled: !!walletAddress && !!masterKey,
    queryFn: async (): Promise<ContextDocument[]> => {
      const entities = await fetchDocuments(walletAddress as Hex);
      const docs: ContextDocument[] = [];

      for (const entity of entities) {
        const attrs = parseEntityAttributes(entity as Parameters<typeof parseEntityAttributes>[0]);
        const encrypted = parseEntityPayload(getEntityPayloadText(entity));
        if (!encrypted || !masterKey) continue;

        try {
          const payload = await decryptPayload<DocumentPayload>(encrypted, masterKey);
          docs.push({
            entityKey: entity.key,
            docType: (attrs.docType as DocumentType) ?? "notes",
            title: (attrs.title as string) ?? "Untitled",
            tags: (attrs.tags as string) ?? "",
            sizeBytes: (attrs.sizeBytes as number) ?? 0,
            createdAt: (attrs.createdAt as number) ?? Date.now(),
            updatedAt: (attrs.updatedAt as number) ?? Date.now(),
            payload,
          });
        } catch {
          // skip
        }
      }

      return docs.sort((a, b) => b.updatedAt - a.updatedAt);
    },
    staleTime: 60_000,
  });
}

export function useCreateDocument(walletAddress: string | null, masterKey: CryptoKey | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      docType: DocumentType;
      title: string;
      tags: string;
      payload: DocumentPayload;
      getWalletClient: () => Promise<import("@arkiv-network/sdk").WalletArkivClient | null>;
    }) => {
      if (!masterKey) throw new Error("Encryption key not available");
      const walletClient = await params.getWalletClient();
      if (!walletClient) throw new Error("Wallet not connected");

      const encryptedPayload = await encryptPayload(params.payload, masterKey);
      return createContextDocument(walletClient, {
        docType: params.docType,
        title: params.title,
        tags: params.tags,
        sizeBytes: JSON.stringify(params.payload).length,
        encryptedPayload,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents", walletAddress] });
      qc.invalidateQueries({ queryKey: ["memory-health", walletAddress] });
    },
  });
}
