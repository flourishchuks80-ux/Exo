import { jsonToPayload } from "@arkiv-network/sdk";
import type { Hex } from "@arkiv-network/sdk";
import type { WalletArkivClient } from "@arkiv-network/sdk";
import { PROJECT_ATTRIBUTE, EXPIRY } from "./constants";
import type {
  SemanticMemoryPayload,
  EpisodicMemoryPayload,
  InstructionPayload,
  DocumentPayload,
  GrantPayload,
  SnapshotPayload,
  EncryptedPayload,
} from "./schemas";
import type { Topic, InstructionCategory, InstructionScope, AgentId, DocumentType, GrantScope } from "./constants";

type WalletClient = WalletArkivClient;

function encryptedToPayload(encrypted: EncryptedPayload): Uint8Array {
  return jsonToPayload(encrypted);
}

export async function createSemanticMemory(
  client: WalletClient,
  params: {
    topic: Topic;
    importance: number;
    agentId: AgentId;
    confirmed: boolean;
    encryptedPayload: EncryptedPayload;
  }
) {
  const now = Date.now();
  return client.createEntity({
    payload: encryptedToPayload(params.encryptedPayload),
    contentType: "application/json",
    expiresIn: EXPIRY.NEVER,
    attributes: [
      PROJECT_ATTRIBUTE,
      { key: "type", value: "semantic" },
      { key: "topic", value: params.topic },
      { key: "importance", value: params.importance },
      { key: "agentId", value: params.agentId },
      { key: "confirmed", value: params.confirmed ? 1 : 0 },
      { key: "createdAt", value: now },
      { key: "updatedAt", value: now },
    ],
  });
}

export async function updateSemanticMemory(
  client: WalletClient,
  entityKey: Hex,
  params: {
    topic: Topic;
    importance: number;
    agentId: AgentId;
    confirmed: boolean;
    encryptedPayload: EncryptedPayload;
    createdAt: number;
  }
) {
  const now = Date.now();
  return client.updateEntity({
    entityKey,
    payload: encryptedToPayload(params.encryptedPayload),
    contentType: "application/json",
    expiresIn: EXPIRY.NEVER,
    attributes: [
      PROJECT_ATTRIBUTE,
      { key: "type", value: "semantic" },
      { key: "topic", value: params.topic },
      { key: "importance", value: params.importance },
      { key: "agentId", value: params.agentId },
      { key: "confirmed", value: params.confirmed ? 1 : 0 },
      { key: "createdAt", value: params.createdAt },
      { key: "updatedAt", value: now },
    ],
  });
}

export async function createEpisodicMemory(
  client: WalletClient,
  params: {
    agentId: AgentId;
    sessionId: string;
    importance: number;
    topic: Topic;
    encryptedPayload: EncryptedPayload;
  }
) {
  const now = Date.now();
  const today = parseInt(
    new Date().toISOString().slice(0, 10).replace(/-/g, ""),
    10
  );
  return client.createEntity({
    payload: encryptedToPayload(params.encryptedPayload),
    contentType: "application/json",
    expiresIn: EXPIRY.DAYS_90,
    attributes: [
      PROJECT_ATTRIBUTE,
      { key: "type", value: "episodic" },
      { key: "agentId", value: params.agentId },
      { key: "sessionId", value: params.sessionId },
      { key: "importance", value: params.importance },
      { key: "topic", value: params.topic },
      { key: "createdAt", value: now },
      { key: "sessionDate", value: today },
    ],
  });
}

export async function createInstruction(
  client: WalletClient,
  params: {
    scope: InstructionScope;
    agentId: AgentId;
    priority: number;
    category: InstructionCategory;
    encryptedPayload: EncryptedPayload;
  }
) {
  const now = Date.now();
  return client.createEntity({
    payload: encryptedToPayload(params.encryptedPayload),
    contentType: "application/json",
    expiresIn: EXPIRY.NEVER,
    attributes: [
      PROJECT_ATTRIBUTE,
      { key: "type", value: "instruction" },
      { key: "scope", value: params.scope },
      { key: "agentId", value: params.agentId },
      { key: "priority", value: params.priority },
      { key: "isActive", value: 1 },
      { key: "category", value: params.category },
      { key: "createdAt", value: now },
    ],
  });
}

export async function updateInstruction(
  client: WalletClient,
  entityKey: Hex,
  params: {
    scope: InstructionScope;
    agentId: AgentId;
    priority: number;
    isActive: boolean;
    category: InstructionCategory;
    encryptedPayload: EncryptedPayload;
    createdAt: number;
  }
) {
  return client.updateEntity({
    entityKey,
    payload: encryptedToPayload(params.encryptedPayload),
    contentType: "application/json",
    expiresIn: EXPIRY.NEVER,
    attributes: [
      PROJECT_ATTRIBUTE,
      { key: "type", value: "instruction" },
      { key: "scope", value: params.scope },
      { key: "agentId", value: params.agentId },
      { key: "priority", value: params.priority },
      { key: "isActive", value: params.isActive ? 1 : 0 },
      { key: "category", value: params.category },
      { key: "createdAt", value: params.createdAt },
    ],
  });
}

export async function createContextDocument(
  client: WalletClient,
  params: {
    docType: DocumentType;
    title: string;
    tags: string;
    encryptedPayload: EncryptedPayload;
    sizeBytes: number;
  }
) {
  const now = Date.now();
  return client.createEntity({
    payload: encryptedToPayload(params.encryptedPayload),
    contentType: "application/json",
    expiresIn: EXPIRY.DAYS_365,
    attributes: [
      PROJECT_ATTRIBUTE,
      { key: "type", value: "document" },
      { key: "docType", value: params.docType },
      { key: "title", value: params.title },
      { key: "tags", value: params.tags },
      { key: "sizeBytes", value: params.sizeBytes },
      { key: "createdAt", value: now },
      { key: "updatedAt", value: now },
    ],
  });
}

export async function createAccessGrant(
  client: WalletClient,
  params: {
    granteeWallet: string;
    scope: GrantScope;
    tokenHash: string;
    purpose: string;
    encryptedPayload: EncryptedPayload;
    expiryDays: number;
    encryptedDek: string;
  }
) {
  const now = Date.now();
  return client.createEntity({
    payload: encryptedToPayload(params.encryptedPayload),
    contentType: "application/json",
    expiresIn: params.expiryDays * 24 * 3600,
    attributes: [
      PROJECT_ATTRIBUTE,
      { key: "type", value: "grant" },
      { key: "granteeWallet", value: params.granteeWallet },
      { key: "scope", value: params.scope },
      { key: "tokenHash", value: params.tokenHash },
      { key: "grantedAt", value: now },
      { key: "purpose", value: params.purpose },
      // Stored plaintext so recipients can retrieve it using only the share token
      { key: "encryptedDek", value: params.encryptedDek },
    ],
  });
}

export async function createMemorySnapshot(
  client: WalletClient,
  params: {
    version: number;
    semanticCount: number;
    episodicCount: number;
    totalEntities: number;
    encryptedPayload: EncryptedPayload;
  }
) {
  const now = Date.now();
  return client.createEntity({
    payload: encryptedToPayload(params.encryptedPayload),
    contentType: "application/json",
    expiresIn: EXPIRY.DAYS_365,
    attributes: [
      PROJECT_ATTRIBUTE,
      { key: "type", value: "snapshot" },
      { key: "version", value: params.version },
      { key: "semanticCount", value: params.semanticCount },
      { key: "episodicCount", value: params.episodicCount },
      { key: "totalEntities", value: params.totalEntities },
      { key: "createdAt", value: now },
    ],
  });
}

export async function deleteEntity(client: WalletClient, entityKey: Hex) {
  return client.deleteEntity({ entityKey });
}
