# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# Projek: Zettbos LMS (Member Hub & Notion-Style Learning Management System)
================================================================================
VERSI DOKUMEN : v1.2.0
STATUS DOKUMEN: PENDING APPROVAL (MENUNGGU KONFIRMASI PENGGUNA)
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
  1. `/landing`: Zettbos Academy Welcome / Landing Portal (Inspirasi referensi.html: Floating Pill Header, Hero Section dengan One-Line Instant Email Input & Layered Floating Cards, Overlap Banner, Bento Split Curriculum Showcase 5-tab, dan Audience Use-Case 4-Column Grid dengan Micro-Tag Pills).
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
  - [2026-10-13] Implementasi Revisi 15: Zettbos Academy Landing Portal & Integrasi Komponen Referensi.html. Pembangunan Landing Portal pra-login berkelas studio (Floating Pill Header, Hero Section dengan One-Line Email Input & 3D Layered Mockups, Floating Overlap Banner, Bento Split Curriculum Showcase 5-tab, dan Audience Use-Case Cards dengan micro-tag pills), serta injeksi micro-tag chips dan use-case style pada menu-menu internal LMS.
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
