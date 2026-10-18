# ZETTBOS MEMBER HUB - RENCANA PERBAIKAN & IMPLEMENTASI SISTEM (REVISI 87)
================================================================================
STATUS         : COMPLETED & VERIFIED (REVISI 87 SIAP DEPLOY)
ARISITEK SISTEM: ZettBOT by Zettbos (Universal Product Architect & Lead Engineering Mentor)
FOKUS UTAMA    : ZETTLINK DYNAMIC FOLDERS & CMS, FULL-CARD CLICKABLE, TYPOGRAPHY-FIRST COVERS (NO-IMAGES)
TANGGAL        : 2026-10-18
TARGET RILIS   : LMS Production Enterprise Grade v1.7.0 (v87)
================================================================================

## 1. LATAR BELAKANG & TUJUAN REVISI 87

Berdasarkan evaluasi visual, efisiensi tata ruang (space-saving), dan kebutuhan operasional di lapangan:
1. **Rebranding & Restrukturisasi Fitur "Dokumen & Resources" Menjadi "ZettLink" (Gambar 1 & 2)**:
   - Mengubah identitas fitur menjadi **"ZettLink"** di seluruh navigasi utama, drawer, breadcrumb, dan judul halaman.
   - Mengganti daftar kartu link yang terpencar menjadi **sistem folder/koleksi terstruktur ala Gambar 2**, namun mempertahankan **estetika desain Cybernetic Glassmorphic khas Zettbos (Gambar 1)**.
   - Mengubah filter kategori yang sebelumnya *hardcoded* (`Semua Dokumen`, `Google Sheets`, `Starter Code`, `Prompt & SOP`, `Google Drive`) menjadi **Dinamis via CMS Admin Panel**. Admin dapat menambah folder/kategori baru, mengubah nama, memilih ikon/badge, serta menghapus folder secara fleksibel.
2. **Optimalisasi Aksesibilitas Kartu Modul Pembelajaran (Gambar 3)**:
   - Mengatasi kendala di mana klik hanya aktif pada tombol hijau *"Masuk Modul"*.
   - Menerapkan **Full-Card Clickable**: seluruh permukaan kartu (judul, deskripsi, ruang kosong) langsung membawa siswa masuk ke modul materi pembelajaran yang relevan.
3. **Sampul Modul Typography-First & Anti-Gambar (Gambar 3 & 4)**:
   - Menghapus sampul gambar banner (tinggi ~140px) pada kartu modul dan thumbnail 16:9 pada modul pinned yang memakan ruang vertikal secara berlebihan.
   - **Katalog Modul (Gambar 3)**: Mengadopsi **Opsi Rekomendasi 1 (Cyber Pill Header & Bold Hero Typography)**. Header ramping (~42px) memuat nomor modul, badge status selesai, dan tombol favorit, diikuti oleh Judul Modul super tegas dan kontras tinggi (`font-black text-lg sm:text-xl text-white`) yang langsung terbaca dalam 0.5 detik.
   - **Modul Pilihan di Home (Gambar 4)**: Mengadopsi **Referensi Rekomendasi A (Executive Full-Width Spotlight Card)**. Banner horisontal penuh yang lapang, bebas thumbnail video kosong, dengan judul modul ekstra besar (`text-2xl sm:text-3xl font-black`), badge eksklusif rekomendasi, horizontal metrics, dan tombol aksi terarah.

---

## 2. DETAIL TEKNIS IMPLEMENTASI

### A. Fitur ZettLink: Folder Grouping & Dynamic CMS
1. **Model Data Kategori / Folder Dinamis (`AppState.resourceCategories`)**:
   - Struktur objek kategori: `{ id: 'cat-modul', name: 'Modul', icon: 'folder', badge: 'Modul Belajar', orderIndex: 1 }`.
   - Default seed: `Modul`, `ZettBOT`, `ZettPrompt`, `Zettbos Library`, `Starter Code`, `Dokumen Pendukung`.
   - Disinkronkan ke `localStorage` dan ke Supabase via `landing_cms` / storage terpusat.
2. **CMS Kelola Folder / Kategori di Admin Panel (`tab-pane-resources_cms`)**:
   - Menambahkan tabel manajemen folder/kategori ZettLink:
     - Tombol `+ Tambah Folder Baru`.
     - Modal tambah/edit folder (Nama Folder, Ikon, Badge Label).
     - Tombol Hapus Folder (dengan konfirmasi).
   - Modal Tambah & Edit Link Dokumen (`modal-add-resource` & `modal-edit-resource`) kini mengambil pilihan kategori langsung dari `AppState.resourceCategories` secara dinamis.
3. **Tampilan Pengguna ZettLink (`view-resources` di `index.html` & `resources.js`)**:
   - Filter bar atas di-render dinamis dari daftar kategori di CMS lengkap dengan counter jumlah link.
   - Tampilan utama mengelompokkan link ke dalam **Kartu Folder Glassmorphism yang Bisa Di-Expand/Collapse (Accordion)**:
     - Header Folder: Ikon Folder Kategori, Nama Folder, Badge Jumlah Link (misal `[2 Links]`), tombol panah collapse.
     - Konten Folder: Deretan item link berdesain glassmorphic (ikon tipe file, judul, deskripsi ringkas, tombol `Buka` dan `Salin`).

### B. Katalog Modul: Full-Card Clickable & Typography-First Header
1. **Full-Card Clickable**:
   - Event listener `onclick` diterapkan di tingkat kontainer kartu (`card.onclick`).
   - Elemen interaktif internal (seperti tombol bookmark favorit `toggleModuleFavorite` dan link per-episode di dalam list) diberi `event.stopPropagation()` agar tidak tumpang tindih.
2. **Desain Sampul Ramping (Tanpa Gambar Banner)**:
   - Menghapus tag `<img>` cover banner dan pembungkus tinggi 140px.
   - Menyematkan **Cyber Pill Header**:
     - Garis aksen neon di bagian atas kartu.
     - Badge nomor modul (`MODUL 01`, `MODUL 02`).
     - Badge progress penyelesaian (`X/Y Selesai`).
     - Tombol bookmark favorit di kanan atas.
   - Judul Modul diperbesar menjadi ukuran tajam dan mencolok (`text-lg sm:text-xl font-black text-white group-hover:text-emerald-400`).

### C. Home Kurikulum: Executive Full-Width Spotlight Card (Pinned Module)
1. **Desain Full-Width Tanpa Thumbnail 16:9**:
   - Menghilangkan kolom thumbnail video 16:9 yang memakan 40% kartu di sebelah kiri.
   - Tata letak diubah menjadi kartu spotlight horizontal penuh yang bersih dan mewah.
2. **Elemen Tampilan Spotlight**:
   - **Top Header**: Badge bintang emas `★ REKOMENDASI UTAMA ZETTBOS` + Badge `MODUL 01` + Status Persentase Selesai.
   - **Judul Raksasa**: `text-2xl sm:text-3xl font-black text-white leading-tight` yang terbaca instan.
   - **Deskripsi & Micro Metrics**: Total Durasi Menit, Jumlah Episode, Tingkat Kesulitan.
   - **Horizontal Lesson Highlights**: Preview 3-4 materi pertama dalam bentuk timeline/pills ringkas.
   - **Tombol CTA Menarik**: *"Lanjutkan Belajar Sekarang →"*.

---

## 3. BERKAS-BERKAS YANG DIMODIFIKASI

1. [index.html](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/index.html):
   - Penggantian teks "Dokumen & Resources" menjadi "ZettLink" (Sidebar, drawer, quick keys, breadcrumbs).
   - Kontainer kategori dinamis `#zettlink-category-tabs`.
   - Modul CMS Kategori ZettLink di Admin Panel (`tab-pane-resources_cms`).
   - Bump cache buster script ke **`?v=87`**.
2. [js/controllers/resources.js](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/js/controllers/resources.js):
   - Integrasi kategori dinamis dari `AppState.resourceCategories`.
   - Render folder accordion & grid link terstruktur.
   - Filter pencarian dan counter link per folder.
3. [js/controllers/classroom.js](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/js/controllers/classroom.js):
   - Pembaruan `renderModuleCatalogGrid`: Full-card clickable & Cyber Pill Header Typography (No Image).
   - Pembaruan `renderPinnedModuleHero`: Executive Full-Width Spotlight Card (No Image).
4. [js/controllers/admin.js](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/js/controllers/admin.js):
   - CRUD Kategori / Folder ZettLink (Tambah, Edit, Hapus).
   - Sinkronisasi dropdown kategori pada modal tambah/edit dokumen.
5. [js/core/state.js](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/js/core/state.js):
   - Inisialisasi default `AppState.resourceCategories`.
   - Sinkronisasi state lokal dan cloud.
6. [js/core/supabase.js](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/js/core/supabase.js):
   - Sinkronisasi `_resourceCategories` melalui JSONB `landing_cms.hero` tanpa perlu migrasi skema tabel Supabase.
7. [js/core/router.js](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/js/core/router.js):
   - Update breadcrumbs label `'resources'` -> `'ZettLink'`.

---

## 4. CHECKLIST PENGUJIAN AKHIR

- [x] **ZettLink Rebranding**: Seluruh navigasi, drawer, dan header menampilkan nama "ZettLink".
- [x] **Dynamic CMS Categories**: Admin dapat membuat, mengubah, dan menghapus kategori/folder ZettLink tanpa kodingan.
- [x] **Folder Structure Ala Gambar 2**: Dokumen ZettLink terkelompok rapi dalam folder expandable dengan desain Gambar 1.
- [x] **Full-Card Clickable**: Siswa dapat mengklik di mana saja pada kartu modul untuk langsung masuk belajar.
- [x] **No-Image Module Catalog**: Sampul modul bersih dari gambar berat, judul terbaca jelas dalam hitungan milidetik.
- [x] **No-Image Pinned Hero**: Modul pilihan di Home tampil sebagai spotlight banner elegan yang hemat ruang.
- [x] **Cache Buster Updated**: Seluruh script berjalan di versi `?v=87`.87`.
