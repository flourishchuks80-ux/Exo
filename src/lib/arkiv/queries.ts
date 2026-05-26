import { publicClient } from "./client";
import { eq, gte } from "@arkiv-network/sdk/query";
import type { Hex } from "@arkiv-network/sdk";

const APP = "exo:v1";

export async function fetchSemanticMemories(owner: Hex, minImportance = 0, limit = 50) {
  const predicates = minImportance > 0
    ? [eq("app", APP), eq("type", "semantic"), gte("importance", minImportance)]
    : [eq("app", APP), eq("type", "semantic")];

  const result = await publicClient
    .buildQuery()
    .where(predicates)
    .ownedBy(owner)
    .orderBy("importance", "number", "desc")
    .withPayload(true)
    .withAttributes(true)
    .withMetadata(true)
    .limit(limit)
    .fetch();

  return result.entities;
}

export async function fetchConfirmedSemanticMemories(owner: Hex, minImportance = 60, limit = 20) {
  const result = await publicClient
    .buildQuery()
    .where([eq("app", APP), eq("type", "semantic"), eq("confirmed", 1), gte("importance", minImportance)])
    .ownedBy(owner)
    .orderBy("importance", "number", "desc")
    .withPayload(true)
    .withAttributes(true)
    .limit(limit)
    .fetch();

  return result.entities;
}

export async function fetchSemanticByTopic(owner: Hex, topic: string, limit = 10) {
  const result = await publicClient
    .buildQuery()
    .where([eq("app", APP), eq("type", "semantic"), eq("topic", topic)])
    .ownedBy(owner)
    .orderBy("updatedAt", "number", "desc")
    .withPayload(true)
    .withAttributes(true)
    .limit(limit)
    .fetch();

  return result.entities;
}

export async function fetchEpisodicMemories(owner: Hex, limit = 20) {
  const result = await publicClient
    .buildQuery()
    .where([eq("app", APP), eq("type", "episodic")])
    .ownedBy(owner)
    .orderBy("createdAt", "number", "desc")
    .withPayload(true)
    .withAttributes(true)
    .withMetadata(true)
    .limit(limit)
    .fetch();

  return result.entities;
}

export async function fetchRecentEpisodic(owner: Hex, sinceTimestamp: number, limit = 15) {
  const result = await publicClient
    .buildQuery()
    .where([eq("app", APP), eq("type", "episodic"), gte("createdAt", sinceTimestamp)])
    .ownedBy(owner)
    .orderBy("createdAt", "number", "desc")
    .withPayload(true)
    .withAttributes(true)
    .limit(limit)
    .fetch();

  return result.entities;
}

export async function fetchEpisodicByAgent(owner: Hex, agentId: string, limit = 10) {
  const result = await publicClient
    .buildQuery()
    .where([eq("app", APP), eq("type", "episodic"), eq("agentId", agentId)])
    .ownedBy(owner)
    .orderBy("createdAt", "number", "desc")
    .withPayload(true)
    .withAttributes(true)
    .limit(limit)
    .fetch();

  return result.entities;
}

export async function fetchInstructions(owner: Hex, limit = 30) {
  const result = await publicClient
    .buildQuery()
    .where([eq("app", APP), eq("type", "instruction"), eq("isActive", 1)])
    .ownedBy(owner)
    .orderBy("priority", "number", "desc")
    .withPayload(true)
    .withAttributes(true)
    .withMetadata(true)
    .limit(limit)
    .fetch();

  return result.entities;
}

export async function fetchInstructionsByAgent(owner: Hex, agentId: string, limit = 20) {
  const result = await publicClient
    .buildQuery()
    .where([eq("app", APP), eq("type", "instruction"), eq("isActive", 1), eq("agentId", agentId)])
    .ownedBy(owner)
    .orderBy("priority", "number", "desc")
    .withPayload(true)
    .withAttributes(true)
    .limit(limit)
    .fetch();

  return result.entities;
}

export async function fetchHighPriorityInstructions(owner: Hex, minPriority = 8) {
  const result = await publicClient
    .buildQuery()
    .where([eq("app", APP), eq("type", "instruction"), eq("isActive", 1), gte("priority", minPriority)])
    .ownedBy(owner)
    .orderBy("priority", "number", "desc")
    .withPayload(true)
    .withAttributes(true)
    .fetch();

  return result.entities;
}

export async function fetchDocuments(owner: Hex, limit = 50) {
  const result = await publicClient
    .buildQuery()
    .where([eq("app", APP), eq("type", "document")])
    .ownedBy(owner)
    .orderBy("updatedAt", "number", "desc")
    .withPayload(true)
    .withAttributes(true)
    .withMetadata(true)
    .limit(limit)
    .fetch();

  return result.entities;
}

export async function fetchDocumentsByType(owner: Hex, docType: string, limit = 10) {
  const result = await publicClient
    .buildQuery()
    .where([eq("app", APP), eq("type", "document"), eq("docType", docType)])
    .ownedBy(owner)
    .withPayload(true)
    .withAttributes(true)
    .limit(limit)
    .fetch();

  return result.entities;
}

export async function fetchSnapshots(owner: Hex, limit = 10) {
  const result = await publicClient
    .buildQuery()
    .where([eq("app", APP), eq("type", "snapshot")])
    .ownedBy(owner)
    .orderBy("version", "number", "desc")
    .withPayload(true)
    .withAttributes(true)
    .limit(limit)
    .fetch();

  return result.entities;
}

export async function fetchLatestSnapshot(owner: Hex) {
  const result = await publicClient
    .buildQuery()
    .where([eq("app", APP), eq("type", "snapshot")])
    .ownedBy(owner)
    .orderBy("version", "number", "desc")
    .withPayload(true)
    .withAttributes(true)
    .limit(1)
    .fetch();

  return result.entities[0] ?? null;
}

export async function fetchAccessGrants(owner: Hex) {
  const result = await publicClient
    .buildQuery()
    .where([eq("app", APP), eq("type", "grant")])
    .ownedBy(owner)
    .withPayload(true)
    .withAttributes(true)
    .withMetadata(true)
    .fetch();

  return result.entities;
}

export async function fetchGrantByTokenHash(tokenHash: string) {
  const result = await publicClient
    .buildQuery()
    .where([eq("app", APP), eq("type", "grant"), eq("tokenHash", tokenHash)])
    .withPayload(true)
    .withAttributes(true)
    .withMetadata(true)
    .fetch();

  return result.entities[0] ?? null;
}

export async function fetchAllExoEntities(owner: Hex) {
  const result = await publicClient
    .buildQuery()
    .where([eq("app", APP)])
    .ownedBy(owner)
    .withAttributes(true)
    .withMetadata(true)
    .limit(500)
    .fetch();

  return result;
}

export async function countEntitiesByType(owner: Hex, type: string) {
  return publicClient
    .buildQuery()
    .where([eq("app", APP), eq("type", type)])
    .ownedBy(owner)
    .count();
}

export async function countAllEntities(owner: Hex) {
  return publicClient
    .buildQuery()
    .where([eq("app", APP)])
    .ownedBy(owner)
    .count();
}

// Public query for verification (no ownedBy) — all exo:v1 entities on Braga
export async function fetchAllExoEntitiesGlobal(limit = 20) {
  const result = await publicClient
    .buildQuery()
    .where([eq("app", APP)])
    .withAttributes(true)
    .withMetadata(true)
    .limit(limit)
    .fetch();

  return result;
}
