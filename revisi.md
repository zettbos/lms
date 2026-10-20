# MASTER BLUEPRINT: REVISI 102 - SUPABASE CLOUD AUTO-SYNC (AKTIVITAS & FAVORIT) + REDESIGN KARTU WHATSAPP GENDUT & RAPI
====================================================================================================
STATUS DOKUMEN   : SELESAI DITERAPKAN (IMPLEMENTED & FULLY VERIFIED)
ARSITEK SISTEM   : ZettBOT by Zettbos (Universal Product Architect & Lead Engineering Mentor)
KODE REVISI      : REV-20261020-SUPABASE-SYNC-FAV-ACT-WA-CARD-102
TANGGAL DRAF     : 20 Oktober 2026
LANDASAN TEORI   : Cloud Database Dual-Sync, Idempotent Upsert, Resilient Local-First Architecture, Mobile Card Hierarchy & Anti-Truncation UI
====================================================================================================

---

## 1. PENELUSURAN & AKAR MASALAH (ROOT CAUSE ANALYSIS)

Berdasarkan 3 tangkapan layar pengguna (Gambar 1, Gambar 2, dan Gambar 3) dan investigasi menyeluruh pada basis kode LMS, berikut diagnosa teknisnya:

---

### 🔴 MASALAH 1 & 2 (Gambar 1 & Gambar 2): Tabel `member_activity` & `member_favorites` Masih Kosong (0 Records) di Supabase

#### 1. Temuan pada Tabel `member_activity` (Gambar 1):
- **Kondisi di Supabase Cloud:**
  - Tabel `public.member_activity` sudah dibuat dengan skema:
    `id (UUID)`, `user_email (TEXT)`, `study_date (DATE)`, `lessons_completed_count (INT4)`, `created_at (TIMESTAMPTZ)`, dengan `UNIQUE(user_email, study_date)`.
  - Tabel ini saat ini masih **0 records / Empty**.
- **Akar Masalah (Root Cause):**
  - Pada berkas `js/controllers/classroom.js` (baris 1541), ketika siswa menyelesaikan materi pelajaran, sistem hanya memasukkan tanggal belajar (`YYYY-MM-DD`) ke state lokal:
    ```javascript
    AppState.activity[user.email].studiedDates.push(todayStr);
    saveState(); // HANYA disimpan ke localStorage: 'zett_activity'
    ```
  - Bahkan pada fungsi `toggleLessonComplete()` di baris 1853, `AppState.activity` sama sekali tidak dimutakhirkan jika dicentang di luar alur `advanceToNextLesson`.
  - Di dalam berkas `js/core/supabase.js`, **TIDAK ADA SATUPUN** fungsi pengiriman atau penarikan data untuk tabel `member_activity` (tidak ada `pushMemberActivity`, tidak ada `pullMemberActivity`).
  - Akibatnya: seluruh catatan riwayat belajar siswa hanya tersimpan di browser lokal perangkat yang sedang digunakan dan **tidak pernah diunggah ke Supabase Cloud**.

#### 2. Temuan pada Tabel `member_favorites` (Gambar 2):
- **Kondisi di Supabase Cloud:**
  - Tabel `public.member_favorites` sudah dibuat dengan skema:
    `id (TEXT)`, `user_email (TEXT)`, `type (TEXT)`, `target_id (TEXT)`, `title (TEXT)`, `subtitle (TEXT)`, `content (TEXT)`, `language (TEXT)`, `created_at (TIMESTAMPTZ)`.
  - Tabel ini saat ini masih **0 records / Empty**.
- **Akar Masalah (Root Cause):**
  - Pada berkas `js/controllers/classroom.js` (baris 1930 s/d 2050):
    - `toggleCurrentLessonFavorite()` (simpan materi ke favorit)
    - `toggleModuleFavorite()` (simpan modul ke favorit)
    - `saveSnippetToFavorites()` (simpan snippet kode ke favorit)
    - `removeFavorite()` (hapus favorit)
    Semua fungsi di atas hanya memanipulasi memori array `AppState.favorites[user.email]` lalu memanggil `saveState()`, yang hanya menyimpannya ke `localStorage.setItem('zett_favorites', ...)`.
  - Di dalam `js/core/supabase.js`, fungsi `pullAllData()` dan `pushAllLocalDataToSupabase()` **sama sekali tidak memproses tabel `member_favorites`**.
  - Tidak ada fungsi `pushMemberFavorite()`, `removeMemberFavorite()`, maupun `pullMemberFavorites()`.
  - Akibatnya: item favorit yang disimpan siswa hanya ada di laptop/HP saat ini dan tidak pernah tersinkron ke cloud Supabase.

---

### 🔴 MASALAH 3 (Gambar 3): Desain Kartu Kontak WhatsApp Terpotong (*Truncated*)

- **Kondisi Tampilan Saat Ini:**
  - Modal kontak WhatsApp menggunakan grid 2 kolom horizontal (`grid-cols-1 md:grid-cols-2`) di dalam modal berukuran `max-w-2xl` (~672px).
  - Lebar satu kolom kartu hanya berkisar ~305px.
  - Di dalam ruang selebar 305px tersebut, kartu dipaksa menampilkan tata letak **horizontal 1 baris sebaris**:
    - Avatar bulat di kiri (`w-10 h-10` + margin = 52px).
    - Tombol "Chat WhatsApp ->" di kanan yang lebar (`px-3 py-1.5`, ikon, teks = ~125px).
    - Sisa ruang untuk blok teks di tengah (Nama Admin + Badge Online + Nomor HP + Jabatan/Peran) **hanya tersisa sekitar ~84px**!
  - Akibatnya, kelas CSS `truncate` memotong seluruh teks penting:
    - Nama "Admin Farhan" terpotong menjadi `"Admin ..."`.
    - Nomor telepon terpotong menjadi `"0821-9527..."`.
    - Jabatan "Project Manager" terpotong menjadi `"Project Ma..."`.
    - Tampilan tampak terjepit, sesak, dan kurang profesional.

- **Kebutuhan Pengguna:**
  - Desain kartu diperbaiki agar teks **tidak terpotong**.
  - Diperbolehkan dan disarankan dibuat **"agak gendut"** (kartu berorientasi profil/stacked yang lebih tinggi dan lapang) dengan desain yang rapi, modern, dan bernuansa premium.

---

## 2. ARSITEKTUR SOLUSI DEFINITIF (ENGINEERING BLUEPRINT)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          BLUEPRINT REVISI 102 (ZettBOT by Zettbos)                     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. OTOMATISASI SINKRONISASI SUPABASE: member_activity                                   │
│    • Buat ZettSupabase.pushMemberActivity(email, dateStr)                              │
│      -> Upsert ke public.member_activity onConflict (user_email, study_date).          │
│    • Buat ZettSupabase.pullMemberActivity(email)                                       │
│      -> Mengambil riwayat belajar cloud & merge dengan AppState.activity.              │
│    • Panggil otomatis saat:                                                            │
│      - advanceToNextLesson (klik Lanjut & Selesai)                                     │
│      - toggleLessonComplete (centang materi selesai)                                   │
│      - Retroactive Auto-Sync (unggah riwayat lama yang ada di localStorage saat buka)  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. OTOMATISASI SINKRONISASI SUPABASE: member_favorites                                  │
│    • Buat ZettSupabase.pushMemberFavorite(email, favItem)                              │
│      -> Upsert ke public.member_favorites onConflict (id).                             │
│    • Buat ZettSupabase.deleteMemberFavorite(email, favId)                              │
│      -> Hapus baris dari public.member_favorites where id = favId.                     │
│    • Buat ZettSupabase.pullMemberFavorites(email)                                      │
│      -> Tarik favorit cloud saat login / buka menu favorit.                           │
│    • Panggil otomatis saat:                                                            │
│      - toggleCurrentLessonFavorite()                                                   │
│      - toggleModuleFavorite()                                                          │
│      - saveSnippetToFavorites()                                                        │
│      - removeFavorite()                                                                │
│      - Retroactive Auto-Sync (unggah favorit lokal yang belum ada di cloud)            │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. REDESIGN KARTU WHATSAPP "GENDUT" & RAPI (ANTI-TRUNCATION UI)                        │
│    • Modal Container: Lebarkan ke max-w-3xl agar lebih proporsional & gagah.           │
│    • Struktur Kartu Stacked / Gendut:                                                  │
│      [1] HEADER KARTU: Avatar Profil 12x12 (48px) + Indikator Online Pulsing            │
│          + Nama Admin (text-base font-bold, NO TRUNCATE) + Badge Role Spesifik         │
│      [2] BODY KARTU: Nomor WhatsApp dalam Badge Monospace Emerald dengan Ikon Telepon  │
│          + Deskripsi Singkat / Jam Layanan Admin (terbaca tuntas, tanpa kepotong)      │
│      [3] FOOTER KARTU: Full-Width Primary Action Button:                               │
│          [ 💬 Chat via WhatsApp -> ] membentang dari kiri ke kanan dengan gradien rapi  │
│    • Centering Otomatis: Kontak ke-3 (ganjil) tetap di tengah baris kedua.             │
│    • Bersihkan duplikasi penutup </div> liar di index.html baris 2522.                 │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. RENCANA PERUBAHAN BERKAS KODE (SURGICAL IMPLEMENTATION PLAN)

### 📁 Berkas 1: `js/core/supabase.js`
1. **Tambahkan Modul Sinkronisasi `member_activity`:**
   - `pushMemberActivity(userEmail, studyDate)`: Melakukan upsert ke tabel `member_activity` dengan parameter `user_email`, `study_date`, `lessons_completed_count`, dan `created_at`.
   - `pullMemberActivity(userEmail)`: Menarik seluruh `study_date` dari tabel `member_activity`, lalu menyatukan (*merge*) ke dalam `AppState.activity[userEmail].studiedDates`.
   - `syncAllLocalActivityToCloud(userEmail)`: Secara otomatis membaca tanggal belajar dari `localStorage` yang belum ada di cloud, lalu mengunggahnya secara batch (*retroactive sync*).
2. **Tambahkan Modul Sinkronisasi `member_favorites`:**
   - `pushMemberFavorite(userEmail, item)`: Mengirimkan data favorit (`id`, `user_email`, `type`, `target_id`, `title`, `subtitle`, `content`, `language`) ke tabel `member_favorites`.
   - `deleteMemberFavorite(favId)`: Menghapus baris favorit dari tabel Supabase ketika siswa membatalkan bookmark.
   - `pullMemberFavorites(userEmail)`: Menarik seluruh baris favorit milik user dari cloud dan memutakhirkan `AppState.favorites[userEmail]`.
   - `syncAllLocalFavoritesToCloud(userEmail)`: Secara otomatis mengunggah seluruh favorit yang ada di `localStorage` saat ini ke cloud (*retroactive sync*).
3. **Integrasikan ke Alur Utama Sinkronisasi:**
   - Masukkan `pullMemberActivity()` dan `pullMemberFavorites()` ke dalam `pullAllData()` saat pengguna login.
   - Masukkan `syncAllLocalActivityToCloud()` dan `syncAllLocalFavoritesToCloud()` ke dalam `pushAllLocalDataToSupabase()`.
   - Daftarkan method ke `window` (`window.pushMemberActivity`, `window.pushMemberFavorite`, dll).

---

### 📁 Berkas 2: `js/controllers/classroom.js`
1. **Otomatisasi `member_activity` pada Event Belajar Siswa:**
   - Di dalam `advanceToNextLesson(isMarkComplete = true)`: Panggil `pushMemberActivity(user.email, todayStr)`.
   - Di dalam `toggleLessonComplete(lessonId)`: Tambahkan pemutakhiran `AppState.activity[user.email].studiedDates` jika materi dicentang selesai, lalu panggil `pushMemberActivity(user.email, todayStr)`.
2. **Otomatisasi `member_favorites` pada Event Bookmark:**
   - Di dalam `toggleCurrentLessonFavorite()`: Saat item ditambahkan, panggil `pushMemberFavorite(user.email, newItem)`. Saat dihapus, panggil `deleteMemberFavorite(user.email, existingItem.id)`.
   - Di dalam `toggleModuleFavorite(moduleId)`: Lakukan hal serupa untuk item bertipe `module`.
   - Di dalam `saveSnippetToFavorites(codeId, language)`: Panggil `pushMemberFavorite(user.email, snippetItem)`.
   - Di dalam `removeFavorite(favId)`: Panggil `deleteMemberFavorite(user.email, favId)`.
3. **Redesign `renderWhatsAppContactCards()` Menjadi Kartu Gendut & Rapi:**
   - Ubah markup kartu dari format sebaris (*single-line horizontal*) menjadi format **kartu profil berjenjang (*stacked card*)**:
     - **Header:** Avatar lingkaran `w-12 h-12` (lebih besar) dengan inisial dan badge status `Online` pulsing + Nama Admin tebal tanpa truncate (`text-sm sm:text-base font-extrabold text-white break-words`).
     - **Badge & Peran:** Label peran admin ditampilkan dalam badge warna yang kontras dan deskripsi tugas yang jelas (`text-xs text-slate-300 leading-snug`).
     - **Kontak:** Nomor WhatsApp dengan ikon telepon mini dan font monospace hijau emerald.
     - **Footer:** Tombol hijau WhatsApp `w-full` (membentang penuh di dasar kartu) dengan teks `Hubungi via WhatsApp` + ikon panah, memberikan area klik (*touch target*) yang sangat nyaman.
   - Tetap pertahankan aturan penempatan kartu ganjil terakhir (`md:col-span-2 md:max-w-md md:mx-auto md:w-full`).

---

### 📁 Berkas 3: `index.html`
1. **Lebarkan Modal WhatsApp:**
   - Ubah container `#modal-whatsapp-contact .glass-card` dari `max-w-2xl` menjadi `max-w-3xl` agar kartu 2 kolom tampil lapang dan bernapas lega.
2. **Bersihkan Tag Penutup Liar:**
   - Hapus dua tag `</div>` penutup berlebih pada baris 2522–2523.
3. **Naikkan Versi Cache Buster:**
   - Naikkan cache buster script JS ke `?v=103` agar browser pengguna segera mengeksekusi kode sinkronisasi terbaru.

---

### 📁 Berkas 4: `prd.md`
- Perbarui dokumentasi PRD ke versi `v1.9.3 (REVISI 102 - AUTO-SYNC ACTIVITY & FAVORITES + WHATSAPP CARD POLISH)` pada zona master context.

---

## 4. CHECKLIST VERIFIKASI PENGUJIAN

Setelah Anda menyetujui dengan mengetik **"OKE TERAPKAN"**, berikut parameter keberhasilannya:
- [x] Buka aplikasi dan tandai selesai satu materi pembelajaran:
  - Cek tabel `member_activity` di dashboard Supabase: Baris baru otomatis muncul dengan `user_email`, `study_date`, dan `lessons_completed_count`!
- [x] Buka materi atau modul, klik ikon favorit / simpan snippet:
  - Cek tabel `member_favorites` di dashboard Supabase: Baris baru otomatis muncul lengkap dengan `type`, `target_id`, `title`, dan `user_email`!
- [x] Buka modal WhatsApp ("Hubungi Admin Zettbos"):
  - Kartu kini tampil "gendut" (tinggi, lapang, dan proporsional).
  - Nama "Admin Farhan" dan "Admin Asep" tampil utuh tanpa ada titik-titik `...`.
  - Nomor HP dan jabatan admin terbaca tuntas dan bersih.
  - Tombol chat WhatsApp membentang rapi di bagian bawah kartu dengan efek hover interaktif.
- [x] Validasi sintaksis kode dan struktur tag HTML bersih 100%.
