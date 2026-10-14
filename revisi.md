# ZETTBOS MEMBER HUB - DOKUMEN REVISI AKTIF (REVISI 48)
================================================================================
STATUS: SUKSES DITERAPKAN (REVISI 48 SELESAI)
ARSITEK SISTEM: ZettBOT by Zettbos (Universal Product Architect & Lead Engineering Mentor)
FOKUS REVISI:
  1. TUKAR POSISI PIN DAN REKOMENDASI DI HOME (GAMBAR 1) - SELESAI
  2. GABUNGKAN HAMBURGER MENU DENGAN HEADER KIRI ATAS & HAPUS HEADER GANDA (GAMBAR 2) - SELESAI
  3. HAPUS TOMBOL "RESET DATA" DI HOME (GAMBAR 3) - SELESAI
  4. IMPLEMENTASI MOBILE BOTTOM NAVIGATION BAR & ELEVATED POPOVER MENU (GAMBAR 4 REFERENSI) - SELESAI
  5. LOCK TOP NAVBAR (FIXED TOP-0) AGAR TIDAK HILANG SAAT SCROLL (GAMBAR 5) - SELESAI
================================================================================

## 1. DETAIL ANALISIS MASALAH & RENCANA SOLUSI TEKNIS:

### A. Gambar 1: Tukar Posisi Sematan Modul (Pin) dan Rekomendasi Belajar
- **Masalah Saat Ini**:
  Di halaman Home Kurikulum, kartu "REKOMENDASI LANJUTKAN BELAJAR" (`#dash-featured-lesson`) berada di urutan atas, sedangkan modul yang disematkan oleh mentor ("MODUL UNGGULAN PILIHAN MENTOR" / `#dash-pinned-module-container`) berada di bawahnya.
- **Solusi Teknis**:
  - Di `index.html`, tukar urutan DOM: Pindahkan `#dash-pinned-module-container` ke atas `#dash-featured-lesson`.
  - Dengan demikian, modul pilihan mentor yang di-pin akan selalu menjadi sorotan utama paling atas (priority banner), diikuti oleh rekomendasi lanjutan belajar siswa di bawahnya.

---

### B. Gambar 2: Penyatuan Hamburger Menu dengan Kiri Atas & Eliminasi Header Ganda
- **Masalah Saat Ini**:
  Ketika sidebar dibuka pada tampilan desktop/laptop, terjadi penumpukan visual yang canggung:
  1. Di baris paling atas (Navbar): Terdapat tombol hamburger `[ ☰ ]` dan logo brand `[ZB] ZETTBOS MEMBER HUB`.
  2. Tepat di bawahnya (Sidebar Drawer): Muncul header kedua yang mengulang logo yang sama: `[ZB] ZETTBOS NAVIGATION HUB` beserta tombol `[✕]`.
  Ini membuat area kiri atas terasa bertumpuk 2 lantai (double header) dan tombol hamburger terasa terpisah dari sidebar itu sendiri.
- **Solusi Teknis**:
  - **Pola Unified Sidebar Header**:
    1. Pada desktop, posisi sidebar panel `#sidebar-drawer` diatur menempel persis di bawah top navbar (`top-14 sm:top-16` dengan `height: calc(100vh - 3.5rem sm:4rem)`).
    2. Header kedua di dalam drawer (`.drawer-header`) disembunyikan pada mode desktop (`lg:hidden`), sehingga area kiri atas Navbar (`[ ☰ ] [ZB] ZETTBOS MEMBER HUB`) menjadi satu-satunya header pengendali resmi.
    3. Tombol hamburger `[ ☰ ]` di navbar berfungsi sebagai toggle collapse/expand yang mulus, terintegrasi menyatu dengan brand logo tanpa ada elemen header duplikat di bawahnya.
    4. Sidebar langsung menampilkan daftar menu (`NAVIGASI UTAMA`) secara bersih dan proporsional.

---

### C. Gambar 3: Hapus Tombol "Reset Data" dari Home
- **Masalah Saat Ini**:
  Di samping judul "Katalog Modul Pembelajaran", terdapat link bergaris bawah `Reset Data` (`#btn-home-reset-data`) yang muncul ketika login sebagai Super Admin. Tombol ini tidak diinginkan oleh owner ("hapus ini jangan ditampilin juga").
- **Solusi Teknis**:
  - Hapus elemen `<button id="btn-home-reset-data">Reset Data</button>` dari `index.html`.
  - Di `js/controllers/classroom.js`, bersihkan logika toggle role-based untuk `btn-home-reset-data` (baris ~523-529).

---

### D. Gambar 4 (Referensi): Mobile Bottom Navigation Bar & Elevated Popover Menu
- **Analisis Referensi Gambar 4**:
  Pada tampilan smartphone/mobile, navigasi bawah bergaya aplikasi native modern memiliki:
  1. Deretan menu utama yang paling sering diakses (Home, Dashboard, Belajar, Dokumen).
  2. Satu tombol menu sekunder `[ ☰ Menu ]` di ujung kanan.
  3. Ketika tombol `[ ☰ Menu ]` ditekan, muncul popup melayang (Elevated Popover Sheet) tepat di atas tombol menu, berisi menu sekunder (Item Favorit, Ganti Tema, Admin Panel, Edit Profil, dan tombol Keluar berwarna merah).
- **Solusi Teknis**:
  - **1. Struktur Mobile Bottom Nav (`#mobile-bottom-nav`)**:
    - Tersemat paten di bagian bawah layar smartphone (`fixed bottom-0 inset-x-0 z-40 md:hidden`).
    - Desain: Frosted glass matte (`bg-[#07080A]/95 backdrop-blur-xl border-t border-[#262933]`), tinggi 56px, pembagian ikon proporsional dengan label teks mikro.
    - Tombol Menu Utama:
      - 🏠 **Home** (`#mobile-nav-home` -> `navigate('home')`)
      - 📊 **Dashboard** (`#mobile-nav-dashboard` -> `navigate('user-dashboard')`)
      - ▶️ **Belajar** (`#mobile-nav-learn` -> `navigate('learn')`)
      - 📄 **Dokumen** (`#mobile-nav-resources` -> `navigate('resources')`)
      - ☰ **Menu** (`#mobile-nav-menu` -> `toggleMobileMenuPopover()`)
  - **2. Floating Popover Sheet (`#mobile-menu-popover`)**:
    - Floating card melayang di pojok kanan bawah (`fixed bottom-16 right-3 z-50 w-56 rounded-2xl bg-[#16181D]/95 backdrop-blur-xl border border-[#262933] shadow-2xl p-2`):
      - ⭐ **Item Favorit & Simpanan** (`navigate('favorites')`)
      - 🌓 **Tema Tampilan (Dark / Light)** (`toggleTheme()`)
      - ⚙️ **Admin Panel Kurikulum** (Khusus role admin: `navigate('admin')`)
      - 👤 **Edit Profil Member** (`openProfileSettingsModal()`)
      - Garis pembatas halus (`border-t border-[#262933] my-1`)
      - 🚪 **Keluar / Logout** (`logout()`, teks & ikon warna rose-400 seperti di gambar referensi)
  - **3. Backdrop & Click-Outside**:
    - Backdrop transparan (`#mobile-menu-backdrop`) agar popover otomatis tertutup saat pengguna mengklik area luar atau berpindah halaman.
  - **4. Spacing View Mobile**:
    - Menambahkan padding bawah (`pb-20 md:pb-0`) pada seluruh container view agar konten halaman tidak tertutup oleh navbar bawah.

---

### E. Gambar 5: Lock Top Navbar (Fixed Top-0) Agar Tetap Terkunci Saat Scroll
- **Masalah Saat Ini**:
  Navbar atas (`#main-navbar`) saat ini menggunakan `class="sticky top-0"`. Pada halaman yang panjang atau ketika kontainer memiliki scrolling dinamis, `sticky` bisa terlepas atau hilang dari layar saat di-scroll ke bawah.
- **Solusi Teknis**:
  - Ubah `#main-navbar` menjadi posisi absolut terkunci: `fixed top-0 inset-x-0 z-50 glass-nav`.
  - Berikan padding atas kompensasi pada seluruh view (`pt-14 sm:pt-16`) sehingga konten pertama tidak tertutup oleh navbar.
  - Pada scroll, navbar 100% terkunci kokoh di puncak layar dengan background matte blur (`backdrop-blur-md`), bayangan halus (`shadow-md`), dan border-bottom yang memisahkan navbar dengan konten secara presisi.

---

## 2. FILE YANG AKAN DIUBAH:
1. `index.html`:
   - Tukar urutan `#dash-pinned-module-container` dan `#dash-featured-lesson`.
   - Hapus elemen `#btn-home-reset-data`.
   - Kunci `#main-navbar` dengan `fixed top-0 inset-x-0 z-50` dan sesuaikan padding view (`pt-14 sm:pt-16 pb-20 md:pb-6`).
   - Sembunyikan `.drawer-header` ganda pada desktop (`lg:hidden`).
   - Tambahkan elemen `#mobile-bottom-nav`, `#mobile-menu-popover`, dan `#mobile-menu-backdrop`.
   - Bump versi cache buster script & css ke `?v=48`.
2. `css/style.css`:
   - Penyesuaian layout fixed top navbar dan sidebar desktop docking (`top: 3.5rem sm:4rem`).
   - Styling mobile bottom nav bar dan elevated popover menu (dark mode & light mode).
   - Animasi smooth entrance popover (`scale-up-fast`).
3. `js/controllers/classroom.js`:
   - Bersihkan referensi `btn-home-reset-data`.
4. `js/core/router.js`:
   - Fungsi `toggleMobileMenuPopover()` dan `closeMobileMenuPopover()`.
   - Sinkronisasi status aktif mobile bottom nav (`Home`, `Dashboard`, `Belajar`, `Dokumen`).
   - Penyesuaian auto-close popover saat navigasi halaman.

================================================================================
STATUS: SUKSES DITERAPKAN KE SELURUH KODE SUMBER (REVISI 48 SELESAI)
================================================================================
