import type { Metadata } from "next";
import "./globals.css";
import { Preloader } from "@/components/Preloader";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Vouch - AI Video Resume Platform",
  description: "AI-powered video screening that ranks candidates by communication, confidence, and skills in minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col relative">
        {/* Toast Notifications */}
        <Toaster closeButton richColors position="top-right" />

        {/* Splash Preloader */}
        <Preloader />

        {/* Ambient Moving Gradient Background */}
        <div className="ambient-bg" aria-hidden="true">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
          {/* Glassmorphic 3D morphing objects */}
          <div className="interactive-3d-scene">
            <div className="shape-3d shape-1" />
            <div className="shape-3d shape-2" />
            <div className="shape-3d shape-3" />
          </div>
        </div>

        {/* Core Page Content */}
        {children}
      </body>
    </html>
  );
}
