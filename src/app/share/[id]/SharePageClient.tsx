"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface SharePageClientProps {
  transcript: string | null;
}

export default function SharePageClient({ transcript }: SharePageClientProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-[18px] border border-border bg-panel overflow-hidden shadow-xl">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-6 py-5 text-sm font-bold text-white transition hover:bg-white/5 outline-none"
      >
        <span className="flex items-center gap-2 font-heading font-extrabold text-sm uppercase tracking-wider">
          📝 Full Speech Transcript
        </span>
        <ChevronDown
          className={`h-4.5 w-4.5 text-brand transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="border-t border-border p-6 font-mono text-xs leading-relaxed text-muted-foreground bg-card/20 max-h-60 overflow-y-auto animate-in slide-in-from-top duration-300">
          {transcript || "No speech transcript recorded for this pitch presentation."}
        </div>
      )}
    </div>
  );
}
