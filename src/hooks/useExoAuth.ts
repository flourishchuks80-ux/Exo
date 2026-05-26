"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useEffect, useCallback } from "react";
import { useEncryptionContext } from "@/contexts/EncryptionContext";
import { createWalletClient, custom } from "@arkiv-network/sdk";
import { braga } from "@arkiv-network/sdk/chains";
import type { WalletArkivClient } from "@arkiv-network/sdk";

export function useExoAuth() {
  const { ready, authenticated, user, login, logout, getAccessToken } = usePrivy();
  const { wallets } = useWallets();
  const { deriveKey, clearKey, masterKey, isKeyDerived, isDerivingKey, error: encryptionError } = useEncryptionContext();

  const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
  const walletAddress = embeddedWallet?.address ?? user?.wallet?.address ?? null;
  const hasEmbeddedWallet = !!embeddedWallet;

  const initEncryption = useCallback(async () => {
    if (isKeyDerived) return;

    // Telegram WebApp: MPC iframe is blocked so useWallets() returns [].
    // Fall back to server-assisted signing via Privy Management API.
    if (!embeddedWallet && walletAddress) {
      const token = await getAccessToken().catch(() => null);
      if (!token) return;

      await deriveKey(walletAddress, async () => {
        const resp = await fetch("/api/auth/sign-derivation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ walletAddress }),
        });
        if (!resp.ok) throw new Error(await resp.text().catch(() => "Server signing failed"));
        const { signature } = (await resp.json()) as { signature: string };
        return signature;
      });
      return;
    }

    if (!embeddedWallet || !walletAddress) return;

    // Normal path (main app): sign client-side.
    // personal_sign is chain-agnostic — switchChain is not needed here and
    // throws in sandboxed envs (Telegram WebApp), silently blocking derivation.
    let signMessage: (msg: string) => Promise<string>;
    try {
      const provider = await embeddedWallet.getEthereumProvider();
      signMessage = (message: string) =>
        provider.request({ method: "personal_sign", params: [message, walletAddress] });
    } catch (e) {
      await deriveKey(walletAddress, async () => { throw e; });
      return;
    }

    await deriveKey(walletAddress, signMessage);
  }, [embeddedWallet, walletAddress, isKeyDerived, deriveKey, getAccessToken]);

  useEffect(() => {
    if (authenticated && walletAddress && !isKeyDerived && !isDerivingKey) {
      initEncryption();
    }
  }, [authenticated, walletAddress, isKeyDerived, isDerivingKey, initEncryption]);

  useEffect(() => {
    if (!authenticated) {
      clearKey();
    }
  }, [authenticated, clearKey]);

  const getWalletClient = useCallback(async (): Promise<WalletArkivClient | null> => {
    if (!embeddedWallet || !walletAddress) return null;

    await embeddedWallet.switchChain(60138453102);
    const provider = await embeddedWallet.getEthereumProvider();

    // Use the EIP-1193 provider directly as the transport so viem calls
    // eth_sendTransaction and Privy handles signing natively. The old
    // "local" account pattern called eth_signTransaction which Privy v3
    // rejects with a strict typed-transaction validation error.
    return createWalletClient({
      chain: braga,
      transport: custom(provider),
      account: walletAddress as `0x${string}`,
    }) as unknown as WalletArkivClient;
  }, [embeddedWallet, walletAddress]);

  return {
    ready,
    authenticated,
    user,
    walletAddress,
    masterKey,
    isKeyDerived,
    isDerivingKey,
    encryptionError,
    hasEmbeddedWallet,
    login,
    logout,
    initEncryption,
    getWalletClient,
  };
}
