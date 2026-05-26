"use client";

import { useState, useEffect } from "react";
import { Check, Loader2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { truncateHex, getTxUrl } from "@/lib/utils/format";

interface Step {
  id: string;
  label: string;
  status: "pending" | "active" | "done";
}

interface ChainWriteProgressProps {
  isOpen: boolean;
  txHash?: string;
  onDone?: () => void;
  entityType?: string;
}

export function ChainWriteProgress({ isOpen, txHash, onDone, entityType = "memory" }: ChainWriteProgressProps) {
  const [steps, setSteps] = useState<Step[]>([
    { id: "encrypt", label: "Encrypting payload (AES-256-GCM)...", status: "pending" },
    { id: "sign", label: "Signing entity with your wallet...", status: "pending" },
    { id: "broadcast", label: "Broadcasting to Braga testnet...", status: "pending" },
    { id: "confirm", label: "Confirmed on-chain", status: "pending" },
  ]);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setSteps((s) => s.map((step) => ({ ...step, status: "pending" })));
      setCurrentStep(0);
      return;
    }

    const advance = (stepIdx: number, delay: number) => {
      setTimeout(() => {
        setCurrentStep(stepIdx);
        setSteps((s) =>
          s.map((step, i) => ({
            ...step,
            status: i < stepIdx ? "done" : i === stepIdx ? "active" : "pending",
          }))
        );
      }, delay);
    };

    advance(0, 100);
    advance(1, 600);
    advance(2, 1200);

    if (txHash) {
      setTimeout(() => {
        setSteps((s) => s.map((step) => ({ ...step, status: "done" })));
        setCurrentStep(4);
        onDone?.();
      }, 2000);
    }
  }, [isOpen, txHash, onDone]);

  if (!isOpen) return null;

  const allDone = currentStep === 4;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#121A2E] border border-[rgba(0,212,170,0.2)] rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
        <p className="text-[#8B9CC8] text-sm font-mono mb-6">
          Writing your {entityType} to Arkiv Braga...
        </p>

        <div className="space-y-4">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center gap-3">
              {step.status === "done" ? (
                <div className="w-5 h-5 rounded-full bg-[#00D4AA]/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-[#00D4AA]" />
                </div>
              ) : step.status === "active" ? (
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  <Loader2 className="w-4 h-4 text-[#00D4AA] animate-spin" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border border-[#4F5E7A] flex-shrink-0" />
              )}

              <span
                className={cn(
                  "text-sm font-mono transition-colors",
                  step.status === "done" && "text-[#00D4AA]",
                  step.status === "active" && "text-[#F0F4FF]",
                  step.status === "pending" && "text-[#4F5E7A]"
                )}
              >
                {step.label}
                {step.id === "broadcast" && step.status === "done" && txHash && (
                  <span className="ml-2 text-[#8B9CC8]">
                    tx: {truncateHex(txHash, 4)}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>

        {allDone && (
          <div className="mt-6 pt-4 border-t border-[rgba(0,212,170,0.12)] animate-slide-in-up">
            <p className="text-[#00D4AA] font-medium text-sm">
              Your {entityType} is on-chain. It belongs to you.
            </p>
            {txHash && (
              <a
                href={getTxUrl(txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#8B9CC8] hover:text-[#00D4AA] transition-colors font-mono"
              >
                <ExternalLink className="w-3 h-3" />
                View transaction
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
