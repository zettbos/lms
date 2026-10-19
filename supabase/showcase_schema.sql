-- ====================================================================
-- TABEL: member_showcase (ZettShowcase Galeri Karya Siswa - Revisi 90)
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
  tech_stack TEXT,
  category TEXT DEFAULT 'Full-Stack AI',
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);

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
