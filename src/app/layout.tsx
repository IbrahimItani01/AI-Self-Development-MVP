import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Student Development Companion",
  description: "Telegram-based student development support with a lightweight school dashboard.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
