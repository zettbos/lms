# ZETTBOS MEMBER HUB - DOKUMEN REVISI AKTIF (REVISI 50)
================================================================================
STATUS: SUKSES DITERAPKAN (REVISI 50 SELESAI)
ARSITEK SISTEM: ZettBOT by Zettbos (Universal Product Architect & Lead Engineering Mentor)
FOKUS REVISI 50:
  1. PERBAIKAN RUANG BACA KONTEN MODUL (ISI RUANG KANAN & FONT PUTIH TERANG) - GAMBAR 1
  2. PERBAIKAN SUB-NAVBAR RUANG BELAJAR BELUM DI PINGGIR (EDGE-TO-EDGE ALIGNMENT) - GAMBAR 2
  3. DUKUNGAN LOGO GAMBAR KUSTOM DARI GOOGLE DRIVE & DIRECT URL - GAMBAR 3
  4. SIMPLIFIKASI BRANDING HEADER & FOOTER: LOGO + ZETTBOS SAJA - GAMBAR 4 & 5
  5. DUAL-ADMIN WHATSAPP CONTACT SELECTOR (FARHAN & ASEP)
================================================================================

## 1. DETAIL ANALISIS MASALAH & RENCANA SOLUSI TEKNIS:

### A. Gambar 1: Solusi Ruang Baca Isi Penuh Sisi Kanan & Font Putih Terang Jernih
- **Analisis Akar Masalah**:
  1. Pada kelas CSS `.prose-reading` di `css/style.css`, terdapat batasan kaku `max-width: 65ch` (panjang maksimal hanya ~65 karakter atau sekitar 550px). Sementara itu, kontainer kartu baca memiliki lebar 900px - 1100px. Akibatnya, teks berhenti di tengah dan menyisakan ruang kosong gelap melompong selebar ~45% di sisi kanan kartu.
  2. Warna teks materi bacaan di `js/editor.js` saat ini menggunakan `text-slate-300` / `#CBD5E1`, yang bernuansa abu-abu kusam sehingga kurang kontras dan cepat membuat mata lelah saat membaca panduan panjang di mode gelap.
- **Solusi Desain Arsitek (Human-Crafted Editorial Experience)**:
  1. **Mengisi Ruang Kanan Secara Proporsional (`max-width: 100%`)**:
     - Hilangkan batasan `max-width: 65ch` pada kontainer bacaan materi (`#learn-notion-content .prose-reading`).
     - Terapkan `max-width: 100%;` dengan jarak baca yang bernafas alami: teks secara luwes mengisi lebar kartu baca hingga ke kanan secara harmonis tanpa ada kekosongan ganjil di sisi kanan.
     - Tambahkan padding dalam kartu yang elegan (`p-6 sm:p-9`) dan `line-height: 1.75` untuk memberikan kenyamanan ergonomis tingkat tinggi (*comfortable typographic cadence*) seperti pada dokumentasi Linear, Stripe, dan Notion.
  2. **Tingkatkan Kontras Font Menjadi Putih Terang Jernih**:
     - Ubah teks paragraf menjadi `#F8FAFC` (`text-slate-100` dengan tingkat kecerahan >98% dan ketebalan `font-normal` hingga `font-medium`), menghasilkan kontras tajam yang sangat bersih dan mudah dibaca di latar gelap (*high-contrast readability*).
     - Heading H1, H2, H3 diatur ke putih murni `#FFFFFF` dengan ketebalan `font-extrabold` / `font-bold`.
     - Teks kutipan/callout disesuaikan menjadi warna emerald jernih berkilau (`text-emerald-100`), dan blok kode tetap kontras dengan aksen hijau emerald neon.
     - Di mode terang (light mode), teks otomatis menyesuaikan menjadi deep obsidian slate `#0F172A` agar kontras tetap terjaga 100%.

---

### B. Gambar 2: Perbaikan Bug Sub-Bar Ruang Belajar Belum di Pinggir (Edge-to-Edge)
- **Analisis Akar Masalah**:
  - Pada baris 856 di `index.html`, sub-navbar Ruang Belajar (`< Kembali ke Home | [Judul Modul] ... <- Prev Next ->`) masih terkunci di dalam kontainer `max-w-5xl xl:max-w-6xl w-full mx-auto`.
  - Sementara itu, Navbar Utama di atasnya (baris 54) dan kontainer layout materi di bawahnya (baris 883) sudah diperlebar menjadi `max-w-[1440px] 2xl:max-w-[1600px]`.
  - Karena sub-navbar terjebak dalam batas `max-w-5xl`, tombol `< Kembali ke Home` menjorok terlalu ke dalam (~250px dari pinggir kiri) dan tombol `<- Prev Next ->` menjorok terlalu ke dalam dari pinggir kanan.
- **Solusi Teknis Arsitektur**:
  - Ubah baris 856 dari `max-w-5xl xl:max-w-6xl` menjadi `max-w-[1440px] 2xl:max-w-[1600px] w-full mx-auto flex items-center justify-between`.
  - Hasil seketika: Tombol `< Kembali ke Home` otomatis bergeser tepat ke pinggir kiri (lurus sempurna secara vertikal dengan tombol Hamburger dan Logo ZETTBOS di navbar atas), dan tombol navigasi `<- Prev Next ->` bergeser tepat ke pinggir kanan (lurus sempurna dengan tepi sidebar kurikulum). 100% rapi dan presisi edge-to-edge.

---

### C. Gambar 3: Dukungan Memasukkan Logo Gambar dari Google Drive & Direct URL
- **Analisis Kebutuhan**:
  - Pengguna ingin mengganti badge default `[ZB]` dengan gambar logo asli, dan secara spesifik menginginkan kemudahan menginput link gambar dari Google Drive.
  - Tantangan teknis: URL share Google Drive (`drive.google.com/file/d/{ID}/view?usp=sharing`) menyajikan antarmuka pratinjau HTML interaktif Google Drive yang ditolak oleh browser jika dipasang langsung ke `<img src="...">`.
- **Solusi Teknis Arsitektur**:
  1. **Konverter Cerdas Google Drive Direct CDN**:
     - Buat parser regex otomatis yang mengekstrak File ID dari semua variasi link Google Drive (`/file/d/{id}`, `?id={id}`, dll.) dan mengonversinya secara instan menjadi direct embed stream: `https://lh3.googleusercontent.com/d/{id}` atau `https://drive.google.com/uc?export=view&id={id}`.
     - Gambar Google Drive akan langsung termuat cepat, tajam, dan bebas kendala CORS.
  2. **Panel Pengaturan Logo di CMS Owner**:
     - Sediakan kartu konfigurasi "Pengaturan Logo & Branding LMS" di Panel Kontrol Owner (`CMS Landing Portal`):
       - Input text: `URL Gambar Logo (Link Google Drive atau URL Langsung)`
       - Live Preview Box: langsung memperlihatkan hasil tampilan logo secara real-time.
       - Tombol "Simpan Logo" & "Reset ke Default [ZB]".
  3. **Rendering Logo Terpusat di Seluruh Layar**:
     - Terapkan fungsi `renderAppBrandLogo()` yang otomatis memperbarui seluruh elemen logo di aplikasi:
       - Header Top Navbar (`#main-navbar`)
       - Drawer Sidebar Mobile & Desktop (`#sidebar-drawer`)
       - Header Mengambang Landing Page
       - Footer Landing Page
     - Jika URL logo diisi, sistem menampilkan gambar logo dengan rasio rapi `w-8 h-8 object-contain rounded-lg`. Jika kosong, sistem otomatis menampilkan badge fallback elegan `[ZB]`.

---

### D. Gambar 4 & 5: Simplifikasi Brand Logo Menjadi Logo + ZETTBOS Saja
- **Analisis Masalah**:
  - Gambar 4 (Footer Landing, baris 448-450) saat ini bertuliskan `ZB ZETTBOS ACADEMY • Belajar Web App AI`.
  - Gambar 5 (Pill Header Landing, baris 226-230) saat ini bertuliskan `ZB ZETTBOS [ACADEMY]` dengan badge kapsul tambahan.
- **Solusi Desain Arsitek**:
  - Hapus embel-embel pill `[ACADEMY]` dan subjudul `• Belajar Web App AI`.
  - Sederhanakan branding menjadi sangat bersih, tegas, dan berwibawa:
    - **Header Landing**: `[Logo] ZETTBOS`
    - **Footer Landing**: `[Logo] ZETTBOS`
  - Selaras dengan prinsip desain modern minimalist: minim kebisingan visual (*zero visual clutter*).

---

### E. Kontak WhatsApp Multi-Admin (Farhan & Asep)
- **Analisis Kebutuhan**:
  - Pengguna ingin saat tombol WhatsApp diklik, muncul 2 nomor admin resmi:
    1. **Admin Farhan**: `085111226452`
    2. **Admin Asep**: `082195277812`
- **Solusi Teknis Arsitektur**:
  1. **Modal Pemilihan Kontak Admin WhatsApp (`#modal-whatsapp-contact`)**:
     - Hadirkan dialog popover modal yang sangat elegan dengan efek glassmorphism dan backdrop blur.
     - Judul: `Hubungi Tim Support Zettbos` dengan subjudul `Pilih salah satu admin kami untuk konsultasi, bantuan materi, atau kendala akun.`
     - **Kartu Kontak 1 - Admin Farhan**:
       - Avatar monoline premium dengan badge online hijau aktif.
       - Nama: **Admin Farhan**
       - Nomor: `0851-1122-6452`
       - Status / Peran: *Support & Operasional LMS*
       - Tombol Aksi: `Chat Farhan di WhatsApp ↗` (`https://wa.me/6285111226452?text=Halo%20Admin%20Farhan%20Zettbos,%20saya%20ingin%20bertanya%20seputar%20LMS%20Zettbos`)
     - **Kartu Kontak 2 - Admin Asep**:
       - Avatar monoline premium dengan badge online hijau aktif.
       - Nama: **Admin Asep**
       - Nomor: `0821-9527-7812`
       - Status / Peran: *Pendaftaran & Konsultasi Member*
       - Tombol Aksi: `Chat Asep di WhatsApp ↗` (`https://wa.me/6282195277812?text=Halo%20Admin%20Asep%20Zettbos,%20saya%20ingin%20bertanya%20seputar%20LMS%20Zettbos`)
  2. **Integrasi Seluruh Tombol WhatsApp**:
     - Tombol Quick Action Hub "WhatsApp Admin" di Beranda otomatis membuka modal kontak 2 admin ini.
     - Tautan WhatsApp di Footer Landing Page otomatis membuka modal kontak 2 admin ini.
     - Tombol bantuan pada Modal Email Belum Terdaftar (Non-Whitelist) otomatis membuka modal kontak 2 admin ini.

---

## 2. FILE YANG AKAN DIUBAH:
1. `index.html`:
   - Perbaiki lebar sub-navbar Ruang Belajar (baris 856) menjadi `max-w-[1440px] 2xl:max-w-[1600px]`.
   - Simplifikasi logo di Pill Header Landing (baris 226) dan Footer Landing (baris 448) menjadi `[Logo] ZETTBOS`.
   - Tambahkan form input Pengaturan Logo & Branding di tab `tab-pane-landing_cms` Admin Panel.
   - Tambahkan komponen modal `#modal-whatsapp-contact` untuk pemilihan 2 admin WhatsApp.
   - Naikkan cache buster ke `?v=50`.
2. `css/style.css`:
   - Atur `#learn-notion-content .prose-reading` ke `max-width: 100%`, `color: #F8FAFC`, dan `line-height: 1.75`.
   - Styling kontras tinggi untuk teks materi (H1-H3 putih murni `#FFFFFF`, p `#F8FAFC`).
   - Styling modal kontak WhatsApp multi-admin.
3. `js/editor.js`:
   - Perbarui default class render teks menjadi `text-slate-100` / `#F8FAFC` agar kontras putih terang maksimal.
4. `js/controllers/classroom.js`:
   - Implementasi parser URL Google Drive `convertGoogleDriveUrl(url)`.
   - Implementasi fungsi `renderAppBrandLogo()` untuk memperbarui seluruh logo di UI.
   - Modifikasi `executeQuickAction` agar tombol WhatsApp membuka modal kontak multi-admin.
   - Implementasi fungsi pembuka modal WhatsApp `openWhatsAppContactModal()`.
5. `js/controllers/admin.js`:
   - Handler simpan & reset logo gambar kustom di Panel Kontrol Owner.
6. `prd.md`:
   - Catat detail Revisi 50 ke dalam riwayat PRD.

================================================================================
STATUS: SUKSES DITERAPKAN KE SELURUH KODE SUMBER (REVISI 50 SELESAI)
================================================================================
