"use client";

import { useState, useEffect } from "react";
import { X, ArrowRight, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const EMPLOYMENT = ["Full-time", "Part-time", "Contract", "Internship"];
const EXPERIENCE = ["Fresher", "1-3 yrs", "3-5 yrs", "5+ yrs"];

export default function PostJobPage() {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState<string[]>(["React", "TypeScript"]);
  const [skillInput, setSkillInput] = useState("");
  const [remote, setRemote] = useState(false);
  const [emp, setEmp] = useState("Full-time");
  const [exp, setExp] = useState("3-5 yrs");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [initials, setInitials] = useState("HM");
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profile) {
        if (profile.role !== "recruiter") {
          router.push("/candidate");
          return;
        }
        const name = profile.full_name || "";
        const init = name.split(" ").map((p: string) => p[0]).join("").slice(0, 2).toUpperCase() || "HM";
        setInitials(init);
      }
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const addSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("You must be logged in as a recruiter to post a job.");
      return;
    }

    try {
      const { error } = await supabase.from("jobs").insert({
        recruiter_id: user.id,
        title,
        company,
        location: remote ? "Remote" : location,
        description,
        required_skills: skills,
      });

      if (error) throw error;

      alert(`Successfully published position for "${title}"!`);
      router.push("/recruiter");
    } catch (err: any) {
      console.error("Job post error:", err);
      alert(err.message || "Failed to post job. Please try again.");
    }
  };

  const fieldClass =
    "h-12 w-full rounded-lg border border-border bg-card px-3.5 text-sm text-white placeholder:text-muted-foreground outline-none transition-all focus:border-brand focus:shadow-[0_0_0_3px_rgba(245,197,24,0.18)]";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white">
      <Navbar variant="recruiter" initials={initials} />

      <main className="mx-auto max-w-3xl px-6 py-10">
        {/* Back Button */}
        <button
          onClick={() => router.push("/recruiter")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-white transition group"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full border border-border bg-card group-hover:border-brand/50 group-hover:bg-white/5 transition">
            <ArrowLeft className="h-4 w-4" />
          </span>
          Back to Dashboard
        </button>

        <div className="rounded-[14px] border border-border bg-panel p-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand">
              <ArrowRight className="h-5 w-5" />
            </div>
            <h1 className="font-heading text-3xl font-bold">Post a New Position</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground ml-[52px]">Get a ranked shortlist of video applicants in minutes.</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/90">Job Title</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={fieldClass}
                placeholder="e.g. Senior Frontend Engineer"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/90">Company Name</label>
              <input
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className={fieldClass}
                placeholder="Your company"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/90">Location</label>
              <div className="flex gap-3">
                <input
                  required={!remote}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={remote}
                  className={fieldClass}
                  placeholder={remote ? "Fully Remote" : "e.g. Bangalore, India"}
                />
                <button
                  type="button"
                  onClick={() => {
                    setRemote(!remote);
                    if (!remote) setLocation("");
                  }}
                  className={`h-12 whitespace-nowrap rounded-lg border px-4 text-sm font-semibold transition-all ${
                    remote
                      ? "border-brand bg-brand text-brand-foreground shadow-[0_0_12px_rgba(245,197,24,0.3)]"
                      : "border-border bg-card text-white hover:border-brand/60"
                  }`}
                >
                  Remote
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/90">Job Description</label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What will this person do?"
                className="w-full rounded-lg border border-border bg-card p-3.5 text-sm text-white placeholder:text-muted-foreground outline-none transition-all focus:border-brand focus:shadow-[0_0_0_3px_rgba(245,197,24,0.18)]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/90">Required Skills</label>
              <div className="rounded-lg border border-border bg-card p-2 focus-within:border-brand focus-within:shadow-[0_0_0_3px_rgba(245,197,24,0.18)]">
                <div className="flex flex-wrap items-center gap-2">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 rounded-full bg-brand/15 px-2.5 py-1 text-xs font-semibold text-brand border border-brand/25"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => setSkills(skills.filter((x) => x !== s))}
                        className="rounded-full p-0.5 hover:bg-brand/20 transition"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={addSkill}
                    placeholder="Type a skill and press Enter"
                    className="flex-1 min-w-[180px] bg-transparent px-2 py-1.5 text-sm text-white placeholder:text-muted-foreground outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/90">Employment Type</label>
              <div className="flex flex-wrap gap-2">
                {EMPLOYMENT.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setEmp(t)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
                      emp === t
                        ? "border-brand bg-brand text-brand-foreground shadow-[0_4px_12px_rgba(245,197,24,0.3)]"
                        : "border-border bg-card text-white hover:border-brand/60"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/90">Experience Level</label>
              <div className="flex flex-wrap gap-2">
                {EXPERIENCE.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setExp(t)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
                      exp === t
                        ? "border-brand bg-brand text-brand-foreground shadow-[0_4px_12px_rgba(245,197,24,0.3)]"
                        : "border-border bg-card text-white hover:border-brand/60"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                type="submit"
                className="inline-flex h-12 items-center gap-2 rounded-lg bg-brand px-6 text-sm font-semibold text-brand-foreground hover:brightness-105 hover:shadow-[0_10px_30px_-10px_rgba(245,197,24,0.6)] transition"
              >
                Publish Job <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  alert("Draft saved!");
                  router.push("/recruiter");
                }}
                className="inline-flex h-12 items-center gap-2 rounded-lg border border-border bg-transparent px-5 text-sm font-semibold text-white hover:border-brand/60 transition"
              >
                Save as Draft
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
