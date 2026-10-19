# MASTER BLUEPRINT: REVISI 95 - WHITELIST BATCH SMART DEDUPLICATION & TESTIMONIAL PROOF PHOTO SYSTEM
====================================================================================================
STATUS DOKUMEN   : SELESAI DITERAPKAN (IMPLEMENTED & VERIFIED)
ARSITEK SISTEM   : ZettBOT by Zettbos (Universal Product Architect & Lead Engineering Mentor)
KODE REVISI      : REV-20261019-BATCH-WHITELIST-TESTI-PROOF
TANGGAL PERANCANGAN : 19 Oktober 2026
====================================================================================================

---

## 1. LATAR BELAKANG & TUJUAN REVISI

Pengguna mengajukan dua kebutuhan krusial untuk operasional dan konversi landing page LMS Zettbos:
1. **Otomasi Impor Batch Email Whitelist (Case-Insensitive & Auto-Deduplication):**
   - Saat admin menempel (paste) puluhan atau ratusan email sekaligus (misal dari Google Form atau WhatsApp), format huruf sering bercampur (kapital & kecil) dan sering terjadi duplikasi (baik duplikat di dalam teks yang ditempel, maupun email yang sebelumnya sudah ada di database).
   - Admin membutuhkan sistem pintar yang **secara otomatis menyaring duplikat** (tanpa memandang huruf kapital / case-insensitive), **langsung mendaftarkan email yang belum ada**, dan memberikan laporan feedback transparan berapa email yang berhasil diupload serta berapa email duplikat yang dilewati.

2. **Revamp "Cerita Member Zettbos" & Upload Foto Bukti ke Supabase (Social Proof Engine):**
   - Mengganti subjudul lama *"Bagaimana alumni member mendeploy aplikasi nyata mereka dari nol hingga siap pakai."* menjadi narasi testimoni positif yang memukau (menang lomba/hackathon AI, closing projek klien bernilai tinggi, diapresiasi pimpinan di kantor, dll).
   - Di CMS Admin Panel, admin dapat **mengunggah foto bukti** (screenshot chat klien, piala/sertifikat lomba, testimoni WhatsApp, atau tangkapan layar web app) yang **langsung tersimpan di Supabase Storage** (`showcase-covers/testimonials/`).
   - Di Landing Page, kartu testimoni menampilkan tombol/chip **`[📸 Lihat Bukti Foto 🔍]`** yang ketika diklik akan membuka **Modal Lightbox interaktif** beresolusi tinggi agar pengunjung dapat memverifikasi bukti keasliannya secara langsung.

---

## 2. DETAIL RANCANGAN ARSITEKTUR & LANGKAH IMPLEMENTASI

### 🎯 FITUR 1: SMART BATCH WHITELIST AUTO-DEDUPLICATION (CASE-INSENSITIVE)

#### Logika Kerja di `js/controllers/admin.js` (`handleBatchAddMembers`):
1. **Normalisasi String Cerdas:**
   - Input dipisah menggunakan regex fleksibel `[\r\n,;\t ]+` sehingga mendukung pemisah baris baru (Enter), koma, titik koma, spasi, maupun tabulasi dari Excel/Spreadsheet.
   - Setiap entri dibersihkan dari spasi liar (`trim()`) dan dikonversi ke huruf kecil (`toLowerCase()`).
2. **Deduplikasi Tingkat 1 (Internal Batch):**
   - Menggunakan `Set()` lokal untuk membuang email duplikat yang ada di dalam teks yang ditempel pengguna.
3. **Deduplikasi Tingkat 2 (Database & Local State Cross-Check):**
   - Memeriksa ke `AppState.whitelist` (dan query live Supabase `select('email')` jika terhubung).
   - Menyaring seluruh email yang sudah ada secara case-insensitive:
     ```javascript
     const existingSet = new Set((AppState.whitelist || []).map(m => (m.email || '').trim().toLowerCase()));
     const uniqueNewEmails = validEmails.filter(e => !existingSet.has(e));
     const skippedDuplicatesCount = validEmails.length - uniqueNewEmails.length;
     ```
4. **Eksekusi Otomatis:**
   - Jika `uniqueNewEmails.length > 0`: Otomatis generate ID urut (`WL-0001`, `WL-0002`, dst), masukkan ke `AppState.whitelist`, dan lakukan `upsert` ke tabel Supabase `whitelist_members`.
   - Feedback Toast Cerdas:
     - *"Berhasil mendaftarkan X member baru! (Y email duplikat otomatis dilewati)"*
     - Jika semua duplikat: *"Seluruh X email sudah terdaftar di whitelist (tidak ada data baru)."*
5. **Penyempurnaan UI di `index.html`:**
   - Menambahkan badge penjelas di modal: *"✨ Sistem otomatis mendeteksi & melewati email duplikat (huruf besar/kecil dianggap sama)"*.

---

### 🎯 FITUR 2: REVAMP SUBJUDUL CERITA MEMBER ZETTBOS

#### Perubahan Copywriting di `index.html`:
- Subjudul lama:
  `Bagaimana alumni member mendeploy aplikasi nyata mereka dari nol hingga siap pakai.`
- Subjudul baru (Persuasif, Berdampak Nyata & Anti-AI):
  `Kisah nyata alumni Zettbos menembus batas: dari memenangkan hackathon & kompetisi AI, meraih projek bernilai tinggi, hingga mendapat apresiasi pimpinan di tempat kerja.`
- Integrasi CMS: Mendukung kustomisasi subjudul dinamis melalui `AppState.landingCms.testimonialsSubtitle` jika admin ingin mengubahnya di masa depan.

---

### 🎯 FITUR 3: UPLOAD FOTO BUKTI CMS KE SUPABASE & LIGHTBOX MODAL

#### 1. Supabase Storage Integration di `js/core/supabase.js`:
- Mengoptimalkan fungsi helper `ZettSupabase.uploadTestimonialProof(file)`:
  - Menyimpan file ke Bucket Supabase Storage: `showcase-covers` di folder `testimonials/proof_${Date.now()}_${random}.[ext]`.
  - Mengambil `publicUrl` CDN Supabase.
  - Jika Supabase belum terkonfigurasi / offline: Fallback otomatis menggunakan base64 DataURL via `FileReader` sehingga upload tidak pernah macet.

#### 2. Form CMS di `index.html` (`#modal-edit-testimonial`):
- Menambahkan field input foto bukti:
  - Tombol upload file gambar: `[Unggah Foto Bukti Prestasi / Chat]`
  - Drag-drop / upload preview box dengan thumbnail gambar dan tombol `[Hapus Foto]`.
  - Indikator status: *"Mengunggah ke Supabase Storage..."*.
  - Input teks tersembunyi `#edit-testi-proof-url` untuk menyimpan link publik Supabase.

#### 3. Controller CMS di `js/controllers/admin.js`:
- Fungsi `handleTestiProofFileUpload(event)`:
  - Validasi ukuran file (maksimal 5MB) dan tipe gambar (JPG, PNG, WEBP).
  - Panggil upload ke Supabase Storage secara asinkron.
  - Tampilkan thumbnail preview instan.
- Fungsi `handleSaveTestimonialSubmit()`:
  - Simpan property `proofPhotoUrl` ke dalam objek testimoni di `AppState.landingCms.testimonials`.
  - Sinkronkan ke Supabase cloud via `autoPushLandingCmsIfConnected()`.

#### 4. Komponen Kartu Testimoni di `js/controllers/landing.js`:
- Pada fungsi `renderTestiCard(t)`:
  - Jika `t.proofPhotoUrl` terisi: Render tombol aksi kapsul:
    ```html
    <button onclick="openTestimonialProofModal('${escapeHtml(t.proofPhotoUrl)}', '${escapeHtml(t.name)}', '${escapeHtml(t.outcomeBadge || 'Bukti Prestasi')}', '${escapeHtml(t.quote)}')" class="mt-3.5 w-full py-2 px-3 rounded-xl text-xs font-semibold bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 flex items-center justify-center gap-2 transition-all shadow-sm group/proof">
      <svg class="w-4 h-4 text-emerald-400 group-hover/proof:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
      <span>Lihat Bukti Foto / Sertifikat 🔍</span>
    </button>
    ```

#### 5. Modal Lightbox Interaktif di `index.html` (`#modal-testi-proof-lightbox`):
- Kontainer pop-up elegan dengan `backdrop-blur-xl bg-slate-950/85`:
  - Gambar bukti dalam ukuran besar dengan aspek rasio asli yang jernih.
  - Header informasi: Nama member, badge pencapaian (misal: "Juara 1 Hackathon AI" / "Projek Rp 15 Juta"), dan kutipan ulasan.
  - Tombol aksi: `[Buka Tab Baru / Resolusi Asli]` dan tombol tutup `[✕ Tutup]`.

---

## 3. BERKAS-BERKAS YANG AKAN DIMODIFIKASI

1. `js/controllers/admin.js`:
   - Penambahan algoritma case-insensitive duplicate filtering & dynamic count feedback di `handleBatchAddMembers()`.
   - Penambahan handler upload foto bukti testimoni `handleTestiProofFileUpload()` dan binding `proofPhotoUrl`.
2. `js/core/supabase.js`:
   - Penambahan helper `uploadTestimonialProof(file)` targeting bucket `showcase-covers/testimonials/` dengan offline fallback.
3. `index.html`:
   - Update subjudul section "Cerita Member Zettbos".
   - Penambahan field upload foto bukti pada `#modal-edit-testimonial`.
   - Penambahan markup modal lightbox `#modal-testi-proof-lightbox`.
   - Bump cache buster ke `?v=95`.
4. `js/controllers/landing.js`:
   - Rendering tombol `[Lihat Bukti Foto / Sertifikat]` pada kartu testimoni jika `proofPhotoUrl` tersedia.
   - Fungsi pembuka/penutup lightbox `openTestimonialProofModal()` & `closeTestimonialProofModal()`.
5. `prd.md`:
   - Dokumentasi resmi fitur Revisi 95.

---

## 4. ESTIMASI DAMPAK & PROTOKOL KEAMANAN DATA
- **Nol Regresi:** Tidak ada penghapusan data lama. Testimoni eksisting yang belum memiliki foto bukti akan tetap tampil rapi tanpa tombol bukti (bersih tanpa celah).
- **Zero Syntax Error:** Setiap fungsi diikat ke `window` untuk akses global anti-error.
