# MASTER BLUEPRINT: REVISI 97 - TESTIMONIAL EMPOWERMENT & CALM CLASSROOM
====================================================================================================
STATUS DOKUMEN   : SELESAI DITERAPKAN (IMPLEMENTED & FULLY VERIFIED)
ARSITEK SISTEM   : ZettBOT by Zettbos (Universal Product Architect & Lead Engineering Mentor)
KODE REVISI      : REV-20261019-TESTIMONI-MEMBER-DRAG-CALM-CLASSROOM
TANGGAL PERANCANGAN : 19 Oktober 2026
LANDASAN TEORI   : Social Proof (Cialdini), Cognitive Friction Removal, Kinetic Touch Ergonomics
====================================================================================================

---

## 1. LATAR BELAKANG & TUJUAN REVISI

1. **Eliminasi Tombol Kanan Bawah di Player Materi (`#floating-progress-pill`):**
   - Di ruang belajar (`#view-learn`), tombol floating pill di pojok kanan bawah sering kali mengalami inkonsistensi teks (stuck di "EP0: Hal Wajib Tahu..." padahal sedang membaca episode lain) akibat kalkulasi scroll offset segment yang rumit.
   - Pengguna sudah memiliki tombol navigasi materi yang presisi:
     - Header materi atas (`#learn-lesson-header-inner`)
     - Footer bacaan tepat di bawah kartu materi (`#learn-reading-footer-inner`)
     - Mode Fokus Zen Bar di bagian atas (`#zen-focus-floating-bar`)
   - Solusi: Menghapus total elemen `#floating-progress-pill` untuk memberikan ruang bacaan yang bersih, tenang, dan bebas bug desinkronisasi.

2. **Pembaruan Istilah "Badge Hasil Nyata / Pencapaian" Menjadi "Nama Web App / Pencapaian":**
   - Label di form testimoni CMS sebelumnya menggunakan *"Badge Hasil Nyata / Pencapaian"*.
   - Sesuai arahan Owner, istilah diperjelas menjadi **"Nama Web App / Pencapaian"** agar lebih relevan dan spesifik dengan karya web app buatan member (contoh: *Aplikasi Kasir Toko, Web App Absensi & Slip Gaji, Juara 1 AMQC Robotika*).

3. **Fitur Pengisian Testimoni Mandiri oleh Member (Maksimal 2 Sebelum Diapprove):**
   - Member resmi Zettbos kini dapat menuliskan ulasan dan membagikan cerita hasil belajarnya secara langsung melalui modal **`#modal-member-submit-testimonial`**.
   - Form submission mengadopsi struktur lengkap CMS:
     - Nama Lengkap (auto-prefill nama member)
     - Peran / Profesi Member
     - Inisial Avatar
     - Nama Web App / Pencapaian
     - Warna Aksen Kartu (Emerald, Cyan, Purple, Amber, Blue, Rose)
     - Kutipan Ulasan / Pengalaman Member
     - Unggah Foto Bukti Testimoni / Chat / Screenshot Karya (Upload langsung ke Supabase Storage)
   - **Aturan Pembatasan (Rate-Limiting & Anti-Spam):**
     - Setiap member dibatasi maksimal mengirimkan **2 testimoni berstatus pending (belum diapprove)**.
     - Jika member mencoba mengirimkan lebih dari 2 testimoni sebelum diapprove oleh mentor, sistem akan memblokir pengiriman dengan peringatan ramah: *"Batas Pengiriman: Anda sudah memiliki 2 testimoni yang sedang menunggu persetujuan mentor."*

4. **Sistem Moderasi Testimoni di Admin CMS (Tab CMS):**
   - Testimoni kiriman member masuk ke antrean dengan `status: 'pending'`.
   - Di tabel Admin CMS, admin dapat melihat badge status: `APPROVED` (hijau) atau `PENDING REVIEW` (kuning).
   - Admin memiliki tombol aksi:
     - **`[✅ Setujui]`**: Mengubah status menjadi `approved`, sehingga langsung tayang di carousel halaman utama.
     - **`[⏸️ Unapprove]`**: Mengembalikan ke pending jika perlu revisi.
     - **`[✏️ Edit]`** & **`[🗑️ Hapus]`**.
   - Halaman utama publik (`landing.js`) hanya menampilkan testimoni yang berstatus `approved` (atau testimoni bawaan admin).

5. **Carousel Testimoni Interaktif (Bisa Digeser / Drag, Swipe, dan Tombol Panah):**
   - Sebelumnya, trek testimoni bergerak pasif dengan CSS animation kaku dan hanya berhenti saat disentuh/hover, sehingga pengguna tidak dapat menggeser sendiri ke kiri/kanan.
   - Solusi:
     - Mengubah kontainer menjadi horizontal scrollable dengan kinetic drag-to-scroll.
     - **Mouse Drag**: Pengguna desktop dapat mengklik dan menggeser bebas ke kiri dan ke kanan (kursor `grab` / `grabbing`).
     - **Touch Swipe**: Pengguna mobile dapat mengusap layar secara alami dengan momentum peramban.
     - **Tombol Navigasi Panah `[ ← ]` & `[ → ]`**: Tombol panah modern di samping/bawah testimoni untuk menggeser kartu per kartu.
     - **Smooth Auto-Scroll Engine**: Saat tidak sedang digeser atau disentuh, carousel tetap meluncur lembut secara otomatis dengan transisi loop tanpa akhir (*seamless infinite wrap*).

---

## 2. DETAIL PERUBAHAN TEKNIS & BERKAS

### 🎯 1. `index.html`
- Menghapus markup `#floating-progress-pill` (lines 3815-3836).
- Memperbarui label form CMS `#modal-edit-testimonial` dari "Badge Hasil Nyata / Pencapaian" menjadi "Nama Web App / Pencapaian".
- Menambahkan modal kirim testimoni member `#modal-member-submit-testimonial`.
- Menambahkan tombol CTA `[+ Bagikan Cerita / Testimoni Member]` dan tombol panah geser `[←]` `[→]` pada section `#landing-testimonials`.
- Memperbarui tabel CMS `#tab-pane-cms` untuk menampilkan kolom Status Moderasi Testimoni.
- Bump cache buster ke `?v=97`.

### 🎯 2. `css/style.css`
- Menghapus aturan `#floating-progress-pill`.
- Memperbarui `.testimonial-marquee-container` menjadi `overflow-x: auto` dengan hidden scrollbar, `cursor: grab`, dan `user-select: none`.
- Menghapus lock CSS animation statis pada trek testimoni dan mengalihkannya ke kinetic auto-scroll yang mendukung manual drag & swipe.

### 🎯 3. `js/controllers/classroom.js`
- Menghapus pembaruan elemen `#floating-progress-pill` di `renderLearningRoom` dan `showLearnModulesCatalog`.
- Menyederhanakan `setupFloatingPillScrollListener` dan `dismissFloatingPill` menjadi no-op function agar tidak memicu error.

### 🎯 4. `js/core/router.js`
- Menghapus pemanggilan elemen `#floating-progress-pill` saat transisi halaman.

### 🎯 5. `js/controllers/landing.js`
- Memperbarui `renderLandingFromCms`: memfilter testimoni hanya yang berstatus `approved` (atau legacy admin).
- Mengimplementasikan `initInteractiveTestimonialsCarousel()`:
  - Event listener `pointerdown`, `pointermove`, `pointerup`, `pointercancel`.
  - Auto-scroll via `requestAnimationFrame` yang pause otomatis saat kursor hover atau jari menyentuh layar.
  - Fungsi `scrollTestimonials(direction)` untuk tombol panah.
- Mengimplementasikan form submission member:
  - `openMemberSubmitTestimonialModal()`
  - `closeMemberSubmitTestimonialModal()`
  - `handleMemberTestiProofUpload()`
  - `handleRemoveMemberTestiProof()`
  - `handleMemberTestimonialSubmit(e)` dengan validasi `pendingCount < 2`.

### 🎯 6. `js/controllers/admin.js`
- Memperbarui tabel testimoni dengan status `APPROVED` / `PENDING REVIEW`.
- Menambahkan fungsi `approveTestimonial(id)` dan `unapproveTestimonial(id)`.
- Mengubah placeholder dan label form edit testimoni CMS.

### 🎯 7. `prd.md`
- Dokumentasi resmi spesifikasi Revisi 97.
