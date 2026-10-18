# ZETTBOS MEMBER HUB - RENCANA PERBAIKAN & BLUEPRINT REVISI 88
================================================================================
STATUS         : COMPLETED & VERIFIED (REVISI 88 SIAP DEPLOY)
ARSITEK SISTEM : ZettBOT by Zettbos (Universal Product Architect & Lead Engineering Mentor)
FOKUS UTAMA    : ZETTLINK COMPACT CARDS GRID, SUPABASE LOGO STORAGE, MEMBER PROGRESS AUDIT INSPECTOR, 2-COLUMN PINNED HERO WITH SCROLLABLE LESSONS, & VIEW-LEARN FULL-CARD CLICK
TANGGAL        : 2026-10-18
TARGET RILIS   : LMS Production Enterprise Grade v1.8.0 (v88)
================================================================================

## 1. ANALISIS KEBUTUHAN & AKAR MASALAH (ROOT CAUSE ANALYSIS)

Berdasarkan 4 gambar dan 2 pertanyaan strategis yang diajukan:

### A. Evaluasi Gambar 1 & 2 (ZettLink: Kembalikan Grid Card Kompak ala Gambar 2)
* **Akar Masalah (Gambar 1):**
  Implementasi sebelumnya mengubah ZettLink menjadi bar horizontal raksasa (accordion full-width 100%) yang membentang dari ujung kiri ke ujung kanan layar. Tampilan ini membuat ruang layar terbuang percuma dan terasa kosong melompong (terlihat tulisan *"Folder ini belum memiliki link atau file tersimpan"* melebar satu layar).
* **Kebutuhan Sebenarnya (Gambar 2):**
  Pengguna sangat menyukai **desain kartu kompak pada Gambar 2** (ukuran kartu proporsional ~320px, badge kategori di kiri atas, tanggal rilis di kanan atas, judul tebal tajam, ringkasan deskripsi, micro pills, tombol hijau *"Buka Dokumen"*, tombol salin link, dan tombol hapus untuk admin).
* **Solusi Arsitektur ZettLink:**
  1. Kembalikan layout **Responsive Card Grid** (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`) dengan desain kartu presisi seperti Gambar 2.
  2. Terapkan pengelompokan folder:
     - Pada tab *"Semua Link"*: Folder ditampilkan sebagai pemisah seksi elegan (`📁 Nama Folder • X Links`) yang langsung membawahi grid kartu-kartu link miliknya. Folder yang tidak memiliki link tidak akan ditampilkan melebar kosong.
     - Pada tab filter spesifik (misal: *ZettBOT*): Halaman hanya merender kartu-kartu yang tergabung dalam folder tersebut.
     - Perbaiki pemetaan kategori data awal (*seed data*) agar link langsung terisi ke foldernya masing-masing (Google Sheets, Starter Code, ZettBOT, dsb).

---

### B. Pertanyaan Teknis 1: Upload Logo Langsung ke Supabase Storage (Bebas Google Drive & Instan Render)
* **Kelemahan Google Drive:**
  - Link Google Drive (`drive.google.com/uc?id=...` atau `lh3.googleusercontent.com/...`) bekerja melalui *302 Redirect HTTP*, membutuhkan waktu 800ms - 2.500ms untuk resolve.
  - Sering terkena pembatasan *CORS (Cross-Origin Resource Sharing)* dan batasan kuota unduhan (*rate-limiting*), yang menyebabkan logo sering menjadi icon gambar rusak (*broken image*).
* **Solusi Supabase Storage CDN:**
  - **Sangat Bisa dan 100% Direkomendasikan.**
  - Supabase memiliki fitur bawaan **Storage Bucket** (S3-compatible) yang terhubung langsung ke Cloudflare Global CDN edge.
  - Logo yang di-upload ke bucket publik Supabase (misal: `brand-assets`) akan menghasilkan tautan permanen:
    `https://[project-id].supabase.co/storage/v1/object/public/brand-assets/logo.png`
  - Waktu render: **< 30 milidetik (Instan, zero-redirect, zero CORS issue, cache permanen)**.
  - **Rencana Fitur di LMS:** Menyediakan komponen *File Picker* langsung di Admin Panel (`CMS Landing Portal`), sehingga Admin cukup memilih file logo dari komputer/HP, sistem otomatis meng-upload ke Supabase Storage, dan logo langsung terpasang secara LIVE seketika.

---

### C. Pertanyaan Teknis 2: Admin Monitoring Progress Member (Audit Detail Per-Modul & Anti-Bohong)
* **Kondisi Saat Ini:**
  Tab *Progres Siswa* (`tab-pane-analytics`) saat ini hanya menampilkan data ringkasan berupa counter jumlah materi (misal: *"5 dari 10 Materi (50%)"*), namun belum memiliki antarmuka inspeksi detail untuk melihat modul dan episode mana saja yang sudah ditonton.
* **Solusi Arsitektur "Student Progress Inspector (Anti-Bohong)":**
  1. Menambahkan tombol aksi **`[Detail Progres]`** di setiap baris siswa pada tabel analitik.
  2. Menyediakan **Modal Audit Progres Siswa**:
     - Menampilkan identitas siswa (Nama Lengkap, Email, Total Persentase Kelulusan).
     - Menampilkan pohon kurikulum lengkap (Modul 01, Modul 02, Modul 03, dst).
     - Menampilkan status setiap video materi di dalam masing-masing modul:
       - 🟢 **Centang Hijau (Selesai):** Materi telah selesai ditonton.
       - ⚪ **Abu-abu / Belum:** Materi belum ditonton/dilewati.
  3. Dengan fitur ini, jika ada member mengklaim *"Saya sudah tonton semua modulnya mas/kak"*, Admin cukup mengetikkan email member tersebut di pencarian, klik tombol detail, dan langsung melihat bukti faktual materi apa saja yang belum ia selesaikan.
  4. Memastikan penyimpanan progres belajar siswa tersinkronisasi dua arah ke tabel Supabase (`user_progress` / state cloud) secara real-time.

---

### D. Evaluasi Gambar 3 (Pinned Module di Home: 2 Kolom & Scrollable Episode List)
* **Akar Masalah (Gambar 3):**
  Kartu modul yang di-pin saat ini dirender dalam layout 1 kolom raksasa (`space-y-6`), sehingga saat terdapat 2 modul pin, keduanya membentang 100% selebar monitor dan teksnya terlalu memanjang ke kanan. Selain itu, daftar materi hanya berupa baris pills horizontal terpotong (`+7 lainnya`).
* **Solusi Arsitektur:**
  1. Ubah pembungkus modul pin dari 1 kolom vertikal menjadi **Grid 2 Kolom Simetris**:
     `grid grid-cols-1 lg:grid-cols-2 gap-5` (1 kolom di layar HP, 2 kolom berdampingan di tablet/desktop).
  2. Ganti baris materi horizontal dengan **Daftar Episode Vertikal yang Bisa Di-Scroll**:
     Container list setinggi `max-h-44 overflow-y-auto custom-scrollbar surface-well p-1.5 space-y-1`.
  3. Setiap baris materi menampilkan: nomor episode, judul materi, durasi menit, dan indikator status selesai.
  4. Tombol aksi *"Lanjutkan Belajar Sekarang"* ditempatkan di bawah daftar episode dengan layout yang proporsional dan elegan.

---

### E. Evaluasi Gambar 4 (Menu Modul Pembelajaran: Full-Card Clickable & Pinned Priority)
* **Akar Masalah (Gambar 4):**
  Menu *"Modul Pembelajaran"* ternyata dirender oleh fungsi terpisah, yaitu `renderLearnModulesCatalog()` di dalam `view-learn` (bukan `renderClassroom()` di `view-home`). Fungsi ini masih menggunakan template lama (masih ada cover gambar 140px, belum memiliki `card.onclick` di seluruh kartu, dan urutan modul belum memprioritaskan modul yang di-pin).
* **Solusi Arsitektur:**
  1. **Full-Card Clickable:** Menerapkan event listener `card.onclick = () => navigate('learn', { lessonId: firstLessonId })` pada kontainer kartu di `renderLearnModulesCatalog()`.
  2. **Terapkan Desain Cyber Pill Typography:** Menghapus gambar banner dan menyamakan desainnya dengan kartu modul di Home (header ramping, badge modul, progress bar, dan judul tebal kontras tinggi).
  3. **Pinned Modules di Posisi Teratas:** Menyesuaikan algoritma sorting:
     `filtered.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || (a.orderIndex || 1) - (b.orderIndex || 1))`.
     Modul yang disematkan (*pinned*) otomatis tampil paling atas dengan badge khusus `★ PINNED MODUL`.

---

## 2. DETAIL TEKNIS PERUBAHAN BERKAS (STEP-BY-STEP PLAN)

### 1. [js/controllers/resources.js](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/js/controllers/resources.js)
- Rombak fungsi `renderResources()`:
  - Kembalikan render ke format **Card Grid** presisi tinggi sesuai Gambar 2 (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`).
  - Hapus tampilan box accordion raksasa yang kosong melebar satu layar.
  - Jika kategori *'all'* aktif: kelompokkan kartu di bawah header folder tipis yang elegan (`📁 Nama Folder • X Links`), dan lewati folder yang 0 link agar tidak memenuhi layar.
  - Jika filter kategori spesifik aktif: langsung render grid kartu milik kategori tersebut.
  - Perbaiki pemetaan kategori bawaan (*seed mapping*) agar resource bawaan tidak masuk ke kategori tak dikenal.

### 2. [js/controllers/classroom.js](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/js/controllers/classroom.js)
- **Modul Pilihan di Home (`renderPinnedModuleHero`)**:
  - Ganti pembungkus dari `space-y-6` menjadi `grid grid-cols-1 lg:grid-cols-2 gap-5`.
  - Ganti pills horizontal materi dengan scrollable container vertikal (`max-h-44 overflow-y-auto custom-scrollbar surface-well p-1.5 space-y-1`) mirip kartu modul biasa.
- **Katalog Modul Pembelajaran (`renderLearnModulesCatalog`)**:
  - Terapkan `card.onclick` di seluruh kartu (Full-Card Clickable).
  - Hapus cover image lama dan ganti dengan Cyber Pill Header + Bold Title.
  - Tambahkan logika pemilahan: modul dengan status `isPinned` otomatis melompat ke urutan teratas katalog dengan badge khusus.

### 3. [js/controllers/admin.js](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/js/controllers/admin.js) & [index.html](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/index.html)
- **Audit Detail Progres Member (Anti-Bohong)**:
  - Tambahkan kolom aksi di tabel `tab-pane-analytics` dengan tombol *"Audit Progres"*.
  - Buat modal baru `modal-member-progress-detail` di `index.html`:
    - Menampilkan nama & email siswa.
    - Menampilkan list modul beserta checkbox status setiap lesson (✅ Selesai / ⏳ Belum).
  - Implementasikan fungsi `openMemberProgressModal(email)` dan `closeMemberProgressModal()` di `admin.js`.
- **Upload Logo Langsung ke Supabase**:
  - Tambahkan input file `<input type="file" id="admin-brand-logo-file" accept="image/*" onchange="handleUploadLogoToSupabase(this)">` di CMS Landing Portal.
  - Buat handler `handleUploadLogoToSupabase()` yang mengunggah berkas ke Supabase Storage bucket `brand-assets` dan otomatis mengisi URL CDN-nya ke state dan database.

### 4. [index.html](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/index.html)
- Tambahkan markup `modal-member-progress-detail`.
- Bump script cache buster ke **`?v=88`**.

---

## 3. CHECKLIST PENGUJIAN AKHIR REVISI 88

- [x] **ZettLink Grid (Gambar 1 & 2):** Tampilan kembali ke kartu proporsional kompak Gambar 2, tidak lagi bar horizontal melebar raksasa.
- [x] **Folder ZettLink Bersih:** Folder dengan 0 link tidak menampilkan kotak kosong raksasa; kategori dinamis CMS tetap berfungsi.
- [x] **Supabase Logo Upload:** Admin dapat mengunggah file logo dari perangkat lokal langsung ke Supabase Storage CDN (bebas Google Drive).
- [x] **Audit Progres Member:** Admin dapat melihat daftar modul dan episode persis yang sudah ditonton vs belum ditonton oleh member tertentu.
- [x] **Pinned Modules 2 Kolom (Gambar 3):** Modul pin di Home tampil dalam 2 kolom berdampingan dan materinya bisa di-scroll vertikal.
- [x] **Modul Pembelajaran Full-Card Click (Gambar 4):** Seluruh permukaan kartu di menu Modul Pembelajaran bisa diklik dan modul pin berada di urutan teratas.
- [x] **Versi Cache Buster:** `index.html` dan script diperbarui ke `?v=88`.

================================================================================
STATUS: EKSEKUSI SELESAI & TERVERIFIKASI (SIAP COMMIT & PUSH KE GITHUB)
================================================================================


# ZETTBOS MEMBER HUB - RENCANA PERBAIKAN & BLUEPRINT REVISI 89
================================================================================
STATUS         : COMPLETED & VERIFIED (REVISI 89 SIAP DEPLOY)
ARSITEK SISTEM : ZettBOT by Zettbos (Universal Product Architect & Lead Engineering Mentor)
FOKUS UTAMA    : PINNED MODULE BOLD TITLE, MODULE CATEGORY BADGE TAGS, ZETTLINK INTERMEDIATE PREVIEW MODAL (SOP FIRST), & DUAL-WAY CLOUD SYNC FOR ZETTLINK (ADMIN PUSH + REALTIME PULL)
TANGGAL        : 2026-10-18
TARGET RILIS   : LMS Production Enterprise Grade v1.8.1 (v89)
================================================================================

## 1. ANALISIS KEBUTUHAN PENGGUNA (REVISI 89)

Berdasarkan permintaan revisi pengguna (Gambar 1, 2, 3, 4 & 5):

1. **Gambar 1 (Modul Pinned - Judul Lebih Besar & Menonjol)**:
   - **Kebutuhan:** Pada hero card modul yang disematkan (*pinned module*) di Beranda, ukuran font judul modul perlu diperbesar agar tampil gagah, berwibawa, dan langsung menarik perhatian siswa sebagai modul rekomendasi utama.
   - **Implementasi:** Mengubah kelas typography judul modul di `renderPinnedModuleHero()` dari `text-base sm:text-lg` menjadi `text-lg sm:text-xl lg:text-2xl font-black text-white group-hover:text-emerald-400 tracking-tight leading-snug`.

2. **Gambar 2 (Tag Badge Kategori pada Setiap Modul)**:
   - **Kebutuhan:** Setiap kartu modul di katalog Beranda (`renderModuleCatalogGrid`) maupun di Ruang Belajar (`renderLearnModulesCatalog`) harus memiliki tag jenis modul sesuai filter kategori (contoh: `[ANTIGRAVITY IDE]`, `[GEMINI WEB]`, `[CURSOR]`, `[VIBE CODING]`, dsb).
   - **Implementasi:** Menyematkan badge kategori berdesain cyber-pill monoline di header kartu modul:
     `<span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">${escapeHtml(mod.category || 'Kurikulum')}</span>`.

3. **Gambar 3 (ZettLink: Pratinjau Deskripsi & SOP Lengkap Sebelum Buka Link)**:
   - **Kebutuhan:** Dokumen atau tools di ZettLink seringkali memiliki SOP rahasia dan aturan ketat (contoh: *"DILARANG KERAS MENYEBARKAN TOOLS INI KELUAR GRUP"*). Siswa tidak boleh langsung dialihkan ke Google Drive / Spreadsheet saat mengklik kartu. Harus muncul modal pratinjau yang menampilkan deskripsi lengkap tanpa terpotong (`...`), dan di dalam modal tersebut barulah disediakan tombol *"Buka Dokumen Sekarang ↗"* serta *"Salin Link"*.
   - **Implementasi:**
     - Menambahkan markup `modal-resource-detail-preview` di `index.html` dengan tata letak modal responsif, header folder, badge verifikasi, teks deskripsi berformat `whitespace-pre-line` (menjaga format baris baru / SOP), serta tombol aksi.
     - Mengubah interaksi kartu ZettLink di `js/controllers/resources.js` (`renderSingleResourceCardHtml`): Baik klik kartu maupun klik tombol *"Buka Dokumen"* kini membuka `openResourceDetailModal('${item.id}')`.
     - Menyediakan fungsi `openResourceDetailModal(resId)` dan `closeResourceDetailModal()`.

4. **Gambar 4 & 5 (Tombol Cloud Sync untuk ZettLink & Realtime Auto-Update)**:
   - **Kebutuhan:** Di Admin Panel tab CMS ZettLink (`tab-pane-resources_cms`), sebelumnya belum tersedia tombol Sinkronisasi Cloud seperti pada tab Kurikulum, sehingga ketika Admin memperbarui atau menambahkan dokumen/kategori, perubahan belum terunggah serempak ke Supabase Cloud dan member belum otomatis terupdate.
   - **Implementasi:**
     - Menambahkan tombol aksi `[🔄 Sync ZettLink ke Cloud]` dan `[☁️ Tarik Data Cloud]` di header `tab-pane-resources_cms` di `index.html`.
     - Mengimplementasikan `ZettSupabase.syncZettLinkToCloudLive(showNotification)` di `js/core/supabase.js`: Melakukan batch upsert seluruh data dokumen ke tabel `shared_resources` dan menyimpan folder kategori dinamis ke `landing_cms`.
     - Mengimplementasikan `ZettSupabase.pullZettLinkFromCloudLive(silent)` di `js/core/supabase.js`: Menarik data link dokumen dan kategori terbaru dari Supabase Cloud dan langsung merefleksikannya ke tampilan antarmuka.
     - Mengintegrasikan auto-pull di router (`js/core/router.js`): Saat member berpindah ke halaman ZettLink (`navigate('resources')`), sistem otomatis memicu pembaruan latar belakang secara hening (`pullZettLinkFromCloudLive(true)`) sehingga data yang dilihat member selalu realtime dan terupdate.

---

## 2. MODIFIKASI BERKAS

| Berkas | Komponen / Fungsi | Deskripsi Perubahan |
|---|---|---|
| [js/controllers/classroom.js](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/js/controllers/classroom.js) | `renderPinnedModuleHero`, `renderModuleCatalogGrid`, `renderLearnModulesCatalog` | Perbesar font judul pinned module (`2xl font-black`), tambahkan category tag badge pill pada seluruh kartu modul. |
| [index.html](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/index.html) | `tab-pane-resources_cms`, `modal-resource-detail-preview`, script tags | Tambahkan tombol Sync Cloud di ZettLink CMS, tambahkan modal pratinjau detail SOP ZettLink, naikkan versi script ke `?v=89`. |
| [js/controllers/resources.js](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/js/controllers/resources.js) | `renderSingleResourceCardHtml`, `openResourceDetailModal`, `closeResourceDetailModal` | Arahkan klik kartu dan tombol buka ke modal deskripsi ZettLink; render teks deskripsi lengkap `whitespace-pre-line`. |
| [js/core/supabase.js](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/js/core/supabase.js) | `syncZettLinkToCloudLive`, `pullZettLinkFromCloudLive` | Tambahkan batch upsert ke tabel `shared_resources` dan sinkronisasi kategori dinamis cloud. |
| [js/core/router.js](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/js/core/router.js) | `navigate('resources')` | Pemicu auto-pull latar belakang ZettLink dari Supabase Cloud saat siswa masuk ke halaman ZettLink. |
| [revisi.md](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/revisi.md) | Dokumentasi Blueprint & Eksekusi | Ringkasan teknis dan checklist validasi Revisi 89. |

---

## 3. CHECKLIST PENGUJIAN AKHIR REVISI 89

- [x] **Judul Modul Pinned (Gambar 1):** Tampil gagah dan menonjol dengan font ekstra tebal dan lebih besar (`text-lg sm:text-xl lg:text-2xl font-black`).
- [x] **Tag Kategori Modul (Gambar 2):** Seluruh kartu modul (Pinned, Katalog Beranda, dan Ruang Belajar) menampilkan tag kategori yang sesuai (misal: `[ANTIGRAVITY IDE]`, `[GEMINI WEB]`, dsb).
- [x] **Modal Pratinjau ZettLink (Gambar 3):** Mengklik kartu atau tombol *"Buka Dokumen"* menampilkan modal deskripsi dan SOP lengkap terlebih dahulu tanpa terpotong, baru kemudian tombol *"Buka Dokumen Sekarang ↗"*.
- [x] **Tombol Sync Cloud ZettLink (Gambar 4 & 5):** Admin memiliki tombol `[🔄 Sync ZettLink ke Cloud]` dan `[☁️ Tarik Data Cloud]` di panel CMS ZettLink.
- [x] **Realtime Auto-Update:** Siswa yang membuka ZettLink otomatis mendapatkan versi data dokumen dan folder paling baru dari Supabase Cloud.
- [x] **Versi Cache Buster:** `index.html` dan seluruh berkas skrip dinaikkan ke **`?v=89`**.

================================================================================
STATUS: EKSEKUSI SELESAI & TERVERIFIKASI (SIAP COMMIT & PUSH KE GITHUB)
================================================================================

