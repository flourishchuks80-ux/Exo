"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { nav, isParent } from "./nav";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const pathname = usePathname();

  return (
    <div className="lg:hidden">
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 z-[45] transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 left-0 bottom-0 w-72 bg-[#060810] border-r border-[rgba(0,212,170,0.08)] z-50 flex flex-col",
          "transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-[rgba(0,212,170,0.08)] flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#00D4AA] flex items-center justify-center">
              <span className="text-[#060810] font-bold text-xs font-mono">EX</span>
            </div>
            <span className="font-semibold text-[#F0F4FF] tracking-tight">Exo</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#4F5E7A] hover:text-[#F0F4FF] hover:bg-[#192235] transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {nav.map((item) => {
            if (isParent(item)) {
              const isActive = item.children.some(
                (c) => pathname === c.href || pathname.startsWith(c.href + "/")
              );
              return (
                <div key={item.label}>
                  <div
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium",
                      isActive ? "text-[#F0F4FF]" : "text-[#4F5E7A]"
                    )}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {item.label}
                  </div>
                  <div className="ml-6 space-y-0.5">
                    {item.children.map((child) => {
                      const active =
                        pathname === child.href ||
                        pathname.startsWith(child.href + "/memory/");
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onClose}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                            active
                              ? "bg-[rgba(0,212,170,0.1)] text-[#00D4AA] font-medium"
                              : "text-[#4F5E7A] hover:text-[#8B9CC8] hover:bg-[#192235]"
                          )}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            }

            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-[rgba(0,212,170,0.1)] text-[#00D4AA] font-medium"
                    : "text-[#4F5E7A] hover:text-[#8B9CC8] hover:bg-[#192235]"
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
                {active && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
