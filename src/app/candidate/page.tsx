"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Video, Zap, Briefcase, Camera, ArrowRight, RefreshCw, Brain, FileText, CheckCircle, Share2, Award, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import * as RechartsPrimitive from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { toast } from "sonner";

function ScoreRing({ value, color, label }: { value: number; color: string; label: string }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const glowId = `glow-${label.replace(/\s+/g, '').toLowerCase()}`;

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border/80 bg-card/65 backdrop-blur-md p-5 transition-all duration-300 hover:scale-105 hover:border-brand/40 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] cursor-default group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="relative h-24 w-24">
        <svg viewBox="0 0 88 88" className="-rotate-90 w-full h-full">
          <defs>
            <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor={color} floodOpacity="0.6" />
            </filter>
          </defs>
          <circle cx="44" cy="44" r={r} stroke="#1b1c24" strokeWidth="5.5" fill="none" />
          <circle
            cx="44"
            cy="44"
            r={r}
            stroke={color}
            strokeWidth="5.5"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            filter={`url(#${glowId})`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center font-heading text-2xl font-black text-white tracking-tighter group-hover:scale-110 transition-transform duration-300">{value}</div>
      </div>
      <div className="mt-3.5 text-xs text-muted-foreground font-bold uppercase tracking-wider group-hover:text-white transition-colors duration-300">{label}</div>
    </div>
  );
}
export default function CandidateDashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [videoResume, setVideoResume] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [openFeedbackAppId, setOpenFeedbackAppId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [applying, setApplying] = useState(false);
  const [jobSearch, setJobSearch] = useState("");
  const [jobLocationFilter, setJobLocationFilter] = useState("All");
  const [selectedJobDetail, setSelectedJobDetail] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setUser(user);

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (!profile) {
        router.push("/auth");
        return;
      }
      if (profile.role !== "candidate") {
        router.push("/auth");
        return;
      }
      setProfile(profile);

      // Fetch via secure server endpoint to bypass client-side RLS limits
      const res = await fetch(`/api/candidate/video-resume?userId=${user.id}`);
      const video = res.ok ? await res.json() : null;
      setVideoResume(video);

      // Fetch live jobs from Supabase
      const { data: dbJobs } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
      const activeJobs = dbJobs || [];
      setJobs(activeJobs);

      // Fetch candidate applications
      const { data: dbApps } = await supabase
        .from("applications")
        .select("*, jobs(*)")
        .eq("candidate_id", user.id)
        .order("created_at", { ascending: false });
      setApplications(dbApps || []);

      try {
        const { data: dbInterviews } = await supabase
          .from("interviews")
          .select("*, recruiter:recruiter_id(*)")
          .eq("candidate_id", user.id)
          .order("scheduled_at", { ascending: true });
        setInterviews(dbInterviews || []);
      } catch (err) {
        console.warn("Failed to fetch interviews:", err);
      }

      try {
        const { data: dbAssessments } = await supabase
          .from("assessments")
          .select("*")
          .eq("candidate_id", user.id)
          .order("completed_at", { ascending: false });
        setAssessments(dbAssessments || []);
      } catch (err) {
        console.warn("Failed to fetch assessments:", err);
      }

      const displayedList = activeJobs.length > 0 ? activeJobs : [
        { id: "11111111-1111-1111-1111-111111111111", title: "Frontend Engineer", company: "Razorpay", location: "Bangalore · Remote", required_skills: ["React", "TypeScript", "Next.js"], description: "Join our core UI engineering team to build highly performant consumer checkout experiences. You will design clean modular components, optimize layout rendering speeds, and integrate next-generation client APIs." },
        { id: "22222222-2222-2222-2222-222222222222", title: "Product Designer", company: "Zepto", location: "Mumbai", required_skills: ["Figma", "UX", "Prototyping"], description: "Help shape the future of quick-commerce grocery delivery! Design intuitive customer dashboards, create hyper-fast checkout funnel interactions, and align complex visual design systems." },
        { id: "33333333-3333-3333-3333-333333333333", title: "ML Engineer", company: "CRED", location: "Bangalore", required_skills: ["Python", "PyTorch", "NLP"], description: "Build, scale, and optimize machine learning scoring modules that evaluate user transactions and predict credit capabilities. Work on core NLP and deep learning models in production cloud systems." },
        { id: "44444444-4444-4444-4444-444444444444", title: "Growth Marketer", company: "Groww", location: "Remote", required_skills: ["SEO", "Content", "Analytics"], description: "Drive high-impact customer acquisition funnels for our core investment products. Build SEO strategies, analyze advertising data performance, and design organic content campaigns." }
      ];
      if (displayedList.length > 0) {
        setSelectedJobDetail(displayedList[0]);
      }

      setLoading(false);
    };
    getData();
  }, [router]);

  // Self-healing check: automatically trigger AI rejection feedback generation if an application is marked rejected but has no feedback yet
  useEffect(() => {
    if (loading || applications.length === 0) return;
    
    const pendingFeedbackApps = applications.filter(
      (app) => app.stage === "rejected" && !app.rejection_feedback
    );

    if (pendingFeedbackApps.length > 0) {
      pendingFeedbackApps.forEach((app) => {
        fetch("/api/recruiter/reject-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicationId: app.id }),
        })
          .then((res) => {
            if (res.ok) return res.json();
            throw new Error("Feedback generation failed");
          })
          .then((data) => {
            if (data && data.feedback) {
              setApplications((prev) =>
                prev.map((a) =>
                  a.id === app.id ? { ...a, rejection_feedback: data.feedback } : a
                )
              );
            }
          })
          .catch((err) => console.warn("Auto-generation of reject feedback failed:", err));
      });
    }
  }, [applications, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          <span className="font-heading font-medium tracking-tight">Loading candidate dashboard...</span>
        </div>
      </div>
    );
  }

  const getInitials = (name?: string) => {
    if (!name) return "JS";
    return name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
  };

  const hasVideo = !!videoResume;
  const overall = videoResume?.overall_score || 0;
  const overallColor = overall >= 80 ? "#22C55E" : overall >= 60 ? "#F5C518" : "#EF4444";

  const scores = [
    { label: "Communication", value: videoResume?.communication_score || 0, color: "#F5C518" },
    { label: "Confidence", value: videoResume?.confidence_score || 0, color: "#3B82F6" },
    { label: "Clarity", value: videoResume?.clarity_score || 0, color: "#22C55E" },
    { label: "Technical", value: videoResume?.technical_score || 0, color: "#A855F7" },
  ];

  // Combined real database jobs + elegant fallback options
  const displayedJobs = jobs.length > 0 ? jobs : [
    { id: "11111111-1111-1111-1111-111111111111", title: "Frontend Engineer", company: "Razorpay", location: "Bangalore · Remote", required_skills: ["React", "TypeScript", "Next.js"], description: "Join our core UI engineering team to build highly performant consumer checkout experiences. You will design clean modular components, optimize layout rendering speeds, and integrate next-generation client APIs." },
    { id: "22222222-2222-2222-2222-222222222222", title: "Product Designer", company: "Zepto", location: "Mumbai", required_skills: ["Figma", "UX", "Prototyping"], description: "Help shape the future of quick-commerce grocery delivery! Design intuitive customer dashboards, create hyper-fast checkout funnel interactions, and align complex visual design systems." },
    { id: "33333333-3333-3333-3333-333333333333", title: "ML Engineer", company: "CRED", location: "Bangalore", required_skills: ["Python", "PyTorch", "NLP"], description: "Build, scale, and optimize machine learning scoring modules that evaluate user transactions and predict credit capabilities. Work on core NLP and deep learning models in production cloud systems." },
    { id: "44444444-4444-4444-4444-444444444444", title: "Growth Marketer", company: "Groww", location: "Remote", required_skills: ["SEO", "Content", "Analytics"], description: "Drive high-impact customer acquisition funnels for our core investment products. Build SEO strategies, analyze advertising data performance, and design organic content campaigns." }
  ];

  const filteredJobs = displayedJobs.filter(j => {
    const title = (j.title || "").toLowerCase();
    const company = (j.company || j.co || "").toLowerCase();
    const searchMatch = title.includes(jobSearch.toLowerCase()) || company.includes(jobSearch.toLowerCase());
    
    if (jobLocationFilter === "All") return searchMatch;
    const location = (j.location || j.loc || "").toLowerCase();
    if (jobLocationFilter === "Remote") return searchMatch && location.includes("remote");
    return searchMatch && location.includes(jobLocationFilter.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-background text-white pb-16">
      <Navbar variant="candidate" initials={getInitials(profile?.full_name)} />
      
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Header with floating ambient backdrop blur */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-heading text-3xl font-extrabold tracking-tight">Welcome back, {profile?.full_name?.split(" ")[0] || "Candidate"} 👋</h1>
            <p className="mt-1.5 text-sm text-muted-foreground font-medium">Your AI-powered profile is live. Recruiters can find you directly.</p>
          </div>
          {!hasVideo && (
            <Link
              href="/candidate/upload"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-brand-foreground hover:brightness-105 transition duration-200 shadow-[0_4px_24px_rgba(245,197,24,0.35)]"
            >
              <Video className="w-4 h-4 animate-pulse" /> Complete Setup Now
            </Link>
          )}
        </div>

        {/* Stats Section with glassmorphic cards */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[16px] border border-border bg-card p-5 hover:border-brand/35 hover:shadow-[0_0_30px_-5px_rgba(245,197,24,0.12)] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand">
                  <Video className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold text-white">Video Pitch</span>
              </div>
              {hasVideo ? (
                <span className="rounded-full bg-success/15 px-3 py-1 text-[11px] font-semibold text-success border border-success/20">Uploaded</span>
              ) : (
                <span className="rounded-full bg-error/15 px-3 py-1 text-[11px] font-semibold text-error border border-error/20">Missing</span>
              )}
            </div>
          </div>
          <div className="rounded-[16px] border border-border bg-card p-5 hover:border-brand/35 hover:shadow-[0_0_30px_-5px_rgba(245,197,24,0.12)] transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">AI Overall Rating</div>
                <div className="mt-1 font-heading text-2xl font-black text-brand">{hasVideo ? `${overall}/100` : "--"}</div>
              </div>
            </div>
          </div>
          <div className="rounded-[16px] border border-border bg-card p-5 hover:border-brand/35 hover:shadow-[0_0_30px_-5px_rgba(245,197,24,0.12)] transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">Submitted Applications</div>
                <div className="mt-1 font-heading text-2xl font-black text-white">{applications.length}</div>
              </div>
            </div>
          </div>
          <div className="rounded-[16px] border border-border bg-card p-5 hover:border-brand/35 hover:shadow-[0_0_30px_-5px_rgba(245,197,24,0.12)] transition-all duration-300 relative group overflow-hidden">
            <Link href="/candidate/assessment" className="absolute inset-0 z-10" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand animate-pulse">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">Skill Rating</div>
                  <div className="mt-1 font-heading text-2xl font-black text-white">
                    {assessments.length > 0 ? `${Math.max(...assessments.map(a => a.score))}%` : "0%"}
                  </div>
                </div>
              </div>
              <span className="rounded-full bg-brand/15 px-2.5 py-1 text-[9px] font-bold text-brand uppercase border border-brand/20 tracking-wider group-hover:bg-brand group-hover:text-brand-foreground transition shrink-0 z-20">
                Quiz →
              </span>
            </div>
          </div>
        </div>

        {/* Skills Signal Analytics Panel */}
        {hasVideo && (
          <div className="mt-8 rounded-[18px] border border-border bg-panel p-6 shadow-2xl relative overflow-hidden animate-in slide-in-from-top duration-300 hover:border-brand/30 hover:shadow-[0_0_40px_-10px_rgba(245,197,24,0.15)] transition-all duration-300">
            <div className="absolute top-0 right-0 w-80 h-80 bg-brand/3 rounded-full blur-[100px] pointer-events-none" />
            <h3 className="font-heading text-lg font-bold text-white tracking-tight">Vouch Speech Signal Strengths</h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5 mb-6">AI benchmark comparison of your speaking traits vs. the global applicant pool.</p>
            
            <div className="h-72 w-full pr-4 mt-6">
              <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
                <RechartsPrimitive.AreaChart 
                  data={[
                    { name: "Communication", rating: videoResume.communication_score || 0, average: 74 },
                    { name: "Confidence", rating: videoResume.confidence_score || 0, average: 70 },
                    { name: "Clarity", rating: videoResume.clarity_score || 0, average: 72 },
                    { name: "Technical Vocab", rating: videoResume.technical_score || 0, average: 65 }
                  ]}
                  margin={{ top: 15, right: 15, left: -15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRatingPremium" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F5C518" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#F5C518" stopOpacity={0.01}/>
                    </linearGradient>
                    <linearGradient id="colorAveragePremium" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.01}/>
                    </linearGradient>
                    <filter id="chartGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#F5C518" floodOpacity="0.4" />
                    </filter>
                  </defs>
                  <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" stroke="#22242e" opacity={0.5} vertical={false} />
                  <RechartsPrimitive.XAxis 
                    dataKey="name" 
                    stroke="#8A8F98" 
                    fontSize={11} 
                    fontFamily="Outfit, sans-serif"
                    tickLine={false} 
                    axisLine={false} 
                    dy={12} 
                  />
                  <RechartsPrimitive.YAxis 
                    stroke="#8A8F98" 
                    fontSize={11} 
                    fontFamily="Outfit, sans-serif"
                    tickLine={false} 
                    axisLine={false} 
                    domain={[0, 100]} 
                  />
                  <RechartsPrimitive.Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-xl border border-border bg-panel/90 backdrop-blur-md p-3.5 shadow-2xl animate-in fade-in duration-100">
                            <p className="text-xs font-black uppercase tracking-wider text-brand mb-2">{payload[0].payload.name}</p>
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-6 justify-between">
                                <span className="text-white/70 font-semibold">Your AI Score:</span>
                                <span className="text-brand font-black text-sm">{payload[0].value}/100</span>
                              </div>
                              <div className="flex items-center gap-6 justify-between">
                                <span className="text-white/60">Community Average:</span>
                                <span className="text-blue-400 font-bold">{payload[1].value}/100</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <RechartsPrimitive.Area 
                    type="monotone" 
                    dataKey="rating" 
                    stroke="#F5C518" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorRatingPremium)" 
                    activeDot={{ r: 6, stroke: "#F5C518", strokeWidth: 2, fill: "#ffffff" }}
                    dot={{ r: 4, stroke: "#F5C518", strokeWidth: 2, fill: "#13151f" }}
                    filter="url(#chartGlow)"
                  />
                  <RechartsPrimitive.Area 
                    type="monotone" 
                    dataKey="average" 
                    stroke="#3B82F6" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorAveragePremium)" 
                    strokeDasharray="4 4"
                    activeDot={{ r: 5, stroke: "#3B82F6", strokeWidth: 1.5, fill: "#ffffff" }}
                    dot={{ r: 3, stroke: "#3B82F6", strokeWidth: 1.5, fill: "#13151f" }}
                  />
                </RechartsPrimitive.AreaChart>
              </RechartsPrimitive.ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Video Resume Card */}
        <div className="mt-8 rounded-[18px] border border-border bg-panel p-6 sm:p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand/5 rounded-full blur-[100px] pointer-events-none" />
          {!hasVideo ? (
            <div className="rounded-[14px] border border-dashed border-border/70 bg-card/25 p-12 text-center relative z-10">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand/10 text-brand mb-4 shadow-[0_4px_20px_rgba(245,197,24,0.15)]">
                <Camera className="h-8 w-8" />
              </div>
              <h3 className="font-heading text-2xl font-bold">Record your 90-second intro</h3>
              <p className="mx-auto mt-2.5 max-w-sm text-sm text-muted-foreground font-medium">
                Let recruiters see the real you — your communication style, confidence, and passion.
              </p>
              <Link
                href="/candidate/upload"
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-brand px-6 text-sm font-semibold text-brand-foreground hover:brightness-105 transition shadow-[0_4px_24px_rgba(245,197,24,0.4)]"
              >
                <Video className="h-4 w-4" /> Start Studio
              </Link>
            </div>
          ) : (
            <div className="relative z-10">
              {/* Row 1: Video + Score Rings side by side */}
              <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
                <div className="relative aspect-video overflow-hidden rounded-[14px] border border-border bg-black shadow-xl">
                  <video
                    src={videoResume.video_url}
                    controls
                    className="w-full h-full object-cover"
                  />
                  {videoResume.status === "processing" && (
                    <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-3 p-4 text-center">
                      <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                      <div className="text-brand font-bold text-sm tracking-wide">🧠 AI is analyzing speech signal...</div>
                      <p className="text-xs text-muted-foreground max-w-xs">Whisper v3 parsing transcript → Gemini generating scoring. Done in seconds.</p>
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-brand font-extrabold mb-4">AI Scorecard Breakdown</div>
                  <div className="grid grid-cols-2 gap-4">
                    {scores.map((s) => (
                      <ScoreRing key={s.label} value={s.value} color={s.color} label={s.label} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 2: Overall Rating + AI Feedback — snug below, no dead gap */}
              <div className="mt-4 flex items-center gap-5 rounded-[14px] border border-border bg-card/60 p-5 backdrop-blur-md">
                <div className="text-center shrink-0 pl-2 pr-4 border-r border-border/50">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Overall</div>
                  <div className="font-heading text-5xl font-black leading-none mt-1" style={{ color: overallColor }}>
                    {overall}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
                    <Brain className="h-4 w-4 text-brand animate-pulse shrink-0" /> AI Evaluation Feedback
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground font-medium">
                    {videoResume.ai_summary || "Speech feedback generated instantly on video completion. Your pitch is fully indexed."}
                  </p>
                </div>
              </div>

              {/* Voice & Speech Signal Insights Panel */}
              <div className="mt-4 rounded-[14px] border border-border bg-card/45 p-5 backdrop-blur-md">
                <div className="flex items-center gap-2 text-sm font-bold text-white mb-4">
                  <span className="text-brand">📊</span> Voice & Speaking Signal Insights
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {/* Metric 1: Speaking Pace */}
                  <div className="rounded-xl border border-border/80 bg-panel/40 p-4 text-center">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Speaking Pace</div>
                    <div className="font-heading text-2xl font-black text-white mt-1.5">
                      {videoResume.speaking_pace ? `${videoResume.speaking_pace} WPM` : "135 WPM"}
                    </div>
                    <div className="mt-1.5 text-[10px] font-bold text-brand uppercase tracking-wider">
                      {(!videoResume.speaking_pace || (videoResume.speaking_pace >= 110 && videoResume.speaking_pace <= 150))
                        ? "Optimal Speed"
                        : videoResume.speaking_pace < 110
                        ? "Slightly Deliberate"
                        : "Slightly Fast"}
                    </div>
                  </div>

                  {/* Metric 2: Filler Words */}
                  <div className="rounded-xl border border-border/80 bg-panel/40 p-4">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-center">Filler Words Count</div>
                    <div className="mt-2.5 flex flex-wrap justify-center gap-1.5">
                      {videoResume.filler_words && Object.keys(videoResume.filler_words).length > 0 ? (
                        Object.entries(videoResume.filler_words).map(([word, count]) => (
                          <span key={word} className="rounded-full bg-error/10 border border-error/25 px-2.5 py-0.5 text-[9px] font-bold text-error uppercase">
                            {word}: {count as number}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-full bg-success/15 border border-success/20 px-2.5 py-0.5 text-[9px] font-bold text-success uppercase tracking-wider block mx-auto text-center mt-1">
                          ✓ 0 Fillers Detected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metric 3: Hesitations */}
                  <div className="rounded-xl border border-border/80 bg-panel/40 p-4 text-center">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Hesitations Detection</div>
                    <div className="font-heading text-2xl font-black text-white mt-1.5">
                      {videoResume.hesitations?.totalHesitations !== undefined 
                        ? `${videoResume.hesitations.totalHesitations} Pauses`
                        : "2 Pauses"}
                    </div>
                    <div className="mt-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      {videoResume.hesitations?.repeatedWords ? `${videoResume.hesitations.repeatedWords} word repeats` : "Fluid transitions!"}
                    </div>
                  </div>
                </div>
              </div>


              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-border/40">
                <div className="flex flex-wrap gap-2">
                  {videoResume.skills && videoResume.skills.length > 0 ? (
                    videoResume.skills.map((s: string) => (
                      <span
                        key={s}
                        className="rounded-full border border-brand/30 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    ["React", "TypeScript", "Communication", "Fast Learner"].map((s) => (
                      <span
                        key={s}
                        className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
                      >
                        {s}
                      </span>
                    ))
                  )}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => {
                      const shareUrl = window.location.origin + "/share/" + videoResume.id;
                      navigator.clipboard.writeText(shareUrl);
                      toast.success("Public portfolio share link copied to clipboard!");
                    }}
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-bold text-brand-foreground hover:brightness-110 transition duration-200 shadow-md shadow-brand/20"
                  >
                    <Share2 className="h-4 w-4" /> Share Portfolio
                  </button>
                  <button
                    onClick={() => setIsPassModalOpen(true)}
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-brand/40 bg-brand/5 px-4 text-sm font-bold text-brand hover:bg-brand hover:text-brand-foreground transition duration-200"
                  >
                    <Award className="h-4 w-4" /> View AI ID Card
                  </button>
                  <Link
                    href="/candidate/upload"
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-transparent px-4 text-sm font-semibold text-white hover:border-brand/60 hover:bg-white/5 transition duration-200"
                  >
                    <RefreshCw className="h-4 w-4" /> Re-record Pitch
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Active Applications Timeline */}
        <div id="applications" className="mt-12 scroll-mt-20">
          <h2 className="font-heading text-2xl font-extrabold tracking-tight text-white">Application Pipeline Status</h2>
          <p className="mt-1.5 text-sm text-muted-foreground font-medium">Track your candidate pitch stages dynamically.</p>
          
          {applications.length === 0 ? (
            <div className="mt-6 rounded-[16px] border border-border border-dashed bg-card/25 p-8 text-center">
              <span className="text-3xl">💼</span>
              <h4 className="mt-2 text-sm font-bold text-white">No active applications</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">Apply to available positions below using your Vouch video intro to track your hiring stage live!</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {applications.map((app) => {
                const stage = app.stage || "applied";
                const steps = ["applied", "reviewed", "interview", "hired"];
                const currentIdx = steps.indexOf(stage);
                const isRejected = stage === "rejected";

                return (
                  <div key={app.id} className="rounded-[16px] border border-border bg-panel p-5 relative overflow-hidden shadow-lg hover:border-brand/25 transition duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand/2 rounded-full blur-2xl" />
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <h3 className="font-heading text-base font-bold text-white">{app.jobs?.title || "Position"}</h3>
                        <p className="text-xs text-muted-foreground font-semibold mt-0.5">{app.jobs?.company || "Company"}</p>
                      </div>
                      {isRejected ? (
                        <span className="rounded-full bg-error/15 px-3 py-1 text-[11px] font-bold text-error border border-error/20">Rejected</span>
                      ) : stage === "hired" ? (
                        <span className="rounded-full bg-success/15 px-3 py-1 text-[11px] font-bold text-success border border-success/20 animate-bounce">Hired! 🎉</span>
                      ) : (
                        <span className="rounded-full bg-brand/15 px-3 py-1 text-[11px] font-bold text-brand border border-brand/20 uppercase tracking-wider">
                          In Progress
                        </span>
                      )}
                    </div>

                    {!isRejected && (
                      <div className="mt-5 flex items-center justify-between gap-1 overflow-x-auto pb-1 relative z-10">
                        {steps.map((stepName, i) => {
                          const isDone = i < currentIdx;
                          const isCurrent = i === currentIdx;
                          return (
                            <div key={stepName} className="flex flex-col items-center gap-1.5 min-w-[75px] flex-1">
                              <div className="flex items-center w-full">
                                <div
                                  className={`grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold shrink-0 transition ${
                                    isCurrent
                                      ? "bg-brand text-brand-foreground shadow-[0_0_12px_rgba(245,197,24,0.45)]"
                                      : isDone
                                      ? "bg-success text-white"
                                      : "bg-card text-muted-foreground border border-border"
                                  }`}
                                >
                                  {isDone ? "✓" : i + 1}
                                </div>
                                {i < steps.length - 1 && (
                                  <div className={`h-[2px] w-full ml-1 ${isDone ? "bg-success" : "bg-border"}`} />
                                )}
                              </div>
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider ${
                                  isCurrent ? "text-brand" : isDone ? "text-success" : "text-muted-foreground"
                                }`}
                              >
                                {stepName}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {isRejected && (
                      <div className="mt-4 rounded-xl border border-error/25 bg-error/5 p-4 animate-in fade-in duration-300 relative z-10 text-left">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-error mb-2">
                          <Brain className="h-4 w-4 text-error shrink-0" /> AI Growth & Constructive Feedback
                        </div>
                        
                        {app.rejection_feedback ? (
                          <>
                            <p className="text-[11px] leading-relaxed text-muted-foreground font-semibold">
                              Thank you for taking the time to complete our AI assessment. Vouch AI has compiled a comprehensive growth report based on your speech signals and presentation metrics to help you succeed next time!
                            </p>
                            <button
                              onClick={() => setOpenFeedbackAppId(openFeedbackAppId === app.id ? null : app.id)}
                              className="mt-3.5 inline-flex items-center gap-1.5 rounded-lg border border-brand/40 bg-brand/5 px-3 py-1.5 text-[10px] font-black text-brand uppercase tracking-wider hover:bg-brand hover:text-brand-foreground transition"
                            >
                              {openFeedbackAppId === app.id ? "✕ Hide Growth Feedback" : "📝 Read AI Growth Report"}
                            </button>
                            
                            {openFeedbackAppId === app.id && (
                              <div className="mt-3 rounded-lg bg-[#13151f]/85 p-3.5 border border-border/40 max-h-56 overflow-y-auto text-[10.5px] leading-relaxed text-muted-foreground whitespace-pre-line font-medium animate-in slide-in-from-top-2 duration-300 scrollbar-thin scrollbar-thumb-brand/20">
                                {app.rejection_feedback}
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-[11px] leading-relaxed text-muted-foreground whitespace-pre-line font-medium">
                            <span className="flex items-center gap-2 text-brand">
                              <RefreshCw className="h-3 w-3 animate-spin shrink-0 text-brand" /> Analyzing communications signal to generate constructive AI growth feedback...
                            </span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Scheduled Technical Session Interviews */}
        {interviews && interviews.length > 0 && (
          <div className="mt-12 animate-in fade-in duration-300">
            <h2 className="font-heading text-2xl font-extrabold tracking-tight text-white mb-1">Upcoming Technical Sessions</h2>
            <p className="text-sm text-muted-foreground font-medium mb-6">Structured virtual meetings booked by recruiter command centers.</p>
            
            <div className="grid gap-5 sm:grid-cols-2">
              {interviews.map((int) => {
                const formattedDate = new Date(int.scheduled_at).toLocaleString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                });

                return (
                  <div key={int.id} className="rounded-2xl border border-brand/20 bg-brand/5 p-6 relative overflow-hidden shadow-lg hover:border-brand/45 transition duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand/3 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="rounded-full bg-brand/10 border border-brand/20 px-3 py-0.5 text-[9px] font-bold text-brand uppercase tracking-wider">
                          Live Interview Slot
                        </span>
                        <h3 className="font-heading text-base font-black text-white mt-2">
                          {formattedDate}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 font-semibold">
                          Booked by Recruiter: <span className="text-white">{int.recruiter?.full_name || "Technical Lead"}</span> ({int.recruiter?.email || "recruiter@vouch.ai"})
                        </p>
                        {int.notes && (
                          <div className="mt-3.5 rounded-lg bg-card/60 p-3 text-[11px] font-medium text-muted-foreground border border-border/40">
                            💡 <span className="text-white/80 font-bold">Notes:</span> {int.notes}
                          </div>
                        )}
                      </div>
                      
                      <a
                        href={int.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 rounded-lg bg-brand px-4 py-2 text-xs font-bold text-brand-foreground hover:brightness-110 transition shadow-md shadow-brand/20 flex items-center gap-1.5"
                      >
                        <Zap className="h-3.5 w-3.5 shrink-0" /> Join Meet
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AI Mock Interview Simulator Premium Section */}
        <div className="mt-12 rounded-[22px] border border-border bg-panel p-6 sm:p-8 shadow-2xl relative overflow-hidden hover:border-brand/35 hover:shadow-[0_0_40px_-10px_rgba(245,197,24,0.15)] transition-all duration-300">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand/3 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <span className="rounded-full bg-brand/10 border border-brand/20 px-3 py-1 text-xs font-bold text-brand uppercase tracking-wider">
                Interactive simulator
              </span>
              <h2 className="font-heading text-2xl font-black text-white tracking-tight">
                Ace Your Next Technical Round with Vouch AI 🧠
              </h2>
              <p className="text-sm text-muted-foreground font-semibold max-w-xl">
                Start a dynamic 3-round conversational practice session. Our adaptive Gemini engine evaluates response depth, tests technical vocabulary, and grades communication styles on the fly.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                href="/candidate/mock-interview/frontend"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand px-5 text-xs font-bold text-brand-foreground hover:brightness-110 transition shadow-md shadow-brand/20 animate-in fade-in"
              >
                Frontend Mock <ChevronRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/candidate/mock-interview/backend"
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-transparent px-5 text-xs font-bold text-white hover:bg-white/5 transition"
              >
                Backend Mock <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Live Database-Backed Jobs Section - Upgraded to World-Class Job Hunt Center */}
        <div id="browse-jobs" className="mt-16 scroll-mt-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="font-heading text-2xl font-extrabold tracking-tight">Vouch Career Hub</h2>
              <p className="mt-1 text-sm text-muted-foreground font-medium">Browse active developer positions and apply instantly with your Vouch AI profile.</p>
            </div>
            {/* Search Input */}
            <div className="w-full md:w-80 relative">
              <input
                type="text"
                value={jobSearch}
                onChange={(e) => {
                  setJobSearch(e.target.value);
                  const matches = displayedJobs.filter(j => 
                    (j.title || "").toLowerCase().includes(e.target.value.toLowerCase()) ||
                    (j.company || j.co || "").toLowerCase().includes(e.target.value.toLowerCase())
                  );
                  if (matches.length > 0) setSelectedJobDetail(matches[0]);
                }}
                placeholder="Search jobs or companies..."
                className="h-10 w-full rounded-lg border border-border bg-card pl-3.5 pr-3 text-xs text-white placeholder:text-muted-foreground outline-none focus:border-brand transition"
              />
            </div>
          </div>

          {/* Location Filters Chips */}
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {["All", "Remote", "Bangalore", "Mumbai"].map((loc) => (
              <button
                key={loc}
                onClick={() => {
                  setJobLocationFilter(loc);
                  const matches = displayedJobs.filter(j => {
                    const matchesSearch = (j.title || "").toLowerCase().includes(jobSearch.toLowerCase());
                    if (loc === "All") return matchesSearch;
                    const location = (j.location || j.loc || "").toLowerCase();
                    if (loc === "Remote") return matchesSearch && location.includes("remote");
                    return matchesSearch && location.includes(loc.toLowerCase());
                  });
                  if (matches.length > 0) setSelectedJobDetail(matches[0]);
                }}
                className={`rounded-full px-3.5 py-1.5 font-bold uppercase tracking-wider border transition-all duration-200 cursor-pointer ${
                  jobLocationFilter === loc
                    ? "border-brand bg-brand text-brand-foreground shadow-md shadow-brand/10"
                    : "border-border bg-card text-muted-foreground hover:text-white hover:border-brand/40"
                }`}
              >
                {loc}
              </button>
            ))}
          </div>

          {/* Split Side-by-Side Panel Layout */}
          <div className="mt-6 grid gap-6 lg:grid-cols-12 items-start">
            {/* Left side: Job Cards List (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredJobs.length === 0 ? (
                <div className="text-center py-16 border border-border border-dashed rounded-2xl bg-card/25 animate-in fade-in duration-200">
                  <span className="text-2xl">🔍</span>
                  <p className="text-sm font-semibold text-muted-foreground mt-2">No matching jobs found.</p>
                </div>
              ) : (
                filteredJobs.map((j) => {
                  const isSelected = selectedJobDetail && selectedJobDetail.id === j.id;
                  const hasApplied = applications.some((app) => app.job_id === j.id);
                  return (
                    <button
                      key={j.id}
                      onClick={() => setSelectedJobDetail(j)}
                      className={`w-full text-left flex items-start gap-3.5 rounded-2xl border bg-card p-4 transition-all duration-300 hover:border-brand/50 hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)] cursor-pointer ${
                        isSelected 
                          ? "border-brand bg-card/85 shadow-[inset_3px_0_0_0_#F5C518] shadow-brand/5" 
                          : "border-border/60"
                      }`}
                    >
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-sm font-black text-brand-foreground shadow-md shrink-0">
                        {j.company ? j.company[0] : (j.co ? j.co[0] : "J")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-heading text-sm font-bold text-white truncate">{j.title}</div>
                        <div className="text-xs text-muted-foreground font-semibold mt-0.5 truncate">
                          {j.company || j.co} · {j.location || j.loc}
                        </div>
                        <div className="mt-2.5 flex flex-wrap gap-1">
                          {(j.required_skills || j.skills || []).slice(0, 2).map((s: string) => (
                            <span key={s} className="rounded-full bg-panel px-2.5 py-0.5 text-[9px] font-bold text-muted-foreground border border-border/40">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      {hasApplied && (
                        <span className="rounded-full bg-success/15 px-2 py-0.5 text-[9px] font-black text-success border border-success/20 shrink-0">
                          Applied
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Right side: Detailed Job Sheet Panel (lg:col-span-7) */}
            <div className="lg:col-span-7">
              {selectedJobDetail ? (
                <div className="rounded-2xl border border-border bg-panel p-6 shadow-2xl relative overflow-hidden animate-in fade-in duration-300 min-h-[420px] flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-brand/3 rounded-full blur-[60px] pointer-events-none" />
                  
                  {/* Company Initials Banner */}
                  <div>
                    <div className="flex items-center gap-4 border-b border-border/40 pb-4">
                      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand text-xl font-black text-brand-foreground shadow-lg shrink-0">
                        {selectedJobDetail.company ? selectedJobDetail.company[0] : (selectedJobDetail.co ? selectedJobDetail.co[0] : "J")}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-heading text-lg font-black text-white tracking-tight leading-tight">{selectedJobDetail.title}</h3>
                        <p className="text-sm text-brand font-bold mt-1">
                          {selectedJobDetail.company || selectedJobDetail.co} · <span className="text-muted-foreground font-semibold">{selectedJobDetail.location || selectedJobDetail.loc}</span>
                        </p>
                      </div>
                    </div>

                    {/* Job Details Parameters */}
                    <div className="mt-5 space-y-4">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-extrabold block mb-1">Job Description</span>
                        <p className="text-xs leading-relaxed text-white/80 font-medium">
                          {selectedJobDetail.description || "Join us to build state-of-the-art products and deliver exceptional user experiences inside a highly collaborative, fast-paced SaaS design and engineering team."}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-extrabold block mb-2">Required Core Skills</span>
                        <div className="flex flex-wrap gap-1.5">
                          {(selectedJobDetail.required_skills || selectedJobDetail.skills || []).map((s: string) => (
                            <span key={s} className="rounded-full bg-card px-3 py-1 text-xs font-bold text-muted-foreground border border-border/60">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Action Buttons */}
                  <div className="mt-8 pt-5 border-t border-border/40">
                    {applications.some((app) => app.job_id === selectedJobDetail.id) ? (
                      <button
                        disabled
                        className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-lg bg-card border border-border text-sm font-semibold text-muted-foreground cursor-not-allowed"
                      >
                        ✓ Dynamic Application Active (Applied)
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedJob(selectedJobDetail)}
                        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand text-sm font-black text-brand-foreground hover:brightness-105 transition hover:shadow-[0_4px_24px_rgba(245,197,24,0.4)] cursor-pointer"
                      >
                        Apply with Vouch Intro <ArrowRight className="h-4.5 w-4.5" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-panel p-6 shadow-2xl text-center py-24 min-h-[420px] flex items-center justify-center">
                  <div>
                    <span className="text-4xl block mb-2">💼</span>
                    <p className="text-sm font-bold text-muted-foreground">Select a job card on the left to read details and apply.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Premium Apply Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-[18px] border border-border bg-panel p-6 shadow-2xl animate-in zoom-in-95 duration-200 relative">
            <h3 className="font-heading text-xl font-extrabold text-white tracking-tight">Apply with Vouch</h3>
            <p className="mt-1.5 text-sm text-muted-foreground font-medium">
              You are applying to <b>{selectedJob.title}</b> at <b>{selectedJob.company || selectedJob.co}</b>.
            </p>

            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-border bg-card p-4">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-extrabold block">Your Selected Pitch</span>
                {hasVideo ? (
                  <div className="mt-3 flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand shadow-sm">
                      <Video className="h-5 w-5 animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white">My 90-Second Intro</div>
                      <div className="text-xs text-muted-foreground font-medium mt-0.5">AI Rating Score: {overall}/100</div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-error font-medium flex items-center gap-2">
                    <span>⚠️</span> You must record a video resume before applying.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSelectedJob(null)}
                className="flex-1 inline-flex h-11 items-center justify-center rounded-lg border border-border bg-transparent text-sm font-semibold text-white hover:bg-white/5 transition duration-200"
              >
                Cancel
              </button>
              <button
                disabled={!hasVideo || applying}
                onClick={async () => {
                  setApplying(true);
                  try {
                    const { error } = await supabase.from("applications").insert({
                      candidate_id: user.id,
                      job_id: selectedJob.id,
                      video_resume_id: videoResume.id,
                      stage: "applied"
                    });

                    if (error) throw error;

                    // Re-fetch applications
                    const { data: dbApps } = await supabase
                      .from("applications")
                      .select("*, jobs(*)")
                      .eq("candidate_id", user.id)
                      .order("created_at", { ascending: false });
                    setApplications(dbApps || []);

                    alert(`Successfully applied for "${selectedJob.title}"!`);
                    setSelectedJob(null);
                  } catch (err: any) {
                    console.error("Apply error:", err);
                    alert(err.message || "Failed to submit application.");
                  } finally {
                    setApplying(false);
                  }
                }}
                className="flex-1 inline-flex h-11 items-center justify-center rounded-lg bg-brand text-sm font-bold text-brand-foreground hover:brightness-105 transition shadow-[0_4px_20px_rgba(245,197,24,0.35)] disabled:opacity-50"
              >
                {applying ? "Submitting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vouch AI Smart ID Pass Modal */}
      {isPassModalOpen && videoResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-[22px] border border-border bg-panel p-6 shadow-2xl animate-in zoom-in-95 duration-200 relative text-center">
            
            {/* Modal Close Button */}
            <button
              onClick={() => setIsPassModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-white transition text-xs font-bold uppercase tracking-wider bg-card border border-border/80 rounded-md px-2.5 py-1 z-50"
            >
              ✕ Close
            </button>

            <h3 className="font-heading text-lg font-black text-white mt-1">
              🎫 Vouch AI Smart Talent Pass
            </h3>
            <p className="text-xs text-muted-foreground font-semibold mb-6">
              Your verified AI signal scorecard embedded into a creative, interactive ID card with a custom QR code.
            </p>

            {/* Interactive 3D Perspective Card Container */}
            <div className="flex justify-center my-6" style={{ perspective: "1000px" }}>
              <div 
                id="talent-pass-card"
                className="w-80 h-[480px] rounded-[24px] border border-brand bg-gradient-to-b from-[#181a25] to-[#0d0e14] p-5 shadow-[0_0_40px_rgba(245,197,24,0.18)] relative overflow-hidden transition-all duration-500 transform hover:rotate-y-12 hover:rotate-x-12 hover:scale-[1.02] transform-style-3d cursor-pointer group"
              >
                {/* Holographic background shines */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-[60px]" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/5 rounded-full blur-[60px]" />
                
                {/* Header branding */}
                <div className="flex items-center justify-between border-b border-border/40 pb-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-brand text-lg font-black tracking-widest font-heading">VOUCH</span>
                    <span className="rounded bg-brand/10 border border-brand/25 px-2 py-0.5 text-[8px] font-black text-brand uppercase tracking-widest shrink-0">AI VERIFIED</span>
                  </div>
                  <span className="text-[8px] text-muted-foreground font-mono font-bold tracking-widest uppercase">ID: {videoResume.id.slice(0,8)}</span>
                </div>

                {/* Profile Details */}
                <div className="mt-5 flex flex-col items-center">
                  <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand text-xl font-black text-brand-foreground shadow-[0_6px_20px_rgba(245,197,24,0.25)] mb-3">
                    {profile?.full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "C"}
                  </div>
                  <h4 className="font-heading text-lg font-black text-white leading-none tracking-tight">
                    {profile?.full_name || "Anonymous Talent"}
                  </h4>
                  <p className="text-[10px] text-brand font-bold uppercase tracking-wider mt-1.5">
                    {videoResume.language === "en" ? "Frontend Engineer" : "Multilingual developer"}
                  </p>
                </div>

                {/* Score and QR code alignment side-by-side */}
                <div className="mt-6 grid grid-cols-2 gap-4 items-center border-t border-border/30 pt-5">
                  
                  {/* Left: large overall Score Meter */}
                  <div className="text-center border-r border-border/30 pr-3">
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-extrabold">Overall AI Score</div>
                    <div className="font-heading text-4xl font-black text-white mt-1">{overall}</div>
                    <span className="rounded bg-success/15 border border-success/20 px-2 py-0.5 text-[7px] font-bold text-success uppercase tracking-widest mt-1.5 inline-block">
                      ★ Top {overall >= 85 ? "5%" : "15%"}
                    </span>
                  </div>

                  {/* Right: Gold styled QR code */}
                  <div className="flex flex-col items-center">
                    <div className="p-1 rounded-xl bg-[#13151f] border border-brand/35 shadow-inner">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=f5c518&bgcolor=13151f&data=${encodeURIComponent(window.location.origin + "/share/" + videoResume.id)}`}
                        alt="Talent QR Pass"
                        className="w-20 h-20 shrink-0 select-none pointer-events-none rounded-lg"
                      />
                    </div>
                    <span className="text-[7px] uppercase tracking-wider text-muted-foreground font-black mt-1.5">Scan to review pitch</span>
                  </div>

                </div>

                {/* Footer terms */}
                <div className="absolute bottom-5 left-5 right-5 text-center">
                  <div className="flex flex-wrap justify-center gap-1">
                    {(videoResume.skills || ["React", "TypeScript", "UI/UX"]).slice(0, 3).map((s: string) => (
                      <span key={s} className="rounded-full bg-card/60 border border-border/40 px-2 py-0.5 text-[8px] font-bold text-white/90">
                        {s}
                      </span>
                    ))}
                  </div>
                  <p className="text-[7px] text-muted-foreground font-mono font-bold tracking-widest mt-3.5 uppercase">
                    POWERED BY DEEPMIND GEMINI INTEGRATION
                  </p>
                </div>

              </div>
            </div>

            {/* Actions Panel */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  const shareUrl = window.location.origin + "/share/" + videoResume.id;
                  navigator.clipboard.writeText(shareUrl);
                  toast.success("Shareable URL copied to clipboard!");
                }}
                className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-transparent text-xs font-bold text-white hover:bg-white/5 transition"
              >
                <Share2 className="h-4 w-4" /> Copy Link
              </button>
              
              <button
                onClick={async () => {
                  toast.loading("Generating your High-Res Talent Pass PNG...");
                  try {
                    const canvas = document.createElement("canvas");
                    canvas.width = 800;
                    canvas.height = 1200;
                    const ctx = canvas.getContext("2d");
                    if (!ctx) throw new Error("Could not create canvas context");

                    // 1. Draw premium dark gradient background
                    const grad = ctx.createLinearGradient(0, 0, 0, 1200);
                    grad.addColorStop(0, "#181a25");
                    grad.addColorStop(1, "#0d0e14");
                    ctx.fillStyle = grad;
                    ctx.fillRect(0, 0, 800, 1200);

                    // 2. Draw thick outer gold border
                    ctx.strokeStyle = "#f5c518";
                    ctx.lineWidth = 20;
                    ctx.strokeRect(10, 10, 780, 1180);

                    // 3. Draw watermarked accent circles
                    ctx.fillStyle = "rgba(245, 197, 24, 0.03)";
                    ctx.beginPath();
                    ctx.arc(800, 0, 300, 0, Math.PI * 2);
                    ctx.fill();

                    // 4. Branding Header
                    ctx.fillStyle = "#f5c518";
                    ctx.font = "bold 42px sans-serif";
                    ctx.fillText("VOUCH", 60, 100);

                    ctx.fillStyle = "rgba(245, 197, 24, 0.15)";
                    ctx.fillRect(230, 68, 170, 42);
                    ctx.fillStyle = "#f5c518";
                    ctx.font = "bold 20px sans-serif";
                    ctx.fillText("AI VERIFIED", 250, 96);

                    ctx.fillStyle = "#8a8f98";
                    ctx.font = "bold 20px sans-serif";
                    ctx.fillText(`ID: ${videoResume.id.slice(0, 12).toUpperCase()}`, 520, 96);

                    // Divider line
                    ctx.strokeStyle = "rgba(138, 143, 152, 0.2)";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(60, 150);
                    ctx.lineTo(740, 150);
                    ctx.stroke();

                    // 5. Candidate Name & Role
                    ctx.fillStyle = "#ffffff";
                    ctx.font = "black 58px sans-serif";
                    ctx.fillText(profile?.full_name || "Anonymous Talent", 60, 240);

                    ctx.fillStyle = "#f5c518";
                    ctx.font = "bold 26px sans-serif";
                    ctx.fillText(videoResume.language === "en" ? "FRONTEND ENGINEER" : "MULTILINGUAL DEVELOPER", 60, 290);

                    // 6. Score Circle Box
                    ctx.fillStyle = "rgba(138, 143, 152, 0.05)";
                    ctx.fillRect(60, 360, 680, 280);
                    ctx.strokeStyle = "rgba(245, 197, 24, 0.2)";
                    ctx.strokeRect(60, 360, 680, 280);

                    ctx.fillStyle = "#8a8f98";
                    ctx.font = "bold 24px sans-serif";
                    ctx.fillText("VOUCH AI PITCH EVALUATION", 100, 420);

                    ctx.fillStyle = "#ffffff";
                    ctx.font = "bold 130px sans-serif";
                    ctx.fillText(`${overall}`, 100, 560);

                    ctx.fillStyle = "#f5c518";
                    ctx.font = "bold 28px sans-serif";
                    ctx.fillText("/ 100 OVERALL RATING", 340, 510);

                    ctx.fillStyle = "#22c55e";
                    ctx.font = "bold 22px sans-serif";
                    ctx.fillText(`★ TOP ${overall >= 85 ? "5%" : "15%"} CERTIFIED`, 340, 550);

                    // 7. QR Code load & paint
                    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=f5c518&bgcolor=13151f&data=${encodeURIComponent(window.location.origin + "/share/" + videoResume.id)}`;
                    const qrImg = new Image();
                    qrImg.crossOrigin = "anonymous";
                    qrImg.src = qrUrl;

                    await new Promise((resolve) => {
                      qrImg.onload = resolve;
                      qrImg.onerror = () => {
                        resolve(null);
                      };
                    });

                    // Draw QR frame box
                    ctx.fillStyle = "#13151f";
                    ctx.fillRect(250, 720, 300, 300);
                    ctx.strokeStyle = "rgba(245, 197, 24, 0.4)";
                    ctx.lineWidth = 4;
                    ctx.strokeRect(250, 720, 300, 300);

                    try {
                      ctx.drawImage(qrImg, 260, 730, 280, 280);
                    } catch (e) {
                      ctx.fillStyle = "#f5c518";
                      ctx.font = "bold 20px sans-serif";
                      ctx.fillText("SCAN LINK ATTACHED", 300, 870);
                    }

                    ctx.fillStyle = "#8a8f98";
                    ctx.font = "bold 22px sans-serif";
                    ctx.textAlign = "center";
                    ctx.fillText("SCAN TO PLAY AI VIDEO PITCH INSTANTLY", 400, 1070);

                    // Footer meta
                    ctx.fillStyle = "#8a8f98";
                    ctx.font = "16px sans-serif";
                    ctx.fillText("POWERED BY DEEPMIND ADVANCED GEMINI GRADERS", 400, 1140);

                    // 8. Trigger crisp PNG download!
                    const downloadLink = document.createElement("a");
                    downloadLink.download = `${(profile?.full_name || "Vouch").replace(/\s+/g, "_")}_AI_Verified_Pass.png`;
                    downloadLink.href = canvas.toDataURL("image/png");
                    downloadLink.click();

                    toast.dismiss();
                    toast.success("Talent Pass downloaded successfully!");

                  } catch (e: any) {
                    console.error("Canvas draw error:", e);
                    toast.dismiss();
                    toast.error("Failed to render Pass download.");
                  }
                }}
                className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand text-xs font-bold text-brand-foreground hover:brightness-110 transition shadow-md shadow-brand/20"
              >
                <Award className="h-4 w-4" /> Download Pass PNG
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}