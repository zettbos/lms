# ZETTBOS MEMBER HUB - DOKUMEN REVISI AKTIF (REVISI 42)
================================================================================
STATUS: SUKSES DITERAPKAN (READY TO PUSH TO GITHUB & VERCEL)
ARSITEK SISTEM: ZettBOT by Zettbos (Universal Product Architect & Lead Engineering Mentor)
FOKUS REVISI:
  1. AUTO-CONVERTER GOOGLE DRIVE KE FORMAT DIRECT IMAGE CDN (LH3.GOOGLEUSERCONTENT.COM)
  2. PENGATURAN PROFIL MEMBER LENGKAP (GANTI NAMA LENGKAP & KATA SANDI)
  3. RESOLUSI TUNTAS SINKRONISASI PASSWORD SUPABASE (TWO-WAY SYNC SUPABASE & LOCALSTORAGE)
================================================================================

## 1. DETAIL FITUR & PERUBAHAN:

### A. Auto-Converter Link Google Drive ke Format Direct CDN `lh3` (`admin.js` & `index.html`)
- **Fungsi `convertGoogleDriveToLh3(url)`**:
  - Mendeteksi format link Google Drive umum:
    * `drive.google.com/file/d/FILE_ID/view...`
    * `drive.google.com/open?id=FILE_ID`
    * `docs.google.com/uc?id=FILE_ID`
  - Secara instan mengubahnya menjadi URL CDN direct image:
    `https://lh3.googleusercontent.com/d/FILE_ID=w1000`
- **Integrasi di Modal Edit/Tambah Modul**:
  - Begitu Admin mem-paste link Google Drive ke input `#manage-module-cover`, sistem otomatis mengganti nilai input ke link format `lh3`, merender Live Image Preview seketika, dan memunculkan toast konfirmasi.
  - Ditambahkan badge panduan `⚡ Auto-Convert Google Drive (lh3)` di atas form.

### B. Pengaturan Profil Member (`index.html` & `auth.js`)
- **Akses UI**:
  - Di navbar atas (desktop) dan drawer samping (mobile), avatar profil member dilengkapi label interaktif dan tombol aksi `⚙️ Edit Profil`.
- **Modal Profil Siswa (`#modal-profile-settings`)**:
  - Kolom Email terkunci (read-only dengan badge gembok) agar konsistensi whitelist terjaga.
  - Kolom Nama Lengkap `#profile-fullname-input` (dapat diedit bebas).
  - Kolom Ubah Kata Sandi `#profile-new-password` & `#profile-confirm-password` (opsional, min. 8 karakter, dienkripsi SHA-256).
- **Logika Penyimpanan**:
  - `handleSaveProfileSubmit()` memperbarui local state `AppState.currentUser.fullName` dan `AppState.whitelist`.
  - Mengirim update ke tabel `whitelist_members` di database Supabase Cloud (`full_name` & `password_hash`).
  - Sapaan di Beranda dan avatar langsung di-render ulang secara real-time.

### C. Resolusi Tuntas Sinkronisasi Password Supabase (`auth.js` & `schema.sql`)
- **Penyebab Masalah**:
  - Di perangkat siswa lama, password tersimpan di `localStorage` sehingga dia bisa login di HP tersebut. Namun di Supabase, update diblokir karena RLS `whitelist_members` sebelumnya hanya memiliki policy `SELECT`.
  - Selain itu, saat login di perangkat baru, sistem hanya memeriksa lokal tanpa melakukan live check ke Supabase jika objek member sudah ada dengan hash null.
- **Solusi Komprehensif**:
  1. `onLoginEmailChanged()` & `handleLoginSubmit()` kini memeriksa Supabase Cloud secara live jika `member.passwordHash` di lokal masih kosong, sehingga member yang login di HP lain otomatis mendapatkan password dari Supabase!
  2. `handleSetPasswordSubmit()` menyertakan fallback upsert ke Supabase untuk memastikan hash password tersimpan 100%.
  3. `supabase/schema.sql` menyertakan policy RLS:
     `CREATE POLICY "Public Update Whitelist" ON public.whitelist_members FOR UPDATE USING (true) WITH CHECK (true);`

---

## 2. VERSI SCRIPT & CACHE BUSTER
- Seluruh script modular di `index.html` dinaikkan ke versi `?v=42` untuk eliminasi cache browser.

================================================================================
SIAP DI-PUSH KE GITHUB & VERCEL VIA PUSH-GITHUB.BAT
================================================================================
