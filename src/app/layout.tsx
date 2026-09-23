import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Growth OS",
  description: "A private, all-in-one system for tracking growth across every dimension of life.",
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-100 font-sans">{children}</body>
    </html>
  );
}
