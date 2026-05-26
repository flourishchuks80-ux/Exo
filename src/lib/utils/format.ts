import type { Entity } from "@arkiv-network/sdk";

export function truncateHex(hex: string, chars = 6): string {
  if (!hex || hex.length <= chars * 2 + 2) return hex;
  return `${hex.slice(0, chars + 2)}...${hex.slice(-chars)}`;
}

export function formatDate(timestamp: number): string {
  if (!timestamp) return "Unknown";
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelative(timestamp: number): string {
  if (!timestamp) return "";
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(timestamp);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function parseEntityAttributes(
  entity: Entity | { attributes: { key: string; value: string | number }[] }
): Record<string, string | number> {
  const attrs: Record<string, string | number> = {};
  const attributes = (entity as { attributes: { key: string; value: string | number }[] }).attributes ?? [];
  for (const a of attributes) {
    attrs[a.key] = a.value;
  }
  return attrs;
}

export function getEntityPayloadText(entity: Entity): string | null {
  try {
    return entity.toText();
  } catch {
    return null;
  }
}

export function getExplorerUrl(entityKey: string): string {
  return `https://explorer.braga.hoodi.arkiv.network/entity/${entityKey}`;
}

export function getTxUrl(txHash: string): string {
  return `https://explorer.braga.hoodi.arkiv.network/tx/${txHash}`;
}
