import type { Metadata } from "next";
import "./globals.css";
import "./game-painted.css";

export const metadata: Metadata = {
  title: "Crosswalk · a little life, together",
  description: "A modern life game for 1–4 players. Eight weeks. One city. Your kind of good life.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
