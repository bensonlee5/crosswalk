import type { Metadata } from "next";
import "./globals.css";
import "./game-painted.css";
import "./turn-clock.css";
import "./life-story.css";
import "./encounter-story.css";

export const metadata: Metadata = {
  title: "Crosswalk · a little life, together",
  description: "A modern life game for 1–4 players. Eight months. Five living regions. Your kind of good life.",
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
