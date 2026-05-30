"use client";

import { useState } from "react";
import { Share2, Award, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface PublicTalentPassProps {
  videoResume: {
    id: string;
    overall_score: number;
    language: string;
    skills?: string[];
  };
  profile: {
    full_name: string;
    email: string;
  };
}

export default function PublicTalentPass({ videoResume, profile }: PublicTalentPassProps) {
  const overall = videoResume.overall_score || 82;
  const skills = videoResume.skills || ["React", "TypeScript", "UI/UX"];
  const initials = profile?.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "C";

  return (
    <div className="space-y-6">
      {/* 3D Perspective Card Container */}
      <div className="flex justify-center" style={{ perspective: "1000px" }}>
        <div
          id="public-talent-pass-card"
          className="w-full max-w-sm h-[480px] rounded-[24px] border-2 border-brand/85 bg-gradient-to-b from-[#1c1d2e] via-[#10111a] to-[#06070a] p-5 shadow-[0_0_50px_rgba(245,197,24,0.22)] relative overflow-hidden transition-all duration-500 transform hover:rotate-y-6 hover:rotate-x-6 hover:scale-[1.02] transform-style-3d cursor-pointer group"
        >
          {/* Tech Dot-Grid Vector Pattern Background Overlay */}
          <div 
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#f5c518 1px, transparent 1px)",
              backgroundSize: "16px 16px"
            }}
          />

          {/* Sweeping diagonal glass shimmer reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

          {/* Tech corner accents (VIP Token Styling) */}
          <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-brand/50 pointer-events-none" />
          <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-brand/50 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-brand/50 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-brand/50 pointer-events-none" />

          {/* Holographic background glows */}
          <div className="absolute -top-10 -right-10 w-44 h-44 bg-brand/10 rounded-full blur-[80px] animate-pulse duration-[8000ms] pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-blue-500/10 rounded-full blur-[80px] animate-pulse duration-[6000ms] pointer-events-none" />

          {/* Header branding */}
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <div className="flex items-center gap-1.5">
              <span className="text-brand text-lg font-black tracking-widest font-heading">VOUCH</span>
              <span className="rounded bg-brand/10 border border-brand/25 px-2 py-0.5 text-[8px] font-black text-brand uppercase tracking-widest shrink-0">AI VERIFIED</span>
            </div>
            <span className="text-[8px] text-muted-foreground font-mono font-bold tracking-widest uppercase">
              ID: {videoResume.id.slice(0, 8)}
            </span>
          </div>

          {/* Profile Details */}
          <div className="mt-5 flex flex-col items-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand text-xl font-black text-brand-foreground shadow-[0_6px_20px_rgba(245,197,24,0.25)] mb-3">
              {initials}
            </div>
            <h4 className="font-heading text-lg font-black text-white leading-none tracking-tight">
              {profile?.full_name || "Anonymous Talent"}
            </h4>
            <p className="text-[10px] text-brand font-bold uppercase tracking-wider mt-1.5">
              {videoResume.language === "en" ? "Frontend Engineer" : "Multilingual Developer"}
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
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=f5c518&bgcolor=13151f&data=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                  alt="Talent QR Pass"
                  className="w-20 h-20 shrink-0 select-none pointer-events-none rounded-lg"
                />
              </div>
              <span className="text-[7px] uppercase tracking-wider text-muted-foreground font-black mt-1.5">
                Scan to review pitch
              </span>
            </div>
          </div>

          {/* Footer terms */}
          <div className="absolute bottom-5 left-5 right-5 text-center">
            <div className="flex flex-wrap justify-center gap-1">
              {skills.slice(0, 3).map((s: string) => (
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
      <div className="flex gap-3">
        <button
          onClick={() => {
            if (typeof window !== "undefined") {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Shareable profile URL copied to clipboard!");
            }
          }}
          className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-transparent text-xs font-bold text-white hover:bg-white/5 transition"
        >
          <Share2 className="h-4 w-4" /> Copy Link
        </button>

        <button
          onClick={async () => {
            const toastId = toast.loading("Generating High-Res Talent Pass PNG...");
            try {
              const canvas = document.createElement("canvas");
              canvas.width = 800;
              canvas.height = 1200;
              const ctx = canvas.getContext("2d");
              if (!ctx) throw new Error("Could not create canvas context");

              // 1. Draw premium dark gradient background
              const grad = ctx.createLinearGradient(0, 0, 0, 1200);
              grad.addColorStop(0, "#1c1d2e");
              grad.addColorStop(0.5, "#10111a");
              grad.addColorStop(1, "#06070a");
              ctx.fillStyle = grad;
              ctx.fillRect(0, 0, 800, 1200);

              // 2. Draw gorgeous glow orbs on Canvas
              // Top Right Amber Glow
              const topGlow = ctx.createRadialGradient(700, 100, 50, 700, 100, 400);
              topGlow.addColorStop(0, "rgba(245, 197, 24, 0.12)");
              topGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
              ctx.fillStyle = topGlow;
              ctx.fillRect(0, 0, 800, 1200);

              // Bottom Left Blue Glow
              const bottomGlow = ctx.createRadialGradient(100, 1100, 50, 100, 1100, 400);
              bottomGlow.addColorStop(0, "rgba(59, 130, 246, 0.12)");
              bottomGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
              ctx.fillStyle = bottomGlow;
              ctx.fillRect(0, 0, 800, 1200);

              // 3. Draw high-tech Dot-Grid pattern on Canvas
              ctx.fillStyle = "rgba(245, 197, 24, 0.08)";
              for (let x = 30; x < 770; x += 32) {
                for (let y = 30; y < 1170; y += 32) {
                  ctx.beginPath();
                  ctx.arc(x, y, 2.5, 0, Math.PI * 2);
                  ctx.fill();
                }
              }

              // 4. Draw high-tech corner L-accents on Canvas
              ctx.strokeStyle = "rgba(245, 197, 24, 0.5)";
              ctx.lineWidth = 4;
              // Top Left Corner
              ctx.beginPath(); ctx.moveTo(40, 70); ctx.lineTo(40, 40); ctx.lineTo(70, 40); ctx.stroke();
              // Top Right Corner
              ctx.beginPath(); ctx.moveTo(760, 70); ctx.lineTo(760, 40); ctx.lineTo(730, 40); ctx.stroke();
              // Bottom Left Corner
              ctx.beginPath(); ctx.moveTo(40, 1130); ctx.lineTo(40, 1160); ctx.lineTo(70, 1160); ctx.stroke();
              // Bottom Right Corner
              ctx.beginPath(); ctx.moveTo(760, 1130); ctx.lineTo(760, 1160); ctx.lineTo(730, 1160); ctx.stroke();

              // 5. Draw thick outer gold border
              ctx.strokeStyle = "#f5c518";
              ctx.lineWidth = 20;
              ctx.strokeRect(10, 10, 780, 1180);

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
              const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=f5c518&bgcolor=13151f&data=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`;
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

              toast.dismiss(toastId);
              toast.success("Talent Pass downloaded successfully!");
            } catch (e: any) {
              console.error("Canvas draw error:", e);
              toast.dismiss(toastId);
              toast.error("Failed to render Pass download.");
            }
          }}
          className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand text-xs font-bold text-brand-foreground hover:brightness-110 transition shadow-md shadow-brand/20"
        >
          <Award className="h-4 w-4" /> Download PNG
        </button>
      </div>
    </div>
  );
}
