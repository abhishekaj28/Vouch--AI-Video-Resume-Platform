"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Brain, Award, Clock, ArrowRight, CheckCircle2, ChevronRight, Zap, Target } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { toast } from "sonner";

interface Question {
  q: string;
  options: string[];
  correct: number;
}

const DOMAINS: Record<string, { title: string; questions: Question[] }> = {
  frontend: {
    title: "Frontend Engineering",
    questions: [
      {
        q: "What is the primary purpose of React key props in lists?",
        options: [
          "To apply custom styling to specific list elements",
          "To help React identify which items have changed, been added, or been removed",
          "To automatically bind click event listeners to list children",
          "To secure individual database rows from client manipulation"
        ],
        correct: 1
      },
      {
        q: "Which hook should you use to cache the result of an expensive calculation between re-renders in React?",
        options: ["useEffect", "useCallback", "useState", "useMemo"],
        correct: 3
      },
      {
        q: "What is TypeScript?",
        options: [
          "A completely new browser engine built in Rust",
          "A server-side execution framework for Node.js",
          "A typed superset of JavaScript that compiles to plain JavaScript",
          "A standard database query language for web systems"
        ],
        correct: 2
      },
      {
        q: "Which CSS property is used to align items along the primary axis in a Flexbox container?",
        options: ["align-items", "justify-content", "align-content", "grid-template-areas"],
        correct: 1
      },
      {
        q: "What does Next.js dynamic import function optimize?",
        options: [
          "SSR cache validation timing",
          "Client-side bundle size via lazy loading component chunks",
          "Database connection pool scaling speeds",
          "Groq Whisper transcription transcription accuracy"
        ],
        correct: 1
      }
    ]
  },
  backend: {
    title: "Backend Engineering",
    questions: [
      {
        q: "What does ACID stand for in the context of database transaction management?",
        options: [
          "Atomicity, Consistency, Isolation, Durability",
          "Access, Control, Index, Data",
          "Allocation, Concurrency, Integrity, Distribution",
          "Asynchronous, Cluster, Integration, Deployment"
        ],
        correct: 0
      },
      {
        q: "Which HTTP status code represents an Internal Server Error?",
        options: ["400 Bad Request", "403 Forbidden", "404 Not Found", "500 Internal Server Error"],
        correct: 3
      },
      {
        q: "What is the primary benefit of creating database indexes?",
        options: [
          "Bypassing Row-Level Security checks completely",
          "Encrypting user columns automatically on write",
          "Significantly speeding up SELECT query data retrieval speeds",
          "Preventing SQL injection attacks instantly"
        ],
        correct: 2
      },
      {
        q: "In Node.js event-driven runtime, what executes asynchronous system callbacks?",
        options: ["The Thread Engine", "The Event Loop", "The Express Router", "The Groq API Client"],
        correct: 1
      },
      {
        q: "What is the primary usage of JSON Web Tokens (JWT)?",
        options: [
          "Storing large raw audio file buffers",
          "Bypassing Supabase authentication layers",
          "Securely transmitting verified claim details between clients and servers",
          "Defining dynamic layout schemas for Next.js"
        ],
        correct: 2
      }
    ]
  },
  design: {
    title: "Product & UI/UX Design",
    questions: [
      {
        q: "What is the primary purpose of a UI Design System?",
        options: [
          "Enforcing strict database schemas across backends",
          "Ensuring complete visual, functional, and brand consistency across digital products",
          "Measuring dynamic speaker filler word pace levels",
          "Creating automatic unit tests for responsive styling"
        ],
        correct: 1
      },
      {
        q: "Which color harmony utilizes colors directly opposite each other on the color wheel?",
        options: ["Analogous", "Triadic", "Complementary", "Monochromatic"],
        correct: 2
      },
      {
        q: "What does SVG stand for in vector layout typography?",
        options: [
          "Scalable Vector Graphics",
          "System Visual Grid",
          "Static Vocabulary Graph",
          "Standard Vector Gradient"
        ],
        correct: 0
      },
      {
        q: "In professional typography systems, what is kerning?",
        options: [
          "The vertical space between adjacent lines of text",
          "The scale size ratio between headings and paragraph font styles",
          "The spacing adjustment between individual character pairs",
          "The fallback font selection order"
        ],
        correct: 2
      },
      {
        q: "What is the primary objective of a low-fidelity user flow wireframe?",
        options: [
          "Creating pixel-perfect layout renderings with harmonious styling",
          "Mapping functional structure, layout hierarchies, and screen navigations rapidly",
          "Verifying TypeScript compile correctness",
          "Optimizing page load speed scores"
        ],
        correct: 1
      }
    ]
  }
};

export default function AssessmentPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Quiz States
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [quizState, setQuizState] = useState<"select" | "active" | "result">("select");
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [savingScore, setSavingScore] = useState(false);
  const [finalScoreStats, setFinalScoreStats] = useState<any>(null);

  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
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
      setProfile(profile);
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  // Quiz timer ticking hook
  useEffect(() => {
    if (quizState !== "active") return;
    if (timeLeft <= 0) {
      handleQuizCompletion();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, quizState]);

  const startQuiz = (domain: string) => {
    setActiveDomain(domain);
    setCurrentQuestionIdx(0);
    setSelectedOptionIdx(null);
    setAnswers([]);
    setTimeLeft(60);
    setQuizState("active");
  };

  const handleNextQuestion = () => {
    if (selectedOptionIdx === null) {
      toast.error("Please select an option to proceed.");
      return;
    }

    const updatedAnswers = [...answers, selectedOptionIdx];
    setAnswers(updatedAnswers);
    setSelectedOptionIdx(null);

    const questions = DOMAINS[activeDomain!].questions;
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      handleQuizCompletion(updatedAnswers);
    }
  };

  const handleQuizCompletion = async (finalAnswers = answers) => {
    setQuizState("result");
    const domainData = DOMAINS[activeDomain!];
    const questions = domainData.questions;

    // Fill missing answers with -1 if time ran out
    const completedAnswers = [...finalAnswers];
    while (completedAnswers.length < questions.length) {
      completedAnswers.push(-1);
    }

    let correctCount = 0;
    completedAnswers.forEach((ans, idx) => {
      if (ans === questions[idx].correct) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / questions.length) * 100);
    const stats = {
      score: calculatedScore,
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      domain: domainData.title
    };
    setFinalScoreStats(stats);

    // Save score to Supabase using candidate_id auth policy bypass
    setSavingScore(true);
    try {
      const { error } = await supabase
        .from("assessments")
        .insert({
          candidate_id: user.id,
          domain: domainData.title,
          score: calculatedScore,
          total_questions: questions.length,
          correct_answers: correctCount
        });

      if (error) throw error;
      toast.success("Skill assessment results saved successfully!");
    } catch (err) {
      console.warn("Failed to persist score to Supabase, local preview displayed:", err);
    } finally {
      setSavingScore(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          <span className="font-heading font-medium tracking-tight">Initializing Skill Assessment Suite...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white pb-20 relative overflow-hidden">
      <Navbar variant="candidate" />

      {/* Decorative Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <main className="mx-auto max-w-3xl px-6 mt-12 relative z-10">
        
        {quizState === "select" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-300">
            <div className="text-center md:text-left">
              <span className="rounded-full bg-brand/10 border border-brand/20 px-3 py-1 text-xs font-bold text-brand uppercase tracking-wider">
                Domain Skill Badges
              </span>
              <h1 className="font-heading text-3xl font-extrabold text-white mt-3 tracking-tight">
                Vouch Domain MCQ Assessments 🎯
              </h1>
              <p className="mt-2 text-sm text-muted-foreground font-semibold max-w-xl">
                Verify your structural technical vocabulary and engineering foundations in 60 seconds. High scores are automatically tagged to your public profile portfolio.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              {[
                { key: "frontend", title: "Frontend Engineering", desc: "React components, state cache hooks, CSS flex layout alignments, TypeScript compilation.", icon: Zap, color: "text-brand bg-brand/10 border-brand/20" },
                { key: "backend", title: "Backend Engineering", desc: "ACID database transactions, event loops, REST API design, indexes, token encryptions.", icon: Target, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
                { key: "design", title: "Product & UI/UX Design", desc: "Design systems consistency, color wheel complements, vector layouts, wireframe hierarchies.", icon: Brain, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
              ].map((d) => (
                <div
                  key={d.key}
                  className="rounded-2xl border border-border bg-panel p-5 flex flex-col justify-between hover:border-brand/35 hover:shadow-[0_0_30px_-5px_rgba(245,197,24,0.12)] transition duration-300 shadow-lg cursor-pointer group"
                  onClick={() => startQuiz(d.key)}
                >
                  <div>
                    <div className={`grid h-10 w-10 place-items-center rounded-xl shrink-0 border ${d.color}`}>
                      <d.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-heading text-sm font-bold text-white mt-4">{d.title}</h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mt-2 font-medium">
                      {d.desc}
                    </p>
                  </div>
                  <button
                    className="mt-6 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-card/60 border border-border/80 text-xs font-bold text-white/90 w-full group-hover:bg-brand group-hover:text-brand-foreground group-hover:border-transparent transition-all duration-300"
                  >
                    Start Assessment <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {quizState === "active" && activeDomain && (
          <div className="rounded-[22px] border border-border bg-panel p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/3 rounded-full blur-3xl pointer-events-none" />
            
            {/* Active Quiz Header */}
            <div className="flex items-center justify-between border-b border-border/40 pb-5 mb-6">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-black">
                  Active Domain: {DOMAINS[activeDomain].title}
                </span>
                <h2 className="font-heading text-lg font-black text-white mt-1">
                  Question {currentQuestionIdx + 1} of {DOMAINS[activeDomain].questions.length}
                </h2>
              </div>

              {/* Countdown timer */}
              <div className="flex items-center gap-2 rounded-xl bg-card border border-border/80 px-3.5 py-1.5 text-xs font-mono font-black text-brand shadow-inner">
                <Clock className="h-4 w-4 animate-pulse shrink-0 text-brand" /> {timeLeft}s Left
              </div>
            </div>

            {/* Question Text */}
            <p className="text-base font-black text-white leading-relaxed mb-6 font-heading">
              {DOMAINS[activeDomain].questions[currentQuestionIdx].q}
            </p>

            {/* Option List */}
            <div className="space-y-3">
              {DOMAINS[activeDomain].questions[currentQuestionIdx].options.map((opt, i) => {
                const isSelected = selectedOptionIdx === i;
                return (
                  <button
                    key={opt}
                    onClick={() => setSelectedOptionIdx(i)}
                    className={`w-full rounded-[14px] border p-4 text-left text-xs font-bold text-white transition-all duration-200 ${
                      isSelected
                        ? "border-brand bg-brand/5 shadow-[0_0_15px_rgba(245,197,24,0.1)] text-brand"
                        : "border-border/60 bg-card/65 hover:border-brand/40 hover:bg-card/90"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`grid h-5 w-5 place-items-center rounded-full text-[9px] font-black ${
                          isSelected
                            ? "bg-brand text-brand-foreground"
                            : "bg-panel text-muted-foreground border border-border"
                        }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="flex-1 leading-snug">{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="mt-8 flex justify-end border-t border-border/40 pt-5">
              <button
                onClick={handleNextQuestion}
                disabled={selectedOptionIdx === null}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand px-6 text-xs font-bold text-brand-foreground hover:brightness-110 disabled:opacity-45 disabled:pointer-events-none transition shadow-md shadow-brand/20"
              >
                {currentQuestionIdx < DOMAINS[activeDomain].questions.length - 1 ? "Next Question" : "Submit Assessment"}{" "}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {quizState === "result" && finalScoreStats && (
          <div className="rounded-[24px] border border-border bg-panel p-8 shadow-2xl text-center relative overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col items-center">
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand/3 rounded-full blur-3xl pointer-events-none" />
            
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand/10 text-brand mb-6 shadow-[0_8px_30px_rgba(245,197,24,0.18)] border border-brand/20 animate-bounce">
              <Award className="h-8 w-8" />
            </div>

            <span className="rounded-full bg-brand/10 border border-brand/20 px-3.5 py-1 text-xs font-bold text-brand uppercase tracking-wider">
              {finalScoreStats.domain} Assessment Finished
            </span>

            <h2 className="font-heading text-3xl font-black text-white mt-4 tracking-tight">
              Dynamic Skill Rating
            </h2>
            <p className="text-xs text-muted-foreground max-w-sm mt-1.5 font-medium leading-relaxed">
              Your structural rating has been synced and integrated with your public resume scoring.
            </p>

            <div className="mt-8 flex items-center justify-center gap-6 border-y border-border/40 py-6 w-full max-w-md">
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-black">Final Score</div>
                <div className="font-heading text-4xl font-black text-brand mt-1.5">{finalScoreStats.score}%</div>
              </div>
              <div className="w-[1px] h-10 bg-border/60 shrink-0" />
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-black">Correct Answers</div>
                <div className="font-heading text-4xl font-black text-white mt-1.5">{finalScoreStats.correctAnswers}/{finalScoreStats.totalQuestions}</div>
              </div>
            </div>

            <div className="mt-8 flex gap-3.5 w-full max-w-xs justify-center">
              <button
                onClick={() => setQuizState("select")}
                className="flex-1 h-11 rounded-lg border border-border bg-transparent text-xs font-bold text-white hover:bg-white/5 transition"
              >
                Retake Quiz
              </button>
              <button
                onClick={() => router.push("/candidate")}
                className="flex-1 h-11 rounded-lg bg-brand text-xs font-bold text-brand-foreground hover:brightness-110 transition shadow-md shadow-brand/20"
              >
                Dashboard
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
