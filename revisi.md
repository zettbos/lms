# MASTER BLUEPRINT: REVISI 96 - CALM READING CANVAS & ZEN FOCUS MODE (MODE FOKUS BELAJAR)
====================================================================================================
STATUS DOKUMEN   : SELESAI DITERAPKAN (IMPLEMENTED & VERIFIED)
ARSITEK SISTEM   : ZettBOT by Zettbos (Universal Product Architect & Lead Engineering Mentor)
KODE REVISI      : REV-20261019-ZEN-FOCUS-MODE-CALM-CANVAS
TANGGAL PERANCANGAN : 19 Oktober 2026
LANDASAN TEORI   : Cognitive Load Theory (John Sweller), Flow State (Csikszentmihalyi), The Theater Effect
====================================================================================================

---

## 1. LATAR BELAKANG & TUJUAN REVISI

1. **Penenangan Kartu Bacaan Ruang Belajar (Calm Canvas - Zero Hover Glare):**
   - Kartu materi Notion/Video di ruang belajar sebelumnya menggunakan kelas umum `.glass-card` yang memiliki efek hover aktif: mengangkat kontainer 2px (`translateY(-2px)`), mengubah background, dan memancarkan radial glow emerald (`box-shadow: 0 0 24px rgba(0, 223, 129, 0.12)`).
   - Efek glow/hover sangat bagus untuk kartu katalog yang bisa diklik. Namun untuk kanvas bacaan materi sepanjang 2000px, efek menyala saat kursor bergerak secara tidak sengaja memicu *Attentional Capture* (pencurian fokus visual) dan kelelahan mata (*visual fatigue*).
   - Solusi: Mengubah kartu ruang materi menjadi `.learning-reading-canvas` yang sepenuhnya statis, tenang, tidak bergerak, dan tidak memancarkan glow saat kursor melintas.

2. **Implementasi Mode Fokus Belajar (Zen Focus Mode):**
   - Saat mempelajari materi teknis/vibe coding, pengguna membutuhkan konsentrasi mendalam (*Deep Work / Flow State*). Tiga kolom antarmuka (Sidebar Kiri 240px, Materi Tengah 780px, dan Kurikulum Kanan 320px) membebani kapasitas memori kerja (*Extraneous Load*).
   - Menghadirkan **Mode Fokus (Zen Mode)** yang dapat diaktifkan melalui tombol `[ ⛶ Mode Fokus ]` atau tombol keyboard shortcut **`F`** (dan keluar via **`Esc`**).
   - Saat aktif:
     - Sidebar kiri navigasi utama bergeser keluar layar secara halus.
     - Sidebar kanan kurikulum melipat rapi (dapat dibuka kapan saja via floating button `[📑 Kurikulum]`).
     - Header atas meredup/sembunyi.
     - Kanvas bacaan & video melebar secara ergonomis ke tengah layar (`max-w-[940px]`) dengan nuansa bioskop tenang (*The Theater Effect*).
     - Menghadirkan Floating Zen HUD minimalis untuk navigasi materi dan tombol keluar mode fokus.

---

## 2. DETAIL PERUBAHAN TEKNIS & ARSITEKTUR

### 🎯 FITUR 1: CALM READING CANVAS (ELIMINASI HOVER GLOW DI PLAYER MATERI)
- Di `css/style.css`:
  - Menambahkan selector `.learning-reading-canvas` dan `#learn-player-view .glass-card.learning-reading-canvas`.
  - Mengunci `transform: none !important`, `box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.5) !important`, dan `background: var(--surface) !important` pada state hover.
- Di `index.html`:
  - Menambahkan id `#learn-notion-content-card` dan class `learning-reading-canvas` pada kartu bacaan materi.

---

### 🎯 FITUR 2: ZEN FOCUS MODE (MODE FOKUS BELAJAR)

#### 1. Styling CSS di `css/style.css`:
- Kelas `body.zen-focus-mode`:
  - `#sidebar-drawer`: `transform: translateX(-100%) !important; display: none !important;`
  - `header#app-header`: `display: none !important;`
  - `#mobile-bottom-nav`: `display: none !important;`
  - `#learn-curriculum-col`: `display: none !important;`
  - `main[id^="view-"]`: `margin-left: 0 !important; width: 100% !important; max-width: 100% !important;`
  - `#learn-content-col`: `max-width: 940px !important; width: 100% !important; margin: 0 auto !important; transition: max-width 300ms ease;`
  - `#learn-player-view`: `max-width: 1000px !important; justify-content: center !important;`
  - Floating Zen HUD pill di paling atas/bawah untuk navigasi tanpa distraksi.

#### 2. Markup Antarmuka di `index.html`:
- Di `#learn-player-subnav`: Tambahkan tombol `#btn-toggle-focus-mode` dengan ikon ekspansi dan label `Mode Fokus (F)`.
- Di `#learn-lesson-header-inner`: Tambahkan tombol `#btn-header-focus-mode` di samping tombol Simpan & Selesai.
- Tambahkan Floating Zen Top Bar `#zen-focus-floating-bar` yang muncul eksklusif di Mode Fokus:
  - Tombol `[← Prev]` & `[Next →]`
  - Tombol drawer kurikulum `[📑 Kurikulum]`
  - Tombol keluar `[✕ Keluar Mode Fokus (Esc)]`

#### 3. Logika Controller di `js/controllers/classroom.js`:
- Fungsi `toggleFocusMode(forceState)`:
  - Toggle kelas `zen-focus-mode` di `document.body`.
  - Update label tombol menjadi `[✕ Keluar Fokus]` saat aktif.
  - Simpan preferensi ke `localStorage.setItem('zett_focus_mode', '1' | '0')`.
  - Tampilkan toast notifikasi ramah: *"✨ Mode Fokus Aktif (Bebas Distraksi) • Tekan Esc atau F untuk keluar"*.
- Event Listener Keyboard Global (`keydown`):
  - Jika menekan **`F`** atau **`f`** saat tidak sedang mengetik di input/textarea: panggil `toggleFocusMode()`.
  - Jika menekan **`Escape`** saat `zen-focus-mode` aktif: panggil `toggleFocusMode(false)`.
- Otomatis keluar dari mode fokus saat berpindah halaman via router (`router.js`).

---

## 3. BERKAS-BERKAS YANG DIMODIFIKASI
1. `css/style.css`: Aturan `.learning-reading-canvas` (calm canvas) dan aturan `body.zen-focus-mode`.
2. `index.html`: ID `#learn-content-col`, `#learn-curriculum-col`, tombol mode fokus, floating zen bar, bump cache buster ke `?v=96`.
3. `js/controllers/classroom.js`: Fungsi `toggleFocusMode()`, keyboard listener (`F` & `Esc`), sinkronisasi status tombol.
4. `js/core/router.js`: Pastikan mode fokus otomatis dinonaktifkan saat keluar dari halaman `'learn'`.
5. `prd.md`: Dokumentasi resmi Revisi 96.
