-- ====================================================================
-- TABEL: member_showcase (ZettGallery Portofolio Karya Siswa - Revisi 91)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.member_showcase (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  demo_url TEXT NOT NULL,
  repo_url TEXT,
  cover_image TEXT,
  hosting TEXT DEFAULT 'Google Apps Script',
  database TEXT DEFAULT 'Google Sheets',
  tech_stack TEXT,
  category TEXT DEFAULT 'Web App AI',
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);

-- Safe Migration: Tambahkan kolom hosting & database jika tabel sudah ada sebelumnya
ALTER TABLE public.member_showcase ADD COLUMN IF NOT EXISTS hosting TEXT DEFAULT 'Google Apps Script';
ALTER TABLE public.member_showcase ADD COLUMN IF NOT EXISTS database TEXT DEFAULT 'Google Sheets';

-- Enable Row Level Security (RLS)
ALTER TABLE public.member_showcase ENABLE ROW LEVEL SECURITY;

-- 1. Siapapun (Publik & Member) bisa membaca karya yang sudah diapprove
DROP POLICY IF EXISTS "Public Read Approved Showcase" ON public.member_showcase;
CREATE POLICY "Public Read Approved Showcase" ON public.member_showcase
  FOR SELECT USING (true);

-- 2. Member & Admin memiliki akses insert & update
DROP POLICY IF EXISTS "Allow All Access Showcase" ON public.member_showcase;
CREATE POLICY "Allow All Access Showcase" ON public.member_showcase
  FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- SUPABASE STORAGE BUCKET: showcase-covers
-- Jalankan di SQL Editor Supabase untuk mengaktifkan bucket publik
-- ====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('showcase-covers', 'showcase-covers', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy Supabase Storage: Siapa saja bisa view gambar publik
DROP POLICY IF EXISTS "Public View Showcase Covers" ON storage.objects;
CREATE POLICY "Public View Showcase Covers" ON storage.objects
  FOR SELECT USING (bucket_id = 'showcase-covers');

-- Policy Supabase Storage: Siapa saja yang terautentikasi / anon key bisa upload gambar
DROP POLICY IF EXISTS "Allow Upload Showcase Covers" ON storage.objects;
CREATE POLICY "Allow Upload Showcase Covers" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'showcase-covers');
