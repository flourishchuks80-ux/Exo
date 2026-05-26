export const PROJECT_ATTRIBUTE = { key: "app", value: "exo:v1" } as const;

export const ENTITY_TYPES = {
  SEMANTIC: "semantic",
  EPISODIC: "episodic",
  INSTRUCTION: "instruction",
  DOCUMENT: "document",
  GRANT: "grant",
  SNAPSHOT: "snapshot",
} as const;

export type EntityType = (typeof ENTITY_TYPES)[keyof typeof ENTITY_TYPES];

export const TOPIC_TAXONOMY = [
  "profession",
  "expertise",
  "project",
  "preference",
  "communication_style",
  "goal",
  "constraint",
  "relationship",
  "location",
  "schedule",
  "health",
  "finance",
  "learning",
  "values",
  "background",
] as const;

export type Topic = (typeof TOPIC_TAXONOMY)[number];

export const INSTRUCTION_CATEGORIES = [
  "tone",
  "format",
  "behavior",
  "constraint",
  "trigger",
] as const;

export type InstructionCategory =
  (typeof INSTRUCTION_CATEGORIES)[number];

export const INSTRUCTION_SCOPES = [
  "global",
  "model-specific",
  "topic-specific",
] as const;

export type InstructionScope = (typeof INSTRUCTION_SCOPES)[number];

export const DOCUMENT_TYPES = [
  "project_brief",
  "resume",
  "research",
  "notes",
  "reference",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const GRANT_SCOPES = [
  "semantic",
  "episodic",
  "documents",
  "full",
] as const;

export type GrantScope = (typeof GRANT_SCOPES)[number];

export const AGENT_IDS = ["claude", "gpt", "gemini", "any"] as const;
export type AgentId = (typeof AGENT_IDS)[number];

// expiresIn in seconds — BTL=0 fails Arkiv RLP decoding; use large value for permanent
export const EXPIRY = {
  NEVER: 100 * 365 * 24 * 3600,
  DAYS_7: 7 * 24 * 3600,
  DAYS_30: 30 * 24 * 3600,
  DAYS_90: 90 * 24 * 3600,
  DAYS_365: 365 * 24 * 3600,
} as const;

export const BRAGA_EXPLORER = "https://explorer.braga.hoodi.arkiv.network";
