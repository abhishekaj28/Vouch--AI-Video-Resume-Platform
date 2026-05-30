"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Users, Star, ClipboardList, CheckCircle2, Search, Mail, Calendar, X, Brain, ChevronDown, CheckCircle, BarChart3 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import * as RechartsPrimitive from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { toast } from "sonner";

type Status = "Applied" | "Reviewed" | "Interview" | "Hired" | "Rejected";

export default function RecruiterDashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [scoreThreshold, setScoreThreshold] = useState(0);
  const router = useRouter();

  // Dynamic candidate status tracking
  const [candidateStatuses, setCandidateStatuses] = useState<Record<string, Status>>({});

  // Interview scheduling modal states
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleTime, setScheduleTime] = useState("2026-06-05T14:00");
  const [meetingLink, setMeetingLink] = useState("https://meet.google.com/abc-defg-hij");
  const [notes, setNotes] = useState("Vouch AI Technical Interview Session");

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
      if (profile.role !== "recruiter") {
        router.push("/auth");
        return;
      }
      setProfile(profile);

      // Fetch via secure server endpoint to bypass client RLS issues
      let loadedCandidates: any[] = [];
      try {
        const res = await fetch("/api/recruiter/candidates");
        const dbCandidates = res.ok ? await res.json() : null;
        if (dbCandidates && dbCandidates.length > 0) {
          loadedCandidates = dbCandidates;
        }
      } catch (err) {
        console.warn("Secure candidates fetch failed, fallback to mock data:", err);
      }

      // Fallback to premium mock candidate list if no data in DB
      if (loadedCandidates.length === 0) {
        loadedCandidates = [
          {
            id: "mock-vr-1",
            candidate_id: "mock-c-1",
            profiles: { full_name: "Priya Sharma", email: "priya@example.com" },
            communication_score: 94,
            confidence_score: 90,
            clarity_score: 95,
            technical_score: 89,
            overall_score: 92,
            status: "completed",
            pipelineStatus: "Interview" as Status,
            jobTitle: "Frontend Engineer",
            video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
            ai_summary: "Priya demonstrates exceptional communication and a clear, structured thought process. She explains complex system design topics with outstanding confidence on camera.",
            skills: ["React", "TypeScript", "System Design"],
            transcript: "Hi, I'm Priya. I have about 5 years of experience building scalable products using React and TypeScript. I'm highly passionate about UI performance..."
          },
          {
            id: "mock-vr-2",
            candidate_id: "mock-c-2",
            profiles: { full_name: "Arjun Kapoor", email: "arjun@example.com" },
            communication_score: 88,
            confidence_score: 85,
            clarity_score: 89,
            technical_score: 87,
            overall_score: 87,
            status: "completed",
            pipelineStatus: "Reviewed" as Status,
            jobTitle: "ML Engineer",
            video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
            ai_summary: "Arjun shows strong technical signal and conceptual clarity in neural networks. Articulates MLOps workflows extremely well.",
            skills: ["Python", "PyTorch", "MLOps"],
            transcript: "Hi, I'm Arjun. I specialize in building, training, and deploying large-scale deep learning models in production clouds..."
          },
          {
            id: "mock-vr-3",
            candidate_id: "mock-c-3",
            profiles: { full_name: "Meera Reddy", email: "meera@example.com" },
            communication_score: 80,
            confidence_score: 78,
            clarity_score: 82,
            technical_score: 75,
            overall_score: 79,
            status: "completed",
            pipelineStatus: "Applied" as Status,
            jobTitle: "Product Designer",
            video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
            ai_summary: "Meera is highly articulate regarding component architecture and visual storytelling. Demonstrates great team-collaboration fit.",
            skills: ["Figma", "Design Systems", "Prototyping"],
            transcript: "Hi, I'm Meera. I'm a product designer who loves bridging the gap between high-fidelity visual assets and clean frontend component layouts..."
          }
        ];
      }

      setCandidates(loadedCandidates);

      // Populate local status tracking
      const statuses: Record<string, Status> = {};
      loadedCandidates.forEach((c: any) => {
        statuses[c.id] = c.pipelineStatus || "Applied";
      });
      setCandidateStatuses(statuses);

      if (loadedCandidates.length > 0) {
        setSelectedId(loadedCandidates[0].id);
      }
      setLoading(false);
    };
    getData();
  }, [router]);

  const getInitials = (name?: string) => {
    if (!name) return "HM";
    return name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
  };

  const getScoreColorClass = (score: number) => {
    return score >= 80 ? "text-success" : score >= 60 ? "text-brand" : "text-error";
  };

  const getStatusColorClass = (s: Status) => {
    return s === "Hired"
      ? "bg-success/15 text-success border border-success/20"
      : s === "Interview"
      ? "bg-brand/15 text-brand border border-brand/20"
      : s === "Rejected"
      ? "bg-error/15 text-error border border-error/20"
      : s === "Reviewed"
      ? "bg-blue-500/15 text-blue-400 border border-blue-500/10"
      : "bg-muted text-muted-foreground border border-border/40";
  };

  const rankBgClass = (i: number) => {
    return i === 0
      ? "bg-yellow-400 text-black shadow-sm"
      : i === 1
      ? "bg-gray-300 text-black shadow-sm"
      : i === 2
      ? "bg-amber-700 text-white shadow-sm"
      : "bg-card text-muted-foreground border border-border";
  };

  const updateCandidateStatus = async (cId: string, newStatus: Status) => {
    // 1. Update local state
    setCandidateStatuses((prev) => ({
      ...prev,
      [cId]: newStatus,
    }));

    try {
      const targetCandidate = candidates.find((c) => c.id === cId);
      if (!targetCandidate) return;

      const stageValue = newStatus.toLowerCase() as 'applied' | 'reviewed' | 'interview' | 'hired' | 'rejected';

      const { data: existingApp } = await supabase
        .from("applications")
        .select("id")
        .eq("candidate_id", targetCandidate.candidate_id)
        .eq("video_resume_id", cId)
        .maybeSingle();

      let appId = existingApp?.id;

      if (existingApp) {
        await supabase
          .from("applications")
          .update({ stage: stageValue })
          .eq("id", existingApp.id);
      } else {
        const { data: jobs } = await supabase.from("jobs").select("id").limit(1);
        const jobId = jobs && jobs.length > 0 ? jobs[0].id : null;

        if (jobId) {
          const { data: insertedApp } = await supabase
            .from("applications")
            .insert({
              candidate_id: targetCandidate.candidate_id,
              video_resume_id: cId,
              job_id: jobId,
              stage: stageValue
            })
            .select("id")
            .single();
          
          appId = insertedApp?.id;
        } else {
          console.warn("No jobs found in database to link application. Updating local state only.");
        }
      }

      if (newStatus === "Rejected" && appId) {
        toast.promise(
          fetch("/api/recruiter/reject-feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ applicationId: appId }),
          }).then(async (res) => {
            if (!res.ok) throw new Error("Failed to generate feedback");
            const data = await res.json();
            
            // Update candidates state with the generated rejection feedback
            setCandidates((prevCandidates) =>
              prevCandidates.map((c) =>
                c.id === cId ? { ...c, rejection_feedback: data.feedback } : c
              )
            );
            return data;
          }),
          {
            loading: "Generating constructive AI rejection feedback...",
            success: "AI constructive rejection feedback generated successfully!",
            error: "Failed to generate AI rejection feedback.",
          }
        );
      } else {
        toast.success(`Candidate moved to ${newStatus}`);
      }
    } catch (err) {
      console.warn("Failed to persist application stage to database, fallback to local state:", err);
      toast.error("Failed to update candidate status");
    }
  };

  // Filter & Search Candidates based on tabs, search and score threshold
  const filteredCandidates = candidates
    .map((c) => ({
      ...c,
      pipelineStatus: candidateStatuses[c.id] || "Applied",
    }))
    .filter((c) => {
      const matchesTab =
        tab === "All" ||
        (tab === "Top Scored" ? c.overall_score >= 85 : c.pipelineStatus === tab);
      const matchesSearch =
        (c.profiles?.full_name || "Anonymous").toLowerCase().includes(search.toLowerCase()) ||
        (c.skills || []).some((s: string) => s.toLowerCase().includes(search.toLowerCase()));
      const matchesThreshold = c.overall_score >= scoreThreshold;
      return matchesTab && matchesSearch && matchesThreshold;
    });

  const sel = candidates.find((c) => c.id === selectedId) || null;
  const selStatus = sel ? candidateStatuses[sel.id] || "Applied" : "Applied";

  const totalCandidatesCount = candidates.length;
  const avgAIScore =
    totalCandidatesCount > 0
      ? Math.round(candidates.reduce((acc, c) => acc + (c.overall_score || 0), 0) / totalCandidatesCount)
      : 0;

  const PIPELINE = ["Applied", "Reviewed", "Interview", "Hired"] as const;
  const TABS = ["All", "Top Scored", "Interview", "Hired", "Rejected"];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          <span className="font-heading font-medium tracking-tight">Loading recruiter portal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white pb-16">
      <Navbar variant="recruiter" initials={getInitials(profile?.full_name)} />

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Recruiter Welcome Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-extrabold tracking-tight">Recruiter Command Center 🎯</h1>
            <p className="mt-1.5 text-sm text-muted-foreground font-medium">AI-ranked video applicants, sorted by communication signal in real time.</p>
          </div>
        </div>

        {/* Recruiter Stats */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Users, label: "Total Candidates", value: totalCandidatesCount.toString() },
            { icon: Star, label: "Avg AI Score", value: `${avgAIScore}/100` },
            { icon: ClipboardList, label: "Live Job Openings", value: "12" },
            { icon: CheckCircle2, label: "Hired Placements", value: "3" },
          ].map((s) => (
            <div key={s.label} className="rounded-[16px] border border-border bg-card p-5 hover:border-brand/35 hover:shadow-[0_0_30px_-5px_rgba(245,197,24,0.12)] transition-all duration-300 shadow-lg">
              <div className="flex items-center gap-2.5">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand shadow-sm">
                  <s.icon className="h-5 w-5" />
                </div>
                <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{s.label}</span>
              </div>
              <div className="mt-3.5 font-heading text-3xl font-black text-white">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Analytics Toggle Display */}
        {filteredCandidates.length > 0 && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card/60 backdrop-blur-md px-4 text-xs font-bold text-white hover:bg-card hover:border-brand/40 transition duration-200"
            >
              <BarChart3 className="h-4 w-4 text-brand" /> {showAnalytics ? "Hide Analytics Panel" : "View Score Distribution"}
            </button>
          </div>
        )}

        {/* Premium Analytics Panel */}
        {showAnalytics && filteredCandidates.length > 0 && (
          <div className="mt-6 rounded-[18px] border border-border bg-panel p-6 shadow-2xl relative overflow-hidden animate-in slide-in-from-top duration-300 hover:border-brand/30 hover:shadow-[0_0_40px_-10px_rgba(245,197,24,0.15)] transition-all">
            <div className="absolute top-0 right-0 w-80 h-80 bg-brand/3 rounded-full blur-[100px] pointer-events-none" />
            <h3 className="font-heading text-lg font-bold text-white tracking-tight">AI Shortlist Score Distribution</h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5 mb-4">Real-time candidate indexing across current criteria filters.</p>
            
            <div className="h-64 w-full">
              <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
                <RechartsPrimitive.BarChart
                  data={filteredCandidates.map(c => ({
                    name: c.profiles?.full_name?.split(" ")[0] || "Anon",
                    score: c.overall_score,
                    comm: c.communication_score,
                    conf: c.confidence_score,
                  }))}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="barGold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F5C518" stopOpacity={1} />
                      <stop offset="100%" stopColor="#F5C518" stopOpacity={0.45} />
                    </linearGradient>
                    <filter id="barGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#F5C518" floodOpacity="0.5" />
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
                    dy={8}
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
                        const d = payload[0].payload;
                        return (
                          <div className="rounded-xl border border-border bg-panel/90 backdrop-blur-md p-3.5 shadow-2xl">
                            <p className="text-xs font-black uppercase tracking-wider text-brand mb-2">{d.name}</p>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between gap-6">
                                <span className="text-white/60">Overall Score</span>
                                <span className="text-brand font-black">{d.score}/100</span>
                              </div>
                              <div className="flex justify-between gap-6">
                                <span className="text-white/60">Communication</span>
                                <span className="text-white font-bold">{d.comm}/100</span>
                              </div>
                              <div className="flex justify-between gap-6">
                                <span className="text-white/60">Confidence</span>
                                <span className="text-white font-bold">{d.conf}/100</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <RechartsPrimitive.Bar
                    dataKey="score"
                    fill="url(#barGold)"
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                    filter="url(#barGlow)"
                  />
                </RechartsPrimitive.BarChart>
              </RechartsPrimitive.ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Workspace Panels */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,38%)_minmax(0,1fr)]">
          {/* Left Column: Ranked Candidates List */}
          <div className="rounded-[18px] border border-border bg-panel flex flex-col h-[750px] shadow-2xl overflow-hidden">
            <div className="border-b border-border/80 p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-bold">AI-Ranked Candidates</h2>
                <span className="rounded-full bg-brand/15 px-3 py-1 text-xs font-bold text-brand border border-brand/20">
                  {filteredCandidates.length}
                </span>
              </div>
              <div className="relative mt-4">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or skills..."
                  className="h-11 w-full rounded-lg border border-border bg-card pl-10 pr-3 text-sm text-white placeholder:text-muted-foreground outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(245,197,24,0.18)]"
                />
              </div>

              {/* Dynamic Score Threshold Slider */}
              <div className="mt-4 border-t border-border/40 pt-4">
                <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                  <span className="text-muted-foreground uppercase tracking-wider">AI Rating Filter</span>
                  <span className="text-brand font-mono font-black">{scoreThreshold}+</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="95"
                  value={scoreThreshold}
                  onChange={(e) => setScoreThreshold(Number(e.target.value))}
                  className="w-full h-1 bg-card rounded-lg appearance-none cursor-pointer accent-brand"
                />
              </div>

              <div className="mt-4 flex gap-4 overflow-x-auto text-xs pb-1 scrollbar-none border-t border-border/40 pt-3">
                {TABS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`whitespace-nowrap pb-2 transition-colors font-bold uppercase tracking-wider ${
                      tab === t
                        ? "border-b-2 border-brand text-white font-extrabold"
                        : "border-b-2 border-transparent text-muted-foreground hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredCandidates.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  <div className="text-4xl mb-3">👥</div>
                  <p className="text-sm font-semibold">No candidate evaluations match criteria.</p>
                </div>
              ) : (
                filteredCandidates.map((c, i) => {
                  const isSel = c.id === selectedId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedId(c.id)}
                      className={`w-full rounded-[16px] border bg-card p-4 text-left transition-all hover:border-brand/45 ${
                        isSel ? "border-brand bg-card/85 shadow-[inset_3px_0_0_0_#F5C518]" : "border-border/60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`grid h-7 w-7 place-items-center rounded-full text-[10px] font-black shrink-0 ${rankBgClass(i)}`}>
                          #{i + 1}
                        </div>
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-brand text-xs font-black text-brand-foreground shadow-sm shrink-0">
                          {getInitials(c.profiles?.full_name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-heading text-sm font-bold text-white">
                            {c.profiles?.full_name || "Anonymous"}
                          </div>
                          <div className="truncate text-xs text-muted-foreground font-semibold mt-0.5">
                            {c.skills && c.skills.length > 0 ? c.skills.join(" · ") : "React · CSS · TS"}
                          </div>
                        </div>
                        <div className={`font-heading text-xl font-black shrink-0 ${getScoreColorClass(c.overall_score)}`}>
                          {c.overall_score}
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-2 text-[10px] text-muted-foreground font-bold">
                        <div className="flex gap-2">
                          <span>Comm <b className="text-white">{c.communication_score}</b></span>
                          <span>Conf <b className="text-white">{c.confidence_score}</b></span>
                          <span>Clar <b className="text-white">{c.clarity_score}</b></span>
                          <span>Tech <b className="text-white">{c.technical_score}</b></span>
                        </div>
                        <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getStatusColorClass(c.pipelineStatus)}`}>
                          {c.pipelineStatus}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Detailed Candidate View */}
          <div className="rounded-[18px] border border-border bg-panel p-6 overflow-y-auto h-[750px] shadow-2xl relative">
            {!sel ? (
              <div className="grid h-full place-items-center text-center">
                <div>
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand/10 text-brand">
                    <Users className="h-7 w-7" />
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground font-medium">Select an applicant to review their visual signal scorecards.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-3 pb-6 border-b border-border/40">
                  <div>
                    <h2 className="font-heading text-2xl font-black text-white tracking-tight">
                      {sel.profiles?.full_name || "Anonymous"}
                    </h2>
                    <div className="mt-1 text-sm text-muted-foreground font-semibold">{sel.profiles?.email}</div>
                  </div>
                  <a
                    href={`mailto:${sel.profiles?.email || ""}`}
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-transparent px-4 text-sm font-bold text-white hover:border-brand/60 hover:bg-white/5 transition duration-200"
                  >
                    <Mail className="h-4.5 w-4.5 text-brand" /> Send Email
                  </a>
                </div>

                {/* Pipeline visualizer */}
                <div className="rounded-[16px] border border-border bg-card p-4">
                  <div className="flex items-center justify-between gap-2 overflow-x-auto">
                    {PIPELINE.map((stage, i) => {
                      const currIdx = PIPELINE.indexOf(selStatus as typeof PIPELINE[number]);
                      const isDone = i < currIdx;
                      const isCurrent = i === currIdx;
                      return (
                        <div key={stage} className="flex flex-1 items-center gap-2 min-w-[90px]">
                          <div
                            className={`grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold ${
                              isCurrent
                                ? "bg-brand text-brand-foreground shadow-[0_0_8px_rgba(245,197,24,0.45)]"
                                : isDone
                                ? "bg-success text-white"
                                : "bg-panel text-muted-foreground border border-border"
                            }`}
                          >
                            {isDone ? "✓" : i + 1}
                          </div>
                          <span
                            className={`text-xs font-bold uppercase tracking-wider ${
                              isCurrent ? "text-brand" : isDone ? "text-success" : "text-muted-foreground"
                            }`}
                          >
                            {stage}
                          </span>
                          {i < PIPELINE.length - 1 && (
                            <div className={`h-[2px] flex-1 ${isDone ? "bg-success/40" : "bg-border"}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Status action tools */}
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => setIsScheduleModalOpen(true)}
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-success px-4 text-sm font-bold text-white hover:brightness-110 transition shadow-md"
                  >
                    <CheckCircle className="h-4.5 w-4.5" /> Move to Interview
                  </button>
                  <button
                    onClick={() => updateCandidateStatus(sel.id, "Hired")}
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-transparent px-4 text-sm font-bold text-brand hover:border-brand/60 transition"
                  >
                    <Calendar className="h-4.5 w-4.5" /> Move to Hired
                  </button>
                  <button
                    onClick={() => updateCandidateStatus(sel.id, "Rejected")}
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-transparent px-4 text-sm font-bold text-error hover:border-error/60 transition"
                  >
                    <X className="h-4.5 w-4.5" /> Reject Candidate
                  </button>
                </div>

                {/* Video Playback */}
                {sel.video_url && (
                  <div className="aspect-video w-full rounded-[14px] border border-border bg-black overflow-hidden relative shadow-lg">
                    <video src={sel.video_url} controls className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Score bars progression list */}
                <div className="space-y-4">
                  {[
                    { l: "Communication Signal", v: sel.communication_score, c: "#F5C518" },
                    { l: "On-Camera Confidence", v: sel.confidence_score, c: "#3B82F6" },
                    { l: "Presentation Clarity", v: sel.clarity_score, c: "#22C55E" },
                    { l: "Technical Vocabulary Signal", v: sel.technical_score, c: "#A855F7" },
                  ].map((b) => (
                    <div key={b.l}>
                      <div className="mb-1 flex items-center justify-between text-xs font-bold">
                        <span className="text-muted-foreground">{b.l}</span>
                        <span className="font-heading font-black text-white">{b.v}/100</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-card">
                        <div
                          className="h-full rounded-full transition-[width] duration-1000 ease-out"
                          style={{ width: `${b.v}%`, backgroundColor: b.c }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Big overall rank */}
                <div className="text-center py-4 bg-card/40 rounded-xl border border-border/60">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-extrabold">Overall AI Rating</div>
                  <div className={`font-heading text-6xl font-black mt-2 leading-none ${getScoreColorClass(sel.overall_score)}`}>
                    {sel.overall_score}
                  </div>
                </div>

                {/* AI assessment text */}
                <div className="rounded-[16px] border border-border bg-card p-5">
                  <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
                    <Brain className="h-4.5 w-4.5 text-brand animate-pulse" /> AI Analysis Pitch Feedback
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground font-medium">
                    {sel.ai_summary || "Evaluation summary generated from speech patterns and content pitch structure is active."}
                  </p>
                </div>

                {/* AI Rejection feedback display */}
                {selStatus === "Rejected" && (
                  <div className="rounded-[16px] border border-error/30 bg-error/5 p-5 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 text-sm font-bold text-error mb-2">
                      <Brain className="h-4.5 w-4.5 text-error" /> AI Rejection Constructive Feedback
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground font-medium whitespace-pre-line">
                      {sel.rejection_feedback || "Generating constructive AI feedback to help the candidate improve in their next applications..."}
                    </p>
                  </div>
                )}

                {/* Detected Skill pills */}
                <div>
                  <div className="mb-2.5 text-xs uppercase tracking-wider text-muted-foreground font-bold">Detected Core Skills</div>
                  <div className="flex flex-wrap gap-2">
                    {(sel.skills || []).concat(["Communication", "Clarity"]).map((s: string) => (
                      <span
                        key={s}
                        className="rounded-full border border-brand/35 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Speech Transcript Accordion */}
                <div className="rounded-[16px] border border-border bg-card overflow-hidden">
                  <button
                    onClick={() => setTranscriptOpen(!transcriptOpen)}
                    className="flex w-full items-center justify-between px-5 py-4 text-sm font-bold transition hover:bg-white/5"
                  >
                    <span className="flex items-center gap-2 font-heading">📝 View Full Pitch Transcript</span>
                    <ChevronDown className={`h-4.5 w-4.5 text-brand transition-transform ${transcriptOpen ? "rotate-180" : ""}`} />
                  </button>
                  {transcriptOpen && (
                    <div className="border-t border-border p-5 font-mono text-xs leading-relaxed text-muted-foreground bg-panel/30 max-h-60 overflow-y-auto">
                      {sel.transcript || "No audio transcription details recorded. Fallback speech signal index represents 100% voice score."}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Interactivity: Interview Scheduling Modal */}
      {isScheduleModalOpen && sel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-panel p-6 shadow-2xl animate-in zoom-in duration-200 relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/3 rounded-full blur-3xl pointer-events-none" />
            
            <h3 className="font-heading text-lg font-black text-white flex items-center gap-2 mb-1">
              📅 Schedule Technical Session
            </h3>
            <p className="text-xs text-muted-foreground font-semibold mb-5">
              Book a structured calendar invite for {sel.profiles?.full_name || "Candidate"}
            </p>

            <div className="space-y-4 text-xs font-bold text-white">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Interview Date & Time</label>
                <input
                  type="datetime-local"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full h-11 rounded-lg border border-border bg-card px-3 text-xs text-white outline-none focus:border-brand transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Meeting Link</label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/abc-defg-hij"
                  className="w-full h-11 rounded-lg border border-border bg-card px-3 text-xs text-white placeholder:text-muted-foreground outline-none focus:border-brand transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Recruiter Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Provide meeting agenda or skill focus..."
                  className="w-full h-24 rounded-lg border border-border bg-card p-3 text-xs text-white placeholder:text-muted-foreground outline-none focus:border-brand transition resize-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3.5">
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="h-10 rounded-lg border border-border bg-transparent px-4 text-xs font-bold text-white hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!scheduleTime) {
                    toast.error("Please specify a valid schedule date and time.");
                    return;
                  }
                  
                  setIsScheduleModalOpen(false);
                  
                  toast.promise(
                    fetch("/api/recruiter/schedule-interview", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        applicationId: sel.applicationId || sel.id,
                        candidateId: sel.candidate_id,
                        recruiterId: profile?.id,
                        scheduledAt: new Date(scheduleTime).toISOString(),
                        meetingLink,
                        notes
                      }),
                    }).then(async (res) => {
                      if (!res.ok) throw new Error("Scheduling failed");
                      
                      // Update status locally in state
                      setCandidateStatuses((prev) => ({
                        ...prev,
                        [sel.id]: "Interview",
                      }));
                      
                      return res.json();
                    }),
                    {
                      loading: "Booking technical assessment session...",
                      success: "Technical interview session successfully booked!",
                      error: "Failed to schedule interview.",
                    }
                  );
                }}
                className="h-10 rounded-lg bg-brand px-5 text-xs font-bold text-brand-foreground hover:brightness-110 transition shadow-md shadow-brand/20"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}