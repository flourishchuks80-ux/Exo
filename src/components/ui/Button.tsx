import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4AA] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C1120] disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-[#00D4AA] text-[#060810] hover:bg-[#00FFD1] active:scale-[0.98] shadow-[0_0_16px_rgba(0,212,170,0.2)]":
              variant === "primary",
            "bg-[#192235] text-[#F0F4FF] hover:bg-[#1E2A40] border border-[rgba(0,212,170,0.18)] active:scale-[0.98]":
              variant === "secondary",
            "text-[#8B9CC8] hover:text-[#F0F4FF] hover:bg-[#192235] active:scale-[0.98]":
              variant === "ghost",
            "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 active:scale-[0.98]":
              variant === "danger",
            "border border-[rgba(0,212,170,0.3)] text-[#00D4AA] hover:bg-[rgba(0,212,170,0.08)] active:scale-[0.98]":
              variant === "outline",
          },
          {
            "text-xs px-3 py-1.5 h-7": size === "sm",
            "text-sm px-4 py-2 h-9": size === "md",
            "text-base px-6 py-3 h-12": size === "lg",
          },
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
