# ZETTBOS MEMBER HUB - DOKUMEN REVISI AKTIF (REVISI 49)
================================================================================
STATUS: SUKSES DITERAPKAN (REVISI 49 SELESAI)
ARSITEK SISTEM: ZettBOT by Zettbos (Universal Product Architect & Lead Engineering Mentor)
FOKUS REVISI:
  1. EXPAND RUANG BACA & MARQUEE HORIZONTAL TITLE DI KURIKULUM (GAMBAR 1) - SELESAI
  2. GANTI TEKS PIN MENJADI "Modul Pilihan" (GAMBAR 2) - SELESAI
  3. SIMPLIFIKASI JUDUL NAVBAR: PLAIN TEXT TANPA KAPSUL AI PULSING (GAMBAR 3) - SELESAI
  4. SOLUSI DESAIN ANTI-KOTAK / ANTI-AI DI BERANDA (GAMBAR 4) - SELESAI
  5. INTERAKTIF KLIK KEMAJUAN MODUL DI DASHBOARD (GAMBAR 5) - SELESAI
================================================================================

## 1. DETAIL ANALISIS MASALAH & RENCANA SOLUSI TEKNIS:

### A. Gambar 1: Perlebar Ruang Baca, Geser Kurikulum ke Kanan, & Marquee Text On-Hover
- **Masalah Saat Ini**:
  1. Di Ruang Belajar (`view-learn`), kontainer layout dibatasi pada `max-w-5xl` / `xl:max-w-6xl` di tengah layar, sehingga menyisakan ruang kosong lebar yang terbuang di sisi kiri dan kanan pada monitor desktop.
  2. Sidebar "Kurikulum Kelas" posisinya terlalu menempel ke tengah dan memakan proporsi baca.
  3. Judul materi pelajaran yang panjang terpotong kaku oleh elipsis `...` (`truncate`), sehingga siswa tidak bisa membaca judul materi secara utuh.
- **Solusi Teknis Arsitektur**:
  - **1. Perlebar Ruang Baca (Wide Viewport Container)**:
    - Ubah kontainer layout utama `view-learn` menjadi `max-w-[1440px] 2xl:max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8`.
    - Area baca artikel & materi Notion diperbesar secara leluasa (`max-w-4xl xl:max-w-5xl flex-1`).
    - Sidebar "Kurikulum Kelas" didorong ke sisi paling kanan layar (`ml-auto lg:w-80 xl:w-96`) dengan sticky alignment rapi.
  - **2. Marquee Text on Hover (Tanpa Potongan `...`)**:
    - Terapkan sistem **Smooth Horizontal Kinetic Scroll on Hover** (`.marquee-hover-title`):
      - Secara baku, teks tampil rapi dengan container terpotong halus (`overflow: hidden; white-space: nowrap`).
      - Saat pengguna mengarahkan kursor (hover) atau saat materi aktif, teks judul materi yang panjang otomatis meluncur mulus ke arah kanan/kiri (`transform: translateX(...)`) hingga seluruh kata terbaca tuntas dari awal sampai akhir, lalu kembali ke posisi awal.
      - Menyertakan atribut native `title="..."` untuk memastikan aksesibilitas judul 100%.

---

### B. Gambar 2: Ganti Teks Pin Badge Menjadi "Modul Pilihan"
- **Masalah Saat Ini**:
  Badge sematan modul unggulan mentor saat ini bertuliskan `📌 MODUL UNGGULAN PILIHAN MENTOR` dengan huruf kapital tebal dan animasi berkedip (`animate-pulse`). Pengguna ingin menggantinya menjadi lebih simpel: `Modul Pilihan`.
- **Solusi Teknis**:
  - Di `js/controllers/classroom.js` (fungsi `renderPinnedModuleHero`):
    - Ubah teks badge dari `MODUL UNGGULAN PILIHAN MENTOR` menjadi `Modul Pilihan`.
    - Hapus efek `animate-pulse` berlebihan agar tampilan lebih matang, elegan, dan tenang (*calm software aesthetic*).
    - Format badge: `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm"><svg class="w-3.5 h-3.5 text-amber-400" .../><span>Modul Pilihan</span></span>`.

---

### C. Gambar 3: Judul Header Sederhana (Plain Text Tanpa Kapsul AI & Pulsing Dot)
- **Masalah Saat Ini**:
  Di tengah navbar atas, indikator halaman aktif dibungkus dalam kapsul gelap (`bg-[#16181D] border-[#262933]`) dengan lingkaran hijau berdenyut (`animate-pulse`) bertuliskan `Home Kurikulum`. Desain kapsul ber-dot ini dinilai "terlihat AI banget" dan ingin diganti menjadi judul teks yang sederhana tanpa ornamen palsu.
- **Solusi Teknis**:
  - Di `index.html`:
    - Hapus bungkus kapsul pill `#nav-center-indicator` (`bg-[#16181D] border rounded-full px-3.5 py-1.5 shadow-inner`).
    - Hapus dot hijau pulsing `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>`.
    - Jadikan judul teks bersih dan minimalis:
      `<div id="nav-center-indicator" class="hidden md:flex items-center text-sm font-semibold text-slate-300 tracking-tight select-none"><span id="nav-current-page-label">Kurikulum</span></div>`.
  - Di `js/core/router.js`:
    - Sederhanakan label: untuk `home`, tampilkan `Kurikulum` (bukan `Home Kurikulum`).

---

### D. Gambar 4: Solusi Desain Anti-Kotak / Anti-AI Slop (Dekonstruksi Bento Box Fatigue)
- **Analisis & Masalah Kritis Pengguna**:
  Pengguna merasa antarmuka saat ini "terlalu banyak hal yang dikotak-kotakin jadi terlalu AI".
  Ini adalah fenomena nyata dalam desain modern yang disebut **"Bento Box / Card Fatigue"**, di mana generator AI selalu membungkus setiap kelompok teks, tombol, atau metrik ke dalam kartu persegi panjang gelap dengan garis tepi tebal (`border-slate-800 rounded-2xl`).
- **Solusi Desain Arsitek (Human-Crafted Editorial Layout)**:
  1. **Bongkar Kotak Sambutan (Open Editorial Header)**:
     - Hapus kartu raksasa pembungkus `glass-card-static rounded-2xl p-4`.
     - Ubah menjadi **Page Header Alami** yang menyatu langsung dengan kanvas latar belakang:
       - Sapaan hangat: `Halo, Farhan` (`text-2xl sm:text-3xl font-extrabold text-white tracking-tight`).
       - Subjudul informatif: `Akses seluruh kurikulum modul video & resource AI Anda di bawah ini.` (`text-xs sm:text-sm text-slate-400 mt-1`).
       - Metrik progres di kanan disederhanakan tanpa kartu bersarang: angka persentase ringkas dengan garis tipis elegan 2px, menyatu sejajar dengan header.
  2. **Ubah Akses Cepat Menjadi "Inline Action Strip" (Bukan 4 Kartu Kotak Kaku)**:
     - Hapus grid 4 kotak kartu kaku (`grid-cols-4 glass-card`).
     - Ganti dengan deretan **Horizontal Action Pills / Chip Toolbar** yang ramping dan mengambang mulus:
       `[ 📁 ZettLink ↗ ]   [ 📚 Zettbos Library ↗ ]   [ 💬 WhatsApp Admin ↗ ]`
     - Desain tombol chip: latar semi-transparan halus, border hairline tipis, tinggi 34px (hemat ruang vertikal 70%), dengan tanda panah mikro `↗` yang responsif saat disentuh.
     - Tampilan beranda seketika terasa lapang (*spacious*), bernafas, dan berkelas selayaknya produk digital buatan tim desain manusia kelas dunia (Linear / Apple / Stripe).

---

### E. Gambar 5: Navigasi Interaktif pada "Kemajuan Detail per Modul" di Dashboard
- **Masalah Saat Ini**:
  Di Dashboard Siswa (`view-user-dashboard`), pada kartu-kartu di section **"Kemajuan Detail per Modul"**, seluruh kartu dan chip materi di dalamnya bersifat statis (elemen `<div>` dan `<span>` biasa tanpa aksi klik). Siswa tidak bisa langsung membuka modul atau melanjutkan materi dari kartu tersebut.
- **Solusi Teknis**:
  - Di `js/controllers/classroom.js` (fungsi `renderUserDashboard`):
    1. **Kartu Modul Interaktif**:
       - Berikan event `onclick="navigate('learn', { lessonId: '${targetLessonId}' })"` pada kontainer kartu modul, sehingga saat pengguna mengklik kartu modul, sistem langsung membuka Ruang Belajar pada materi yang belum selesai dari modul tersebut.
       - Tambahkan visual hover feedback: `cursor-pointer hover:border-emerald-500/50 hover:bg-slate-900/60 transition-all` dan ikon panah `→` yang bergeser halus saat di-hover.
    2. **Chip Pelajaran Interaktif**:
       - Setiap chip materi (`EP0`, `EP1`, dst.) dijadikan tombol interaktif:
         `onclick="event.stopPropagation(); navigate('learn', { lessonId: '${l.id}' })"`.
       - Saat diklik, siswa langsung melompat tepat ke video pelajaran yang dipilih.
       - Tambahkan tooltip dan styling hover pada chip (`hover:border-emerald-400 hover:text-white cursor-pointer`).

---

## 2. FILE YANG AKAN DIUBAH:
1. `index.html`:
   - Perluas container `view-learn` (`max-w-[1440px] 2xl:max-w-[1600px]`), perluas area baca, dan geser sidebar kurikulum ke kanan (`ml-auto w-80 xl:w-96`).
   - Ubah `#nav-center-indicator` dari kapsul ber-dot menjadi plain text minimalis.
   - Dekonstruksi header Beranda: hapus kotak pembungkus kartu sambutan dan siapkan inline container untuk Akses Cepat.
   - Bump versi script & css ke `?v=49`.
2. `css/style.css`:
   - Keyframe dan styling `.marquee-hover-title` untuk scrolling judul materi panjang saat kursor diarahkan ke judul.
   - Penyesuaian styling header unboxed dan chip strip Akses Cepat (dark mode & light mode).
3. `js/controllers/classroom.js`:
   - Ganti teks badge `MODUL UNGGULAN PILIHAN MENTOR` menjadi `Modul Pilihan` (dan hapus animate-pulse).
   - Render Akses Cepat sebagai horizontal action chip strip (bukan grid 4 kotak besar).
   - Terapkan kelas `.marquee-hover-title` pada render judul materi di sidebar kurikulum.
   - Buat kartu dan chip materi di "Kemajuan Detail per Modul" dashboard interaktif (bisa diklik menuju modul/materi).
4. `js/core/router.js`:
   - Sederhanakan breadcrumb label 'home' menjadi 'Kurikulum'.

================================================================================
STATUS: SUKSES DITERAPKAN KE SELURUH KODE SUMBER (REVISI 49 SELESAI)
================================================================================
