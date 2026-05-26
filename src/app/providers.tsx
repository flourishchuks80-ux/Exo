"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, Component, type ReactNode } from "react";
import { EncryptionProvider } from "@/contexts/EncryptionContext";
import { ImportProvider } from "@/contexts/ImportContext";
import { ImportBubble } from "@/components/ui/ImportBubble";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const bragaChain: any = {
  id: 60138453102,
  name: "Braga",
  network: "braga",
  nativeCurrency: { name: "Golem", symbol: "GLM", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://braga.hoodi.arkiv.network/rpc"] },
    public: { http: ["https://braga.hoodi.arkiv.network/rpc"] },
  },
  blockExplorers: {
    default: { name: "Braga Explorer", url: "https://explorer.braga.hoodi.arkiv.network" },
  },
  testnet: true,
};


class PrivyErrorBoundary extends Component<
  { children: ReactNode },
  { crashed: boolean }
> {
  state = { crashed: false };
  static getDerivedStateFromError() {
    return { crashed: true };
  }
  render() {
    if (this.state.crashed) {
      return (
        <div className="min-h-screen bg-[#060810] flex flex-col items-center justify-center gap-3 px-4 text-center">
          <p className="text-[#F0F4FF] font-semibold">Authentication unavailable</p>
          <p className="text-sm text-[#8B9CC8] max-w-sm">
            Authentication failed to initialize. Please reload, or check the
            browser console for details.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 text-sm bg-[#192235] border border-[rgba(0,212,170,0.2)] rounded-lg text-[#F0F4FF] hover:border-[rgba(0,212,170,0.4)] transition-colors"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 2, refetchOnWindowFocus: false },
        },
      })
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";

  // Keep PrivyProvider out of SSR/static generation — it validates against
  // the Privy API at init time and will throw in a sandboxed build env.
  if (!mounted || !privyAppId) {
    return (
      <QueryClientProvider client={queryClient}>
        <EncryptionProvider>
          <ImportProvider>
            {children}
            <ImportBubble />
          </ImportProvider>
        </EncryptionProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PrivyErrorBoundary>
        <PrivyProvider
          appId={privyAppId}
          config={{
            loginMethods: ["email", "wallet"],
            appearance: {
              theme: "dark",
              accentColor: "#00D4AA",
              logo: "/exo-logo.svg",
            },
            embeddedWallets: {
              showWalletUIs: false,
              ethereum: {
                createOnLogin: "users-without-wallets",
              },
            },
            supportedChains: [bragaChain],
            defaultChain: bragaChain,
          }}
        >
          <EncryptionProvider>
            <ImportProvider>
              {children}
              <ImportBubble />
            </ImportProvider>
          </EncryptionProvider>
        </PrivyProvider>
      </PrivyErrorBoundary>
    </QueryClientProvider>
  );
}
