"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { ChevronRight } from "lucide-react";
import { nav, isParent } from "./nav";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-14 bottom-0 w-56 border-r border-[rgba(0,212,170,0.06)] bg-[#060810] overflow-y-auto z-30 hidden lg:block">
      <nav className="p-3 space-y-0.5">
        {nav.map((item) => {
          if (isParent(item)) {
            const isActive = item.children.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"));
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
                    const active = pathname === child.href || pathname.startsWith(child.href + "/memory/");
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors",
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
    </aside>
  );
}
