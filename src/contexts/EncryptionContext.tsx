"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { deriveMasterKey } from "@/lib/crypto/keyDerivation";

interface EncryptionContextValue {
  masterKey: CryptoKey | null;
  isKeyDerived: boolean;
  isDerivingKey: boolean;
  error: string | null;
  deriveKey: (address: string, signMessage: (msg: string) => Promise<string>) => Promise<void>;
  clearKey: () => void;
}

const EncryptionContext = createContext<EncryptionContextValue | null>(null);

export function EncryptionProvider({ children }: { children: ReactNode }) {
  const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);
  const [isDerivingKey, setIsDerivingKey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deriveKey = useCallback(
    async (address: string, signMessage: (msg: string) => Promise<string>) => {
      setIsDerivingKey(true);
      setError(null);
      try {
        const key = await deriveMasterKey(address, signMessage);
        setMasterKey(key);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to derive encryption key");
      } finally {
        setIsDerivingKey(false);
      }
    },
    []
  );

  const clearKey = useCallback(() => {
    setMasterKey(null);
  }, []);

  return (
    <EncryptionContext.Provider
      value={{
        masterKey,
        isKeyDerived: masterKey !== null,
        isDerivingKey,
        error,
        deriveKey,
        clearKey,
      }}
    >
      {children}
    </EncryptionContext.Provider>
  );
}

export function useEncryptionContext() {
  const ctx = useContext(EncryptionContext);
  if (!ctx) throw new Error("useEncryptionContext must be used inside EncryptionProvider");
  return ctx;
}
