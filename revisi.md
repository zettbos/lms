# ZETTBOS MEMBER HUB - DOKUMEN REVISI AKTIF (REVISI 45)
================================================================================
STATUS: SUKSES DITERAPKAN (REVISI 45 SELESAI)
ARSITEK SISTEM: ZettBOT by Zettbos (Universal Product Architect & Lead Engineering Mentor)
WAKTU EKSEKUSI: 2026-10-13T20:25:00+07:00
FOKUS REVISI: PEMBERSIHAN TOTAL DATA DUMMY HARDCODE DI SELURUH SISTEM LMS
  1. PURGE 5 DOKUMEN DUMMY SHARED RESOURCES (LOCALSTORAGE & CLOUD SUPABASE)
  2. ELIMINASI SELURUH TEKS HARDCODE FALLBACK DI HTML (BERANDA, RUANG BELAJAR, CATALOG)
  3. RESET SELURUH ANGKA STATIS DI TAB DOKUMEN & LINK KE 0
  4. OPTIMALISASI EMPTY STATE DOKUMEN RESOURCE UNTUK ADMIN & SISWA
  5. SINKRONISASI PEMBERSIHAN SUPABASE CLOUD (AUTO-DELETE DUMMY ROWS VIA CLIENT & SQL)
================================================================================

## 1. REALISASI & PERUBAHAN YANG DILAKUKAN:

### A. Auto-Purge 5 Dokumen Dummy Shared Resources
- Di `js/core/state.js`, versi data dinaikkan ke `v45_clean_zero_data`.
- Ditambahkan detektor daftar judul dummy (`DUMMY_RESOURCE_TITLES`):
  1. "Template Google Sheet: Database Web App &..."
  2. "Starter Codebase: Boilerplate Frontend Web Ap..."
  3. "Library Prompt ZettPrompt (Formula Anti-..."
  4. "Google Drive Folder: Asset Gambar, Icon & Slide..."
  5. "Template SOP Revisi 2 Lapis (revisi.md Standar..."
- Saat peramban dibuka oleh siapapun, seluruh 5 dokumen dummy di `localStorage.getItem('zett_resources')` otomatis dibuang dan disetel ke `[]`.
- Di `js/core/supabase.js`, pada fungsi `syncCurriculumFromCloud()`:
  * 5 dokumen dummy disaring agar tidak pernah masuk ke `AppState.resources`.
  * Sistem otomatis mengeksekusi `.delete().in('id', dummyIds)` ke database Supabase Cloud sehingga baris dummy di cloud ikut terhapus permanen.
- Disediakan file query `supabase/clean_dummy_resources.sql` yang siap dijalankan di Supabase SQL Editor.

### B. Pembersihan Teks Hardcode & Angka Statis di HTML (`index.html`)
- Tab counter di Dokumen & Link Resource di-reset dari `(5)`, `(1)`, `(1)`, `(2)`, `(1)` menjadi `(0)`.
- Featured Lesson hero di Beranda:
  * Tag kurikulum diubah dari `"Modul 1: Tutorial Wajib"` menjadi `"Setup Awal Kurikulum"`.
  * Judul diubah dari `"Video Pembelajaran: Membuat Web App dengan Google Apps Script"` menjadi `"Mulai Buat Modul & Materi Pelajaran Pertama"`.
  * Durasi diubah dari `"18 Menit"` menjadi `"0 Menit"`.
  * Label IDE thumbnail diubah dari `"doGet.js"` & `"<GAS WebApp />"` menjadi `"index.html"` & `"<LMS Zettbos />"`.
- Badge katalog modul diubah dari `"5 Modul Lengkap"` menjadi `"0 Modul"`.
- Sub-bar dan judul di Ruang Belajar (`#view-learn`):
  * Badge modul diubah dari `"Modul 1"` menjadi `"-"`.
  * Durasi diubah dari `"18 Menit"` menjadi `"0 Menit"`.
  * Judul materi diubah dari `"Video Pembelajaran: Membuat Web App dengan Google Apps Script"` menjadi `"Materi Pembelajaran"`.
- Nomor telepon palsu `6281234567890` pada link login diganti ke email resmi `mailto:zettbos2025@gmail.com`.
- Link WhatsApp di `SEED_QUICK_ACTIONS` (`mock-data.js`) dibersihkan dari nomor dummy.

### C. Desain Empty State Bersih di Dokumen & Resource Hub (`js/controllers/resources.js`)
- Memperbaiki bug di mana tombol `+ Bagikan Link Dokumen` di header sempat tidak muncul saat dokumen berjumlah 0.
- Jika dokumen berjumlah 0 (`AppState.resources.length === 0`):
  * **Super Admin**: Menampilkan pesan `"Belum Ada Dokumen Dibagikan"` dengan tombol aktif `+ Bagikan Link Dokumen Pertama`.
  * **Member / Siswa**: Menampilkan pesan `"Belum Ada Dokumen Tersedia. Mentor akan segera membagikan template dan resource pendukung kelas di sini."`.
  * **Pencarian 0 Hasil**: Menampilkan `"Dokumen Tidak Ditemukan"`.

### D. Fitur Reset Database Cloud di Panel Admin
- Pada fungsi `resetResourcesToDefault()` (`admin.js`) dan `resetAllDataToZero()` (`state.js`), ditambahkan perintah hapus cloud Supabase (`shared_resources.delete()`) sehingga reset tidak hanya membersihkan peramban lokal tetapi juga membersihkan cloud database.

### E. Cache Buster
- Seluruh script di `index.html` dan `css/style.css` dinaikkan ke versi `?v=45`.

---

## 2. FILE YANG DIUPDATE & DIUJI:
1. `js/core/state.js`: Cache migrasi `v45_clean_zero_data`, purge `zett_resources`, Supabase wipe di `resetAllDataToZero()`.
2. `js/core/supabase.js`: Auto-delete baris dummy dari tabel `shared_resources` Supabase Cloud di `syncCurriculumFromCloud()`.
3. `index.html`: Reset angka tab ke `0`, netralkan fallback Featured Lesson, Ruang Belajar, Catalog, dan bump ke `?v=45`.
4. `js/controllers/resources.js`: Fixed add button toggle & dynamic empty state (Admin vs Siswa).
5. `js/controllers/admin.js`: Cloud delete call pada `resetResourcesToDefault()`.
6. `js/mock-data.js`: Pembersihan fake number di `SEED_QUICK_ACTIONS`.
7. `supabase/clean_dummy_resources.sql`: Query SQL pembersihan manual Supabase Cloud.

================================================================================
SIAP DI-PUSH KE REPOSITORI GITHUB MELALUI TERMINAL ANTIGRAVITY.
================================================================================
