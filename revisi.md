# MASTER BLUEPRINT: REVISI 98 - MULTI-DEVICE WHITELIST SYNC & MOBILE SIGN-IN
====================================================================================================
STATUS DOKUMEN   : SELESAI DITERAPKAN (IMPLEMENTED & FULLY VERIFIED)
ARSITEK SISTEM   : ZettBOT by Zettbos (Universal Product Architect & Lead Engineering Mentor)
KODE REVISI      : REV-20261019-WHITELIST-PKEY-FIX-MOBILE-LOGIN
TANGGAL PERANCANGAN : 19 Oktober 2026
LANDASAN TEORI   : Distributed Primary Key Management, Idempotent Cloud Upsert, Mobile Responsive UX
====================================================================================================

---

## 1. LATAR BELAKANG & DIAGNOSIS MASALAH

### 🔴 MASALAH 1: Error `duplicate key value violates unique constraint "whitelist_members_pkey"`
- **Gejala:** 
  Ketika admin memasukkan data member baru lalu menekan tombol "Sync ke Cloud", muncul error merah:
  `Gagal menyinkronkan ke Supabase: duplicate key value violates unique constraint "whitelist_members_pkey"`.
  Fitur ini hanya berhasil di laptop utama developer, sedangkan di HP atau laptop admin lain selalu gagal.
- **Akar Masalah (Root Cause):**
  1. Tabel Supabase `whitelist_members` memiliki dua constraint keunikan: Primary Key (`id`) dan Unique Key (`email`).
  2. Fungsi `syncWhitelistToSupabaseLive()` di `js/controllers/admin.js` sebelumnya hanya menarik kolom `email, password_hash, full_name` dari Supabase (kolom `id` tidak di-select).
  3. Saat menyusun payload, sistem memaksa mengirimkan `m.id` buatan browser lokal (misal `WL-0005`).
  4. Di perangkat baru/HP dengan data cache terbatas, counter ID lokal menghitung dari `length + 1` sehingga menghasilkan ID kecil (`WL-0003`, `WL-0005`, dst.).
  5. Padahal di Supabase Cloud, ID tersebut sudah menjadi milik member lain.
  6. PostgreSQL menjalankan `UPSERT ... ON CONFLICT (email)`. Perintah ini hanya menangkap duplikasi pada kolom `email`. Ketika PostgreSQL mendeteksi nilai `id` yang dikirim sudah ada di baris milik email lain, PostgreSQL langsung melempar error keras pelanggaran Primary Key `whitelist_members_pkey`.
- **Solusi Arsitektur:**
  1. **Select `id` dari Cloud:** Saat menarik data dari cloud (`cloudWl`), wajib sertakan kolom `id`: `.select('id, email, password_hash, full_name')`.
  2. **Gunakan ID Asli Cloud untuk Member Eksisting:** Jika email sudah terdaftar di Supabase (`cloudItem`), gunakan `cloudItem.id` yang sah dari database cloud.
  3. **Omit ID untuk Member Baru (Auto-Sequence Database):** Jika email belum ada di database cloud, properti `id` **TIDAK dikirimkan** (`undefined` / dihapus). PostgreSQL Supabase akan otomatis membangkitkan `id` baru menggunakan sequence resmi database (`seq_whitelist_members`).
  4. **Idempotent Single & Batch Insert:** Pada `handleSaveAddMemberSubmit` dan `handleBatchAddMembers`, insert ke Supabase tidak lagi memaksakan ID buatan lokal, melainkan membiarkan Supabase memberikan ID resmi via `.insert(...).select()`, lalu ID tersebut disimpan kembali ke state lokal.

---

### 🔴 MASALAH 2: Tampilan Mobile Belum Memiliki Tombol Sign In / Masuk
- **Gejala:**
  Pengguna atau member yang membuka LMS melalui perangkat mobile (smartphone/HP) tidak menemukan tombol "Masuk" di navigasi atas.
- **Akar Masalah (Root Cause):**
  Di `index.html` baris 349, tombol Masuk memiliki class Tailwind:
  `class="... hidden sm:flex items-center gap-1"`
  Class `hidden sm:flex` secara paksa menyembunyikan tombol Masuk pada ukuran layar di bawah 640px (`< sm`).
- **Solusi UX & Responsivitas:**
  1. Menghapus class `hidden sm:flex` dan menggantinya dengan `flex`.
  2. Menyesuaikan padding tombol (`px-2.5 sm:px-3.5 py-1.5 sm:py-2`) dan gap navbar agar tombol `Theme Toggle`, `Join Kelas`, dan `Masuk` tersusun harmonis dan rapi di mobile tanpa sesak (*no horizontal overflow*).

---

## 2. DETAIL PERUBAHAN TEKNIS BERKAS

### 🎯 1. `js/controllers/admin.js`
- **Fungsi `syncWhitelistToSupabaseLive()`:**
  - Menambahkan kolom `id` pada query select cloud: `.select('id, email, password_hash, full_name')`.
  - Memetakan `cloudMap` dengan `id` cloud asli.
  - Untuk member yang sudah ada di cloud: gunakan `id = cloudItem.id`.
  - Untuk member baru: **jangan kirim properti `id`** (biarkan sequence Supabase membangkitkan `id` unik).
  - Setelah upsert sukses, sinkronkan ID resmi dari Supabase kembali ke `AppState.whitelist`.
- **Fungsi `handleSaveAddMemberSubmit()`:**
  - Saat insert member baru ke Supabase, biarkan Supabase menghasilkan ID database dan gunakan `.select()` untuk memperbarui `newMember.id`.
- **Fungsi `handleBatchAddMembers()`:**
  - Saat batch insert member baru ke Supabase, kirim payload tanpa `id` buatan lokal dan tangkap ID hasil sequence Supabase untuk disimpan ke `AppState.whitelist`.

### 🎯 2. `index.html`
- Memperbarui navbar header: menghapus `hidden sm:flex` dari tombol `Masuk` sehingga langsung tampil elegan di layar smartphone.
- Mengatur gap responsif `gap-1.5 sm:gap-2.5` pada kontrol kanan navbar.
- Menaikkan cache buster seluruh script JS dan stylesheet ke `?v=98`.

### 🎯 3. `prd.md`
- Menaikkan versi dokumen ke `v1.8.0 (REVISI 98)`.
- Mencatat log implementasi perbaikan sinkronisasi whitelist multi-device dan tombol sign in mobile.
