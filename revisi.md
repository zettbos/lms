# ZETTBOS MEMBER HUB - DOKUMEN REVISI AKTIF (REVISI 40)
================================================================================
STATUS: SUKSES DITERAPKAN (READY TO PUSH TO GITHUB & VERCEL)
FOKUS: 1. CARD CLICKABILITY: SELURUH AREA KARTU MODUL DAPAT DIKLIK LANGSUNG
       2. HERO CARD MODUL PINNED DI ATAS KATALOG DENGAN GAMBAR BESAR DI TENGAH
       3. INPUT GAMBAR COVER MODUL (PREVIEW LIVE & 4 PRESET GRADIENT/WALLPAPER)
       4. PENGELOLA QUICK ACTION HUB DI PANEL ADMIN (BISA DITAMBAH, DIUBAH, DIHAPUS)
       5. INPUT FORM KATEGORI MODUL & FILTER PILLS DINAMIS DARI KATEGORI ASLI
       6. FORMAT RICH TEXT PADA BLOK MATERI (BOLD, ITALIC, STABILO/HIGHLIGHT MULTI-WARNA)
================================================================================

## 1. LATAR BELAKANG & PERMINTAAN USER:
**Instruksi Pengguna:**
> *"gambar 1: gw pengen untuk tombol2 card seperti ini bisa diklik seluruh cardnya untuk masuk, jangan cuma mengandalkan 1 tombol"*
> *"gambar 2: di atas katalog modul pembelajaran gw mau ada modul yang di pin admin munculin disitu, jadi biar semua orang liat itu dulu. Gw mau lu bikin yg gede disitu dan taruh di tengah, ada gambarnya juga, btw di awal waktu bikin modul belum bisa masukin gambar untuk modulnya"*
> *"gambar 3: quick action belum bisa diganti2"*
> *"gambar 4: untuk filter gw mau gw sesuai yang kita buat di awal bikin modul, jadi nanti lu tambahin 1 form untuk input bagian kategori untuk difilter nantinya"*
> *"- gw juga mau bikin modul ini bisa bikin tulisan bold, italic, dan bisa diwarnain belakangnya (seperti distabilo)"*

---

## 2. DETAIL IMPLEMENTASI & PERUBAHAN:

### A. Gambar 1: Full Card Clickability pada Katalog Modul (`classroom.js`)
- Sebelumnya hanya tombol kecil "Masuk Modul" / "Lanjutkan" di pojok kanan bawah yang bisa diklik.
- Sekarang, seluruh container kartu modul (`glass-card`) diberi class `cursor-pointer hover:border-emerald-500/50 hover:shadow-xl hover:-translate-y-1` dan event `onclick` langsung membuka materi pertama atau melanjutkan materi terakhir yang belum selesai.
- Event `stopPropagation()` disematkan pada bookmark toggle dan item link list pelajaran di dalam kartu agar aksi independen tetap berjalan mulus tanpa konflik klik.

### B. Gambar 2: Hero Modul Pinned di Atas Katalog & Input Cover Gambar (`index.html`, `classroom.js`, `admin.js`)
1. **Container Pinned Module Hero (`#dash-pinned-module-container`):**
   - Diletakkan tepat di atas section "Katalog Modul Pembelajaran" di halaman Beranda.
   - Ditampilkan dalam format Hero Card berukuran besar di tengah dengan gradien neon Slate-Emerald, badge berkedip `📌 MODUL UNGGULAN PILIHAN MENTOR`, dan thumbnail cover aspect-video beresolusi tinggi dengan tombol floating play overlay.
   - Menampilkan total video, durasi menit, ringkasan 3 materi awal, persentase progres, dan tombol utama `[Mulai Belajar Modul Ini Sekarang]`.
   - Seluruh hero card dapat diklik untuk langsung melompat ke ruang belajar.
2. **Input Cover Gambar & Preset di Modal Tambah/Edit Modul (`#modal-manage-module`):**
   - Menambahkan input teks URL gambar `#manage-module-cover`.
   - Box Live Image Preview interaktif (`#manage-module-cover-preview`) yang langsung memperlihatkan gambar saat URL diketik atau dipilih.
   - 4 tombol preset instan siap pakai: `🎨 Gradient AI`, `💻 Code Neon`, `⚡ Matrix Dark`, `🌐 Cloud Hub`.
3. **Pinning Toggle Admin:**
   - Checkbox `📌 Sematkan / Pin Modul ini di Bagian Paling Atas Beranda` pada modal modul.
   - Tombol shortcut instan `[📌 Pin]` di Tier 1 bar admin panel untuk menyematkan/melepas sematan modul dengan 1 klik.
   - Ditandai dengan ikon `📌 ` pada dropdown modul admin.

### C. Gambar 3: Pengelola Quick Action Hub Aktif di Panel Admin (`mock-data.js`, `state.js`, `admin.js`, `index.html`)
- `SEED_QUICK_ACTIONS` diisi 4 aksi cepat standar resmi Zettbos sehingga tabel tidak pernah kosong lagi.
- `AppState.quickActions` otomatis memuat aksi default jika penyimpanan lokal kosong.
- Tombol `[+ Tambah Quick Action]` di header tabel pengelola Quick Action.
- Fungsi lengkap CRUD: `openAddQuickActionModal()`, `openEditQuickActionModal()`, `deleteQuickAction()`, dan sinkronisasi live dua arah dengan tabel `quick_actions` di Supabase Cloud.

### D. Gambar 4: Form Kategori Modul & Filter Pill Dinamis (`index.html`, `classroom.js`, `admin.js`)
1. **Input Kategori di Modal Modul:**
   - Ditambahkan field input `#manage-module-category` lengkap dengan `<datalist>` saran kategori (misal: "Fundamental & Workflow AI", "Google Apps Script & Sheets", "Webhook & Otomasi Lanjutan", "Deploy Cloud & Produksi", dll.) atau admin bebas mengetik kategori baru sesukanya.
2. **Filter Pills Dinamis di Beranda Siswa:**
   - `renderModuleCategoryPills()` tidak lagi menggunakan daftar statis/hardcoded.
   - Sistem secara dinamis mengekstrak seluruh kategori unik yang ada pada modul (`visibleModules`) dan menghitung jumlah modul di setiap kategori secara akurat.
   - Setiap kategori baru yang dibuat admin otomatis memunculkan tombol pill filter di Beranda.

### E. Rich Text Formatting & Stabilo (Highlighter) pada Modul Materi (`editor.js`)
1. **Parser Sintaks `formatRichText(text)`:**
   - **Tebal / Bold**: `**teks**` -> `<strong class="font-bold text-white">teks</strong>`
   - **Miring / Italic**: `*teks*` -> `<em class="italic text-slate-100">teks</em>`
   - **Stabilo Neon Kuning**: `==teks==` -> `<mark class="bg-amber-400/30 text-amber-200 px-1.5 py-0.5 rounded border border-amber-400/40">teks</mark>`
   - **Stabilo Hijau Neon**: `==green:teks==` / `==hijau:teks==` -> `<mark class="bg-emerald-500/25 text-emerald-200 px-1.5 py-0.5 rounded">`
   - **Stabilo Cyan Neon**: `==cyan:teks==` / `==biru:teks==` -> `<mark class="bg-cyan-500/25 text-cyan-200 px-1.5 py-0.5 rounded">`
   - **Stabilo Pink**: `==pink:teks==` -> `<mark class="bg-rose-500/25 text-rose-200 px-1.5 py-0.5 rounded">`
   - **Stabilo Ungu**: `==purple:teks==` -> `<mark class="bg-purple-500/25 text-purple-200 px-1.5 py-0.5 rounded">`
2. **Toolbar Formatting Interaktif di Notion Block Editor:**
   - Pada setiap blok teks dan callout tips, disediakan tombol toolbar cepat:
     `[B]`, `[I]`, `[🖍️ Kuning]`, `[🟢 Hijau]`, `[🔵 Cyan]`, `[🌸 Pink]`.
   - Mengklik tombol akan otomatis membungkus teks yang sedang diseleksi (highlight) atau menyisipkan template format di posisi kursor secara langsung dengan live preview update seketika!

### F. Sinkronisasi Skema Supabase (`schema.sql` & `supabase.js`)
- Menambahkan kolom `is_pinned BOOLEAN DEFAULT false` pada tabel `curriculum_modules`.
- Fungsi `upsert` Supabase dilengkapi graceful fallback otomatis jika kolom `is_pinned` belum di-execute di dashboard remote pengguna.

### G. Cache Buster Versi 40:
- Seluruh skrip di `index.html` dinaikkan versinya ke `?v=40` untuk memastikan pembaruan langsung aktif di browser.

================================================================================
SIAP DI-PUSH KE GITHUB & VERCEL VIA TERMINAL
================================================================================
