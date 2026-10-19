-- ==============================================================================
-- ZETTBOS LMS - SOLUSI ERROR: shared_resources_category_check
-- File: supabase/fix_shared_resources_constraint.sql
-- ==============================================================================
--
-- MASALAH:
-- Tabel shared_resources di Supabase memiliki CHECK CONSTRAINT lama yang membatasi
-- kolom category hanya boleh bernilai ('sheet', 'code', 'prompt', 'drive', 'sop').
-- Saat Admin membuat Folder Dinamis (misal: 'ZettBOT', 'ZettPrompt', 'Modul', dll),
-- Supabase menolak baris data tersebut dengan error:
-- "new row for relation "shared_resources" violates check constraint "shared_resources_category_check""
--
-- SOLUSI:
-- Jalankan 1 baris SQL di bawah ini di Supabase SQL Editor:

ALTER TABLE public.shared_resources DROP CONSTRAINT IF EXISTS shared_resources_category_check;

-- Verifikasi: Pastikan constraint sudah terhapus
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'public.shared_resources'::regclass;
