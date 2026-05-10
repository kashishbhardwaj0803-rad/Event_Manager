-- ============================================================
-- ParallelEvent™ — Complete Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── DROP OLD TABLES (clean slate) ───────────────────────────
DROP TABLE IF EXISTS public.favorites CASCADE;
DROP TABLE IF EXISTS public.registrations CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Also drop old CEMS tables if they exist from previous schema
DROP TABLE IF EXISTS public.bio_links CASCADE;
DROP TABLE IF EXISTS public.gate_log CASCADE;
DROP TABLE IF EXISTS public.proximity_alerts CASCADE;
DROP TABLE IF EXISTS public.family_moments CASCADE;
DROP TABLE IF EXISTS public.support_tickets CASCADE;
DROP TABLE IF EXISTS public.system_settings CASCADE;
DROP TABLE IF EXISTS public.guests CASCADE;
DROP TABLE IF EXISTS public.timeline_milestones CASCADE;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── PROFILES (linked to auth.users) ─────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('company', 'attendee', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── ADMIN HELPER FUNCTION ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── COMPANIES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    website TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── EVENTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    venue TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    capacity INTEGER DEFAULT 100,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
    cover_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── REGISTRATIONS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    attendee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'waitlisted')),
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, attendee_id)
);

-- ── FAVORITES (Bookmarks) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    attendee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, attendee_id)
);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- profiles: users can read/update their own profile
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;
CREATE POLICY "profiles_delete" ON public.profiles FOR DELETE USING (auth.uid() = id OR public.is_admin(auth.uid()));

-- companies: anyone can read; owner or admin can insert/update/delete
DROP POLICY IF EXISTS "companies_select" ON public.companies;
CREATE POLICY "companies_select" ON public.companies FOR SELECT USING (true);

DROP POLICY IF EXISTS "companies_insert" ON public.companies;
CREATE POLICY "companies_insert" ON public.companies FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND (auth.uid() = owner_id OR public.is_admin(auth.uid()))
);

DROP POLICY IF EXISTS "companies_update" ON public.companies;
CREATE POLICY "companies_update" ON public.companies FOR UPDATE USING (auth.uid() = owner_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "companies_delete" ON public.companies;
CREATE POLICY "companies_delete" ON public.companies FOR DELETE USING (auth.uid() = owner_id OR public.is_admin(auth.uid()));

-- events: anyone can read; company owner or admin can insert/update/delete
DROP POLICY IF EXISTS "events_select" ON public.events;
CREATE POLICY "events_select" ON public.events FOR SELECT USING (true);

DROP POLICY IF EXISTS "events_insert" ON public.events;
CREATE POLICY "events_insert" ON public.events FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND owner_id = auth.uid()) OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "events_update" ON public.events;
CREATE POLICY "events_update" ON public.events FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND owner_id = auth.uid()) OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "events_delete" ON public.events;
CREATE POLICY "events_delete" ON public.events FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND owner_id = auth.uid()) OR public.is_admin(auth.uid())
);

-- registrations: user can read own; owner can read; admin can read/update/delete
DROP POLICY IF EXISTS "registrations_select" ON public.registrations;
CREATE POLICY "registrations_select" ON public.registrations FOR SELECT USING (
    auth.uid() = attendee_id OR
    EXISTS (SELECT 1 FROM public.events e JOIN public.companies c ON e.company_id = c.id WHERE e.id = event_id AND c.owner_id = auth.uid()) OR
    public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "registrations_insert" ON public.registrations;
CREATE POLICY "registrations_insert" ON public.registrations FOR INSERT WITH CHECK (
    auth.uid() = attendee_id OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "registrations_delete" ON public.registrations;
CREATE POLICY "registrations_delete" ON public.registrations FOR DELETE USING (
    auth.uid() = attendee_id OR 
    EXISTS (SELECT 1 FROM public.events e JOIN public.companies c ON e.company_id = c.id WHERE e.id = event_id AND c.owner_id = auth.uid()) OR
    public.is_admin(auth.uid())
);

-- favorites: user can read/write own; admin can read/write
DROP POLICY IF EXISTS "favorites_select" ON public.favorites;
CREATE POLICY "favorites_select" ON public.favorites FOR SELECT USING (
    auth.uid() = attendee_id OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "favorites_insert" ON public.favorites;
CREATE POLICY "favorites_insert" ON public.favorites FOR INSERT WITH CHECK (
    auth.uid() = attendee_id OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "favorites_delete" ON public.favorites;
CREATE POLICY "favorites_delete" ON public.favorites FOR DELETE USING (
    auth.uid() = attendee_id OR public.is_admin(auth.uid())
);


-- ── TRIGGER: auto-create profile on user signup ──────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        COALESCE(NEW.raw_user_meta_data->>'role', 'attendee')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── ADMIN USER SETUP ─────────────────────────────────────────
-- After running this, create an admin user in Supabase Dashboard → Authentication → Users
-- Then run this to set their role:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
