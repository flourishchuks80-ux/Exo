"use client";

import { useQuery } from "@tanstack/react-query";
import { countEntitiesByType, fetchSemanticMemories, fetchEpisodicMemories } from "@/lib/arkiv/queries";
import { parseEntityAttributes } from "@/lib/utils/format";
import { calculateSovereigntyScore } from "@/lib/memory/health";
import type { Hex } from "@arkiv-network/sdk";

export function useMemoryHealth(walletAddress: string | null) {
  return useQuery({
    queryKey: ["memory-health", walletAddress],
    enabled: !!walletAddress,
    queryFn: async () => {
      const address = walletAddress as Hex;

      const [semanticEntities, episodicEntities, instructionCount, documentCount] = await Promise.all([
        fetchSemanticMemories(address, 0, 100),
        fetchEpisodicMemories(address, 20),
        countEntitiesByType(address, "instruction"),
        countEntitiesByType(address, "document"),
      ]);

      const confirmedCount = semanticEntities.filter((e) => {
        const attrs = parseEntityAttributes(e as Parameters<typeof parseEntityAttributes>[0]);
        return attrs.confirmed === 1;
      }).length;

      const sevenDaysAgo = Date.now() - 7 * 24 * 3600 * 1000;
      const recentEpisodes = episodicEntities.filter((e) => {
        const attrs = parseEntityAttributes(e as Parameters<typeof parseEntityAttributes>[0]);
        return (attrs.createdAt as number) > sevenDaysAgo;
      }).length;

      // Find most recent update
      let lastUpdatedAt = 0;
      for (const e of semanticEntities) {
        const attrs = parseEntityAttributes(e as Parameters<typeof parseEntityAttributes>[0]);
        const updated = (attrs.updatedAt as number) ?? 0;
        if (updated > lastUpdatedAt) lastUpdatedAt = updated;
      }

      const health = calculateSovereigntyScore({
        semanticCount: semanticEntities.length,
        confirmedSemanticCount: confirmedCount,
        instructionCount,
        episodicLast7Days: recentEpisodes,
        documentCount,
        lastUpdatedAt,
      });

      return {
        ...health,
        semanticCount: semanticEntities.length,
        episodicCount: episodicEntities.length,
        instructionCount,
        documentCount,
      };
    },
    staleTime: 60_000,
  });
}
