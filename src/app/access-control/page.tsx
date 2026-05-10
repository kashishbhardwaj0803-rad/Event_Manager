"use client";
import DashboardLayout from "@/components/DashboardLayout";
import { Shield, Search, Lock, Fingerprint } from "lucide-react";
import { useState, useEffect } from "react";
import { getGateLog, getBioLinks, addGateLogEntry, subscribeToGateLog, EVENT_ID } from "@/lib/database";
import type { GateLogEntry, BioLink } from "@/lib/types";

export default function AccessControlPage() {
  const [gateLog, setGateLog] = useState<GateLogEntry[]>([]);
  const [activePairing, setActivePairing] = useState<BioLink | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<'idle' | 'authorized' | 'denied'>('idle');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [log, links] = await Promise.all([getGateLog(10), getBioLinks()]);
      setGateLog(log);
      setActivePairing(links[0] ?? null);
      setLoading(false);
    }
    load();
  }, []);

  // Realtime gate log
  useEffect(() => {
    const sub = subscribeToGateLog((entry) => {
      setGateLog((prev) => [entry, ...prev].slice(0, 10));
    });
    return () => { sub.unsubscribe(); };
  }, []);

  const handleScan = async () => {
    setScanning(true);
    setScanResult('idle');
    await new Promise((r) => setTimeout(r, 2200));
    setScanning(false);
    // Simulate authorized tap
    const result = Math.random() > 0.25 ? 'authorized' : 'denied';
    setScanResult(result);
    // Write to gate_log in Supabase
    await addGateLogEntry({
      event_id: EVENT_ID,
      guest_id: result === 'authorized' ? 'b1000000-0000-0000-0000-000000000001' : null,
      wristband_uid: result === 'authorized' ? 'NFC-MC-001' : 'NFC-UNKNOWN-SIM',
      action: result === 'authorized' ? 'entry' : 'denied',
      gate_id: 'G-12',
      clearance_level: result === 'authorized' ? 'L3EXEC' : 'L0 NULL',
      guest_type: 'GUEST',
      status: result,
      authorized_by: null,
    });
    setTimeout(() => setScanResult('idle'), 3000);
  };

  return (
    <DashboardLayout>
      <div className="p-6 h-[calc(100vh-56px)] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[26px] font-bold text-white">Secure Access Control Gateway</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="dot dot-amber" />
              <p className="text-[12px] font-mono text-[var(--text-secondary)]">Gate G-12 • High Density Protocol Active</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="btn-danger flex items-center gap-2"><Lock size={13} /> Emergency Lockdown</button>
            <button className="btn-ghost flex items-center gap-2">⇄ Sync Events</button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          {/* Left: Scanner + Gate Log */}
          <div className="space-y-4">
            {/* NFC Scanner */}
            <div className="glass-card p-8 flex flex-col items-center justify-center text-center" style={{ minHeight: 280 }}>
              <div className="relative mb-6">
                {scanning && (
                  <>
                    <div className="scanner-ring absolute" style={{ inset: -20, animationDelay: "0s" }} />
                    <div className="scanner-ring absolute" style={{ inset: -20, animationDelay: "0.7s" }} />
                  </>
                )}
                <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${
                  scanResult === 'authorized' ? 'bg-green-500/20 border-green-500/40' :
                  scanResult === 'denied' ? 'bg-red-500/20 border-red-500/40' :
                  'bg-white/[0.05] border-white/[0.08]'
                }`} style={{ border: "1px solid" }}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--glass-border-strong)" }}>
                    {scanResult === 'authorized' ? <span className="text-3xl">✓</span>
                      : scanResult === 'denied' ? <span className="text-3xl text-[#FF4D6D]">✗</span>
                      : <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--text-secondary)]">
                          <rect x="5" y="3" width="14" height="18" rx="2"/><path d="M10 8h4M10 12h4M10 16h4"/>
                        </svg>}
                  </div>
                </div>
              </div>
              <h2 className="text-[20px] font-bold text-white tracking-wide mb-2">
                {scanResult === 'authorized' ? 'ACCESS GRANTED' : scanResult === 'denied' ? 'ACCESS DENIED' : 'TAP TO CHECK-IN'}
              </h2>
              <p className="text-[12px] text-[var(--text-secondary)] max-w-xs leading-relaxed">
                Please bring your Bio-Linked NFC wristband close to the reader for secure gateway authentication.
              </p>
              <div className="flex items-center gap-2 mt-4">
                <div className={`dot ${scanning ? 'dot-amber animate-pulse-dot' : scanResult === 'authorized' ? 'dot-green' : scanResult === 'denied' ? 'dot-red' : 'dot-green'}`} />
                <span className="font-mono text-[10px] text-[var(--text-secondary)] uppercase tracking-widest">
                  {scanning ? 'Scanning...' : scanResult === 'authorized' ? 'Authorized' : scanResult === 'denied' ? 'Rejected' : 'Ready for Input'}
                </span>
              </div>
              <button onClick={handleScan} disabled={scanning} className="btn-primary mt-4 text-[12px] px-6 disabled:opacity-50">
                {scanning ? 'Scanning...' : 'Simulate NFC Tap'}
              </button>
            </div>

            {/* Gate Log */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield size={15} className="text-[var(--primary)]" />
                  <span className="text-[14px] font-semibold text-white">Gate Log: Queue</span>
                </div>
                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                  <input className="input-field pl-8 h-8 text-[11px] w-36" placeholder="Search UUID..." />
                </div>
              </div>
              <table className="data-table">
                <thead>
                  <tr><th>Name</th><th>Clearance</th><th>Type</th><th>Status</th><th>Time</th></tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}>{Array.from({ length: 5 }).map((_, j) => (
                        <td key={j}><div className="h-4 rounded animate-pulse bg-white/[0.06]" /></td>
                      ))}</tr>
                    ))
                    : gateLog.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold"
                              style={{ background: "rgba(255,255,255,0.08)" }}>
                              {(row.guest as any)?.full_name?.split(' ').map((w: string) => w[0]).join('') || '??'}
                            </div>
                            <span className="text-[12px]">{(row.guest as any)?.full_name || 'Unknown Entity'}</span>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-neutral font-mono text-[9px]" style={{
                            color: row.status === 'authorized' ? 'var(--primary)' : row.status === 'denied' ? '#FF4D6D' : 'var(--text-tertiary)'
                          }}>
                            {row.clearance_level || 'L0 NULL'}
                          </span>
                        </td>
                        <td className="text-[11px] text-[var(--text-secondary)] uppercase">{row.guest_type || 'GUEST'}</td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <div className={`dot ${row.status === 'authorized' ? 'dot-green' : row.status === 'denied' ? 'dot-red' : 'dot-gray'}`} />
                            <span className={`text-[10px] font-mono font-semibold ${
                              row.status === 'authorized' ? 'text-[var(--accent-green)]' :
                              row.status === 'denied' ? 'text-[#FF4D6D]' : 'text-[var(--text-secondary)]'
                            }`}>{row.status?.toUpperCase()}</span>
                          </div>
                        </td>
                        <td className="font-mono text-[11px] text-[var(--text-tertiary)]">
                          {new Date(row.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Active Pairing + Staff Override */}
          <div className="space-y-4">
            {/* Active Pairing */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-5">
                <span className="text-[14px] font-semibold text-white uppercase tracking-wide">Active Pairing</span>
                <span className="badge badge-active">Encrypted</span>
              </div>
              {loading ? (
                <div className="flex justify-between gap-4 mb-5">
                  {[1, 2].map((i) => <div key={i} className="flex-1 h-32 rounded-xl animate-pulse bg-white/[0.06]" />)}
                </div>
              ) : activePairing ? (
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-20 h-20 rounded-xl flex items-center justify-center text-[var(--primary)] text-2xl font-bold"
                      style={{ background: "linear-gradient(135deg,#1a2a4a,#0d1929)", border: "1px solid var(--glass-border)" }}>
                      {(activePairing.parent as any)?.full_name?.split(' ').map((w: string) => w[0]).join('')}
                    </div>
                    <div className="text-center">
                      <p className="text-[12px] font-semibold text-white">{(activePairing.parent as any)?.full_name}</p>
                      <p className="font-mono text-[9px] text-[var(--text-tertiary)] uppercase tracking-wider">Primary Guardian</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: "var(--primary-dim)", border: "1px solid var(--primary-border)" }}>
                      <Fingerprint size={14} className="text-[var(--primary)]" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-20 h-20 rounded-xl flex items-center justify-center text-[var(--accent-green)] text-2xl font-bold"
                      style={{ background: "linear-gradient(135deg,#1a3a2a,#0d2919)", border: "1px solid var(--glass-border)" }}>
                      {(activePairing.child as any)?.full_name?.split(' ').map((w: string) => w[0]).join('')}
                    </div>
                    <div className="text-center">
                      <p className="text-[12px] font-semibold text-white">{(activePairing.child as any)?.full_name}</p>
                      <p className="font-mono text-[9px] text-[var(--text-tertiary)] uppercase tracking-wider">Linked Minor</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-[12px] text-[var(--text-tertiary)] text-center py-4">No active pairing</p>
              )}
              <div className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.15)" }}>
                <span className="font-mono text-[11px] text-[var(--text-secondary)] uppercase tracking-wider">Status</span>
                <span className="font-mono text-[11px] font-bold text-[var(--accent-green)] uppercase tracking-wider">Authorized</span>
              </div>
              <div className="progress-bar mt-2">
                <div className="progress-fill progress-fill-green" style={{ width: "100%" }} />
              </div>
            </div>

            {/* Gateway Terminal */}
            <div className="glass-card p-5">
              <p className="label-caps mb-1">Gateway Terminal</p>
              <div className="flex items-center justify-between mb-4">
                <p className="text-[22px] font-bold text-white tracking-wide">SECURED</p>
                <Shield size={22} className="text-[var(--primary)]" />
              </div>
              <div className="pt-4 border-t border-white/[0.06]">
                <p className="text-[14px] font-semibold text-white mb-1">Staff Override</p>
                <p className="text-[11px] text-[var(--text-secondary)] mb-4">Authorized personnel only. Requires bi-modal secondary authentication.</p>
                <p className="label-caps mb-2">Staff PIN</p>
                <div className="flex gap-2 mb-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--glass-border)" }} />
                  ))}
                </div>
                <button className="btn-ghost w-full flex items-center justify-center gap-2 mb-3 text-[12px]">
                  <Fingerprint size={13} className="text-[var(--primary)]" /> Scan Bio-Key to Initiate Override
                </button>
                <button className="btn-ghost w-full flex items-center justify-center gap-2 text-[12px]">
                  <Shield size={13} /> Request 2FA Prompt
                </button>
              </div>
            </div>

            {/* Network Latency */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="label-caps">Network Latency</p>
                <span className="font-mono text-[12px] text-white font-bold">12ms</span>
              </div>
              <div className="flex gap-1 items-end h-8">
                {[3, 5, 4, 8, 6, 9, 7, 5, 8, 10, 7, 12].map((v, i) => (
                  <div key={i} className="flex-1 rounded-sm transition-all"
                    style={{ height: `${(v / 12) * 100}%`, background: v > 10 ? "var(--primary)" : "rgba(173,198,255,0.3)" }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
