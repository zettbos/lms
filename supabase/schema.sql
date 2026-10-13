-- ==============================================================================
-- ZETTBOS MEMBER HUB - SUPABASE POSTGRESQL DATABASE SCHEMA
-- File: supabase/schema.sql
-- Kompatibel penuh dengan GUI Supabase "Table Editor" (Tampilan Mirip Google Sheets)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL WHITELIST MEMBERS (Pendaftar & Hak Akses)
CREATE TABLE IF NOT EXISTS public.whitelist_members (
    id TEXT PRIMARY KEY DEFAULT ('wl-' || floor(extract(epoch from now()) * 1000)::text),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin')),
    is_active BOOLEAN DEFAULT true,
    password_hash TEXT,
    registered_at TIMESTAMPTZ DEFAULT now()
);

-- Idempotent column check if table already exists
ALTER TABLE public.whitelist_members ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 3. TABEL MODUL KURIKULUM (Curriculum Modules)
CREATE TABLE IF NOT EXISTS public.curriculum_modules (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'ai',
    badge TEXT DEFAULT 'MODUL',
    cover_image TEXT,
    order_index INTEGER DEFAULT 1,
    is_locked BOOLEAN DEFAULT false,
    lock_reason TEXT,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Idempotent column check for curriculum_modules
ALTER TABLE public.curriculum_modules ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;

-- 4. TABEL MATERI / VIDEO (Curriculum Lessons & Notion Blocks)
CREATE TABLE IF NOT EXISTS public.curriculum_lessons (
    id TEXT PRIMARY KEY,
    module_id TEXT REFERENCES public.curriculum_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    youtube_url TEXT,
    duration_minutes INTEGER DEFAULT 15,
    order_index INTEGER DEFAULT 1,
    blocks JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. TABEL PROGRES BELAJAR MEMBER (Lesson Progress)
CREATE TABLE IF NOT EXISTS public.member_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    lesson_id TEXT REFERENCES public.curriculum_lessons(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_email, lesson_id)
);

-- 6. TABEL KALENDER AKTIVITAS BELAJAR (Study Activity Heatmap)
CREATE TABLE IF NOT EXISTS public.member_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    study_date DATE NOT NULL,
    lessons_completed_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_email, study_date)
);

-- 7. TABEL ITEM FAVORIT (Saved Lessons, Modules & Code Snippets)
CREATE TABLE IF NOT EXISTS public.member_favorites (
    id TEXT PRIMARY KEY DEFAULT ('fav-' || floor(extract(epoch from now()) * 1000)::text),
    user_email TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('lesson', 'module', 'snippet')),
    target_id TEXT,
    title TEXT NOT NULL,
    subtitle TEXT,
    content TEXT,
    language TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. TABEL DOKUMEN & SHARED RESOURCES (Sheet DB, Prompt, Code)
CREATE TABLE IF NOT EXISTS public.shared_resources (
    id TEXT PRIMARY KEY DEFAULT ('res-' || floor(extract(epoch from now()) * 1000)::text),
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    category TEXT DEFAULT 'sheet' CHECK (category IN ('sheet', 'code', 'prompt', 'drive', 'sop')),
    badge TEXT DEFAULT 'Official Link',
    order_index INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. TABEL CMS DOKUMEN LANDING PAGE (Hero, UseCases, Testimoni)
CREATE TABLE IF NOT EXISTS public.landing_cms (
    id TEXT PRIMARY KEY DEFAULT 'active_cms',
    hero JSONB NOT NULL,
    use_cases JSONB NOT NULL,
    testimonials JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. TABEL QUICK ACTIONS HUB (Kartu Pintas Beranda)
CREATE TABLE IF NOT EXISTS public.quick_actions (
    id TEXT PRIMARY KEY DEFAULT ('qa-' || floor(extract(epoch from now()) * 1000)::text),
    title TEXT NOT NULL,
    subtitle TEXT,
    icon TEXT DEFAULT 'folder',
    badge TEXT DEFAULT 'Akses',
    action_type TEXT DEFAULT 'navigate' CHECK (action_type IN ('navigate', 'url')),
    target TEXT DEFAULT 'home',
    order_index INTEGER DEFAULT 1,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.whitelist_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_cms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_actions ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses Publik Baca (Anonim / Member dapat membaca kurikulum & konten)
DROP POLICY IF EXISTS "Public Read Modules" ON public.curriculum_modules;
CREATE POLICY "Public Read Modules" ON public.curriculum_modules FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Lessons" ON public.curriculum_lessons;
CREATE POLICY "Public Read Lessons" ON public.curriculum_lessons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Resources" ON public.shared_resources;
CREATE POLICY "Public Read Resources" ON public.shared_resources FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Landing CMS" ON public.landing_cms;
CREATE POLICY "Public Read Landing CMS" ON public.landing_cms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Quick Actions" ON public.quick_actions;
CREATE POLICY "Public Read Quick Actions" ON public.quick_actions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Whitelist" ON public.whitelist_members;
CREATE POLICY "Public Read Whitelist" ON public.whitelist_members FOR SELECT USING (true);

-- Kebijakan Member (Baca & Tulis Progres / Favorit sendiri)
DROP POLICY IF EXISTS "Member Manage Progress" ON public.member_progress;
CREATE POLICY "Member Manage Progress" ON public.member_progress FOR ALL USING (true);

DROP POLICY IF EXISTS "Member Manage Activity" ON public.member_activity;
CREATE POLICY "Member Manage Activity" ON public.member_activity FOR ALL USING (true);

DROP POLICY IF EXISTS "Member Manage Favorites" ON public.member_favorites;
CREATE POLICY "Member Manage Favorites" ON public.member_favorites FOR ALL USING (true);

-- Kebijakan Admin/Anon (Untuk demo frontend dan modifikasi CMS & Whitelist)
DROP POLICY IF EXISTS "Public Write Whitelist" ON public.whitelist_members;
CREATE POLICY "Public Write Whitelist" ON public.whitelist_members FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Write Modules" ON public.curriculum_modules;
CREATE POLICY "Public Write Modules" ON public.curriculum_modules FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Write Lessons" ON public.curriculum_lessons;
CREATE POLICY "Public Write Lessons" ON public.curriculum_lessons FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Write CMS" ON public.landing_cms;
CREATE POLICY "Public Write CMS" ON public.landing_cms FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Write Resources" ON public.shared_resources;
CREATE POLICY "Public Write Resources" ON public.shared_resources FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Write Quick Actions" ON public.quick_actions;
CREATE POLICY "Public Write Quick Actions" ON public.quick_actions FOR ALL USING (true);

-- ==============================================================================
-- SEED DATA AWAL (Langsung siap pakai begitu schema ini di-run di Supabase)
-- ==============================================================================

-- Seed Whitelist: Hanya Akun Super Admin Zettbos (zettbos2025@gmail.com) untuk Mulai dari 0
INSERT INTO public.whitelist_members (id, email, full_name, role, is_active, password_hash) VALUES
('owner-1', 'zettbos2025@gmail.com', 'Owner Zettbos (Super Admin)', 'admin', true, NULL)
ON CONFLICT (email) DO UPDATE SET role = 'admin', is_active = true;

