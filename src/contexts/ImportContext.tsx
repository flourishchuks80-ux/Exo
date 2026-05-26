"use client";

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";
import { useExoAuth } from "@/hooks/useExoAuth";
import { useCreateSemanticMemory } from "@/hooks/useSemanticMemory";
import type { Topic } from "@/lib/arkiv/constants";

export interface ImportFact {
  content: string;
  topic: string;
  importance: number;
}

export interface ImportJob {
  status: "idle" | "running" | "done" | "failed";
  label: string;
  total: number;
  written: number;
  failed: number;
  lastTxHash: string;
}

const IDLE_JOB: ImportJob = {
  status: "idle",
  label: "",
  total: 0,
  written: 0,
  failed: 0,
  lastTxHash: "",
};

interface ImportContextValue {
  job: ImportJob;
  startImport: (facts: ImportFact[], label: string) => void;
  dismiss: () => void;
}

const ImportContext = createContext<ImportContextValue | null>(null);

export function ImportProvider({ children }: { children: ReactNode }) {
  const { masterKey, walletAddress, getWalletClient } = useExoAuth();
  const createMemory = useCreateSemanticMemory(walletAddress, masterKey);
  const [job, setJob] = useState<ImportJob>(IDLE_JOB);
  const runningRef = useRef(false);

  const startImport = useCallback(
    (facts: ImportFact[], label: string) => {
      if (runningRef.current) return;
      runningRef.current = true;

      if (typeof Notification !== "undefined" && Notification.permission === "default") {
        Notification.requestPermission();
      }

      const selected = facts.filter((f) => f.content.trim().length > 0);
      setJob({ status: "running", label, total: selected.length, written: 0, failed: 0, lastTxHash: "" });

      (async () => {
        let written = 0;
        let failed = 0;
        let lastTxHash = "";

        for (const fact of selected) {
          try {
            const result = await createMemory.mutateAsync({
              topic: fact.topic as Topic,
              importance: fact.importance,
              agentId: "claude",
              confirmed: true,
              payload: {
                content: fact.content,
                source: "user_stated",
                confidence: 0.85,
                tags: [],
                relatedKeys: [],
              },
              getWalletClient,
            });
            lastTxHash = result.txHash;
            written++;
            setJob((prev) => ({ ...prev, written, lastTxHash }));
          } catch {
            failed++;
            setJob((prev) => ({ ...prev, failed }));
          }
        }

        setJob((prev) => ({ ...prev, status: "done", written, failed, lastTxHash }));
        runningRef.current = false;

        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("Exo Import Complete", {
            body: `${written} memor${written === 1 ? "y" : "ies"} stored on-chain.`,
            icon: "/exo-logo.svg",
          });
        }
      })();
    },
    [createMemory, getWalletClient]
  );

  const dismiss = useCallback(() => {
    if (runningRef.current) return;
    setJob(IDLE_JOB);
  }, []);

  return (
    <ImportContext.Provider value={{ job, startImport, dismiss }}>
      {children}
    </ImportContext.Provider>
  );
}

export function useImportContext() {
  const ctx = useContext(ImportContext);
  if (!ctx) throw new Error("useImportContext must be used inside ImportProvider");
  return ctx;
}
