"use client";

import { useEffect, useState } from "react";

export function Preloader() {
  const [mounted, setMounted] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Hide preloader after 2.2 seconds
    const timer = setTimeout(() => {
      setFadeOut(true);
      const removeTimer = setTimeout(() => {
        setMounted(false);
      }, 600); // match transition duration
      return () => clearTimeout(removeTimer);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0b0c10] transition-all duration-700 ease-in-out ${
        fadeOut ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      {/* Pulse outer halo */}
      <div className="relative flex items-center justify-center">
        <div className="absolute h-24 w-24 animate-ping rounded-2xl bg-brand/10 opacity-30 duration-2000" />
        
        {/* Sleek Golden V Logo */}
        <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-brand text-brand-foreground font-black shadow-[0_0_50px_rgba(245,197,24,0.45)] animate-pulse">
          <span className="font-heading text-3xl tracking-tighter">V</span>
        </div>
      </div>

      {/* Typography with smooth slide-up fade */}
      <div className="mt-8 text-center animate-fade-in duration-1000">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-white">VOUCH</h2>
        <p className="mt-2 text-xs uppercase tracking-[0.25em] text-brand/85 animate-pulse duration-1500">
          See the person, not the paper.
        </p>
      </div>

      {/* Premium loading bar progress indicator */}
      <div className="mt-12 h-[2px] w-48 overflow-hidden rounded-full bg-card/60">
        <div className="h-full w-full rounded-full bg-brand animate-scroll-x" style={{ animationDuration: '2s' }} />
      </div>

      {/* Mini custom animation keyframe overrides */}
      <style jsx global>{`
        @keyframes scroll-x {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-scroll-x {
          animation: scroll-x 1.8s infinite linear;
        }
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s forwards ease-out;
        }
      `}</style>
    </div>
  );
}
