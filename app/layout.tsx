import type { Metadata } from "next";
import { ConvexProvider } from "convex/react";
import { convex } from "./convexClient";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quiz Multiplayer in Tempo Reale",
  description: "Demo real-time quiz multiplayer con Next.js e Convex."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>
        <ConvexProvider client={convex}>{children}</ConvexProvider>
      </body>
    </html>
  );
}
