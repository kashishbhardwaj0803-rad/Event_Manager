// ============================================================
// DATABASE — ParallelEvent™
// ============================================================
import { supabase } from './supabase';
import type { Profile, Company, Event, Registration, CompanyInsert, EventInsert } from './types';

// ── PROFILES ─────────────────────────────────────────────────
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
  return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  return supabase.from('profiles').update(updates).eq('id', userId);
}

export async function getAllProfiles(): Promise<Profile[]> {
  const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  return data ?? [];
}

export async function updateUserRole(userId: string, role: 'company' | 'attendee' | 'admin') {
  return supabase.from('profiles').update({ role }).eq('id', userId);
}


// ── COMPANIES ─────────────────────────────────────────────────
export async function getMyCompany(ownerId: string): Promise<Company | null> {
  const { data } = await supabase.from('companies').select('*').eq('owner_id', ownerId).single();
  return data;
}

export async function createCompany(company: CompanyInsert): Promise<Company | null> {
  const { data, error } = await supabase.from('companies').insert(company).select().single();
  if (error) throw error;
  return data;
}

export async function updateCompany(id: string, updates: Partial<Company>) {
  return supabase.from('companies').update(updates).eq('id', id);
}

export async function getAllCompanies(): Promise<Company[]> {
  const { data } = await supabase.from('companies').select('*').order('created_at', { ascending: false });
  return data ?? [];
}

// ── EVENTS ────────────────────────────────────────────────────
export async function createEvent(event: EventInsert): Promise<Event> {
  const { data, error } = await supabase.from('events').insert(event).select().single();
  if (error) throw error;
  return data;
}

export async function getEventsByCompany(companyId: string): Promise<Event[]> {
  const { data } = await supabase
    .from('events')
    .select('*, registrations(count)')
    .eq('company_id', companyId)
    .order('start_time', { ascending: true });
  return (data ?? []).map((e: any) => ({ ...e, registration_count: e.registrations?.[0]?.count ?? 0 }));
}

export async function getAllEvents(): Promise<Event[]> {
  const { data } = await supabase
    .from('events')
    .select('*, company:companies(name, logo_url), registrations(count)')
    .neq('status', 'cancelled')
    .order('start_time', { ascending: true });
  return (data ?? []).map((e: any) => ({ ...e, registration_count: e.registrations?.[0]?.count ?? 0 }));
}

export async function getEventById(id: string): Promise<Event | null> {
  const { data } = await supabase
    .from('events')
    .select('*, company:companies(name, logo_url), registrations(count)')
    .eq('id', id)
    .single();
  if (!data) return null;
  return { ...data, registration_count: (data as any).registrations?.[0]?.count ?? 0 };
}

export async function updateEvent(id: string, updates: Partial<Event>) {
  return supabase.from('events').update(updates).eq('id', id);
}

export async function deleteEvent(id: string) {
  return supabase.from('events').delete().eq('id', id);
}

// ── REGISTRATIONS ─────────────────────────────────────────────
export async function registerForEvent(eventId: string, attendeeId: string): Promise<Registration> {
  const { data, error } = await supabase
    .from('registrations')
    .insert({ event_id: eventId, attendee_id: attendeeId, status: 'confirmed' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function cancelRegistration(eventId: string, attendeeId: string) {
  return supabase.from('registrations').delete().eq('event_id', eventId).eq('attendee_id', attendeeId);
}

export async function getMyRegistrations(attendeeId: string): Promise<Registration[]> {
  const { data } = await supabase
    .from('registrations')
    .select('*, event:events(*, company:companies(name, logo_url))')
    .eq('attendee_id', attendeeId)
    .order('registered_at', { ascending: false });
  return data ?? [];
}

export async function isRegistered(eventId: string, attendeeId: string): Promise<boolean> {
  const { data } = await supabase
    .from('registrations')
    .select('id')
    .eq('event_id', eventId)
    .eq('attendee_id', attendeeId)
    .maybeSingle();
  return !!data;
}

export async function getEventRegistrations(eventId: string): Promise<Registration[]> {
  const { data } = await supabase
    .from('registrations')
    .select('*, attendee:profiles(full_name, email, avatar_url)')
    .eq('event_id', eventId)
    .order('registered_at', { ascending: false });
  return data ?? [];
}

// ── ADMIN ─────────────────────────────────────────────────────
export async function getAllRegistrations(): Promise<Registration[]> {
  const { data } = await supabase
    .from('registrations')
    .select('*, event:events(name, venue, start_time, company_id), attendee:profiles(full_name, email)')
    .order('registered_at', { ascending: false });
  return data ?? [];
}

export async function getAdminStats() {
  const [events, companies, registrations, profiles] = await Promise.all([
    supabase.from('events').select('id, status', { count: 'exact' }),
    supabase.from('companies').select('id', { count: 'exact' }),
    supabase.from('registrations').select('id', { count: 'exact' }),
    supabase.from('profiles').select('id, role'),
  ]);
  return {
    totalEvents: events.count ?? 0,
    totalCompanies: companies.count ?? 0,
    totalRegistrations: registrations.count ?? 0,
    totalAttendees: profiles.data?.filter((p: any) => p.role === 'attendee').length ?? 0,
    totalCompanyUsers: profiles.data?.filter((p: any) => p.role === 'company').length ?? 0,
    eventsByStatus: {
      scheduled: events.data?.filter((e: any) => e.status === 'scheduled').length ?? 0,
      active: events.data?.filter((e: any) => e.status === 'active').length ?? 0,
      completed: events.data?.filter((e: any) => e.status === 'completed').length ?? 0,
      cancelled: events.data?.filter((e: any) => e.status === 'cancelled').length ?? 0,
    },
  };
}

// ── ANALYTICS ─────────────────────────────────────────────────

/** Get registration counts per day for the last N days */
export async function getRegistrationsByDay(days = 7): Promise<{ date: string; count: number }[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data } = await supabase
    .from('registrations')
    .select('registered_at')
    .gte('registered_at', since.toISOString());

  // Group by date client-side
  const counts: Record<string, number> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    counts[d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })] = 0;
  }
  (data ?? []).forEach((r: any) => {
    const label = new Date(r.registered_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (label in counts) counts[label]++;
  });
  return Object.entries(counts).map(([date, count]) => ({ date, count }));
}

/** Get registration counts per day for a company's events */
export async function getCompanyRegistrationsByDay(companyId: string, days = 7): Promise<{ date: string; count: number }[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data } = await supabase
    .from('registrations')
    .select('registered_at, event:events!inner(company_id)')
    .eq('event.company_id', companyId)
    .gte('registered_at', since.toISOString());

  const counts: Record<string, number> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    counts[d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })] = 0;
  }
  (data ?? []).forEach((r: any) => {
    const label = new Date(r.registered_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (label in counts) counts[label]++;
  });
  return Object.entries(counts).map(([date, count]) => ({ date, count }));
}

/** Get capacity fill % per event (for company) */
export async function getEventCapacityData(companyId: string): Promise<{ name: string; filled: number; capacity: number; pct: number }[]> {
  const events = await getEventsByCompany(companyId);
  return events.slice(0, 8).map(e => ({
    name: e.name.length > 20 ? e.name.slice(0, 18) + '…' : e.name,
    filled: e.registration_count ?? 0,
    capacity: e.capacity,
    pct: Math.round(((e.registration_count ?? 0) / e.capacity) * 100),
  }));
}

/** Events created per company for admin bar chart */
export async function getEventCountByCompany(): Promise<{ name: string; events: number }[]> {
  const { data } = await supabase
    .from('events')
    .select('company_id, company:companies(name)');
  const counts: Record<string, { name: string; events: number }> = {};
  (data ?? []).forEach((e: any) => {
    const id = e.company_id;
    if (!counts[id]) counts[id] = { name: e.company?.name ?? 'Unknown', events: 0 };
    counts[id].events++;
  });
  return Object.values(counts).sort((a, b) => b.events - a.events).slice(0, 8);
}

/** Registrations per event for admin table */
export async function getAllEventsWithCounts(): Promise<Event[]> {
  const { data } = await supabase
    .from('events')
    .select('*, company:companies(name, logo_url), registrations(count)')
    .order('created_at', { ascending: false });
  return (data ?? []).map((e: any) => ({ ...e, registration_count: e.registrations?.[0]?.count ?? 0 }));
}

// ── ADVANCED ADMIN FUNCTIONS ──────────────────────────────────
export async function adminDeleteCompany(companyId: string) {
  return supabase.from('companies').delete().eq('id', companyId);
}

export async function adminDeleteEvent(eventId: string) {
  return supabase.from('events').delete().eq('id', eventId);
}

export async function adminCancelRegistration(regId: string) {
  return supabase.from('registrations').delete().eq('id', regId);
}

export async function adminDeleteUser(userId: string) {
  return supabase.from('profiles').delete().eq('id', userId);
}

// ── COMPANY ADVANCED FUNCTIONS ──────────────────────────────
export async function companyKickAttendee(regId: string) {
  return supabase.from('registrations').delete().eq('id', regId);
}

export async function duplicateEvent(eventId: string): Promise<Event> {
  const ev = await getEventById(eventId);
  if (!ev) throw new Error("Event not found");
  
  const { id, created_at, company, registrations, registration_count, ...eventData } = ev as any;
  eventData.name = `${eventData.name} (Copy)`;
  eventData.status = 'scheduled';
  
  const { data, error } = await supabase.from('events').insert(eventData).select().single();
  if (error) throw error;
  return data;
}

// ── ATTENDEE FAVORITES ──────────────────────────────────────
export async function toggleFavoriteEvent(eventId: string, attendeeId: string) {
  const { data: existing } = await supabase.from('favorites').select('id').eq('event_id', eventId).eq('attendee_id', attendeeId).maybeSingle();
  if (existing) {
    return supabase.from('favorites').delete().eq('id', existing.id);
  } else {
    return supabase.from('favorites').insert({ event_id: eventId, attendee_id: attendeeId });
  }
}

export async function getFavoriteEvents(attendeeId: string): Promise<any[]> {
  const { data } = await supabase
    .from('favorites')
    .select('*, event:events(*, company:companies(name, logo_url))')
    .eq('attendee_id', attendeeId)
    .order('created_at', { ascending: false });
  return data ?? [];
}
