-- ============================================================
-- ParallelEvent™ — Complete Database Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- EVENTS
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  venue TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('scheduled','active','completed','cancelled')),
  total_guests INTEGER DEFAULT 0,
  active_sensors INTEGER DEFAULT 420,
  total_sensors INTEGER DEFAULT 424,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TIMELINE MILESTONES (both adult + kids tracks)
CREATE TABLE IF NOT EXISTS timeline_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  track TEXT NOT NULL CHECK (track IN ('adult','kids')),
  title TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','ready','live','completed')),
  dependency_milestone_id UUID REFERENCES timeline_milestones(id),
  sync_logic TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GUESTS (adults + children)
CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('adult','child')),
  age INTEGER,
  allergies TEXT[],
  interests TEXT[],
  medical_notes TEXT,
  wristband_uid TEXT UNIQUE,
  current_zone TEXT DEFAULT 'main' CHECK (current_zone IN ('main','kids','transit','exit')),
  current_activity TEXT,
  last_checkin TIMESTAMPTZ,
  photo_url TEXT,
  clearance_level TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BIO-LINKS (cryptographic parent-child tethering)
CREATE TABLE IF NOT EXISTS bio_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  child_guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  link_established_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(parent_guest_id, child_guest_id)
);

-- GATE LOG (SACG entry/exit audit trail)
CREATE TABLE IF NOT EXISTS gate_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  wristband_uid TEXT,
  action TEXT NOT NULL CHECK (action IN ('entry','exit','denied','override')),
  gate_id TEXT NOT NULL DEFAULT 'G-12',
  clearance_level TEXT,
  guest_type TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('authorized','denied','pending')),
  authorized_by TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- PROXIMITY ALERTS (real-time breach notifications)
CREATE TABLE IF NOT EXISTS proximity_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  child_guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  parent_guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('proximity_breach','zone_exit','unauthorized','family_moment','system')),
  location TEXT,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','acknowledged','resolved')),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- FAMILY MOMENTS (scheduled reunification intervals)
CREATE TABLE IF NOT EXISTS family_moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 15,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','active','completed')),
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUPPORT TICKETS
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  system_affected TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','critical')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SYSTEM SETTINGS (CEMS configuration store)
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (public read for demo)
-- ============================================================
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bio_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE gate_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE proximity_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Public read policy (anon key can read)
CREATE POLICY "Public read events" ON events FOR SELECT USING (true);
CREATE POLICY "Public read milestones" ON timeline_milestones FOR SELECT USING (true);
CREATE POLICY "Public read guests" ON guests FOR SELECT USING (true);
CREATE POLICY "Public read bio_links" ON bio_links FOR SELECT USING (true);
CREATE POLICY "Public read gate_log" ON gate_log FOR SELECT USING (true);
CREATE POLICY "Public read alerts" ON proximity_alerts FOR SELECT USING (true);
CREATE POLICY "Public read moments" ON family_moments FOR SELECT USING (true);
CREATE POLICY "Public read tickets" ON support_tickets FOR SELECT USING (true);
CREATE POLICY "Public read settings" ON system_settings FOR SELECT USING (true);

-- Public insert/update policy (for demo — in production, restrict to auth roles)
CREATE POLICY "Public insert events" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert milestones" ON timeline_milestones FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert guests" ON guests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert bio_links" ON bio_links FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert gate_log" ON gate_log FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert alerts" ON proximity_alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert moments" ON family_moments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert tickets" ON support_tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert settings" ON system_settings FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update events" ON events FOR UPDATE USING (true);
CREATE POLICY "Public update milestones" ON timeline_milestones FOR UPDATE USING (true);
CREATE POLICY "Public update guests" ON guests FOR UPDATE USING (true);
CREATE POLICY "Public update alerts" ON proximity_alerts FOR UPDATE USING (true);
CREATE POLICY "Public update tickets" ON support_tickets FOR UPDATE USING (true);
CREATE POLICY "Public update settings" ON system_settings FOR UPDATE USING (true);

-- ============================================================
-- REALTIME (enable for live dashboard updates)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE proximity_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE gate_log;
ALTER PUBLICATION supabase_realtime ADD TABLE timeline_milestones;
ALTER PUBLICATION supabase_realtime ADD TABLE guests;
ALTER PUBLICATION supabase_realtime ADD TABLE events;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Insert active event
INSERT INTO events (id, name, venue, start_time, end_time, status, total_guests, active_sensors, total_sensors)
VALUES (
  'a1b2c3d4-0000-0000-0000-000000000001',
  'The Grand Crystal Gala 2026',
  'The Crystal Gate, London',
  NOW() - INTERVAL '2 hours',
  NOW() + INTERVAL '4 hours',
  'active',
  1248,
  420,
  424
) ON CONFLICT DO NOTHING;

-- Insert adult guests
INSERT INTO guests (id, event_id, full_name, type, age, wristband_uid, current_zone, clearance_level, last_checkin)
VALUES
  ('b1000000-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001','Marcus Chen','adult',38,'NFC-MC-001','main','L3EXEC', NOW() - INTERVAL '90 min'),
  ('b1000000-0000-0000-0000-000000000002','a1b2c3d4-0000-0000-0000-000000000001','Sarah Vance','adult',42,'NFC-SV-001','main','L3EXEC', NOW() - INTERVAL '45 min'),
  ('b1000000-0000-0000-0000-000000000003','a1b2c3d4-0000-0000-0000-000000000001','Robert Jenkins','adult',35,'NFC-RJ-001','main','L1', NOW() - INTERVAL '120 min'),
  ('b1000000-0000-0000-0000-000000000004','a1b2c3d4-0000-0000-0000-000000000001','Director Alaric Thorne','adult',45,'NFC-AT-001','main','L9ADMIN', NOW() - INTERVAL '30 min')
ON CONFLICT DO NOTHING;

-- Insert child guests
INSERT INTO guests (id, event_id, full_name, type, age, wristband_uid, current_zone, current_activity, allergies, interests, last_checkin)
VALUES
  ('c1000000-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001','Leo Chen','child',7,'NFC-LC-001','kids','Creative Arts',ARRAY['nuts']::TEXT[],ARRAY['art','stories']::TEXT[], NOW() - INTERVAL '85 min'),
  ('c1000000-0000-0000-0000-000000000002','a1b2c3d4-0000-0000-0000-000000000001','Emma Jenkins','child',9,'NFC-EJ-001','kids','Storytelling',ARRAY['dairy']::TEXT[],ARRAY['books','games']::TEXT[], NOW() - INTERVAL '115 min')
ON CONFLICT DO NOTHING;

-- Insert bio-links
INSERT INTO bio_links (parent_guest_id, child_guest_id, is_active)
VALUES
  ('b1000000-0000-0000-0000-000000000001','c1000000-0000-0000-0000-000000000001',true),
  ('b1000000-0000-0000-0000-000000000003','c1000000-0000-0000-0000-000000000002',true)
ON CONFLICT DO NOTHING;

-- Insert timeline milestones
INSERT INTO timeline_milestones (event_id, track, title, start_time, duration_minutes, status, sync_logic)
VALUES
  ('a1b2c3d4-0000-0000-0000-000000000001','adult','Welcome Speeches', NOW() - INTERVAL '2 hours', 45, 'live', 'Moderate energy — kids can be active'),
  ('a1b2c3d4-0000-0000-0000-000000000001','adult','Gala Dinner Buffet', NOW() + INTERVAL '30 min', 120, 'pending', 'Aligned — both zones dining'),
  ('a1b2c3d4-0000-0000-0000-000000000001','adult','Late Night Dancing', NOW() + INTERVAL '2.5 hours', 90, 'pending', 'Low sync — kids transitioning'),
  ('a1b2c3d4-0000-0000-0000-000000000001','kids','Storytelling Session', NOW() - INTERVAL '90 min', 60, 'completed', 'Critical — immersive story keeps kids quiet'),
  ('a1b2c3d4-0000-0000-0000-000000000001','kids','Movie: Animated Feature', NOW() + INTERVAL '45 min', 90, 'pending', 'Parallel — adult speeches need quiet'),
  ('a1b2c3d4-0000-0000-0000-000000000001','kids','Crafts Workshop', NOW() + INTERVAL '2 hours', 60, 'pending', 'Moderate — creative high energy'),
  ('a1b2c3d4-0000-0000-0000-000000000001','kids','Sleep Zone Active', NOW() + INTERVAL '3 hours', 120, 'pending', 'Low — wind down')
ON CONFLICT DO NOTHING;

-- Insert gate log entries
INSERT INTO gate_log (event_id, guest_id, wristband_uid, action, gate_id, clearance_level, guest_type, status, timestamp)
VALUES
  ('a1b2c3d4-0000-0000-0000-000000000001','b1000000-0000-0000-0000-000000000002','NFC-SV-001','entry','G-12','L3EXEC','STAFF','authorized', NOW() - INTERVAL '45 min'),
  ('a1b2c3d4-0000-0000-0000-000000000001', NULL, 'NFC-UNKNOWN-999','entry','G-12','L0 NULL','GUEST','denied', NOW() - INTERVAL '88 min'),
  ('a1b2c3d4-0000-0000-0000-000000000001','b1000000-0000-0000-0000-000000000003','NFC-RJ-001','entry','G-12','L1','GUEST','pending', NOW() - INTERVAL '120 min')
ON CONFLICT DO NOTHING;

-- Insert proximity alerts
INSERT INTO proximity_alerts (event_id, child_guest_id, parent_guest_id, alert_type, location, severity, status, title, description)
VALUES
  ('a1b2c3d4-0000-0000-0000-000000000001','c1000000-0000-0000-0000-000000000001','b1000000-0000-0000-0000-000000000001','proximity_breach','Kids Zone Access B','critical','active','PROXIMITY BREACH','Unrecognized tag detected in Kids Zone Access B.'),
  ('a1b2c3d4-0000-0000-0000-000000000001','c1000000-0000-0000-0000-000000000001','b1000000-0000-0000-0000-000000000001','family_moment','The Crystal Gate','low','resolved','FAMILY MOMENT','Group ID #924 synced at The Crystal Gate. Capture saved to Parallel Cloud.'),
  ('a1b2c3d4-0000-0000-0000-000000000001','c1000000-0000-0000-0000-000000000002','b1000000-0000-0000-0000-000000000003','system','Main Arena','low','resolved','SYSTEM LOG','Main arena lighting adjusted to Twilight Pulse.')
ON CONFLICT DO NOTHING;

-- Insert family moments
INSERT INTO family_moments (event_id, title, scheduled_at, duration_minutes, status, location)
VALUES
  ('a1b2c3d4-0000-0000-0000-000000000001','Evening Reunion', NOW() + INTERVAL '2h 48min', 20, 'scheduled', 'Parallel Park'),
  ('a1b2c3d4-0000-0000-0000-000000000001','Grand Entrance Sync', NOW() + INTERVAL '1 hour', 10, 'scheduled', 'The Crystal Gate'),
  ('a1b2c3d4-0000-0000-0000-000000000001','Family Photo Session', NOW() + INTERVAL '3 hours', 15, 'scheduled', 'Main Hall')
ON CONFLICT DO NOTHING;

-- Insert support tickets
INSERT INTO support_tickets (ticket_number, subject, system_affected, status, priority, description)
VALUES
  ('#TK-9021','Handshake Timeout Exception','SACG-Terminal','critical','critical','Terminal SACG-02 experiencing repeated TLS handshake timeouts on PMI app connections.'),
  ('#TK-8954','PMI Connectivity Drop (North Sector)','PMI Mobile App','in_progress','high','PMI app users in the north sector of the venue are losing connection to the CEMS realtime feed.'),
  ('#TK-8941','Terminal Authentication Failure','SACG-Terminal','resolved','medium','NFC reader on Gate G-05 was rejecting valid wristbands due to a clock skew issue. Resolved by time sync.')
ON CONFLICT DO NOTHING;

-- Insert system settings
INSERT INTO system_settings (key, value)
VALUES
  ('nfc_reader_sensitivity', '82'),
  ('rfid_range_meters', '4.5'),
  ('hardware_auto_calibration', 'true'),
  ('proximity_breach_mode', '"Strict"'),
  ('bio_link_timeout_seconds', '15'),
  ('webrtc_quality', '"4K/60fps"'),
  ('sync_precision_ms', '0.4'),
  ('ai_activity_mapping', '"Heuristic Pattern Matching (v4.2)"')
ON CONFLICT (key) DO NOTHING;
