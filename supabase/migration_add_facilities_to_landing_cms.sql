-- ==============================================================================
-- MIGRASI SKEMA SUPABASE: TAMBAH KOLOM FACILITIES PADA TABEL LANDING_CMS
-- Jalankan perintah ini di SQL Editor dashboard Supabase Anda jika ingin membuat
-- kolom 'facilities' resmi mandiri.
-- Catatan: Aplikasi frontend Zettbos kini sudah dilengkapi auto-fallback ke hero._facilities
-- sehingga sinkronisasi tetap 100% berjalan sukses meski script ini belum dijalankan.
-- ==============================================================================

ALTER TABLE public.landing_cms 
ADD COLUMN IF NOT EXISTS facilities JSONB DEFAULT '[]'::jsonb;

-- Pastikan izin baca publik tetap aktif
NOTIFY pgrst, 'reload schema';
