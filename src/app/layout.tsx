import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Exo — Sovereign AI Memory",
  description:
    "Not your keys, not your bots. Now your keys. Your bots. Your AI's memory — encrypted, wallet-owned, on Arkiv Braga.",
  openGraph: {
    title: "Exo — Sovereign AI Memory",
    description: "Not your keys, not your bots. Now your keys. Your bots.",
    siteName: "Exo",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-[#060810] text-[#F0F4FF] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
