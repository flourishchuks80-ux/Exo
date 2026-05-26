/**
 * Seed script — writes ~50 realistic entities for Riku Tanaka (demo user)
 * onto Arkiv Braga testnet.
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 *
 * Requires in .env.local:
 *   SEED_PRIVATE_KEY=0x...  (wallet with GLM on Braga)
 *   SEED_WALLET_ADDRESS=0x... (corresponding address)
 */

import "dotenv/config";
import { createWalletClient, http, jsonToPayload } from "@arkiv-network/sdk";
import { braga } from "@arkiv-network/sdk/chains";
import { privateKeyToAccount } from "@arkiv-network/sdk/accounts";

const PRIVATE_KEY = process.env.SEED_PRIVATE_KEY as `0x${string}`;
const WALLET_ADDRESS = process.env.SEED_WALLET_ADDRESS as string;

if (!PRIVATE_KEY || !WALLET_ADDRESS) {
  console.error("Missing SEED_PRIVATE_KEY or SEED_WALLET_ADDRESS in .env.local");
  process.exit(1);
}

// ─── Crypto helpers (Node 18+ has globalThis.crypto with subtle) ─────────────

function bufferToBase64(buffer: Uint8Array): string {
  return Buffer.from(buffer).toString("base64");
}

function base64ToBuffer(base64: string): Uint8Array {
  return new Uint8Array(Buffer.from(base64, "base64"));
}

async function deriveMasterKey(address: string, signature: string): Promise<CryptoKey> {
  const sigBytes = new Uint8Array(
    signature.slice(2).match(/.{1,2}/g)!.map((b) => parseInt(b, 16))
  );
  const baseKey = await crypto.subtle.importKey("raw", sigBytes, { name: "HKDF" }, false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new TextEncoder().encode(address),
      info: new TextEncoder().encode("exo-master-key-v1"),
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encryptPayload(data: object, masterKey: CryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const plaintext = new TextEncoder().encode(JSON.stringify(data));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, masterKey, plaintext);
  const encryptedBytes = new Uint8Array(encrypted);
  return {
    iv: bufferToBase64(iv),
    ciphertext: bufferToBase64(encryptedBytes.slice(0, -16)),
    authTag: bufferToBase64(encryptedBytes.slice(-16)),
    version: "aes-256-gcm-v1",
  };
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const APP = "exo:v1";
const NEVER = 0;
const DAYS_90 = 90 * 24 * 3600;
const DAYS_365 = 365 * 24 * 3600;

const semanticFacts = [
  { topic: "profession", importance: 95, content: "Riku Tanaka is a fullstack engineer and protocol designer currently working on sovereign data infrastructure and decentralized identity primitives." },
  { topic: "expertise", importance: 90, content: "Riku has deep expertise in TypeScript, Solidity, Rust, and zero-knowledge proof systems. He has shipped 3 production Ethereum protocols." },
  { topic: "project", importance: 88, content: "Riku is building Exo — a sovereign AI memory platform that stores encrypted context on Arkiv Braga testnet, giving users full ownership over their AI's memory." },
  { topic: "background", importance: 85, content: "Riku studied computer science at Tokyo University, then moved to San Francisco to join a Series A blockchain startup where he led protocol engineering for 3 years." },
  { topic: "goal", importance: 82, content: "Riku's primary goal is to win the ETHns × Arkiv Hackathon 2026 with Exo and use it to launch a full product with sovereign AI memory as a core primitive." },
  { topic: "preference", importance: 80, content: "Riku prefers concise, technically precise responses. He dislikes filler phrases like 'Great question!' and always wants code-first answers when applicable." },
  { topic: "communication_style", importance: 78, content: "Riku communicates in engineering shorthand. He values directness, assumes a high technical baseline, and appreciates when trade-offs are stated explicitly." },
  { topic: "tools", importance: 75, content: "Daily tools: Cursor (primary IDE), Claude Code (AI), Vercel (deployment), Linear (project management), Arkiv SDK (on-chain data), Privy (wallet auth)." },
  { topic: "learning", importance: 72, content: "Currently deep-diving into the Arkiv SDK, EigenLayer restaking mechanics, and the Nova proving system for recursive zkSNARKs." },
  { topic: "values", importance: 70, content: "Riku's core values are sovereignty (users own their data), transparency (open protocols), and composability (everything should be an API)." },
  { topic: "constraint", importance: 68, content: "Riku is currently in hackathon crunch mode — responses should be optimized for speed and implementation over theory." },
  { topic: "preference", importance: 65, content: "Riku prefers dark mode UIs with teal accents. He finds light mode physically uncomfortable and won't ship products without dark mode." },
  { topic: "project", importance: 63, content: "Exo uses 6 entity types on Arkiv: SemanticMemory, EpisodicMemory, Instruction, ContextDocument, AccessGrant, MemorySnapshot — all AES-256-GCM encrypted." },
  { topic: "expertise", importance: 60, content: "Riku can speak authoritatively on: EVM internals, HKDF key derivation, AES-GCM encryption, Arkiv query patterns, Next.js 15 App Router, and TanStack Query v5." },
  { topic: "location", importance: 58, content: "Riku is based in Tokyo, Japan. He works JST hours (UTC+9), typically 10am–12am. Most of his collaborators are in the US, so async communication is standard." },
  { topic: "relationship", importance: 55, content: "Riku's main collaborators on Exo include 2 fellow hackers from the Network School cohort and his former colleague who leads DeFi protocol research at a16z." },
  { topic: "goal", importance: 53, content: "Post-hackathon, Riku plans to raise a pre-seed round for Exo as a production product, targeting AI developers who want sovereign memory primitives." },
  { topic: "background", importance: 50, content: "Riku spoke at Devcon 7 on the topic of 'Sovereign Compute: Why AI needs on-chain memory.' The talk has 12k views on YouTube." },
  { topic: "preference", importance: 48, content: "Riku's default Claude model is Opus 4.7. He uses Haiku 4.5 for fast classification and summarization tasks where latency matters." },
  { topic: "health", importance: 45, content: "Riku exercises every morning — 5km run followed by 20 minutes of kettlebell. He doesn't schedule meetings before 10am to protect this routine." },
];

const instructions = [
  { scope: "global", category: "behavior", priority: 10, title: "Always be direct", rule: "Never use filler phrases. Get to the answer immediately. If you don't know something, say so directly." },
  { scope: "global", category: "format", priority: 9, title: "Code-first answers", rule: "For technical questions, always lead with working code. Explain after, not before. Use TypeScript unless another language is explicitly requested." },
  { scope: "global", category: "tone", priority: 8, title: "Engineering tone", rule: "Assume Riku has 10+ years of engineering experience. Don't explain basic concepts. Use precise technical vocabulary." },
  { scope: "model-specific", category: "behavior", priority: 7, title: "State trade-offs", rule: "When suggesting an approach, always state the main trade-off: performance vs. readability, security vs. convenience, etc." },
  { scope: "global", category: "constraint", priority: 6, title: "No fluff in code reviews", rule: "In code review mode: only flag actual bugs, security issues, or significant performance problems. Don't nitpick style." },
  { scope: "topic-specific", category: "trigger", priority: 5, title: "Hackathon context", rule: "Riku is in hackathon mode. Prioritize 'ship fast' recommendations. Perfect is the enemy of done." },
];

const episodes = [
  {
    topic: "project",
    agentId: "claude",
    summary: "Designed the Exo architecture for the ETHns × Arkiv Hackathon. Decided on 6 entity types, AES-256-GCM encryption with HKDF key derivation from wallet signature, and Privy for embedded wallets. The demo mode approach using a seeded Riku Tanaka context was confirmed.",
    keyDecisions: ["Use Privy embedded wallets (no MetaMask friction for judges)", "AES-256-GCM with iv=16 bytes and separate authTag storage", "Demo mode at /chat?demo=true with hardcoded system prompt"],
    openThreads: ["Need to test actual Arkiv SDK write latency on Braga", "Determine if grant sharing flow works end-to-end"],
  },
  {
    topic: "expertise",
    agentId: "claude",
    summary: "Deep research session on Arkiv SDK query patterns. Confirmed: predicates go in where(), ownedBy() filters by wallet, orderBy() takes field + type + direction. The buildQuery() pattern is the core abstraction. No raw RPC needed.",
    keyDecisions: ["Use eq/gte/lt from @arkiv-network/sdk/query", "Always include app=exo:v1 in every query for namespacing", "Use withMetadata(true) for createdAt on-chain timestamp"],
    openThreads: ["Test count() method accuracy with live data"],
  },
  {
    topic: "project",
    agentId: "gpt",
    summary: "Designed the sharing protocol using share tokens. The flow: generate 32 random bytes → base64url as shareToken → hash for Arkiv attribute → HKDF-derived shareKey from token → encrypt masterKey with shareKey. Grantee decrypts masterKey on the /shared/[token] page.",
    keyDecisions: ["Store tokenHash as Arkiv attribute, not the token itself", "Use PBKDF2(shareToken + ownerAddress) as shareKey derivation", "Grant payload stores encryptedDek for masterKey recovery"],
    openThreads: ["The shared page needs a non-client-side approach to decryptMasterKeyFromShare"],
  },
];

const document = {
  docType: "project_brief",
  title: "Exo — Sovereign AI Memory Platform",
  tags: "arkiv,ai,memory,sovereignty,hackathon",
  content: `# Exo: Sovereign AI Memory

## Problem
AI assistants like Claude, ChatGPT, and Gemini have no persistent memory across sessions. Every conversation starts from zero. Users have no ownership of their AI context — it's trapped in silos owned by AI companies.

## Solution
Exo gives every user a sovereign AI memory that lives on-chain on Arkiv Braga testnet. 6 entity types cover all memory needs: facts, sessions, instructions, documents, grants, and snapshots. All data is encrypted client-side before hitting the chain.

## Architecture
- Frontend: Next.js 15 App Router, TypeScript, Tailwind
- Auth: Privy embedded wallets (zero MetaMask friction)
- Chain: Arkiv Braga testnet (Chain ID: 60138453102)
- Encryption: AES-256-GCM, HKDF master key from wallet signature
- AI: Claude (primary), GPT-4, Gemini (switchable)
- State: TanStack Query v5

## Entity Types
1. SemanticMemory — permanent facts (importance 0–100)
2. EpisodicMemory — 90-day session summaries
3. Instruction — standing rules for AI behavior
4. ContextDocument — 365-day reference documents
5. AccessGrant — time-scoped sharing with share tokens
6. MemorySnapshot — point-in-time memory state

## Demo
The /chat?demo=true page uses a pre-seeded Riku Tanaka context without requiring a wallet. Judges can immediately see the sovereign memory system in action.
`,
};

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding Exo entities for demo user:", WALLET_ADDRESS);
  console.log("📡 Chain: Arkiv Braga testnet");
  console.log();

  const account = privateKeyToAccount(PRIVATE_KEY);
  const client = createWalletClient({
    chain: braga,
    transport: http(),
    account,
  });

  // Derive master key from a deterministic "signature" for the seed script
  // In production the wallet signs; here we use a fixed seed phrase
  const SEED_SIGNATURE = "0x" + "ab".repeat(65); // deterministic fake sig for seed
  const masterKey = await deriveMasterKey(WALLET_ADDRESS, SEED_SIGNATURE);
  console.log("🔑 Master key derived");

  const now = Date.now();
  let written = 0;

  // Write semantic memories
  console.log(`\n📚 Writing ${semanticFacts.length} semantic memories...`);
  for (const fact of semanticFacts) {
    try {
      const encrypted = await encryptPayload({
        content: fact.content,
        source: "manual",
        confidence: 0.95,
        tags: [fact.topic],
        relatedKeys: [],
      }, masterKey);

      const result = await client.createEntity({
        payload: jsonToPayload(encrypted),
        contentType: "application/json",
        expiresIn: NEVER,
        attributes: [
          { key: "app", value: APP },
          { key: "type", value: "semantic" },
          { key: "topic", value: fact.topic },
          { key: "importance", value: fact.importance },
          { key: "agentId", value: "claude" },
          { key: "confirmed", value: 1 },
          { key: "createdAt", value: now - Math.floor(Math.random() * 30) * 86400000 },
          { key: "updatedAt", value: now },
        ],
      });
      written++;
      process.stdout.write(`  ✓ [${written}] ${fact.topic}: ${fact.content.slice(0, 60)}...\n`);
    } catch (err) {
      console.error(`  ✗ Failed:`, err instanceof Error ? err.message : err);
    }
  }

  // Write instructions
  console.log(`\n📋 Writing ${instructions.length} instructions...`);
  for (const inst of instructions) {
    try {
      const encrypted = await encryptPayload({
        title: inst.title,
        rule: inst.rule,
        examples: [],
        exceptions: [],
      }, masterKey);

      await client.createEntity({
        payload: jsonToPayload(encrypted),
        contentType: "application/json",
        expiresIn: NEVER,
        attributes: [
          { key: "app", value: APP },
          { key: "type", value: "instruction" },
          { key: "scope", value: inst.scope },
          { key: "agentId", value: "any" },
          { key: "priority", value: inst.priority },
          { key: "isActive", value: 1 },
          { key: "category", value: inst.category },
          { key: "createdAt", value: now },
        ],
      });
      written++;
      process.stdout.write(`  ✓ instruction: ${inst.title}\n`);
    } catch (err) {
      console.error(`  ✗ Failed:`, err instanceof Error ? err.message : err);
    }
  }

  // Write episodic memories
  console.log(`\n🗓  Writing ${episodes.length} episodic memories...`);
  for (let i = 0; i < episodes.length; i++) {
    const ep = episodes[i];
    try {
      const encrypted = await encryptPayload({
        summary: ep.summary,
        keyDecisions: ep.keyDecisions,
        openThreads: ep.openThreads,
        linkedSemanticKeys: [],
      }, masterKey);

      const sessionDate = parseInt(
        new Date(now - i * 3 * 86400000).toISOString().slice(0, 10).replace(/-/g, ""),
        10
      );

      await client.createEntity({
        payload: jsonToPayload(encrypted),
        contentType: "application/json",
        expiresIn: DAYS_90,
        attributes: [
          { key: "app", value: APP },
          { key: "type", value: "episodic" },
          { key: "agentId", value: ep.agentId },
          { key: "sessionId", value: `0x${(now - i * 3 * 86400000).toString(16)}` },
          { key: "importance", value: 70 },
          { key: "topic", value: ep.topic },
          { key: "createdAt", value: now - i * 3 * 86400000 },
          { key: "sessionDate", value: sessionDate },
        ],
      });
      written++;
      process.stdout.write(`  ✓ episodic: ${ep.summary.slice(0, 60)}...\n`);
    } catch (err) {
      console.error(`  ✗ Failed:`, err instanceof Error ? err.message : err);
    }
  }

  // Write context document
  console.log(`\n📄 Writing project brief document...`);
  try {
    const encrypted = await encryptPayload({
      title: document.title,
      content: document.content,
      url: null,
      excerpt: document.content.slice(0, 200),
      wordCount: document.content.split(" ").length,
    }, masterKey);

    await client.createEntity({
      payload: jsonToPayload(encrypted),
      contentType: "application/json",
      expiresIn: DAYS_365,
      attributes: [
        { key: "app", value: APP },
        { key: "type", value: "document" },
        { key: "docType", value: document.docType },
        { key: "title", value: document.title },
        { key: "tags", value: document.tags },
        { key: "sizeBytes", value: document.content.length },
        { key: "createdAt", value: now },
        { key: "updatedAt", value: now },
      ],
    });
    written++;
    console.log(`  ✓ document: ${document.title}`);
  } catch (err) {
    console.error(`  ✗ Failed:`, err instanceof Error ? err.message : err);
  }

  // Write memory snapshot
  console.log(`\n📸 Writing initial memory snapshot...`);
  try {
    const encrypted = await encryptPayload({
      aiSummary: "Riku Tanaka's sovereign AI memory is initialized with 20 semantic facts, 6 standing instructions, 3 episodic sessions, and 1 project brief. His memory reflects a senior protocol engineer in hackathon mode, building sovereign AI infrastructure on Arkiv. High-confidence knowledge across TypeScript, Solidity, and cryptography. Communication style: direct, technical, code-first.",
      topTopics: ["profession", "project", "expertise", "preference", "communication_style"],
      recentThemes: ["Exo hackathon", "Arkiv SDK", "sovereign memory", "encryption"],
      memoryHealthScore: 82,
      entityKeyIndex: [],
    }, masterKey);

    await client.createEntity({
      payload: jsonToPayload(encrypted),
      contentType: "application/json",
      expiresIn: DAYS_365,
      attributes: [
        { key: "app", value: APP },
        { key: "type", value: "snapshot" },
        { key: "version", value: 1 },
        { key: "semanticCount", value: semanticFacts.length },
        { key: "episodicCount", value: episodes.length },
        { key: "totalEntities", value: semanticFacts.length + episodes.length + instructions.length + 1 },
        { key: "createdAt", value: now },
      ],
    });
    written++;
    console.log("  ✓ snapshot: v1");
  } catch (err) {
    console.error(`  ✗ Failed:`, err instanceof Error ? err.message : err);
  }

  console.log(`\n✅ Done! ${written} entities written to Arkiv Braga testnet.`);
  console.log(`\n📌 Wallet address: ${WALLET_ADDRESS}`);
  console.log(`🔗 Explorer: https://explorer.braga.hoodi.arkiv.network/address/${WALLET_ADDRESS}`);
  console.log(`\n⚠️  IMPORTANT: Update DEMO_WALLET_ADDRESS in src/lib/ai/systemPrompt.ts to ${WALLET_ADDRESS}`);
  console.log(`⚠️  IMPORTANT: The master key for this demo user uses SEED_SIGNATURE (fixed fake sig).`);
  console.log(`    The /chat?demo=true mode uses the hardcoded system prompt, NOT live decryption.`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
