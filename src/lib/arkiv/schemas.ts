import type { Topic, InstructionCategory, InstructionScope, AgentId, DocumentType, GrantScope } from "./constants";

export interface EncryptedPayload {
  iv: string;
  ciphertext: string;
  authTag: string;
  version: "aes-256-gcm-v1";
}

export interface SemanticMemoryPayload {
  content: string;
  source: "user_stated" | "ai_inferred" | "document_extracted";
  confidence: number;
  tags: string[];
  relatedKeys: string[];
}

export interface EpisodicMemoryPayload {
  summary: string;
  keyDecisions: string[];
  openThreads: string[];
  emotionalContext?: string;
  linkedSemanticKeys: string[];
}

export interface InstructionPayload {
  instruction: string;
  rationale?: string;
  examples?: { trigger: string; expectedBehavior: string }[];
  negativeExamples?: string[];
}

export interface DocumentPayload {
  title: string;
  content: string;
  summary: string;
  sourceUrl?: string;
  wordCount: number;
  language: string;
}

export interface GrantPayload {
  encryptedDek: string;
  allowedTopics: string[];
  grantNote: string;
  accessLog: { wallet: string; timestamp: number }[];
}

export interface SnapshotPayload {
  aiSummary: string;
  topTopics: string[];
  recentThemes: string[];
  memoryHealthScore: number;
  entityKeyIndex: string[];
}

// Decoded entity — what we work with after decryption
export interface SemanticMemory {
  entityKey: string;
  topic: Topic;
  importance: number;
  agentId: AgentId;
  confirmed: boolean;
  createdAt: number;
  updatedAt: number;
  payload: SemanticMemoryPayload;
}

export interface EpisodicMemory {
  entityKey: string;
  agentId: AgentId;
  sessionId: string;
  importance: number;
  topic: Topic;
  createdAt: number;
  sessionDate: number;
  payload: EpisodicMemoryPayload;
}

export interface Instruction {
  entityKey: string;
  scope: InstructionScope;
  agentId: AgentId;
  priority: number;
  isActive: boolean;
  category: InstructionCategory;
  createdAt: number;
  payload: InstructionPayload;
}

export interface ContextDocument {
  entityKey: string;
  docType: DocumentType;
  title: string;
  tags: string;
  sizeBytes: number;
  createdAt: number;
  updatedAt: number;
  payload: DocumentPayload;
}

export interface AccessGrant {
  entityKey: string;
  granteeWallet: string;
  scope: GrantScope;
  tokenHash: string;
  grantedAt: number;
  purpose: string;
  payload: GrantPayload;
}

export interface MemorySnapshot {
  entityKey: string;
  version: number;
  semanticCount: number;
  episodicCount: number;
  totalEntities: number;
  createdAt: number;
  payload: SnapshotPayload;
}

// Raw entity from Arkiv (before decryption)
export interface RawEntity {
  key: string;
  value: string | null;
  owner?: string;
  creator?: string;
  expiresAt?: string;
  attributes?: Record<string, string | number>;
}
