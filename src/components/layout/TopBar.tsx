"use client";

import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { useExoAuth } from "@/hooks/useExoAuth";
import { truncateHex } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";
import { MessageSquare, Shield, Loader2 } from "lucide-react";

export function TopBar() {
  const { authenticated, login, logout, walletAddress, isKeyDerived, isDerivingKey } = useExoAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 border-b border-[rgba(0,212,170,0.08)] bg-[rgba(6,8,16,0.85)] backdrop-blur-xl">
      <div className="flex items-center justify-between h-full px-6 max-w-screen-2xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-[#00D4AA] flex items-center justify-center group-hover:bg-[#00FFD1] transition-colors">
            <span className="text-[#060810] font-bold text-xs font-mono">EX</span>
          </div>
          <span className="font-semibold text-[#F0F4FF] tracking-tight">Exo</span>
        </Link>

        {/* Center nav */}
        {authenticated && (
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: "/dashboard", label: "Dashboard" },
              { href: "/memory", label: "Memory" },
              { href: "/chat", label: "Chat" },
              { href: "/share", label: "Share" },
              { href: "/snapshot", label: "Snapshots" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 text-sm text-[#8B9CC8] hover:text-[#F0F4FF] hover:bg-[#192235] rounded-lg transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {authenticated && walletAddress && (
            <>
              {/* Encryption status */}
              {isDerivingKey ? (
                <div className="flex items-center gap-1.5 text-xs text-[#8B9CC8]">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Unlocking...</span>
                </div>
              ) : isKeyDerived ? (
                <div className="flex items-center gap-1.5 text-xs text-[#00D4AA]">
                  <Shield className="w-3 h-3" />
                  <span className="hidden sm:inline">Encrypted</span>
                </div>
              ) : null}

              {/* Wallet chip */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#192235] border border-[rgba(0,212,170,0.12)] text-xs font-mono text-[#8B9CC8]">
                {truncateHex(walletAddress)}
              </div>

              {/* Chat CTA */}
              <Link href="/chat">
                <Button size="sm" variant="primary" className="gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Chat</span>
                </Button>
              </Link>

              <Button size="sm" variant="ghost" onClick={() => logout()}>
                Sign out
              </Button>
            </>
          )}

          {!authenticated && (
            <Button size="sm" variant="primary" onClick={() => login()}>
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
