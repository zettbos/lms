/**
 * Zettbos LMS - Clean Slate Database (Empty Seed Data)
 * js/mock-data.js
 * Seluruh data dummy telah dihapus. Sistem siap diisi data asli dari 0 melalui Admin Panel.
 */

// 1. WHITELIST: Hanya akun resmi Owner/Admin Farhan yang aktif
const SEED_WHITELIST = [
  {
    id: 'owner-1',
    email: 'farhan@zettbos.com',
    fullName: 'Farhan (Owner Zettbos)',
    role: 'admin',
    isActive: true,
    registeredAt: '2026-10-13'
  }
];

// 2. MODUL KURIKULUM: Bersih dari 0 modul
const SEED_MODULES = [];

// 3. MATERI & PELAJARAN: Bersih dari 0 video/materi
const SEED_LESSONS = [];

// 4. PROGRESS MEMBER: Bersih dari 0 progress
const SEED_PROGRESS = {};

// 5. AKTIVITAS BELAJAR / HEATMAP: Bersih dari 0 aktivitas
const SEED_ACTIVITY = {};

// 6. ITEM FAVORIT: Bersih dari 0 favorit
const SEED_FAVORITES = {};

// 7. DOKUMEN & SHARED RESOURCES: Bersih dari 0 link/dokumen
const SEED_RESOURCES = [];

// 8. QUICK ACTION HUB BERANDA: Bersih dari 0 aksi cepat
const SEED_QUICK_ACTIONS = [];

// 9. CMS LANDING PORTAL: Copywriting resmi dipertahankan, testimoni dummy dikosongkan
const SEED_LANDING_CMS = {
  hero: {
    badge: 'Kelas Praktek • Bikin Web App Full Pakai AI',
    headlinePre: 'Bikin Web App Sendiri Full Pakai AI.',
    phrases: [
      'Langsung Praktek Jadi Aplikasi',
      'Tanpa Perlu Hafal Koding',
      'Beresin Error Dibantu AI',
      'Gaperlu Bayar Vendor Mahal',
      'Sampai Pasang Domain Sendiri'
    ],
    headlinePost: 'Dari Nol Sampai Online.',
    description: 'Di kelas Zettbos, Anda tidak diajari teori hafalan koding yang bikin pusing. Anda langsung praktek bikin web app fungsional dari nol—mulai dari minta AI bikinin aplikasinya, nambah fitur, beresin error kalau ada bug, sampai hosting dan pasang domain sendiri. Semua orang bisa bikin sistemnya sendiri tanpa perlu sewa programmer.',
    ctaText: 'Mulai Bikin Web App Sendiri',
    bannerTitle: 'Bikin Aplikasinya Sendiri, Stop Ketergantungan ke Orang Lain',
    bannerDesc: 'Semua modul dibuat step-by-step. Begitu selesai kelas, aplikasi Anda sudah jadi, berfungsi normal, dan siap dipakai untuk operasional bisnis atau dijual ke klien.'
  },
  useCases: [
    {
      id: 'uc-1',
      title: 'Owner Bisnis & UMKM',
      description: 'Punya web app kasir, manajemen stok, dan database pelanggan sendiri tanpa biaya bulanan selamanya. Bebas ketergantungan vendor IT puluhan juta.',
      desc: 'Punya web app kasir, manajemen stok, dan database pelanggan sendiri tanpa biaya bulanan selamanya. Bebas ketergantungan vendor IT puluhan juta.',
      icon: 'briefcase',
      tint: 'amber',
      tags: ['Bebas Biaya Bulanan', 'Sistem Stok Sendiri', 'Hemat Puluhan Juta']
    },
    {
      id: 'uc-2',
      title: 'Karyawan & Tim Kantor',
      description: 'Ubah Google Sheets & Excel kantor jadi web app otomatis. Input data anti-salah, rekap laporan instan, dan kerjaan beres lebih cepat tanpa sering lembur.',
      desc: 'Ubah Google Sheets & Excel kantor jadi web app otomatis. Input data anti-salah, rekap laporan instan, dan kerjaan beres lebih cepat tanpa sering lembur.',
      icon: 'file',
      tint: 'cyan',
      tags: ['Bebas Lembur', 'Otomasi Excel & Sheets', 'Nilai Tambah Karir']
    },
    {
      id: 'uc-3',
      title: 'Freelancer & Pencari Cuan Tambahan',
      description: 'Buka jasa pembuatan web app & sistem digital untuk klien UMKM dengan bayaran jutaan per proyek. Full modal AI dari prompt sampai serah terima hosting & domain.',
      desc: 'Buka jasa pembuatan web app & sistem digital untuk klien UMKM dengan bayaran jutaan per proyek. Full modal AI dari prompt sampai serah terima hosting & domain.',
      icon: 'code',
      tint: 'purple',
      tags: ['Buka Jasa Web App', 'Penghasilan Tambahan', 'Full Modal AI']
    },
    {
      id: 'uc-4',
      title: 'Pemula (Nol Pengalaman Koding)',
      description: 'Buktikan sendiri bahwa dengan arahan prompt AI yang benar, Anda bisa mendeploy web app fungsional pertama Anda ke internet tanpa harus kuliah IT.',
      desc: 'Buktikan sendiri bahwa dengan arahan prompt AI yang benar, Anda bisa mendeploy web app fungsional pertama Anda ke internet tanpa harus kuliah IT.',
      icon: 'book',
      tint: 'emerald',
      tags: ['Nol Background IT', 'AI Jadi Programmer Pribadi', '100% Praktek Nyata']
    }
  ],
  testimonials: [] // Testimoni dummy dibersihkan, siap diisi testimoni asli lewat Admin CMS
};

window.ZettData = {
  SEED_WHITELIST,
  SEED_MODULES,
  SEED_LESSONS,
  SEED_PROGRESS,
  SEED_ACTIVITY,
  SEED_FAVORITES,
  SEED_RESOURCES,
  SEED_QUICK_ACTIONS,
  SEED_LANDING_CMS
};
