"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Video, Bot, ClipboardList, ArrowRight, Play, Check, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-white relative overflow-hidden">
      {/* Decorative top ambient orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-brand/5 rounded-full blur-[120px] pointer-events-none" />

      <Navbar variant="landing" />

      {/* HERO */}
      <section className="relative overflow-hidden px-6 py-28 sm:py-36">
        <div className="relative mx-auto max-w-4xl text-center z-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 backdrop-blur-md px-4 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-brand animate-pulse" /> AI-Powered Video Screening Studio
          </span>
          
          <h1 className="mt-8 font-heading text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-[72px] text-white">
            Hire for who they are,
            <br />
            <span className="text-brand drop-shadow-[0_0_30px_rgba(245,197,24,0.2)]">not how they write.</span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg font-medium leading-relaxed">
            Candidates record a 90-second video pitch. Our AI models analyze and rank communication, confidence, and signals instantly. Get shortlists in minutes.
          </p>
          
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/candidate/upload"
              className="inline-flex h-12 items-center justify-center gap-2.5 rounded-lg bg-brand px-6 text-sm font-bold text-brand-foreground transition-all duration-300 hover:brightness-105 hover:shadow-[0_4px_30px_rgba(245,197,24,0.45)] hover:-translate-y-0.5 active:translate-y-0"
            >
              <Video className="h-4.5 w-4.5" /> Record Your Pitch
            </Link>
            <Link
              href="/auth"
              className="inline-flex h-12 items-center justify-center gap-2.5 rounded-lg border border-border bg-card/45 backdrop-blur-sm px-6 text-sm font-bold text-white transition-all duration-200 hover:border-brand/50 hover:bg-card/75 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Play className="h-4 w-4 text-brand fill-brand" /> See How It Works
            </Link>
          </div>

          <div className="mt-16">
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-extrabold">Trusted by scaling startups worldwide</div>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-base font-extrabold text-white/50">
              <span className="hover:text-white transition">Razorpay</span>
              <span className="hover:text-white transition">Zepto</span>
              <span className="tracking-[0.2em] hover:text-white transition">CRED</span>
              <span className="hover:text-white transition">Groww</span>
              <span className="hover:text-white transition">Swiggy</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-24 relative z-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-heading text-3xl font-extrabold sm:text-4xl tracking-tight">
            From application to shortlist in minutes
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground font-medium">
            One fluid, integrated pipeline. Three smart stages.
          </p>
          
          <div className="relative mt-14 grid gap-6 md:grid-cols-3">
            {[
              { icon: Video, title: "1. Pitch Recording", desc: "Candidates record a short, natural video pitch directly from their webcam or upload a file." },
              { icon: Bot, title: "2. AI Signal Score", desc: "Our speech models analyze voice confidence, vocabulary signal, and core skills tags." },
              { icon: ClipboardList, title: "3. Shortlist Surface", desc: "Recruiters access a dynamic dashboard where top-tier communication talent ranks first." },
            ].map((s, i) => (
              <div
                key={s.title}
                className="relative rounded-[16px] border border-border bg-panel/65 backdrop-blur-md p-6 hover:-translate-y-1 hover:border-brand/40 transition duration-300 shadow-lg"
              >
                <div className="absolute -top-3.5 left-6 inline-flex h-7 items-center rounded-full bg-brand px-3 text-[10px] font-bold text-brand-foreground uppercase tracking-widest">
                  Stage {i + 1}
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand/10 text-brand shadow-sm mt-2">
                  <s.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-heading text-lg font-bold text-white">{s.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground font-medium">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOR RECRUITERS */}
      <section className="px-6 py-20 relative z-10">
        <div className="mx-auto grid max-w-6xl items-center gap-12 rounded-[20px] border border-border bg-panel/45 backdrop-blur-md p-8 md:grid-cols-2 md:p-12 shadow-2xl">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-brand">For Recruiters</span>
            <h2 className="mt-3 font-heading text-3xl font-extrabold sm:text-4xl tracking-tight leading-tight">Skip the resume pile. Meet your shortlist.</h2>
            <ul className="mt-6 space-y-4">
              {[
                "AI ranks applicants automatically by communication index",
                "Watch 90s visual intros instead of reading text summaries",
                "Pipeline stage updates synced to candidates in real-time"
              ].map(
                (b) => (
                  <li key={b} className="flex items-start gap-3.5 text-sm text-white/80 font-medium">
                    <Check className="mt-0.5 h-4.5 w-4.5 flex-shrink-0 text-brand bg-brand/10 rounded-full p-0.5" /> {b}
                  </li>
                ),
              )}
            </ul>
            <Link
              href="/auth"
              className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-6 text-sm font-bold text-brand-foreground hover:brightness-105 transition shadow-md"
            >
              Start Hiring Free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative">
            <div className="rounded-[16px] border border-border bg-card p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-2xl" />
              <div className="flex items-center justify-between text-xs text-muted-foreground font-extrabold">
                <span>AI-Ranked Shortlist</span>
                <span className="rounded-full bg-brand/15 px-3 py-0.5 text-brand border border-brand/15">Active</span>
              </div>
              <div className="mt-5 space-y-3.5 relative z-10">
                {[{ n: "Priya S.", s: 92 }, { n: "Arjun K.", s: 87 }, { n: "Meera R.", s: 78 }].map((c, i) => (
                  <div key={c.n} className="flex items-center gap-3.5 rounded-xl border border-border/80 bg-panel/75 p-3.5">
                    <div className={`grid h-7 w-7 place-items-center rounded-full text-[10px] font-black ${i === 0 ? "bg-yellow-400 text-black" : i === 1 ? "bg-gray-300 text-black" : "bg-amber-700 text-white"}`}>
                      #{i + 1}
                    </div>
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-brand text-xs font-black text-brand-foreground shadow-sm">
                      {c.n.split(" ").map(p => p[0]).join("")}
                    </div>
                    <div className="flex-1 text-sm font-bold text-white">{c.n}</div>
                    <div className="font-heading text-lg font-black text-brand">{c.s}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOR CANDIDATES */}
      <section className="px-6 py-20 relative z-10">
        <div className="mx-auto grid max-w-6xl items-center gap-12 rounded-[20px] border border-border bg-panel/45 backdrop-blur-md p-8 md:grid-cols-2 md:p-12 shadow-2xl">
          <div className="order-2 md:order-1 relative">
            <div className="rounded-[16px] border border-border bg-card p-6 shadow-2xl">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-extrabold">AI Signal Scorecard</div>
              <div className="mt-5 grid grid-cols-2 gap-4">
                {[
                  { l: "Communication", v: 88, c: "#F5C518" },
                  { l: "Confidence", v: 82, c: "#3B82F6" },
                  { l: "Clarity", v: 91, c: "#22C55E" },
                  { l: "Technical Signal", v: 76, c: "#A855F7" },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl border border-border bg-panel p-3.5 text-center">
                    <div className="font-heading text-2xl font-black" style={{ color: s.c }}>{s.v}</div>
                    <div className="mt-1 text-[10px] text-muted-foreground font-bold">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-brand">For Candidates</span>
            <h2 className="mt-3 font-heading text-3xl font-extrabold sm:text-4xl tracking-tight leading-tight">Your story, not your spelling.</h2>
            <ul className="mt-6 space-y-4">
              {[
                "Present your true speaking capabilities in a 90s intro",
                "Receive transparent skill scores and speech tag details",
                "Dynamic application updates and pipeline stages in view"
              ].map(
                (b) => (
                  <li key={b} className="flex items-start gap-3.5 text-sm text-white/80 font-medium">
                    <Check className="mt-0.5 h-4.5 w-4.5 flex-shrink-0 text-brand bg-brand/10 rounded-full p-0.5" /> {b}
                  </li>
                ),
              )}
            </ul>
            <Link
              href="/candidate/upload"
              className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-6 text-sm font-bold text-brand-foreground hover:brightness-105 transition shadow-md"
            >
              Record Your Intro <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* STATS BANNER */}
      <section className="px-6 py-16 relative z-10">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 rounded-[20px] bg-brand p-10 text-brand-foreground md:grid-cols-4 shadow-xl">
          {[
            { v: "10K+", l: "Candidates" },
            { v: "500+", l: "Companies" },
            { v: "95%", l: "Match Accuracy" },
            { v: "10x", l: "Faster Screening" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="font-heading text-3xl font-black sm:text-4xl">{s.v}</div>
              <div className="mt-1.5 text-xs font-bold uppercase tracking-wider opacity-85">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
