import { supabase } from './supabase';
import type {
  Event, Guest, BioLink, GateLogEntry, GateLogInsert,
  ProximityAlert, ProximityAlertInsert, TimelineMilestone,
  FamilyMoment, SupportTicket, SystemSetting,
} from './types';

// ─── ACTIVE EVENT ───────────────────────────────────────────
export const EVENT_ID = 'a1b2c3d4-0000-0000-0000-000000000001';

export async function getActiveEvent(): Promise<Event | null> {
  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'active')
    .single();
  return data;
}

export async function updateEventStats(totalGuests: number) {
  return supabase
    .from('events')
    .update({ total_guests: totalGuests })
    .eq('id', EVENT_ID);
}

// ─── TIMELINE ────────────────────────────────────────────────
export async function getTimeline(): Promise<TimelineMilestone[]> {
  const { data } = await supabase
    .from('timeline_milestones')
    .select('*')
    .eq('event_id', EVENT_ID)
    .order('start_time', { ascending: true });
  return data ?? [];
}

export async function updateMilestoneStatus(id: string, status: TimelineMilestone['status']) {
  return supabase
    .from('timeline_milestones')
    .update({ status })
    .eq('id', id);
}

// ─── GUESTS ──────────────────────────────────────────────────
export async function getGuests(): Promise<Guest[]> {
  const { data } = await supabase
    .from('guests')
    .select('*')
    .eq('event_id', EVENT_ID)
    .order('created_at', { ascending: true });
  return data ?? [];
}

export async function getGuestsByType(type: 'adult' | 'child'): Promise<Guest[]> {
  const { data } = await supabase
    .from('guests')
    .select('*')
    .eq('event_id', EVENT_ID)
    .eq('type', type);
  return data ?? [];
}

export async function updateGuestZone(guestId: string, zone: Guest['current_zone'], activity?: string) {
  return supabase
    .from('guests')
    .update({ current_zone: zone, current_activity: activity ?? null, last_checkin: new Date().toISOString() })
    .eq('id', guestId);
}

// ─── BIO-LINKS ───────────────────────────────────────────────
export async function getBioLinks(): Promise<BioLink[]> {
  const { data } = await supabase
    .from('bio_links')
    .select(`
      *,
      parent:parent_guest_id ( id, full_name, wristband_uid, photo_url, clearance_level, current_zone ),
      child:child_guest_id ( id, full_name, wristband_uid, current_zone, current_activity, last_checkin, allergies, interests, photo_url )
    `)
    .eq('is_active', true);
  return (data as BioLink[]) ?? [];
}

// ─── GATE LOG ────────────────────────────────────────────────
export async function getGateLog(limit = 20): Promise<GateLogEntry[]> {
  const { data } = await supabase
    .from('gate_log')
    .select(`*, guest:guest_id ( full_name, clearance_level )`)
    .order('timestamp', { ascending: false })
    .limit(limit);
  return (data as GateLogEntry[]) ?? [];
}

export async function addGateLogEntry(entry: GateLogInsert) {
  return supabase.from('gate_log').insert(entry);
}

// ─── PROXIMITY ALERTS ────────────────────────────────────────
export async function getProximityAlerts(status?: ProximityAlert['status']): Promise<ProximityAlert[]> {
  let query = supabase
    .from('proximity_alerts')
    .select('*')
    .eq('event_id', EVENT_ID)
    .order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data } = await query.limit(20);
  return data ?? [];
}

export async function resolveAlert(id: string) {
  return supabase
    .from('proximity_alerts')
    .update({ status: 'resolved', resolved_at: new Date().toISOString() })
    .eq('id', id);
}

export async function acknowledgeAlert(id: string) {
  return supabase
    .from('proximity_alerts')
    .update({ status: 'acknowledged' })
    .eq('id', id);
}

export async function createAlert(alert: ProximityAlertInsert) {
  return supabase.from('proximity_alerts').insert(alert);
}

// ─── FAMILY MOMENTS ──────────────────────────────────────────
export async function getFamilyMoments(): Promise<FamilyMoment[]> {
  const { data } = await supabase
    .from('family_moments')
    .select('*')
    .eq('event_id', EVENT_ID)
    .order('scheduled_at', { ascending: true });
  return data ?? [];
}

export async function getNextFamilyMoment(): Promise<FamilyMoment | null> {
  const { data } = await supabase
    .from('family_moments')
    .select('*')
    .eq('event_id', EVENT_ID)
    .eq('status', 'scheduled')
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(1)
    .single();
  return data;
}

// ─── SUPPORT TICKETS ─────────────────────────────────────────
export async function getSupportTickets(): Promise<SupportTicket[]> {
  const { data } = await supabase
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function updateTicketStatus(id: string, status: SupportTicket['status']) {
  return supabase
    .from('support_tickets')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
}

export async function createTicket(data: Omit<SupportTicket, 'id' | 'created_at' | 'updated_at'>) {
  return supabase.from('support_tickets').insert(data);
}

// ─── SYSTEM SETTINGS ─────────────────────────────────────────
export async function getSystemSettings(): Promise<Record<string, unknown>> {
  const { data } = await supabase.from('system_settings').select('*');
  if (!data) return {};
  return Object.fromEntries(data.map((s: SystemSetting) => [s.key, s.value]));
}

export async function updateSystemSetting(key: string, value: unknown) {
  return supabase
    .from('system_settings')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', key);
}

// ─── REALTIME SUBSCRIPTIONS ──────────────────────────────────
export function subscribeToAlerts(callback: (alert: ProximityAlert) => void) {
  return supabase
    .channel('proximity_alerts_live')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'proximity_alerts' },
      (payload) => callback(payload.new as ProximityAlert))
    .subscribe();
}

export function subscribeToGateLog(callback: (entry: GateLogEntry) => void) {
  return supabase
    .channel('gate_log_live')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gate_log' },
      (payload) => callback(payload.new as GateLogEntry))
    .subscribe();
}

export function subscribeToGuestUpdates(callback: (guest: Guest) => void) {
  return supabase
    .channel('guests_live')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'guests' },
      (payload) => callback(payload.new as Guest))
    .subscribe();
}

export function subscribeToMilestones(callback: (milestone: TimelineMilestone) => void) {
  return supabase
    .channel('milestones_live')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'timeline_milestones' },
      (payload) => callback(payload.new as TimelineMilestone))
    .subscribe();
}
