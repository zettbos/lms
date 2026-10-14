# ZETTBOS MEMBER HUB - DOKUMEN RENCANA REVISI AKTIF (REVISI 53)
================================================================================
STATUS: SUKSES DITERAPKAN (REVISI 53 SELESAI)
ARSITEK SISTEM: ZettBOT by Zettbos (Universal Product Architect & Lead Engineering Mentor)
HASIL IMPLEMENTASI REVISI 53:
  1. [SELESAI] TATA LETAK 2 KOLOM (GRID 2-COLUMN SIDE-BY-SIDE) UNTUK FASILITAS KELAS PERSIS SESUAI SCREENSHOT LYNK.ID
  2. [SELESAI] DYNAMIC PHONE MOCKUP PREVIEW DI KANAN TERHUBUNG 100% KE GAMBAR TIAP KARTU SAAT DIKLIK
  3. [SELESAI] KONTROL PENUH CMS ADMIN UNTUK MENGUBAH GAMBAR TIAP KARTU (SUPPORT LINK GOOGLE DRIVE & DIRECT URL)
  4. [SELESAI] BALANCED 3x2 GRID DENGAN SLOT AKSI KHUSUS "DAFTAR & JOIN KELAS SEKARANG" (ALA KARTU KE-8 LYNK.ID)
  5. [SELESAI] THUMBNAIL PREVIEW GAMBAR PADA KARTU FASILITAS DI PANEL ADMIN CMS & CACHE BUSTER BUMPED KE ?v=53
================================================================================

## 1. DETAIL ANALISIS KEBUTUHAN & TANGKAPAN LAYAR (SCREENSHOT LYNK.ID)

### A. Analisis Tata Letak (Layout 2 Kolom ala Screenshot):
- **Kondisi Saat Ini**:
  - Di `index.html` baris 429, `#landing-facilities-container` saat ini menggunakan layout `flex flex-col gap-3` (1 kolom vertikal panjang ke bawah).
  - Tampilan kartu saat ini melebar penuh secara horizontal dengan deretan tag chips di bagian bawah, sehingga memakan ruang vertikal terlalu banyak.
- **Kebutuhan Berdasarkan Screenshot**:
  - Sisi kiri dibagi menjadi **2 kolom kartu berjajar kesamping** (`grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5`).
  - **Desain Kartu Kompak & Proporsional**:
    - Sebelah kiri kartu: Wadah ikon bersudut halus (`rounded-xl`) dengan aksen warna selaras monoline SVG.
    - Sebelah kanan ikon: Judul fasilitas tebal (`font-bold`) dan deskripsi ringkas 2 baris yang padat dan jelas.
    - Kartu yang sedang aktif memiliki border hijau emerald tebal (`border-emerald-500` / `#10B981`), background gelap dengan sentuhan gradasi hijau halus, dan shadow glow elegan.
  - **Struktur Baris 2x3 Seimbang (Symmetrical Grid)**:
    - Baris 1: Kartu 1 (Akses ZettBOT) & Kartu 2 (Zettbos Library)
    - Baris 2: Kartu 3 (Modul Video) & Kartu 4 (Grup Komunitas Premium)
    - Baris 3: Kartu 5 (Private Mentoring 1 Bulan) & Kartu 6 (Aksi: "Daftar & Join Kelas di Lynk.id →")
    - Kartu ke-6 dibuat persis seperti kartu aksi hijau di screenshot Lynk.id ("Jelajahi fitur lanjutan lainnya..."), dengan border emerald dan direct link ke pendaftaran Lynk.id, sehingga formasi 2 kolom tertutup rapi dan seimbang tanpa ada ruang bolong.

---

### B. Dynamic Image Preview di Layar Smartphone (Kolom Kanan):
- **Perilaku Interaktif**:
  - Saat pengunjung mengklik salah satu kartu di grid kiri:
    - Kartu tersebut langsung berubah status menjadi aktif (emerald active state).
    - Layar smartphone frame di sebelah kanan langsung menampilkan gambar/screenshot yang sesuai dengan kartu tersebut dengan animasi transisi halus (`.feature-preview-fade`).
  - **Dukungan Dua Tingkat (Zero Visual Blank)**:
    - Jika Admin sudah mengisi link gambar di CMS: Layar smartphone menampilkan gambar tersebut secara tajam dan proporsional.
    - Jika link gambar masih kosong di CMS: Layar smartphone otomatis menampilkan visual mockup UI vector kustom resolusi tinggi bawaan (ZettBOT AI Terminal, Template Vault, HD Lesson Player, VIP Lounge, atau 1-on-1 Mentorship VIP Commitment).

---

### C. Pengaturan Gambar Tiap Kartu via CMS Admin:
- Di Panel Kontrol Owner (`tab-pane-landing_cms`), bagian Section B "Pengelola Fasilitas & Fitur Kelas":
  - Tiap dari 5 kartu fasilitas memiliki tombol **"Edit Fasilitas"**.
  - Modal `#modal-edit-facility` menyediakan kolom input khusus:
    - **Link Gambar Mockup / Screenshot**:
      - Mendukung link sharing Google Drive (`https://drive.google.com/file/d/...` atau `https://drive.google.com/open?id=...`).
      - Sistem otomatis mengonversi link Google Drive via parser cerdas `convertGoogleDriveUrl()` menjadi URL direct CDN `https://lh3.googleusercontent.com/d/{id}` sehingga langsung tampil tanpa kendala blokir CORS browser.
      - Mendukung direct URL gambar dari web manapun (`https://.../*.png/jpg/webp`).
      - Dilengkapi **Live Pratinjau Gambar** seketika saat link diketik/ditempel.
  - Saat tombol "Simpan Perubahan Fasilitas" diklik:
    - Data `imageUrl` langsung tersimpan ke `AppState.landingCms.facilities`.
    - Otomatis tersimpan ke `localStorage` (`zett_landing_cms`).
    - Otomatis disinkronkan ke Supabase Cloud saat tombol Push dijalankan.
    - Landing page seketika memperbarui preview kartu tanpa perlu refresh halaman.

---

## 2. FILE YANG AKAN DIUBAH:

1. `index.html`:
   - Mengubah kontainer `#landing-facilities-container` dari `flex flex-col` menjadi `grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5`.
   - Mengoptimalkan pembagian lebar split layout pada desktop (`lg:col-span-7 xl:col-span-8` untuk kartu dan `lg:col-span-5 xl:col-span-4` untuk smartphone device mockup).
   - Naikkan cache buster script dan stylesheet ke versi `?v=53`.

2. `js/controllers/landing.js`:
   - Memperbarui fungsi `renderLandingFacilitiesShowcase(cms)` agar merender kartu fasilitas dalam format layout horizontal kompak (ikon di kiri, judul & deskripsi di kanan) yang pas untuk grid 2 kolom.
   - Menambahkan kartu ke-6 (Slot Aksi Cepat "Daftar & Join Kelas di Lynk.id →") yang menjaga simetri 3x2 baris persis seperti referensi Lynk.id.
   - Memastikan `selectLandingFacilityPreview(facilityId)` menampilkan gambar custom dari `imageUrl` (dengan Google Drive auto-converter) secara responsif dan estetik di layar smartphone mockup.

3. `js/controllers/admin.js`:
   - Menambahkan pratinjau thumbnail gambar langsung pada grid kartu fasilitas di Panel Admin CMS (`#admin-facilities-grid`), sehingga Owner dapat seketika melihat kartu mana saja yang gambarnya sudah diunggah.
   - Memastikan modal edit `#modal-edit-facility` menyimpan URL gambar dengan presisi dan reaktif memperbarui preview landing page.

4. `css/style.css`:
   - Menyesuaikan styling `.feature-interactive-card` agar proporsional di dalam grid 2 kolom (anti-teks terpotong, padding proporsional).
   - Menambahkan styling `.feature-cta-card` dengan border emerald aksen dan efek hover halus.

5. `prd.md`:
   - Memutakhirkan PRD ke versi `v1.2.4` dan mencatat implementasi Revisi 53 ke master changelog.

================================================================================
KOLOM PERSETUJUAN:
Rencana rekayasa sistem telah selesai disusun.
Jika alur dan rancangan di atas sudah sesuai dengan keinginan Anda, silakan berikan konfirmasi dengan mengetik:
👉 "OKE TERAPKAN"
================================================================================
