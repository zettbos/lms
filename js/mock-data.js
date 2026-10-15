/**
 * Zettbos LMS - Clean Slate Database (Empty Seed Data)
 * js/mock-data.js
 * Seluruh data dummy telah dihapus. Sistem siap diisi data asli dari 0 melalui Admin Panel.
 */

// 1. WHITELIST: Akun resmi Super Admin Zettbos (Data member disinkronkan langsung dari Supabase Cloud)
const SEED_WHITELIST = [
  {
    id: 'owner-1',
    email: 'zettbos2025@gmail.com',
    fullName: 'Owner Zettbos (Super Admin)',
    role: 'admin',
    isActive: true,
    passwordHash: null,
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

// 8. QUICK ACTION HUB BERANDA: 4 Aksi Cepat Default yang Fleksibel & Dapat Diubah Admin
const SEED_QUICK_ACTIONS = [
  {
    id: 'qa-1',
    title: 'Resource & Template Hub',
    subtitle: 'Akses template Google Sheets, script otomasi & cheat sheet AI',
    icon: 'folder',
    actionType: 'navigate',
    target: 'resources',
    badge: 'Akses',
    orderIndex: 1
  },
  {
    id: 'qa-2',
    title: 'Kurikulum Pembelajaran',
    subtitle: 'Jelajahi seluruh video tutorial step-by-step dari nol',
    icon: 'book',
    actionType: 'navigate',
    target: 'home',
    badge: 'Video',
    orderIndex: 2
  },
  {
    id: 'qa-3',
    title: 'Grup Diskusi & Komunitas',
    subtitle: 'Tanya jawab langsung sesama member dan tim Zettbos',
    icon: 'chat',
    actionType: 'url',
    target: 'https://t.me/zettbos',
    badge: 'Telegram',
    orderIndex: 3
  },
  {
    id: 'qa-4',
    title: 'Jadwal Konsultasi Mentor',
    subtitle: 'Sesi privat 1-on-1 pembahasan implementasi web app',
    icon: 'sparkles',
    actionType: 'url',
    target: 'https://wa.me/',
    badge: 'VIP',
    orderIndex: 4
  }
];

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
  facilities: [
    {
      id: 'feat-1',
      title: 'Akses ZettBOT',
      description: 'AI Custom khusus untuk membantu membuat prompt dan koding.',
      desc: 'AI Custom khusus untuk membantu membuat prompt dan koding.',
      icon: 'bot',
      tint: 'emerald',
      badge: 'AI Coding Assistant',
      imageUrl: '',
      tags: ['Prompt Engineering', 'Bantuan Koding', 'Beresin Error']
    },
    {
      id: 'feat-2',
      title: 'Zettbos Library',
      description: 'Template siap pakai, tinggal modif.',
      desc: 'Template siap pakai, tinggal modif.',
      icon: 'library',
      tint: 'cyan',
      badge: 'Starter Templates',
      imageUrl: '',
      tags: ['Template Siap Pakai', 'Tinggal Modif', 'Full Source Code']
    },
    {
      id: 'feat-3',
      title: 'Modul Video Pembelajaran',
      description: 'Materi step-by-step dari nol sampai deploy, bisa dipelajari kapan saja.',
      desc: 'Materi step-by-step dari nol sampai deploy, bisa dipelajari kapan saja.',
      icon: 'video',
      tint: 'purple',
      badge: 'Kurikulum Lengkap',
      imageUrl: '',
      tags: ['Dari Nol Sampai Live', 'Akses Kapan Saja', 'Step-by-Step']
    },
    {
      id: 'feat-4',
      title: 'Grup Komunitas Premium',
      description: 'Bisa tanya dan diskusi langsung dengan mentor dan member lain.',
      desc: 'Bisa tanya dan diskusi langsung dengan mentor dan member lain.',
      icon: 'users',
      tint: 'blue',
      badge: 'Komunitas VIP',
      imageUrl: '',
      tags: ['Diskusi Member', 'Tanya Mentor', 'Networking']
    },
    {
      id: 'feat-5',
      title: 'Private Mentoring 1 Bulan',
      description: 'Dibimbing sampai bisa bikin sistem sendiri (minimal 1 bulan bimbingan intensif, didampingi penuh hingga aplikasi Anda selesai & live).',
      desc: 'Dibimbing sampai bisa bikin sistem sendiri (minimal 1 bulan bimbingan intensif, didampingi penuh hingga aplikasi Anda selesai & live).',
      icon: 'target',
      tint: 'amber',
      badge: '1-on-1 Mentoring',
      imageUrl: '',
      tags: ['Minimal 1 Bulan', 'Dibimbing Sampai Bisa', 'Private Coaching']
    }
  ],
  useCases: [
    {
      id: 'uc-1',
      title: 'Owner Bisnis & UMKM',
      description: 'Punya web app kasir, manajemen stok, dan database pelanggan sendiri tanpa biaya bulanan selamanya. Bebas ketergantungan vendor IT puluhan juta.',
      desc: 'Punya web app kasir, manajemen stok, dan database pelanggan sendiri tanpa biaya bulanan selamanya. Bebas ketergantungan vendor IT puluhan juta.',
      icon: 'briefcase',
      tint: 'amber',
      badge: 'Target Audiens',
      tags: ['Bebas Biaya Bulanan', 'Sistem Stok Sendiri', 'Hemat Puluhan Juta']
    },
    {
      id: 'uc-2',
      title: 'Karyawan & Tim Kantor',
      description: 'Ubah Google Sheets & Excel kantor jadi web app otomatis. Input data anti-salah, rekap laporan instan, dan kerjaan beres lebih cepat tanpa sering lembur.',
      desc: 'Ubah Google Sheets & Excel kantor jadi web app otomatis. Input data anti-salah, rekap laporan instan, dan kerjaan beres lebih cepat tanpa sering lembur.',
      icon: 'code',
      tint: 'cyan',
      badge: 'Target Audiens',
      tags: ['Bebas Lembur', 'Otomasi Excel & Sheets', 'Nilai Tambah Karir']
    },
    {
      id: 'uc-3',
      title: 'Freelancer & Pencari Cuan Tambahan',
      description: 'Buka jasa pembuatan web app & sistem digital untuk klien UMKM dengan bayaran jutaan per proyek. Full modal AI dari prompt sampai serah terima hosting & domain.',
      desc: 'Buka jasa pembuatan web app & sistem digital untuk klien UMKM dengan bayaran jutaan per proyek. Full modal AI dari prompt sampai serah terima hosting & domain.',
      icon: 'sparkles',
      tint: 'purple',
      badge: 'Target Audiens',
      tags: ['Buka Jasa Web App', 'Penghasilan Tambahan', 'Full Modal AI']
    },
    {
      id: 'uc-4',
      title: 'Pemula (Nol Pengalaman Koding)',
      description: 'Buktikan sendiri bahwa dengan arahan prompt AI yang benar, Anda bisa mendeploy web app fungsional pertama Anda ke internet tanpa harus kuliah IT.',
      desc: 'Buktikan sendiri bahwa dengan arahan prompt AI yang benar, Anda bisa mendeploy web app fungsional pertama Anda ke internet tanpa harus kuliah IT.',
      icon: 'users',
      tint: 'emerald',
      badge: 'Target Audiens',
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
