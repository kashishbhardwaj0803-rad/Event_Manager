// =============================
// DATABASE TYPE DEFINITIONS
// =============================

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      events: { Row: Event; Insert: EventInsert; Update: Partial<EventInsert>; Relationships: [] };
      timeline_milestones: { Row: TimelineMilestone; Insert: TimelineMilestoneInsert; Update: Partial<TimelineMilestoneInsert>; Relationships: [] };
      guests: { Row: Guest; Insert: GuestInsert; Update: Partial<GuestInsert>; Relationships: [] };
      bio_links: { Row: BioLink; Insert: BioLinkInsert; Update: Partial<BioLinkInsert>; Relationships: [] };
      gate_log: { Row: GateLogEntry; Insert: GateLogInsert; Update: Partial<GateLogInsert>; Relationships: [] };
      proximity_alerts: { Row: ProximityAlert; Insert: ProximityAlertInsert; Update: Partial<ProximityAlertInsert>; Relationships: [] };
      family_moments: { Row: FamilyMoment; Insert: FamilyMomentInsert; Update: Partial<FamilyMomentInsert>; Relationships: [] };
      support_tickets: { Row: SupportTicket; Insert: SupportTicketInsert; Update: Partial<SupportTicketInsert>; Relationships: [] };
      system_settings: { Row: SystemSetting; Insert: SystemSettingInsert; Update: Partial<SystemSettingInsert>; Relationships: [] };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

// =============================
// CORE TYPES
// =============================

export interface Event {
  id: string;
  name: string;
  venue: string | null;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  total_guests: number;
  active_sensors: number;
  total_sensors: number;
  created_at: string;
}
export type EventInsert = Omit<Event, 'id' | 'created_at'>;

export interface TimelineMilestone {
  id: string;
  event_id: string;
  track: 'adult' | 'kids';
  title: string;
  start_time: string;
  duration_minutes: number;
  status: 'pending' | 'ready' | 'live' | 'completed';
  dependency_milestone_id: string | null;
  sync_logic: string | null;
  created_at: string;
}
export type TimelineMilestoneInsert = Omit<TimelineMilestone, 'id' | 'created_at'>;

export interface Guest {
  id: string;
  event_id: string;
  full_name: string;
  type: 'adult' | 'child';
  age: number | null;
  allergies: string[] | null;
  interests: string[] | null;
  medical_notes: string | null;
  wristband_uid: string | null;
  current_zone: 'main' | 'kids' | 'transit' | 'exit';
  current_activity: string | null;
  last_checkin: string | null;
  photo_url: string | null;
  clearance_level: string | null;
  created_at: string;
}
export type GuestInsert = Omit<Guest, 'id' | 'created_at'>;

export interface BioLink {
  id: string;
  parent_guest_id: string;
  child_guest_id: string;
  link_established_at: string;
  is_active: boolean;
  parent?: Guest;
  child?: Guest;
}
export type BioLinkInsert = Omit<BioLink, 'id' | 'link_established_at' | 'parent' | 'child'>;

export interface GateLogEntry {
  id: string;
  event_id: string;
  guest_id: string | null;
  wristband_uid: string | null;
  action: 'entry' | 'exit' | 'denied' | 'override';
  gate_id: string;
  clearance_level: string | null;
  guest_type: string | null;
  status: 'authorized' | 'denied' | 'pending';
  authorized_by: string | null;
  timestamp: string;
  guest?: Guest;
}
export type GateLogInsert = Omit<GateLogEntry, 'id' | 'timestamp' | 'guest'>;

export interface ProximityAlert {
  id: string;
  event_id: string;
  child_guest_id: string;
  parent_guest_id: string | null;
  alert_type: 'proximity_breach' | 'zone_exit' | 'unauthorized' | 'family_moment' | 'system';
  location: string | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  title: string;
  description: string | null;
  created_at: string;
  resolved_at: string | null;
}
export type ProximityAlertInsert = Omit<ProximityAlert, 'id' | 'created_at' | 'resolved_at'>;

export interface FamilyMoment {
  id: string;
  event_id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'active' | 'completed';
  location: string | null;
  created_at: string;
}
export type FamilyMomentInsert = Omit<FamilyMoment, 'id' | 'created_at'>;

export interface SupportTicket {
  id: string;
  ticket_number: string;
  subject: string;
  system_affected: string | null;
  status: 'open' | 'in_progress' | 'resolved' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string | null;
  created_at: string;
  updated_at: string;
}
export type SupportTicketInsert = Omit<SupportTicket, 'id' | 'created_at' | 'updated_at'>;

export interface SystemSetting {
  id: string;
  key: string;
  value: Json;
  updated_at: string;
}
export type SystemSettingInsert = Omit<SystemSetting, 'id' | 'updated_at'>;
