"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, type ReactNode } from "react";
import { EncryptionProvider } from "@/contexts/EncryptionContext";

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

  // During SSR / before hydration, render without PrivyProvider to avoid
  // throwing on missing/invalid appId during static generation.
  if (!mounted || !privyAppId) {
    return (
      <QueryClientProvider client={queryClient}>
        <EncryptionProvider>{children}</EncryptionProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
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
            createOnLogin: "users-without-wallets",
          },
          supportedChains: [bragaChain],
          defaultChain: bragaChain,
        }}
      >
        <EncryptionProvider>{children}</EncryptionProvider>
      </PrivyProvider>
    </QueryClientProvider>
  );
}
