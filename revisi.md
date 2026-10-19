# ZETTBOS MEMBER HUB — BLUEPRINT & DOKUMENTASI REVISI 91
================================================================================
STATUS         : READY FOR EXECUTION & APPROVED BY USER ("OKE TERAPKAN")
ARSITEK SISTEM : ZettBOT by Zettbos (Universal Product Architect & Lead Engineering Mentor)
FOKUS UTAMA    :
  1. GOOGLE DRIVE VIDEO EMBED SUPPORT (AUTO-DETECTOR YOUTUBE & G-DRIVE)
  2. ZETTGALLERY BRANDING & REMOVAL OF "KARYA" BADGE (GAMBAR 1)
  3. RESTRUCTURED SUBMISSION FORM: HOSTING & DATABASE, DIRECT SUPABASE IMAGE UPLOAD, REMOVE GITHUB (GAMBAR 2)
  4. REMOVAL OF "VERIFIED SHOWCASE" BADGE (GAMBAR 3)
  5. PURGE ALL DUMMY PROJECTS (ZERO DATA PERSISTENCE)
  6. HOSTING & DATABASE FILTER SYSTEM (GAMBAR 4)
  7. CASUAL YET PROFESSIONAL HERO COPYWRITING
  8. ADMIN PROJECT EDITOR MODAL BEFORE/AFTER APPROVAL (KONTROL KURASI PENUH)
  9. GLOBAL UNIFICATION: "ZETTBOS ACADEMY" -> "ZETTBOS"
TANGGAL        : 2026-10-19
TARGET RILIS   : LMS Enterprise Grade v1.9.1 (v91)
================================================================================

## 1. ANALISIS KEBUTUHAN & AKAR MASALAH (ROOT CAUSE ANALYSIS)

### A. Dukungan Embed Video Google Drive (Bebas Ketergantungan YouTube)
- **Kondisi:** Sistem sebelumnya hanya mengekstrak ID video YouTube melalui regex `youtu.be/` atau `youtube.com/watch?v=...`.
- **Kebutuhan:** Pengguna ingin menempelkan link Google Drive secara langsung dan videonya langsung ter-embed di ruang belajar tanpa harus upload ke YouTube.
- **Solusi Arsitektur:**
  - Tambahkan fungsi cerdas `resolveVideoEmbedUrl(url)`:
    - Jika link YouTube -> embed `https://www.youtube-nocookie.com/embed/{id}?rel=0`.
    - Jika link Google Drive (`drive.google.com/file/d/{id}` atau `id={id}`) -> otomatis konversi ke embed preview resmi: `https://drive.google.com/file/d/{id}/preview`.
    - Iframe dipasang di container responsif 16:9 dengan atribut `allow="autoplay; encrypted-media; picture-in-picture"`.

### B. Rebranding ZettShowcase -> ZettGallery & Hapus Badge "KARYA" (Gambar 1)
- **Kondisi:** Tombol pada sidebar drawer bertuliskan `ZettShowcase` dengan badge ungu `KARYA` di sebelah kanan.
- **Solusi:** Ganti nama menjadi **`ZettGallery`** secara menyeluruh (sidebar, navbar breadcrumb, modal title, URL hash) dan hapus badge `KARYA` agar navigasi bersih dan minimalis.

### C. Rombak Form Submit Karya Siswa (Gambar 2)
- **Kondisi:** Form lama meminta URL GitHub (kurang relevan untuk pemula Apps Script/Sheets), Tech Stack umum, dan hanya berupa input URL teks untuk cover screenshot.
- **Solusi:**
  1. Hapus kolom `URL GitHub / Repo`.
  2. Ganti kolom Tech Stack menjadi 2 kolom terpisah:
     - **Hosting** (Contoh: *Google Apps Script, Vercel, Netlify, Cloudflare, GitHub Pages, dll.*).
     - **Database** (Contoh: *Google Sheets, Supabase, Firebase, LocalStorage, dll.*).
  3. Tambahkan fitur **Upload Gambar Langsung ke Supabase Storage**:
     - Pengguna dapat memilih file gambar langsung dari HP/Laptop (`<input type="file" accept="image/*">`).
     - Gambar di-upload ke Supabase Storage Bucket dan public URL-nya otomatis terisi ke data proyek.
     - Disediakan preview thumbnail gambar instan.

### D. Hapus Badge "✅ VERIFIED SHOWCASE" (Gambar 3)
- **Kondisi:** Sudut kiri atas kartu galeri dipadati 2 badge bertumpuk.
- **Solusi:** Hapus badge `✅ VERIFIED SHOWCASE`. Kartu yang sudah approved tampil bersih. Badge `⭐ KARYA PILIHAN` dipertahankan jika admin menjadikannya featured.

### E. Pembersihan Total Data Dummy (Zero Seed Data)
- **Kondisi:** Terdapat data dummy (WarungAI, RecipeBot, AutoWA).
- **Solusi:** Kosongkan `SEED_SHOWCASE_PROJECTS = []`, bersihkan `localStorage.removeItem('zett_showcase_projects')`, dan tampilkan empty state yang estetis.

### F. Filter Berbasis Hosting & Database (Gambar 4)
- **Kondisi:** Filter kategori lama (*Prompting AI, Apps Script, Full-Stack, Gemini, Supabase*) tidak relevan dengan struktur baru.
- **Solusi:** Hadirkan sistem filter ganda yang teratur:
  - **Filter Hosting**: *Semua | Apps Script | Vercel | Netlify | Cloudflare | Lainnya*
  - **Filter Database**: *Semua | Google Sheets | Supabase | Firebase | Lainnya*

### G. Copywriting Hero Santai tapi Profesional
- **Teks Baru:**
  *"Kumpulan web app keren hasil kreasi member Zettbos. Bebas coba live demo-nya, intip inspirasinya, dan pamerin karya buatanmu di sini!"*

### H. Fitur Baru: Admin Showcase Project Editor Modal (Edit Sebelum / Sesudah Approve)
- **Kebutuhan:** Admin ingin bisa mengedit data pengajuan siswa (memperbaiki typo judul, membetulkan hosting/database, mengganti URL demo atau cover) sebelum menyetujui (`approve`) proyek.
- **Solusi Arsitektur:**
  - Tambahkan tombol **`[✏️ Edit]`** pada setiap baris tabel CMS Showcase di Admin Panel.
  - Sediakan modal `modal-admin-edit-showcase` yang memuat form lengkap:
    - Judul Proyek
    - Hosting & Database
    - URL Live Demo
    - URL Cover Image / Upload Cover Baru
    - Deskripsi & Fitur Unggulan
    - Status (`pending` vs `approved`)
    - Unggulan (`is_featured`)
  - Admin dapat menyimpan revisi secara langsung, otomatis tersinkronisasi ke `AppState`, `localStorage`, dan tabel Supabase Cloud `member_showcase`.

### I. Unifikasi Penamaan: "Zettbos Academy" -> "Zettbos"
- Seluruh teks, komentar, dan label dalam sistem yang memuat kata `"Zettbos Academy"` diubah menjadi identitas resmi: `"Zettbos"`.

---

## 2. INVENTARISASI BERKAS YANG DIUBAH

| Berkas | Modifikasi Utama |
|---|---|
| `js/editor.js` | Menambahkan helper `resolveVideoEmbedUrl()` yang mendukung YouTube dan Google Drive embed (`/preview`). |
| `js/controllers/classroom.js` | Mengintegrasikan parser video Google Drive ke pemutar video materi pembelajaran. |
| `index.html` | Mengganti ZettShowcase -> ZettGallery, menghapus badge `KARYA`, memperbarui copywriting hero, merombak form submit (Hosting, Database, Upload Gambar Supabase), menambahkan `modal-admin-edit-showcase`, dan bump cache buster ke `?v=91`. |
| `js/controllers/showcase.js` | Menghapus dummy data, menghapus badge Verified, mengimplementasikan filter Hosting & Database, serta menambahkan handler upload gambar Supabase Storage. |
| `js/controllers/admin.js` | Menambahkan handler edit proyek siswa bagi admin (`openAdminEditShowcaseModal`, `saveAdminEditShowcase`) dan tombol `[✏️ Edit]` pada tabel moderasi. |
| `js/core/router.js` | Update label breadcrumb dan drawer route menjadi `ZettGallery`. |
| Seluruh Proyek | Pembersihan string `Zettbos Academy` menjadi `Zettbos`. |

---

## 3. CHECKLIST VERIFIKASI (QA CRITERIA)
- [x] Link video Google Drive otomatis di-embed menjadi iframe preview dan dapat diputar.
- [x] Nama menu adalah ZettGallery tanpa badge "KARYA".
- [x] Form submit memiliki field Hosting, Database, dan File Upload ke Supabase.
- [x] Kolom GitHub Repo sudah dihapus.
- [x] Badge "VERIFIED SHOWCASE" sudah hilang dari kartu.
- [x] Semua dummy data terhapus (halaman kosong bersih siap diisi).
- [x] Filter Hosting & Database bekerja secara real-time.
- [x] Copywriting hero ramah, santai, dan profesional.
- [x] Admin bisa mengedit proyek siswa sebelum menyetujui.
- [x] Nama "Zettbos Academy" diganti menjadi "Zettbos".
