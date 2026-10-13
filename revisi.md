# ZETTBOS MEMBER HUB - DOKUMEN REVISI AKTIF (REVISI 39)
================================================================================
STATUS: SUKSES DITERAPKAN (READY TO PUSH TO GITHUB & VERCEL)
FOKUS: 1. DUAL SAVE MODE: SIMPAN KE SUPABASE (CLOUD LIVE) VS SIMPAN DRAFT (LOKAL)
       2. TOMBOL "SIMPAN DRAFT" & "SIMPAN KE CLOUD" DI TIER 2 EDITOR KURIKULUM
       3. DUAL ACTION BUTTON DI MODAL TAMBAH/EDIT MODUL & MODAL TAMBAH MATERI
       4. INDIKATOR STATUS VISUAL [DRAFT] & [LIVE] DI DROPDOWN & EDITOR BADGE
       5. FILTER SISWA & LANDING: DRAFT TIDAK TAMPIL DI KATALOG SISWA/GUEST
================================================================================

## 1. LATAR BELAKANG & PERMINTAAN USER:
**Instruksi Pengguna:**
> *"gw mau kalau simpan itu = masuk ke supabase, tapi ada juga tombol draft = belum masuk ke supabase"*

### Ekspektasi Alur:
1. **Tombol "Simpan ke Cloud" (Publikasikan):**
   - Modul/materi ditandai sebagai `isDraft: false`.
   - Data otomatis diunggah langsung (upsert) ke tabel Supabase Cloud (`curriculum_modules` / `curriculum_lessons`).
   - Konten detik itu juga LIVE dan dapat diakses oleh semua member/siswa di seluruh perangkat.
2. **Tombol "Simpan Draft" (Draf Lokal):**
   - Modul/materi ditandai sebagai `isDraft: true`.
   - Data disimpan HANYA di `localStorage` browser milik Admin.
   - **TIDAK DIKIRIM KE SUPABASE** (tidak menyentuh cloud sama sekali).
   - Siswa lain dan pengunjung landing page TIDAK BISA melihat modul/materi draf ini.

---

## 2. DETAIL IMPLEMENTASI & PERUBAHAN:

### A. Tier 2 Curriculum Editor Bar (`index.html` & `admin.js`):
1. **Pemisahan Tombol Aksi:**
   - Tombol tunggal sebelumnya dipecah menjadi dua tombol berdampingan:
     - **[Simpan Draft]** (`saveLessonFromEditor(false)`): Warna aksen Amber (`bg-amber-500/10 text-amber-300 border-amber-500/30`), menyimpan perubahan blok Notion & YouTube secara lokal tanpa push ke Supabase.
     - **[Simpan ke Cloud]** (`saveLessonFromEditor(true)`): Warna Emerald Glow (`btn-primary-action`), menyimpan lokal sekaligus melakukan upsert live ke Supabase Cloud `curriculum_lessons`.
2. **Badge Status Interaktif (`#admin-lesson-status-badge`):**
   - Ditambahkan tepat di atas input judul materi:
     - `🟡 DRAFT LOKAL`: jika materi berstatus draf.
     - `🟢 LIVE SUPABASE`: jika materi telah dipublikasikan ke Cloud.

### B. Modal Tambah & Edit Modul (`#modal-manage-module`):
- Footer modal kini memiliki dua opsi submit:
  - **[Simpan Draft]** (`handleSaveModuleSubmit(event, false)`): Menyimpan bab modul dengan `isDraft: true`, tidak dikirim ke Supabase.
  - **[Simpan ke Cloud]** (`handleSaveModuleSubmit(event, true)`): Menyimpan dan langsung mengunggah ke tabel `curriculum_modules` Supabase.

### C. Modal Tambah Materi Baru (`#modal-add-lesson`):
- Footer modal menyediakan dua opsi:
  - **[Simpan Draft]** (`handleSaveAddLessonSubmit(event, false)`): Menambahkan materi ke modul terpilih dengan `isDraft: true` tanpa push ke Supabase.
  - **[Simpan ke Cloud]** (`handleSaveAddLessonSubmit(event, true)`): Menambahkan materi dan langsung mengunggah ke tabel `curriculum_lessons` Supabase.

### D. Indikator Status di Dropdown Panel Admin (`admin.js`):
- Pilihan modul kurikulum (`#admin-module-select`) otomatis diberi label:
  - `🟡 [DRAFT] MODUL 01: Judul Modul`
  - `🟢 [LIVE] MODUL 01: Judul Modul`
- Pilihan materi pembelajaran (`#admin-lesson-select`) otomatis diberi label:
  - `🟡 [DRAFT] Judul Materi`
  - `🟢 [LIVE] Judul Materi`

### E. Perlindungan Privasi Draf untuk Siswa & Guest (`classroom.js` & `landing.js`):
1. **Katalog Modul Siswa (`classroom.js`):**
   - Pengguna non-admin (siswa) hanya melihat modul dan materi berstatus `!mod.isDraft` dan `!l.isDraft`.
2. **Ruang Belajar & Sidebar Silabus (`classroom.js`):**
   - Jika siswa mencoba mengakses link materi yang masih berupa draf, sistem menampilkan peringatan *"Materi ini masih berupa draf dan belum dipublikasikan oleh mentor ke Supabase"* dan mengembalikan ke beranda.
3. **Bento Box Kurikulum di Landing Page (`landing.js`):**
   - Hanya menampilkan modul dan materi resmi yang sudah live di Supabase.

### F. Ketahanan Sinkronisasi Cloud (`supabase.js`):
1. **`syncCurriculumToCloudLive()`**:
   - Hanya mengunggah data yang BUKAN draf (`!m.isDraft` dan `!l.isDraft`). Draf lokal tetap aman di browser admin dan tidak bocor ke cloud.
2. **`syncCurriculumFromCloud()`**:
   - Saat sinkronisasi otomatis dari cloud dijalankan, sistem secara cerdas mempertahankan draf lokal admin yang belum dipublikasikan agar tidak terhapus.

### G. Cache Buster Versi 38:
- Seluruh tag script di [`index.html`](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/index.html) dinaikkan ke `?v=38` agar browser pengguna langsung memuat fitur terbaru tanpa hambatan cache.

================================================================================
SIAP DI-PUSH KE GITHUB & VERCEL VIA TERMINAL
================================================================================
