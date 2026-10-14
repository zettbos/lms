# ZETTBOS MEMBER HUB - DOKUMEN LAPORAN REVISI (REVISI 59)
================================================================================
STATUS: SUKSES DITERAPKAN (REVISI 59 SELESAI & TERVERIFIKASI)
ARSITEK SISTEM: ZettBOT by Zettbos (Universal Product Architect & Lead Engineering Mentor)
FOKUS TUGAS: INTERACTIVE IMAGE LIGHTBOX MODAL PADA PREVIEW FASILITAS & FOTO LANDING
================================================================================

## RINGKASAN HASIL EKSEKUSI
1. **Universal Image Lightbox Modal (`#modal-image-lightbox`) Berhasil Dibuat**:
   - Ditempatkan di [index.html](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/index.html) dengan backdrop gelap blur (`backdrop-blur-md bg-slate-950/90 z-[100]`), animasi transisi halus (`animate-scale-up`), badge fasilitas, judul foto, tombol `↗ Buka Gambar Asli` di tab baru, dan tombol tutup silang `✕`.
   - Mendukung penutupan instan via tombol keyboard `Escape` maupun klik di luar area foto (backdrop click).
2. **Foto Preview Device Interaktif & Click-to-Zoom**:
   - Di [landing.js](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/js/controllers/landing.js), foto fasilitas pada frame device preview kini memiliki class `cursor-zoom-in group/zoom` dengan hover scale yang halus.
   - Dilengkapi floating chip badge melayang di pojok kanan bawah: **`🔍 Klik untuk Perbesar`** yang memberi visual cue jelas kepada pengunjung.
   - Mengklik foto seketika memanggil `openFacilityImageLightbox(target.id)` yang menampilkan gambar dalam resolusi penuh tajam.
3. **Fungsi Global Terbuka & Modular**:
   - `openImageLightbox(imageUrl, title, badge)` dan `closeImageLightbox()` diekspos ke `window` sehingga dapat digunakan kembali di bagian lain LMS kapan saja.
4. **Cache Buster**:
   - Diperbarui ke `?v=59` di `index.html` pada stylesheet dan seluruh 13 modul skrip JS.


## 1. DETAIL KEBUTUHAN & AKAR MASALAH (REVISI 59)

### PERMINTAAN PENGGUNA
Pengguna melampirkan tangkapan layar bagian *"Fasilitas & Ekosistem Belajar"* (bagian *"Lebih Dari Sekadar Kelas Video Biasa"*) pada Landing Page. Pada sisi kanan, terdapat mockup bingkai device (*Live Preview*) yang menampilkan gambar/foto preview dari fasilitas terpilih (contohnya: screenshot instalasi terminal ZettBOT). 
Pengguna meminta:
> *"gw pengen foto disini bisa dipencet untuk membuka fotonya"*

### AKAR MASALAH TEKNIS
1. Di `index.html` dan `js/controllers/landing.js`, elemen kontainer `#landing-facility-preview-screen` merender gambar fasilitas dengan elemen `<img>` standar tanpa event handler `onclick`, tanpa kursor interaktif (`cursor-zoom-in`), dan tanpa modal pratinjau resolusi tinggi (Lightbox Modal).
2. Ketika pengunjung mengklik foto pada mockup device tersebut, tidak ada aksi apapun yang terjadi sehingga detail teks atau tangkapan layar yang padat (seperti kode terminal atau UI) sulit dibaca pada ukuran device mockup yang ringkas.

---

## 2. RANCANGAN SOLUSI ARSITEKTUR ZETTBOT

### A. Komponen Modal Lightbox Gambar Global (`#modal-image-lightbox`) di `index.html`
Tambahkan modal gambar universal berstandar Zettbos dengan spesifikasi:
- **Backdrop Blur & Dimming**: Latar belakang gelap transparan dengan efek blur halus (`fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md`).
- **Animasi Pop-Up Halus**: Transisi zoom dan fade-in (`animate-scale-up`).
- **Header Info & Navigasi**:
  - Badge kategori / nama fasilitas terpilih.
  - Judul gambar (`#lightbox-image-title`).
  - Tombol aksi `↗ Buka Ukuran Penuh` (membuka file asli di tab browser baru).
  - Tombol `✕ Tutup` yang jelas dan mudah dijangkau.
- **Tampilan Foto Maksimal & Responsif**:
  - Kontainer gambar dibatasi `max-h-[82vh] max-w-5xl` dengan `object-contain`, mempertahankan rasio aspek gambar aslinya tanpa distorsi atau cropping.
- **Interaksi Ramah Pengguna**:
  - Klik di luar area gambar (pada backdrop) otomatis menutup modal.
  - Tekan tombol keyboard `Escape` otomatis menutup modal.

### B. Interaktivitas pada Mockup Preview Fasilitas (`js/controllers/landing.js`)
1. **Visual Affordance (Petunjuk Visual Bisa Diklik)**:
   - Tambahkan class `cursor-zoom-in group/zoom relative` pada kontainer gambar di `#landing-facility-preview-screen`.
   - Pasang floating chip di pojok kanan bawah gambar:
     ```html
     <div class="absolute bottom-3 right-3 px-2.5 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5 shadow-xl group-hover/zoom:scale-105 group-hover/zoom:border-emerald-400 transition-all pointer-events-none">
       <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"/></svg>
       <span>Klik untuk Perbesar</span>
     </div>
     ```
2. **Event Trigger `openFacilityImageLightbox()`**:
   - Jika fasilitas memiliki `imageUrl`, klik pada layar mockup device seketika memanggil `openImageLightbox(convertedUrl, target.title, target.badge)`.
   - Jika fasilitas sedang menggunakan live mockup HTML (belum upload gambar kustom), klik layar menampilkan petunjuk toast ramah: *"Fasilitas ini sedang menggunakan live interactive preview."*

### C. Fungsi Controller Universal (`openImageLightbox` & `closeImageLightbox`)
- Dibuat modular dan diekspos ke `window` agar dapat dipakai tidak hanya di fasilitas landing page, tetapi juga di modul kurikulum, Notion image blocks, atau dokumen materi lainnya di masa depan.
- Otomatis mendaftarkan event listener `keydown` (tombol `Escape`) saat modal dibuka dan melepaskannya saat ditutup untuk menjaga performa memori.

---

## 3. BERKAS YANG AKAN DIUBAH
1. **`index.html`**:
   - Tambahkan markup `#modal-image-lightbox` di area modal global.
   - Bump versi cache buster ke `?v=59`.
2. **`js/controllers/landing.js`**:
   - Update `selectLandingFacilityPreview` untuk menambahkan interaksi klik dan floating badge *"Klik untuk Perbesar"* pada gambar.
   - Tambahkan implementasi `openImageLightbox(imageUrl, title, badge)` dan `closeImageLightbox()`.
3. **`prd.md`**:
   - Bump versi Master Context ke `v1.3.0` dan siapkan catatan arsitektur Revisi 59.

---

## 4. JAMINAN KEAMANAN SISTEM
- **Zero-Breaking Change**: Tidak merusak CMS sinkronisasi Supabase yang baru saja dituntaskan di Revisi 57-58.
- **Responsif Mobile & Desktop**: Modal otomatis menyesuaikan layar HP maupun PC ultrawide.
- **Fallback Aman**: Jika koneksi lambat atau gambar gagal memuat, modal menyediakan tombol buka link eksternal dan tetap bisa ditutup dengan lancar.
