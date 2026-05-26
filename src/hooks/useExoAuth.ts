"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useEffect, useCallback } from "react";
import { useEncryptionContext } from "@/contexts/EncryptionContext";
import { createWalletClient, custom } from "@arkiv-network/sdk";
import { braga } from "@arkiv-network/sdk/chains";
import type { WalletArkivClient } from "@arkiv-network/sdk";

export function useExoAuth() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const { deriveKey, clearKey, masterKey, isKeyDerived, isDerivingKey, error: encryptionError } = useEncryptionContext();

  const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
  const walletAddress = embeddedWallet?.address ?? user?.wallet?.address ?? null;
  const hasEmbeddedWallet = !!embeddedWallet;

  const initEncryption = useCallback(async () => {
    if (isKeyDerived) return;
    if (!embeddedWallet || !walletAddress) return;

    // personal_sign is chain-agnostic — no switchChain needed here.
    // switchChain can throw in sandboxed envs (Telegram WebApp) and would
    // silently block key derivation since initEncryption has no outer catch.
    let signMessage: (msg: string) => Promise<string>;
    try {
      const provider = await embeddedWallet.getEthereumProvider();
      signMessage = (message: string) =>
        provider.request({ method: "personal_sign", params: [message, walletAddress] });
    } catch (e) {
      // Route provider-setup errors through deriveKey so encryptionError is set
      await deriveKey(walletAddress, async () => { throw e; });
      return;
    }

    await deriveKey(walletAddress, signMessage);
  }, [embeddedWallet, walletAddress, isKeyDerived, deriveKey]);

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
