import {
  LayoutDashboard,
  Brain,
  MessageSquare,
  Share2,
  Camera,
  Download,
  Settings,
  CheckCircle,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

export type NavChild = { href: string; label: string };
export type NavParent = { label: string; icon: LucideIcon; children: NavChild[] };
export type NavItem = { href: string; label: string; icon: LucideIcon } | NavParent;

export function isParent(item: NavItem): item is NavParent {
  return "children" in item;
}

export const nav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    label: "Memory",
    icon: Brain,
    children: [
      { href: "/memory", label: "All Memory" },
      { href: "/memory/semantic", label: "Semantic" },
      { href: "/memory/episodic", label: "Episodic" },
      { href: "/memory/instructions", label: "Instructions" },
      { href: "/memory/documents", label: "Documents" },
    ],
  },
  { href: "/chat", label: "AI Chat", icon: MessageSquare },
  { href: "/share", label: "Share", icon: Share2 },
  { href: "/snapshot", label: "Snapshots", icon: Camera },
  { href: "/import", label: "Import", icon: Download },
  { href: "/verify", label: "Verify", icon: CheckCircle },
  { href: "/docs", label: "Docs", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];
