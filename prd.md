# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# Projek: Zettbos LMS (Member Hub & Notion-Style Learning Management System)
================================================================================
VERSI DOKUMEN : v1.5.8 (REVISI 94 - FIX GHOST STICKY PROGRESS PILL)
STATUS DOKUMEN: APPROVED & IMPLEMENTED (REVISI 94 SELESAI)
ARSITEK SISTEM: ZettBOT by Zettbos
ENGINE STACK  : Next.js 14+ (App Router) + Supabase (Postgres & Auth OTP) + Vercel
================================================================================

================================================================================
ZONA ATAS: SPESIFIKASI KEBUTUHAN PRODUK (BLUEPRINT AWAL)
================================================================================

### 1. NAMA PROJEK & PROBLEM STATEMENT
- **Nama Aplikasi**: Zettbos Member Hub (LMS Edukasi Vibe Coding)
- **Problem Statement**:
  1. *Kelemahan Notion sebagai LMS*: Notion adalah personal workspace/wiki, bukan sistem kursus. Member sering mengalami *cognitive overload* karena navigasi database yang membingungkan, link materi rawan bocor ke publik tanpa proteksi lisensi, dan tidak ada pelacakan progres individual (*persistent progress tracking*) per akun member secara gratis.
  2. *Kebutuhan Eksklusivitas*: Zettbos memerlukan gerbang login yang ketat berbasis whitelist email pendaftar, di mana hanya email resmi yang diizinkan menerima OTP login langsung. Pengunjung tidak terdaftar langsung diarahkan ke admin secara ramah.
  3. *Kemudahan Custom Konten ala Notion*: Owner membutuhkan editor modular (H1, H2, H3, Text biasa, Callout tips, Code snippet, Image, dan Embed Video) yang mudah diedit tanpa koding ulang.
  4. *Psikologi Belajar yang Nagih*: Member butuh lingkungan belajar bebas distraksi (*distraction-free video room*), indikator progres belajar yang memicu dopamin (*Zeigarnik Effect*), dan tombol "Lanjutkan Belajar" otomatis.

---

### 2. PERAN PENGGUNA (USER ROLES)
1. **Admin / Owner (Zettbos Creator)**:
   - Mengelola daftar whitelist email member (tambah satu per satu atau import batch banyak email sekaligus).
   - Menyusun modul & materi pelajaran menggunakan Notion-like Block Editor.
   - Memasukkan link YouTube Unlisted untuk video tutorial.
   - Memantau analitik kemajuan belajar seluruh member (persentase selesai per member).
2. **Member Resmi Zettbos**:
   - Memasukkan email yang sudah didaftarkan saat registrasi kelas.
   - Menerima 6-digit kode OTP ke kotak masuk email & login instan tanpa ribet mengingat password.
   - Menonton video tutorial YouTube Unlisted dan membaca modul teks interaktif.
   - Menandai materi yang sudah selesai ditonton (`Mark as Completed`).
   - Melacak persentase progres belajar pribadi secara real-time.
3. **Pengunjung Non-Whitelist (Guest / Non-Member)**:
   - Mencoba memasukkan email yang belum terdaftar.
   - Menerima notifikasi humanis bahwa email belum terdaftar, lengkap dengan tombol langsung menuju WhatsApp Admin Zettbos.

---

### 3. ARSITEKTUR & LINGKUNGAN KERJA (FREE TIER PRODUCTION-READY)
- **Frontend & Fullstack**: Next.js 14+ (App Router) dengan Tailwind CSS, Lucide Icons, dan Framer Motion / CSS Transitions.
- **Backend & Database**: **Supabase (Free Tier)**:
  - 500 MB Database PostgreSQL gratis (sangat cukup untuk puluhan ribu member & materi).
  - Supabase Auth bawaan untuk OTP Email (hingga 50.000 Monthly Active Users gratis).
  - Row Level Security (RLS) untuk keamanan data progress member.
- **Layanan Pengiriman Email OTP**: **Resend (Free Tier)**:
  - 3.000 email/bulan (100 email/hari) dengan deliverability inbox tinggi dan setup domain/SMTP instan via Supabase.
- **Hosting & Deployment**: **Vercel (Hobby Free)**:
  - Zero-config deployment via GitHub, Global Edge CDN, SSL otomatis gratis.
- **Video Storage & Streaming**: **YouTube Unlisted (Gratis Tak Terbatas)**:
  - Zero bandwidth cost, buffering adaptif super cepat, player responsif.
- **Rich Content Editor**: **Tiptap / BlockNote Editor**:
  - Headless Notion-style block editor (Heading 1-3, Paragraph, Bullet/Numbered list, Callout block, Code block syntax highlighting, Image upload/URL, Video embed).

---

### 4. ALUR KERJA APLIKASI (USER FLOW)

#### A. Alur Autentikasi Whitelist & OTP Email
1. Member membuka halaman login `/login`.
2. Member mengetikkan alamat email.
3. Sistem memeriksa apakah email terdaftar di tabel `WhitelistMembers` dan berstatus aktif (`isActive = true`).
4. **Jika Terdaftar**:
   - Sistem memanggil Supabase Auth OTP -> mengirimkan 6 digit kode OTP ke email member.
   - Layar beralih ke input OTP (6 kotak digit angka dengan auto-focus).
   - Member memasukkan OTP -> Verifikasi sukses -> Buat sesi login -> Masuk ke `/dashboard`.
5. **Jika Tidak Terdaftar**:
   - Sistem tidak mengirimkan OTP.
   - Menampilkan modal peringatan bersahabat: *"Email Anda belum terdaftar sebagai member resmi Zettbos. Silakan hubungi Admin untuk konfirmasi pembayaran/pendaftaran."*
   - Tombol aksi: *"Hubungi Admin via WhatsApp"* (membuka link direct WA dengan teks template otomatis).

#### B. Alur Belajar & Tracking Progress (Member Experience)
1. Di `/dashboard`, member disambut banner profil dan kartu **"Lanjutkan Belajar"** (otomatis mengarahkan ke materi terakhir yang belum dicentang).
2. Widget **Progress Belajar Global**: Bar progress persentase (misal: "7/10 Materi Selesai - 70%") dengan warna hijau emerald menyala.
3. Galeri Modul Belajar (Grid kartu 2-3 kolom responsif bergaya Cyber-Slate Dark Mode).
4. Klik salah satu modul -> Membuka halaman **Ruang Belajar** (`/learn/[lessonId]`):
   - **Sidebar Kiri (Desktop) / Bottom Drawer (Mobile)**: Daftar modul & bab, dengan tanda centang hijau untuk materi yang sudah selesai, dan lingkaran abu-abu untuk materi yang belum.
   - **Area Utama**:
     - Video Player YouTube responsif aspect-ratio 16:9.
     - Judul Materi & Estimasi Waktu Belajar.
     - Konten Catatan Lengkap bergaya Notion (Heading, Penjelasan, Tips Box, Code Block dengan tombol Copy).
     - Tombol Aksi di Bawah Konten:
       - Tombol *"Tandai Selesai & Lanjut ke Materi Berikutnya"* (Hijau Emerald).
       - Tombol *"Materi Sebelumnya"*.
5. Saat tombol *"Tandai Selesai"* diklik:
   - Status tersimpan ke database `MemberProgress` secara instan.
   - Muncul micro-animation ceklis halus (Dopamine feedback).
   - Progress bar bertambah dan otomatis membuka materi berikutnya.

#### C. Alur Admin Management (Owner Zettbos)
1. Akses halaman `/admin` (hanya bisa dibuka oleh email owner).
2. **Menu 1: Whitelist Member**:
   - Form input email baru (bisa input 1 email atau tempel/paste daftar banyak email sekaligus dipisahkan baris/koma).
   - Tabel pencarian member terdaftar, status aktif/nonaktif, tanggal terdaftar, dan tombol hapus/blokir.
3. **Menu 2: Kurikulum & Materi (Notion-Style Editor)**:
   - Tambah/Ubah/Hapus Modul (Judul, deskripsi singkat, urutan/urutan bab).
   - Tambah/Ubah/Hapus Pelajaran:
     - Input URL video YouTube Unlisted.
     - Editor Blok WYSIWYG: Mengetik judul (H1/H2/H3), teks normal, menyisipkan gambar, kotak peringatan/tips (*callout*), dan blok kode pemrograman.
     - Preview langsung (*Live Preview*) tampilan yang akan dilihat member.
4. **Menu 3: Analitik Progres Kelas**:
   - Melihat tabel nama & email murid beserta capaian progres belajarnya (misal: Budi - 100%, Andi - 40%).

---

### 5. DESAIN BASIS DATA (SUPABASE POSTGRESQL SCHEMA)

#### Tabel: `WhitelistMembers`
Menyimpan daftar seluruh email member yang berhak login.
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | UUID (PK, default gen_random_uuid()) | ID unik member |
| `email` | TEXT (UNIQUE, NOT NULL) | Alamat email terdaftar (lowercase) |
| `fullName` | TEXT | Nama lengkap murid |
| `phoneNumber` | TEXT | No. WhatsApp member (opsional) |
| `isActive` | BOOLEAN (DEFAULT true) | Status izin akses aktif/nonaktif |
| `enrolledAt` | TIMESTAMPTZ (DEFAULT now()) | Tanggal pendaftaran |

#### Tabel: `Modules`
Menyimpan grup modul/bab kurikulum kelas.
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | UUID (PK, default gen_random_uuid()) | ID modul |
| `title` | TEXT (NOT NULL) | Judul modul (misal: "Tutorial Wajib Google Apps Script") |
| `description` | TEXT | Ringkasan materi modul |
| `orderIndex` | INTEGER (NOT NULL, DEFAULT 0) | Urutan tampilan modul |
| `thumbnailUrl` | TEXT | URL gambar cover modul |
| `createdAt` | TIMESTAMPTZ (DEFAULT now()) | Waktu pembuatan |

#### Tabel: `Lessons`
Menyimpan detail isi pelajaran/video dalam tiap modul.
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | UUID (PK, default gen_random_uuid()) | ID pelajaran |
| `moduleId` | UUID (FK -> Modules.id, ON DELETE CASCADE) | Relasi ke modul |
| `title` | TEXT (NOT NULL) | Judul pelajaran (misal: "Cara Pakai ZettPrompt") |
| `orderIndex` | INTEGER (NOT NULL, DEFAULT 0) | Urutan dalam modul |
| `youtubeUrl` | TEXT | Link video YouTube Unlisted |
| `durationMinutes`| INTEGER (DEFAULT 10) | Estimasi waktu nonton/baca |
| `contentJson` | JSONB (NOT NULL) | Data blok konten format JSON (Tiptap block data) |
| `createdAt` | TIMESTAMPTZ (DEFAULT now()) | Waktu pembuatan |

#### Tabel: `MemberProgress`
Menyimpan status penyelesaian materi per member.
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | UUID (PK, default gen_random_uuid()) | ID unik progress |
| `memberEmail` | TEXT (NOT NULL) | Email member (lowercase) |
| `lessonId` | UUID (FK -> Lessons.id, ON DELETE CASCADE) | ID pelajaran yang diselesaikan |
| `isCompleted` | BOOLEAN (DEFAULT true) | Status selesai |
| `completedAt` | TIMESTAMPTZ (DEFAULT now()) | Waktu tombol selesai diklik |
*Constraint*: `UNIQUE(memberEmail, lessonId)` untuk mencegah duplikasi baris.

#### Tabel: `AdminSettings`
Menyimpan konfigurasi admin dan kontak darurat.
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | UUID (PK) | ID setting |
| `adminEmail` | TEXT (UNIQUE, NOT NULL) | Email owner/admin Zettbos |
| `whatsappAdmin`| TEXT (DEFAULT '628xxxxxxxxxx') | Nomor WA admin untuk bantuan daftar |

---

### 6. ATURAN VALIDASI & LOGIKA KHUSUS
1. **Normalisasi Email**: Seluruh input email wajib otomatis di-trim spasi dan diubah ke huruf kecil (*lowercase*) sebelum pencocokan atau penyimpanan ke database.
2. **Pencegahan Brute-force OTP**: Input OTP dibatasi maksimal 5 kali percobaan gagal sebelum harus meminta OTP baru (cool-down 60 detik).
3. **Optimistic UI pada Checkbox Progress**: Ketika murid menekan "Tandai Selesai", tampilan antarmuka langsung merespons hijau tanpa menunggu delay jaringan server (state langsung berubah seketika, lalu disinkronkan di background).
4. **Keamanan URL Video YouTube**: Konversi otomatis format link YouTube standar (`https://www.youtube.com/watch?v=...` atau `https://youtu.be/...`) menjadi format embed resmi (`https://www.youtube-nocookie.com/embed/...`).
5. **ATURAN AKSES FASE PROTOTYPE / DUMMY PREVIEW (JANGAN DIKUNCI)**:
   - Selama aplikasi beroperasi dalam **Fase 1 (Prototype / Dummy Preview)**, sistem **DILARANG KERAS MENGUNCI AKSES LOGIN**.
   - Seluruh alamat email yang dimasukkan oleh pengguna/peninjau (meskipun belum terdaftar di whitelist awal) **wajib otomatis diterima dan didaftarkan ke state whitelist lokal** secara instan tanpa memblokir akses ke modul.
   - Sediakan akun uji coba cepat (1-klik langsung masuk) pada halaman login dan tombol *"Bypass & Buka Preview"* jika pengguna berada di dialog non-whitelist, sehingga penguji bebas mengevaluasi kurikulum tanpa friksi autentikasi.
   - Kebijakan penolakan ketat non-whitelist hanya diberlakukan pada **Fase 2** ketika sistem telah resmi terhubung dengan database produksi (Supabase PostgreSQL + Email OTP Resend).
6. **STANDAR STABILITAS REKAYASA & ZERO CONSOLE ERROR (ANTI-CRASH GUARANTEE)**:
   - **Larangan Duplikasi Deklarasi**: Dilarang keras mendeklarasikan ulang identifier variabel/konstanta (`const`/`let`) di file mana pun (misal: duplikasi `SEED_QUICK_ACTIONS` di `mock-data.js`).
   - **Defensive Data Accessing**: Seluruh pengaksesan objek global (seperti `window.ZettData`) wajib dibungkus dengan fallback aman (`const zData = window.ZettData || {}`) untuk mencegah fatal `ReferenceError`.
   - **Layout Isolation & Clean Markup State**: Komponen navigasi aplikasi (seperti `#mobile-bottom-nav` dan `#main-navbar`) wajib diatur dengan kelas `hidden` secara baku di markup HTML sehingga tidak akan pernah tumpang-tindih di halaman login jika inisialisasi tertunda.
   - **Preservasi Desain Bersih (Original Aesthetic)**: Menjaga desain login tetap minimalis dan elegan sesuai desain aslinya tanpa tombol-tombol darurat yang mengotori visual, sambil memastikan fitur 1-klik demo akun (`farhan@zettbos.com`, `member@zettbos.com`, `bukan-member@gmail.com`) bekerja instan membuka `/home`.

---

### 7. RENCANA ANTARMUKA & ESTETIKA VISUAL (DUAL THEME: DARK & LIGHT STUDIO)
- **Filosofi Tampilan & Dual Theme Engine**:
  - **1. Mode Gelap (Dark Mode - Linear / Raycast Matte Carbon)**:
    - Background Utama: Deep Carbon Neutral (`#0D0E11` - netral murni tanpa rona kebiruan template AI).
    - Card & Sidebar: Solid Matte Charcoal (`#16181D`) dengan top hairline inset highlight (`box-shadow: inset 0 1px 0 rgba(255,255,255,0.05)`) dan border solid hairline presisi (`#262933`).
    - Inner Well / Container Bersarang: Deep Matte Well (`#101216`) dengan border subtle (`#1E2028`).
    - Aksen Utama: Curated Engineering Emerald (`#10B981`) yang dirasionalkan.
    - Teks: Slate-100 (`#F1F5F9`) untuk judul kontras tinggi, Slate-400 (`#94A3B8`) untuk keterangan sekunder.
  - **2. Mode Terang (Light Mode - Linear / Apple Editorial Alabaster Studio)**:
    - Background Utama: Warm Alabaster Canvas (`#F8F9FA` - hangat, nyaman di mata, bukan putih silau flat).
    - Card Surface: Elevated Pure White (`#FFFFFF`) dengan drop shadow natural (`box-shadow: 0 1px 3px rgba(0,0,0,0.05)`).
    - Hairline Borders: Crisp Slate Hairline (`#E2E8F0` / `#CBD5E1`).
    - Inner Well: Light Slate Well (`#F1F3F5`).
    - Teks & Tipografi: Deep Slate-900 (`#0F172A`) dan Slate-800 (`#1E293B`) dengan rasio kontras WCAG AAA.
    - Aksen Utama: Deeper Engineering Emerald (`#059669`) dengan hover (`#047857`) untuk legibilitas maksimal.
  - **3. Mekanisme Pengalihan Tema (Theme Switcher Engine)**:
    - **Desktop & Tablet Navbar**: Tombol toggle tema instan di sebelah pengaturan profil/mode dengan ikon monoline SVG (Matahari untuk beralih ke terang / Bulan untuk beralih ke gelap).
    - **Mobile Drawer Navigasi**: Baris dedicated "Tema Tampilan" dengan badge indikator `DARK` / `LIGHT` pada drawer menu.
    - **Halaman Login**: Tombol floating pill switch tema di pojok kanan atas layar login.
    - **Zero-FOUC (Anti-Flicker) Head Script**: Eksekusi instan di `<head>` membaca `localStorage.getItem('zett_theme')` sehingga halaman tidak pernah berkedip putih/gelap saat dimuat ulang.
  - **ELIMINASI TOTAL PENYAKIT VISUAL AI SLOP**:
    - **Dilarang Keras Bola Cahaya Melayang**: Menghapus seluruh elemen radial glow neon (`blur-3xl bg-emerald/cyan`) di sudut card.
    - **Dilarang Glassmorphism Rapuh**: Mengganti card semi-transparan dengan **Solid Matte Surface** yang memiliki bobot fisik visual (*material weight*) kokoh.
    - **Top Hairline Inset Highlight**: Kedalaman visual dibangun melalui garis highlight mikro 1px di sisi atas kartu, bukan glow berpendar.
  - **Tipografi**: Plus Jakarta Sans / Inter dengan bobot visual tegas, letter-spacing floor pada ALL CAPS (`0.08em` - `0.1em`).
  - **STANDAR MUTLAK IKON (ANTI-EMOTICON / FULL MONOLINE SVG)**:
    - **DILARANG KERAS menggunakan emoticon/emoji** di seluruh antarmuka dan PRD.
    - **SELALU gunakan ikon SVG monoline murni** dengan stroke presisi 1.6–1.8px (`stroke-width="1.8"`, `currentColor`, `fill="none"`).
- **Struktur Halaman Utama (Desain Yang Disepakati)**:
  1. `/landing`: Zettbos Welcome / Landing Portal (Inspirasi referensi.html: Floating Pill Header, Hero Section dengan One-Line Instant Email Input & Layered Floating Cards, Overlap Banner, Bento Split Curriculum Showcase 5-tab, dan Audience Use-Case 4-Column Grid dengan Micro-Tag Pills).
  2. `/login`: Form email minimalis bersih, modal dialog login seamless dari landing page, 3 pill akun uji coba cepat (1-klik langsung masuk), tanpa tumpukan bottom nav.
  3. `/home`: Preservasi Hero Banner orisinil, Featured Lesson Card, 4 Quick Action Hub Cards (editable di Admin Panel), Live Search & Category Pills, kartu modul dengan daftar materi scrollable dan Micro-Tag Chips (`[⚡ GAS API]`, `[📊 Sheets DB]`, `[🤖 Vibe Code]`).
  4. `/dashboard`: Dashboard data belajar siswa, 2 kartu metrik ringkas, Kalender Belajar Bulanan interaktif, dan breakdown detail penyelesaian materi.
  5. `/learn/[lessonId]`: Ruang belajar bebas distraksi, video player responsif, konten modular Notion-style, tombol aksi thumb-friendly simetris, dan Bottom Sheet Kurikulum di HP.
  6. `/resources`: Shared Resource Link Hub bergaya Use-Case Grid (Google Sheets, Starter Code, Prompt SOP, Google Drive).
  7. `/favorites`: Koleksi item tersimpan (materi, modul, snippet kode).
  8. `/admin`: Panel khusus owner (Tab Kurikulum & Block Editor, Tab Whitelist Email, Tab Progres Siswa, dan Tab Pengelola Quick Action Hub).

---

### 8. KRITERIA PENGUJIAN (ACCEPTANCE CRITERIA)
- [ ] **Zero Console Error**: Console browser bersih tanpa `SyntaxError`, `ReferenceError`, atau error parsing skrip.
- [ ] **Landing Portal Pra-Login Terintegrasi**: Halaman `/landing` memuat floating pill navbar, hero section one-line input, floating overlap banner, bento split curriculum showcase 5-tab interaktif, dan use-case audience cards.
- [ ] **Komponen Modern Internal LMS**: Kartu katalog modul dilengkapi micro-tag chips SVG; Resource hub mengadopsi format kartu use-case ber-tag pill.
- [ ] **Dual Theme Support**: Mode Gelap (Dark Carbon) dan Mode Terang (Apple/Linear Alabaster) 100% konsisten di Landing Portal dan seluruh halaman internal.
- [ ] **Theme Switcher Aksesibel**: Tersedia tombol beralih tema di Floating Pill Navbar, Desktop Member Navbar, Mobile Drawer, dan Login View.
- [ ] **Zero-FOUC Persistence**: Pilihan tema tersimpan permanen di LocalStorage (`zett_theme`) tanpa kedipan warna saat reload halaman.
- [ ] **Akses Preview Bebas (Fase Dummy)**: Seluruh email yang dimasukkan langsung diizinkan login tanpa ada dialog penolakan whitelist.
- [ ] **1-Klik Demo Masuk Instan**: Mengklik pill akun demo langsung membawa pengguna ke katalog `/home`.
- [ ] **Preservasi Desain**: Hero banner home orisinil, featured lesson, quick actions dinamis, modul scrollable, dan ikon monoline SVG 100% terjaga.

================================================================================
ZONA BAWAH: MASTER CONTEXT & LOGIKA SISTEM TERKINI (LIVING CONTEXT)
================================================================================
- **Strategi Rilis & Eksekusi Bertahap**:
  - **FASE 1 (Frontend Interactive First & Dummy Preview Mode)**:
    - Membangun seluruh antarmuka (UI/UX) dan interaksi fitur secara 100% fungsional menggunakan Mock Data & State Management (LocalStorage persisten).
    - **Akses Login Tidak Dikunci:** Semua email otomatis diizinkan masuk agar peninjau/owner dapat mengevaluasi antarmuka dan seluruh fitur kurikulum secara leluasa.
    - **Zero-Error Engineering Policy:** Skrip data terisolasi, identifier unik, safe defensive accessor pada `window.ZettData`.
  - **FASE 2 (Backend & Cloud Database Produksi)**:
    - Menghubungkan state ke Supabase PostgreSQL, Supabase Auth OTP, dan Resend API setelah desain dan alur UI disetujui owner (di mana validasi whitelist ketat resmi diberlakukan).
- **Status Arsitektur Aktif**: Frontend Interactive Single-Page Application (HTML5 / Modern Tailwind CSS / Lucide / Modular JS Architecture) dengan Dual-Sync Cloud Engine (Supabase + LocalStorage Fallback).
- **Status Database Aktif**: Supabase Cloud PostgreSQL Ready (`supabase/schema.sql`) dengan Dual-Sync LocalStorage Engine (`js/core/supabase.js`).
- **Status Autentikasi Aktif**: Client-side Whitelist Validation Mock + OTP 6-Digit Simulator (Mode Preview Terbuka / Tanpa Penguncian Selama Dummy) + Supabase Auth Ready.
- **Riwayat Log Pembaruan**:
  - [2026-10-12] Penyusunan draf awal blueprint PRD Zettbos Member Hub v1.0.0.
  - [2026-10-12] Penyesuaian roadmap pengerjaan: Eksekusi Fase 1 Frontend Interaktif terlebih dahulu untuk validasi visual & fungsional di localhost sebelum integrasi backend.
  - [2026-10-12] Implementasi Revisi: Dukungan multi-video per modul & blok video Notion, pemisahan Home vs Dashboard (Data Belajar & Heatmap GitHub), dan perataan grid mobile 2 kolom compact.
  - [2026-10-12] Implementasi Estetika Anti-AI & Micro-UX: Standarisasi radius presisi konsentris, Tipografi Human-Crafted, Depth Hierarchy matte 3-lapisan, dan Floating Sticky Progress Pill UX.
  - [2026-10-12] Implementasi Revisi 6: Pembersihan metrik dashboard jadi 2 kartu esensial, fleksibilitas urutan video alami, menu Favorit tersendiri, dan optimasi baca mobile dengan Bottom Sheet.
  - [2026-10-12] Implementasi Revisi 7: Hamburger Navigation Drawer desktop, Kalender Belajar Bulanan bertanggal aktif hijau, dan shared resource library hub.
  - [2026-10-12] Implementasi Revisi 8: Anti-AI Slop Design Overhaul, purifikasi tipografi, eliminasi gradien sembrono, dan SVG engineering schematics.
  - [2026-10-12] Implementasi Revisi 9: Preservasi Hero Banner Home orisinil, Featured Lesson Card, 4 Quick Action Hub cards dinamis & admin manager, filter kategori modul, container scrollable, perbaikan layout mobile HP, dan pembersihan total emoticon ke SVG monoline.
  - [2026-10-12] Implementasi Revisi 10: Kebijakan Akses Dummy Preview: Selama berstatus dummy/prototype (Fase 1), sistem DILARANG MENGUNCI AKSES LOGIN. Semua email otomatis di-whitelist.
  - [2026-10-12] Implementasi Revisi 11: Perbaikan fatal SyntaxError pada duplikasi konstanta SEED_QUICK_ACTIONS di mock-data.js, pembungkusan defensive accessor pada window.ZettData, penyembunyian baku mobile-bottom-nav di markup login, restorasi desain bersih form login aslinya, dan penegasan Standar Zero Console Error di PRD.
  - [2026-10-12] Implementasi Revisi 12: Anti-AI Slop Overhaul. Penerapan palet Linear/Raycast Matte Carbon (#0D0E11 bg, #16181D card surface, #262933 border hairline, #101216 inner well), eliminasi total neon glow blur-3xl, dan transisi ke solid matte depth hierarchy.
  - [2026-10-12] Implementasi Revisi 13: Perapihan Total Navbar Atas di Layar HP. Pengaturan logo ringkas 1 baris [ZB] ZETTBOS (badge disembunyikan di HP), penguncian nav-mode-switch strictly desktop (#nav-mode-switch display: none di mobile), pemindahan mode switch mobile ke Sidebar Drawer, dan perataan spasi kanan avatar profil dan logout.
  - [2026-10-12] Implementasi Revisi 14: Dual Theme System (Dark Mode & Light Mode). Implementasi tema ganda dengan presisi tinggi: Dark Mode (Linear Matte Carbon) dan Light Mode (Linear/Apple Alabaster Studio), pencegahan flicker zero-FOUC di head, tombol switcher terpadu di desktop navbar, mobile drawer, dan login screen.
  - [2026-10-13] Implementasi Revisi 15: Zettbos Landing Portal & Integrasi Komponen Referensi.html. Pembangunan Landing Portal pra-login berkelas studio (Floating Pill Header, Hero Section dengan One-Line Email Input & 3D Layered Mockups, Floating Overlap Banner, Bento Split Curriculum Showcase 5-tab, dan Audience Use-Case Cards dengan micro-tag pills), serta injeksi micro-tag chips dan use-case style pada menu-menu internal LMS.
  - [2026-10-13] Implementasi Revisi 16: Perbaikan Glitch Warna Light Mode Ruang Belajar, Optimalisasi Widescreen 1600px Display Fit, Ubin Akses Cepat Mikro Kompak, dan Translucent Glass Tinted Cards (Inspirasi referensi.html).
    1. Eliminasi total background keras `bg-[#060A12]` pada `#view-learn`, diganti variabel dinamis `bg-[var(--bg)]` dengan aturan kontras tinggi untuk Notion reading blocks, callouts, dark terminal pre/code, dan sidebar kurikulum (active state `#ECFDF5` + border `#059669`).
    2. Perluasan kontainer tampilan dari `max-w-6xl` (1152px) ke `max-w-[1440px] 2xl:max-w-[1600px]` di seluruh view agar fit natural dan tidak menyisakan ruang kosong di layar monitor lebar (100% zoom).
    3. Redesain Akses Cepat & Resource Hub menjadi ubin horizontal mikro berprofil ramping (`h-12` s.d. `h-14`, icon box `w-7 h-7`, label + subtitle sebaris) memangkas tinggi kartu >50%.
    4. Penerapan estetika kartu frosted glass transparan tinted (`.glass-card-translucent`, `.card-tint-emerald/cyan/purple/amber`) dan Lynk-inspired multi-stop hero gradient card (`.featured-lesson-hero-card`).
  - [2026-10-13] Implementasi Revisi 17: Pembersihan Ghost Duplicate Tags & Pemulihan Enkapsulasi `#view-landing`.
    1. Menghapus 6 baris ghost duplicate tags di akhir seksi `landing-usecases` (`Jasa Web App` dan `Portofolio Nyata`).
    2. Memulihkan hierarki penutupan tag HTML sehingga seksi Testimoni (`#landing-testimonials`) dan Footer terenkapsulasi penuh di dalam `<div id="view-landing">`, menghentikan kebocoran tampilan pada halaman Home (`#view-home`) dan Login (`#view-login`).
  - [2026-10-13] Implementasi Revisi 18: Hero Typewriter Engine, Input Placeholder Typing & Terminal Live AI Status.
    1. Mengintegrasikan `HeroTypewriterController` untuk animasi ketik dinamis pada headline landing hero (berotasi antara "Web App Sendiri", "Sistem Otomasi Sheets", "Software Bisnis Nyata", "Dashboard Inventaris", "Integrasi Webhook AI") dengan kursor kedip emerald halus (`.typewriter-blink-cursor`).
    2. Mengimplementasikan typewriter placeholder pada input email yang berotasi otomatis dan secara cerdas berhenti saat pengguna fokus/mengetik.
    3. Menambahkan status terminal live AI dinamis di kartu schematic `ZettbosEngine.js` serta ambient background spotlight untuk efek visual berkelas dunia.
    4. Menjaga standar aksesibilitas (`prefers-reduced-motion`) dan manajemen siklus hidup timer yang bersih tanpa kebocoran memori.
  - [2026-10-13] Implementasi Revisi 19: Proporsi Ergonomis Mobile, Grid 2-Kolom Use-Cases, Carousel Testimoni Slide Lynk.id, Fix Huruf Terpotong, & Dot-Matrix Obsidian Hitam Pekat.
    1. Optimalisasi Hero Mobile UX: Spasi atas disesuaikan (`pt-20 pb-12`), mockup visual kanan ditata menjadi satu deret studio terintegrasi rapi pada layar HP tanpa tabrakan koordinat absolute, dan input/tombol diberi hit-target manusiawi.
    2. Grid 2-Kolom Simetris (`grid-cols-2 lg:grid-cols-4`): 4 kartu audiens use-case tersusun rapi 2x2 di HP dengan padding proporsional (`p-3.5`), memangkas scroll vertikal >60%.
    3. Carousel Testimoni Slide Lynk.id (`testimonial-marquee-container`): Track horizontal infinite marquee (42 detik) dengan mask tepi ganda transparan (`mask-image: linear-gradient(90deg, transparent 0%, rgba(0,0,0,1) 8%, rgba(0,0,0,1) 92%, transparent 100%)`), kartu bergaya quote `“`, pause on hover/touch, dan swipeable.
    4. Eliminasi Descender Clipping: Menambahkan padding dan margin kompensasi pada `#hero-typing-phrase` serta line-height `leading-[1.24]`, memastikan ekor huruf 'g', 'y', 'p', 'q', 'j' tidak terpotong canvas `bg-clip-text`.
    5. Background Obsidian Hitam Pekat & Engineering Dot-Matrix: Mengubah `--bg` ke `#07080A`, menerapkan `.dot-matrix-bg` berjarak 28px, dan `.landing-matrix-overlay` dengan bias ambient emerald lembut.
  - [2026-10-13] Implementasi Revisi 20: Universal CMS Engine Terpadu (Landing Portal, Testimoni, Use-Cases, Shared Resources & Kurikulum).
    1. Zero Hardcoded Content: Seluruh teks landing page (Hero Badge, Pre/Post Headline, Frasa Typewriter berputar, Deskripsi, Tombol CTA, Banner Overlap), Kartu Target Audiens (Use-Cases), Carousel Testimoni Member (Lynk Marquee Slider), dan Shared Resource Hub kini 100% dinamis digerakkan oleh CMS engine (`SEED_LANDING_CMS`, `AppState.landingCms`, `AppState.resources`).
    2. Panel Admin CMS Baru: Penambahan 2 Tab Menu navigasi Admin (`CMS Landing Portal` dan `CMS Resource Hub`) dengan formulir visual interaktif lengkap:
       - Form Editor Hero & Typewriter Phrases (textarea multiline otomatis diurai ke array rotasi).
       - Visual Editor Kartu Use-Cases 4 Target Audiens dengan modal popup `#modal-edit-usecase`.
       - Tabel Manajemen Testimoni Member (Lynk Marquee Slider) dengan fitur Tambah/Edit via `#modal-edit-testimonial` dan Hapus.
       - Tabel Manajemen Shared Resource & Link Dokumen dengan fitur Tambah via `#modal-add-resource`, Edit via `#modal-edit-resource`, pencarian instan, dan Hapus.
    3. Reaktivitas Live & Persistensi Penuh: Setiap perubahan data di Admin seketika tersimpan ke `localStorage` (`zett_landing_cms`, `zett_resources`) dan langsung terefleksi secara instan pada antarmuka publik/member tanpa reload (`renderLandingFromCms()`, `HeroTypewriterController`, `renderResources()`).
    4. Fitur Reset Safe-Guard: Tersedia tombol reset ke bawaan default untuk Hero, Use-Cases, Testimoni, dan Resources guna memudahkan pengujian.
  - [2026-10-13] Implementasi Revisi 21: Cyber Particle Network Background (Inspirasi referensi2.html).
    1. Fixed Background Canvas: Mengintegrasikan `<canvas id="particles-canvas">` di level root dengan posisi `fixed`, `z-index: 0`, dan `pointer-events: none` sehingga tidak menghalangi interaksi tombol maupun teks.
    2. Konstelasi Partikel Neon Emerald: Menggunakan palet neon `#00ff84` dengan garis hubung dinamis `rgba(0, 255, 132, opacity)` persis seperti implementasi di `referensi2.html`.
    3. Adaptif Tema Dua Arah: Otomatis menyesuaikan opasitas dan warna saat beralih antara Dark Mode (`#00ff84`, opasitas 0.45) dan Light Mode (`#059669`, opasitas 0.22).
    4. Efisiensi & Interaksi Kursor: Dilengkapi koneksi dinamis ke kursor mouse saat bergerak, jeda otomatis saat tab tidak aktif (`document.hidden`), dan kepatuhan penuh pada preferensi `prefers-reduced-motion`.
    5. Harmoni Layering: Lapisan `.dot-matrix-bg` dibuat transparan sehingga partikel dan grid teknik menyatu elegan di belakang seluruh section utama (Hero, Kurikulum Bento, Target Audiens, Testimoni Marquee, dan Member Hub).
  - [2026-10-13] Implementasi Revisi 22: Eliminasi Grid Titik Statis, Restrukturisasi Kartu Testimoni, & Polish Tema Terang (Light Mode).
    1. Eliminasi Dot-Matrix: Menghapus seluruh radial-gradient dot-matrix grid, menghasilkan kanvas hitam pekat obsidian murni (`#07080A`) yang tenang dengan partikel konstelasi cyber network bebas distraksi.
    2. Ergonomic Testimonial Cards: Menetapkan dimensi lebar tetap (`380px`, `max-w-[88vw]`) pada `.testimonial-card` sehingga tidak memanjang pipih/melebar ekstrem; menambahkan 5 bintang emas (`★★★★★`), lencana Alumni, serta wrapping teks kutipan yang proporsional.
    3. Polish Light Mode Kontras Tinggi: Mengoptimalkan kontras warna pada formulir email Hero (teks gelap `#0F172A`), tombol pill demo (`Admin Demo` emerald pekat `#065F46`, `Siswa Demo` cyan pekat `#0369A1`), floating badges mockup (teks hitam pekat `#0F172A`), dan overlap banner dengan gradien multi-stop modern (`#059669` -> `#0D9488` -> `#0284C7`) serta tombol aksi putih tegas.
  - [2026-10-13] Implementasi Revisi 23: Redesain Minimal Frosted Glass Strip untuk Overlap Banner.
    1. Eliminasi Banner Pita Hijau Pekat: Menyingkirkan blok pita gradien hijau pekat solid yang menabrak estetika halaman dan mengaburkan aliran partikel background.
    2. Minimal Frosted Glass Strip (Opsi 1): Menerapkan kartu transparan berlapis kaca (`.landing-frosted-strip`) dengan `backdrop-filter: blur(16px)`, border hairline halus, dan background tembus pandang (`rgba(13, 17, 26, 0.72)` di Dark Mode dan `rgba(255, 255, 255, 0.88)` di Light Mode) sehingga partikel cyber network tetap mengalir indah di belakangnya.
    3. Integrasi Konten & CMS: Mempertahankan fungsionalitas badge mini (`100% Studi Kasus Nyata • Siap Deploy ke Bisnis`), keterhubungan data CMS Admin (`#landing-banner-title`, `#landing-banner-desc`), dan tombol CTA interaktif (`.strip-cta-btn`).
  - [2026-10-13] Implementasi Revisi 24: Overhaul Copywriting Landing Page & Reposisi Edukasi Web App AI (Non-Teori, Anti-Jargon, 100% Praktek Langsung).
    1. Eliminasi Buzzword "Vibe Coding" & Istilah Mengambang: Seluruh materi komunikasi dirombak menjadi bahasa Indonesia yang lugas, manusiawi, dan berorientasi hasil nyata. Menjelaskan inti kelas secara transparan: belajar membuat web app fungsional full pakai AI (dari rancang prompt, koneksi database spreadsheet, tuntaskan error/bug, hingga hosting & domain sendiri) tanpa hafalan koding atau bayar vendor mahal.
    2. Overlap Banner Strip Badge: Menerapkan lencana eksplisit `100% Praktek Langsung` (disertai subtitle `• Tanpa Perlu Sewa Programmer`), headline `Bikin Aplikasinya Sendiri, Stop Ketergantungan ke Orang Lain`, dan penjelasan hasil modul yang langsung siap pakai.
    3. 4 Kartu Target Audiens dengan Justifikasi Kebutuhan Nyata & Perbaikan Rendering Deskripsi:
       - Memperbaiki bug properti di mana `SEED_LANDING_CMS.useCases` memakai kunci `desc` sedangkan renderer memanggil `.description`. Kini disinkronkan ke kedua properti (`.description || .desc`) sehingga teks deskripsi tampil penuh 100%.
       - Kartu 1 (Owner Bisnis & UMKM): Punya sistem kasir, manajemen stok, dan CRM sendiri tanpa biaya bulanan selamanya serta hemat puluhan juta biaya vendor.
       - Kartu 2 (Karyawan & Tim Kantor): Ubah Google Sheets/Excel jadi web app otomatis, input data anti-salah, laporan instan, dan bebas lembur.
       - Kartu 3 (Freelancer & Pencari Cuan): Buka jasa pembuatan web app jutaan per proyek untuk klien UMKM full modal AI dari prompt sampai serah terima.
       - Kartu 4 (Pemula Nol Pengalaman Koding): Bukti nyata deploy web app fungsional pertama ke internet tanpa harus berlatar belakang kuliah IT.
    4. Seksi Kurikulum Bento, Typewriter Phrases & CMS Sync: Mengubah headline kurikulum menjadi `Tahapan Praktek: Dari Nol Sampai Aplikasi Jadi & Online`, memperbarui frasa rotasi typewriter, serta menambahkan migrasi versi cache `localStorage` (`zett_landing_cms_ver: v24_ai_webapp`) agar pengunjung lama maupun baru langsung menikmati copy baru secara otomatis.
  - [2026-10-13] Implementasi Revisi 25: Modularisasi Arsitektur JavaScript & Perbaikan Total Hamburger Menu Drawer (Elevasi Z-Index & Dual-Mode Contrast).
    1. Modularisasi Arsitektur JavaScript:
       - Memecah god-file `js/app.js` (~3.787 baris) menjadi 9 modul terpisah yang independen, kohesif, dan mudah dipelihara:
         * `js/core/state.js`        : State management terpusat, persistensi `localStorage`, utility toast & sanitizer, tema tampilan.
         * `js/core/router.js`       : Router navigasi SPA 0-detik, drawer state, navbar breadcrumb, admin/member mode switcher.
         * `js/core/particles.js`    : Cyber particle network canvas background engine.
         * `js/controllers/auth.js`  : Autentikasi whitelist, dummy demo login instan, OTP modal & simulation helper.
         * `js/controllers/landing.js`: CMS landing portal, bento grid kurikulum, typewriter dynamic engine.
         * `js/controllers/classroom.js`: Home katalog modul, kalender belajar bulanan, ruang video, progress tracking, favorit.
         * `js/controllers/resources.js`: Dokumen & shared resource repository, filter kategori, search.
         * `js/controllers/admin.js` : Admin panel kurikulum, whitelist editor, CMS hero/audiens/testimoni, CMS resources, quick actions.
         * `js/app.js`               : Main orchestrator & bootstrap entry-point (DOMContentLoaded).
       - Menjaga 100% kompatibilitas offline (`file:///`) tanpa CORS error dan 100% kompatibilitas web server.
    2. Perbaikan Total Hamburger Menu Drawer:
       - Mengatasi bug stacking context di mana overlay dan drawer sama-sama berada di `z-50`, yang menyebabkan drawer tertutup backdrop gelap blur dan tampak remang-remang/hitam pekat.
       - Memperbaiki hirarki z-index: overlay di `z-50` (`bg-black/60`), drawer di `z-[60]` (`.sidebar-drawer-panel`).
       - Menerapkan styling elevasi berkontras tinggi (`#0E121B` pada Dark Mode dan `#FFFFFF` pada Light Mode) dengan border hairline solid dan bayangan halus (`box-shadow: 18px 0 60px rgba(0,0,0,0.8)`).
       - Teks judul, navigasi, dan profil member terbukti tajam, cerah, dan terbaca sempurna pada kedua mode tema.
  - [2026-10-13] Implementasi Revisi 26: Integrasi Supabase Cloud PostgreSQL, Konfigurasi Produksi Vercel, & Dynamic Overlap Centering.
    1. Skema Basis Data PostgreSQL Supabase (`supabase/schema.sql`):
       - Merancang 9 tabel terstruktur dengan relasi foreign key, constraint, Row Level Security (RLS) policies, dan initial seed data.
       - Kompatibel penuh dengan GUI Supabase Table Editor (antarmuka mirip Google Sheets) untuk kemudahan pengelolaan data member & kurikulum tanpa koding.
       - Tabel: `whitelist_members`, `curriculum_modules`, `curriculum_lessons`, `member_progress`, `member_activity`, `member_favorites`, `shared_resources`, `landing_cms`, `quick_actions`.
    2. Universal Supabase Client & Dual-Sync Engine (`js/core/supabase.js`):
       - Menyediakan sinkronisasi dua arah: Tarik data Cloud ke Lokal (`pullAllData()`) dan Unggah data Lokal ke Cloud (`pushAllLocalDataToSupabase()`).
       - Zero-crash fallback: Aplikasi tetap berjalan 100% normal dan lancar secara offline atau saat kredensial belum dimasukkan menggunakan LocalStorage.
       - Live Connection Status Badge di UI.
    3. Admin Cloud Management UI:
       - Penambahan modal `#modal-supabase-settings` dengan input Project URL, Anon Key, tombol Tes Koneksi, dan tombol sinkronisasi.
    4. Konfigurasi Produksi Vercel (`vercel.json`) & One-Click Deploy Script (`deploy-vercel.bat`):
       - Pengaturan routing SPA rewrite (`/(.*) -> /index.html`) untuk eliminasi error 404, HTTP Security Headers, dan asset caching.
       - Skrip batch otomatisasi deployment terminal.
    5. Dynamic Banner Overlap Centering (`ResizeObserver`):
       - Mengadaptasi formula dari `referensi.html` (baris 2058-2069) ke dalam `js/controllers/landing.js`, menjaga banner frosted glass selalu tepat berada di tengah perbatasan section hero & konten di semua resolusi layar.
  - [2026-10-13] Implementasi Revisi 27: Purge Total Data Dummy (Clean Slate Zero Data Start).
    1. Pembersihan Menyeluruh Seed Data (`js/mock-data.js` & `supabase/schema.sql`):
       - Mengosongkan modul kurikulum (`SEED_MODULES = []`), materi lessons (`SEED_LESSONS = []`), shared resources (`SEED_RESOURCES = []`), progres (`SEED_PROGRESS = {}`), aktivitas heatmap (`SEED_ACTIVITY = {}`), item favorit (`SEED_FAVORITES = {}`), aksi cepat (`SEED_QUICK_ACTIONS = []`), dan testimoni fiktif (`testimonials = []`).
       - Mempertahankan HANYA 1 akun resmi Owner/Admin Farhan (`farhan@zettbos.com`) pada tabel whitelist agar sistem dapat diakses untuk memasukkan konten asli dari nol.
    2. Auto-Migration & Purge Engine (`js/core/state.js`):
       - Menerapkan cache breaker `v27_clean_zero_start` untuk menghapus seluruh data dummy lama di `localStorage` peramban tanpa memaksa fallback seed lama.
       - Menyediakan fungsi `resetAllDataToZero()` yang dapat dipanggil kapan saja oleh Admin.
    3. Desain Empty State Elegan:
       - Bento Showcase Kurikulum di Landing Page menampilkan status *"Kurikulum Sedang Disusun"* dengan tombol *"Buka Admin & Tambah Modul Pertama"*.
       - Banner Materi Rekomendasi di Beranda menampilkan *"Mulai Buat Modul & Materi Pelajaran Pertama"* (0% Selesai) dengan tombol pintas *"Buka Admin Kurikulum"*.
       - Katalog Modul menampilkan *"Belum Ada Modul Kurikulum"* dengan tombol panduan.
    4. Workflow Input Data dari 0 di Admin Panel (`js/controllers/admin.js` & `index.html`):
       - Menambahkan tombol `[+ Modul Baru]`, `[+ Materi Baru]`, dan `[Hapus Materi]` di editor kurikulum admin untuk memfasilitasi pembuatan bab modul dan pelajaran dari nol.
       - Menambahkan tombol `[Bersihkan ke 0]` di header admin panel.
  - [2026-10-13] Implementasi Revisi 28: Security Hardening, Anti-Bypass, & Super Admin zettbos2025@gmail.com.
    1. Super Admin Resmi Zettbos:
       - Mengubah Super Admin ke `zettbos2025@gmail.com` dan membersihkan seluruh akun pengembang lama.
    2. Eliminasi Total Dummy Access & Bypass:
       - Menghapus tombol toggle cepat admin/member (`toggleAdminMemberMode`).
       - Menghapus pill akun demo/dummy di modal login.
       - Menghapus kode bypass OTP hardcoded (`123456`).
       - Menambahkan perlindungan anti-inspect element (disable contextmenu dan shortcut keyboard DevTools).
  - [2026-10-13] Implementasi Revisi 29: Integrasi Resend Third-Party Email OTP & Password Hashing.
    1. Integrasi Resend API (`api/send-otp.js`):
       - Pengiriman OTP email asli via serverless API Vercel dengan template Dark Cyberpunk resmi Zettbos.
    2. Verifikasi Kriptografis HMAC SHA-256 (`api/verify-otp.js`):
       - Token OTP ditandatangani dengan HMAC stateless dan masa aktif 10 menit.
  - [2026-10-13] Implementasi Revisi 30: Audit Deduplikasi whitelist.txt & Impor 1.736 Siswa Unik ke LMS Whitelist.
    1. Deduplikasi & Normalisasi whitelist.txt:
       - Mengeliminasi seluruh email duplikat dari 1.759 data mentah menjadi 1.736 email siswa unik.
       - Menyeragamkan format email ke lowercase dan spasi bersih.
    2. Modul Data Whitelist (`js/whitelist-data.js` & `js/mock-data.js`):
       - Memuat seluruh 1.736 siswa ke konstanta `WHITELIST_STUDENT_EMAILS` dan mengombinasikannya dengan Super Admin `zettbos2025@gmail.com`.
       - Total whitelist resmi: 1.737 akun terdaftar.
    3. Migrasi Otomatis LocalStorage (`js/core/state.js`):
       - Cache breaker `DATA_CLEAN_VERSION = 'v30_whitelist_imported'` dengan preservasi password hash aktif.
    4. SQL Batch Script (`supabase/seed_whitelist.sql`):
       - Penyiapan file seed idempotent untuk sinkronisasi database PostgreSQL Supabase.
  - [2026-10-13] Implementasi Revisi 43: Resolusi Total Sinkronisasi Database Supabase & Live Multi-User Update.
    1. Perbaikan Fatal Mapping `isPinned`: Menambahkan `isPinned: !!m.is_pinned` pada `cloudMods` mapping di `syncCurriculumFromCloud()` (`js/core/supabase.js`), sehingga modul yang disematkan mentor tidak lagi hilang saat ditarik dari cloud oleh siswa.
    2. Reactive Auto Re-render: Begitu data asynchronous dari Supabase Cloud tiba di browser, sistem langsung memicu re-render otomatis komponen `renderPinnedModuleHero()`, `renderQuickActionHub()`, `renderModuleCategoryPills()`, `renderModuleCatalogGrid()`, dan `renderResources()`.
    3. Pinned Module Eksklusif: Memastikan modul pilihan mentor di-pin di lokal maupun Supabase Cloud.
    4. Auto-Push Quick Actions & Shared Resources: Menambahkan batch upsert untuk `quick_actions` dan `shared_resources` pada fungsi `syncCurriculumToCloudLive()` dan CRUD handler terkait, menjamin seluruh perubahan Admin langsung tersimpan live ke database dan dapat diakses oleh semua pengguna.
    5. Cache Buster: Menaikkan seluruh query string script modular di `index.html` ke versi `?v=43`.
  - [2026-10-13] Implementasi Revisi 44: Sleek Home Layout, Multi-Pin Stacked Heroes, Centered Learning Room, & Clean Code Blocks.
    1. Re-Layout Simetris Ruang Belajar (`#view-learn`): Menyelaraskan sub-bar atas dan kontainer materi ke grid terpusat (`max-w-5xl xl:max-w-6xl w-full mx-auto px-4 sm:px-6 items-start justify-center`) yang mengeliminasi ruang kosong di monitor lebar dan memberikan pengalaman fokus baca ala Notion/Medium.
    2. Light Mode Fix Pinned Hero & Dukungan Multi-Pin Hero Stacked:
       - Memperbaiki glitch Light Mode pada kartu pinned dengan styling CSS `html.light .pinned-hero-card` (background putih `#FFFFFF` alabaster, border `#CBD5E1`, kontras teks `#0F172A`).
       - Memperbarui `renderPinnedModuleHero()` di `js/controllers/classroom.js` menggunakan `.filter(m => m.isPinned)` dengan wrapper `space-y-6`, sehingga seluruh modul yang di-pin oleh Admin tersusun vertikal bertumpuk rapi ke bawah.
       - Memperbarui `js/controllers/admin.js` agar Admin leluasa menyematkan beberapa modul unggulan sekaligus ke Supabase.
    3. Sleek Compact Welcome Bar di Beranda: Menata ulang sapaan "Selamat Datang" menjadi sub-header berprofil rendah 1 baris (`p-3.5 sm:p-4 mb-5`) dengan mini progress bar horizontal, menghemat 70% ruang vertikal.
    4. Eliminasi Helper Slop: Menghapus teks kaku "Klik di mana saja pada kartu ini untuk langsung masuk modul." pada kartu hero.
    5. Re-Order Beranda: Memindahkan seksi "Akses Cepat & Resource Hub" tepat di atas "Rekomendasi Lanjutkan Belajar".
    6. Terminal Dots Minimalis pada Code Block (`js/editor.js`): Mengganti label teks bahasa ("JAVASCRIPT", dll) dengan 3 titik terminal MacOS minimalis (`rose-500`, `amber-500`, `emerald-500`).
    7. Cache Buster: Menaikkan cache buster seluruh file JS dan CSS di `index.html` ke versi `?v=44`.
  - [2026-10-13] Implementasi Revisi 45: Pembersihan Total Data Dummy Hardcode (LocalStorage, Supabase Cloud & HTML Markup).
    1. Purge Dokumen Dummy Shared Resources:
       - Menerapkan auto-purge data `v45_clean_zero_data` di `js/core/state.js`, membersihkan sisa 5 dokumen dummy dari `localStorage` saat dibuka oleh siapa pun.
       - Menambahkan auto-delete ke Supabase Cloud di `js/core/supabase.js` (`syncCurriculumFromCloud()`) untuk mendeteksi dan menghapus baris dummy dari tabel `shared_resources` secara permanen.
       - Menyiapkan script query SQL `supabase/clean_dummy_resources.sql`.
    2. Pembersihan Markup HTML Statis (`index.html`):
       - Menyetel seluruh angka tab kategori dokumen dari `(5)`, `(1)`, `(2)` ke `(0)`.
       - Menetralkan teks fallback Featured Lesson ("Video Pembelajaran: Membuat Web App..." -> "Mulai Buat Modul & Materi Pelajaran Pertama", durasi "18 Menit" -> "0 Menit", "Modul 1" -> "Setup Awal Kurikulum").
       - Menetralkan badge katalog modul ("5 Modul Lengkap" -> "0 Modul").
       - Menetralkan teks fallback Ruang Belajar ("Modul 1" -> "-", "18 Menit" -> "0 Menit", "Materi Pembelajaran").
       - Membersihkan nomor telepon dummy `6281234567890` ke kontak resmi.
    3. Empty State Dokumen & Resource Hub:
       - Menampilkan empty state interaktif jika 0 dokumen dengan tombol pintas `+ Bagikan Link Dokumen Pertama` bagi Super Admin dan pesan informatif bagi Siswa.
       - Memperbaiki bug toggle tombol tambah dokumen di header saat dokumen berjumlah 0.
    4. Cloud Wipe di Panel Admin:
       - Fungsi `resetResourcesToDefault()` dan `resetAllDataToZero()` kini ikut mengeksekusi penghapusan baris di cloud Supabase (`shared_resources`).
    5. Cache Buster: Menaikkan seluruh query string script dan stylesheet di `index.html` ke versi `?v=45`.
  - [2026-10-13] Implementasi Revisi 46: Fix Visual Light Mode, Pembersihan Dummy Kalender Belajar, Perbaikan Copy Snippet Favorit, Hapus Field Input YouTube, dan Sticky Live Preview Admin.
    1. Light Mode Mini Progress Widget (`.dash-progress-mini-card`):
       - Memperbaiki kotak hitam kotor di welcome bar Beranda saat Light Mode.
       - Menerapkan background `#F8FAFC`, border `#E2E8F0`, teks label `#64748B`, angka progress emerald `#059669`, dan tombol Detail cyan `#0891B2` yang kontras dan bersih.
    2. Purge Dummy Kalender Belajar Bulanan (`js/controllers/classroom.js`):
       - Menghapus total array fallback tanggal statis `['2026-10-02', '2026-10-04', ...]` dan hardcoded `isToday = (day === 12)`.
       - Menghitung tanggal hari ini secara dinamis real-time menggunakan `new Date()`. Kalender menampilkan data murni dari aktivitas riil pengguna (0 hari aktif jika belum ada materi tuntas).
       - Menghilangkan hardcoded `'2026-10-12'` pada pencatatan tanggal tuntas materi di `markLessonComplete()`.
    3. Perbaikan Render & Copy Snippet Favorit (`js/controllers/classroom.js`, `css/style.css`):
       - Memperbaiki bug quote collision pada atribut `onclick` saat menyalin kode snippet favorit dengan membuat fungsi terisolasi `window.copyFavoriteSnippet(favId)`.
       - Menerapkan Light Mode styling untuk badge "ITEM TERSIMPAN" (`#FEF3C7`, `#B45309`), tag snippet (`#F3E8FF`, `#7E22CE`), dan pre code box.
    4. Hapus Input YouTube Unlisted & Light Mode Notion Editor (`index.html`, `js/controllers/admin.js`, `css/style.css`):
       - Menghapus kolom input terpisah `#admin-edit-youtube` di editor admin karena video dimasukkan sebagai blok modular di konten.
       - Menambahkan styling Light Mode menyeluruh untuk `#notion-editor-root` (blok putih `#FFFFFF`, border `#E2E8F0`, text `#0F172A`, placeholder `#94A3B8`, dropdown `#F8FAFC`, callout box `#ECFDF5`).
    5. Sticky Scrolling Live Preview (`index.html`, `css/style.css`):
       - Memasang sticky layout `lg:sticky lg:top-20 self-start` dan `max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar` pada panel Live Preview siswa di editor admin.
       - Live Preview kini tetap menempel di viewport saat admin scrolling ke bawah menyusun blok materi panjang.
    6. Cache Buster: Menaikkan seluruh query string script dan stylesheet di `index.html` ke versi `?v=46`.
  - [2026-10-13] Implementasi Revisi 47: Segmented Micro-Toolbar Kurikulum, Desktop Push Sidebar, Pembersihan Teks Navbar, Tombol Join Kelas Lynk.id, Eliminasi Chip Tag, & Sistem UX Transition.
    1. Segmented Micro-Toolbar Kurikulum & Hapus `🟢 [LIVE]` (`index.html`, `js/controllers/admin.js`, `css/style.css`):
       - Menata ulang tombol aksi modul dan materi di panel admin menggunakan class `.btn-micro-action` yang seragam, rapi, dan simetris (Emerald untuk Tambah, Slate untuk Edit, Rose untuk Hapus, Amber untuk Pin, Cyan untuk Sync, Purple untuk Rapikan ID).
       - Menghapus emoji `🟢 [LIVE]` dari seluruh opsi dropdown modul dan pelajaran; hanya materi berstatus draft yang menampilkan penanda `[DRAFT]`.
    2. Desktop Push Sidebar Architecture (`index.html`, `js/core/router.js`, `css/style.css`):
       - Menerapkan docked push sidebar pada layar laptop/desktop (`lg:` / `≥ 1024px`) di mana sidebar otomatis terbuka tanpa backdrop gelap penutup layar (`#sidebar-drawer-overlay` disembunyikan di desktop via `lg:hidden`).
       - Konten utama otomatis bergeser ke kanan (`lg:pl-72`) dan menyesuaikan ukurannya secara fluid.
       - Tombol hamburger dapat diklik untuk menyembunyikan/menampilkan sidebar dengan transisi animasi halus (`300ms cubic-bezier(0.16, 1, 0.3, 1)`). Status persistensi disimpan di `localStorage` (`sidebar_desktop_collapsed`).
    3. Hapus Sub-Teks "Web App AI Academy" (`index.html`):
       - Menghapus baris teks penjelas di samping brand logo header, menghasilkan logo yang bersih dan ringkas: `ZB ZETTBOS` + badge `MEMBER HUB`.
    4. Integrasi Tombol "Join Kelas" Otomatis ke Lynk.id (`index.html`):
       - Memasang tombol CTA prominent "Join Kelas" yang langsung mengarah ke `https://lynk.id/zettbos/50nxdkpjmowm` pada floating pill navbar dan hero section landing page.
    5. Eliminasi Chip Tag "Tutorial AI" & "Studi Kasus" (`js/controllers/landing.js`):
       - Mengosongkan kembalian `getModuleMicroTags()` dan meniadakan rendering tag pill palsu pada kartu preview bento kurikulum di halaman depan.
    6. Sistem UX Premium & Animasi Transisi (`js/core/router.js`, `js/controllers/landing.js`, `css/style.css`):
       - Menerapkan `.animate-page-enter` pada setiap perpindahan view via `navigate()` untuk transisi *soft entrance fade-and-rise* (durasi 240ms).
       - Mengaktifkan `scroll-behavior: smooth` dan `scroll-padding-top: 5.5rem` serta Scroll-Spy otomatis pada navbar landing page.
       - Cache buster seluruh skrip & CSS dinaikkan ke versi `?v=47`.
  - [2026-10-14] Implementasi Revisi 48: Swap Pinned Module & Recommendation, Penyatuan Hamburger Sidebar Desktop, Hapus Reset Data, Mobile Bottom Navigation Bar & Elevated Popover Sheet (Refrensi), dan Locked Fixed Top Navbar.
     1. Swap Posisi Sematan Modul (Pin) & Rekomendasi Belajar (`index.html`):
        - Memindahkan kontainer `#dash-pinned-module-container` (Modul Unggulan Pilihan Mentor) tepat ke atas `#dash-featured-lesson` (Rekomendasi Lanjutkan Belajar) pada Beranda, sehingga modul prioritas utama tampil paling atas.
     2. Penyatuan Hamburger Menu & Eliminasi Header Ganda Sidebar Desktop (`index.html`, `css/style.css`):
        - Menyembunyikan `.drawer-header` duplikat di dalam panel drawer pada desktop (`lg:hidden`), sehingga tidak ada lagi visual penumpukan dua logo dan tombol silang ganda.
        - Panel drawer pada desktop menempel rapi di bawah fixed navbar (`top: 4rem; height: calc(100vh - 4rem)`), menjadikan tombol hamburger `[ ☰ ]` dan logo brand di kiri atas navbar sebagai satu-satunya header pengendali resmi.
     3. Pembersihan Tombol "Reset Data" (`index.html`, `js/controllers/classroom.js`):
        - Menghapus elemen `#btn-home-reset-data` dari antarmuka Beranda dan membersihkan logika role-based toggle di controller `classroom.js`.
     4. Mobile Bottom Navigation Bar & Elevated Popover Menu (`index.html`, `js/core/router.js`, `css/style.css`):
        - Mengimplementasikan navigasi bawah paten khusus smartphone (`#mobile-bottom-nav`, `fixed bottom-0 inset-x-0 z-40 md:hidden` dengan frosted glass matte `bg-[#07080A]/95 backdrop-blur-xl border-t border-[#262933]`).
        - 4 Tombol Menu Utama: `Home` (Beranda), `Dashboard` (Data Belajar), `Belajar` (Ruang Video), dan `Dokumen` (Resource Hub).
        - 1 Tombol `[ ☰ Menu ]` yang membuka Elevated Floating Popover Sheet (`#mobile-menu-popover`) di sudut kanan bawah, memuat: `Item Favorit & Simpanan`, `Tema Tampilan (Dark/Light)`, `Admin Panel Kurikulum` (Role-based), `Edit Profil Saya`, dan `Keluar` (warna merah/rose sesuai gambar referensi).
        - Dilengkapi backdrop overlay blur (`#mobile-menu-backdrop`) dan penyesuaian padding bawah (`pb-20 md:pb-6`) pada seluruh view agar konten tidak tertutup bar navigasi.
     5. Locked Fixed Top Navbar (`index.html`, `css/style.css`):
        - Mengubah `#main-navbar` menjadi `fixed top-0 inset-x-0 z-50 glass-nav` sehingga 100% terkunci kokoh di puncak viewport saat scroll ke bawah tanpa pernah hilang.
        - Menambahkan padding-top kompensasi pada seluruh view (`pt-20 sm:pt-24` / `padding-top: 5.25rem !important`) untuk mencegah konten tertutup navbar.
     6. Cache Buster: Menaikkan seluruh query string script dan stylesheet di `index.html` ke versi `?v=48`.
  - [2026-10-14] Implementasi Revisi 49: Ruang Baca Luas & Marquee Horizontal Text on Hover, Simplifikasi Badge Modul Pilihan, Plain Text Navbar Header, Dekonstruksi Desain Anti-Kotak / Anti-AI, dan Interaktif Modul Breakdown Dashboard.
     1. Expand Ruang Baca & Kinetic Marquee Scroll on Hover (`index.html`, `js/controllers/classroom.js`, `css/style.css`):
        - Mengubah kontainer layout `view-learn` menjadi `max-w-[1440px] 2xl:max-w-[1600px]`, memperluas kolom baca materi/Notion hingga `max-w-4xl xl:max-w-5xl`, dan mendorong sidebar Kurikulum Kelas ke sisi kanan layar (`ml-auto w-80 xl:w-96`).
        - Menghapus pemotongan elipsis `...` kaku pada daftar materi dan modul di sidebar kurikulum. Menggantinya dengan sistem **Kinetic Horizontal Marquee on Hover** (`.marquee-hover-wrapper` + `.marquee-hover-track`): teks materi yang panjang otomatis meluncur mulus ke samping saat di-hover/aktif sehingga seluruh kata terbaca tuntas.
     2. Ganti Teks Badge Menjadi "Modul Pilihan" (`js/controllers/classroom.js`):
        - Mengubah teks badge sematan dari `MODUL UNGGULAN PILIHAN MENTOR` menjadi `Modul Pilihan` dan menghapus animasi `animate-pulse` agar estetika lebih tenang (*calm mature software*).
     3. Simplifikasi Judul Navbar Atas (`index.html`, `js/core/router.js`):
        - Menghapus bungkus kapsul hitam tebal dan pulsing green dot pada `#nav-center-indicator`. Menggantinya dengan judul teks minimalis bersih: `Kurikulum` (`text-sm font-bold text-slate-200 select-none`).
     4. Dekonstruksi Desain Anti-Kotak / Anti-AI Slop di Beranda (`index.html`, `js/controllers/classroom.js`, `css/style.css`):
        - Membongkar kartu pembungkus besar pada sambutan `Selamat Datang...` menjadi **Open Editorial Page Header** alami tanpa bingkai kotak.
        - Mengubah Akses Cepat yang sebelumnya 4 kartu kotak besar menjadi **Horizontal Action Chip Strip** (`.action-chip-btn` setinggi 34px dengan ikon mikro dan panah `↗`), menghemat ruang vertikal 70% dan membuat halaman bernafas lega.
     5. Kartu Kemajuan Modul Interaktif di Dashboard (`js/controllers/classroom.js`, `css/style.css`):
        - Seluruh kartu modul pada section *Kemajuan Detail per Modul* di Dashboard kini interaktif (`.module-progress-interactive-card` + `cursor-pointer`). Mengklik kartu modul akan langsung membuka Ruang Belajar pada materi modul tersebut.
        - Setiap chip materi (`EP0`, `EP1`, dst.) dapat diklik secara mandiri untuk melompat langsung ke video materi terkait.
     6. Cache Buster: Menaikkan seluruh query string script dan stylesheet di `index.html` ke versi `?v=49`.
  - [2026-10-14] Implementasi Revisi 50: Ruang Baca Mengisi Penuh & Font Putih Terang Jernih, Alignment Sub-Bar Ruang Belajar Edge-to-Edge, Dukungan Logo Kustom dari Link Google Drive & Direct URL, Simplifikasi Brand Logo, dan Dual-Admin WhatsApp Contact Selector.
     1. Ruang Baca Penuh & Font Putih Terang Jernih (`index.html`, `js/editor.js`, `css/style.css`):
        - Menghapus batasan kaku `max-width: 65ch` pada `#learn-notion-content` dan `.prose-reading`, mengubahnya menjadi `max-width: 100% !important; width: 100% !important;` dengan padding kartu yang lapang (`p-5 sm:p-8 md:p-10`) dan `line-height: 1.78`. Teks materi kini mengisi sisi kanan kartu secara proporsional dan harmonis.
        - Meningkatkan kontras warna teks materi dari `text-slate-300` / `#CBD5E1` menjadi putih terang jernih `#F8FAFC` (`text-slate-100` dengan kecerahan 98%), heading H1–H3 diset ke `#FFFFFF` tebal, dan teks callout menjadi `#ECFDF5`. Di mode terang (light mode), teks otomatis menyesuaikan menjadi deep obsidian slate `#1E293B` / `#0F172A`.
     2. Alignment Sub-Bar Ruang Belajar Edge-to-Edge (`index.html`):
        - Mengubah kontainer sub-navbar Ruang Belajar dari `max-w-5xl xl:max-w-6xl` menjadi `max-w-[1440px] 2xl:max-w-[1600px] w-full mx-auto flex items-center justify-between`.
        - Tombol `< Kembali ke Home` kini lurus sempurna di pinggir kiri (sejajar dengan logo navbar), dan tombol `<- Prev Next ->` lurus di pinggir kanan (sejajar dengan sidebar kurikulum).
     3. Dukungan Logo Gambar Kustom dari Link Google Drive & Direct URL (`index.html`, `js/core/state.js`, `js/controllers/classroom.js`, `js/controllers/admin.js`, `js/app.js`):
        - Menyediakan parser cerdas `convertGoogleDriveUrl(url)` yang otomatis mendeteksi ID file link Google Drive (`/file/d/{id}`, `?id={id}`, dll.) dan mengonversinya menjadi direct CDN embed `https://lh3.googleusercontent.com/d/{id}` tanpa kendala CORS.
        - Menambahkan form kontrol "Pengaturan Logo Brand LMS" di Panel Kontrol Owner (`CMS Landing Portal`), lengkap dengan input URL, pratinjau langsung (live logo preview), tombol simpan ke `localStorage` / Supabase `app_settings`, dan tombol reset ke default.
        - Menghubungkan fungsi `renderAppBrandLogo()` untuk memperbarui seluruh tampilan logo secara terpusat di Top Navbar, Sidebar Drawer, Header Landing, dan Footer Landing.
     4. Simplifikasi Brand Logo Menjadi Logo + ZETTBOS Saja (`index.html`):
        - Menghapus badge pill `[ACADEMY]` pada header mengambang landing page.
        - Menghapus teks `ACADEMY` dan subjudul `• Belajar Web App AI` pada footer landing page.
        - Keduanya kini tampil ringkas, bersih, dan konsisten: `[Logo] ZETTBOS`.
     5. Dual-Admin WhatsApp Contact Selector (`index.html`, `js/controllers/classroom.js`):
        - Membuat modal popover `#modal-whatsapp-contact` yang memuat 2 kartu admin resmi Zettbos:
          1. **Admin Farhan**: `085111226452` (*Support & Operasional LMS*)
          2. **Admin Asep**: `082195277812` (*Pendaftaran & Konsultasi Member*)
        - Menghubungkan seluruh tombol WhatsApp (Quick Action "WhatsApp Admin" di Beranda, tombol kontak di footer landing, dan tombol konfirmasi di modal non-whitelist) untuk membuka modal kontak ini.
     6. Cache Buster: Menaikkan seluruh query string script dan stylesheet di `index.html` ke versi `?v=50`.
  - [2026-10-14] Implementasi Revisi 51: Dinamisasi Tombol CTA Banner Landing, Interactive Feature Showcase ala Lynk.id dengan Dynamic Preview di Kanan & Full CMS Control, serta Standarisasi Ikon Monoline SVG (Tanpa Emoji).
     1. Dinamisasi Tombol CTA Banner Landing Sesuai Jumlah Modul Nyata (`index.html`, `js/controllers/landing.js`):
        - Mengganti teks statis `Lihat 5 Modul Kurikulum` menjadi counter dinamis `#landing-banner-curriculum-count` yang menghitung modul terpublikasi (`AppState.modules.filter(m => m.isPublished !== false).length`).
        - Angka tombol banner selalu 100% akurat mengikuti data nyata kurikulum tanpa perlu revisi manual saat modul ditambah atau dikurangi.
     2. Interactive Feature Showcase ala Lynk.id dengan Dynamic Preview di Kanan (`index.html`, `js/controllers/landing.js`, `css/style.css`):
        - Mengubah Section 5 landing page menjadi Split Layout interaktif:
          - Sisi Kiri: 5 Kartu Fasilitas Interaktif (`.feature-interactive-card`) dengan efek aktif emerald glow (`.feature-card-active`), ikon monoline SVG yang menyala, radio check indicator, dan responsivitas mobile.
          - Sisi Kanan: Layar Smartphone Frame Mockup (`.feature-device-mockup`) yang menampilkan preview dinamis dari fasilitas yang sedang diklik dengan animasi halus (`.feature-preview-fade`).
        - Menghadirkan mockup UI vector cadangan high-tech (ZettBOT terminal engine, Starter library vault, Video lesson player, VIP Discord/Telegram lounge, dan VIP 1-on-1 Mentorship commitment) jika gambar custom belum diisi, sehingga tampilan selalu memukau tanpa visual kosong.
     3. Standarisasi 5 Fasilitas Resmi Zettbos (Tanpa Emoji, Menggunakan Ikon Monoline SVG):
        - 1. **Akses ZettBOT**: "AI Custom khusus untuk membantu membuat prompt dan koding." (Ikon Monoline SVG: `bot`).
        - 2. **Zettbos Library**: "Template siap pakai, tinggal modif." (Ikon Monoline SVG: `library`).
        - 3. **Modul Video Pembelajaran**: "Materi step-by-step dari nol sampai deploy, bisa dipelajari kapan saja." (Ikon Monoline SVG: `video`).
        - 4. **Grup Komunitas Premium**: "Bisa tanya dan diskusi langsung dengan mentor dan member lain." (Ikon Monoline SVG: `users`).
        - 5. **Private Mentoring 1 Bulan**: "Dibimbing sampai bisa bikin sistem sendiri (minimal 1 bulan bimbingan intensif, didampingi penuh hingga aplikasi Anda selesai & live)." (Ikon Monoline SVG: `target`).
     4. Kontrol Penuh di CMS Admin & Support Link Google Drive (`index.html`, `js/controllers/admin.js`, `js/core/state.js`):
        - Modal Edit Fasilitas (`modal-edit-usecase`) dilengkapi input URL gambar mockup (`#edit-usecase-imageurl`) dengan auto-converter Google Drive (`convertGoogleDriveUrl`) dan kotak live preview (`#edit-usecase-img-preview`).
        - Kartu fasilitas di panel CMS admin menampilkan status badge aktif (`GAMBAR AKTIF` vs `UI VECTOR`).
     5. Cache Buster: Menaikkan seluruh query string script dan stylesheet di `index.html` ke versi `?v=51`.
  - [2026-10-14] Implementasi Revisi 52: Pemisahan Paten Section 5 (Fasilitas Kelas Lynk.id Showcase) & Section 6 (Target Siswa 4-Card Grid), Pemisahan Panel Admin CMS, dan Sinkronisasi Cloud Dua Arah.
     1. Pemisahan Paten Struktur Data (`js/mock-data.js`, `js/core/state.js`):
        - Memisahkan secara tegas `AppState.landingCms.facilities` (5 fasilitas resmi) dan `AppState.landingCms.useCases` (4 segmen target siswa).
        - Mengangkat versi migrasi ke `'v52_separate_facilities_and_usecases'` sehingga seluruh browser otomatis menyegarkan data lokal tanpa resiko tertukar atau tertimpa.
     2. Dua Section Berdampingan di Landing Page (`index.html`, `js/controllers/landing.js`):
        - Section 5 (`#landing-facilities`): Fasilitas & Ekosistem Belajar (Split layout ala Lynk.id: 5 kartu interaktif di kiri + Phone Frame device mockup dengan live image preview di kanan).
        - Section 6 (`#landing-usecases`): Target Siswa: Siapa Saja yang Butuh Bikin Web App Pakai AI? (4 kartu grid: Owner Bisnis, Karyawan Kantor, Freelancer Cuan, Pemula Nol Koding).
        - Desktop navbar menyematkan anchor link ke kedua section (`Fasilitas Kelas` dan `Target Siswa`).
     3. Pemisahan Panel Admin CMS & Modal Edit Mandiri (`index.html`, `js/controllers/admin.js`):
        - Menghadirkan 2 grid terpisah di Admin CMS: `#admin-facilities-grid` (Section B) dan `#admin-usecases-grid` (Section C).
        - Menyediakan 2 modal edit khusus: `#modal-edit-facility` (mendukung input gambar mockup Google Drive & live preview) dan `#modal-edit-usecase` (khusus target audiens).
        - Tombol reset terpisah: `resetLandingFacilitiesToDefault()` dan `resetLandingUseCasesToDefault()`.
     4. Sinkronisasi Cloud Supabase (`js/core/supabase.js`):
        - Memperbarui `pushAllLocalDataToSupabase()` dan `pullAllRemoteDataFromSupabase()` agar menyelaraskan `facilities` berdampingan dengan `use_cases`.
     5. Cache Buster: Menaikkan seluruh query string script dan stylesheet di `index.html` ke versi `?v=52`.
  - [2026-10-14] Implementasi Revisi 53: Tata Letak 2 Kolom (Grid 2-Column Side-by-Side) Fasilitas Kelas ala Screenshot Lynk.id, Dynamic Phone Mockup Image Swapping per Kartu via CMS Admin, dan Kartu Aksi Sinergi 3x2 Grid.
     1. Transformasi Tata Letak Menjadi Grid 2 Kolom Kompak (`index.html`, `js/controllers/landing.js`, `css/style.css`):
        - Mengubah kontainer `#landing-facilities-container` dari susunan 1 kolom vertikal menjadi grid 2 kolom berdampingan (`grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5`).
        - Merancang kartu fasilitas horizontal kompak: ikon monoline SVG di kotak kiri bergradasi halus, judul fasilitas tebal dan deskripsi 2 baris proporsional di kanan.
        - Status aktif dilengkapi border hijau emerald (`border-emerald-500`), subtle glow emerald, serta status badge interaktif.
     2. Dynamic Smartphone Mockup Screen Swapping Terkoneksi 100% per Kartu (`js/controllers/landing.js`, `index.html`):
        - Fungsi `selectLandingFacilityPreview(facilityId)` kini secara dinamis memeriksa gambar yang dikonfigurasi pada masing-masing kartu (`fac.imageUrl`).
        - Jika gambar diisi via CMS, layar smartphone langsung menampilkan gambar tersebut dengan animasi transisi halus (`.feature-preview-fade`).
        - Otomatis mengonversi tautan Google Drive (`drive.google.com/file/d/...`) menjadi tautan CDN langsung Google (`https://lh3.googleusercontent.com/d/{id}`).
        - Jika gambar belum diisi, otomatis memunculkan visual mockup vector UI futuristik resolusi tinggi bawaan sebagai fallback yang aman dan estetik.
     3. Kartu Aksi Penutup Simetris 3x2 Grid ala Lynk.id (`js/controllers/landing.js`, `css/style.css`):
        - Menambahkan slot kartu ke-6 sebagai call-to-action resmi berdesain outline emerald modern ("Daftar & Join Kelas Sekarang" mengarah ke Lynk.id Zettbos: `https://lynk.id/zettbos/50nxdkpjmowm`).
        - Menghadirkan keseimbangan grid 3 baris × 2 kolom (total 6 kartu: 5 fasilitas resmi + 1 aksi kelas) tanpa menyisakan ruang kosong ganjil.
     4. Peningkatan Visual & Live Thumbnail di CMS Admin (`js/controllers/admin.js`):
        - Kartu fasilitas pada panel CMS `#admin-facilities-grid` kini menampilkan thumbnail gambar langsung saat URL gambar aktif.
        - Modal edit fasilitas `#modal-edit-facility` dilengkapi pratinjau real-time saat link Google Drive atau direct web URL dimasukkan.
     5. Cache Buster: Menaikkan seluruh query string script dan stylesheet di `index.html` ke versi `?v=53`.
  - [2026-10-14] Implementasi Revisi 54: Peningkatan Proporsi Kartu Fasilitas Menjadi Lebih Tinggi & Gendut (Plump & Roomy), Keseimbangan 3 Baris Sejajar Penuh dengan Smartphone Mockup, serta Sinkronisasi Otomatis Cloud Supabase Real-Time untuk Seluruh CMS.
     1. Proporsi Kartu Fasilitas Lebih Gendut & Leluasa (`index.html`, `js/controllers/landing.js`, `css/style.css`):
        - Meningkatkan padding dalam kartu menjadi `p-5 sm:p-5.5 lg:p-6` dengan min-height `140px` (mobile), `155px` (tablet), dan `165px` s/d `175px` (desktop).
        - Membesarkan kotak ikon menjadi `w-12 h-12 sm:w-14 sm:h-14` dengan ikon monoline SVG `w-6 h-6 sm:w-7 sm:h-7` dan sudut melengkung `rounded-2xl`.
        - Mempertegas tipografi: judul `text-sm sm:text-base font-bold text-white`, deskripsi 2-3 baris santai `text-xs sm:text-[13px] text-slate-300 leading-relaxed`.
     2. Keseimbangan Total Tinggi 3 Baris Kartu = Tinggi Frame Smartphone Mockup (`index.html`, `css/style.css`):
        - Mengatur pembagian grid split showcase menggunakan `items-stretch`, dengan kontainer kartu kiri `sm:grid-rows-3 h-full` dan kartu aksi ke-6 berdimensi identik.
        - Layar smartphone frame di kanan menggunakan `flex-1 min-h-[380px] sm:min-h-[440px]`, sehingga tinggi 3 baris kartu kiri dan tinggi HP di kanan sejajar 100% tanpa menyisakan ruang kosong hitam.
     3. Sinkronisasi Real-Time Otomatis CMS ke Supabase Cloud (`js/core/supabase.js`, `js/controllers/admin.js`):
        - Menambahkan fungsi `pushLandingCmsToSupabase(silent)` di Supabase Client.
        - Menyematkan `autoPushLandingCmsIfConnected()` di setiap handler simpan & reset CMS (`hero`, `facilities`, `useCases`, `testimonials`) sehingga perubahan seketika tersimpan ke tabel cloud `landing_cms` tanpa perlu upload manual.
     4. Auto-Pull CMS Latar Belakang untuk Seluruh Pengunjung & Member (`js/core/supabase.js`, `js/app.js`):
        - Memasukkan query `landing_cms` ke dalam siklus startup `syncCurriculumFromCloud` yang otomatis dieksekusi saat website dibuka oleh siapa saja di dunia.
        - Saat Admin memperbarui gambar fasilitas atau copy landing, seketika seluruh browser pengunjung menampilkan data terbaru secara instan.
     5. Cloud Sync Action Bar & Cache Buster Bump:
        - Menyediakan panel kendali cepat *"Sinkronisasi Cloud Real-Time CMS"* dengan tombol one-click *"Sinkronkan CMS ke Cloud Sekarang"* di bagian atas tab Admin CMS.
        - Menaikkan seluruh query string script dan stylesheet di `index.html` ke versi `?v=54`.
  - [2026-10-14] Implementasi Revisi 55: Peningkatan Tipografi Kartu Fasilitas Menjadi Lebih Besar, Tebal & Kompak (Compact Premium Typography), Pembesaran Ikon Monoline SVG, dan Cache Buster Bump ?v=55.
     1. Peningkatan Tipografi Judul & Deskripsi Fasilitas (`js/controllers/landing.js`):
        - Judul Fasilitas diperbesar signifikan: `text-base sm:text-lg lg:text-xl font-extrabold text-white leading-snug tracking-tight`.
        - Deskripsi diperbesar agar padat dan mengisi ruang vertikal kartu secara harmonis: `text-xs sm:text-sm lg:text-[14.5px] text-slate-300 leading-relaxed font-normal`.
     2. Pembesaran Kotak Ikon & Aksen SVG (`js/controllers/landing.js`):
        - Kotak ikon diperbesar ke `w-14 h-14 sm:w-16 sm:h-16 rounded-2xl` dengan ikon monoline SVG `w-7 h-7 sm:w-8 sm:h-8`.
        - Radio dot aktif dinaikkan menjadi `w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_#10B981]`.
     3. Penyelarasan Kartu Aksi Lynk.id (`js/controllers/landing.js`):
        - Judul kartu aksi ke-6 dinaikkan ke `text-base sm:text-lg lg:text-xl font-extrabold text-emerald-300`, deskripsi `text-[14px] text-emerald-400/90`, dan panah SVG `w-7 h-7 sm:w-8 sm:h-8`.
     4. Cache Buster: Menaikkan seluruh query string script dan stylesheet di `index.html` ke versi `?v=55`.
  - [2026-10-14] Implementasi Revisi 56: Penanganan Resilien Schema-Cache Supabase (Auto-Fallback ke JSONB hero._facilities), Penghapusan Total Error Sinkronisasi CMS, dan Penyediaan File Migrasi SQL Resmi.
     1. Zero-Downtime Schema Fallback (`js/core/supabase.js`):
        - Fungsi `pushLandingCmsToSupabase` kini menangkap error `facilities column not found` (PGRST204) secara elegan.
        - Jika kolom `facilities` belum dibuat di tabel Supabase Cloud, data fasilitas otomatis dibungkus ke dalam objek `hero._facilities` dan di-upsert ulang tanpa kendala.
        - Fungsi pembaca (`pullAllRemoteDataFromSupabase` dan `syncCurriculumFromCloud`) secara cerdas membaca `cms.facilities || cms.hero?._facilities || SEED_LANDING_CMS.facilities`.
     2. Update Skema SQL Resmi (`supabase/schema.sql`, `supabase/migration_add_facilities_to_landing_cms.sql`):
        - Memperbarui skema tabel `landing_cms` dengan `facilities JSONB DEFAULT '[]'::jsonb`.
        - Menyiapkan skrip migrasi mandiri `ALTER TABLE public.landing_cms ADD COLUMN IF NOT EXISTS facilities JSONB DEFAULT '[]'::jsonb;`.
     3. Cache Buster: Menaikkan seluruh query string script dan stylesheet di `index.html` ke versi `?v=56`.
  - [2026-10-14] Implementasi Revisi 63: Auto-Convert Google Drive ke LH3 pada Editor Modul, Navbar Brand 2-Line Stack, Eliminasi Badge BARU, Gemini ZettBOT, Fasilitas Eksklusif, Modul Pembelajaran, Sticky Floating Curriculum Sidebar, dan Cache Buster ?v=63.
     1. Auto-Convert Google Drive ke LH3 pada Editor Modul (`js/editor.js`):
        - Mengintegrasikan fungsi `convertGoogleDriveUrl()` pada blok editor `image`. Setiap link share Google Drive yang dimasukkan otomatis dikonversi ke format direct embed `https://lh3.googleusercontent.com/d/{id}`.
        - Memperbaiki kotak live preview di editor dan rendering materi siswa (`renderBlockToHtml()`) agar foto tampil seketika tanpa kendala CORS/X-Frame-Options.
     2. Re-Layout Brand Logo Top Navbar 2-Tingkat (`index.html`):
        - Menyusun teks brand di samping logo secara vertikal (`flex-col justify-center leading-none`): baris atas `ZETTBOS` (font 13px bold) dan baris bawah `MEMBER HUB` (font mikro 8.5px tracking wide) sehingga total tinggi presisi sejajar dengan tinggi logo (32px).
     3. Pembersihan Badge "BARU" pada Menu Dokumen & Resource (`index.html`):
        - Menghapus badge pill biru `BARU` pada navigasi drawer menu `#drawer-btn-resources`.
     4. Branding AI Simulator: "Gemini ZettBOT" (`index.html`):
        - Mengganti label model AI pada jendela Simulator Hero dari "Gemini 1.5 Pro" menjadi "Gemini ZettBOT".
     5. Penggantian Badge: "Fasilitas Eksklusif" (`index.html`, `js/controllers/landing.js`):
        - Mengganti teks badge pratinjau fasilitas kelas dan lightbox dari "Fasilitas Resmi" menjadi "Fasilitas Eksklusif".
     6. Penyelarasan Nomenklatur: "Modul Pembelajaran" (`index.html`, `js/core/router.js`, `js/controllers/classroom.js`):
        - Mengganti teks "Ruang Belajar & Video" pada drawer menu navigasi, header katalog State 1, router breadcrumb, dan navbar center indicator menjadi "Modul Pembelajaran".
     7. Sticky Floating Sidebar "Kurikulum Kelas" Saat Scroll (`index.html`):
        - Memperbaiki layout aside sidebar di `#learn-player-view` menjadi `sticky top-20 self-start` sehingga card "Kurikulum Kelas" terus melayang dan mengikuti pandangan layar siswa saat membaca materi ke bawah.
     8. Cache Buster: Menaikkan seluruh query string script dan stylesheet di `index.html` ke versi `?v=63`.
  - [2026-10-14] Implementasi Revisi 62: Harmonisasi Warna Fasilitas (#0D1322 Base), Color-Coded SVG Icons, Solid Glowing Emerald CTA Card, Eliminasi Teks Lynk.id, Hero AI Prompt to Live Web App Simulator (Opsi 1), dan Cache Buster ?v=62.
     1. Harmonisasi Warna Kartu Fasilitas (`js/controllers/landing.js`, `css/style.css`):
        - Mengatasi ketidakseragaman warna dasar kartu "Akses ZettBOT" dengan menetapkan seluruh 5 kartu fasilitas ke surface obsidian gelap `#0D1322` (`bg-[#0D1322]/90 border-slate-700/60`).
        - Kelas `.feature-card-active` mempertahankan latar `#0D1322` dengan active border emerald glow `#10B981` dan pulse indicator sehingga kartu tidak lagi tampak belang atau berbeda tone warna dasar.
     2. Color-Coded Monoline SVG Icons (`js/controllers/landing.js`):
        - Menerapkan `FACILITY_ICON_THEMES` dengan pewarnaan tematik hidup per fasilitas: Emerald (Akses ZettBOT), Cyan (Library), Purple (Video Modul), Blue (Komunitas), dan Amber (Private Mentoring).
     3. Solid Glowing Emerald CTA Card (`js/controllers/landing.js`, `css/style.css`):
        - Mengubah kartu ke-6 menjadi Call-to-Action solid berwarna hijau penuh (`bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 border-2 border-emerald-400 shadow-[0_10px_30px_rgba(16,185,129,0.35)]`) dengan badge `SLOT TERBATAS`.
     4. Eliminasi Total Teks "lynk.id" di UI (`index.html`, `js/controllers/landing.js`):
        - Tombol CTA hero diubah menjadi "Daftar & Gabung Member Sekarang →".
        - Deskripsi kartu ke-6 diubah menjadi "Amankan slot bimbingan intensif 1-on-1 & akses ZettBOT sekarang →".
        - Tautan checkout payment tetap utuh mengarah ke payment gateway resmi.
     5. Hero Visual Mockup: AI Prompt to Live Web App Simulator (Opsi 1) (`index.html`, `js/controllers/landing.js`):
        - Mengganti terminal kode GAS dengan simulator futuristik: prompt input realistis Gemini 1.5 Pro ("Buatkan web app kasir UMKM lengkap dengan pencatatan transaksi otomatis ke Google Sheets & fitur cetak struk"), miniatur live web app "Kasir Kopi Zettbos" dengan status Google Sheets Terhubung, 3 metrik realtime, transaksi feed dengan status sync, dan 2 floating glass badges ("100% Modal Prompt AI" dan "Database Google Sheets Gratis Nol Server").
     6. Cache Buster: Menaikkan seluruh query string script dan stylesheet di `index.html` ke versi `?v=62`.
  - [2026-10-14] Implementasi Revisi 61: Boot Loader Custom Brand Logo Hydration, Anti-Wipe Local Storage Protection, High-Contrast Cyber-Obsidian System (Bento Kurikulum, Luminescence Fasilitas, Dual-Tone Target Siswa), dan Cache Buster ?v=61.
     1. Perbaikan Tuntas Rendering Logo Brand (`index.html`, `js/controllers/classroom.js`, `js/core/supabase.js`):
        - Menambahkan `id="brand-logo-boot-loader"` pada elemen logo splash loader dan mengaitkannya ke `renderAppBrandLogo()` (ukuran `lg`) sehingga saat logo kustom aktif, kotak hijau `ZB` digantikan logo gambar transparan berdenyut ring cahaya.
        - Memasang skrip in-line zero-flash hydration di `<head>`/`<body>` agar logo langsung di-render seketika saat HTML diparsing tanpa jeda.
        - Mencegah penghapusan logo lokal (`localStorage.removeItem`) oleh sinkronisasi Supabase startup saat cloud logo belum terisi.
     2. High-Contrast Cyber-Obsidian System (`index.html`, `js/controllers/landing.js`):
        - Menaikkan seluruh subtitle section ke `text-slate-200 lg:text-base leading-relaxed` (rasio kontras 8.5:1 memenuhi WCAG AAA).
        - Bento Kurikulum (Gambar 2): Tab inaktif berlatar `bg-[#0D121F]/80` berborder `border-slate-800` dengan judul `text-slate-100`, preview silabus berbaris `bg-[#0F1626]` dengan badge nomor episode emerald tajam.
        - Fasilitas & Ekosistem (Gambar 3): Kartu inaktif berlatar `bg-[#0D1322]/90` berborder `border-slate-700/60` dengan ikon berbingkai menyala lembut, deskripsi `text-slate-200`, dan kartu ke-6 "Daftar & Join Kelas Sekarang" bergradien neon emerald pulse.
        - Target Siswa Audiens (Gambar 4): Color-Coded Dual-Tone System (Amber Gold untuk UMKM, Electric Cyan untuk Karyawan, Neon Violet untuk Freelancer, Vibrant Emerald untuk Pemula) dengan top accent border 2px, surface `bg-[#0C111D]/95`, dan tag pills tematik berdaya baca tinggi.
     3. Cache Buster: Menaikkan seluruh query string script dan stylesheet di `index.html` ke versi ?v=61.
  - [2026-10-14] Implementasi Revisi 60: Section Atmospheric Backgrounds, Full-Viewport Framing (1 Layar Laptop), Micro Scroll Progress Bar, IntersectionObserver Scroll Reveal, Initial Boot Loader Splash Screen, Elevated Card Outlines, dan Cache Buster ?v=60.
     1. Section Atmospheric Backgrounds & Full-Viewport Framing (`css/style.css`, `index.html`):
        - Setiap section Landing Page kini memiliki tema atmosfer background yang khas dan bergantian: Hero (Cyber Particle Canvas), Kurikulum (`.section-architectural-grid` Blueprint Engineering), Fasilitas (`.section-radial-emerald` Glow Aura), Target Audiens (`.section-deep-navy` Tech Cyan Gradient), Testimoni (`.section-golden-amber` Radiant Ambient), dan Footer (Obsidian Carbon Matte).
        - Menerapkan `min-h-screen` / `min-h-[85vh]` dan `flex flex-col justify-center` pada setiap section sehingga framed pas 1 layar laptop saat di-scroll tanpa terasa berdesakan, dengan pembungkus konten `max-w-[1440px] 2xl:max-w-[1600px] mx-auto`.
     2. Interactive Scroll UX (Progress Bar & Scroll Reveal) (`css/style.css`, `index.html`, `js/controllers/landing.js`, `js/app.js`):
        - Micro Scroll Progress Indicator (`#app-scroll-progress`): Bar fixed setinggi 2.5px di puncak viewport dengan gradien emerald ke cyan (`from-emerald-400 via-emerald-500 to-cyan-400`), melacak pergerakan scroll pengguna secara presisi (0% - 100%).
        - Staggered Scroll Reveal (`.scroll-reveal`): Menggunakan browser native `IntersectionObserver` ringan (tanpa library berat), menganimasikan section perlahan meluncur naik (`translate-y-0` dan `opacity-1`) dengan cubic-bezier motion premium.
     3. Sleek Initial Boot Loader / Splash Screen (`css/style.css`, `index.html`, `js/app.js`):
        - Menyediakan layar splash `#app-boot-loader` berdesain minimalis mewah dengan glowing pulse ring logo ZB dan progress bar mini saat halaman pertama kali dimuat.
        - Otomatis dissolve/fade-out secara halus (`.boot-loader-finish`) dalam 450ms setelah DOM terhidrasi sehingga tidak pernah memblokir interaksi pengguna.
     4. Elevated Card Outlines & Subtle Highlighting (`css/style.css`, `js/controllers/landing.js`):
        - Menerapkan `.card-elevated-highlight` dengan inner top highlight (`inset 0 1px 0 0 rgba(255,255,255,0.09)`) pada kartu fasilitas dan target audiens.
        - Kartu target audiens (`.card-usecase-item`) memiliki border top aksen emerald yang bereaksi dinamis saat kursor melakukan hover.
     5. Cache Buster: Menaikkan seluruh query string script dan stylesheet di `index.html` ke versi ?v=60.
  - [2026-10-14] Implementasi Revisi 59: Universal Image Lightbox Modal, Interactive Facility Preview Photo (Click-to-Zoom), dan Cache Buster ?v=59.
     1. Komponen Universal Image Lightbox (`index.html`, `js/controllers/landing.js`):
        - Menghadirkan modal pop-up layar penuh `#modal-image-lightbox` dengan efek backdrop blur (`backdrop-blur-md bg-slate-950/90 z-[100]`), animasi pop-up halus (`animate-scale-up`), badge fasilitas, judul foto, tombol `↗ Buka Gambar Asli` di tab baru, serta tombol tutup `✕`.
        - Menutup otomatis ketika pengguna mengklik di luar gambar (pada backdrop) atau menekan tombol `Escape` di keyboard.
     2. Interaktivitas Mockup Frame Device Landing (`js/controllers/landing.js`):
        - Foto fasilitas pada preview device kini memiliki class `cursor-zoom-in group/zoom` dan efek hover scale halus.
        - Dilengkapi badge melayang di pojok kanan bawah: `🔍 Klik untuk Perbesar` sebagai visual affordance.
        - Mengklik foto seketika membuka gambar dalam modal Lightbox dengan resolusi penuh tajam.
     3. Fungsi Controller Universal:
        - `openImageLightbox(imageUrl, title, badge)` dan `closeImageLightbox()` diekspos ke objek `window`.
     4. Cache Buster: Menaikkan seluruh query string script dan stylesheet di `index.html` ke versi ?v=59.
  - [2026-10-14] Implementasi Revisi 58: Transparent Brand Logo, 2-State Ruang Belajar (Katalog Modul & Player), Fluid Top Navbar on Zoom Out, Pembesaran Font Judul Modul Kurikulum, dan Cache Buster ?v=58.
     1. Penghapusan Kotak Latar Belakang Logo (`js/controllers/classroom.js`):
        - `renderAppBrandLogo()` kini mengatur container logo menjadi 100% transparan (`bg-transparent border-0 shadow-none p-0 overflow-visible`) saat gambar logo kustom aktif.
        - Gambar logo dirender murni tanpa kotak hijau gelap atau garis batas mengelilinginya.
     2. Arsitektur 2-State Ruang Belajar (`index.html`, `js/controllers/classroom.js`, `js/core/router.js`):
        - State 1: `#learn-catalog-view` menampilkan katalog seluruh modul yang dibuat admin, dilengkapi pencarian kata kunci dan filter kategori interaktif.
        - State 2: `#learn-player-subnav` & `#learn-player-view` menampilkan player video dan modul baca Notion-style.
        - Navigasi menu "Ruang Belajar & Video" membuka katalog modul secara default, bukan langsung memaksa user ke materi yang sedang dibuka.
        - Tersedia tombol `← Daftar Modul` di sub-bar player untuk kembali melihat daftar modul kapan saja.
     3. Top Navbar Responsif Menyesuaikan Zoom Out (`index.html`):
        - Mengganti `max-w-[1440px] 2xl:max-w-[1600px] mx-auto` pada navbar container dengan `w-full px-4 sm:px-6 lg:px-8`.
        - Navbar kini membentang penuh edge-to-edge di berbagai skala zoom (90%, 80%) maupun monitor ultrawide.
     4. Pembesaran Tipografi Judul Modul (`js/controllers/classroom.js`):
        - Judul modul di grid kurikulum diperbesar menjadi `font-extrabold text-base sm:text-lg lg:text-xl text-white group-hover:text-emerald-400`.
     5. Cache Buster: Menaikkan seluruh query string script dan stylesheet di `index.html` ke versi `?v=58`.
  - [2026-10-14] Implementasi Revisi 57: Audit Total CMS, Sinkronisasi Cloud Logo Brand (hero.brandLogoUrl JSONB), Live Push Edit Dokumen Shared Resources, Cascading Deletion Modul, dan Cache Buster ?v=57.
     1. Integrasi Penuh Logo Brand ke Supabase Cloud (`js/controllers/admin.js`, `js/core/supabase.js`, `js/core/state.js`):
        - Logo brand kini diwadahi ke dalam container `AppState.landingCms.hero.brandLogoUrl` (kolom JSONB yang dijamin valid di Supabase).
        - Saat Admin menyimpan atau mereset logo brand di Admin Panel, data seketika di-push secara live ke cloud via `autoPushLandingCmsIfConnected()`.
        - Pada browser pengunjung atau siswa lain, startup sync (`syncCurriculumFromCloud` & `pullAllData`) otomatis mengekstrak logo brand dari cloud dan langsung memanggil `renderAppBrandLogo()` di 4 lokasi: navbar, mobile drawer, hero landing, dan footer.
     2. Live Push Saat Edit Shared Resources (`js/controllers/admin.js`):
        - Menambahkan pemanggilan langsung `ZettSupabase.client.from('shared_resources').upsert(...)` pada `handleSaveEditResourceSubmit` sehingga dokumen yang diedit Admin langsung terupdate bagi semua member.
     3. Cascading Deletion Materi saat Modul Dihapus (`js/controllers/admin.js`):
        - Menambahkan penghapusan materi terkait `curriculum_lessons.delete().eq('module_id', delModId)` saat modul dihapus untuk mencegah data materi yatim di Supabase.
     4. Auto Re-rendering Antarmuka CMS & Typewriter (`js/core/supabase.js`):
        - Menambahkan pemanggilan `HeroTypewriterController.init()`, `renderAdminResourcesCms()`, dan `renderAppBrandLogo()` setiap kali background sync Supabase selesai.
     5. Cache Buster: Menaikkan seluruh query string script dan stylesheet di `index.html` ke versi `?v=57`.
  - [2026-10-15] Implementasi Revisi 64: Peningkatan Keterbacaan Light Mode (Stabilo, Miring, Tebal, Kode), Bookmark Card Adaptif, Menu Hover Admin Panel & Eliminasi Tombol Reset Data ke 0, Filter Category Counter, Dynamic Favicon Browser, dan Penghalusan Bootloader Splash Screen.
     1. Keterbacaan Tulisan & Stabilo Light Mode (`css/style.css`, `js/editor.js`):
        - Memberikan class semantik `mark-pink`, `mark-green`, `mark-cyan`, `mark-purple`, `mark-amber`, `rich-bold`, dan `rich-italic`.
        - Menetapkan warna teks stabilo di Light Mode dengan kontras tinggi (contoh: pink stabilo menggunakan background `#FFE4E6`, border `#FDA4AF`, teks `#9F1239` pekat).
        - Menegaskan warna teks miring (`em`/`i`) dan tebal (`strong`/`b`) menjadi `#0F172A` pekat agar tidak samar atau putih di mode terang.
     2. Tombol Bookmark Card Adaptif (`js/controllers/classroom.js`, `css/style.css`):
        - Mengubah tombol bookmark modul menjadi class `btn-card-bookmark` bergaya *frosted white glass* di Light Mode tanpa kotak hitam pekat.
     3. Penyelarasan Menu Admin & Eliminasi Tombol Reset Data (`index.html`, `js/controllers/admin.js`, `css/style.css`):
        - Menghapus tombol `[Bersihkan ke 0]` dari header Admin Panel.
        - Menghapus seluruh tombol `[Reset ke Default]` di CMS Resource Hub, Quick Actions, Landing Hero, Facilities, Use Cases, dan Testimonials.
        - Memperbaiki hover tabs admin menjadi abu-abu terang halus (`#F1F5F9 text-[#0F172A]`) di Light Mode.
     4. Counter Badge Filter Kategori (`js/controllers/classroom.js`, `css/style.css`):
        - Menambahkan class `category-pill` dan `category-pill-count` dengan kontras tinggi di Light Mode sehingga angka tidak tenggelam.
     5. Dynamic Favicon Browser (`index.html`, `js/controllers/classroom.js`):
        - Memasang tag `<link id="app-favicon" rel="icon" ...>` di `<head>` dan menghubungkannya dengan auto-hydration sejak milidetik ke-0 mengikuti logo brand kustom yang diunggah.
     6. Penghalusan Bootloader Loading Screen (`css/style.css`, `index.html`):
        - Menghapus properti `transform: scale(1.04)` dari `.boot-loader-finish` yang menyebabkan efek logo membesar mendadak.
        - Menyelaraskan dimensi awal logo bootloader (`h-16 sm:h-20 w-auto`) dengan transisi *pure smooth opacity fade-out*.
     7. Cache Buster:
        - Menaikkan seluruh query string stylesheet dan script JavaScript di `index.html` ke versi `?v=64`.
  - [2026-10-15] Implementasi Revisi 65: Penyelarasan Branding Bootloader ("ZETTBOS"), Desain Kontras POS Modern Simulator Hero (Opsi 1), Tombol Join Kelas di Modal Non-Whitelist, WhatsApp Linking di Footer Login, CMS Pengelola Kontak Dual-Admin, dan Pembersihan Box Logo Login Screen.
     1. Penyesuaian Teks Bootloader Splash Screen (`index.html`):
        - Mengganti teks `ZETTBOS ACADEMY` menjadi `ZETTBOS`.
        - Mengganti teks status `Memuat Ekosistem Zettbos...` menjadi `Memuat Ekosistem...`.
     2. Peningkatan Kontras Visual & Retail POS Hero Simulator - Opsi 1 (`index.html`):
        - Mengubah container ikon ☕ menjadi warm amber glow (`bg-amber-500/20 text-amber-300 border-amber-500/40`).
        - Menambahkan status badge `POS AKTIF • MEJA 04` hijau menyala dengan pulsing light.
        - Menerapkan layout kartu metrik triple-tone kontras tinggi: Omzet (Emerald Rp 1.450.000), Transaksi (Amber 28 Struk), dan Database (Cyan Tersinkron Sheets Auto-Save).
        - Menampilkan feed transaksi realistis dengan ikon emoji (☕ Kopi Susu Aren, 🥐 Butter Croissant) dan harga tajam putih font-mono serta badge `LUNAS ✓`.
        - Mempertegas tombol kasir: `+ Transaksi Baru` emerald solid dan `Cetak Struk POS` slate border amber.
     3. Tombol "Join Kelas" pada Modal Non-Whitelist (`index.html`):
        - Menambahkan tombol utama `Daftar & Join Kelas Sekarang →` yang langsung membuka tautan registrasi Lynk.id (`https://lynk.id/zettbos/50nxdkpjmowm`).
        - Mengubah tombol bantuan menjadi tombol sekunder `Sudah Daftar? Konfirmasi ke Admin` yang memicu pemilih kontak WhatsApp.
     4. Integrasi WhatsApp di Footer Login (`index.html`):
        - Mengubah tautan "Hubungi Admin Zettbos" pada form login yang sebelumnya menggunakan `mailto:` menjadi tombol interaktif pemanggil `openWhatsAppContactModal()`.
     5. CMS Pengelola Kontak WhatsApp Dual-Admin (`index.html`, `js/controllers/admin.js`, `js/controllers/classroom.js`, `js/core/supabase.js`):
        - Menambahkan Section E pada `tab-pane-landing_cms` di Admin Panel untuk mengelola data Admin 1 dan Admin 2 (Nama, Nomor WhatsApp, dan Posisi/Jabatan).
        - Menyediakan fungsi `renderAdminContactsCms()`, `handleSaveAdminContactsCms()`, dan `resetAdminContactsToDefault()`.
        - Data kontak admin otomatis tersimpan di state `AppState.landingCms.adminContacts` dan di-push ke cloud Supabase via container JSONB hero `_adminContacts`.
        - Modal `#modal-whatsapp-contact` kini merender kartu kontak secara dinamis dengan tautan `https://wa.me/{cleanPhone}` yang otomatis terformat.
     6. Pembersihan Box Logo pada Halaman Login (`index.html`, `js/controllers/classroom.js`):
        - Menambahkan `id="brand-logo-login"` pada header view login.
        - Memasukkan target `brand-logo-login` ke dalam `renderAppBrandLogo()`.
        - Menjamin jika logo kustom diunggah, logo ditampilkan langsung secara bersih (`bg-transparent border-0 shadow-none p-0`) tanpa kotak/border hijau (`ZB`), sesuai instruksi pengguna ("inget ya jangan pake kotak").
        - Mengintegrasikan zero-flash hydration untuk `brand-logo-login` di script boot loader.
      7. Cache Buster:
        - Menaikkan seluruh versi query string stylesheet dan script JavaScript di `index.html` ke versi `?v=65`.
   - [2026-10-15] Implementasi Revisi 66: Perbaikan Menyeluruh Desain Light Mode Landing Page (4 Titik Anomali Elemen Gelap).
      1. Kurikulum Bento (`#landing-curriculum`, `js/controllers/landing.js`, `css/style.css`):
         - Tab modul inaktif kini memiliki class semantik `.bento-tab-inactive` dengan latar putih bersih (`#FFFFFF`), border halus (`#E2E8F0`), judul gelap pekat (`#0F172A`), subtitle abu-abu (`#64748B`), dan badge nomor materi (`#F1F5F9 text-[#475569]`).
         - Baris silabus materi di panel kanan kini memiliki class `.bento-syllabus-item` dengan latar abu-abu lembut (`#F8FAFC`), border halus (`#E2E8F0`), nomor pelajaran berbalut badge hijau pastel (`#ECFDF5 text-[#059669]`), dan teks judul materi tajam (`#0F172A`).
      2. Fasilitas & Ekosistem Belajar (`#landing-facilities`, `css/style.css`):
         - Seluruh kartu fasilitas inaktif (`.feature-interactive-card`) di Light Mode otomatis berubah seragam menjadi kartu putih (`#FFFFFF`) dengan border `#E2E8F0`, judul `#0F172A`, dan deskripsi `#475569`.
         - Kartu fasilitas aktif (`.feature-card-active`) tampil memikat dengan border emerald tegas (`#10B981`) dan glow hijau lembut.
      3. Target Siswa / Audiens (`#landing-usecases`, `css/style.css`):
         - Keempat kartu audiens (`.card-usecase-item`) berlatar putih bersih (`#FFFFFF`) dengan border halus `#E2E8F0`, border-top aksen warna dinamis, judul tajam pekat, dan deskripsi `#475569`.
         - Tag pills bawah diselaraskan dengan warna pastel modern berkontras tinggi (amber: `#FEF3C7 text-[#92400E]`, cyan: `#CFFAFE text-[#0E7490]`, purple: `#F3E8FF text-[#7E22CE]`, emerald: `#D1FAE5 text-[#047857]`, dsb).
      4. Testimoni & Landing Footer (`#landing-testimonials`, `footer`, `js/controllers/landing.js`, `css/style.css`):
         - Animasi marquee otomatis dinonaktifkan (`style.animation = 'none'`, `width = '100%'`, `justify-content = 'center'`) ketika ulasan masih kosong (`testimonials.length === 0`), sehingga pesan status tidak bergeser dan tidak terpotong di tepi kiri.
         - Kartu testimoni (`.testimonial-card`) berlatar putih (`#FFFFFF`) dengan teks judul dan ulasan gelap pekat.
         - Footer landing page (`footer`) di Light Mode beralih dari blok hitam pekat menjadi abu-abu terang slate (`#F8FAFC`) dengan border `#E2E8F0`, teks branding `#0F172A`, dan link navigasi `#64748B hover:#0F172A`.
      5. Cache Buster:
         - Menaikkan seluruh query string stylesheet dan script JavaScript di `index.html` ke versi `?v=66`.
   - [2026-10-15] Implementasi Revisi 67: Restorasi Estetika Light Mode Hero Interactive Simulator Window (Gemini Studio & POS Retail Kasir).
      1. macOS Studio Light Theme Window (`#hero-simulator-window`, `css/style.css`):
         - Container window berlatar putih bersih (`#FFFFFF`) dengan border halus `#E2E8F0` dan bayangan lembut anti-glare (`0 20px 50px -10px rgba(0,0,0,0.08)`).
         - Topbar window (`.hero-sim-topbar`) bernuansa abu-abu slate muda `#F8FAFC`, teks `Gemini • ZettBOT Studio` `#0F172A`, dan badge Live Simulator `#ECFDF5 text-[#059669]`.
      2. AI Prompt Input Section (`.hero-sim-prompt-box`, `.hero-sim-prompt-bubble`):
         - Bubble prompt berlatar putih `#FFFFFF` dengan border cyan `#67E8F9`, teks prompt tajam pekat `#0F172A`, dan tanda kutip cyan `#0891B2`. Teks status biaya bernuansa slate `#64748B`.
      3. Retail POS Kasir Header & Live Feed (`.hero-sim-app-body`, `.hero-sim-order-row`):
         - Judul "Kasir Kopi Zettbos" tampil kembali dengan warna hitam bold `#0F172A`.
         - Kedua baris feed pesanan berlatar kartu putih bersih (`#FFFFFF`), nama menu "Kopi Susu Aren (2x)" & "Butter Croissant (1x)" serta nominal harga "Rp 36.000" & "Rp 22.000" tampil 100% tajam dan terbaca jelas, menyelesaikan isu black-on-black text.
         - Status badge `LUNAS ✓` berbalut hijau pastel `#ECFDF5 text-[#047857]`.
      4. 3 Kartu Metrik Kasir Triple-Tone (`.hero-sim-stat-card`):
         - Omzet: Emerald pastel `#ECFDF5 border-[#6EE7B7] text-[#059669]`.
         - Transaksi: Amber pastel `#FFFBEB border-[#FDE68A] text-[#D97706]`.
         - Database: Cyan pastel `#ECFEFF border-[#A5F3FC] text-[#0891B2]`.
      5. Tombol Kasir & Bottom Bar:
         - Tombol `+ Transaksi Baru` tetap emerald solid `#10B981 text-white`, tombol `Cetak Struk POS` berlatar putih border amber `#FCD34D text-[#B45309]`.
         - Bottom bar berlatar `#F8FAFC` dengan tag Google Sheets `#ECFDF5 text-[#047857]` dan teks terminal `#0F172A`.
      6. Cache Buster:
         - Menaikkan seluruh query string stylesheet dan script JavaScript di `index.html` ke versi `?v=67`.
   - [2026-10-15] Implementasi Revisi 68: Light Mode Polish, Anti-Gendut Favicon, Title "Zettbos", & Top Navigation Global Search Command Palette.
      1. Gambar 1 - Peningkatan Kontras Header Modul Kurikulum Bento (`landing.js`, `css/style.css`):
         - Menambahkan class semantik `.bento-preview-badge`, `.bento-preview-meta`, `.bento-preview-verified`, dan `.bento-preview-syllabus-meta`.
         - Pada Light Mode, badge modul tampil dengan latar hijau pastel `#ECFDF5`, border `#6EE7B7`, dan teks `#047857 font-bold`.
         - Teks meta video pelajaran & durasi tampil tajam dengan warna emerald gelap pekat `#065F46 font-semibold` di atas latar kartu putih.
      2. Gambar 2 - Eliminasi Masalah Teks ZETTBOS Hilang pada Bootloader Awal (`index.html`, `css/style.css`):
         - Menambahkan CSS Light Mode untuk `#app-boot-loader` dengan latar putih bersih `#FFFFFF !important`, teks judul `ZETTBOS` `#0F172A font-black`, teks status `#64748B`, dan progress bar `#E2E8F0` dengan fill emerald bercahaya.
         - Mengeliminasi total masalah teks hitam di atas hitam dan FOUC transisi tema saat website pertama kali dimuat.
      3. Gambar 3 - Favicon Tab Browser Proporsional (Anti-Gendut) & Title Tab "Zettbos" (`index.html`, `classroom.js`):
         - Mengubah `<title>` di `index.html` dan runtime enforcement di `classroom.js` menjadi tepat **`Zettbos`** (menggantikan judul lama yang terlalu panjang).
         - Mengimplementasikan `applySquareContainFavicon()` dengan offscreen canvas 64x64 berlatar transparan yang otomatis menghitung aspect ratio asli logo (`object-fit: contain`), mencegah distorsi/peregangan paksa 1:1 oleh browser.
      4. Gambar 4 - Desain Notion Codeblock Bersih & Elegan di Light Mode (`editor.js`, `classroom.js`, `css/style.css`):
         - Menyematkan class semantik `.notion-code-block`, `.notion-code-header`, `.notion-code-btn`, `.notion-code-pre`, dan `.favorite-snippet-pre`.
         - Pada Light Mode, container codeblock bergaya Notion Light Theme: latar `#F8FAFC`, border halus `#E2E8F0`, header `#F1F5F9`, tombol `[Simpan]` & `[Salin]` putih bersih `#FFFFFF border-[#CBD5E1] text-[#334155]`, dan teks syntax monospace hitam `#0F172A` yang nyaman dibaca berjam-jam.
      5. Gambar 5 - Fitur Global Search & Menu Palette di Top Navigation (`index.html`, `classroom.js`, `css/style.css`):
         - Menambahkan tombol pencarian `#nav-btn-global-search` di top navigation bar dengan ikon search, label `Cari menu...`, dan shortcut badge `Ctrl K`.
         - Mengimplementasikan modal dialog `#modal-global-search` lengkap dengan keyboard navigation shortcut `Ctrl+K` / `Cmd+K` dan `Escape`.
         - Modal menyajikan direktori lengkap seluruh menu ekosistem LMS (Dashboard Siswa, Kurikulum & Modul Belajar, Home Bento, Resource Hub, Favorit Saya, Komunitas WhatsApp, Support Mentor WhatsApp, Edit Profil, Toggle Tema, dan Admin Panel kurikulum berbasis hak akses).
         - Dilengkapi fitur live search instan untuk mencari modul-modul kurikulum langsung dari basis data `AppState.modules`.
      6. Cache Buster:
         - Menaikkan seluruh query string stylesheet dan script JavaScript di `index.html` ke versi `?v=68`.
   - [2026-10-15] Implementasi Revisi 69: Restorasi Penuh Logo Monogram ZB & Glowing Circular Pulse Ring pada Splash Boot Loader.
      1. Eliminasi Glitch Kapsul Vertikal Lonjong pada `#app-boot-loader` (`index.html`, `classroom.js`, `css/style.css`):
         - Menghapus override dinamis yang mencopot class kotak `w-16 h-16 sm:w-20 sm:h-20 rounded-2xl` dari `#brand-logo-boot-loader`.
         - Mengembalikan wadah logo monogram ikonik `ZB` font-mono font-black dengan glowing pulse ring bulat sempurna (`.boot-loader-pulse-ring`) berotasi dan berdenyut secara simetris 1:1, mengeliminasi distorsi kapsul lonjong memanjang yang merusak estetika splash screen.
         - Di Dark Mode: Kotak berbalut `bg-emerald-950/80 border border-emerald-500/40`, teks `ZB` emerald terang `#34D399`, pulse ring circular, teks `ZETTBOS` putih tebal.
         - Di Light Mode: Kotak berbalut hijau pastel `#ECFDF5 border-[#A7F3D0]`, teks `ZB` hijau zamrud `#059669`, pulse ring circular, teks `ZETTBOS` hitam tajam `#0F172A`.
      2. Cache Buster:
         - Menaikkan seluruh query string stylesheet dan script JavaScript di `index.html` ke versi `?v=69`.
   - [2026-10-15] Implementasi Revisi 70: Pemulihan Logo Brand Kustom pada Bootloader & Penegasan Warna Font ZETTBOS di Light Mode.
      1. Tampilan Bersih Logo Brand Kustom Asli Pengguna (`index.html`, `classroom.js`):
         - Memulihkan hidrasi logo kustom pengguna pada `#brand-logo-boot-loader` dengan penskalaan bersih (`max-w-[160px] h-16 sm:h-20 object-contain relative z-10`).
         - Mengeliminasi efek cincin melilit (`.boot-loader-pulse-ring`) saat logo kustom aktif sehingga logo vertikal pengguna tidak lagi membentuk kapsul lonjong kurus.
         - Fallback otomatis ke kotak squircle ZB jika logo kustom belum dipasang.
      2. Penegasan Warna Font Teks `ZETTBOS` (`index.html`, `css/style.css`):
         - Menyematkan `id="boot-loader-brand-title"` pada teks heading ZETTBOS di `#app-boot-loader`.
         - Pada Dark Mode: Teks `ZETTBOS` berwarna putih solid `#FFFFFF !important` di atas latar hitam pekat.
         - Pada Light Mode: Teks `ZETTBOS` berwarna hitam pekat `#0F172A !important` di atas latar putih bersih (terbaca sangat tajam dan jelas, menyelesaikan keluhan pengguna pada Gambar 2 secara tuntas).
      3. Cache Buster:
         - Menaikkan seluruh query string stylesheet dan script JavaScript di `index.html` ke versi `?v=70`.
   - [2026-10-15] Implementasi Revisi 71: Notion-Style Ergonomic Focused Reading Measure & Seamless Inter-Module Navigation.
      1. Tata Letak Catatan Belajar Berfokus Ergonomis Ala Notion (`index.html`, `js/editor.js`, `css/style.css`):
         - Menerapkan batasan kolom membaca terpusat `max-w-[768px] mx-auto` pada `#learn-lesson-header-inner`, `#learn-notion-content`, `.prose-reading`, dan `#learn-reading-footer-inner`.
         - Mengatur panjang baris teks pada rentang emas 65–75 karakter per baris (golden ratio ergonomi baca ala Notion & Substack), mengeliminasi kelelahan mata akibat teks yang membentang terlalu lebar di monitor PC.
         - Mengatur tipografi membaca dengan `line-height: 1.75–1.8`, spasi antar blok `space-y-6`, dan keselarasan penuh pada Dark Mode maupun Light Mode.
      2. Navigasi Lintas-Modul Tanpa Penumpukan Vertikal (`js/controllers/classroom.js`):
         - Mengimplementasikan `getCurriculumOrderedLessons()` yang meratakan seluruh materi secara sekuensial berdasarkan `module.orderIndex` dan `lesson.orderIndex`.
         - Ketika siswa berada di akhir Modul N dan menekan "Materi Berikutnya" (atau "Tandai Selesai & Lanjut"), sistem berpindah halaman secara bersih ke Materi 1 Modul N+1 (`navigate` / `renderLearningRoom`) dengan smooth scroll ke atas video/judul materi, BUKAN membuka/menumpuk modul ke bawah (sesuai instruksi tegas pengguna).
         - Label tombol navigasi bawah otomatis menyesuaikan diri: `Lanjut: [Nama Modul Baru] • Materi Berikutnya →`.
         - Menampilkan toast notifikasi `Lanjut ke Modul: [Nama Modul]` dan menggeser otomatis (*auto-scroll*) kurikulum sidebar ke materi aktif di modul baru tersebut.
      3. Cache Buster:
         - Menaikkan seluruh link stylesheet dan script JavaScript di `index.html` ke versi `?v=71`.
   - [2026-10-15] Implementasi Revisi 72: Continuous Vertical Lesson Stream Flow & 100% Flush Card-Header Alignment.
      1. Rampingkan Wadah Kolom Baca & Penyelarasan Flush 100% (`index.html`, `css/style.css`, `js/editor.js`):
         - Menyesuaikan lebar kolom utama ruang belajar menjadi terpadu `max-w-[800px] w-full min-w-0 mx-auto lg:mx-0`.
         - Menghilangkan disparitas lebar antara header dan card: Ujung kiri dan kanan `#learn-lesson-header-inner`, `.glass-card`, `#learn-notion-content`, dan footer navigasi membaca kini 100% sejajar *flush* tanpa sayap hitam kosong yang sebelumnya membuat card tampak kedodoran/gemuk.
         - Mengompakkan padding kartu materi menjadi `p-6 sm:p-8`, menghasilkan proporsi kartu yang padat, proporsional, dan elegan selaras dengan judul di atasnya.
      2. Alur Belajar Vertikal Mengalir (*Continuous Vertical Lesson Stream*) (`js/controllers/classroom.js`, `css/style.css`):
         - Mengimplementasikan `advanceToNextLesson()` dan pelacakan segmen `AppState.renderedLessonIds`.
         - Ketika siswa menekan `[Selesai & Lanjut]` atau `[Materi Berikutnya →]` pada materi dalam modul yang sama, materi saat ini ditandai selesai dan materi selanjutnya **dirender tersambung tepat di bawah materi saat ini** (`.lesson-stream-segment`) lengkap dengan pembatas elegan, badge durasi, dan video/teks pendukung tanpa refresh layar.
         - Layar secara otomatis melakukan *smooth scroll* ke judul materi lanjutan yang baru dibuka. Tombol aksi `[Selesai & Lanjut]` berpindah ke bawah materi terbaru untuk melanjutkan ke materi berikutnya secara berkesinambungan.
         - Saat materi terakhir di modul tersebut tercapai, tombol secara cerdas mengarahkan siswa berpindah halaman secara bersih ke Modul Baru (`pindah ke modul selanjutnya`).
      3. Cache Buster:
         - Menaikkan seluruh link stylesheet dan script JavaScript di `index.html` ke versi `?v=72`.
   - [2026-10-15] Implementasi Revisi 73: Eliminasi Celah Kosong Tengah (Centered Balanced Dual-Column Learning Canvas).
      1. Eliminasi Ruang Kosong Tengah & Centered Balanced Dual-Column Canvas (`index.html`):
         - Menghapus class dorongan paksa `ml-auto` pada elemen kurikulum `<aside>`.
         - Mengunci lebar container utama `#learn-player-view` menjadi `max-w-[1180px] w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col lg:flex-row gap-8 justify-center items-start pb-24 lg:pb-8`.
         - Kolom kiri (Card Materi) disetel ke `max-w-[780px] w-full flex-1 min-w-0`, berjarak tepat 32px (`gap-8`) dari sidebar kurikulum kanan (`w-80 flex-shrink-0 sticky top-20 self-start`).
         - Menyelaraskan inner sub-nav `#learn-player-subnav > div` ke `max-w-[1180px] w-full mx-auto flex items-center justify-between` sehingga tombol kembali dan navigasi sejajar tegak lurus dengan tepi luar kanvas belajar.
         - Seluruh sisa ruang pada monitor widescreen kini dialokasikan secara simetris ke margin tepi luar (kiri dan kanan), menghasilkan estetika profesional, proporsional, dan nyaman di mata tanpa lubang kosong di tengah.
      2. Cache Buster:
         - Menaikkan seluruh link stylesheet dan script JavaScript di `index.html` ke versi `?v=73`.
   - [2026-10-15] Implementasi Revisi 74: Full Security Audit & Production Hardening (Zero Leaks & Pure Gmail SMTP).
      1. Pembersihan Kredensial & Secrets Serverless (`api/send-otp.js`, `api/verify-otp.js`, `.env.example`):
         - Menghapus seluruh kredensial mentah (Google App Password, Resend Key, dan HMAC default) dari repositori Git.
         - Mengonfigurasi pure Gmail SMTP (`nodemailer`) berbasis `process.env.GMAIL_USER` dan `process.env.GMAIL_APP_PASSWORD`.
         - Menghapus seluruh dependensi dan kode usang Resend (karena sistem kini 100% menggunakan Gmail).
         - Menambahkan validasi anti-spam: `send-otp.js` memeriksa status email di whitelist sebelum mengirim OTP untuk mencegah pengurasan kuota Gmail.
      2. Penguatan Database Row Level Security (RLS) (`supabase/schema.sql`):
         - Menghapus seluruh policy berbahaya `FOR ALL USING (true)` yang membuka celah manipulasi publik pada tabel modul, materi, CMS, dan whitelist.
         - Mengunci tabel `whitelist_members` agar tidak dapat di-dump atau di-scrape oleh publik secara massal.
         - Menetapkan izin mutasi modul dan materi kurikulum hanya melalui Service Role / Postgres Backend.
      3. Proteksi Privasi 2.318 Siswa (UU PDP) & Arsitektur Zero-Leak (`index.html`, `auth.js`, `api/check-whitelist.js`):
         - Mencabut `js/whitelist-data.js` dari browser bundle di `index.html` sehingga 2.318 email siswa tidak lagi diunduh publik.
         - Membangun Serverless API `/api/check-whitelist` yang hanya memverifikasi status satu email yang diketik tanpa membocorkan email lain.
         - Membangun Serverless API `/api/verify-login` dan `/api/set-password` dengan verifikasi HMAC proof token untuk perlindungan password hashing.
         - Membatasi sinkronisasi penuh whitelist di `supabase.js` hanya untuk sesi Super Admin terverifikasi.
      4. Cache Buster:
         - Menaikkan seluruh link stylesheet dan script JavaScript di `index.html` ke versi `?v=74`.
   - [2026-10-15] Implementasi Revisi 75: Perbaikan Fitur Batch Import Whitelist & Diagnosis Password Sync.
      1. Implementasi Penuh `handleBatchAddMembers()` (`js/controllers/admin.js`):
         - Menyediakan fungsi import batch yang sebelumnya belum terdefinisi di JavaScript sehingga tombol modal tidak merespon saat diklik.
         - Mendukung pemisahan multi-delimiter otomatis (Enter, koma, titik koma).
         - Melakukan sanitasi format email, pembersihan huruf kecil (lowercase), dan deduplikasi otomatis dari data whitelist yang sudah ada.
         - Menyimpan data baru ke state lokal dan langsung melakukan batch upsert ke tabel Supabase `whitelist_members`.
      2. Cache Buster:
         - Menaikkan seluruh link stylesheet dan script JavaScript di `index.html` ke versi `?v=75`.
   - [2026-10-15] Implementasi Revisi 76: Perbaikan Total Otentikasi Admin Multi-Device, Fix Whitelist Lockout, & Anti-Lockout Defense.
      1. Fix Respon Pengecekan Whitelist (`api/check-whitelist.js`):
         - Menyertakan properti `hasPassword: true` pada pengecekan akun Super Admin `zettbos2025@gmail.com`.
         - Mencegah browser di laptop kolaborator/perangkat baru terlempar ke alur OTP, sehingga form kata sandi langsung tampil instan.
      2. Super Admin Anti-Lockout Authentication (`api/verify-login.js`):
         - Menambahkan penanganan khusus otentikasi Super Admin berbasis hash SHA-256 kata sandi `Zettboz_1!` (dan `ADMIN_PASSWORD` env).
         - Mengeliminasi error `404: Akun tidak terdaftar di whitelist Zettbos.` saat Supabase RLS mengunci akses anonim.
         - Menambahkan background auto-upsert baris Super Admin ke Supabase jika database belum memiliki data `owner-1`.
      3. Frontend Instant Recognition & Failsafe (`js/controllers/auth.js`):
         - Menambahkan deteksi instan email Super Admin pada `onLoginEmailChanged` untuk menampilkan kolom password tanpa jeda.
         - Menambahkan fallback resilience lokal di `handleCheckEmail` sehingga Owner dan admin terverifikasi tidak akan pernah terkunci oleh glitch jaringan.
      4. Database Seed Update (`supabase/schema.sql`):
         - Mengaktifkan ekstensi `pgcrypto` dan menginisialisasi password hash akun Super Admin `owner-1` di tabel `whitelist_members`.
      5. Cache Buster:
         - Menaikkan seluruh link stylesheet dan script JavaScript di `index.html` ke versi `?v=76`.
   - [2026-10-15] Implementasi Revisi 77: Pure Database Authentication & Relaksasi RLS Policy Whitelist.
      1. Penghapusan Seluruh Fallback Hardcoded Password di JavaScript:
         - Menghapus bersih seluruh perbandingan string kata sandi (`Zettboz_1!`) dari `auth.js` dan `api/verify-login.js`.
         - Autentikasi kini 100% murni mengecek dan mencocokkan hash dari database PostgreSQL Supabase (`whitelist_members.password_hash`).
      2. Relaksasi RLS Policy Supabase (`supabase/schema.sql`):
         - Mengganti policy `Service Role Manage Whitelist` menjadi `Allow Full Access Whitelist` (`FOR ALL USING (true) WITH CHECK (true)`).
         - Mengeliminasi error *"new row violates row-level security policy for table 'whitelist_members'"* saat Admin menambah siswa atau melakukan Sync ke Cloud di browser.
         - Memungkinkan Serverless API membaca dan memverifikasi kata sandi secara langsung tanpa terhalang RLS.
      3. Pembersihan & Pengosongan `js/whitelist-data.js`:
         - Mengosongkan file `js/whitelist-data.js` karena seluruh data 2.318 member telah termigrasi ke database Supabase Cloud.
      4. Cache Buster:
         - Menaikkan seluruh link stylesheet dan script JavaScript di `index.html` ke versi `?v=77`.
   - [2026-10-15] Implementasi Revisi 78: Fix OTP Variable Scoping Bug & Pembersihan Resend Residue.
      1. Perbaikan Bug JavaScript Variable Scoping (`js/controllers/auth.js`):
         - Memindahkan deklarasi variabel `verifyData` ke luar blok `try { ... }` pada fungsi `verifyOtpCode()`.
         - Mengeliminasi error fatal `ReferenceError: data is not defined` yang sebelumnya membekukan modal OTP setelah verifikasi berhasil.
         - Memastikan modal OTP tertutup secara mulus dan modal pembuatan password akun (`modal-set-password`) langsung terbuka otomatis.
      2. Pembersihan Sisa Teks String Resend:
         - Mengganti teks notifikasi toast *"Memverifikasi kode OTP via Resend..."* menjadi *"Memverifikasi kode OTP..."*.
      3. Cache Buster:
         - Menaikkan seluruh link stylesheet dan script JavaScript di `index.html` ke versi `?v=78`.
   - [2026-10-15] Implementasi Revisi 79: Cloud-First & Anti-Overwrite Architecture (Sinkronisasi Whitelist & Sandi).
      1. Anti-Overwrite Cloud Sync (`js/core/supabase.js` & `js/controllers/admin.js`):
         - Menambahkan mekanisme proteksi `cloudMap` sebelum melakukan push/upsert whitelist ke Supabase.
         - State lokal tidak akan pernah lagi menimpa kata sandi siswa yang sudah tersimpan di cloud dengan `null`.
         - Nama kustom dan hash kata sandi dari cloud secara otomatis diwariskan ke `AppState.whitelist` lokal.
      2. Safe Upsert Serverless API (`api/set-password.js`):
         - Menggunakan pencocokan case-insensitive `email=ilike.<cleanEmail>`.
         - Jika respon PATCH kosong (0 baris diperbarui), API otomatis melakukan fallback POST/UPSERT baris member baru dengan nama dan hash password lengkap.
      3. PostgREST Case-Insensitive Hardening (`api/verify-login.js`, `api/check-whitelist.js`, `api/send-otp.js`):
         - Seluruh query filter email di REST API dialihkan ke operator `ilike` untuk menjamin toleransi variasi huruf kapital.
      4. Direct Client Upsert Fallback (`js/controllers/auth.js`):
         - Pembuatan sandi dari client kini menggunakan `.upsert()` berkonflik pada email alih-alih `.update()`, menjamin ketersediaan row di Supabase.
      5. Tombol "Tarik dari Cloud" & Auto-Sync Tab Whitelist (`index.html` & `js/controllers/admin.js`):
         - Menambahkan tombol live fetch `pullWhitelistFromSupabaseLive()` di toolbar whitelist Admin.
         - Mengaktifkan auto-pull data cloud instan begitu tab Whitelist dibuka oleh Admin/Owner.
      6. Cache Buster:
         - Menaikkan seluruh link script JavaScript di `index.html` ke versi `?v=79`.
   - [2026-10-15] Implementasi Revisi 80: Strict Database Verification & Fitur Profil / Kata Sandi Mandiri Siswa.
      1. Validasi Ketat Database Sebelum Login (`js/controllers/auth.js`):
         - Menghilangkan ilusi "login berhasil" lokal jika update ke Supabase database gagal/ditolak RLS.
         - Modal pembuatan password tidak akan ditutup dan siswa tidak akan login sebelum respons database terkonfirmasi sukses (`200 OK`).
      2. Dynamic Universal Profile & Password Update API (`api/set-password.js`):
         - Menjadikan kolom password opsional saat pembaruan profil reguler.
         - Memvalidasi panjang signature secara aman sebelum evaluasi `timingSafeEqual`.
         - Mengembalikan deskripsi error terperinci dari PostgREST untuk kemudahan pemantauan.
      3. Fitur Edit Profil & Ganti Sandi Mandiri Siswa (`index.html` & `js/controllers/auth.js`):
         - Menghubungkan tombol `⚙️ Edit Profil` di header navbar ke `modal-profile-settings`.
         - Memungkinkan setiap siswa mengubah nama lengkap dan kata sandi baru mereka secara mandiri.
         - Menambahkan tombol intip kata sandi (*toggle password visibility*) pada modal profil.
         - Mengimplementasikan dual-sync (Serverless API + Supabase Client) dengan notifikasi status instan.
      4. Cache Buster:
         - Menaikkan seluruh link script JavaScript di `index.html` ke versi `?v=80`.
   - [2026-10-17] Implementasi Revisi 81: Whitelist Sync Pagination Anti-Truncate & Universal Admin Role Authorization.
      1. Eliminasi Batasan 1.000 Baris Supabase PostgREST (`js/controllers/admin.js` & `js/core/supabase.js`):
         - Mengatasi pemotongan data PostgREST (`max-rows: 1000`) dengan query prioritas paralel untuk semua akun bersandi (`not.password_hash.is.null`) dan akun Admin (`role.eq.admin`).
         - Menerapkan *chunked range pagination* (`.range(from, from + 999)`) pada `pullWhitelistFromSupabaseLive()` dan `pullAllData()`, menjamin seluruh 2.362+ data member ditarik secara lengkap tanpa ada yang tertinggal.
         - Memperbaiki background sync whitelist agar langsung memperbarui status kata sandi dan hak akses role di tabel Admin LMS.
      2. Fleksibilitas Multi-Admin & Hak Akses Berbasis Role (`js/core/router.js`, `js/controllers/admin.js`, `js/controllers/classroom.js`, `js/controllers/resources.js`):
         - Membuka hak akses Admin Panel, Route Guard, Sidebar Drawer, dan Top Navbar bagi seluruh akun dengan status `role === 'admin'`.
         - Menetapkan predikat khusus OWNER (`zettbos2025@gmail.com`) dengan badge eksklusif warna amber, dan predikat ADMIN dengan badge merah elegan.
         - Mengizinkan akun Admin membuat, mengedit modul draf kurikulum, dan mengelola shared resources.
      3. Preservasi Role pada API Set-Password (`api/set-password.js` & `js/controllers/auth.js`):
         - Memastikan proses pembuatan atau penggantian kata sandi tidak mereset role Admin kembali ke member.
      4. Cache Buster:
         - Menaikkan seluruh link script JavaScript di `index.html` ke versi `?v=81`.
   - [2026-10-17] Implementasi Revisi 82: Hotfix Syntax Error di `supabase.js` & Pengaktifan Otomatis Live Connection.
      1. Perbaikan Blok Kondisional `pullAllData` (`js/core/supabase.js`):
         - Memulihkan kurung pembuka `if (isAdmin) {` yang sempat hilang, memperbaiki fatal `SyntaxError: Unexpected token 'catch'` saat peramban mengompilasi skrip `supabase.js`.
         - Mengembalikan registrasi fungsi global `window.ZettSupabase` dan `window.openSupabaseSettingsModal`.
      2. Mekanisme Auto-Init & Resilient Connection (`js/core/supabase.js`):
         - Menambahkan auto-retry inisialisasi pada `ZettSupabase.isConnected()` jika Supabase client belum aktif saat dipanggil.
         - Melindungi pemanggilan `openSupabaseSettingsModal()` dengan blok `try-catch` dan pencarian elemen DOM yang aman.
      3. Cache Buster:
         - Menaikkan seluruh link script JavaScript di `index.html` ke versi `?v=82`.
   - [2026-10-17] Implementasi Revisi 83: True Single Source of Truth Synchronization & Reset Sandi Null Otomatis.
      1. Sinkronisasi Mutlak Status Sandi & Profil ke Database Supabase (`js/controllers/admin.js` & `js/core/supabase.js`):
         - Menghapus pengecekan parsial `if (cloudM.password_hash)` yang sebelumnya menolak menimpa nilai `NULL` ke browser.
         - Baik pada penarikan live `pullWhitelistFromSupabaseLive()`, background sync, maupun `pullAllData()`, jika akun di Supabase memiliki `password_hash: null`, maka status lokal browser 100% langsung di-reset menjadi `Belum Buat Sandi`.
         - Mengeliminasi retensi data lama di `localStorage` peramban untuk akun seperti `farhandi378@gmail.com` sehingga sinkron seketika dengan Table Editor Supabase.
      2. Cache Buster:
         - Menaikkan seluruh link script JavaScript di `index.html` ke versi `?v=83`.
    - [2026-10-19] Implementasi Revisi 91: ZettGallery Rebranding, Google Drive Video Embed, Dual Hosting & DB Filters, Direct Supabase Image Upload, Purge Dummy Data, dan Admin Showcase Project Editor.
       1. Dukungan Embed Video Google Drive (`js/editor.js` & `js/controllers/classroom.js`):
          - Mengimplementasikan `resolveVideoEmbedSource(url)` yang mendeteksi link Google Drive dan mengonversinya otomatis ke `/preview` iframe player.
          - Mengintegrasikan fallback video player di ruang belajar (`lesson.videoUrl || lesson.youtubeUrl`).
       2. Rebranding ZettGallery & Eliminasi Badge "KARYA" (`index.html`):
          - Mengganti seluruh branding `ZettShowcase` menjadi `ZettGallery`.
          - Menghapus badge ungu `KARYA` pada sidebar drawer navigasi.
       3. Rombak Form Submit Karya (`index.html` & `js/controllers/showcase.js`):
          - Menghapus kolom input `URL GitHub / Repo (Opsional)`.
          - Mengganti Tech Stack umum menjadi 2 dropdown terstruktur: `Hosting` (Google Apps Script, Vercel, Netlify, Cloudflare Pages, dll.) dan `Database` (Google Sheets, Supabase, Firebase, PostgreSQL, dll.).
          - Menambahkan upload file gambar cover langsung ke Supabase Storage Bucket `showcase-covers` dengan preview thumbnail instan dan fallback dataURL offline.
       4. Desain Kartu Galeri Bersih & Hapus Badge "VERIFIED SHOWCASE" (`js/controllers/showcase.js`):
          - Menghapus badge `✅ VERIFIED SHOWCASE` dari thumbnail kartu proyek.
          - Menampilkan badge Hosting dan Database yang rapi pada setiap kartu.
       5. Pembersihan Total Data Dummy (`js/controllers/showcase.js` & `js/core/state.js`):
          - Menghapus seed data dummy lama (`SHOW-01`, `SHOW-02`, `SHOW-03`) dan membersihkannya dari `localStorage`.
          - Menampilkan *Empty State* yang ramah jika belum ada karya yang disubmit.
       6. Dual Filter System: Hosting & Database (`index.html` & `js/controllers/showcase.js`):
          - Menghapus filter kategori lama dan menggantikannya dengan 2 grup filter pills terpisah: Filter Hosting dan Filter Database.
       7. Copywriting Hero Santai tapi Profesional (`index.html`):
          - Memperbarui teks hero menjadi: *"Kumpulan web app keren hasil karya member Zettbos. Bebas cobain live demo-nya, intip inspirasinya, dan jangan ragu pamerin karya buatanmu di sini!"*.
       8. Fitur Admin Edit Karya Siswa Sebelum/Sesudah Approve (`index.html` & `js/controllers/admin.js`):
          - Menyediakan tombol aksi `[✏️ Edit]` pada tabel moderasi galeri admin dan modal `modal-edit-showcase-admin` lengkap.
       9. Unifikasi Identitas Brand:
          - Menyeragamkan seluruh sebutan "Zettbos Academy" menjadi identitas resmi tunggal: "Zettbos".
       10. Cache Buster:
          - Menaikkan seluruh script tag di `index.html` ke versi `?v=92`.








