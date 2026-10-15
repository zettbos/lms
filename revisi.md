# ZETTBOS MEMBER HUB - RENCANA PERBAIKAN & AUDIT SISTEM (REVISI 79)
================================================================================
STATUS         : IMPLEMENTED & VERIFIED (REVISI 79 SELESAI)
ARSITEK SISTEM : ZettBOT by Zettbos (Universal Product Architect & Lead Engineering Mentor)
FOKUS UTAMA    : CLOUD-FIRST & ANTI-OVERWRITE ARCHITECTURE (SINKRONISASI WHITELIST & KATA SANDI)
TANGGAL        : 2026-10-15
TARGET RILIS   : LMS Production Enterprise Grade
================================================================================

## 1. RINGKASAN MASALAH & GEJALA DI LAPANGAN

1. **Gejala Lapangan**:
   - Pengguna dengan email `asepsolihin8813@gmail.com` berhasil mendaftar, memverifikasi OTP, dan membuat kata sandi baru (`Admin Asep (2)`).
   - Namun, ketika Owner/Super Admin membuka menu **Whitelist Member** di Admin Panel, nama pengguna masih tertera `Siswa Zettbos` dan statusnya tetap bertuliskan `Belum Buat Sandi`.
   - Admin menduga terjadi desinkronisasi antara `localStorage` browser dan Supabase Database.

2. **Akar Masalah (Root Causes)**:
   - **Root Cause 1: `api/set-password.js` hanya menggunakan HTTP `PATCH`**:
     Serverless API menjalankan `PATCH /rest/v1/whitelist_members?email=eq.<email>`.
     Pada PostgREST Supabase, jika baris email belum terdaftar di cloud (hanya ada di localStorage admin atau variasi case huruf), `PATCH` menghasilkan HTTP 200 dengan `[]` (0 baris diperbarui). Akibatnya, password baru tidak pernah masuk ke database Supabase.
   - **Root Cause 2: Admin "Sync ke Cloud" Menimpa Password Cloud dengan `NULL`**:
     Pada `js/core/supabase.js` (`pushAllLocalDataToSupabase`) dan `js/controllers/admin.js` (`syncWhitelistToSupabaseLive`), data lokal dipetakan dengan `password_hash: w.passwordHash || null`.
     Ketika Admin menekan tombol *Sync ke Cloud* dari browser yang belum tersinkron (di mana akun Asep masih berstatus `passwordHash: null`), perintah `upsert` mengirim `password_hash: null`, sehingga kata sandi yang telah dibuat siswa di cloud **tertimpa dan terhapus kembali**.
   - **Root Cause 3: Tidak Ada Mekanisme Live Fetch / Limit PostgREST 1.000**:
     PostgREST secara default membatasi hasil `.select()` pada 1.000 baris, dan tidak ada tombol manual untuk menarik data status kata sandi siswa secara live dari cloud ke dashboard Owner.

---

## 2. TINDAKAN TEKNIS YANG DILAKUKAN (REVISI 79)

1. **Safe Upsert & Anti-Loss di `api/set-password.js`**:
   - Menggunakan query case-insensitive `email=ilike.<cleanEmail>`.
   - Memeriksa jumlah baris yang ter-update. Jika bernilai 0 / kosong, sistem otomatis mengeksekusi fallback `POST /rest/v1/whitelist_members` dengan `Prefer: resolution=merge-duplicates` agar data nama (`fullName`) dan hash kata sandi (`passwordHash`) dijamin 100% tersimpan ke Supabase.
2. **PostgREST Case-Insensitive Hardening**:
   - Mengubah query email di `api/verify-login.js`, `api/check-whitelist.js`, dan `api/send-otp.js` menjadi `email=ilike.<email>` untuk mencegah kegagalan login akibat perbedaan huruf besar/kecil.
3. **Mekanisme Proteksi Anti-Overwrite (`js/core/supabase.js` & `js/controllers/admin.js`)**:
   - Sebelum melakukan *push* atau *upsert* ke tabel `whitelist_members`, sistem terlebih dahulu menarik `email, password_hash, full_name` yang sudah ada di Supabase Cloud ke dalam `cloudMap`.
   - Jika di browser lokal statusnya belum ada kata sandi (`w.passwordHash == null`), namun di cloud siswa sudah membuat kata sandi, sistem secara cerdas **mempertahankan hash sandi cloud** dan menyinkronkannya kembali ke memori lokal.
   - Nama kustom siswa (seperti `Admin Asep (2)`) tidak akan lagi tertimpa menjadi `Siswa Zettbos`.
4. **Tombol "Tarik dari Cloud" & Auto-Sync Whitelist**:
   - Menambahkan tombol **"Tarik dari Cloud"** (`pullWhitelistFromSupabaseLive()`) di toolbar Admin Whitelist.
   - Mengintegrasikan penarikan data live otomatis saat tab Whitelist dibuka oleh admin via `switchAdminTab('whitelist')`.
   - Menambahkan batas query `.limit(10000)` agar seluruh member terpindai lengkap.
5. **Direct Client Upsert Fallback (`js/controllers/auth.js`)**:
   - Fungsi `handleSetPasswordSubmit()` kini menjalankan `.upsert()` berkonflik pada kolom `email` alih-alih `.update()`, menjamin ketersediaan row di Supabase secara instan.
6. **Cache Buster Update (`index.html`)**:
   - Seluruh tag script JavaScript dinaikkan ke versi **`?v=79`**.

---

## 3. BERKAS-BERKAS YANG DIUBAH

1. [api/set-password.js](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/api/set-password.js) - Safe Upsert fallback & case-insensitive `ilike`.
2. [api/verify-login.js](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/api/verify-login.js) - Query case-insensitive `ilike`.
3. [api/check-whitelist.js](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/api/check-whitelist.js) - Query case-insensitive `ilike`.
4. [api/send-otp.js](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/api/send-otp.js) - Query case-insensitive `ilike`.
5. [js/controllers/auth.js](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/js/controllers/auth.js) - Client direct `.upsert()` pada email.
6. [js/core/supabase.js](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/js/core/supabase.js) - Anti-Overwrite push & intelligent merge pull whitelist.
7. [js/controllers/admin.js](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/js/controllers/admin.js) - Anti-Overwrite sync, `pullWhitelistFromSupabaseLive()`, and tab switch auto-pull.
8. [index.html](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/index.html) - Tombol "Tarik dari Cloud" & cache buster `?v=79`.
9. [prd.md](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/prd.md) - Dokumentasi arsitektur v1.5.5.
10. [revisi.md](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/revisi.md) - Pelacak implementasi Revisi 79.

---

## 4. CHECKLIST PENGUJIAN

- [x] **Safe Upsert API**: `/api/set-password` menjamin baris baru tersimpan jika PATCH tidak mengenai row.
- [x] **Case-Insensitive PostgREST**: Query login dan OTP toleran terhadap perbedaan huruf kapital pada email.
- [x] **Anti-Overwrite Protection**: Tombol "Sync ke Cloud" tidak akan pernah lagi menimpa sandi siswa di cloud dengan `null`.
- [x] **Live Pull Whitelist**: Tombol "Tarik dari Cloud" berhasil memperbarui status sandi siswa dan nama profil real-time.
- [x] **Cache Buster Updated**: Seluruh script JavaScript berjalan di versi `?v=79`.
