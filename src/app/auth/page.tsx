"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Video, Zap, Target, Bot, User, Building2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-[18px] w-[18px]" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C41.6 35.7 44 30.3 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="#3B82F6" aria-hidden>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}

function StatCard({ icon: Icon, value, label }: { icon: React.ComponentType<{ className?: string }>; value: string; label: string }) {
  return (
    <div className="rounded-[14px] border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-brand/40">
      <div className="flex items-center gap-2.5">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand/10 text-brand">
          <Icon className="h-[18px] w-[18px]" />
        </div>
        <div className="font-heading text-2xl font-bold text-white">{value}</div>
      </div>
      <div className="mt-3 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"candidate" | "recruiter">("candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [checkEmail, setCheckEmail] = useState(false);
  const router = useRouter();

  useState(() => {
    // Check for email confirmation redirect
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("confirmed") === "true" || params.get("verified") === "true") {
        // Trigger verification success toast
        setTimeout(() => {
          toast.success("Email verified successfully! Please log in to activate your account.", {
            duration: 8000,
          });
        }, 500);
        // Clean URL query parameters to keep address bar clean
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profile?.role === "recruiter") {
          router.push("/recruiter");
        } else {
          router.push("/candidate");
        }
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }

        if (data.user) {
          // Call secure server endpoint to insert profile bypassing RLS policies
          const registerRes = await fetch("/api/auth/register-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: data.user.id,
              email,
              fullName,
              role,
            }),
          });

          if (!registerRes.ok) {
            const errData = await registerRes.json();
            setError(errData.error || "Failed to create profile record.");
            setLoading(false);
            return;
          }

          // Show verify email inbox checklist rather than silent unauthenticated redirect
          setCheckEmail(true);
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = Math.min(4, Math.floor(password.length / 3));

  return (
    <main className="min-h-screen w-full bg-background lg:grid lg:grid-cols-2">
      {/* LEFT PANEL */}
      <aside
        className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16"
        style={{
          background:
            "radial-gradient(120% 80% at 0% 0%, rgba(245,197,24,0.22) 0%, rgba(245,197,24,0.08) 22%, rgba(10,11,15,0) 55%), radial-gradient(90% 70% at 100% 100%, rgba(59,130,246,0.10) 0%, rgba(10,11,15,0) 55%), #111318",
        }}
      >
        <div className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full" style={{ background: "radial-gradient(closest-side, rgba(245,197,24,0.28), transparent 75%)", filter: "blur(40px)" }} />
        <div className="relative"><Logo size="lg" /></div>
        <div className="relative mt-12 max-w-xl">
          <h1 className="font-heading text-[44px] font-bold leading-[1.05] tracking-tight text-white xl:text-[52px]">
            See the person,
            <br /><span className="text-brand">not the paper.</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
            AI-powered video screening that ranks candidates by how they communicate, not how they write.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3.5">
            <StatCard icon={Video} value="90s" label="All it takes to screen a candidate" />
            <StatCard icon={Zap} value="10x" label="Faster than manual screening" />
            <StatCard icon={Target} value="95%" label="Shortlist accuracy" />
            <StatCard icon={Bot} value="AI-Powered" label="Smart communication scoring" />
          </div>
        </div>
        <figure className="relative mt-10 rounded-[14px] border border-border bg-card p-5">
          <blockquote className="text-[15px] leading-relaxed text-white/90">
            "Vouch cut our screening time from 3 days to 20 minutes. We finally see who candidates really are."
          </blockquote>
          <figcaption className="mt-4 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-brand text-sm font-bold text-brand-foreground">RK</div>
            <div className="text-sm">
              <div className="font-semibold text-white">Rohan Kumar</div>
              <div className="text-muted-foreground">Head of Talent, Groww</div>
            </div>
          </figcaption>
        </figure>
      </aside>

      {/* RIGHT PANEL */}
      <section className="flex min-h-screen flex-col bg-background px-5 py-10 sm:px-8 lg:px-12 xl:px-20">
        <div className="mb-8 lg:hidden"><Logo /></div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          {checkEmail ? (
            <div className="text-center py-10 animate-in fade-in duration-300">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 text-brand shadow-[0_0_40px_rgba(245,197,24,0.15)]">
                <Mail className="h-8 w-8 animate-pulse text-brand" />
              </div>
              <h2 className="mt-6 text-3xl font-bold text-white font-heading">Check your inbox</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                We've sent a verification link to <strong className="text-white">{email}</strong>.
              </p>
              <p className="mt-2.5 text-xs text-muted-foreground/80 max-w-xs mx-auto">
                Please click the link in the email to activate and verify your Vouch account before logging in.
              </p>
              <button
                onClick={() => {
                  setCheckEmail(false);
                  setMode("login");
                }}
                className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-lg bg-brand text-sm font-semibold text-brand-foreground transition-all hover:brightness-105 hover:shadow-[0_4px_20px_rgba(245,197,24,0.35)]"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <>
              <header>
                <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {mode === "login" ? "Welcome back" : "Get started free"}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {mode === "login" ? "Sign in to your Vouch dashboard" : "Create your account in 30 seconds"}
                </p>
              </header>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => toast.info("Social login is coming soon! Please register with your email for now.")}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card text-sm font-medium text-white transition-all hover:border-white/20"
                >
                  <GoogleIcon /> Google
                </button>
                <button
                  type="button"
                  onClick={() => toast.info("Social login is coming soon! Please register with your email for now.")}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card text-sm font-medium text-white transition-all hover:border-[#3B82F6]/50"
                >
                  <LinkedInIcon /> LinkedIn
                </button>
              </div>

              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">or continue with email</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg text-sm bg-destructive/15 border border-destructive text-destructive">
                    {error}
                  </div>
                )}

                {mode === "signup" && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-white/90">Full name</label>
                    <input
                      required
                      type="text"
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-11 w-full rounded-lg border border-border bg-card px-3.5 text-sm text-white placeholder:text-muted-foreground outline-none transition-all focus:border-brand focus:shadow-[0_0_0_3px_rgba(245,197,24,0.18)]"
                    />
                  </div>
                )}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-white/90">Email</label>
                  <div className="group relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand" />
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 w-full rounded-lg border border-border bg-card pl-10 pr-3 text-sm text-white placeholder:text-muted-foreground outline-none transition-all focus:border-brand focus:shadow-[0_0_0_3px_rgba(245,197,24,0.18)]"
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="block text-sm font-medium text-white/90">Password</label>
                    {mode === "login" && <a href="#" className="text-sm font-medium text-brand hover:underline">Forgot password?</a>}
                  </div>
                  <div className="group relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand" />
                    <input
                      type={showPw ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === "signup" ? "At least 8 characters" : "Enter your password"}
                      className="h-11 w-full rounded-lg border border-border bg-card pl-10 pr-11 text-sm text-white placeholder:text-muted-foreground outline-none transition-all focus:border-brand focus:shadow-[0_0_0_3px_rgba(245,197,24,0.18)]"
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-white/5 hover:text-white">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {mode === "signup" && (
                    <div className="mt-2 flex gap-1.5">
                      {[0, 1, 2, 3].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < pwStrength ? (pwStrength <= 1 ? "bg-error" : pwStrength <= 2 ? "bg-warning" : "bg-success") : "bg-border"}`} />
                      ))}
                    </div>
                  )}
                </div>

                {mode === "signup" && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/90">I'm a...</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "candidate" as const, icon: User, label: "Job Seeker", desc: "Looking for opportunities" },
                        { id: "recruiter" as const, icon: Building2, label: "Recruiter", desc: "Hiring top talent" },
                      ].map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setRole(r.id)}
                          className={`rounded-[14px] border bg-card p-4 text-left transition-all ${role === r.id ? "border-brand shadow-[0_0_0_3px_rgba(245,197,24,0.18)]" : "border-border hover:border-white/20"}`}
                        >
                          <r.icon className={`h-5 w-5 ${role === r.id ? "text-brand" : "text-muted-foreground"}`} />
                          <div className="mt-2 text-sm font-semibold text-white">{r.label}</div>
                          <div className="text-xs text-muted-foreground">{r.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {mode === "login" && (
                  <label className="flex cursor-pointer items-center gap-2.5 select-none">
                    <input type="checkbox" defaultChecked className="peer sr-only" />
                    <span className="grid h-[18px] w-[18px] place-items-center rounded border border-border bg-card transition-all peer-checked:border-brand peer-checked:bg-brand">
                      <svg viewBox="0 0 16 16" className="h-3 w-3 text-brand-foreground">
                        <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="text-sm text-muted-foreground">Remember me for 30 days</span>
                  </label>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand text-sm font-semibold text-brand-foreground transition-all hover:brightness-105 hover:shadow-[0_10px_30px_-10px_rgba(245,197,24,0.6)] active:translate-y-px disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Please wait…
                    </>
                  ) : (
                    <>
                      {mode === "login" ? "Sign in" : "Create Account"}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="font-medium text-brand hover:underline">
                  {mode === "login" ? "Get started free" : "Sign in"}
                </button>
              </p>

              <div className="mt-12">
                <div className="text-center text-xs uppercase tracking-[0.18em] text-muted-foreground">Trusted by top teams</div>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-base font-semibold text-white/55">
                  <span>Razorpay</span><span>Zepto</span><span className="tracking-[0.2em]">CRED</span><span>Groww</span>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}