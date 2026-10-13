# ZETTBOS MEMBER HUB - DOKUMEN REVISI AKTIF (REVISI 46)
================================================================================
STATUS: SUKSES DITERAPKAN (REVISI 46 SELESAI)
ARSITEK SISTEM: ZettBOT by Zettbos (Universal Product Architect & Lead Engineering Mentor)
FOKUS REVISI:
  1. LIGHT MODE FIX: MINI PROGRESS WIDGET DI WELCOME BAR BERANDA (GAMBAR 1)
  2. ELIMINASI DATA DUMMY HARDCODE: KALENDER BELAJAR BULANAN DASHBOARD (GAMBAR 2)
  3. FIX CODE SNIPPET FAVORIT & RE-STYLING LIGHT MODE ITEM TERSIMPAN (GAMBAR 3)
  4. HAPUS INPUT YOUTUBE UNLISTED & FIX WARNA LIGHT MODE EDITOR NOTION (GAMBAR 4)
  5. STICKY SCROLLING UNTUK LIVE PREVIEW EDITOR DI ADMIN (GAMBAR 5)
================================================================================

## 1. DETAIL ANALISIS MASALAH & RENCANA SOLUSI TEKNIS:

### A. Gambar 1: Light Mode Glitch Mini Progress Widget di Beranda
- **Masalah**: Kotak mini progress di bar sambutan Beranda memiliki kelas `bg-slate-950/70 border-slate-800/80` yang menjadikannya blok hitam gelap kotor di tengah-tengah banner putih saat Light Mode, dengan teks `text-slate-400` yang sulit dibaca (kontras rendah).
- **Solusi Teknis**:
  * Menambahkan class `.dash-progress-mini-card` pada widget tersebut.
  * Menambahkan styling CSS khusus `html.light .dash-progress-mini-card`:
    - Latar belakang: `#F8FAFC` (slate alabaster bersih).
    - Border: `#E2E8F0` dengan shadow halus.
    - Teks: label abu-abu tegas `#64748B`, angka progress emerald `#059669`.
    - Track progress bar: `#E2E8F0` dan tombol Detail cyan `#0891B2` yang kontras dan elegan.

---

### B. Gambar 2: Data Dummy Hardcode di Kalender Belajar Bulanan
- **Masalah**: Pada `renderMonthlyLearningCalendar()` di `js/controllers/classroom.js` baris 686, terdapat fallback array tanggal statis yang di-hardcode:
  `['2026-10-02', '2026-10-04', '2026-10-07', '2026-10-09', '2026-10-11', '2026-10-12']` serta `isToday = (day === 12)`. Akibatnya, kalender selalu menampilkan 6 hari belajar aktif buatan (fake data) meskipun pengguna belum belajar.
- **Solusi Teknis**:
  * Menghapus array fallback statis tersebut dan menggantinya murni dengan data aktivitas riil pengguna:
    `let studiedDates = (userActivity && Array.isArray(userActivity.studiedDates)) ? userActivity.studiedDates : [];`
  * Menghitung tanggal hari ini secara dinamis menggunakan `new Date()`.
  * Jika belum ada aktivitas, kalender akan bersih (0 Hari Belajar Bulan Ini) tanpa tanda centang hijau palsu.

---

### C. Gambar 3: Code Snippet Pecah di Favorit & Warna Light Mode Item Tersimpan
- **Masalah 1 (Code Snippet Rusak)**: Pada `renderFavorites()` di `js/controllers/classroom.js` baris 1389, atribut inline:
  `onclick="navigator.clipboard.writeText(${JSON.stringify(item.content)})..."`
  menggunakan kutip dua di dalam kutip dua. Kutip pada `JSON.stringify` langsung menutup atribut `onclick`, menyebabkan sisa kode JavaScript dan tombol HTML tumpah ke layar sebagai teks mentah (`antigravity-ide > projek").then(() => ...`).
- **Masalah 2 (Badge Light Mode)**: Badge `"ITEM TERSIMPAN"` (`bg-amber-950/80`) dan tag `"SNIPPET JAVASCRIPT"` berlatar gelap pekat di Light Mode.
- **Solusi Teknis**:
  * Membuat fungsi global yang aman: `window.copyFavoriteSnippet(favId)` untuk menyalin kode tanpa string escaping di markup HTML. Tombol salin cukup memanggil `onclick="copyFavoriteSnippet('${item.id}')"`.
  * Menambahkan CSS Light Mode untuk `#view-favorites`:
    - Badge `"ITEM TERSIMPAN"`: latar `#FEF3C7`, teks `#92400E`, border `#FDE68A`.
    - Tag Snippet: latar `#F3E8FF`, teks `#7E22CE`, border `#DDD6FE`.
    - Pre code block: border rapi `#E2E8F0`, teks emerald `#059669` pada background terminal yang bersih.

---

### D. Gambar 4: Hapus Input YouTube Unlisted & Warna Light Mode Editor Notion
- **Masalah 1**: Kolom input standalone *"Link URL Video YouTube Unlisted (Video Pembelajaran)"* sudah tidak diperlukan karena admin memasukkan video langsung sebagai blok modular di konten materi.
- **Masalah 2 (Warna Light Mode Editor)**: Blok editor (Heading 1, Teks Normal, Blok Kode) berlatar gelap (`bg-slate-900/60`, dropdown `bg-slate-950`) sehingga terlihat kotor dan bertabrakan dengan background putih di Light Mode.
- **Solusi Teknis**:
  * Menghapus kolom input `#admin-edit-youtube` dari grid di `index.html`.
  * Menyesuaikan `js/controllers/admin.js` agar tidak mewajibkan/membaca field tersebut.
  * Menambahkan CSS Light Mode khusus untuk `#notion-editor-root`:
    - Kartu blok: latar belakang putih `#FFFFFF`, border halus `#E2E8F0`, shadow ringan ala Notion.
    - Dropdown tipe blok & format bar: latar `#F8FAFC`, border `#CBD5E1`, teks pekat `#0F172A`.
    - Input & Textarea editor: teks hitam pekat `#0F172A`, placeholder abu-abu `#94A3B8`.
    - Blok kode di editor: kontras terminal bersih `#0F172A` dengan teks kode emerald `#059669`.

---

### E. Gambar 5: Sticky Scrolling untuk Live Preview di Admin Editor
- **Masalah**: Saat admin membuat materi panjang dengan banyak blok ke bawah, panel *"LIVE PREVIEW (TAMPILAN SISWA)"* di sebelah kanan tertinggal di atas layar, sehingga admin harus scroll jauh ke atas untuk mengecek preview.
- **Solusi Teknis**:
  * Mengatur kolom Live Preview di `index.html` menjadi **Sticky Column**:
    `class="lg:sticky lg:top-20 self-start"`
  * Memberikan batasan tinggi adaptif viewport dengan scroll mandiri:
    `max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar`
  * Hasil: Saat admin scroll ke bawah menambahkan blok sebanyak apa pun, panel Live Preview akan selalu menempel di sisi kanan layar dan otomatis menampilkan pembaruan secara real-time!

---

## 2. FILE YANG AKAN DIUBAH:
1. `index.html`:
   - Tambah class `.dash-progress-mini-card` pada mini progress widget.
   - Hapus field input YouTube Unlisted di editor kurikulum admin.
   - Pasang sticky wrapper pada Live Preview (`lg:sticky lg:top-20 self-start`).
   - Bump cache buster ke `?v=46`.
2. `css/style.css`:
   - Light mode styles untuk `.dash-progress-mini-card`.
   - Light mode styles untuk `#view-favorites` (badge Item Tersimpan & snippet tags).
   - Light mode styles untuk `#notion-editor-root` (Notion block editor, inputs, selects, & live preview container).
3. `js/controllers/classroom.js`:
   - Hapus array tanggal dummy statis di `renderMonthlyLearningCalendar()` & gunakan tanggal dinamis real-time.
   - Buat fungsi `copyFavoriteSnippet()` dan perbaiki render snippet di `renderFavorites()`.
4. `js/controllers/admin.js`:
   - Hilangkan ketergantungan pada `#admin-edit-youtube`.

================================================================================
PANDUAN EKSEKUSI: TUNGGU INSTRUKSI "OKE TERAPKAN" DARI PENGGUNA SEBELUM MENGUBAH KODE
================================================================================
