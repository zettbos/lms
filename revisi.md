# ZETTBOS MEMBER HUB - DOKUMEN REVISI AKTIF (REVISI 29)
================================================================================
STATUS: SUKSES DITERAPKAN (READY TO PUSH TO VERCEL)
FOKUS: INTEGRASI RESEND EMAIL OTP NATIVE (PIHAK KE-3), SERVERLESS VERCEL API,
       HMAC SIGNED CRYPTOGRAPHIC VERIFICATION, DAN TEMPLATE EMAIL RESMI ZETTBOS
================================================================================

## 1. RINGKASAN IMPLEMENTASI REVISI 29:

1. **Integrasi Resend Third-Party API (`api/send-otp.js`):**
   - API Key Resend Resmi: `re_VVM*** (Tersambung Aktif)`.
   - Menggunakan endpoint Serverless Vercel Node.js untuk memproses permintaan OTP secara aman tanpa membocorkan logika pengiriman ke client.
   - Mengirim email HTML bertema Zettbos Dark Cyberpunk berlogo ZB dan kode OTP 6-digit besar ke inbox penerima via `onboarding@resend.dev` dalam 1–2 detik.

2. **Verifikasi Kriptografis HMAC Tanpa Polusi Database (`api/verify-otp.js`):**
   - Kode OTP ditandatangani dengan HMAC SHA-256 dan token waktu kadaluarsa (10 menit).
   - Verifikasi dilakukan secara stateless: anti-tamper, kebal pemalsuan, dan tidak memerlukan penyimpanan tabel sementara di database.
   - Pengunjung tidak bisa melihat kode OTP melalui Inspect Element karena browser hanya menerima signed token.

3. **Sinkronisasi Routing Vercel (`vercel.json`):**
   - Menambahkan rewrite pengecualian `/api/(.*)` agar endpoint serverless Vercel tidak tertimpa rewrite SPA `index.html`.

4. **Penyesuaian Auth Frontend (`js/controllers/auth.js`):**
   - Menghubungkan fungsi `sendOtpToEmail()` dan `verifyOtpCode()` ke endpoint `/api/send-otp` dan `/api/verify-otp`.
   - Mendukung akses dual-mode: otomatis mengarah ke API Vercel saat dibuka dari `file:///` maupun domain live `https://lms-zettbos.vercel.app`.

================================================================================
SIAP DI-PUSH KE GITHUB & VERCEL VIA TERMINAL
================================================================================
