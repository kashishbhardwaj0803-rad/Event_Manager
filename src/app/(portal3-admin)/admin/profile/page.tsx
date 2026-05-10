"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, LogOut, Edit, Save, X, ArrowLeft } from "lucide-react";
import { getUser, signOut } from "@/lib/supabase";
import { getProfile, updateProfile } from "@/lib/database";

export default function AdminProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const user = await getUser();
    if (!user) { router.push("/admin/login"); return; }
    const p = await getProfile(user.id);
    if (!p || p.role !== "admin") { router.push("/admin/login"); return; }
    setProfile(p);
    setEditName(p.full_name ?? "");
    setLoading(false);
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    const user = await getUser(); if (!user) return;
    setSaving(true);
    await updateProfile(user.id, { full_name: editName });
    setProfile((p: any) => ({ ...p, full_name: editName }));
    setEditing(false); setSaving(false);
  };

  const handleLogout = async () => { await signOut(); router.push("/"); };

  if (loading) return <LoadSc />;

  return (
    <div style={{ minHeight: "100vh", background: "#0b0b0e", color: "#fff", fontFamily: "Inter,sans-serif" }}>
      <nav style={navS}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ ...logoI, background: "linear-gradient(135deg,#FF4D6D,#c62a47)" }}><Zap size={16} color="#fff" /></div>
          <span style={{ fontSize: 16, fontWeight: 700 }}>ParallelEvent<sup style={{ fontSize: 8 }}>™</sup></span>
          <span style={{ fontSize: 10, color: "#FF4D6D", marginLeft: 8 }}>ADMIN</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/admin/dashboard" style={ghostBtnS}><ArrowLeft size={13} /> Back to Dashboard</Link>
          <button onClick={handleLogout} style={iconBtnS}><LogOut size={15} /></button>
        </div>
      </nav>

      <main style={{ maxWidth: 640, margin: "0 auto", padding: "60px 24px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 24px 0" }}>Administrator Profile</h1>
        
        <div style={cardS}>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#FF4D6D,#c62a47)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
              {(profile?.full_name ?? "?")[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              {editing ? (
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                  <input value={editName} onChange={e => setEditName(e.target.value)} style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 18, fontWeight: 700, outline: "none", width: 280 }} />
                  <button onClick={handleSave} disabled={saving} style={{ ...ghostBtnS, color: "#FF4D6D", borderColor: "rgba(255,77,109,0.3)" }}><Save size={13} /> {saving ? "…" : "Save"}</button>
                  <button onClick={() => { setEditing(false); setEditName(profile?.full_name ?? ""); }} style={iconBtnS}><X size={14} /></button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{profile?.full_name ?? "Administrator"}</h2>
                  <button onClick={() => setEditing(true)} style={iconBtnS}><Edit size={13} /></button>
                </div>
              )}
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px 0" }}>{profile?.email}</p>
              <div style={{ display: "inline-block", fontSize: 10, background: "rgba(255,77,109,0.1)", color: "#FF4D6D", border: "1px solid rgba(255,77,109,0.25)", padding: "3px 10px", borderRadius: 20 }}>
                SYSTEM ADMINISTRATOR
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function LoadSc() {
  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0b0b0e" }}><p style={{ color: "rgba(255,255,255,0.4)" }}>Loading…</p></div>;
}

const navS: React.CSSProperties = { height: 60, borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", background: "rgba(11,11,14,0.95)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100 };
const logoI: React.CSSProperties = { width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" };
const cardS: React.CSSProperties = { background: "#131318", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 32 };
const ghostBtnS: any = { display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontSize: 12, cursor: "pointer", textDecoration: "none" };
const iconBtnS: any = { width: 32, height: 32, borderRadius: 7, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.6)" };
