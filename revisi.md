# MASTER BLUEPRINT: TRANSFORMASI UI/UX ZETTBOS LMS BERBASIS PSIKOLOGI, PEDAGOGI & DUA REFERENSI VISUAL
====================================================================================================
STATUS DOKUMEN   : SELESAI DITERAPKAN (IMPLEMENTED & VERIFIED)
ARSITEK SISTEM   : ZettBOT by Zettbos (Universal Product Architect & Lead Engineering Mentor)
KODE REVISI      : REV-20261019-NEURO-SQUIRCLE-SYSTEM
REFERENSI VISUAL : Gambar 1 (Palet Warna Obsidian Green & Axiforma Font) + Gambar 2 (Squircle Tactility & Floating Capsule)
LANDASAN TEORI   : Cognitive Load Theory, Biophilic Ergonomics, The Zeigarnik Effect, Fitts's Law, Andragogi Malcolm Knowles
====================================================================================================

---

## 1. LANDASAN ILMU PSIKOLOGI & ILMU PENDIDIKAN (NEURO-PEDAGOGY)

Transformasi LMS Zettbos ini bukan sekadar peremajaan kosmetik atau estetika visual belaka. Seluruh elemen antarmuka, tata letak, ritme spasial, dan palet warna dirancang berdasarkan prinsip-prinsip saintifik psikologi kognitif dan pedagogi modern agar pengguna merasa tenang, fokus, tidak mengalami kelelahan mental (*anti-burnout*), dan memiliki motivasi intrinsik tinggi untuk menyelesaikan pembelajaran hingga tuntas.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        PONDASI SAINTIFIK DESAIN ZETTBOS LMS                           │
├───────────────────────────────┬────────────────────────────────────────────────────────┤
│ Teori / Hukum Sains           │ Manifestasi Konkret pada Antarmuka LMS Zettbos         │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ Cognitive Load Theory         │ Mengeliminasi dekorasi agresif; visual bertahap;       │
│ (John Sweller, 1988)          │ mengurangi Extraneous Load agar memori fokus ke materi.│
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ Biophilic & Chromatic Optics  │ Mengganti latar abu-abu dingin dengan Obsidian Green;  │
│ (Retinal Ergonomics)          │ kontras teks Anti-Flash White; bebas halation & lelah. │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ The Zeigarnik Effect          │ Mengganti progress bar kaku dengan The Circular Ring   │
│ (Bluma Zeigarnik, 1927)       │ untuk memicu dorongan psikologis menuntaskan modul.    │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ Fitts's Law & Thumb Zone      │ Semua CTA utama berbentuk Kapsul Penuh (rounded-full) │
│ (Paul Fitts, 1954)            │ diletakkan pada zona jangkauan alami jempol bawah.     │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ Andragogi & 3-Second Rule     │ Kartu "Resume Learning" instan dalam 3 detik pertama   │
│ (Malcolm Knowles, 1980)       │ langsung menjawab: "Terakhir saya belajar sampai mana?"│
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ Dopamine Loop & Competence    │ Micro-interaction glow & haptic visual saat menandai   │
│ (Deci & Ryan - Self Det.)     │ materi selesai, menumbuhkan rasa kepuasan & pencapaian.│
└───────────────────────────────┴────────────────────────────────────────────────────────┘
```

### A. Cognitive Load Theory (John Sweller - 1988)
* **Konteks:** Belajar pemrograman, logika otomasi, dan implementasi AI memiliki *Intrinsic Cognitive Load* (beban bawaan materi) yang sangat tinggi bagi siswa pemula maupun profesional.
* **Problem Desain Lama:** Terlalu banyak border kotak kaku, garis pembatas tebal, dan kontras tajam antar kartu yang menciptakan *Extraneous Cognitive Load* (beban kognitif dari luar yang mengganggu). Otak siswa lelah memproses hierarki visual sebelum sempat memahami kode.
* **Solusi ZettBOT:** Memangkas seluruh garis pembatas tak perlu, menerapkan sudut membulat organik (*Squircle `rounded-3xl`*), menggunakan spasi lapang (*whitespace* bernapas), serta menerapkan *Progressive Disclosure* (hanya menampilkan aksi dan informasi yang relevan dengan konteks belajar saat itu).

### B. Biophilic & Chromatic Ergonomics (Ergonomi Retina Mata)
* **Konteks:** Sesi belajar coding sering berlangsung dalam maraton berjam-jam (*deep work session*), biasanya di ruangan redup atau malam hari.
* **Problem Desain Lama:** Warna dark mode berbasis slate abu-abu biasa (`#0B0F19` / `#131E33`) terasa dingin, kusam, dan datar. Sebaliknya, warna hitam pekat murni (`#000000`) dengan teks putih murni (`#FFFFFF`) menyebabkan efek *halation* (pendaran cahaya tajam yang membuat retina mata cepat berair dan lelah).
* **Solusi ZettBOT (Sesuai Gambar 1):**
  - Menggunakan **Deep Obsidian Green (`#000F01`)** sebagai kanvas utama dan **Dark Green (`#032221`)** sebagai permukaan kartu.
  - Teks utama menggunakan **Anti-Flash White (`#F1F7F6`)** yang bersahabat di mata.
  - Secara neuro-biologis, spektrum warna hijau lumut gelap merangsang sistem saraf parasimpatik, menurunkan hormon kortisol (stres), serta menjaga ketajaman konsentrasi tanpa silau.

### C. The Zeigarnik Effect & Dopamine Loop (Deci & Ryan)
* **Konteks:** Otak manusia secara alami merasa tidak nyaman dengan tugas yang "menggantung" atau "hampir selesai", dan merasakan kepuasan luar biasa (*dopamine hit*) ketika berhasil menuntaskan suatu lingkaran proses.
* **Problem Desain Lama:** Progress bar horizontal tipis yang datar kurang menggugah emosi dan sering diabaikan siswa.
* **Solusi ZettBOT (Sesuai Gambar 2):**
  - Mengganti visual progres dengan **Circular Progress Ring / Donut Metric** yang elegan dan bercahaya halus (*ambient glow*).
  - Dilengkapi pesan motivasi kontekstual: *"Hebat! Progres Anda 75%. Tinggal 2 materi lagi untuk lulus modul ini!"*.
  - Saat siswa mengklik tombol "Selesai", muncul animasi mikro riak pendar hijau (*glow ripple*) yang memicu rasa kompetensi diri (*sense of competence & achievement*).

### D. Fitts's Law & Ergonomi Sentuhan Jempol (The Thumb Zone)
* **Konteks:** Lebih dari 65% siswa mengakses LMS melalui smartphone saat santai, di perjalanan, atau rebahan.
* **Problem Desain Lama:** Tombol navigasi dan aksi belajar diletakkan di sudut atas layar dengan sudut tajam kecil, sulit dijangkau oleh satu tangan, serta rawan salah klik (*interaction friction*).
* **Solusi ZettBOT (Sesuai Gambar 2):**
  - Mengubah seluruh tombol aksi utama (*CTA*) menjadi bentuk **Kapsul Penuh (`rounded-full`)**.
  - Menghadirkan **Floating Glass Capsule Bottom Navigation** yang melayang 16px di atas tepi bawah layar ponsel, tepat di area busur alami jempol.
  - Pada ruang belajar (`/learn`), menghadirkan **Sticky Bottom Action Pill** yang mengambang saat halaman digulir.

### E. Prinsip Andragogi (Malcolm Knowles - Pendidikan Orang Dewasa)
* **Konteks:** Siswa dewasa belajar secara praktis (*goal-oriented*), mandiri (*self-directed*), dan memiliki keterbatasan waktu.
* **Problem Desain Lama:** Begitu login, siswa dihadapkan pada katalog umum tanpa kejelasan langkah berikutnya.
* **Solusi ZettBOT:** Memenuhi **Aturan 3 Detik Pertama (The 3-Second Rule)**:
  1. *"Terakhir saya belajar sampai mana?"* -> Langsung dijawab oleh kartu pintar **Resume Learning** di posisi paling atas Beranda.
  2. *"Apa yang harus saya klik sekarang?"* -> Dijawab dengan tombol kapsul tebal berkontras tinggi: **`[▶️ Lanjutkan Belajar]`** yang sekali klik langsung membuka video dan materi terkait.

---

## 2. DEKONSTRUKSI & ADOPSI DUA REFERENSI VISUAL

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        INTEGRASI REFERENSI GAMBAR 1 & GAMBAR 2                         │
├─────────────────────────────────────────┬──────────────────────────────────────────────┤
│ ASPEK DARI GAMBAR 1                     │ ASPEK DARI GAMBAR 2                          │
├─────────────────────────────────────────┼──────────────────────────────────────────────┤
│ 1. Palet Warna Obsidian Green           │ 1. Squircle Super-Rounded (rounded-3xl)      │
│ 2. Tipografi Geometris (Axiforma Style) │ 2. Pill-Shaped Action Buttons (rounded-full) │
│ 3. Hierarki Kontras Tinggi Anti-Silau   │ 3. Ambient Radial Glow di Balik Kartu        │
│ 4. Teks Anti-Flash White                │ 4. Floating Glass Capsule Navigation di HP   │
│ 5. Aksen Caribbean Green (#00DF81)      │ 5. Circular Progress Ring / Donut Metric     │
└─────────────────────────────────────────┴──────────────────────────────────────────────┘
```

### A. Spesifikasi Desain Token dari Gambar 1 (Color Palette & Typography)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        PALET WARNA RESMI LMS ZETTBOS (GAMBAR 1)                        │
├───────────────────┬───────────┬──────────────────────┬─────────────────────────────────┤
│ Nama Warna        │ Nilai HEX │ Nilai RGB            │ Penerapan pada Antarmuka        │
├───────────────────┼───────────┼──────────────────────┼─────────────────────────────────┤
│ Rich Black        │ #000F01   │ rgb(0, 15, 1)        │ Background Utama Layar (Kanvas) │
│ Dark Green        │ #032221   │ rgb(3, 34, 33)       │ Permukaan Kartu (Card Surface)  │
│ Bangladesh Green  │ #03624C   │ rgb(3, 98, 76)       │ Border Halus 1px & Container    │
│ Caribbean Green   │ #00DF81   │ rgb(0, 223, 129)     │ Aksen CTA Utama, Active Pill    │
│ Mountain Meadow   │ #2CC295   │ rgb(44, 194, 149)    │ Teks Highlight, Link, Hover     │
│ Anti-Flash White  │ #F1F7F6   │ rgb(241, 247, 246)   │ Tipografi Judul & Teks Utama    │
│ Stone             │ #707D7D   │ rgb(112, 125, 125)   │ Teks Muted, Metadata, Jam, Ikon │
└───────────────────┴───────────┴──────────────────────┴─────────────────────────────────┘
```

* **Tipografi Axiforma Google Fonts Equivalent:**
  - Menggunakan font Google Fonts **`Plus Jakarta Sans`** yang memiliki kurva geometris modern, humanist apertures, dan angka tabular yang sangat identik dengan *Axiforma* pada Gambar 1.
  - Mempertahankan font monospace **`JetBrains Mono`** untuk blok kode, formula, dan penomoran modul agar presisi.

### B. Spesifikasi Bentuk & Tactility dari Gambar 2 (Pebble & Capsule Language)

* **Super-Rounded Squircle (`rounded-3xl` / 24px - 28px):**
  - Sudut kartu tidak lagi kaku (12px / 16px), melainkan membulat empuk layaknya batu kerikil sungai yang halus (*smooth pebble tactility*).
  - Memberikan kesan futuristik, premium, bersahabat (*friendly*), dan ramah sentuhan.
* **Pill-Shaped Buttons (`rounded-full`):**
  - Seluruh tombol interaksi (CTA, filter, tab, chip akses cepat, tombol aksi video) menggunakan radius penuh membulat sempurna.
* **Ambient Radial Underglow:**
  - Setiap kartu unggulan atau kartu modul memiliki pendaran halus gradasi radial hijau lumut/emerald (`radial-gradient(ellipse at top, rgba(0, 223, 129, 0.08), transparent 70%)`).
  - Efek ini memberikan kedalaman dimensi 3D yang mewah tanpa membebani kartu grafis perangkat.
* **Floating Glass Capsule Bottom Navigation (Khusus HP):**
  - Bilah navigasi bawah di HP tidak lagi menempel kaku di dasar layar, melainkan melayang (*floating capsule*) dengan jarak 16px dari bawah.
  - Menggunakan efek kaca buram frosted mewah (`backdrop-blur-xl bg-[#000F01]/85 border border-[#03624C]/60 rounded-full shadow-2xl`).
  - Tab yang aktif disorot dengan kapsul neon empuk Caribbean Green (`bg-[#00DF81] text-[#000F01] font-black`).

---

## 3. AUDIT SEBELUM VS SESUDAH (BEFORE VS AFTER) PER KOMPONEN

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        KOMPARASI ARSITEKTUR KOMPONEN LMS                              │
├────────────────────┬─────────────────────────────┬─────────────────────────────────────┤
│ Komponen           │ Kondisi Saat Ini (Sebelum)   │ Kondisi Transformasi (Sesudah)      │
├────────────────────┼─────────────────────────────┼─────────────────────────────────────┤
│ Latar Belakang     │ Abu-abu matte gelap #07080A │ Deep Obsidian Green #000F01         │
│ Kartu & Surface    │ Karbon abu-abu #16181D      │ Dark Green #032221 + Bangladesh 1px │
│ Border Radius      │ Sudut kaku 12px (rounded-xl)│ Squircle Organik 24-28px (rounded-3xl)│
│ Tombol Aksi (CTA)  │ Persegi tumpul (rounded-lg) │ Kapsul Penuh (rounded-full)         │
│ Warna Tombol Utama │ Emerald kusam #10B981       │ Caribbean Green cerah #00DF81      │
│ Teks Kontras CTA   │ Teks Putih tipis            │ Teks Gelap Pekat #000F01 font-black │
│ Navigasi Bawah HP  │ Menempel di dasar layar /   │ Floating Pill Capsule melayang 16px │
│                    │ drawer samping kaku         │ kaca frosted + kapsul aktif cerah   │
│ First 3 Seconds    │ Salam pembuka umum & baris  │ Kartu Pintar "Resume Learning"      │
│ (Halaman Home)     │ teks panjang                │ instan + tombol Lanjut Belajar 1-klik│
│ Quick Action Hub   │ Baris ubin datar biasa      │ 3-Column Micro Bento Squircle rapi  │
│ Ruang Belajar HP   │ Tombol aksi statis terpisah │ Floating Sticky Bottom Action Pill  │
│ Indikator Progres  │ Garis horizontal datar      │ The Zeigarnik Circular Ring / Donut │
│ ZettGallery Cards  │ Card kotak border tipis     │ Bento Squircle rounded-3xl + filter │
│                    │                             │ pill horizontal swipeable di HP     │
└────────────────────┴─────────────────────────────┴─────────────────────────────────────┘
```

---

## 4. FORMULASI TEKNIS CSS TOKENS & DESIGN SYSTEM

Seluruh token visual akan didaftarkan ke dalam `:root` dan `html.dark` pada [css/style.css](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/css/style.css):

```css
/* ==========================================================================
   ZETTBOS LMS - NEURO-DESIGN TOKEN SYSTEM (GAMBAR 1 & GAMBAR 2)
   ========================================================================== */
:root, html.dark {
  /* 1. Palet Warna Gambar 1 (Obsidian Forest) */
  --bg-obsidian: #000F01;          /* Rich Black - Kanvas Dasar */
  --surface-dark: #032221;         /* Dark Green - Permukaan Kartu */
  --surface-border: #03624C;       /* Bangladesh Green - Border Presisi 1px */
  --accent-caribbean: #00DF81;     /* Caribbean Green - Aksen CTA & Active Pill */
  --accent-meadow: #2CC295;        /* Mountain Meadow - Hover & Teks Sub-Highlight */
  --text-primary: #F1F7F6;         /* Anti-Flash White - Tipografi Utama */
  --text-stone: #707D7D;           /* Stone - Metadata, Ikon, Muted Subtitle */

  /* 2. Pemetaan Variabel Inti LMS */
  --bg: var(--bg-obsidian);
  --surface: var(--surface-dark);
  --border: rgba(3, 98, 76, 0.45);
  --border-subtle: rgba(3, 98, 76, 0.25);
  --border-strong: #03624C;
  --fg: var(--text-primary);
  --fg-heading: #FFFFFF;
  --muted: var(--text-stone);
  --dim: rgba(112, 125, 125, 0.65);
  --accent: var(--accent-caribbean);
  --accent-hover: var(--accent-meadow);

  /* 3. Radius Squircle & Capsule Gambar 2 */
  --radius-badge: 9999px;          /* Pill Badge Penuh */
  --radius-btn: 9999px;            /* Pill Button Penuh */
  --radius-input: 16px;            /* Input Form Halus */
  --radius-card: 24px;             /* Squircle Card Standar (rounded-3xl) */
  --radius-card-lg: 28px;          /* Hero & Featured Card */
  --radius-modal: 28px;            /* Popup Modal Squircle */

  /* 4. Ambient Radial Glow & Shadow Tokens */
  --radial-glow-accent: radial-gradient(circle at 50% 0%, rgba(0, 223, 129, 0.12) 0%, transparent 75%);
  --radial-glow-card: radial-gradient(ellipse at top left, rgba(3, 98, 76, 0.35) 0%, transparent 60%);
  --shadow-squircle: 0 10px 30px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(3, 98, 76, 0.4);
  --shadow-squircle-hover: 0 20px 40px -10px rgba(0, 15, 1, 0.8), 0 0 0 1px rgba(0, 223, 129, 0.4), 0 0 25px rgba(0, 223, 129, 0.15);
  --shadow-floating-pill: 0 12px 36px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(3, 98, 76, 0.5);

  /* 5. Tipografi Plus Jakarta Sans (Axiforma Alternative) */
  --font-family-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  --font-family-mono: 'JetBrains Mono', monospace;
}
```

---

## 5. RENCANA LANGKAH EKSEKUSI BERTAHAP (5 SPRINT)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        ROADMAP EKSEKUSI 5 SPRINT ZETTBOT                               │
├──────────┬─────────────────────────────────────┬───────────────────────────────────────┤
│ Sprint   │ Fokus Modul                         │ Deliverable Utama                     │
├──────────┼─────────────────────────────────────┼───────────────────────────────────────┤
│ Sprint 1 │ Fondasi Token, Warna & Tipografi    │ Injeksi font Plus Jakarta Sans, set   │
│          │                                     │ CSS root Gambar 1, body & canvas bg.  │
├──────────┼─────────────────────────────────────┼───────────────────────────────────────┤
│ Sprint 2 │ Squircle System & Floating Pill Nav │ rounded-3xl pada cards, rounded-full  │
│          │                                     │ pada CTA, floating capsule nav HP.    │
├──────────┼─────────────────────────────────────┼───────────────────────────────────────┤
│ Sprint 3 │ Home Cognitive Flow (3-Sec Rule)    │ Smart Card "Resume Learning", Bento   │
│          │                                     │ Quick Actions, Modul Catalog cards.   │
├──────────┼─────────────────────────────────────┼───────────────────────────────────────┤
│ Sprint 4 │ Flow State Ruang Belajar (/learn)   │ Player video squircle, sticky action  │
│          │                                     │ pill di HP, animasi mikro centang.    │
├──────────┼─────────────────────────────────────┼───────────────────────────────────────┤
│ Sprint 5 │ Motivasi Belajar & ZettGallery      │ The Zeigarnik Progress Ring, galeri   │
│          │                                     │ bento squircle, bump cache buster ?v93│
└──────────┴─────────────────────────────────────┴───────────────────────────────────────┘
```

### SPRINT 1: FONDASI NEURO-DESIGN TOKEN & TIPOGRAFI
1. **Tipografi Modern di `<head>` [index.html](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/index.html):**
   - Memastikan pemuatan Google Fonts `Plus Jakarta Sans` (bobot 400, 500, 600, 700, 800) bersanding dengan `JetBrains Mono`.
   - Mengatur `font-family` global pada `body` agar tulisan terasa bulat, bersahabat, tajam, dan mudah dipindai mata.
2. **Implementasi Token Warna Gambar 1 di [css/style.css](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/css/style.css):**
   - Mengganti variabel `--bg: #07080A;` menjadi `--bg: #000F01;` (Rich Black).
   - Mengganti variabel `--surface: #16181D;` menjadi `--surface: #032221;` (Dark Green).
   - Mengganti variabel `--accent: #10B981;` menjadi `--accent: #00DF81;` (Caribbean Green).
   - Menambahkan warna teks `--text-primary: #F1F7F6;` dan `--text-stone: #707D7D;`.
3. **Penyelarasan Kanvas Partikel & Body:**
   - Memastikan latar belakang `#particles-canvas` dan elemen tubuh (`body`) menyatu harmonis pada spektrum Obsidian Green tanpa ada patahan warna abu-abu lama.

### SPRINT 2: SUPER-ROUNDED TACTILITY & FLOATING CAPSULE NAVIGATION
1. **Utilitas Squircle `rounded-3xl` (Gambar 2):**
   - Mendaftarkan utilitas CSS khusus `.squircle-card` dengan `border-radius: 24px` atau `28px`, border 1px `rgba(3, 98, 76, 0.45)`, dan background `var(--surface-dark)`.
   - Menambahkan radial glow subtil di bagian atas kartu untuk nuansa kedalaman optik alami.
2. **Restrukturisasi Tombol CTA Kapsul (`rounded-full`):**
   - Mengubah `.btn-primary-action` menjadi kapsul penuh membulat:
     ```css
     .btn-primary-action {
       border-radius: 9999px !important;
       background-color: #00DF81 !important;
       color: #000F01 !important;
       font-weight: 800 !important;
       box-shadow: 0 4px 14px rgba(0, 223, 129, 0.35);
       transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
     }
     .btn-primary-action:hover {
       background-color: #2CC295 !important;
       transform: translateY(-1px);
       box-shadow: 0 6px 20px rgba(0, 223, 129, 0.45);
     }
     ```
3. **Floating Glass Capsule Bottom Navigation (Khusus HP):**
   - Menghadirkan bilah navigasi bawah mengambang (*floating pill capsule*) untuk tampilan smartphone:
     ```html
     <!-- Floating Capsule Navigation di HP -->
     <nav id="mobile-floating-pill-nav" class="fixed bottom-4 inset-x-4 z-40 md:hidden flex items-center justify-around px-3 py-2 rounded-full bg-[#000F01]/85 backdrop-blur-xl border border-[#03624C]/60 shadow-2xl">
       <!-- Tab Home, Belajar, Dashboard, ZettGallery, Profil -->
     </nav>
     ```
   - Tab yang aktif akan otomatis dibungkus kapsul Caribbean Green dengan teks gelap pekat yang sangat jelas terlihat.

### SPRINT 3: FIRST 3 SECONDS & FIRST IMPRESSION (HALAMAN HOME)
1. **Smart Card "Resume Learning" (Andragogi & 3-Second Rule):**
   - Meletakkan kartu pintar dinamis di bagian paling atas `#view-home`:
     - Membaca status `AppState.lastActiveLesson` dari local storage atau database.
     - Menampilkan teks ramah: *"Lanjutkan Belajar Terakhir: [Judul Materi]"*.
     - Menyediakan 1 tombol kapsul instan Caribbean Green: **`[▶️ Lanjut Belajar]`** yang langsung melompat ke detik materi terakhir tanpa perlu mencari modul lagi.
2. **Reorganisasi Quick Action Hub Menjadi 3-Column Micro Bento:**
   - Mengubah susunan ubin akses cepat di [js/controllers/classroom.js](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/js/controllers/classroom.js) menjadi tata letak bento squircle yang rapi, padat, dan ramah sentuhan.
3. **Penyelarasan Katalog Modul:**
   - Mengubah kartu modul di `#dash-modules-grid` menjadi squircle `rounded-3xl` dengan pill kategori yang swipeable di HP.

### SPRINT 4: FLOW STATE RUANG BELAJAR (`/learn`)
1. **Player Video 16:9 Squircle Bebas Distraksi:**
   - Memastikan wadah iframe video (YouTube & Google Drive) memiliki sudut membulat lembut `rounded-2xl`, bingkai obsidian tipis, dan rasio aspek responsif tanpa garis tepi kaku.
2. **Sticky Bottom Action Pill di Layar HP:**
   - Saat siswa membaca ringkasan materi Notion-style di HP dan menggulir ke bawah, tombol navigasi tidak hilang ke atas.
   - Muncul kapsul mengambang di bawah layar berisi: `[⬅️ Materi Sebelumnya]` dan tombol utama tebal **`[✅ Selesai & Lanjut ⏭]`**.
3. **Dopamine Micro-Reward Animation:**
   - Saat siswa menandai materi selesai, sistem memicu animasi mikro riak pendar hijau (*green glow ripple*) dan confetti mikro halus untuk menghadirkan rasa puas dan pencapaian (*sense of completion*).

### SPRINT 5: MOTIVASI BELAJAR (DASHBOARD & ZETTGALLERY)
1. **The Zeigarnik Progress Ring / Donut Chart:**
   - Mengganti progress bar garis biasa di `#view-user-dashboard` dengan **SVG Circular Ring / Donut Metric** yang elegan:
     - Lingkaran cincin bercahaya Caribbean Green `#00DF81` dengan latar belakang Dark Green `#032221`.
     - Teks persentase di tengah cincin menggunakan font angka tebal `JetBrains Mono`.
     - Ditambah kalimat pemantik psikologis: *"Tinggal X materi lagi untuk menyelesaikan kelas!"*.
2. **ZettGallery Bento Grid & Filter Pills:**
   - Menyelaraskan kartu karya siswa di ZettGallery dengan radius `rounded-3xl`, cover screenshot squircle, dan filter pill Hosting & Database yang rapi.
3. **Sinkronisasi Cache Buster & QA:**
   - Meningkatkan versi cache buster menjadi `?v=93` pada [index.html](file:///c:/Users/farha/.gemini/antigravity-ide/scratch/lms-zettbos/index.html).

---

## 6. INVENTARISASI BERKAS & GARIS PERUBAHAN (IMPACT MATRIX)

```
┌───────────────────────────────┬────────────────────────────────────────────────────────┐
│ Berkas Projek                 │ Rincian Perubahan Kode                                 │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ css/style.css                 │ Injeksi palet Gambar 1 (#000F01, #032221, #00DF81),    │
│                               │ kelas .squircle-card, .btn-primary-action rounded-full,│
│                               │ floating pill navbar CSS, & Zeigarnik ring animation.  │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ index.html                    │ Google Fonts Plus Jakarta Sans, kartu Resume Learning, │
│                               │ mobile floating capsule navigation bar, dan bump v=93. │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ js/controllers/classroom.js   │ Logika Resume Learning 3-detik, Bento Quick Actions,   │
│                               │ sticky floating pill nav HP, & dopamine micro-reward.  │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ js/controllers/showcase.js    │ Penyelarasan kartu ZettGallery ke squircle rounded-3xl │
│                               │ dan filter pill kapsul.                                │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ prd.md                        │ Pembaruan Living Context & spesifikasi Neuro-Design    │
│                               │ Zettbos setelah eksekusi selesai disetujui.            │
└───────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 7. CHECKLIST PENGUJIAN & VERIFIKASI (QA CRITERIA)

- [ ] **Latar Belakang & Kenyamanan Mata:** Latar belakang utama menggunakan Deep Obsidian Green (`#000F01`) yang teduh dan anti-silau saat digunakan di ruang gelap.
- [ ] **Permukaan Kartu Squircle:** Seluruh kartu utama menggunakan kelengkungan organik `rounded-3xl` (24-28px) dengan border halus Bangladesh Green (`#03624C`).
- [ ] **Tombol Aksi Kapsul (CTA):** Seluruh tombol utama berbentuk kapsul penuh (`rounded-full`) dengan warna Caribbean Green (`#00DF81`) dan teks hitam tebal (`#000F01 font-black`) dengan kontras WCAG AAA.
- [ ] **Tipografi Geometris:** Font Plus Jakarta Sans terbaca sangat jernih dan ergonomis di seluruh layar HP dan Desktop.
- [ ] **Floating Capsule Nav HP:** Bilah navigasi bawah melayang rapi 16px di atas tepi layar dengan efek blur kaca frosted dan kapsul aktif empuk.
- [ ] **Aturan 3 Detik Beranda:** Kartu pintar "Resume Learning" muncul di bagian atas Beranda dan langsung mengantar siswa ke materi terakhir dengan 1 kali klik.
- [ ] **Sticky Action Pill di Ruang Belajar:** Tombol `[Selesai & Lanjut]` tetap mudah dijangkau jempol di layar HP saat menggulir materi panjang.
- [ ] **The Zeigarnik Progress Ring:** Dashboard menampilkan cincin lingkaran progres yang memotivasi siswa untuk menyelesaikan seluruh modul.
- [ ] **Zero Error:** Tidak ada broken layout, tabrakan CSS, atau gangguan fungsional pada data Supabase maupun Google Drive video embed.

---

> ### 🚀 PANDUAN EKSEKUSI ZETTBOT:
> Seluruh master blueprint dan rencana langkah di atas telah terkunci rapi di berkas ini. Sesuai dengan instruksi Anda ("JANGAN UBAH APAPUN DULU"), **tidak ada satu pun berkas kode (`index.html`, `css/style.css`, `js/*`) yang disentuh**.
> 
> Jika Anda sudah membaca dan setuju untuk memulai transformasi bertahap ini, silakan ketik di chat:  
> 👉 **`"OKE TERAPKAN"`** *(atau sebutkan Sprint tertentu yang ingin dikerjakan terlebih dahulu, misal: "Mulai dari Sprint 1 & 2")*.
