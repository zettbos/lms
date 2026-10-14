# ZETTBOS MEMBER HUB - DOKUMEN LAPORAN REVISI (REVISI 58)
================================================================================
STATUS: SUKSES DITERAPKAN (REVISI 58 SELESAI & TERVERIFIKASI)
ARSITEK SISTEM: ZettBOT by Zettbos (Universal Product Architect & Lead Engineering Mentor)
FOKUS TUGAS: TRANSPARENT LOGO, RUANG BELAJAR DIRECTORY, FLUID NAVBAR ON ZOOM OUT, BESARKAN FONT JUDUL MODUL
================================================================================

## RINGKASAN HASIL EKSEKUSI
1. **Kotak di Belakang Logo Dihapus**: `renderAppBrandLogo` di `js/controllers/classroom.js` mengatur container logo menjadi 100% transparan (`bg-transparent border-0 shadow-none p-0 overflow-visible`) saat logo kustom aktif, menampilkan gambar logo murni tanpa latar belakang hijau atau garis bingkai.
2. **Ruang Belajar Membuka Katalog Modul**: Diterapkan arsitektur 2-state di `#view-learn` (`index.html`, `js/controllers/classroom.js`, `js/core/router.js`). Klik menu "Ruang Belajar & Video" kini membuka katalog seluruh modul yang telah dibuat admin lengkap dengan filter kategori & pencarian. Tombol "Masuk Modul" / klik materi beralih ke reader player, dan tombol `← Daftar Modul` kembali ke katalog modul seketika.
3. **Top Navbar Menyesuaikan Posisi Saat Zoom Out**: Dihapus batasan `max-w-[1440px] 2xl:max-w-[1600px] mx-auto` dari container navbar utama dan digantikan `w-full px-4 sm:px-6 lg:px-8` sehingga membentang penuh edge-to-edge di berbagai skala zoom (90%, 80%, dll.) dan monitor ultrawide.
4. **Font Judul Modul Diperbesar**: Judul modul di grid kurikulum kini menggunakan tipografi yang jauh lebih tebal dan dominan (`font-extrabold text-base sm:text-lg lg:text-xl`).
5. **Cache Buster**: Diperbarui ke `?v=58` di seluruh berkas.


## 1. DETAIL AKAR MASALAH & SOLUSI TEKNIS (REVISI 58)

### POIN 1: HILANGKAN KOTAK HIJAU DI BELAKANG LOGO (GAMBAR LOGO SAJA)
- **Akar Masalah**:
  Container logo (`#brand-logo-nav`, `#brand-logo-drawer`, `#brand-logo-landing`, `#brand-logo-footer`) memiliki class bawaan `rounded-lg bg-emerald-950/80 border border-emerald-500/40 shadow-sm`. Saat gambar logo kustom dirender di dalamnya, kotak hijau gelap dan border tetap terlihat mengelilingi gambar.
- **Solusi Arsitektur ZettBOT**:
  Di `js/controllers/classroom.js` pada fungsi `renderAppBrandLogo()`:
  - Saat ada logo kustom (`convertedUrl` valid): otomatis ubah container menjadi transparan penuh (`bg-transparent border-0 shadow-none p-0 overflow-visible`) dan render gambar logo dengan `h-7 sm:h-8 w-auto max-w-[140px] object-contain`. Logo akan melayang bersih tanpa kotak latar belakang apapun.
  - Jika tidak ada logo kustom (fallback `[ZB]`): pertahankan badge kotak default.

---

### POIN 2: RUANG BELAJAR MENAMPILKAN DAFTAR MODUL (BUKAN LANGSUNG 1 MATERI AKTIF)
- **Akar Masalah**:
  Saat pengguna mengklik menu sidebar *"Ruang Belajar & Video"*, router di `js/core/router.js` langsung memanggil `renderLearningRoom(lessonId)` dengan memaksakan ID materi yang terakhir dibuka (`AppState.currentLessonId || lessons[0]`). Akibatnya, pengguna langsung terjebak di dalam halaman baca materi/video satu pelajaran tertentu, tanpa bisa memilih atau melihat daftar modul yang sudah dibuat.
- **Solusi Arsitektur ZettBOT**:
  Terapkan arsitektur 2-State di halaman Ruang Belajar (`#view-learn`):
  1. **State 1 (Daftar Modul Kurikulum / Catalog Mode)**:
     - Ditampilkan saat membuka menu *"Ruang Belajar & Video"* dari sidebar.
     - Menampilkan header *"Ruang Belajar Kurikulum"*, filter kategori, pencarian, dan seluruh kartu modul yang telah dibuat (`AppState.modules`).
     - Pengguna bebas melihat modul mana yang ingin dipelajari.
     - Di setiap kartu modul, tersedia tombol *"Masuk Modul"* dan daftar topik materi.
  2. **State 2 (Player & Reader Mode / Lesson Active)**:
     - Terbuka saat pengguna mengklik tombol *"Masuk Modul"* atau memilih salah satu materi dari daftar modul.
     - Menampilkan video player dan konten Notion-style.
     - Di sub-bar atas, sediakan tombol jelas: `← Kembali ke Daftar Modul` yang seketika mengembalikan layar ke State 1 (Daftar Modul).
     - Jika pengguna mengklik menu *"Ruang Belajar & Video"* di sidebar saat sedang membaca materi, layar otomatis kembali ke State 1 (Daftar Modul).

---

### POIN 3: TOP NAVBAR BELUM MENYESUAIKAN POSISI SAAT ZOOM OUT (90% / WIDE)
- **Akar Masalah**:
  Di `index.html`, container dalam navbar memiliki pembatas lebar statis:
  `max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8`.
  Saat browser di-zoom out ke 90% (atau di layar lebar > 1600px), container navbar terpusat di tengah layar (*centered*) sehingga menyisakan ruang kosong hitam besar di kiri dan kanan. Akibatnya, logo di kiri dan tombol profil/logout di kanan tertarik ke dalam dan posisinya tidak sejajar dengan sidebar maupun konten di bawahnya.
- **Solusi Arsitektur ZettBOT**:
  - Ubah container dalam `#main-navbar` menjadi fluid edge-to-edge:
    `w-full px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between`.
  - Hapus batasan `max-w-[1440px] 2xl:max-w-[1600px] mx-auto` dari navbar agar pada tingkat zoom berapapun (90%, 80%, 75%) atau monitor ultrawide, navbar selalu membentang 100% penuh dari tepi kiri ke tepi kanan layar secara proporsional.

---

### POIN 4: PERBESAR FONT JUDUL MODUL
- **Akar Masalah**:
  Di `js/controllers/classroom.js` fungsi `renderModuleCatalogGrid`, judul modul di kartu saat ini menggunakan ukuran kecil:
  `font-bold text-sm sm:text-base`.
  Pada kartu modul yang lebar, teks judul terlihat terlalu kecil dan kurang dominan.
- **Solusi Arsitektur ZettBOT**:
  Tingkatkan tipografi judul modul menjadi lebih besar, tebal, dan tegas:
  `font-extrabold text-base sm:text-lg lg:text-xl text-white group-hover:text-emerald-400 transition-colors leading-snug tracking-tight mb-2`.
  Terapkan ukuran font besar ini pada kartu modul di Home dan kartu modul di Ruang Belajar.

---

## 2. BERKAS YANG AKAN DIUBAH
1. `js/controllers/classroom.js`:
   - Di `renderAppBrandLogo`: Tambahkan class transparan penuh (`bg-transparent border-0 shadow-none p-0`) saat logo gambar aktif agar kotak hijau di belakang logo hilang.
   - Di `renderModuleCatalogGrid`: Besarkan font judul modul ke `text-base sm:text-lg lg:text-xl font-extrabold`.
   - Implementasikan fungsi `renderLearnModulesCatalog()` dan `showLearnModulesCatalog()` untuk menampilkan daftar modul di Ruang Belajar.
2. `js/core/router.js`:
   - Sesuaikan rute `learn`: Jika dipanggil tanpa `params.lessonId`, tampilkan State 1 (Daftar Modul) di Ruang Belajar. Jika dengan `params.lessonId`, buka materi terkait.
3. `index.html`:
   - Ubah container `#main-navbar > div` menjadi `w-full px-4 sm:px-6 lg:px-8` (fluid edge-to-edge).
   - Di `#view-learn`, tambahkan kontainer `#learn-modules-catalog-view` untuk menampilkan daftar modul lengkap sebelum masuk ke player.
   - Bump cache buster ke `?v=58`.
4. `prd.md`:
   - Update dokumentasi Master Context ke `v1.2.9` (Catatan Revisi 58).
