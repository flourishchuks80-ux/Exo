"use client";

import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Copy, Check, ExternalLink, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
}

function CodeBlock({ code, language = "typescript" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative group">
      <pre className="p-4 bg-[#060810] border border-[rgba(0,212,170,0.08)] rounded-xl text-xs font-mono text-[#8B9CC8] overflow-x-auto whitespace-pre leading-relaxed">
        {code}
      </pre>
      <button
        onClick={() => {
          navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="absolute top-3 right-3 p-1.5 bg-[#121A2E] border border-[rgba(0,212,170,0.12)] rounded-lg text-[#4F5E7A] hover:text-[#8B9CC8] opacity-0 group-hover:opacity-100 transition-all"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-[#00D4AA]" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

function SectionCard({ section }: { section: Section }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-[rgba(0,212,170,0.08)] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-[#121A2E] hover:bg-[#192235] transition-colors text-left"
      >
        <h2 className="text-sm font-semibold text-[#F0F4FF]">{section.title}</h2>
        {open ? <ChevronDown className="w-4 h-4 text-[#4F5E7A]" /> : <ChevronRight className="w-4 h-4 text-[#4F5E7A]" />}
      </button>
      {open && (
        <div className="px-5 py-4 bg-[#0D1525] space-y-4">
          {section.content}
        </div>
      )}
    </div>
  );
}

export default function DocsPage() {
  const sections: Section[] = [
    {
      id: "overview",
      title: "Overview",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-[#8B9CC8] leading-relaxed">
            Exo stores all AI memory as encrypted entities on the{" "}
            <a href="https://braga.hoodi.arkiv.network" target="_blank" rel="noopener noreferrer" className="text-[#00D4AA] hover:underline inline-flex items-center gap-0.5">
              Arkiv Braga testnet <ExternalLink className="w-3 h-3" />
            </a>.
            Each entity is owned by the user's wallet, encrypted client-side with AES-256-GCM,
            and queryable via the Arkiv SDK. No server ever sees plaintext.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "Chain", value: "Braga (60138453102)" },
              { label: "RPC", value: "braga.hoodi.arkiv.network/rpc" },
              { label: "Explorer", value: "explorer.braga.hoodi.arkiv.network" },
              { label: "SDK", value: "@arkiv-network/sdk@0.6.8" },
              { label: "Auth", value: "Privy embedded wallet" },
              { label: "Encryption", value: "AES-256-GCM + HKDF" },
            ].map((item) => (
              <div key={item.label} className="p-3 bg-[#121A2E] rounded-lg">
                <p className="text-[10px] text-[#4F5E7A] mb-1">{item.label}</p>
                <p className="text-xs font-mono text-[#F0F4FF]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "entity-types",
      title: "Entity Types",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-[#8B9CC8]">
            Exo uses 6 entity types, all tagged with{" "}
            <code className="text-[#00D4AA] text-xs">app=exo:v1</code> for namespacing.
          </p>
          <div className="space-y-2">
            {[
              { type: "semantic", color: "text-purple-400", ttl: "Permanent", desc: "Verified facts, skills, preferences, and knowledge" },
              { type: "episodic", color: "text-blue-400", ttl: "90 days", desc: "Session summaries with decisions and open threads" },
              { type: "instruction", color: "text-amber-400", ttl: "Permanent", desc: "Standing rules for AI behavior across sessions" },
              { type: "document", color: "text-green-400", ttl: "365 days", desc: "Full documents, blog posts, code references" },
              { type: "grant", color: "text-pink-400", ttl: "Configurable", desc: "Time-scoped access grants for memory sharing" },
              { type: "snapshot", color: "text-cyan-400", ttl: "365 days", desc: "Point-in-time memory state with AI narrative" },
            ].map((item) => (
              <div key={item.type} className="flex items-start gap-3 p-3 bg-[#121A2E] rounded-lg">
                <span className={cn("text-xs font-mono w-20 flex-shrink-0 mt-0.5", item.color)}>{item.type}</span>
                <div className="flex-1">
                  <p className="text-sm text-[#F0F4FF]">{item.desc}</p>
                </div>
                <span className="text-[10px] text-[#4F5E7A] flex-shrink-0">{item.ttl}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "sdk-setup",
      title: "SDK Setup",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-[#8B9CC8]">Install and configure the Arkiv SDK client.</p>
          <CodeBlock code={`npm install @arkiv-network/sdk@0.6.8`} language="bash" />
          <CodeBlock code={`import { createPublicClient, http } from "@arkiv-network/sdk";
import { braga } from "@arkiv-network/sdk/chains";

export const publicClient = createPublicClient({
  chain: braga,
  transport: http(),
});`} />
        </div>
      ),
    },
    {
      id: "querying",
      title: "Querying Entities",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-[#8B9CC8]">
            Use <code className="text-[#00D4AA] text-xs">buildQuery()</code> with{" "}
            <code className="text-[#00D4AA] text-xs">where()</code>,{" "}
            <code className="text-[#00D4AA] text-xs">ownedBy()</code>, and predicate helpers.
          </p>
          <CodeBlock code={`import { eq, gte, and } from "@arkiv-network/sdk/query";

// Fetch all semantic memories for a wallet
const result = await publicClient
  .buildQuery()
  .where([
    eq("app", "exo:v1"),
    eq("type", "semantic"),
  ])
  .ownedBy("0xYOUR_WALLET_ADDRESS")
  .orderBy("importance", "number", "desc")
  .withPayload(true)
  .withAttributes(true)
  .withMetadata(true)
  .limit(50)
  .fetch();

const entities = result.entities;`} />
          <CodeBlock code={`// Count entities by type
const count = await publicClient
  .buildQuery()
  .where([eq("app", "exo:v1"), eq("type", "instruction")])
  .ownedBy(walletAddress)
  .count();`} />
        </div>
      ),
    },
    {
      id: "writing",
      title: "Writing Entities",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-[#8B9CC8]">
            Use a wallet client to create entities. Payloads must be{" "}
            <code className="text-[#00D4AA] text-xs">Uint8Array</code> via{" "}
            <code className="text-[#00D4AA] text-xs">jsonToPayload()</code>.
          </p>
          <CodeBlock code={`import { createWalletClient, http, jsonToPayload } from "@arkiv-network/sdk";
import { braga } from "@arkiv-network/sdk/chains";

const walletClient = createWalletClient({
  chain: braga,
  transport: http(),
  account: yourAccount,
});

const result = await walletClient.createEntity({
  payload: jsonToPayload({
    // your encrypted payload object
    iv: "...",
    ciphertext: "...",
    authTag: "...",
    version: "aes-256-gcm-v1",
  }),
  contentType: "application/json",
  expiresIn: 0, // 0 = permanent
  attributes: [
    { key: "app", value: "exo:v1" },
    { key: "type", value: "semantic" },
    { key: "topic", value: "engineering" },
    { key: "importance", value: 80 },
  ],
});

console.log(result.txHash, result.entityKey);`} />
        </div>
      ),
    },
    {
      id: "encryption",
      title: "Client-Side Encryption",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-[#8B9CC8]">
            Master key is derived from a wallet signature using HKDF. All payloads are encrypted
            before leaving the browser. The server never sees plaintext.
          </p>
          <CodeBlock code={`// 1. Derive master key from wallet signature
const message = \`Exo sovereign memory key derivation v1 — \${address}\`;
const signature = await signMessage(message);

const sigBytes = new Uint8Array(
  signature.slice(2).match(/.{1,2}/g)!.map(b => parseInt(b, 16))
);

const baseKey = await crypto.subtle.importKey(
  "raw", sigBytes, { name: "HKDF" }, false, ["deriveKey"]
);

const masterKey = await crypto.subtle.deriveKey(
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
);`} />
          <CodeBlock code={`// 2. Encrypt payload
const iv = crypto.getRandomValues(new Uint8Array(12));
const encoded = new TextEncoder().encode(JSON.stringify(data));
const encrypted = await crypto.subtle.encrypt(
  { name: "AES-GCM", iv },
  masterKey,
  encoded
);

// Last 16 bytes are the auth tag
const ciphertext = new Uint8Array(encrypted).slice(0, -16);
const authTag = new Uint8Array(encrypted).slice(-16);

const payload = {
  iv: btoa(String.fromCharCode(...iv)),
  ciphertext: btoa(String.fromCharCode(...ciphertext)),
  authTag: btoa(String.fromCharCode(...authTag)),
  version: "aes-256-gcm-v1",
};`} />
        </div>
      ),
    },
    {
      id: "react-integration",
      title: "React Integration",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-[#8B9CC8]">
            Drop-in hooks for reading and writing memory in your React app.
          </p>
          <CodeBlock code={`// Reading memories
import { useSemanticMemory } from "@/hooks/useSemanticMemory";

function MyComponent() {
  const { walletAddress, masterKey } = useExoAuth();
  const { data: memories, isLoading } = useSemanticMemory(
    walletAddress,
    masterKey
  );

  return memories?.map(m => (
    <div key={m.entityKey}>
      <p>{m.payload.content}</p>
      <span>{m.topic} · importance {m.importance}</span>
    </div>
  ));
}`} />
          <CodeBlock code={`// Writing a memory
import { useCreateSemanticMemory } from "@/hooks/useSemanticMemory";

function AddMemory() {
  const { walletAddress, masterKey, getWalletClient } = useExoAuth();
  const createMemory = useCreateSemanticMemory(walletAddress, masterKey);

  const handleSave = async () => {
    await createMemory.mutateAsync({
      topic: "engineering",
      importance: 80,
      agentId: "claude",
      confirmed: true,
      payload: {
        content: "The user prefers TypeScript strict mode.",
        source: "manual",
        confidence: 1.0,
        tags: ["typescript", "preferences"],
        relatedKeys: [],
      },
      getWalletClient,
    });
  };
}`} />
        </div>
      ),
    },
    {
      id: "ai-integration",
      title: "AI Context Injection",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-[#8B9CC8]">
            Load Arkiv context and inject it into your AI system prompt.
          </p>
          <CodeBlock code={`import { buildSystemPrompt } from "@/lib/ai/systemPrompt";

// Build context from Arkiv
const exoContext = {
  instructions: activeInstructions,    // from fetchInstructions()
  semanticMemories: confirmedFacts,    // from fetchConfirmedSemanticMemories()
  recentEpisodes: lastSessions,        // from fetchRecentEpisodic()
  documents: contextDocs,              // from fetchDocuments()
  userAddress: walletAddress,
};

// Use in AI call
const response = await anthropic.messages.create({
  model: "claude-opus-4-7",
  system: buildSystemPrompt(exoContext),
  messages: [{ role: "user", content: userMessage }],
});`} />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#060810]">
      <TopBar />
      <Sidebar />

      <main className="pt-14 lg:pl-56">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#F0F4FF]">Developer Docs</h1>
            <p className="text-sm text-[#8B9CC8] mt-1">
              Integrate Arkiv-powered sovereign AI memory into your application
            </p>
          </div>

          <div className="space-y-4">
            {sections.map((section) => (
              <SectionCard key={section.id} section={section} />
            ))}
          </div>

          <div className="mt-8 p-5 bg-[rgba(0,212,170,0.04)] border border-[rgba(0,212,170,0.15)] rounded-xl text-center">
            <p className="text-sm text-[#F0F4FF] font-medium mb-1">Built for the ETHns × Arkiv Hackathon</p>
            <p className="text-xs text-[#8B9CC8]">
              All source code available on GitHub · Deployed on Vercel · Data on Braga testnet
            </p>
            <div className="flex gap-3 justify-center mt-3">
              <a
                href="https://explorer.braga.hoodi.arkiv.network"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-[#00D4AA] hover:underline"
              >
                Arkiv Explorer <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-[#4F5E7A]">·</span>
              <a
                href="https://braga.hoodi.arkiv.network/rpc"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-[#00D4AA] hover:underline"
              >
                RPC Endpoint <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
