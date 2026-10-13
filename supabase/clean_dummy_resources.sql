-- ==============================================================================
-- ZETTBOS LMS - PEMBERSIHAN TOTAL DATA DUMMY HARDCODE
-- supabase/clean_dummy_resources.sql
-- Jalankan query ini di SQL Editor Supabase untuk membersihkan baris dummy
-- ==============================================================================

-- 1. Hapus seluruh data dummy shared resources lama
DELETE FROM public.shared_resources 
WHERE id IN ('RES-01', 'RES-02', 'RES-03', 'RES-04', 'RES-05')
   OR title ILIKE '%Template Google Sheet%'
   OR title ILIKE '%Starter Codebase%'
   OR title ILIKE '%Library Prompt%'
   OR title ILIKE '%Google Drive Folder%'
   OR title ILIKE '%Template SOP Revisi%';

-- 2. Verifikasi isi tabel shared_resources (harus 0 baris jika belum input manual)
SELECT count(*) AS total_clean_resources FROM public.shared_resources;
