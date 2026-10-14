# ZETTBOS MEMBER HUB - DOKUMEN REVISI AKTIF (REVISI 51)
================================================================================
STATUS: SUKSES DITERAPKAN (REVISI 51 SELESAI)
ARSITEK SISTEM: ZettBOT by Zettbos (Universal Product Architect & Lead Engineering Mentor)
FOKUS REVISI 51:
  1. DINAMISASI TOMBOL CTA BANNER LANDING SESUAI JUMLAH MODUL NYATA (GAMBAR 1)
  2. INTERACTIVE FEATURE SHOWCASE ALA LYNK.ID DENGAN PREVIEW GAMBAR DINAMIS DI KANAN & FULL CMS CONTROL (GAMBAR 2)
  3. ELIMINASI EMOJI & STANDARISASI IKON MONOLINE SVG PREMIUM UNTUK 5 FASILITAS UTAMA
================================================================================

## 1. DETAIL ANALISIS MASALAH & RENCANA SOLUSI TEKNIS:

### A. Gambar 1: Tombol CTA Banner Landing Dinamis Sesuai Jumlah Modul Nyata
- **Analisis Akar Masalah**:
  - Pada `index.html` baris 381, tombol CTA pada Green Overlap Banner saat ini bertuliskan teks statis yang terkunci: `Lihat 5 Modul Kurikulum`.
  - Ketika Owner menambah modul baru di Panel Admin (misalnya menjadi 6 atau 7 modul) atau menyembunyikan modul draft, angka `5` pada tombol tersebut tidak berubah, menimbulkan inkonsistensi antara teks banner dan kurikulum yang sebenarnya.
- **Solusi Teknis Arsitektur**:
  1. Tambahkan ID unik `#landing-banner-curriculum-count` pada teks tombol CTA banner di `index.html`.
  2. Di `js/controllers/landing.js` pada fungsi `renderLandingPage()`, hitung jumlah modul aktif / terpublikasi secara otomatis:
     ```javascript
     const activeModulesCount = (AppState.modules || []).filter(m => m.isPublished !== false).length;
     const bannerCtaEl = document.getElementById('landing-banner-curriculum-count');
     if (bannerCtaEl) {
       bannerCtaEl.textContent = `Lihat ${activeModulesCount} Modul Kurikulum`;
     }
     ```
  3. Hasil seketika: Angka pada tombol banner akan selalu 100% akurat dan otomatis mengikuti jumlah modul yang ada di database.

---

### B. Gambar 2: Interactive Feature Showcase ala Lynk.id dengan Dynamic Preview di Kanan
- **Analisis Kebutuhan**:
  - Pengguna ingin menghadirkan section pameran fitur & fasilitas interaktif di landing page persis seperti referensi Lynk.id (Gambar 2):
    - **Kolom Kiri**: Grid kartu fasilitas yang bisa diklik. Kartu yang aktif memiliki aksen garis hijau emerald, glowing indicator, dan background aktif.
    - **Kolom Kanan**: Mockup layar perangkat smartphone / device frame modern yang menampilkan gambar/tangkapan layar fitur yang sedang dipilih secara dinamis dengan transisi halus.
  - **5 Fasilitas Resmi Zettbos (Tanpa Emoji, Menggunakan Ikon Monoline SVG)**:
    1. **Akses ZettBOT**:
       - *Kalimat Resmi*: "AI Custom khusus untuk membantu membuat prompt dan koding."
       - *Ikon SVG*: Monoline Robot AI Assistant (`bot`).
       - *Tag*: AI Prompt & Code.
    2. **Zettbos Library**:
       - *Kalimat Resmi*: "Template siap pakai, tinggal modif."
       - *Ikon SVG*: Monoline Starter Library/Template (`library`).
       - *Tag*: Ready-to-Use Templates.
    3. **Modul Video Pembelajaran**:
       - *Kalimat Resmi*: "Materi step-by-step dari nol sampai deploy, bisa dipelajari kapan saja."
       - *Ikon SVG*: Monoline Video Screen/Player (`video`).
       - *Tag*: On-Demand Curriculum.
    4. **Grup Komunitas Premium**:
       - *Kalimat Resmi*: "Bisa tanya dan diskusi langsung dengan mentor dan member lain."
       - *Ikon SVG*: Monoline Community Discussion/Users (`users`).
       - *Tag*: Networking & Support.
    5. **Private Mentoring 1 Bulan**:
       - *Kalimat Resmi*: "Dibimbing sampai bisa bikin sistem sendiri (minimal 1 bulan bimbingan intensif, didampingi penuh hingga aplikasi Anda selesai & live)."
       - *Ikon SVG*: Monoline Direct Target Mentoring (`target`).
       - *Tag*: 1-on-1 VIP Coaching.
- **Dynamic Image Preview di Sisi Kanan**:
  - Setiap kartu menyimpan field `imageUrl`.
  - Jika `imageUrl` diisi (mendukung URL web biasa atau link Google Drive via fungsi `convertGoogleDriveUrl`), layar mockup di kanan langsung menampilkan gambar tersebut dengan rasio proporsional dan animasi fade-in.
  - Jika `imageUrl` masih kosong, sistem otomatis menyajikan tampilan mockup UI vector high-tech kustom untuk masing-masing dari 5 fasilitas tersebut (misalnya terminal ZettBOT, katalog template, player video, chat forum, dan kalender mentoring privat) sehingga halaman selalu terlihat premium tanpa visual kosong.
- **Dukungan Pengaturan Penuh di CMS Admin**:
  - Di Panel Kontrol Owner (`tab-pane-landing_cms`), bagian "Pengelola Fasilitas & Fitur Kelas" disediakan tombol Edit untuk masing-masing dari 5 kartu.
  - Modal Edit (`modal-edit-usecase` yang ditingkatkan) memungkinkan Owner mengubah:
    1. Judul Fasilitas
    2. Kalimat Deskripsi
    3. Link URL Gambar (Support Link Google Drive & Web Image) dengan Live Preview
    4. Pilihan Ikon Monoline SVG
    5. Badge Tag Kategori
  - Perubahan langsung tersimpan di `AppState.landingCms` dan otomatis disinkronkan ke `localStorage` dan Supabase Cloud.

---

## 2. FILE YANG AKAN DIUBAH:
1. `index.html`:
   - Pasang `#landing-banner-curriculum-count` pada tombol CTA banner kurikulum.
   - Perbarui Section 5 di landing page menjadi layout Split Interactive ala Lynk.id (kiri: kartu fasilitas, kanan: mockup smartphone frame dengan layar preview dinamis).
   - Perbarui modal edit CMS di admin panel agar mendukung field URL gambar Google Drive & preview.
   - Naikkan cache buster ke `?v=51`.
2. `js/mock-data.js`:
   - Daftarkan 5 fasilitas resmi Zettbos dengan kalimat presisi tanpa emoji dan ikon SVG bawaan.
3. `js/core/state.js`:
   - Tambahkan varian ikon monoline SVG `bot`, `library`, `video`, `target` pada fungsi `getMonolineSvgIcon()`.
   - Update fallback seed data di `initStorage()`.
4. `js/controllers/landing.js`:
   - Tambahkan logika update dinamis jumlah modul di CTA banner.
   - Implementasikan fungsi `renderLandingFeaturesShowcase()` dan `selectLandingFeaturePreview(featureId)` dengan transisi gambar halus.
5. `js/controllers/admin.js`:
   - Perbarui fungsi render CMS dan handler edit fasilitas kartu agar mendukung input gambar Google Drive.
6. `css/style.css`:
   - Styling frame perangkat smartphone ala Lynk.id (`.feature-device-mockup`), glowing emerald active card, dan transisi preview halus.
7. `prd.md`:
   - Catat detail Revisi 51 ke dalam changelog PRD.

================================================================================
HASIL IMPLEMENTASI REVISI 51 (100% SELESAI):
1. ✅ CTA Banner Landing Dinamis:
   - `#landing-banner-curriculum-count` kini otomatis menampilkan `Lihat ${activeModuleCount} Modul Kurikulum` mengikuti data riil database.
2. ✅ Interactive Feature Showcase ala Lynk.id (Section 5):
   - Grid 5 fasilitas interaktif di kiri dengan animasi glowing emerald `.feature-card-active` saat diklik.
   - Layar smartphone frame mockup di kanan dengan transisi gambar halus `.feature-preview-fade`.
   - Mockup UI vector bawaan beresolusi tinggi jika gambar kosong (Terminal ZettBOT, Template Vault, Video Lesson Player, VIP Lounge, dan VIP Mentorship).
3. ✅ Eliminasi Emoji & Standarisasi Monoline SVG:
   - Akses ZettBOT (`bot`), Zettbos Library (`library`), Modul Video Pembelajaran (`video`), Grup Komunitas Premium (`users`), Private Mentoring 1 Bulan (`target`).
   - Private Mentoring: "Dibimbing sampai bisa bikin sistem sendiri (minimal 1 bulan bimbingan intensif, didampingi penuh hingga aplikasi Anda selesai & live)."
4. ✅ CMS Admin Control Penuh:
   - Mendukung input URL gambar (Google Drive sharing link & web image) dengan live preview dan status badge di admin grid.
5. ✅ Cache buster dinaikkan ke ?v=51 di index.html.
================================================================================
