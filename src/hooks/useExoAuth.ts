"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useEffect, useCallback } from "react";
import { useEncryptionContext } from "@/contexts/EncryptionContext";
import { createWalletClient, http } from "@arkiv-network/sdk";
import { braga } from "@arkiv-network/sdk/chains";
import { privateKeyToAccount } from "@arkiv-network/sdk/accounts";
import type { WalletArkivClient } from "@arkiv-network/sdk";

export function useExoAuth() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const { deriveKey, clearKey, masterKey, isKeyDerived, isDerivingKey } = useEncryptionContext();

  const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
  const walletAddress = embeddedWallet?.address ?? user?.wallet?.address ?? null;

  const initEncryption = useCallback(async () => {
    if (!embeddedWallet || !walletAddress || isKeyDerived) return;

    await embeddedWallet.switchChain(60138453102);

    const provider = await embeddedWallet.getEthereumProvider();
    const signMessage = async (message: string): Promise<string> => {
      return provider.request({
        method: "personal_sign",
        params: [message, walletAddress],
      });
    };

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
    if (!embeddedWallet) return null;

    // For embedded wallets we use the provider via viem custom account
    const provider = await embeddedWallet.getEthereumProvider();

    // Create a custom account that uses the Privy provider for signing
    const viemAccount = {
      address: walletAddress as `0x${string}`,
      type: "local" as const,
      signMessage: async ({ message }: { message: string | { raw: Uint8Array | `0x${string}` } }) => {
        const msg = typeof message === "string" ? message : message.raw instanceof Uint8Array
          ? Buffer.from(message.raw).toString("hex")
          : message.raw;
        return provider.request({ method: "personal_sign", params: [msg, walletAddress] });
      },
      signTransaction: async (tx: unknown) => {
        return provider.request({ method: "eth_signTransaction", params: [tx] });
      },
      signTypedData: async (data: unknown) => {
        return provider.request({ method: "eth_signTypedData_v4", params: [walletAddress, JSON.stringify(data)] });
      },
      publicKey: undefined,
      source: "custom" as const,
    };

    return createWalletClient({
      chain: braga,
      transport: http(),
      // @ts-ignore — Privy provider account doesn't match strict viem Account shape
      account: viemAccount,
    });
  }, [embeddedWallet, walletAddress]);

  return {
    ready,
    authenticated,
    user,
    walletAddress,
    masterKey,
    isKeyDerived,
    isDerivingKey,
    login,
    logout,
    initEncryption,
    getWalletClient,
  };
}
