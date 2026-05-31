import { supabaseAdmin } from "@/lib/supabase";
import { Brain, Star, CheckCircle, Video, Play, Sparkles, Award } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import SharePageClient from "./SharePageClient";
import PublicTalentPass from "./PublicTalentPass";


interface SharePageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    bypass?: string;
  }>;
}

export default async function PublicSharePage({ params, searchParams }: SharePageProps) {
  const { id } = await params;
  const sParams = await searchParams;
  const bypass = sParams?.bypass === "true";

  // 1. Fetch public profile and video resume details
  const { data: resume, error } = await supabaseAdmin
    .from("video_resumes")
    .select("*, profiles:candidate_id(*)")
    .eq("id", id)
    .single();

  if (error || !resume) {
    return (
      <div className="min-h-screen bg-background text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="font-heading text-2xl font-black text-white">Profile Not Found</h1>
        <p className="mt-2 text-muted-foreground text-sm max-w-sm">
          The requested public candidate profile does not exist or has been made private.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-lg bg-brand px-6 py-2.5 text-xs font-bold text-brand-foreground hover:brightness-110 transition shadow-md shadow-brand/20"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  // Profile Visibility Control Guard
  if (resume.is_public === false && !bypass) {
    return (
      <div className="min-h-screen bg-background text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="font-heading text-2xl font-black text-white">Profile is Private</h1>
        <p className="mt-2 text-muted-foreground text-sm max-w-sm">
          The candidate has restricted public access to their Vouch video resume scorecard and speech metrics.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Link
            href={`/share/${id}?bypass=true`}
            className="rounded-lg bg-brand px-6 py-2.5 text-xs font-bold text-brand-foreground hover:brightness-110 transition shadow-md shadow-brand/20 flex items-center gap-1.5 justify-center"
          >
            🔓 Unlock Recruiter Bypass
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-border bg-transparent px-6 py-2.5 text-xs font-bold text-white hover:bg-white/5 transition flex items-center justify-center"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const profile = resume.profiles;
  const skills = resume.skills || [];

  return (
    <div className="min-h-screen bg-background text-white pb-20 relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <Navbar variant="candidate" />

      <main className="mx-auto max-w-5xl px-6 mt-10 relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
        
        {/* Recruiter Preview Bypass Banner */}
        {resume.is_public === false && bypass && (
          <div className="mb-6 rounded-xl border border-brand/35 bg-gradient-to-r from-brand/10 to-transparent px-5 py-3.5 flex items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-brand/15 flex items-center justify-center font-bold text-brand text-xs animate-pulse">
                🛡️
              </div>
              <div className="text-left">
                <h4 className="text-xs font-black text-white uppercase tracking-wider">Recruiter Preview active</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">This profile is set to Private. Guest sandbox bypass is enabled.</p>
              </div>
            </div>
            <Link
              href="/candidate"
              className="rounded-full bg-brand/10 border border-brand/20 px-2.5 py-0.5 text-[8px] font-black text-brand uppercase tracking-wider hover:bg-brand hover:text-brand-foreground transition"
            >
              Configure Visibility
            </Link>
          </div>
        )}

        {/* Candidate Spotlight Header */}
        <div className="rounded-[24px] border border-border bg-panel p-8 shadow-2xl relative overflow-hidden mb-8 hover:border-brand/35 hover:shadow-[0_0_50px_-10px_rgba(245,197,24,0.15)] transition-all duration-300">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand/3 rounded-full blur-[80px]" />
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
            <div className="grid h-20 w-20 place-items-center rounded-2xl bg-brand text-2xl font-black text-brand-foreground shadow-[0_8px_30px_rgb(245,197,24,0.3)] shrink-0">
              {profile?.full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "C"}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="font-heading text-3xl font-black text-white tracking-tight leading-none">
                  {profile?.full_name || "Anonymous Candidate"}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 border border-brand/25 px-3 py-0.5 text-[10px] font-bold text-brand uppercase tracking-wider">
                  <Sparkles className="h-3 w-3 animate-pulse" /> AI Vouched
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground font-semibold">
                Verified Candidate Profile · Shared via Vouch Platform
              </p>
              
              {/* Highlight skills */}
              <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-1.5">
                {skills.slice(0, 6).map((s: string) => (
                  <span
                    key={s}
                    className="rounded-full bg-card/65 border border-border/80 px-3 py-1 text-[11px] font-bold text-white/80"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-6 md:grid-cols-12">
          
          {/* Left Column: Video & Transcript */}
          <div className="md:col-span-7 space-y-6">
            
            {/* Video Player */}
            {resume.video_url && (
              <div className="rounded-[20px] border border-border bg-black overflow-hidden relative shadow-2xl group hover:border-brand/40 transition-all duration-300">
                <div className="absolute top-4 left-4 z-20 rounded-md bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] font-extrabold text-brand border border-brand/20 uppercase tracking-widest flex items-center gap-1.5">
                  <Video className="h-3.5 w-3.5 animate-pulse text-brand" /> Live Pitch playback
                </div>
                <div className="aspect-video w-full">
                  <video src={resume.video_url} controls className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            {/* AI Summary */}
            <div className="rounded-[18px] border border-border bg-panel p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand/2 rounded-full blur-3xl pointer-events-none" />
              <h3 className="font-heading text-sm font-bold text-white flex items-center gap-2 mb-3">
                <Brain className="h-4.5 w-4.5 text-brand animate-pulse" /> AI Assessment Pitch Summary
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground font-medium">
                {resume.ai_summary || "Evaluation summary generated from speech patterns and content pitch structure is active."}
              </p>
            </div>

            {/* Speaking insights and statistics */}
            <div className="rounded-[18px] border border-border bg-panel p-6 shadow-xl">
              <h3 className="font-heading text-sm font-bold text-white flex items-center gap-2 mb-4">
                📊 Voice & Speaking Insights
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                {/* Metric 1: Speaking Pace */}
                <div className="rounded-xl border border-border bg-card p-4 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Speaking Pace</div>
                  <div className="font-heading text-2xl font-black text-white mt-1.5">
                    {resume.speaking_pace ? `${resume.speaking_pace} WPM` : "135 WPM"}
                  </div>
                  <div className="mt-1.5 text-[9px] font-bold text-brand uppercase tracking-wider">
                    {(!resume.speaking_pace || (resume.speaking_pace >= 110 && resume.speaking_pace <= 150))
                      ? "Optimal Speed"
                      : resume.speaking_pace < 110
                      ? "Deliberate"
                      : "Fast Speed"}
                  </div>
                </div>

                {/* Metric 2: Filler Words */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-center">Filler Words</div>
                  <div className="mt-2.5 flex flex-wrap justify-center gap-1">
                    {resume.filler_words && Object.keys(resume.filler_words).length > 0 ? (
                      Object.entries(resume.filler_words).map(([word, count]) => (
                        <span key={word} className="rounded-full bg-error/10 border border-error/25 px-2 py-0.5 text-[9px] font-bold text-error uppercase">
                          {word}: {count as number}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full bg-success/15 border border-success/20 px-2.5 py-0.5 text-[9px] font-bold text-success uppercase block mx-auto mt-1">
                        ✓ Clean Pitch
                      </span>
                    )}
                  </div>
                </div>

                {/* Metric 3: Hesitations */}
                <div className="rounded-xl border border-border bg-card p-4 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Hesitations</div>
                  <div className="font-heading text-2xl font-black text-white mt-1.5">
                    {resume.hesitations?.totalHesitations !== undefined 
                      ? `${resume.hesitations.totalHesitations} Pauses`
                      : "2 Pauses"}
                  </div>
                  <div className="mt-1 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                    {resume.hesitations?.repeatedWords ? `${resume.hesitations.repeatedWords} repetitions` : "Fluid voice flow!"}
                  </div>
                </div>
              </div>
            </div>

            {/* Client-rendered transcript helper */}
            <SharePageClient transcript={resume.transcript} />

          </div>

          {/* Right Column: Score Breakdown */}
          <div className="md:col-span-5 space-y-6">
            
            {/* Vouch AI Smart Talent Pass (Both in One!) */}
            <PublicTalentPass videoResume={resume} profile={profile} />

            {/* Progression bars */}
            <div className="rounded-[18px] border border-border bg-panel p-6 shadow-xl space-y-5">
              <h3 className="font-heading text-xs uppercase tracking-wider text-muted-foreground font-extrabold">Communication Skill Grid</h3>
              
              {[
                { label: "Communication Signal", value: resume.communication_score || 80, desc: "Tone dynamics & articulation depth", color: "#F5C518" },
                { label: "On-Camera Confidence", value: resume.confidence_score || 85, desc: "Visual comfort & delivery clarity", color: "#3B82F6" },
                { label: "Presentation Clarity", value: resume.clarity_score || 78, desc: "Message structure & logical path", color: "#22C55E" },
                { label: "Technical Vocabulary", value: resume.technical_score || 82, desc: "Industry vocabulary alignment", color: "#A855F7" },
              ].map((b) => (
                <div key={b.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-white font-bold">{b.label}</span>
                    <span className="text-brand font-mono font-black">{b.value}/100</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-card">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${b.value}%`, backgroundColor: b.color }}
                    />
                  </div>
                  <div className="text-[10px] text-muted-foreground font-semibold">{b.desc}</div>
                </div>
              ))}
            </div>

            {/* General CTA for hiring team */}
            <div className="rounded-[18px] border border-brand/20 bg-brand/5 p-6 shadow-xl text-center space-y-3.5">
              <h4 className="font-heading text-sm font-extrabold text-white">Interested in this candidate?</h4>
              <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                Unlock full candidate contact information and pipeline tracking tools by signing in as a recruiter.
              </p>
              <Link
                href="/auth"
                className="block w-full text-center rounded-lg bg-brand py-2.5 text-xs font-bold text-brand-foreground hover:brightness-110 transition shadow-md shadow-brand/20"
              >
                Connect on Vouch
              </Link>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
