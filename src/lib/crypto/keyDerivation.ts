"use client";

const SIGN_MESSAGE = (address: string) =>
  `Exo sovereign memory key derivation v1 — ${address}`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const subtle = () => crypto.subtle as any;

export async function deriveMasterKey(
  address: string,
  signMessage: (message: string) => Promise<string>
): Promise<CryptoKey> {
  const message = SIGN_MESSAGE(address);
  const signature = await signMessage(message);

  const sigBytes = hexToBytes(signature);
  const saltBytes = new TextEncoder().encode(address.toLowerCase());
  const info = new TextEncoder().encode("exo-master-key-v1");

  const baseKey = await subtle().importKey("raw", sigBytes, { name: "HKDF" }, false, ["deriveKey"]);

  return subtle().deriveKey(
    { name: "HKDF", hash: "SHA-256", salt: saltBytes, info },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const padded = clean.length % 2 === 0 ? clean : "0" + clean;
  const bytes = new Uint8Array(padded.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(padded.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
