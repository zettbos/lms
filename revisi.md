# ZETTBOS MEMBER HUB - DOKUMEN REVISI AKTIF (REVISI 47)
================================================================================
STATUS: SUKSES DITERAPKAN (REVISI 47 SELESAI)
ARSITEK SISTEM: ZettBOT by Zettbos (Universal Product Architect & Lead Engineering Mentor)
FOKUS REVISI:
  1. PERAPIHAN TOOLBAR KURIKULUM & HAPUS BULETAN HIJAU LIVE (GAMBAR 1)
  2. DESKTOP PUSH SIDEBAR: DOCKED & SHIFT KONTEN DI LAPTOP (GAMBAR 2)
  3. HAPUS SUB-TEKS "WEB APP AI ACADEMY" DI LOGO NAVBAR (GAMBAR 3)
  4. INTEGRASI TOMBOL "JOIN KELAS" MENUJU LYNK.ID (GAMBAR 4)
  5. HAPUS CHIP PILL TAG "TUTORIAL AI" & "STUDI KASUS" (GAMBAR 5)
  6. UPGRADE SISTEM UX: FLUID PAGE TRANSITIONS & SCROLL REVEAL (SARAN ARSITEK)
================================================================================

## 1. DETAIL ANALISIS MASALAH & RENCANA SOLUSI TEKNIS:

### A. Gambar 1: Perapihan Toolbar Kurikulum & Hapus Buletan Hijau `🟢 [LIVE]`
- **Masalah**:
  1. Deretan tombol aksi di atas dropdown modul (`+ Modul`, `Edit`, `Hapus`, `Pinned`, `Sync`, `Rapikan ID`) tampil bertumpuk tidak beraturan seperti link teks biasa yang berdesakan.
  2. Dropdown modul dan materi memuat emoji `🟢 [LIVE]` yang mengotori teks judul materi dan dianggap berlebihan ("gapenting").
- **Solusi Teknis**:
  * Desain Ulang Toolbar Admin:
    - Membuat **Segmented Micro-Toolbar** dengan tombol-tombol berdesain chip modern (tinggi seragam, border terdefinisi, ikon SVG monoline, dan hover feedback).
    - Memisahkan aksi Primer (`+ Modul` / `+ Materi`), aksi CRUD (`Edit`, `Hapus`, `Pin`), dan utilitas Cloud (`Sync`, `Rapikan ID`) secara rapi dan simetris.
  * Hapus Embel-embel `🟢 [LIVE]`:
    - Di `js/controllers/admin.js`, hilangkan `🟢 [LIVE]` dari pemformatan dropdown modul dan pelajaran. Jika materi bertatus draft, cukup tampilkan `[DRAFT]`. Jika materi sudah dipublikasikan, tampilkan bersih: `MODUL 01: Judul Modul` dan `EP0: Judul Materi`.

---

### B. Gambar 2: Desktop Push Sidebar (Docked & Fluid Content Shift di Layar Laptop)
- **Masalah**:
  Sidebar menu saat ini selalu berperilaku sebagai modal drawer popup dengan backdrop hitam pekat (`bg-black/60`) yang menutup layar penuh di laptop/desktop, menghalangi pandangan pengguna ke konten utama.
- **Solusi Teknis**:
  * Menerapkan pola **Push / Persistent Desktop Sidebar** (standar Notion / Linear / Raycast):
    - Pada layar laptop/desktop (`lg:` / `>= 1024px`):
      1. Sidebar otomatis terbuka di sisi kiri (`w-72` / `288px`), menempel di bawah navbar atau full-height docked.
      2. Backdrop overlay hitam **dinonaktifkan** (`lg:hidden`), sehingga layar utama tetap terlihat jernih dan interaktif.
      3. Konten halaman utama (`main` views) otomatis bergeser dan menyesuaikan lebar (`lg:pl-72` atau transisi margin fluid).
      4. Tombol hamburger di navbar berfungsi sebagai toggle collapse/expand: jika ditutup, sidebar meluncur keluar layar (`-translate-x-full`) dan konten utama melebar penuh secara dinamis (`pl-0`).
    - Pada layar mobile (`< 1024px`):
      Tetap berperilaku sebagai drawer overlay dengan backdrop blur agar nyaman dioperasikan satu tangan pada smartphone.

---

### C. Gambar 3: Hapus Sub-Teks "Web App AI Academy" di Logo Header
- **Masalah**:
  Di samping logo `ZB ZETTBOS MEMBER HUB`, terdapat baris teks kecil kedua: `WEB APP AI ACADEMY` yang membuat header terlihat penuh dan ingin dihilangkan oleh pengguna.
- **Solusi Teknis**:
  * Menghapus elemen `<span class="hidden sm:block text-[10px] text-slate-400 tracking-caps uppercase -mt-0.5 whitespace-nowrap">Web App AI Academy</span>` pada header navbar di `index.html` (baris ~75).
  * Brand logo kini tampil minimalis, tegas, dan eksklusif: `ZB ZETTBOS` dengan badge emerald `MEMBER HUB`.

---

### D. Gambar 4: Tombol "Join Kelas" Otomatis ke Link Lynk.id
- **Masalah**:
  Pengguna menginginkan tombol aksi langsung bagi calon siswa untuk join/membeli kelas yang langsung mengarahkan ke link registrasi:
  `https://lynk.id/zettbos/50nxdkpjmowm`
- **Solusi Teknis**:
  * Menambahkan tombol CTA **"Join Kelas Sekarang"**:
    1. **Di Floating Pill Navbar Landing**: Tombol utama `Join Kelas →` bergradien emerald dengan link langsung ke `https://lynk.id/zettbos/50nxdkpjmowm` (target `_blank`), bersanding elegan dengan tombol sekunder `Masuk Member`.
    2. **Di Hero Section Landing**: Tombol aksi prominent di samping/bawah formulir email dengan teks `Daftar & Join Kelas (Lynk.id) →` agar pengunjung yang siap mendaftar tidak perlu melalui tahapan berbelit.

---

### E. Gambar 5: Hapus Chip Pill Tag "Tutorial AI" & "Studi Kasus"
- **Masalah**:
  Pada kartu preview bento kurikulum di halaman depan, muncul tag buatan seperti `</> Tutorial AI` dan `✨ Studi Kasus` yang tidak diinginkan oleh pengguna.
- **Solusi Teknis**:
  * Di `js/controllers/landing.js`:
    - Mengosongkan kembalian tag di fungsi `getModuleMicroTags()`.
    - Menghilangkan container render chip tag `<div class="flex flex-wrap items-center gap-2 mb-5">` di `renderLandingCurriculumBento()`.
    - Kartu modul kini langsung menampilkan judul, deskripsi, dan silabus materi secara bersih tanpa noise visual tag palsu.

---

### F. Saran Arsitektur UX Premium (Transisi Menu, Perpindahan Section, dan Scroll Halus)
Pengguna meminta rekomendasi untuk membuat UX website terasa hidup, menarik, dan elegan. Berikut rancangan sistem UX kelas dunia yang akan kita terapkan:
1. **View Transition Micro-Animation (`.animate-page-enter`)**:
   - Setiap kali user berpindah halaman (`navigate('home')`, `navigate('learn')`, `navigate('dashboard')`, dll.), halaman baru akan masuk dengan efek *soft entrance fade-and-rise* (`opacity: 0 -> 1`, `translateY(8px) -> 0`, durasi 240ms). Perpindahan antar menu terasa instan namun selembut aplikasi desktop Apple/Linear.
2. **Smooth Kinetic Scroll & Scroll-Padding**:
   - Menambahkan `html { scroll-behavior: smooth; scroll-padding-top: 5.5rem; }` agar saat pengguna mengklik menu anchor di navbar (misal: *Kurikulum Modul*, *Testimoni*), scroll meluncur halus dan berhenti tepat di atas judul tanpa tertabrak floating navbar.
3. **Scroll-Spy Active Navigation**:
   - Menambahkan event listener scroll cerdas di `js/controllers/landing.js` yang secara otomatis menandai link menu di navbar (Beranda, Kurikulum Modul, Target Siswa, Testimoni) sesuai section yang sedang berada di layar pengguna.
4. **Interactive Card Micro-Elevation**:
   - Memberikan transisi hover fisik halus (`transform: translateY(-2px); box-shadow: ...`) pada seluruh kartu kurikulum dan modul tanpa efek neon berlebihan ("Anti-AI Slop Compliant").

---

## 2. FILE YANG AKAN DIUBAH:
1. `index.html`:
   - Redesain toolbar admin di Tier 1 & Tier 2 kurikulum.
   - Hapus sub-teks `Web App AI Academy` di navbar brand.
   - Tambahkan tombol `Join Kelas` (link Lynk.id) di navbar landing & hero section.
   - Konfigurasi wrapper desktop push layout untuk `#sidebar-drawer` dan kontainer konten utama.
   - Bump cache buster ke `?v=47`.
2. `css/style.css`:
   - Aturan layout desktop push sidebar (`lg:pl-72`, transition fluid).
   - Keyframe dan utility class `.animate-page-enter` untuk transisi halaman lembut.
   - Styling segmented micro-toolbar kurikulum admin.
   - Smooth scroll behavior & scroll-padding-top.
3. `js/controllers/admin.js`:
   - Hapus karakter `🟢 [LIVE]` pada generate option select modul dan pelajaran.
4. `js/controllers/landing.js`:
   - Hapus micro-tag pills `Tutorial AI` & `Studi Kasus`.
   - Tambahkan scroll-spy active state untuk navigasi landing.
5. `js/core/router.js`:
   - Integrasikan animasi `.animate-page-enter` saat view berganti.
   - Sesuaikan fungsi toggle sidebar untuk desktop push layout & mobile drawer.

================================================================================
PANDUAN EKSEKUSI: TUNGGU INSTRUKSI "OKE TERAPKAN" DARI PENGGUNA SEBELUM MENGUBAH KODE
================================================================================
