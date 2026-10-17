-- ==============================================================================
-- ZETTBOS LMS - PERBAIKAN TOTAL ROW LEVEL SECURITY (RLS) REVISI 84
-- Mengembalikan Hak Akses Penuh (Read, Insert, Update, Delete) untuk Client Browser
-- Jalankan script ini 1x di Supabase SQL Editor
-- ==============================================================================

-- 1. TABEL MODUL KURIKULUM (curriculum_modules)
DROP POLICY IF EXISTS "Service Role Manage Modules" ON public.curriculum_modules;
DROP POLICY IF EXISTS "Public Read Modules" ON public.curriculum_modules;
DROP POLICY IF EXISTS "Public Write Modules" ON public.curriculum_modules;
DROP POLICY IF EXISTS "Allow Full Access Modules" ON public.curriculum_modules;

CREATE POLICY "Allow Full Access Modules" ON public.curriculum_modules 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- 2. TABEL MATERI / LESSONS (curriculum_lessons)
DROP POLICY IF EXISTS "Service Role Manage Lessons" ON public.curriculum_lessons;
DROP POLICY IF EXISTS "Public Read Lessons" ON public.curriculum_lessons;
DROP POLICY IF EXISTS "Public Write Lessons" ON public.curriculum_lessons;
DROP POLICY IF EXISTS "Allow Full Access Lessons" ON public.curriculum_lessons;

CREATE POLICY "Allow Full Access Lessons" ON public.curriculum_lessons 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- 3. TABEL CMS LANDING PAGE (landing_cms)
DROP POLICY IF EXISTS "Service Role Manage CMS" ON public.landing_cms;
DROP POLICY IF EXISTS "Public Read Landing CMS" ON public.landing_cms;
DROP POLICY IF EXISTS "Public Write CMS" ON public.landing_cms;
DROP POLICY IF EXISTS "Allow Full Access Landing CMS" ON public.landing_cms;

CREATE POLICY "Allow Full Access Landing CMS" ON public.landing_cms 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- 4. TABEL SHARED RESOURCES / DOKUMEN (shared_resources)
DROP POLICY IF EXISTS "Service Role Manage Resources" ON public.shared_resources;
DROP POLICY IF EXISTS "Public Read Resources" ON public.shared_resources;
DROP POLICY IF EXISTS "Public Write Resources" ON public.shared_resources;
DROP POLICY IF EXISTS "Allow Full Access Resources" ON public.shared_resources;

CREATE POLICY "Allow Full Access Resources" ON public.shared_resources 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- 5. TABEL QUICK ACTIONS (quick_actions)
DROP POLICY IF EXISTS "Service Role Manage Quick Actions" ON public.quick_actions;
DROP POLICY IF EXISTS "Public Read Quick Actions" ON public.quick_actions;
DROP POLICY IF EXISTS "Public Write Quick Actions" ON public.quick_actions;
DROP POLICY IF EXISTS "Allow Full Access Quick Actions" ON public.quick_actions;

CREATE POLICY "Allow Full Access Quick Actions" ON public.quick_actions 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- Verifikasi status RLS: Seluruh 9 tabel operasional sekarang memiliki Full Access
-- whitelist_members (Sudah Full Access)
-- member_progress (Sudah Full Access)
-- member_activity (Sudah Full Access)
-- member_favorites (Sudah Full Access)
-- curriculum_modules (DIPULIHKAN)
-- curriculum_lessons (DIPULIHKAN)
-- landing_cms (DIPULIHKAN)
-- shared_resources (DIPULIHKAN)
-- quick_actions (DIPULIHKAN)
