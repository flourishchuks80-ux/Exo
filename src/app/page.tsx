"use client";

import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { ArrowRight, Shield, Lock, Globe, ExternalLink, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  const { login, authenticated } = usePrivy();

  return (
    <div className="min-h-screen bg-[#060810] text-[#F0F4FF]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14 border-b border-[rgba(0,212,170,0.08)] bg-[rgba(6,8,16,0.85)] backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#00D4AA] flex items-center justify-center">
            <span className="text-[#060810] font-bold text-xs font-mono">EX</span>
          </div>
          <span className="font-semibold tracking-tight">Exo</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/verify" className="text-sm text-[#8B9CC8] hover:text-[#F0F4FF] transition-colors hidden sm:block">
            Verify
          </Link>
          <Link href="/docs" className="text-sm text-[#8B9CC8] hover:text-[#F0F4FF] transition-colors hidden sm:block">
            Docs
          </Link>
          {authenticated ? (
            <Link href="/dashboard">
              <Button size="sm" variant="primary">Dashboard <ArrowRight className="w-3.5 h-3.5" /></Button>
            </Link>
          ) : (
            <Button size="sm" variant="primary" onClick={() => login()}>
              Own Your Memory <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 text-center grid-bg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(0,212,170,0.02)] to-[#060810] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(0,212,170,0.06)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(0,212,170,0.2)] bg-[rgba(0,212,170,0.06)] text-xs text-[#00D4AA] font-mono mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] animate-pulse" />
            ETHns × Arkiv Hackathon 2026 · Braga Testnet
          </div>

          <blockquote className="text-lg text-[#8B9CC8] font-light italic mb-6">
            "AI makes everything fake. Crypto makes it real again."
            <footer className="mt-2 text-sm text-[#4F5E7A] not-italic">— Balaji Srinivasan</footer>
          </blockquote>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.05]">
            <span className="text-[#F0F4FF]">Not your keys,</span>
            <br />
            <span className="text-[#4F5E7A]">not your bots.</span>
          </h1>

          <p className="text-xl sm:text-2xl font-bold text-[#00D4AA] mb-4 text-glow">
            Now your keys. Your bots.
          </p>

          <p className="text-base text-[#8B9CC8] max-w-2xl mx-auto mb-10 leading-relaxed">
            Your AI knows you because OpenAI told it to.
            <br />
            <strong className="text-[#F0F4FF]">Exo lets your AI know you because you told it to.</strong>
            <br />
            On-chain. Encrypted. Yours.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {authenticated ? (
              <>
                <Link href="/dashboard">
                  <Button size="lg" variant="primary" className="gap-2 min-w-[200px]">
                    Open Dashboard <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/chat">
                  <Button size="lg" variant="secondary" className="gap-2 min-w-[200px]">
                    Chat with AI
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Button size="lg" variant="primary" onClick={() => login()} className="gap-2 min-w-[200px]">
                  Own Your AI Memory <ArrowRight className="w-4 h-4" />
                </Button>
                <Link href="/chat?demo=true">
                  <Button size="lg" variant="secondary" className="gap-2 min-w-[200px]">
                    See It Live
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-24 px-6 bg-[#060810]">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-[10px] font-mono text-[#4F5E7A] uppercase tracking-[0.3em] mb-16">
            The Problem
          </p>
          <div className="grid md:grid-cols-3 gap-px bg-[rgba(255,255,255,0.04)] rounded-2xl overflow-hidden">
            {[
              {
                stat: "Feb 2025",
                title: "OpenAI wiped 6 months of user memories.",
                body: "No warning. No recovery. No accountability. Affected users lost months of conversation history forever.",
                source: "OpenAI Status Page, Feb 2025",
              },
              {
                stat: "Every time",
                title: "When you switch models, your AI starts from zero.",
                body: "ChatGPT to Claude. Claude to Gemini. Each switch resets everything. You re-explain yourself every session.",
                source: null,
              },
              {
                stat: "Always",
                title: "Your AI's memory belongs to the company.",
                body: "You are a user, not an owner. The platform controls what it knows about you — and can delete it without notice.",
                source: null,
              },
            ].map((panel) => (
              <div key={panel.title} className="bg-[#060810] p-8">
                <p className="text-[10px] font-mono text-[#4F5E7A] mb-3">{panel.stat}</p>
                <h3 className="text-base font-bold text-[#F0F4FF] mb-3 leading-snug">{panel.title}</h3>
                <p className="text-sm text-[#8B9CC8] leading-relaxed">{panel.body}</p>
                {panel.source && (
                  <p className="mt-3 text-[10px] text-[#4F5E7A] font-mono">[{panel.source}]</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-24 px-6 bg-[#0C1120]">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-[10px] font-mono text-[#00D4AA] uppercase tracking-[0.3em] mb-16">
            The Exo Answer
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Every memory lives on Arkiv",
                body: "Wallet-signed. Tamper-proof. Immutable $creator field on every entity. Not even we can delete your memories.",
              },
              {
                icon: Lock,
                title: "Encrypted before it leaves your browser",
                body: "AES-256-GCM encryption. Your key is derived from your wallet signature — never stored anywhere.",
              },
              {
                icon: Globe,
                title: "Works with any model",
                body: "Claude today. GPT tomorrow. Gemini next week. Your context travels with you across every model.",
              },
            ].map((panel) => (
              <div
                key={panel.title}
                className="p-6 bg-[#121A2E] border border-[rgba(0,212,170,0.1)] rounded-2xl hover:border-[rgba(0,212,170,0.25)] transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[rgba(0,212,170,0.08)] border border-[rgba(0,212,170,0.2)] flex items-center justify-center mb-4">
                  <panel.icon className="w-5 h-5 text-[#00D4AA]" />
                </div>
                <h3 className="text-sm font-bold text-[#F0F4FF] mb-2">{panel.title}</h3>
                <p className="text-sm text-[#8B9CC8] leading-relaxed">{panel.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="py-24 px-6 bg-[#060810] border-t border-[rgba(0,212,170,0.06)]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[10px] font-mono text-[#4F5E7A] uppercase tracking-[0.3em] mb-12">
            Architecture
          </p>
          <div className="bg-[#0C1120] border border-[rgba(0,212,170,0.1)] rounded-2xl p-8 font-mono text-sm text-left">
            <div className="space-y-3 text-[#8B9CC8]">
              {[
                { text: "User connects wallet", arrow: false },
                { text: "Exo derives encryption key from wallet signature (client-side only)", arrow: true },
                { text: "AI fetches context from Arkiv Braga (public read)", arrow: true },
                { text: "Decrypted in browser · Server never sees plaintext", arrow: true },
                { text: "AI responds with full knowledge of who you are", arrow: true },
                { text: "New memories written to Arkiv · Signed by your wallet", arrow: true },
                { text: "You own the memories · Platform owns nothing", arrow: false, highlight: true },
              ].map((line, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className={line.arrow ? "text-[#4F5E7A]" : "invisible"}>↓</span>
                  <span className={line.highlight ? "text-[#00D4AA] font-semibold" : ""}>{line.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Entity types */}
      <section className="py-24 px-6 bg-[#0C1120]">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-[10px] font-mono text-[#4F5E7A] uppercase tracking-[0.3em] mb-12">
            6 Entity Types on Arkiv
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { type: "Semantic Memory", color: "#8B5CF6", desc: "Facts about you — permanent" },
              { type: "Episodic Memory", color: "#3B82F6", desc: "Past sessions — 90 day TTL" },
              { type: "Instructions", color: "#00D4AA", desc: "Standing rules — permanent" },
              { type: "Documents", color: "#F59E0B", desc: "Reference files — 1 year TTL" },
              { type: "Access Grants", color: "#EC4899", desc: "Time-scoped sharing" },
              { type: "Snapshots", color: "#64748B", desc: "Version history — 1 year TTL" },
            ].map((item) => (
              <div key={item.type} className="flex items-center gap-3 p-4 bg-[#121A2E] border border-[rgba(255,255,255,0.04)] rounded-xl">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <div>
                  <p className="text-sm font-medium text-[#F0F4FF]">{item.type}</p>
                  <p className="text-xs text-[#4F5E7A]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-[#060810] border-t border-[rgba(0,212,170,0.06)] text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-6 text-[#F0F4FF]">
            Your keys.
            <br />
            <span className="text-[#00D4AA]">Your bots.</span>
          </h2>
          <p className="text-[#8B9CC8] mb-10">
            Start building your sovereign AI memory on Arkiv Braga. It takes 60 seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {authenticated ? (
              <Link href="/dashboard">
                <Button size="lg" variant="primary" className="gap-2">
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Button size="lg" variant="primary" onClick={() => login()} className="gap-2">
                Own Your AI Memory <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            <Link href="/verify">
              <Button size="lg" variant="ghost" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Verify on Arkiv
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(0,212,170,0.06)] py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#00D4AA] flex items-center justify-center">
              <span className="text-[#060810] font-bold text-[9px] font-mono">EX</span>
            </div>
            <span className="text-sm text-[#4F5E7A] font-mono">Not your keys, not your bots. Now your keys. Your bots.</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#4F5E7A]">
            <Link href="/verify" className="hover:text-[#00D4AA] transition-colors">Verify</Link>
            <Link href="/docs" className="hover:text-[#00D4AA] transition-colors">Docs</Link>
            <a
              href="https://explorer.braga.hoodi.arkiv.network"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#00D4AA] transition-colors"
            >
              Braga Explorer
            </a>
            <span>MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
