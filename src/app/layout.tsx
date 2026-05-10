import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ParallelEvent™ — Central Event Management Server",
  description: "Patent-pending dual-zone event management platform. Synchronized adult and child experiences through Bio-Linked NFC security and real-time CEMS orchestration.",
  keywords: ["event management", "CEMS", "kids zone", "NFC security", "parallel event"],
  authors: [{ name: "ParallelEvent™ Systems" }],
  robots: "noindex, nofollow",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#131315",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
