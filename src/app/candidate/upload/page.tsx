"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Video, RefreshCw, UploadCloud, Brain, Camera, AlertCircle, Play, Check, Settings, Mic, Eye, Sliders, ChevronDown } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function UploadPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [scores, setScores] = useState<any>(null);
  const [step, setStep] = useState<"record" | "preview" | "result">("record");

  // Device selectors & Audio Level Meter states
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [selectedMic, setSelectedMic] = useState<string>("");
  const [audioLevel, setAudioLevel] = useState(0);
  
  // 3-2-1 Countdown & Teleprompter states
  const [countdown, setCountdown] = useState<number | null>(null);
  const [teleprompterOpen, setTeleprompterOpen] = useState(true);
  const [teleprompterSize, setTeleprompterSize] = useState(16);
  
  const defaultScript = `"Hi, I'm Abhishek. I have a strong background in software development, focusing on frontend layouts and clean architectures. My top skills are TypeScript, React, and modular state management. I'm excited about this opportunity because I love building highly optimized experiences."`;
  const [teleprompterScript, setTeleprompterScript] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("vouch_teleprompter_script");
      setTeleprompterScript(saved || defaultScript);
    }
  }, []);

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === "video/mp4" || file.type === "video/webm")) {
      setVideoBlob(file);
      setVideoUrl(URL.createObjectURL(file));
      setStep("preview");
    }
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const router = useRouter();

  // Web Audio Contexts
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const getUser = async () => {
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
        router.push("/recruiter");
        return;
      }
      setProfile(profile);

      // Enumerate connected webcams and mics
      try {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === "videoinput");
        const audioDevices = devices.filter((d) => d.kind === "audioinput");
        setCameras(videoDevices);
        setMics(audioDevices);
        if (videoDevices.length > 0) setSelectedCamera(videoDevices[0].deviceId);
        if (audioDevices.length > 0) setSelectedMic(audioDevices[0].deviceId);
      } catch (err) {
        console.error("Camera/Mic hardware loading error:", err);
      }
    };
    getUser();

    return () => {
      cleanupStreams();
    };
  }, [router]);

  const cleanupStreams = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      startRecording();
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const getInitials = (name?: string) => {
    if (!name) return "JS";
    return name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
  };

  const startCamera = async () => {
    cleanupStreams();
    try {
      const constraints = {
        video: selectedCamera ? { deviceId: { exact: selectedCamera } } : true,
        audio: selectedMic ? { deviceId: { exact: selectedMic } } : true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Audio Level Visualizer Engine
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(updateMeter);
      };
      updateMeter();
    } catch (err) {
      console.error("Camera access error:", err);
    }
  };

  const triggerCountdown = async () => {
    await startCamera();
    setCountdown(3);
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    
    const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType: "video/webm" });
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setVideoBlob(blob);
      setVideoUrl(URL.createObjectURL(blob));
      setStep("preview");
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
    }
    cleanupStreams();
    setRecording(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoBlob(file);
      setVideoUrl(URL.createObjectURL(file));
      setStep("preview");
    }
  };

  const uploadAndAnalyze = async () => {
    if (!videoBlob || !user) return;
    setUploading(true);

    try {
      const fileName = `${user.id}-${Date.now()}.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("videos")
        .upload(fileName, videoBlob, { contentType: "video/webm" });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("videos").getPublicUrl(fileName);

      setUploading(false);
      setAnalyzing(true);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: publicUrl, userId: user.id }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to evaluate candidate resume");
      }

      const result = await response.json();
      setScores(result);
      setAnalyzing(false);
      setStep("result");
    } catch (error: any) {
      console.error("Evaluation error:", error);
      alert(`Evaluation failed: ${error.message || "An unexpected error occurred during processing. Please try again."}`);
      setUploading(false);
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white pb-16">
      <Navbar variant="candidate" initials={getInitials(profile?.full_name)} />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/candidate" className="text-sm font-bold text-muted-foreground hover:text-white transition duration-200">
            ← Back to Dashboard
          </Link>
        </div>

        <h1 className="font-heading text-3xl font-extrabold tracking-tight">Vouch Recording Studio</h1>
        <p className="mt-1 text-sm text-muted-foreground font-medium">
          Deliver a stunning 60-90 second elevator pitch. Speak clearly.
        </p>

        {/* Wizard Progress Steps */}
        <div className="flex items-center gap-4 my-8">
          {[
            { id: "record", label: "Studio Studio" },
            { id: "preview", label: "Review Pitch" },
            { id: "result", label: "AI Result" },
          ].map((s, idx) => {
            const active = step === s.id;
            const done = idx < ["record", "preview", "result"].indexOf(step);
            return (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    active
                      ? "bg-brand text-brand-foreground shadow-[0_0_12px_rgba(245,197,24,0.45)]"
                      : done
                      ? "bg-success text-white"
                      : "bg-card border border-border text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${active ? "text-white" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
                {idx < 2 && <div className="w-8 h-px bg-border/40" />}
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,320px)]">
          {/* Main Studio Console */}
          <div className="space-y-6">
            {step === "record" && (
              <div className="rounded-[18px] border border-border bg-panel p-5 sm:p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand/3 rounded-full blur-[80px] pointer-events-none" />
                <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-border flex items-center justify-center mb-6">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Huge Animated 3-2-1 Countdown Overlay */}
                  {countdown !== null && (
                    <div className="absolute inset-0 bg-black/85 flex items-center justify-center z-25">
                      <div className="font-heading text-8xl font-black text-brand animate-ping duration-1000">
                        {countdown}
                      </div>
                    </div>
                  )}

                  {!recording && countdown === null && (
                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-6 border-2 transition-all duration-300 z-10 ${
                        isDragging 
                          ? "border-brand bg-brand/5 shadow-[inset_0_0_40px_rgba(245,197,24,0.15),0_0_30px_rgba(245,197,24,0.1)]" 
                          : "border-dashed border-border/60 hover:border-brand/40"
                      }`}
                    >
                      <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand mb-3 shadow-md group-hover:scale-105 transition-transform duration-300">
                        <UploadCloud className="w-6 h-6 animate-pulse" />
                      </div>
                      <p className="font-heading text-base font-black text-white tracking-tight">Drag & Drop Pitch Video</p>
                      <p className="text-xs text-muted-foreground max-w-xs mt-1.5 font-bold leading-normal">
                        Drag your pre-recorded video here, or use inputs to record live with the studio countdown.
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-center space-y-4">
                  {!recording && countdown === null ? (
                    <div className="flex flex-col items-center gap-3.5">
                      <button
                        onClick={triggerCountdown}
                        className="inline-flex h-12 items-center justify-center gap-2.5 rounded-lg bg-brand px-8 text-sm font-bold text-brand-foreground hover:brightness-105 transition hover:shadow-[0_4px_30px_rgba(245,197,24,0.45)]"
                      >
                        🔴 Start Pitch Countdown
                      </button>
                      <div className="flex items-center gap-3 w-48">
                        <div className="h-px flex-1 bg-border/40" />
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-black">or</span>
                        <div className="h-px flex-1 bg-border/40" />
                      </div>
                      <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-card/65 backdrop-blur-md px-6 text-sm font-bold text-white hover:border-brand/40 hover:bg-white/5 transition">
                        <UploadCloud className="w-4 h-4 text-brand" />
                        <span>Upload from Gallery</span>
                        <input
                          type="file"
                          accept="video/mp4,video/webm"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  ) : recording ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                        <span className="text-red-400 text-xs font-bold uppercase tracking-wider">Recording Live</span>
                      </div>
                      <button
                        onClick={stopRecording}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-red-600 px-8 text-sm font-bold text-white hover:bg-red-500 transition hover:shadow-[0_4px_24px_rgba(239,68,68,0.4)]"
                      >
                        ⏹ Stop Recording
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {/* Step: PREVIEW */}
            {step === "preview" && (
              <div className="rounded-[18px] border border-border bg-panel p-6 shadow-2xl relative">
                <h3 className="font-heading text-lg font-bold mb-4">Review Your Recorded Pitch</h3>
                <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-border mb-6">
                  <video src={videoUrl} controls className="w-full h-full object-cover" />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setStep("record");
                      setVideoBlob(null);
                      setVideoUrl("");
                    }}
                    disabled={uploading || analyzing}
                    className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card text-sm font-bold text-white hover:border-brand/40 hover:bg-white/5 transition disabled:opacity-50"
                  >
                    <RefreshCw className="w-4 h-4" /> Start Over
                  </button>
                  <button
                    onClick={uploadAndAnalyze}
                    disabled={uploading || analyzing}
                    className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand text-sm font-bold text-brand-foreground hover:brightness-105 transition hover:shadow-[0_4px_24px_rgba(245,197,24,0.4)] disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <UploadCloud className="w-4 h-4 animate-bounce" /> Uploading Pitch...
                      </>
                    ) : analyzing ? (
                      <>
                        <Brain className="w-4 h-4 animate-spin text-brand-foreground" /> AI Evaluating...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" /> Upload & Evaluate
                      </>
                    )}
                  </button>
                </div>

                {analyzing && (
                  <div className="mt-6 p-5 rounded-xl border border-brand/20 bg-brand/5 text-center space-y-2 animate-pulse">
                    <div className="text-brand font-bold flex items-center justify-center gap-2">
                      <Brain className="w-5 h-5 text-brand animate-bounce" />
                      <span>AI Model evaluation active...</span>
                    </div>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto font-semibold">
                      Transcribing speech signature using Whisper v3 &rarr; Analyzing communication traits via Gemini-2.5-Flash. Complete in 15 seconds.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step: RESULT */}
            {step === "result" && scores && (
              <div className="rounded-[18px] border border-border bg-panel p-6 sm:p-8 space-y-6 shadow-2xl relative">
                <div className="text-center">
                  <span className="inline-flex h-9 w-9 place-items-center justify-center rounded-full bg-success/20 text-success border border-success/10 mb-2">
                    <Check className="w-5 h-5" />
                  </span>
                  <h3 className="font-heading text-2xl font-black">🎉 Evaluation Complete!</h3>
                  <p className="text-xs text-muted-foreground mt-1 font-semibold">Your video resume has been parsed by HR scoring modules.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-border bg-card p-5 text-center flex flex-col justify-center items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-brand/2 rounded-full blur-2xl" />
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-extrabold">Overall AI Rating</span>
                    <span className="text-5xl font-black text-brand mt-2 leading-none">{scores.overall_score}</span>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-4 space-y-3.5">
                    {[
                      { label: "Communication", val: scores.communication_score, color: "#F5C518" },
                      { label: "Confidence", val: scores.confidence_score, color: "#3B82F6" },
                      { label: "Clarity", val: scores.clarity_score, color: "#22C55E" },
                      { label: "Technical Vocab", val: scores.technical_score, color: "#A855F7" },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-[11px] mb-1 font-bold">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-semibold text-white">{item.val}/100</span>
                        </div>
                        <div className="w-full bg-panel rounded-full h-1.5 overflow-hidden border border-border/40">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{ width: `${item.val}%`, backgroundColor: item.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {scores.ai_summary && (
                  <div className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
                      <Brain className="w-4.5 h-4.5 text-brand animate-pulse" /> AI Assessment Overview
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground font-medium">
                      {scores.ai_summary}
                    </p>
                  </div>
                )}

                {scores.skills && scores.skills.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-extrabold block mb-2">
                      Detected Skills Tags
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {scores.skills.map((skill: string) => (
                        <span
                          key={skill}
                          className="bg-brand/10 text-brand px-3 py-1 rounded-full text-xs font-semibold border border-brand/20"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <Link
                  href="/candidate"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand text-sm font-bold text-brand-foreground hover:brightness-105 transition hover:shadow-[0_4px_24px_rgba(245,197,24,0.35)]"
                >
                  Return to Dashboard &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* Right Column: Premium Studio Settings Drawer */}
          <div className="space-y-6">
            {/* Device configuration panel */}
            {step === "record" && (
              <div className="rounded-[18px] border border-border bg-panel p-5 shadow-2xl space-y-5">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-brand font-black">
                  <Settings className="w-4 h-4" /> Hardware Settings
                </div>

                {/* Webcam Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Video Input</label>
                  <select
                    value={selectedCamera}
                    onChange={(e) => setSelectedCamera(e.target.value)}
                    className="w-full h-10 rounded-lg border border-border bg-card px-3 text-xs text-white outline-none focus:border-brand transition"
                  >
                    {cameras.map((c) => (
                      <option key={c.deviceId} value={c.deviceId} className="bg-panel">
                        {c.label || `Camera ${c.deviceId.slice(0, 5)}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Microphone Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Audio Input</label>
                  <select
                    value={selectedMic}
                    onChange={(e) => setSelectedMic(e.target.value)}
                    className="w-full h-10 rounded-lg border border-border bg-card px-3 text-xs text-white outline-none focus:border-brand transition"
                  >
                    {mics.map((m) => (
                      <option key={m.deviceId} value={m.deviceId} className="bg-panel">
                        {m.label || `Microphone ${m.deviceId.slice(0, 5)}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Live Microphone Visualizer Meter */}
                <div className="space-y-2 border-t border-border/40 pt-4">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5 text-brand" /> Microphone Signal
                    </span>
                    <span className="font-mono text-brand">{audioLevel}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-card overflow-hidden border border-border/40">
                    <div
                      className="h-full bg-brand transition-all duration-75"
                      style={{ width: `${audioLevel}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Collapsible Teleprompter Script Card */}
            {step === "record" && (
              <div className="rounded-[18px] border border-border bg-panel shadow-2xl overflow-hidden">
                <button
                  onClick={() => setTeleprompterOpen(!teleprompterOpen)}
                  className="flex w-full items-center justify-between px-5 py-4 text-xs uppercase tracking-wider text-brand font-black hover:bg-white/2 transition"
                >
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" /> Teleprompter Teleprompter
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${teleprompterOpen ? "rotate-180" : ""}`} />
                </button>

                {teleprompterOpen && (
                  <div className="border-t border-border/60 p-4 space-y-4">
                    {/* Font size adjustments slider */}
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-extrabold flex items-center gap-1">
                        <Sliders className="w-3 h-3" /> Adjust Text Size
                      </span>
                      <input
                        type="range"
                        min="12"
                        max="24"
                        value={teleprompterSize}
                        onChange={(e) => setTeleprompterSize(Number(e.target.value))}
                        className="w-24 h-1 bg-card rounded-lg appearance-none cursor-pointer accent-brand"
                      />
                    </div>
                    {/* Editable Script box */}
                    <textarea
                      value={teleprompterScript}
                      onChange={(e) => {
                        setTeleprompterScript(e.target.value);
                        localStorage.setItem("vouch_teleprompter_script", e.target.value);
                      }}
                      className="w-full rounded-lg border border-border bg-card/40 p-3.5 font-sans leading-relaxed text-white/90 outline-none focus:border-brand/60 transition select-text resize-none overflow-y-auto max-h-56 h-36"
                      style={{ fontSize: `${teleprompterSize}px` }}
                      placeholder="Type or paste your elevator pitch here..."
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}