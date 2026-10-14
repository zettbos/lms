# ZETTBOS MEMBER HUB - DOKUMEN RENCANA REVISI AKTIF (REVISI 56)
================================================================================
STATUS: SUKSES DITERAPKAN (REVISI 56 SELESAI)
ARSITEK SISTEM: ZettBOT by Zettbos (Universal Product Architect & Lead Engineering Mentor)
HASIL IMPLEMENTASI REVISI 56:
  1. [SELESAI] PENANGANAN RESILIEN SCHEMA-CACHE SUPABASE (AUTO-FALLBACK KE hero._facilities KETIKA KOLOM facilities BELUM TERSEDIA DI DATABASE CLOUD)
  2. [SELESAI] SINKRONISASI CMS SEKARANG 100% SUKSES DAN TANPA ERROR SAMA SEKALI WALAUPUN DATABASE SUPABASE BELUM DI-MIGRASI
  3. [SELESAI] PENYEDIAAN FILE SKRIP MIGRASI SQL RESMI (migration_add_facilities_to_landing_cms.sql) JIKA OWNER INGIN MENAMBAHKAN KOLOM RESMI DI SUPABASE SQL EDITOR
  4. [SELESAI] CACHE BUSTER BUMPED KE ?v=56 DI SELURUH SCRIPT & STYLESHEET
================================================================================

## 1. DETAIL AKAR MASALAH & SOLUSI TEKNIS (REVISI 56):
- **Akar Masalah**:
  - Saat menekan tombol *"Sinkronkan CMS ke Cloud Sekarang"*, Supabase mengembalikan pesan error:
    `Could not find the 'facilities' column of 'landing_cms' in the schema cache`
  - Hal ini terjadi karena tabel `landing_cms` pada database Supabase live pengguna dibuat saat skema awal (yang hanya memiliki kolom `hero`, `use_cases`, `testimonials`), sehingga Supabase menolak field `facilities` yang baru dipisahkan di Revisi 52/53.
- **Solusi Cerdas (Zero-Downtime Auto-Fallback)**:
  - Di `js/core/supabase.js`, fungsi `pushLandingCmsToSupabase` kini menangkap error `facilities` secara otomatis:
    Jika Supabase menolak kolom `facilities`, sistem seketika membungkus data facilities ke dalam objek JSONB `hero._facilities` dan melakukan upsert ulang.
  - Saat membaca data (`pullAllRemoteDataFromSupabase` & `syncCurriculumFromCloud`), sistem secara cerdas membaca:
    `cms.facilities || cms.hero?._facilities || SEED_LANDING_CMS.facilities`.
  - Disediakan juga file migrasi `supabase/migration_add_facilities_to_landing_cms.sql` berisi perintah SQL:
    `ALTER TABLE public.landing_cms ADD COLUMN IF NOT EXISTS facilities JSONB DEFAULT '[]'::jsonb;`
    untuk dijalankan opsional di SQL Editor dashboard Supabase.
