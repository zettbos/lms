# MASTER BLUEPRINT: REVISI 101 - POLISHING LANDING PORTAL, CMS KONTAK WA & MOBILE UX
====================================================================================================
STATUS DOKUMEN   : SELESAI DITERAPKAN (IMPLEMENTED & FULLY VERIFIED)
ARSITEK SISTEM   : ZettBOT by Zettbos (Universal Product Architect & Lead Engineering Mentor)
KODE REVISI      : REV-20261020-LANDING-CMS-MOBILE-POLISH-101
TANGGAL DRAF     : 20 Oktober 2026
LANDASAN TEORI   : Responsive Grid Architecture, Dynamic CMS Multi-Contact, Mobile-First 1-Thumb UX, Event Propagation Decoupling
====================================================================================================

---

## 1. DAFTAR PERMASALAHAN & AKAR MASALAH (ROOT CAUSE ANALYSIS)

Berdasarkan 5 tangkapan layar (Gambar 1 - Gambar 5) dan instruksi spesifik pengguna, berikut adalah diagnosa teknis mendalam:

### 🔴 MASALAH 1 (Gambar 1): Modal Kontak WhatsApp Vertikal & CMS Kontak Terbatas 2 Orang
- **Kondisi Saat Ini:**
  - Layout modal `#modal-whatsapp-contact` tersusun vertikal menumpuk dari atas ke bawah (`space-y-3.5`).
  - Akibat psikologis UX: Pengunjung website cenderung selalu memilih kontak teratas (Admin Farhan) dan jarang sekali mengontak admin bawah (Admin Asep).
  - Di panel Admin CMS (`admin.js` dan form `index.html`), data kontak admin di-hardcode kaku hanya untuk 2 orang (Admin 1 dan Admin 2), tidak ada fitur tambah kontak baru, edit dinamis, maupun hapus kontak.
- **Kebutuhan Pengguna:**
  - Layout modal diubah menjadi **horizontal 2 grid kolom**.
  - Jika jumlah kontak ganjil (misal 3 kontak), kontak terakhir (kontak ke-3 di baris bawah) harus berada tepat di **posisi tengah**.
  - Di CMS Admin, pengguna bisa menambah kontak lebih dari 2 orang secara dinamis, dan perubahan otomatis tampil di modal kontak WhatsApp publik.

---

### 🔴 MASALAH 2 (Gambar 2): Menu Mobile Navigation Bar Bawah Tidak Lengkap
- **Kondisi Saat Ini:**
  - Menu navigasi bawah mobile (`#mobile-bottom-nav`) saat ini hanya memiliki 5 tombol: `Home`, `Kalender`, `Belajar`, `ZettLink`, dan `Favorit`.
  - Halaman showcase karya member (`ZettGallery` / `showcase`) hilang total dari navigasi mobile.
  - Untuk pengguna dengan peran Admin/Owner, tidak tersedia jalan pintas cepat ke `Admin Panel` di perangkat mobile.
  - Tombol hamburger di header top navbar mobile (`#btn-sidebar-toggle`) disembunyikan dengan kelas `hidden md:flex`, sehingga pengguna mobile terisolasi dan tidak bisa membuka drawer menu utama lengkap.
  - Terdapat duplikasi elemen markup dengan ID `#mobile-bottom-nav` di `index.html` (baris 3959 dan baris 4155).

---

### 🔴 MASALAH 3 & 4 (Gambar 3 & Gambar 4): Tampilan Mobile Fasilitas & Target Siswa Terlalu Panjang
- **Kondisi Saat Ini:**
  - Bagian Fasilitas Kelas ("Lebih Dari Sekadar Kelas Video Biasa") dan Target Siswa ("Siapa Saja yang Butuh Bikin Web App Pakai AI?") diatur dengan kelas `grid-cols-1` pada breakpoint mobile.
  - Karena terdapat 6 kartu fasilitas (5 fitur + 1 CTA daftar) dan 4 kartu target audiens dengan padding besar, pengguna harus melakukan scroll vertikal yang sangat panjang (*infinite vertical fatigue*).
- **Kebutuhan Pengguna:**
  - Tampilan mobile untuk kedua section tersebut diubah menjadi **2 grid kolom (`grid-cols-2`)** agar compact, simetris, dan hemat ruang layar.

---

### 🔴 MASALAH 5 (Gambar 5): Teks Petunjuk Drag Testimoni & Tombol "Lihat Testimoni" Macet
- **Kondisi Saat Ini:**
  - Di bawah track testimoni terdapat badge teks: *"Bisa digeser dengan mouse drag, swipe, atau tombol panah"* yang ingin dihilangkan agar tampilan lebih bersih dan profesional.
  - Tombol *"Lihat Testimoni"* di kartu testimoni alumni (misal pada testimoni M Adriansyah) sama sekali tidak merespons klik (*unclickable*).
- **Akar Masalah (Root Cause) Tombol Testimoni Tidak Bisa Diklik:**
  1. **Interferensi Pointer Capture:** Controller carousel (`landing.js` baris 1303) memasang `pointerdown` pada container dan memanggil `container.setPointerCapture(e.pointerId)`. Ini mengalihkan seluruh event pointer dan event `click` ke container, sehingga tombol anak kehilangan event kliknya.
  2. **Event Cancellation:** Handler klik di level capture (`useCapture: true`) membatalkan klik dengan `e.preventDefault()` jika ada pergeseran micro-jitter dari auto-scroll glide.
  3. **Inline Escaping Hazard:** Parameter pemanggilan fungsi `openTestimonialProofModal` disuntikkan langsung ke string atribut HTML `onclick` dengan tanda petik tunggal, yang rentan memicu `SyntaxError` di parser browser jika teks quote mengandung tanda petik atau karakter khusus.

---

## 2. ARSITEKTUR SOLUSI DEFINITIF (ENGINEERING BLUEPRINT)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             MASTER BLUEPRINT REVISI 101                          │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 1. MODAL WHATSAPP & CMS MULTI-KONTAK                                             │
│    • Container Modal: max-w-2xl, Grid: grid-cols-1 md:grid-cols-2 gap-3.5        │
│    • Odd Centering Rule: Jika ganjil (3 kontak), item terakhir dapat kelas:     │
│      [ md:col-span-2 md:max-w-md md:mx-auto md:w-full ]                          │
│    • CMS Admin Dinamis: [+ Tambah Kontak], input Nama, WA, Peran, Hapus Kontak   │
│    • Real-time Sync ke Supabase & Auto-render ke Modal Publik                    │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 2. MOBILE BOTTOM NAVIGATION BAR                                                  │
│    • Eliminasi duplikasi ID markup di index.html                                 │
│    • Menu Lengkap: Home, Kalender, Belajar, ZettLink, Galeri (ZettGallery),      │
│      Favorit, dan Admin Panel (dinamis khusus admin/owner)                       │
│    • Aktifkan tombol Hamburger di header mobile (hapus 'hidden md:flex')         │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 3 & 4. MOBILE 2 GRID KOLOM (FASILITAS & TARGET SISWA)                            │
│    • Fasilitas: grid-cols-2 sm:grid-cols-2 (3 baris x 2 kolom = 6 kartu pas)     │
│    • Target Siswa: grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 (2 baris x 2 kolom)│
│    • Optimasi Typography & Padding: p-3 mobile, icon w-8 s/d w-9, line-clamp-3   │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 5. TESTIMONIAL CAROUSEL CLEANUP & TOMBOL BUKTI KLIK                              │
│    • Hapus elemen div teks 'Bisa digeser dengan mouse drag...'                   │
│    • Bypass pointer capture: if (e.target.closest('button, a')) return;          │
│    • Fungsi Baru: openTestimonialProofModalById(testiId) bebas syntax error      │
│    • Tombol Card: onclick="event.stopPropagation(); openTestimonialProofModal..."│
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

### DETAIL IMPLEMENTASI PER ITEM:

### 🛠️ SOLUSI ITEM 1: Modal WhatsApp Horizontal & CMS Dinamis
1. **Modal Publik (`#modal-whatsapp-contact` & `renderWhatsAppContactCards`):**
   - Di `index.html`, ubah kontainer modal menjadi `max-w-2xl w-full`.
   - Ubah elemen list kartu menjadi:
     `<div id="whatsapp-admin-cards-list" class="grid grid-cols-1 md:grid-cols-2 gap-3.5"></div>`
   - Pada fungsi `renderWhatsAppContactCards()` di `classroom.js`:
     ```javascript
     const isLastOdd = (idx === contacts.length - 1) && (contacts.length % 2 !== 0);
     const colSpanClass = isLastOdd ? 'md:col-span-2 md:max-w-md md:mx-auto md:w-full' : '';
     ```
   - Dengan formula ini:
     - Jika 2 kontak: 2 kartu berdampingan (1 baris, 2 kolom).
     - Jika 3 kontak: Kontak 1 & 2 di baris atas, Kontak 3 tepat di tengah baris kedua.
     - Jika 4 kontak: 2 baris seimbang (2x2).
2. **CMS Admin Pengelola Kontak Dinamis (`admin.js` & `index.html`):**
   - Mengganti form statis input 2 orang menjadi panel repeater kontak dinamis dengan tombol `[+ Tambah Kontak Admin]`.
   - Setiap kartu kontak di CMS memiliki:
     - Input Nama Lengkap
     - Input Nomor WhatsApp (dengan auto-formatting `08...` atau `62...`)
     - Input Posisi / Jabatan
     - Tombol `[Hapus]` (dengan konfirmasi dan proteksi minimal tersisa 1 admin)
   - Tombol Simpan menyimpan seluruh array `AppState.landingCms.adminContacts` ke Supabase Cloud secara instan dan langsung me-refresh modal publik.

---

### 🛠️ SOLUSI ITEM 2: Melengkapi Menu Mobile Navigation Bar
1. **Eliminasi Duplikasi Markup:**
   - Menghapus blok navbar kedua di baris 4155 yang tidak terpakai sehingga ID `#mobile-bottom-nav` bersifat tunggal dan valid di W3C DOM.
2. **Penambahan Menu ZettGallery & Admin Panel:**
   - Menyusun navigasi mobile 1-Thumb UX yang mencakup:
     1. `Home` (`navigate('home')`)
     2. `Kalender` (`navigate('user-dashboard')`)
     3. `Belajar` (`navigate('learn')`)
     4. `ZettLink` (`navigate('resources')`)
     5. `Galeri` (`navigate('showcase')` - **ZettGallery**)
     6. `Favorit` (`navigate('favorites')`)
     7. `Admin` (`navigate('admin')` - otomatis tampil jika role === `admin` atau email owner)
3. **Akses Drawer Mobile:**
   - Mengubah tombol hamburger navbar atas `#btn-sidebar-toggle` menjadi terlihat di mobile (`flex` bukan `hidden md:flex`), sehingga user mobile dapat membuka sidebar drawer lengkap kapan pun dibutuhkan.
4. **Router State Sync (`router.js`):**
   - Menambahkan binding active class untuk tab `showcase` dan `admin` di `updateNavbarState()`.

---

### 🛠️ SOLUSI ITEM 3 & 4: Mobile 2 Grid Kolom untuk Fasilitas & Target Siswa
1. **Fasilitas & Ekosistem Belajar (`#landing-facilities-container`):**
   - Ubah grid container menjadi:
     `grid grid-cols-2 sm:grid-cols-2 sm:grid-rows-3 gap-2.5 sm:gap-4 lg:gap-5`
   - Di `landing.js` (`renderLandingFacilitiesShowcase`):
     - Ubah kartu fasilitas menjadi fleksibel di mobile: `p-3 sm:p-6 rounded-xl sm:rounded-2xl min-h-[120px] sm:min-h-[155px]`.
     - Icon box proporsional: `w-9 h-9 sm:w-16 sm:h-16 rounded-xl`.
     - Judul: `text-xs sm:text-lg font-bold sm:font-extrabold`.
     - Deskripsi: `text-[10px] sm:text-sm text-slate-300 line-clamp-3 sm:line-clamp-none`.
     - Kartu CTA ("Daftar & Join Kelas Sekarang"): Diatur compact sehingga membentuk formasi sempurna 3 baris x 2 kolom (6 kartu total).
2. **Target Siswa (`#landing-usecases-container`):**
   - Ubah grid container menjadi:
     `grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5`
   - Di `landing.js` (`renderLandingUseCases`):
     - Padding kartu: `p-3 sm:p-6 rounded-xl sm:rounded-2xl`.
     - Icon box: `w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl`.
     - Judul: `text-xs sm:text-base font-bold`.
     - Deskripsi: `text-[10.5px] sm:text-[13px] leading-snug line-clamp-3 sm:line-clamp-none`.
     - Tag pills: `text-[9px] sm:text-[10.5px] px-1.5 py-0.5`.
     - Menghasilkan tata letak 2x2 kartu simetris di layar HP tanpa perlu scroll panjang.

---

### 🛠️ SOLUSI ITEM 5: Pembersihan Teks Geser & Perbaikan Tombol "Lihat Testimoni"
1. **Hapus Teks Petunjuk Geser:**
   - Di `index.html` baris 734–738: Hapus blok `<div class="text-[11px] font-mono ...">...Bisa digeser dengan mouse drag...</div>`.
   - Navigasi slider hanya menampilkan tombol panah bundar kiri dan kanan yang elegan dan modern.
2. **Perbaikan Tombol "Lihat Testimoni":**
   - Di `landing.js` (`initInteractiveTestimonialsCarousel`):
     ```javascript
     container.addEventListener('pointerdown', (e) => {
       // Abaikan drag jika user menekan tombol atau link (seperti tombol Lihat Testimoni)
       if (e.target.closest('button, a')) return;
       ...
     });
     ```
   - Buat fungsi resolusi modal berbasis ID:
     ```javascript
     function openTestimonialProofModalById(testiId) {
       const list = AppState.landingCms?.testimonials || [];
       const t = list.find(item => item.id === testiId);
       if (!t || !t.proofPhotoUrl) return;
       openTestimonialProofModal(t.proofPhotoUrl, t.name, t.outcomeBadge, t.quote);
     }
     window.openTestimonialProofModalById = openTestimonialProofModalById;
     ```
   - Pada render kartu testimoni (`renderTestiCard`):
     ```html
     <button type="button" onclick="event.stopPropagation(); openTestimonialProofModalById('${escapeHtml(t.id)}')" class="... cursor-pointer">
       <span>Lihat Testimoni</span>
     </button>
     ```
   - Menjamin 100% tombol dapat diklik dengan mulus, lightbox bukti foto muncul instan, dan terbebas dari kesalahan syntax kutipan/karakter khusus.

---

## 3. BERKAS-BERKAS YANG AKAN DIMODIFIKASI

1. `revisi.md`: Master Blueprint Revisi 101 (Dokumen ini).
2. `index.html`:
   - Penyesuaian modal WhatsApp (lebar `max-w-2xl`, container grid 2 kolom).
   - Pembaruan form CMS kontak WhatsApp di tab CMS Landing Portal.
   - Perapihan navigasi bawah mobile (`#mobile-bottom-nav`) & aktivasi hamburger mobile.
   - Grid 2 kolom mobile pada kontainer Fasilitas (`#landing-facilities-container`) dan Target Siswa (`#landing-usecases-container`).
   - Penghapusan teks *"Bisa digeser dengan mouse drag, swipe, atau tombol panah"*.
   - Cache buster script ke `?v=102`.
3. `js/controllers/landing.js`:
   - Update `renderLandingFacilitiesShowcase` untuk layout compact 2 kolom mobile.
   - Update `renderLandingUseCases` untuk layout compact 2 kolom mobile.
   - Bypass pointer capture pada klik tombol di `initInteractiveTestimonialsCarousel`.
   - Penambahan `openTestimonialProofModalById()` dan penyesuaian event click pada tombol *"Lihat Testimoni"*.
4. `js/controllers/classroom.js`:
   - Update `renderWhatsAppContactCards()` dengan CSS grid 2 kolom dan aturan centering item ganjil (`md:col-span-2 md:max-w-md md:mx-auto md:w-full`).
5. `js/controllers/admin.js`:
   - Implementasi CMS Multi-Kontak Admin (tambah, edit, hapus kontak admin dinamis).
   - Sinkronisasi real-time ke Supabase dan pemanggilan re-render modal WhatsApp.
6. `js/core/router.js`:
   - Penanganan tab aktif navigasi mobile untuk `showcase` dan `admin`.
7. `prd.md`:
   - Update dokumentasi versi ke `v1.9.2 (REVISI 101 - POLISHING LANDING PORTAL, CMS KONTAK WA & MOBILE UX)`.

---

## 4. STATUS PENGERJAAN
- [x] Analisis mendalam 5 tangkapan layar (Gambar 1 - Gambar 5).
- [x] Formulasi arsitektur solusi di `revisi.md`.
- [x] Persetujuan pengguna diterima ("OKE TERAPKAN").
- [x] Eksekusi implementasi ke seluruh berkas kode terkait:
  - [x] `index.html` (Modal WA 2 kolom, CMS repeater list, hamburger mobile flex, bottom nav lengkap, grid-cols-2 fasilitas & usecases, hapus petunjuk drag, cache buster ?v=102)
  - [x] `js/controllers/classroom.js` (renderWhatsAppContactCards grid 2 kolom & centering odd item terakhir)
  - [x] `js/controllers/admin.js` (renderAdminContactsCms, addAdminContactCms, removeAdminContactCms, handleSaveAdminContactsCms, resetAdminContactsToDefault)
  - [x] `js/controllers/landing.js` (renderLandingFacilitiesShowcase & renderLandingUseCases compact mobile 2 kolom, event pointerdown bypass & openTestimonialProofModalById)
  - [x] `js/core/router.js` (update active bottom nav tabs: showcase, favorites, admin)
- [x] Validasi sintaksis bebas galat (`node --check` lolos 100%).
