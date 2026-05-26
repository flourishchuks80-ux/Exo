<div align="center">

```
███████╗██╗  ██╗ ██████╗
██╔════╝╚██╗██╔╝██╔═══██╗
█████╗   ╚███╔╝ ██║   ██║
██╔══╝   ██╔██╗ ██║   ██║
███████╗██╔╝ ██╗╚██████╔╝
╚══════╝╚═╝  ╚═╝ ╚═════╝
```

### **Sovereign AI Memory**

*Not your keys, not your bots. Now your keys. Your bots.*

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://exo-arkiv.vercel.app)
[![Arkiv Braga](https://img.shields.io/badge/On_Chain-Arkiv_Braga-00D4AA?style=for-the-badge)](https://braga.hoodi.arkiv.network)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)
[![ETHns × Arkiv Challenge 2026](https://img.shields.io/badge/ETHns_×_Arkiv-Challenge_2026-blue?style=for-the-badge)](https://forms.arkiv.network/ethns-arkiv-challenge)

</div>

---

## The Problem

> **"In February 2025, OpenAI pushed a backend update that wiped years of user memory data without warning."**
> *Affected users lost months of conversation history. Many accounts were never fully restored. No explanation. No recovery path. No accountability.*

Every AI you use today has memory. **None of it belongs to you.**

When you use ChatGPT, OpenAI stores what it learns about you on their servers. When you switch from ChatGPT to Claude, your AI starts from zero. When you switch from Claude to Gemini — same thing. Your context, preferences, project history, communication style, and domain knowledge are trapped inside whichever platform you used last.

You are renting an AI. You own nothing.

Every major AI memory system — Mem0, Zep, LangMem, Letta — stores data in centralized infrastructure. The platform controls it entirely. Users have no versioning, no automatic backup, and no real export capability. The AI memory market has already reached **$6.27 billion in 2026** and is projected to hit **$28.45 billion by 2030**. Every dollar in that market flows through platforms that can delete your data on a Tuesday afternoon.

Balaji Srinivasan identified this in February 2026:

> *"The fundamental question is whether AI stays on the leash. Private keys — not prompts — should determine who controls AI systems. Not your keys, not your bots."*

---

## The Solution

**Exo is a sovereign AI memory layer built entirely on Arkiv.** It gives any AI agent a persistent, encrypted, wallet-owned memory that travels with you across every model, every platform, and every session — forever.

```
You open any AI interface
         │
         ▼
AI fetches your Exo context from Arkiv (public read, encrypted payload)
         │
         ▼
AI decrypts context using your key  ◄─── client-side only, never the server
         │
         ▼
AI responds with full knowledge of who you are
         │
         ▼
Conversation produces new memories
         │
         ▼
AI writes new memory entities to Arkiv (signed by your wallet)
         │
         ▼
  You own the new memories.
  The platform owns nothing.
```

```
Your Wallet ──signs──▶  Exo Memory on Arkiv Braga
                                │
                    (AES-256-GCM encrypted)
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
           Claude              GPT             Gemini
              └─────────────────┴─────────────────┘
                       reads from Arkiv
              Any model. Any time. Your keys.
```

---

## Live Demo

| Link | Description |
|---|---|
| **[→ Open App](https://exo-arkiv.vercel.app)** | Full application on Vercel |
| **[→ AI Chat Demo](https://exo-arkiv.vercel.app/chat)** | Live AI chat powered by on-chain memory |
| **[→ Verify On-Chain](https://exo-arkiv.vercel.app/verify)** | Judge verification panel — live Arkiv queries |
| **[→ Braga Explorer](https://braga.hoodi.arkiv.network)** | Inspect `app = "exo:v1"` entities directly |

---

## Features

### Core Memory System

| Feature | What It Does |
|---|---|
| **Sovereign Memory Layer** | Six Arkiv entity types mapping all four cognitive memory categories (semantic, episodic, procedural, working) to permanent, wallet-owned on-chain data |
| **AES-256-GCM Encryption** | Every payload is encrypted in the browser before touching Arkiv. The server never sees plaintext. Your master key is derived fresh from your wallet signature every session and held in memory only — never stored, never transmitted |
| **HKDF Key Derivation** | Master key derived via HKDF from your wallet signature: `sign("Exo sovereign memory key derivation v1 — [address]")` → 256-bit AES key. Deterministic — same wallet, same key, every time |
| **Immutable $creator** | Every Arkiv entity records your wallet as `$creator`. This is cryptographically immutable. No platform can claim ownership of what you wrote |

### AI Chat

| Feature | What It Does |
|---|---|
| **Live AI Chat** | Full chat interface that silently queries Arkiv before every session — loading your semantic memories, instructions, and recent episodes into the AI context |
| **Memory Sources Panel** | Real-time right-panel showing exactly which Arkiv entities the AI is drawing from, with entity keys and explorer links. Makes the invisible visible |
| **Model Switcher** | Switch between Claude, GPT-4o, and Gemini mid-conversation. The new model reads from the same Arkiv entities — same context, different model. This is the product's most powerful demo moment |
| **Memory Suggestions** | After each AI response, Exo surfaces a one-click prompt to save any new fact to Arkiv. Memory grows from every conversation |
| **Session Episodes** | At session end (or after 30 min inactivity), the AI auto-generates a session summary and writes an EpisodicMemory entity to Arkiv — key decisions, open threads, and linked semantic facts included |
| **Telegram Integration** | Telegram bot integration that injects Exo memory context into conversations — full memory sovereignty outside the browser |

### Memory Management

| Feature | What It Does |
|---|---|
| **Semantic Memory Browser** | View, edit, filter, and manage all semantic facts about you. Each card shows topic, importance score (1–100), source (user-stated / AI-inferred / document-extracted), confirmation status, and its Arkiv entity key |
| **Importance Scoring** | Numeric importance attribute (1–100) enables range queries — critical context is always injected, low-importance context is loaded selectively |
| **Episodic Timeline** | Chronological view of all past AI sessions, grouped by month. Each session shows the model used, AI-generated summary, key decisions made, and open threads |
| **Instructions Manager** | Priority-ordered standing rules for any AI — global rules, model-specific rules, topic-specific triggers. Active/paused toggle updates the `isActive` attribute on Arkiv |
| **Context Documents** | Personal knowledge base — paste documents, briefs, resumes, or research. Documents are encrypted and stored on Arkiv, loaded into AI context on demand |
| **Confirmation Flow** | AI-inferred memories are flagged as `confirmed: 0` until you approve them. Only confirmed memories are injected by default — you always control what the AI knows |

### Dashboard & Analytics

| Feature | What It Does |
|---|---|
| **Memory Dashboard** | Command center showing all memory types at a glance, recent on-chain activity, and the AI-generated insight banner |
| **Sovereignty Score** | A 0–100 "Memory Sovereignty Score" measuring how complete and fresh your on-chain memory is — semantic facts, active instructions, recent episodes, documents, and freshness all contribute |
| **On-Chain Activity Feed** | Last 10 Arkiv writes with entity type, timestamp, and transaction hash. Every entry independently verifiable |

### Sharing & Collaboration

| Feature | What It Does |
|---|---|
| **Access Grants** | Time-scoped (1–90 days), wallet-gated memory sharing. Scope control: semantic only, full, documents only. Revocable instantly by deleting the Arkiv entity |
| **Shared Memory View** | Public read-only view at `/shared/[token]` — no login required. Anyone with the link reads your permitted memories, decrypted client-side from the share token |
| **DEK Re-encryption** | Share grants re-encrypt your master Data Encryption Key with a share-token-derived key. The actual plaintext is never transmitted — the grantee derives the decryption key from the share token alone |

### Backup & Recovery

| Feature | What It Does |
|---|---|
| **Memory Snapshots** | Point-in-time compressed backup of your full memory state, AI-generated narrative, top topics, and entity key index. Stored as versioned Arkiv entities |
| **Snapshot Rollback** | Restore any previous snapshot — diffs current state against snapshot, shows what changes, executes with confirmation |

### Import & Onboarding

| Feature | What It Does |
|---|---|
| **ChatGPT Import** | Upload your ChatGPT data export ZIP. Exo parses `conversations.json`, extracts semantic facts via AI, and presents a review-and-approve flow before writing anything to Arkiv |
| **URL Import** | Paste any URL (personal site, LinkedIn, GitHub profile, Notion page) — Exo extracts structured context and proposes memories |
| **Plain Text Import** | Paste a bio, resume, or any text describing yourself. AI extracts semantic facts, you approve individually before they go on-chain |

### Developer & Verification

| Feature | What It Does |
|---|---|
| **Verification Panel** | Live Arkiv queries on page load — shows real entity counts, copyable query snippets, and explorer links. Judges can verify everything independently in 30 seconds |
| **Developer Documentation** | Copy-paste TypeScript code for reading and writing Exo memory using the Arkiv SDK. Full integration checklist |

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | SSR, Vercel-native, streaming AI responses |
| **Language** | TypeScript 5 | End-to-end type safety across all entity schemas |
| **Styling** | Tailwind CSS + shadcn/ui | Production-quality UI without bespoke CSS overhead |
| **Fonts** | Geist Sans + Geist Mono | Clean authority for headings; monospace for keys and hashes |
| **Auth / Wallets** | Privy v3 (email + embedded EVM wallet) | Zero-friction onboarding — no MetaMask required |
| **On-Chain Storage** | `@arkiv-network/sdk@0.6.8` on Braga (Chain ID: 60138453102) | The entire persistence layer |
| **Encryption** | Web Crypto API — AES-256-GCM + HKDF | Client-side only — server never handles plaintext |
| **AI** | Vercel AI SDK + Claude `claude-sonnet-4-20250514` | Streaming AI chat with structured tool use |
| **Multi-model** | OpenAI SDK + Google Generative AI SDK | GPT-4o and Gemini model switcher |
| **Telegram** | Telegram Bot API via Next.js API routes | Memory context outside the browser |
| **Animation** | Framer Motion | Polished transitions on writing-to-chain flows |
| **Icons** | Lucide React | Consistent icon system |
| **State** | TanStack Query v5 | Arkiv query caching and background sync |
| **Charts** | Recharts | Memory analytics visualization |
| **Deploy** | Vercel | One-command deployment |

---

## Architecture — 6 Arkiv Entity Types

Every entity carries `PROJECT_ATTRIBUTE: { key: "app", value: "exo:v1" }` — applied on every `createEntity` call and every `buildQuery` call, without exception.

### SemanticMemory — *Permanent facts about you*

```
Attributes: app, type="semantic", topic, importance (1–100), agentId,
            confirmed (0|1), createdAt, updatedAt
Payload:    { content, source, confidence, tags, relatedKeys }
TTL:        Never — your identity doesn't expire
```

15-topic taxonomy: `profession` · `expertise` · `project` · `preference` · `communication_style` · `goal` · `constraint` · `relationship` · `location` · `schedule` · `health` · `finance` · `learning` · `values` · `background`

### EpisodicMemory — *Records of past conversations*

```
Attributes: app, type="episodic", agentId, sessionId, importance,
            topic, createdAt, sessionDate (YYYYMMDD for range queries)
Payload:    { summary, keyDecisions, openThreads, emotionalContext,
              linkedSemanticKeys }
TTL:        90 days — episodes fade; the important parts become semantic
```

### Instruction — *Your standing orders to any AI*

```
Attributes: app, type="instruction", scope, agentId, priority (1–10),
            isActive (0|1), category, createdAt
Payload:    { instruction, rationale, examples, negativeExamples }
TTL:        Never — instructions persist until you delete them
```

Categories: `tone` · `format` · `behavior` · `constraint` · `trigger`

### ContextDocument — *Your personal knowledge base*

```
Attributes: app, type="document", docType, title, tags,
            sizeBytes, createdAt, updatedAt
Payload:    { title, content, summary, sourceUrl, wordCount, language }
TTL:        365 days — documents expire annually; user renews
```

### AccessGrant — *Time-scoped memory sharing*

```
Attributes: app, type="grant", granteeWallet, scope, tokenHash,
            grantedAt, purpose
Payload:    { encryptedDek, allowedTopics, grantNote, accessLog }
TTL:        Configurable 1–90 days — enforced by Arkiv
```

### MemorySnapshot — *Versioned backup*

```
Attributes: app, type="snapshot", version, semanticCount, episodicCount,
            totalEntities, createdAt
Payload:    { aiSummary, topTopics, recentThemes, memoryHealthScore,
              entityKeyIndex }
TTL:        365 days — one year of snapshot history
```

---

## Encryption Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     KEY DERIVATION                              │
│                                                                 │
│  1. User signs: "Exo sovereign memory key derivation v1 — [addr]"
│  2. HKDF(signature, salt=walletAddress, info="exo-master-key-v1")
│  3. → masterKey (256-bit, held in memory only, never stored)    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  PER-ENTITY ENCRYPTION                          │
│                                                                 │
│  1. Generate random 16-byte IV (crypto.getRandomValues)         │
│  2. AES-256-GCM encrypt(JSON.stringify(payload), masterKey, IV) │
│  3. Store on Arkiv: { iv, ciphertext, authTag, version }        │
│  4. authTag detects any tampering on read                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SHARE GRANT FLOW                             │
│                                                                 │
│  1. Generate random 32-byte shareToken                          │
│  2. shareKey = HKDF(shareToken, ownerWallet, "exo-share-v1")   │
│  3. encryptedDek = encrypt(masterKey, shareKey)                 │
│  4. Store encryptedDek in AccessGrant on Arkiv                  │
│  5. Share URL = /shared/[base64url(shareToken)]                 │
│                                                                 │
│  Grantee reads URL → derives shareKey → decrypts masterKey     │
│  → decrypts permitted entities. Plaintext never hits a server.  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Quick Start — 5 Minutes

### Prerequisites

- Node.js 18+
- A [Privy](https://dashboard.privy.io) App ID (free — create an app, copy the App ID)
- An [Anthropic API key](https://console.anthropic.com) for Claude (the primary AI model)

### Setup

```bash
git clone https://github.com/flourishchuks80-ux/Exo.git
cd Exo
npm install
cp .env.example .env.local
```

Open `.env.local` and fill in the two required values:

```bash
# Required — get at https://dashboard.privy.io
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id

# Required — get at https://console.anthropic.com
ANTHROPIC_API_KEY=sk-ant-...

# Optional — needed only for the model switcher (GPT-4o and Gemini)
OPENAI_API_KEY=sk-...
GOOGLE_GENERATIVE_AI_API_KEY=...

# Set to your deployment URL (or leave as-is for local dev)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```bash
npm run dev
# → http://localhost:3000
```

That's it. Connect your wallet via the landing page, and Exo will derive your master key from a wallet signature. You're ready to write your first memory to Arkiv Braga.

---

## Seed Demo Data

To experience the full product with a pre-populated memory (recommended for judges), seed ~50 realistic entities for a demo user:

**Step 1** — Get GLM tokens from the Braga faucet:
[https://braga.hoodi.arkiv.network/faucet](https://braga.hoodi.arkiv.network/faucet)

**Step 2** — Add your seed wallet to `.env.local`:

```bash
SEED_PRIVATE_KEY=0x...       # Private key of a funded Braga wallet
SEED_WALLET_ADDRESS=0x...    # Corresponding public address
```

**Step 3** — Run the seed script:

```bash
npm run seed
```

This creates:
- **25 semantic memories** across 8 topics (profession, projects, preferences, background, goals, constraints, communication style, expertise)
- **8 instructions** covering tone, format, behavior, and constraints
- **12 episodic sessions** spanning the last 30 days across Claude, GPT, and Gemini
- **3 context documents** (technical brief, resume, pitch notes)
- **2 memory snapshots** (showing version history)

Total: **~50 entities** on Arkiv Braga, all encrypted, all wallet-owned.

---

## Verify On-Chain

Everything in Exo is independently verifiable. Run this snippet in any Node.js environment:

```javascript
import { createPublicClient, http } from '@arkiv-network/sdk';
import { braga } from '@arkiv-network/sdk/chains';
import { eq, gte } from '@arkiv-network/sdk/query';

const client = createPublicClient({
  chain: braga,
  transport: http('https://braga.hoodi.arkiv.network/rpc')
});

// Fetch all Exo semantic memories (no auth required)
const result = await client.buildQuery()
  .where([eq('app', 'exo:v1'), eq('type', 'semantic')])
  .withAttributes(true)
  .withPayload(true)
  .limit(100)
  .fetch();

console.log(`Total Exo semantic memories on Braga: ${result.total}`);
result.entities.forEach(e => {
  const attrs = e.attributes.reduce((acc, a) => ({ ...acc, [a.key]: a.value }), {});
  console.log(`  → topic=${attrs.topic} importance=${attrs.importance} key=${e.key}`);
});
```

Or visit the **[Verification Panel](https://exo-arkiv.vercel.app/verify)** in the app — it runs these queries live on page load and provides copyable snippets for all entity types.

**Direct explorer links:**
- [Braga Explorer](https://braga.hoodi.arkiv.network) — filter by `app = "exo:v1"`
- [data.arkiv.network](https://data.arkiv.network) — query interface

---

## Arkiv Query Patterns Used

Exo demonstrates all major Arkiv query capabilities:

```typescript
// Equality filter + numeric range (importance ≥ 60)
.where([eq('app','exo:v1'), eq('type','semantic'), eq('confirmed',1)])
.where([gte('importance', 60)])
.orderBy('importance', 'number', 'desc')

// Date range query (episodes in last 30 days)
.where([eq('app','exo:v1'), eq('type','episodic')])
.where([gte('createdAt', thirtyDaysAgo)])
.orderBy('createdAt', 'number', 'desc')

// Priority range (instructions ≥ priority 8)
.where([eq('app','exo:v1'), eq('type','instruction'), eq('isActive',1)])
.where([gte('priority', 8)])
.orderBy('priority', 'number', 'desc')

// Cross-wallet read (team memory with share grant)
.where([eq('app','exo:v1'), eq('type','semantic')])
.ownedBy(teammateWallet)

// Token hash lookup (no ownedBy — public grant verification)
.where([eq('app','exo:v1'), eq('type','grant'), eq('tokenHash', hash)])
```

---

## Application Pages

| Route | Page | Description |
|---|---|---|
| `/` | Landing | Pitch page — the problem, the solution, live demo embed |
| `/dashboard` | Dashboard | Sovereignty Score ring, memory stats, on-chain activity |
| `/memory` | Memory Browser | Full memory library with search and filter |
| `/memory/semantic` | Semantic | Topic-organized facts with importance management |
| `/memory/episodic` | Episodic | Session timeline grouped by month and model |
| `/memory/instructions` | Instructions | Priority-ordered AI rules with drag-to-reorder |
| `/memory/documents` | Documents | Context document vault |
| `/memory/new` | Add Memory | Three-step form to create any memory type |
| `/chat` | AI Chat | Live AI demo with Memory Sources panel |
| `/share` | Share Center | Active grant management |
| `/share/new` | Create Grant | Time-scoped share link generator |
| `/shared/[token]` | Grantee View | Public read-only (no auth required) |
| `/snapshot` | Snapshots | Version history and rollback |
| `/import` | Import | ChatGPT export / URL / plain text migration |
| `/settings` | Settings | Wallet, API keys, preferences |
| `/verify` | Verification | Judge verification panel with live queries |
| `/docs` | Developer Docs | SDK integration guide with copy-paste code |

---

## Submission Requirements

This submission meets all ETHns × Arkiv Challenge 2026 requirements:

- [x] **Theme**: AI + Privacy Hybrid — sovereign encrypted memory on a public chain
- [x] **GitHub repo**: Public, open source, MIT license, setup in < 5 minutes
- [x] **Demo link**: Working deployment on Arkiv Braga testnet
- [x] **Demo video**: 3-minute script produced (see [PRD Demo Video Script](#))
- [x] **`PROJECT_ATTRIBUTE`**: `app = "exo:v1"` on every entity and every query — no exceptions
- [x] **Entity types**: 6 types covering all AI memory categories with TTL, range queries, and relationships
- [x] **Range queries**: `importance ≥ N`, `priority ≥ N`, `sessionDate` range, `createdAt` range
- [x] **Entity relationships**: `EpisodicMemory.linkedSemanticKeys` → `SemanticMemory` keys
- [x] **Encryption**: AES-256-GCM on all payloads, client-side only, key never leaves browser
- [x] **Time-scoped access**: `AccessGrant` with configurable TTL enforced by Arkiv
- [x] **Versioning**: `MemorySnapshot` with rollback
- [x] **Submit**: [forms.arkiv.network/ethns-arkiv-challenge](https://forms.arkiv.network/ethns-arkiv-challenge)

---

## Project Structure

```
exo/
├── src/
│   ├── app/
│   │   ├── page.tsx                      # Landing page
│   │   ├── dashboard/page.tsx            # Memory dashboard
│   │   ├── memory/                       # Memory browser (all types)
│   │   ├── chat/page.tsx                 # AI chat + Memory Sources panel
│   │   ├── share/                        # Grant management
│   │   ├── shared/[token]/page.tsx       # Public grantee view
│   │   ├── snapshot/page.tsx             # Snapshot history + rollback
│   │   ├── import/page.tsx               # Memory import tools
│   │   ├── verify/page.tsx               # Judge verification panel
│   │   ├── docs/page.tsx                 # Developer documentation
│   │   └── api/                          # AI streaming, extraction, snapshots, Telegram
│   ├── components/
│   │   ├── chat/                         # ChatWindow, MemorySourcePanel, ModelSwitcher
│   │   ├── dashboard/                    # SovereigntyRing, StatsRow, OnChainActivity
│   │   ├── memory/                       # Memory cards, timeline, type selector
│   │   ├── share/                        # Grant cards, shared memory view
│   │   └── ui/                           # ArkivEntityBadge, EncryptionIndicator, etc.
│   ├── lib/
│   │   ├── arkiv/                        # client.ts, queries.ts, entities.ts, schemas.ts
│   │   ├── crypto/                       # keyDerivation.ts, encryption.ts, shareTokens.ts
│   │   ├── ai/                           # contextBuilder.ts, systemPrompt.ts, memoryExtractor.ts
│   │   └── memory/                       # health.ts, importance.ts, recall.ts
│   ├── hooks/                            # useEncryption, useSemanticMemory, useInstructions, etc.
│   └── contexts/                         # EncryptionContext (masterKey — never leaves here)
├── scripts/
│   └── seed.ts                           # Seeds ~50 demo entities on Braga
├── .env.example                          # Required environment variables
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Why Exo Wins

Every other submission in this hackathon stores data on Arkiv and calls it ownership. Exo makes ownership the *entire product*.

The encryption is not a feature — it is the architecture. The wallet is not an auth method — it is the trust layer. The Arkiv entities are not a database — they are sovereignty made queryable.

The 2025 ChatGPT memory incident made the problem undeniable. Users lost months of conversation history with no recourse, no backup, and no way to get it back. Exo is the architectural answer: not a policy change, not a terms of service update — a cryptographic guarantee.

The AI memory market is $6.27 billion and growing at 35% annually. Every dollar flows through centralized intermediaries. Exo is the first working demonstration that this entire market can be rebuilt on sovereign, wallet-owned infrastructure — using Arkiv as the tamper-proof, queryable foundation it was built to be.

When a judge opens the chat — sees the AI responding with specific knowledge of their demo context, watches the Memory Sources panel update with live Arkiv entity keys, switches models and watches the new AI pick up the exact same thread — the idea stops being a hackathon submission and starts being something they actually want to use.

That is the only thing that wins.

---

## Team

| Name | GitHub | Role |
|---|---|---|
| *[Your name]* | [@flourishchuks80-ux](https://github.com/flourishchuks80-ux) | *[Your role]* |

**Prize wallet address:** `[Your Arkiv Braga wallet address]`

---

## License

MIT — use it, fork it, build on it. The memory belongs to the user, and so does the code.

---

<div align="center">

*Built for the ETHns × Arkiv Challenge 2026*

*"Not your keys, not your bots. Now your keys. Your bots."*

</div>
