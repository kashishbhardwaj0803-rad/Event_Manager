// ============================================================
// TYPE DEFINITIONS — ParallelEvent™
// ============================================================

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'company' | 'attendee' | 'admin';
  avatar_url: string | null;
  created_at: string;
}

export interface Company {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  website: string | null;
  logo_url: string | null;
  created_at: string;
}

export interface Event {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  venue: string | null;
  start_time: string;
  end_time: string;
  capacity: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  cover_image: string | null;
  created_at: string;
  // joined fields
  company?: Company;
  registration_count?: number;
}

export interface Registration {
  id: string;
  event_id: string;
  attendee_id: string;
  status: 'confirmed' | 'cancelled' | 'waitlisted';
  registered_at: string;
  // joined fields
  event?: Event;
  attendee?: Profile;
}

export type CompanyInsert = Omit<Company, 'id' | 'created_at'>;
export type EventInsert = Omit<Event, 'id' | 'created_at' | 'company' | 'registration_count'>;
export type RegistrationInsert = Omit<Registration, 'id' | 'registered_at' | 'event' | 'attendee'>;
