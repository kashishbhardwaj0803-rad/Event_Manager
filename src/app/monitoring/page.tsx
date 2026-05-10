"use client";
import DashboardLayout from "@/components/DashboardLayout";
import { Eye, Lock, MapPin, Clock, MessageSquare, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { getBioLinks, getNextFamilyMoment, subscribeToGuestUpdates } from "@/lib/database";
import type { BioLink, FamilyMoment, Guest } from "@/lib/types";

const alertTypes = [
  { icon: "🍽️", label: "Dietary Restrictions", desc: "Vibrate on consumption events", active: true },
  { icon: "🧠", label: "Behavioral Insight", desc: "Subtle buzz on outlier activity", active: false },
  { icon: "🚨", label: "Emergency Priority", desc: "Strong pulse on critical alerts", active: true, danger: true },
];

export default function MonitoringPage() {
  const [bioLinks, setBioLinks] = useState<BioLink[]>([]);
  const [nextMoment, setNextMoment] = useState<FamilyMoment | null>(null);
  const [countdown, setCountdown] = useState({ h: 0, m: 0, s: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [links, moment] = await Promise.all([getBioLinks(), getNextFamilyMoment()]);
      setBioLinks(links);
      setNextMoment(moment);
      setLoading(false);
    }
    load();
  }, []);

  // Compute countdown to next family moment
  useEffect(() => {
    if (!nextMoment) return;
    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(nextMoment.scheduled_at).getTime() - Date.now()) / 1000));
      setCountdown({ h: Math.floor(diff / 3600), m: Math.floor((diff % 3600) / 60), s: diff % 60 });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [nextMoment]);

  // Real-time guest location updates
  useEffect(() => {
    const sub = subscribeToGuestUpdates((updatedGuest) => {
      setBioLinks((prev) => prev.map((link) => {
        const child = link.child as unknown as Guest;
        const parent = link.parent as unknown as Guest;
        if (child?.id === updatedGuest.id) return { ...link, child: updatedGuest as any };
        if (parent?.id === updatedGuest.id) return { ...link, parent: updatedGuest as any };
        return link;
      }));
    });
    return () => { sub.unsubscribe(); };
  }, []);

  const fmt = (n: number) => String(n).padStart(2, "0");
  const activeLink = bioLinks[0];
  const child = activeLink?.child as unknown as Guest | undefined;

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto p-4 space-y-4" style={{ paddingTop: 24 }}>
        {/* Child Profile Card */}
        <div className="glass-card p-5">
          {loading ? (
            <div className="h-20 animate-pulse rounded-xl bg-white/[0.06]" />
          ) : child ? (
            <>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #1a3a2a, #0d2919)", border: "1px solid var(--glass-border)" }}>
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl">👦</span>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-[20px] font-bold text-white">{child.full_name}</h2>
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin size={11} className="text-[var(--text-tertiary)]" />
                      <span className="text-[12px] text-[var(--text-secondary)]">
                        {child.current_activity || child.current_zone}
                      </span>
                    </div>
                    {child.allergies && child.allergies.length > 0 && (
                      <div className="flex gap-1 mt-1.5">
                        {child.allergies.map((a) => (
                          <span key={a} className="badge badge-warning text-[9px]">⚠ {a}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <span className="badge badge-active">● Active</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                <div>
                  <p className="label-caps mb-0.5">Last Check-In</p>
                  <div className="flex items-center gap-1">
                    <Clock size={12} className="text-[var(--text-secondary)]" />
                    <span className="text-[15px] font-semibold text-white font-mono">
                      {child.last_checkin
                        ? new Date(child.last_checkin).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                        : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)" }}>
                    <MessageSquare size={14} className="text-[var(--text-secondary)]" />
                  </button>
                  <button className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--primary)" }}>
                    <MapPin size={14} className="text-[#0d0d0f]" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-[12px] text-[var(--text-tertiary)] text-center py-4">No bio-link active</p>
          )}
        </div>

        {/* Live Peek-In Video */}
        <div className="glass-card overflow-hidden p-0">
          <div className="relative" style={{ height: 220 }}>
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(135deg, #0a2a2a 0%, #1a3a3a 40%, #0a2020 100%)" }}>
              <div className="absolute inset-0 opacity-40"
                style={{ backgroundImage: "radial-gradient(circle at 50% 80%, rgba(100,255,218,0.1) 0%, transparent 60%)" }} />
            </div>
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
                style={{ background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF4D6D] animate-pulse-dot" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Live</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
                style={{ background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <Lock size={9} className="text-[var(--accent-green)]" />
                <span className="text-[10px] text-[var(--text-secondary)]">Encrypted End-to-End</span>
              </div>
            </div>
            <button className="absolute bottom-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <Eye size={13} className="text-white" />
            </button>
            {/* Simulated activity */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <div className="text-[11px] text-white/60 font-mono">
                {child?.current_activity || 'Kids Zone — Activity Feed'}
              </div>
            </div>
          </div>
        </div>

        {/* Haptic Alert Matrix */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-semibold text-white">Haptic Alert Matrix</h3>
            <div className="flex items-center gap-1">
              {[2, 3, 4, 3, 2].map((h, i) => (
                <div key={i} className="w-1 rounded-full bg-[var(--primary)]" style={{ height: h * 4 + "px", opacity: 0.7 }} />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {alertTypes.map((a) => (
              <div key={a.label} className={`flex items-center justify-between p-3 rounded-xl ${
                a.danger ? "border border-[rgba(255,77,109,0.2)] bg-[rgba(255,77,109,0.05)]" : "border border-white/[0.06] bg-white/[0.02]"
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-lg">{a.icon}</span>
                  <div>
                    <p className={`text-[13px] font-medium ${a.danger ? "text-[#FF4D6D]" : "text-white"}`}>{a.label}</p>
                    <p className="text-[10px] text-[var(--text-tertiary)]">{a.desc}</p>
                  </div>
                </div>
                <div className={`toggle-switch ${a.active ? "active" : ""}`}
                  style={a.danger && a.active ? { background: "#FF4D6D", borderColor: "transparent" } : {}} />
              </div>
            ))}
          </div>
        </div>

        {/* Next Family Moment — live from Supabase */}
        <div className="p-5 rounded-2xl text-center"
          style={{ background: "linear-gradient(135deg, #1a2a4a 0%, #0d1929 100%)", border: "1px solid rgba(173,198,255,0.12)" }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ background: "rgba(173,198,255,0.1)", border: "1px solid var(--primary-border)" }}>
            <Clock size={18} className="text-[var(--primary)]" />
          </div>
          <h3 className="text-[16px] font-bold text-white mb-1">Next Family Moment</h3>
          {loading ? (
            <div className="h-4 w-48 mx-auto rounded animate-pulse bg-white/[0.06] mb-4" />
          ) : nextMoment ? (
            <p className="text-[11px] text-[var(--text-secondary)] mb-4">
              Syncing for '{nextMoment.title}' at {nextMoment.location || 'Parallel Park'}.
            </p>
          ) : (
            <p className="text-[11px] text-[var(--text-secondary)] mb-4">No upcoming family moments</p>
          )}
          <div className="flex items-end justify-center gap-1 mb-4">
            {[{ v: countdown.h, l: "HRS" }, { v: countdown.m, l: "MIN" }, { v: countdown.s, l: "SEC" }].map(({ v, l }, i) => (
              <div key={l} className="flex items-end">
                {i > 0 && <span className="text-[2rem] font-bold text-white/40 mx-1 mb-1">:</span>}
                <div className="text-center">
                  <p className="text-[2.5rem] font-bold text-white font-mono leading-none">{fmt(v)}</p>
                  <p className="label-caps mt-1">{l}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-primary w-full flex items-center justify-center gap-2">
            View Itinerary <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
