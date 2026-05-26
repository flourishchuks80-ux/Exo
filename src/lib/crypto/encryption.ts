"use client";

import type { EncryptedPayload } from "@/lib/arkiv/schemas";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const subtle = () => crypto.subtle as any;

export async function encryptPayload(
  data: object,
  masterKey: CryptoKey
): Promise<EncryptedPayload> {
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const plaintext = new TextEncoder().encode(JSON.stringify(data));

  const encrypted = await subtle().encrypt({ name: "AES-GCM", iv }, masterKey, plaintext);

  // AES-GCM appends authTag (16 bytes) at the end of ciphertext
  const encryptedBytes = new Uint8Array(encrypted);
  const ciphertext = encryptedBytes.slice(0, -16);
  const authTag = encryptedBytes.slice(-16);

  return {
    iv: bufferToBase64(iv),
    ciphertext: bufferToBase64(ciphertext),
    authTag: bufferToBase64(authTag),
    version: "aes-256-gcm-v1",
  };
}

export async function decryptPayload<T>(
  encrypted: EncryptedPayload,
  masterKey: CryptoKey
): Promise<T> {
  const iv = base64ToBuffer(encrypted.iv);
  const ciphertext = base64ToBuffer(encrypted.ciphertext);
  const authTag = base64ToBuffer(encrypted.authTag);

  // Reassemble ciphertext + authTag
  const combined = new Uint8Array(ciphertext.length + authTag.length);
  combined.set(ciphertext);
  combined.set(authTag, ciphertext.length);

  const decrypted = await subtle().decrypt({ name: "AES-GCM", iv }, masterKey, combined);

  return JSON.parse(new TextDecoder().decode(decrypted)) as T;
}

export function bufferToBase64(buffer: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
}

export function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function isEncryptedPayload(value: unknown): value is EncryptedPayload {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.iv === "string" &&
    typeof v.ciphertext === "string" &&
    typeof v.authTag === "string" &&
    v.version === "aes-256-gcm-v1"
  );
}

export function parseEntityPayload(raw: string | null): EncryptedPayload | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return isEncryptedPayload(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
