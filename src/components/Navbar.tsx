"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Plus, LogOut, ChevronDown, Layers } from "lucide-react";
import { Logo } from "./Logo";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type NavLink = { label: string; href: string };

export function Navbar({
  variant = "candidate",
  links,
  initials = "JS",
}: {
  variant?: "candidate" | "recruiter" | "landing";
  links?: NavLink[];
  initials?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  const candidateLinks: NavLink[] = [
    { label: "Dashboard", href: "/candidate" },
    { label: "My Video", href: "/candidate/upload" },
    { label: "Browse Jobs", href: "/candidate#browse-jobs" },
    { label: "Applications", href: "/candidate#applications" },
  ];

  const landingLinks: NavLink[] = [
    { label: "How it Works", href: "/" },
    { label: "For Recruiters", href: "/recruiter" },
    { label: "For Candidates", href: "/candidate" },
  ];

  const navLinks = links ?? (variant === "candidate" ? candidateLinks : variant === "landing" ? landingLinks : []);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        setUser(currentUser);
        const { data: currentProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single();
        if (currentProfile) {
          setProfile(currentProfile);
          
          if (currentProfile.role === "candidate") {
            const { data: dbNotes } = await supabase
              .from("notifications")
              .select("*")
              .eq("candidate_id", currentUser.id)
              .order("created_at", { ascending: false });
            setNotifications(dbNotes || []);
          }
        }
      }
    };
    fetchUser();
  }, []);

  // Real-time notifications listener
  useEffect(() => {
    if (!user || profile?.role !== "candidate") return;

    const channel = supabase
      .channel("live_notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `candidate_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
          toast.success(`🔔 Job Alert: ${payload.new.title}`);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, profile]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const handleRoleToggle = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) return;

    try {
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", currentUser.id)
        .single();

      if (!currentProfile) return;

      const newRole = currentProfile.role === "candidate" ? "recruiter" : "candidate";
      
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", currentUser.id);

      if (error) throw error;

      window.location.href = newRole === "recruiter" ? "/recruiter" : "/candidate";
    } catch (err) {
      console.error("Role swap failed:", err);
    }
  };

  return (
    <header
      className="sticky top-0 z-40 h-16 border-b border-border backdrop-blur"
      style={{ backgroundColor: variant === "landing" ? "rgba(10,11,15,0.85)" : "rgba(19,21,31,0.9)" }}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-3">
          <Logo to={variant === "landing" ? "/" : variant === "recruiter" ? "/recruiter" : "/candidate"} />
          {variant === "recruiter" && (
            <span className="rounded-full bg-brand px-2.5 py-0.5 text-[11px] font-semibold text-brand-foreground">
              Recruiter
            </span>
          )}
        </div>

        {navLinks.length > 0 && (
          <nav className="hidden items-center gap-7 md:flex">
            {navLinks.map((l) => {
              const isActive = pathname === l.href;
              return (
                <Link
                  key={l.label}
                  href={l.href}
                  className={`relative text-sm font-medium transition-colors hover:text-white ${
                    isActive
                      ? "text-white after:absolute after:-bottom-[22px] after:left-0 after:h-0.5 after:w-full after:bg-brand"
                      : "text-white/70"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {variant === "landing" ? (
            <>
              <Link href="/auth" className="text-sm font-medium text-white/80 hover:text-white mr-2">
                Sign In
              </Link>
              <Link
                href="/auth"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-brand px-4 text-sm font-semibold text-brand-foreground transition-all hover:brightness-105 hover:shadow-[0_10px_30px_-10px_rgba(245,197,24,0.6)]"
              >
                Get Started Free
              </Link>
            </>
          ) : (
            <>
              {variant === "recruiter" && (
                <Link
                  href="/recruiter/post-job"
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-brand px-4 text-sm font-semibold text-brand-foreground transition-all hover:brightness-105 hover:shadow-[0_10px_30px_-10px_rgba(245,197,24,0.6)]"
                >
                  <Plus className="h-4 w-4" /> Post a Job
                </Link>
              )}
              
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfileMenu(false);
                  }}
                  className={`relative grid h-9 w-9 place-items-center rounded-full transition ${
                    showNotifications ? "bg-white/5 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Bell className="h-[18px] w-[18px]" />
                  {notifications.filter(n => !n.is_read).length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[8px] font-black text-white ring-2 ring-background animate-pulse">
                      {notifications.filter(n => !n.is_read).length}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 top-12 w-80 rounded-[14px] border border-border bg-panel p-4 shadow-2xl z-50 animate-in slide-in-from-top-3 fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2.5 mb-2.5 text-xs font-bold uppercase tracking-wider text-brand">
                      <span>Live Milestones</span>
                      {notifications.filter(n => !n.is_read).length > 0 && (
                        <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[9px] text-brand">
                          {notifications.filter(n => !n.is_read).length} New
                        </span>
                      )}
                    </div>
                    
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-muted-foreground font-semibold">
                        All quiet! You're fully up to date.
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-0.5 scrollbar-thin scrollbar-thumb-brand/20">
                          {notifications.map((n) => (
                            <div 
                              key={n.id} 
                              onClick={async () => {
                                await supabase
                                  .from("notifications")
                                  .update({ is_read: true })
                                  .eq("id", n.id);
                                setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, is_read: true } : item));
                                if (n.link) router.push(n.link);
                                setShowNotifications(false);
                              }}
                              className={`flex items-start gap-2.5 rounded-xl p-3 transition border cursor-pointer ${
                                n.is_read 
                                  ? "bg-card/35 hover:bg-card/65 border-border/40" 
                                  : "bg-brand/5 border-brand/20 hover:bg-brand/10"
                              }`}
                            >
                              <span className="text-base shrink-0 mt-0.5 font-sans">🔔</span>
                              <div className="flex-1 min-w-0 text-left">
                                <div className="flex items-center justify-between gap-2">
                                  <p className={`text-xs font-bold truncate ${n.is_read ? "text-white/80" : "text-white"}`}>
                                    {n.title}
                                  </p>
                                  {!n.is_read && <span className="h-1.5 w-1.5 bg-brand rounded-full shrink-0 animate-pulse" />}
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed font-semibold">
                                  {n.message}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {notifications.filter(n => !n.is_read).length > 0 && (
                          <button
                            onClick={async () => {
                              await supabase
                                .from("notifications")
                                .update({ is_read: true })
                                .eq("candidate_id", user.id);
                              setNotifications(prev => prev.map(item => ({ ...item, is_read: true })));
                              toast.success("All notifications marked as read!");
                            }}
                            className="w-full text-center text-[10px] font-black uppercase tracking-wider text-brand hover:underline mt-2.5 pt-2.5 border-t border-border/40 block"
                          >
                            ✓ Mark all as read
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>


              {/* Sleek Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-1.5 focus:outline-none transition active:scale-95 group cursor-pointer"
                >
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-brand text-xs font-bold text-brand-foreground ring-2 ring-transparent group-hover:ring-brand/40 transition">
                    {initials}
                  </div>
                  <ChevronDown className="h-3 w-3 text-white/50 group-hover:text-white transition" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 top-12 w-60 rounded-[14px] border border-border bg-panel p-4 shadow-2xl z-50 animate-in slide-in-from-top-3 fade-in duration-200">
                    <div className="border-b border-border/60 pb-3 mb-3">
                      <p className="text-xs font-bold text-white leading-normal truncate">{profile?.full_name || 'Vouch User'}</p>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">{user?.email || 'user@vouch.co'}</p>
                      <span className="inline-block mt-2 rounded-full bg-brand/10 border border-brand/20 px-2 py-0.5 text-[9px] font-semibold text-brand">
                        {variant === "recruiter" ? "Recruiter Portal" : "Candidate Portal"}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <button
                        onClick={handleRoleToggle}
                        className="w-full flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-xs font-semibold text-white/80 hover:bg-white/5 hover:text-white transition cursor-pointer"
                      >
                        <Layers className="h-4 w-4 text-brand shrink-0" />
                        <span>Switch to {variant === "candidate" ? "Recruiter" : "Candidate"} Mode</span>
                      </button>
                      
                      <div className="h-[1px] bg-border/60 my-2" />
                      
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-xs font-semibold text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                      >
                        <LogOut className="h-4 w-4 shrink-0" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
