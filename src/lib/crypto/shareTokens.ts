"use client";

import { bufferToBase64, base64ToBuffer } from "./encryption";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const subtle = () => crypto.subtle as any;

export async function generateShareToken(): Promise<string> {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return bufferToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function hashShareToken(token: string): string {
  return "0x" + bufferToBase64(new TextEncoder().encode(token)).slice(0, 40).replace(/[^a-f0-9]/gi, "a");
}

async function deriveShareKey(shareToken: string, ownerAddress: string): Promise<CryptoKey> {
  const tokenBytes = new TextEncoder().encode(shareToken);
  const saltBytes = new TextEncoder().encode(ownerAddress.toLowerCase());
  const info = new TextEncoder().encode("exo-share-v1");

  const baseKey = await subtle().importKey("raw", tokenBytes, { name: "HKDF" }, false, ["deriveKey"]);

  return subtle().deriveKey(
    { name: "HKDF", hash: "SHA-256", salt: saltBytes, info },
    baseKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function encryptMasterKeyForShare(
  masterKey: CryptoKey,
  shareToken: string,
  ownerAddress: string
): Promise<string> {
  const shareKey = await deriveShareKey(shareToken, ownerAddress);
  const masterKeyBytes = await subtle().exportKey("raw", masterKey);
  const iv = crypto.getRandomValues(new Uint8Array(16));

  const encrypted = await subtle().encrypt({ name: "AES-GCM", iv }, shareKey, masterKeyBytes);

  return JSON.stringify({
    iv: bufferToBase64(iv),
    data: bufferToBase64(new Uint8Array(encrypted)),
  });
}

export async function decryptMasterKeyFromShare(
  encryptedDek: string,
  shareToken: string,
  ownerAddress: string
): Promise<CryptoKey> {
  const shareKey = await deriveShareKey(shareToken, ownerAddress);
  const { iv, data } = JSON.parse(encryptedDek);

  const decrypted = await subtle().decrypt(
    { name: "AES-GCM", iv: base64ToBuffer(iv) },
    shareKey,
    base64ToBuffer(data)
  );

  return subtle().importKey("raw", decrypted, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

export function buildShareUrl(token: string): string {
  if (typeof window === "undefined") return `/shared/${token}`;
  return `${window.location.origin}/shared/${token}`;
}
