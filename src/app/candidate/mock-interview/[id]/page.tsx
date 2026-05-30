"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, ArrowRight, Clock, Award, CheckCircle, RefreshCw, MessageSquare, Zap, Star, ShieldAlert, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { toast } from "sonner";

interface HistoryItem {
  question: string;
  answer: string;
  score: number;
  feedback: string;
}

const DEFAULT_FIRST_QUESTIONS: Record<string, string> = {
  frontend: "Can you explain the difference between client-side rendering (CSR) and server-side rendering (SSR) in React/Next.js, and how you decide which to use?",
  backend: "Explain the differences between SQL and NoSQL databases. In what scenario would you choose NoSQL for a core business service?",
  design: "How do you approach establishing visual hierarchy in a dashboard layout, and what role does typography weight play?"
};

const DOMAIN_NAMES: Record<string, string> = {
  frontend: "Frontend Engineering",
  backend: "Backend Engineering",
  design: "Product & UI/UX Design"
};

export default function MockInterviewPage({ params }: { params: { id: string } }) {
  const domain = params.id;
  const domainTitle = DOMAIN_NAMES[domain] || "Software Engineering";

  const [stage, setStage] = useState<"intro" | "chat" | "review" | "summary">("intro");
  const [questionIdx, setQuestionIdx] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<any | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (DEFAULT_FIRST_QUESTIONS[domain]) {
      setCurrentQuestion(DEFAULT_FIRST_QUESTIONS[domain]);
    } else {
      setCurrentQuestion("Tell me about a challenging technical problem you solved recently and your structured approach to debugging it.");
    }
  }, [domain]);

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      toast.error("Please type your response before submitting.");
      return;
    }

    setLoadingFeedback(true);
    try {
      const response = await fetch("/api/candidate/mock-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: domainTitle,
          question: currentQuestion,
          userAnswer,
          history: history.map(h => ({ q: h.question, a: h.answer }))
        }),
      });

      if (!response.ok) {
        throw new Error("Evaluation failed");
      }

      const data = await response.json();
      setCurrentEvaluation(data);
      setStage("review");

    } catch (err) {
      console.error(err);
      toast.error("Failed to connect to AI evaluator. Please try again.");
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleNextRound = () => {
    // 1. Commit current round details to history
    const newItem: HistoryItem = {
      question: currentQuestion,
      answer: userAnswer,
      score: currentEvaluation.score || 75,
      feedback: currentEvaluation.feedback || "Good response.",
    };
    const updatedHistory = [...history, newItem];
    setHistory(updatedHistory);

    // 2. Prepare for next step
    if (questionIdx < 3) {
      setCurrentQuestion(currentEvaluation.nextQuestion || "Can you expand on how you optimize code performance?");
      setUserAnswer("");
      setCurrentEvaluation(null);
      setQuestionIdx((prev) => prev + 1);
      setStage("chat");
    } else {
      setStage("summary");
    }
  };

  const calculateAverageScore = () => {
    if (history.length === 0) return 0;
    const sum = history.reduce((acc, h) => acc + h.score, 0);
    return Math.round(sum / history.length);
  };

  return (
    <div className="min-h-screen bg-background text-white pb-20 relative overflow-hidden">
      <Navbar variant="candidate" />

      {/* Ambient glowing mesh backdrops */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <main className="mx-auto max-w-3xl px-6 mt-12 relative z-10">
        
        {stage === "intro" && (
          <div className="rounded-[24px] border border-border bg-panel p-8 shadow-2xl text-center relative overflow-hidden animate-in fade-in duration-500 max-w-xl mx-auto">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/3 rounded-full blur-3xl pointer-events-none" />
            
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand/10 text-brand border border-brand/20 mb-6 shadow-[0_8px_30px_rgba(245,197,24,0.15)]">
              <Brain className="h-7 w-7 animate-pulse" />
            </div>

            <span className="rounded-full bg-brand/10 border border-brand/25 px-3.5 py-1 text-[10px] font-bold text-brand uppercase tracking-wider">
              Vouch Interactive AI Practicer
            </span>

            <h1 className="font-heading text-2xl font-black text-white mt-4 tracking-tight">
              AI Technical Mock Interview
            </h1>
            <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed font-semibold">
              Practice a structured, multi-round technical conversation focused on <span className="text-white font-bold">{domainTitle}</span>. 
              Our Gemini engine grades your communication depth in real time and asks contextual follow-up questions.
            </p>

            <div className="mt-8 space-y-3.5 text-left border-y border-border/40 py-6 text-xs text-muted-foreground font-semibold">
              <div className="flex gap-3">
                <span className="text-brand text-sm">💬</span>
                <div>
                  <h4 className="text-white font-bold">3 Conversations Rounds</h4>
                  <p className="mt-0.5 text-[11px]">Answer consecutive adaptive questions customized to your specific answers.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-brand text-sm">📊</span>
                <div>
                  <h4 className="text-white font-bold">Technical Signal Scoring</h4>
                  <p className="mt-0.5 text-[11px]">Receive precise scores and granular structural feedback at each step.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStage("chat")}
              className="mt-8 w-full inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand text-xs font-bold text-brand-foreground hover:brightness-110 transition shadow-md shadow-brand/20"
            >
              Start Practice Session <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {stage === "chat" && (
          <div className="rounded-[22px] border border-border bg-panel p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/3 rounded-full blur-3xl pointer-events-none" />
            
            {/* Active chat header */}
            <div className="flex items-center justify-between border-b border-border/40 pb-5 mb-6">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-black">
                  Interactive Practice · Round {questionIdx} of 3
                </span>
                <h2 className="font-heading text-base font-black text-white mt-1">
                  Live Question Prompt
                </h2>
              </div>
              <div className="h-2 w-24 bg-card rounded-full overflow-hidden border border-border/80 shrink-0">
                <div 
                  className="h-full bg-brand transition-all duration-300"
                  style={{ width: `${(questionIdx / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Bubble */}
            <div className="rounded-xl border border-brand/20 bg-brand/5 p-5 relative mb-6 shadow-inner">
              <div className="absolute top-4 left-4 text-xs font-bold text-brand uppercase tracking-wider">AI Interviewer:</div>
              <p className="text-sm font-black text-white leading-relaxed mt-5 font-heading">
                {currentQuestion}
              </p>
            </div>

            {/* Response area */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Your Response</label>
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your detailed, structured technical response here..."
                disabled={loadingFeedback}
                className="w-full h-36 rounded-xl border border-border bg-card p-4 text-xs text-white placeholder:text-muted-foreground outline-none focus:border-brand transition resize-none disabled:opacity-55"
              />
            </div>

            {/* Submit Bar */}
            <div className="mt-8 flex justify-end border-t border-border/40 pt-5">
              <button
                onClick={handleSubmitAnswer}
                disabled={loadingFeedback || !userAnswer.trim()}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand px-6 text-xs font-bold text-brand-foreground hover:brightness-110 disabled:opacity-45 disabled:pointer-events-none transition shadow-md shadow-brand/20"
              >
                {loadingFeedback ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Evaluating Signal...
                  </>
                ) : (
                  <>
                    Submit Response <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {stage === "review" && currentEvaluation && (
          <div className="rounded-[22px] border border-border bg-panel p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/3 rounded-full blur-3xl pointer-events-none" />
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/40 pb-5 mb-6">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-black">
                  Round {questionIdx} Evaluation Complete
                </span>
                <h2 className="font-heading text-base font-black text-white mt-1">
                  AI Feedback Scorecard
                </h2>
              </div>

              <div className="text-center bg-card border border-border/80 rounded-xl px-4 py-2 shrink-0">
                <div className="text-[9px] uppercase text-muted-foreground font-extrabold tracking-wider">Round Score</div>
                <div className="font-heading text-2xl font-black text-brand mt-0.5">{currentEvaluation.score}/100</div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Question overview */}
              <div className="rounded-xl bg-card p-4 border border-border/60 text-xs">
                <div className="text-muted-foreground uppercase tracking-wider font-extrabold mb-1">Question</div>
                <p className="text-white/90 font-medium">{currentQuestion}</p>
              </div>

              {/* User Answer overview */}
              <div className="rounded-xl bg-card p-4 border border-border/60 text-xs">
                <div className="text-muted-foreground uppercase tracking-wider font-extrabold mb-1">Your Answer</div>
                <p className="text-white/80 font-medium italic">"{userAnswer}"</p>
              </div>

              {/* AI Feedback card */}
              <div className="rounded-xl border border-brand/20 bg-brand/5 p-5 relative shadow-inner">
                <h4 className="text-xs font-bold text-brand uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                  <Brain className="h-4 w-4 text-brand shrink-0" /> AI Diagnostic Analysis
                </h4>
                <p className="text-xs leading-relaxed text-muted-foreground font-semibold">
                  {currentEvaluation.feedback}
                </p>
              </div>
            </div>

            {/* Next trigger */}
            <div className="mt-8 flex justify-end border-t border-border/40 pt-5">
              <button
                onClick={handleNextRound}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand px-6 text-xs font-bold text-brand-foreground hover:brightness-110 transition shadow-md shadow-brand/20"
              >
                {questionIdx < 3 ? "Next Question" : "View Final Report"}{" "}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {stage === "summary" && (
          <div className="rounded-[24px] border border-border bg-panel p-8 shadow-2xl text-center relative overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col items-center">
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand/3 rounded-full blur-3xl pointer-events-none" />
            
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand/10 text-brand mb-6 shadow-[0_8px_30px_rgba(245,197,24,0.18)] border border-brand/20 animate-bounce">
              <Award className="h-8 w-8" />
            </div>

            <span className="rounded-full bg-brand/10 border border-brand/25 px-3.5 py-1 text-xs font-bold text-brand uppercase tracking-wider">
              {domainTitle} Session Report
            </span>

            <h2 className="font-heading text-3xl font-black text-white mt-4 tracking-tight">
              Mock Interview Summary
            </h2>
            <p className="text-xs text-muted-foreground max-w-sm mt-1.5 font-medium leading-relaxed">
              Complete diagnostic overview across current rounds metrics.
            </p>

            <div className="mt-6 flex items-center justify-center gap-6 border-y border-border/40 py-6 w-full max-w-md">
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-black">AI Average Score</div>
                <div className="font-heading text-4xl font-black text-brand mt-1.5">{calculateAverageScore()}%</div>
              </div>
              <div className="w-[1px] h-10 bg-border/60 shrink-0" />
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-black">Rounds Practice</div>
                <div className="font-heading text-4xl font-black text-white mt-1.5">3 / 3</div>
              </div>
            </div>

            {/* Complete history details breakdown card */}
            <div className="mt-8 space-y-4 w-full text-left">
              <h3 className="font-heading text-xs uppercase tracking-wider text-muted-foreground font-extrabold">Round-by-Round Audit</h3>
              {history.map((h, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3.5">
                  <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-2.5">
                    <span className="text-xs font-black text-white">Round {i + 1} technical vocabulary</span>
                    <span className="rounded bg-brand/15 px-2.5 py-0.5 text-[10px] font-mono font-black text-brand border border-brand/20">
                      Score: {h.score}%
                    </span>
                  </div>
                  
                  <div className="text-xs space-y-2">
                    <div>
                      <span className="text-muted-foreground font-bold uppercase tracking-wider text-[9px] block">Prompt</span>
                      <p className="text-white/95 font-medium mt-0.5">{h.question}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground font-bold uppercase tracking-wider text-[9px] block">Your Answer</span>
                      <p className="text-white/80 font-medium italic mt-0.5">"{h.answer}"</p>
                    </div>
                    <div className="rounded-lg bg-panel p-3 border border-border/40 mt-2">
                      <span className="text-brand font-bold uppercase tracking-wider text-[9px] block flex items-center gap-1">
                        <Brain className="h-3 w-3 shrink-0" /> AI Feedback Analysis
                      </span>
                      <p className="text-muted-foreground font-semibold mt-1 text-[11px] leading-relaxed">
                        {h.feedback}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex gap-3.5 w-full max-w-xs justify-center z-10">
              <button
                onClick={() => {
                  setStage("intro");
                  setQuestionIdx(1);
                  setHistory([]);
                  setCurrentEvaluation(null);
                  setUserAnswer("");
                }}
                className="flex-1 h-11 rounded-lg border border-border bg-transparent text-xs font-bold text-white hover:bg-white/5 transition"
              >
                Restart Quiz
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
