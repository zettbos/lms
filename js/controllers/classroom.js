/**
 * Zettbos LMS - Classroom & Learning Experience Controller
 * js/controllers/classroom.js
 * Menangani Katalog Modul, Ruang Belajar, Kalender Pembelajaran, Progress Tracking, & Koleksi Favorit.
 */

// ==========================================
// 1. QUICK ACTION HUB & RESUME LEARNING (HOME)
// ==========================================

function renderResumeLearningCard() {
  const container = document.getElementById('dash-resume-learning-container');
  if (!container) return;

  const user = AppState.currentUser;
  if (!user) {
    container.innerHTML = '';
    return;
  }

  const userCompleted = (AppState.progress && AppState.progress[user.email]) ? AppState.progress[user.email] : [];
  const lessons = AppState.lessons || [];
  const modules = AppState.modules || [];

  if (lessons.length === 0) {
    container.innerHTML = '';
    return;
  }

  // 1. Cek riwayat lokal materi terakhir yang dibuka siswa
  let lastLessonId = null;
  try {
    lastLessonId = localStorage.getItem(`zett_last_lesson_${user.email}`);
  } catch (e) {}

  let targetLesson = lessons.find(l => l.id === lastLessonId);

  // 2. Jika belum ada, cari materi pertama yang belum diselesaikan
  if (!targetLesson) {
    targetLesson = lessons.find(l => !userCompleted.includes(l.id)) || lessons[0];
  }

  const parentModule = modules.find(m => m.id === targetLesson.moduleId) || { title: 'Kurikulum Utama', badge: 'MODUL' };
  const isCompleted = userCompleted.includes(targetLesson.id);

  container.innerHTML = `
    <div class="resume-learning-card p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden group">
      <!-- Ambient Underglow Ripple (Gambar 2) -->
      <div class="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#00DF81]/10 blur-3xl pointer-events-none"></div>

      <div class="relative z-10 flex-1">
        <div class="flex items-center gap-2 mb-2 flex-wrap">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00DF81]/15 text-[#00DF81] border border-[#00DF81]/35 text-[10px] sm:text-[11px] font-black uppercase tracking-caps font-mono">
            <span class="w-2 h-2 rounded-full bg-[#00DF81] animate-pulse"></span>
            ${isCompleted ? 'ULAS MATERI TERAKHIR' : 'LANJUTKAN BELAJAR'}
          </span>
          <span class="text-xs text-[#707D7D] font-mono">• ${escapeHtml(parentModule.title)}</span>
        </div>

        <h3 class="text-lg sm:text-2xl font-black text-[#F1F7F6] group-hover:text-[#00DF81] transition-colors tracking-tight leading-snug">
          ${escapeHtml(targetLesson.title)}
        </h3>

        <p class="text-xs sm:text-sm text-[#707D7D] mt-1.5 line-clamp-1 max-w-2xl">
          ${escapeHtml(targetLesson.summary || targetLesson.description || 'Lanjutkan sesi praktek membuat web app AI dari materi terakhir Anda.')}
        </p>

        <div class="flex items-center gap-3 mt-3 text-xs text-[#707D7D] font-mono">
          <span class="flex items-center gap-1.5 text-[#2CC295] font-semibold">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            ${targetLesson.durationMinutes || 15} Menit
          </span>
          <span>•</span>
          <span class="${isCompleted ? 'text-emerald-400 font-bold' : 'text-slate-400'}">${isCompleted ? '✅ Sudah Selesai Ditonton' : '⏳ Sedang Berjalan'}</span>
        </div>
      </div>

      <!-- Single Action Pill CTA (Andragogi 3-Second Rule & Fitts's Law) -->
      <div class="relative z-10 flex-shrink-0 flex items-center">
        <button 
          onclick="navigate('learn', { lessonId: '${targetLesson.id}' })"
          class="btn-primary-action px-6 py-3.5 rounded-full text-xs sm:text-sm font-black flex items-center gap-2.5 shadow-xl shadow-[#00DF81]/25 hover:scale-105 active:scale-95 transition-all w-full md:w-auto justify-center"
        >
          <svg class="w-4 h-4 fill-current text-[#000F01]" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          <span>${isCompleted ? 'Tonton Ulang Video' : 'Lanjutkan Belajar Sekarang'}</span>
          <svg class="w-4 h-4 text-[#000F01]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>
  `;
}
window.renderResumeLearningCard = renderResumeLearningCard;

function renderQuickActionHub() {
  const container = document.getElementById('dash-quick-actions-grid');
  if (!container) return;

  container.innerHTML = '';
  const actions = (AppState.quickActions || []).sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  actions.forEach(qa => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'action-chip-btn px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-2.5 group cursor-pointer bg-[#032221] hover:bg-[#053331] border border-[#03624C]/60 hover:border-[#00DF81]/60 transition-all shadow-md';
    btn.onclick = () => executeQuickAction(qa.id);

    btn.innerHTML = `
      <span class="w-6 h-6 rounded-full bg-[#00DF81]/15 border border-[#00DF81]/30 flex items-center justify-center text-[#00DF81] group-hover:scale-110 transition-transform flex-shrink-0">
        ${getMonolineSvgIcon(qa.icon, 'w-3.5 h-3.5 text-[#00DF81]')}
      </span>
      <span class="font-extrabold tracking-tight text-[#F1F7F6] group-hover:text-[#00DF81] transition-colors">${escapeHtml(qa.title)}</span>
      <span class="text-[11px] text-[#707D7D] group-hover:text-[#00DF81] font-mono transition-colors">↗</span>
    `;

    container.appendChild(btn);
  });
}

function executeQuickAction(id) {
  const qa = (AppState.quickActions || []).find(a => a.id === id);
  if (!qa) return;

  // Dual-Admin WhatsApp Contact Selector Handler (Gambar 4 & WhatsApp Prompt)
  if (qa.id === 'qa-whatsapp' || (qa.target && qa.target.includes('wa.me')) || (qa.title && qa.title.toLowerCase().includes('whatsapp'))) {
    openWhatsAppContactModal();
    return;
  }

  if (qa.actionType === 'url') {
    if (qa.target) window.open(qa.target, '_blank');
  } else {
    navigate(qa.target || 'home');
  }
}

// ==========================================
// 1.2. GOOGLE DRIVE LINK CONVERTER & BRAND LOGO RENDERER
// ==========================================

function convertGoogleDriveUrl(url) {
  if (!url || typeof url !== 'string') return url || '';
  const trimmed = url.trim();
  // Regex matches Google Drive file IDs across shareable formats:
  // drive.google.com/file/d/{id}/...
  // drive.google.com/open?id={id}
  // drive.google.com/uc?id={id}
  // lh3.googleusercontent.com/d/{id}
  const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)|lh3\.googleusercontent\.com\/d\/)([a-zA-Z0-9_-]{20,})/i;
  const match = trimmed.match(driveRegex);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }
  return trimmed;
}

function applySquareContainFavicon(imgUrl) {
  if (!imgUrl) return;
  const faviconEl = document.getElementById('app-favicon') || document.querySelector("link[rel*='icon']");
  if (!faviconEl) return;

  // Set fallback instan
  faviconEl.href = imgUrl;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      ctx.clearRect(0, 0, 64, 64);
      const aspect = img.width / img.height;
      let drawW = 64;
      let drawH = 64;
      let offsetX = 0;
      let offsetY = 0;
      if (aspect > 1) {
        drawH = 64 / aspect;
        offsetY = (64 - drawH) / 2;
      } else {
        drawW = 64 * aspect;
        offsetX = (64 - drawW) / 2;
      }
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      try {
        const dataUri = canvas.toDataURL('image/png');
        faviconEl.href = dataUri;
      } catch (err) {
        // Fallback jika CORS canvas dibatasi
        faviconEl.href = imgUrl;
      }
    };
    img.onerror = function () {
      faviconEl.href = imgUrl;
    };
    img.src = imgUrl;
  } catch (err) {
    faviconEl.href = imgUrl;
  }
}

function renderAppBrandLogo() {
  const customLogo = (window.AppState && window.AppState.brandLogoUrl) || localStorage.getItem('zettbos_brand_logo_url') || '';
  const convertedUrl = convertGoogleDriveUrl(customLogo);

  const targets = [
    { id: 'brand-logo-nav', size: 'sm' },
    { id: 'brand-logo-drawer', size: 'sm' },
    { id: 'brand-logo-landing', size: 'sm' },
    { id: 'brand-logo-footer', size: 'xs' },
    { id: 'brand-logo-boot-loader', size: 'bootloader' },
    { id: 'brand-logo-login', size: 'login' }
  ];

  targets.forEach(t => {
    const el = document.getElementById(t.id);
    if (!el) return;
    if (convertedUrl) {
      if (t.size === 'bootloader') {
        el.className = 'relative flex items-center justify-center mb-4 bg-transparent border-0 shadow-none overflow-visible';
        el.innerHTML = `<img src="${escapeHtml(convertedUrl)}" alt="Logo ZETTBOS" class="h-16 sm:h-20 w-auto max-w-[160px] object-contain relative z-10" onerror="this.onerror=null; this.parentElement.className='relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center shadow-2xl shadow-emerald-500/20 mb-5'; this.parentElement.innerHTML='<div class=\\'boot-loader-pulse-ring\\'></div><span class=\\'font-mono font-black text-xl sm:text-2xl text-emerald-400 tracking-tighter\\'>ZB</span>';">`;
      } else if (t.size === 'login') {
        // Logo login tanpa kotak atau border sesuai instruksi pengguna
        el.className = 'flex items-center justify-center mb-4 bg-transparent border-0 shadow-none p-0 overflow-visible';
        el.innerHTML = `<img src="${escapeHtml(convertedUrl)}" alt="Logo ZETTBOS" class="h-12 sm:h-14 w-auto max-w-[180px] object-contain" onerror="this.onerror=null; this.parentElement.className='inline-flex items-center justify-center w-14 h-14 rounded-xl bg-surface-1 border border-hairline mb-4 shadow-sm'; this.parentElement.innerHTML='<span class=\\'text-2xl font-black font-mono text-emerald-400 tracking-tighter\\'>ZB</span>';">`;
      } else {
        // Hapus kotak hijau, border & shadow saat logo gambar kustom aktif
        el.className = `flex items-center justify-center flex-shrink-0 bg-transparent border-0 shadow-none p-0 overflow-visible`;
        el.innerHTML = `<img src="${escapeHtml(convertedUrl)}" alt="Logo ZETTBOS" class="${t.size === 'xs' ? 'h-6' : 'h-7 sm:h-8'} w-auto max-w-[140px] object-contain" onerror="this.onerror=null; this.parentElement.className='w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center shadow-sm flex-shrink-0 overflow-hidden'; this.parentElement.innerHTML='<span class=\\'font-mono font-bold text-xs text-emerald-400\\'>ZB</span>';">`;
      }
    } else {
      if (t.size === 'bootloader') {
        el.className = 'relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center shadow-2xl shadow-emerald-500/20 mb-5';
        el.innerHTML = `<div class="boot-loader-pulse-ring"></div><span class="font-mono font-black text-xl sm:text-2xl text-emerald-400 tracking-tighter">ZB</span>`;
      } else if (t.size === 'login') {
        el.className = 'inline-flex items-center justify-center w-14 h-14 rounded-xl bg-surface-1 border border-hairline mb-4 shadow-sm';
        el.innerHTML = `<span class="text-2xl font-black font-mono text-emerald-400 tracking-tighter">ZB</span>`;
      } else {
        el.className = `w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center shadow-sm flex-shrink-0 overflow-hidden`;
        el.innerHTML = `<span class="font-mono font-black ${t.size === 'xs' ? 'text-[11px]' : 'text-xs'} text-emerald-400">ZB</span>`;
      }
    }
  });

  // Sinkronisasi Favicon Browser Tab & Judul Zettbos (Revisi 68)
  try {
    if (convertedUrl) {
      applySquareContainFavicon(convertedUrl);
    }
    if (document.title !== 'Zettbos') {
      document.title = 'Zettbos';
    }
  } catch (e) { }
}

function renderWhatsAppContactCards() {
  const listEl = document.getElementById('whatsapp-admin-cards-list');
  if (!listEl) return;
  const contacts = (window.AppState?.landingCms?.adminContacts && window.AppState.landingCms.adminContacts.length > 0)
    ? window.AppState.landingCms.adminContacts
    : [
      { id: 'admin1', name: 'Admin Farhan', phone: '0851-1122-6452', role: 'Support & Operasional LMS', status: 'Online' },
      { id: 'admin2', name: 'Admin Asep', phone: '0821-9527-7812', role: 'Pendaftaran & Konsultasi Member', status: 'Online' }
    ];

  const palettes = [
    { badge: 'text-emerald-400 bg-emerald-950/80 border-emerald-500/40', hoverBorder: 'hover:border-emerald-500/60', btn: 'bg-emerald-500/15 group-hover:bg-emerald-500 text-emerald-400 group-hover:text-slate-950', nameHover: 'group-hover:text-emerald-400' },
    { badge: 'text-cyan-400 bg-cyan-950/80 border-cyan-500/40', hoverBorder: 'hover:border-cyan-500/60', btn: 'bg-cyan-500/15 group-hover:bg-cyan-500 text-cyan-400 group-hover:text-slate-950', nameHover: 'group-hover:text-cyan-400' },
    { badge: 'text-purple-400 bg-purple-950/80 border-purple-500/40', hoverBorder: 'hover:border-purple-500/60', btn: 'bg-purple-500/15 group-hover:bg-purple-500 text-purple-400 group-hover:text-slate-950', nameHover: 'group-hover:text-purple-400' },
    { badge: 'text-amber-400 bg-amber-950/80 border-amber-500/40', hoverBorder: 'hover:border-amber-500/60', btn: 'bg-amber-500/15 group-hover:bg-amber-500 text-amber-400 group-hover:text-slate-950', nameHover: 'group-hover:text-amber-400' }
  ];

  listEl.innerHTML = contacts.map((admin, idx) => {
    const cleanPhone = (admin.phone || '').replace(/\D/g, '').replace(/^0/, '62');
    const initials = (admin.name || 'Admin').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'AD';
    const pal = palettes[idx % palettes.length];
    const roleText = admin.role || 'Admin LMS Zettbos';

    // Rule: Jika total kontak ganjil (>1) dan ini adalah item terakhir, letakkan di tengah baris bawah (col-span-2 centered)
    const isLastOdd = (idx === contacts.length - 1) && (contacts.length % 2 !== 0) && (contacts.length > 1);
    const oddCenteredClass = isLastOdd ? 'md:col-span-2 md:max-w-md md:mx-auto md:w-full' : 'w-full';

    return `
      <div class="group relative flex flex-col justify-between p-5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 ${pal.hoverBorder} transition-all duration-200 shadow-lg hover:shadow-emerald-950/20 ${oddCenteredClass}">
        <!-- Top Section: Header Profil Admin -->
        <div>
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex items-center gap-3">
              <div class="relative shrink-0">
                <div class="w-12 h-12 rounded-2xl ${pal.badge} border flex items-center justify-center font-black text-sm font-mono shadow-inner">
                  ${escapeHtml(initials)}
                </div>
                <span class="w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900 absolute -bottom-1 -right-1 animate-pulse" title="Online"></span>
              </div>
              <div class="min-w-0">
                <h4 class="text-base font-extrabold text-white ${pal.nameHover} transition-colors tracking-tight leading-snug whitespace-normal">
                  ${escapeHtml(admin.name)}
                </h4>
                <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold mt-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>${escapeHtml(admin.status || 'Online')}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Role / Deskripsi Tugas (Tampil Utuh, Tanpa Terpotong) -->
          <div class="text-xs text-slate-300 font-medium leading-relaxed mb-3 whitespace-normal">
            ${escapeHtml(roleText)}
          </div>

          <!-- Nomor WhatsApp Badge Monospace -->
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800/80 text-xs font-mono text-emerald-400 mb-4">
            <svg class="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
            <span class="tracking-wider font-semibold">${escapeHtml(admin.phone)}</span>
          </div>
        </div>

        <!-- Bottom Section: Tombol Chat Full-Width -->
        <a href="https://wa.me/${cleanPhone}?text=Halo%20${encodeURIComponent(admin.name || 'Admin')}%20Zettbos,%20saya%20ingin%20bertanya%20seputar%20LMS%20Zettbos" target="_blank" rel="noopener noreferrer" class="w-full py-2.5 px-4 rounded-xl ${pal.btn} font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] border border-emerald-500/30">
          <span>Chat via WhatsApp</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        </a>
      </div>
    `;
  }).join('');
}

function openWhatsAppContactModal() {
  renderWhatsAppContactCards();
  const modal = document.getElementById('modal-whatsapp-contact');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeWhatsAppContactModal() {
  const modal = document.getElementById('modal-whatsapp-contact');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

window.renderWhatsAppContactCards = renderWhatsAppContactCards;

// ==========================================
// 1.5. PINNED MODULE HERO (ADMIN FEATURED)
// ==========================================

function renderPinnedModuleHero() {
  const container = document.getElementById('dash-pinned-module-container');
  if (!container) return;

  const user = AppState.currentUser;
  const isSuperAdmin = user && (user.role === 'admin' || user.email?.toLowerCase() === 'zettbos2025@gmail.com');
  const userCompletedLessonIds = (user && AppState.progress[user.email]) ? AppState.progress[user.email] : [];

  // Find pinned modules (visible to students if published, or to super admin)
  const pinnedMods = AppState.modules
    .filter(m => m.isPinned && (isSuperAdmin || !m.isDraft))
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  if (pinnedMods.length === 0) {
    container.innerHTML = '';
    container.classList.add('hidden');
    return;
  }

  container.classList.remove('hidden');

  container.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      ${pinnedMods.map(pinnedMod => {
    const moduleLessons = AppState.lessons
      .filter(l => l.moduleId === pinnedMod.id && (isSuperAdmin || !l.isDraft))
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

    const completedCount = moduleLessons.filter(l => userCompletedLessonIds.includes(l.id)).length;
    const totalMinutes = moduleLessons.reduce((acc, l) => acc + (l.durationMinutes || 15), 0);
    const percent = moduleLessons.length > 0 ? Math.round((completedCount / moduleLessons.length) * 100) : 0;

    const targetLessonId = (completedCount > 0
      ? (moduleLessons.find(l => !userCompletedLessonIds.includes(l.id)) || moduleLessons[0])?.id
      : moduleLessons[0]?.id);

    const coverImg = pinnedMod.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';

    return `
          <div 
            onclick="${targetLessonId ? `navigate('learn', { lessonId: '${targetLessonId}' })` : `showToast('Modul ini belum memiliki materi', 'info')`}"
            class="pinned-hero-card relative overflow-hidden rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-slate-900/95 via-slate-950 to-slate-900/95 border border-emerald-500/40 shadow-xl shadow-emerald-950/20 group cursor-pointer hover:border-emerald-500/70 hover:shadow-emerald-500/10 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
          >
            <!-- Background Ambient Glow -->
            <div class="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/15 transition-all"></div>
            <div class="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <!-- Top Header Badge -->
            <div>
              <div class="flex flex-wrap items-center justify-between gap-2.5 mb-3.5 relative z-10 border-b border-slate-800/80 pb-2.5">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm font-mono">
                    <svg class="w-3 h-3 text-amber-400 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    <span>REKOMENDASI UTAMA</span>
                  </span>
                  <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-cyan-500/30">
                    ${escapeHtml(pinnedMod.badge || 'MODUL PILIHAN')}
                  </span>
                  <span class="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                    ${escapeHtml(pinnedMod.category || 'Kurikulum')}
                  </span>
                </div>

                <div class="flex items-center gap-1 text-[10px] font-mono">
                  <span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-bold">
                    ${completedCount}/${moduleLessons.length} Selesai (${percent}%)
                  </span>
                </div>
              </div>

              <!-- Title & Description (Bigger Bold Title Font - Revisi 89) -->
              <h3 class="text-lg sm:text-xl lg:text-2xl font-black text-white group-hover:text-emerald-400 transition-colors tracking-tight leading-snug mb-2 line-clamp-2">
                ${escapeHtml(pinnedMod.title)}
              </h3>
              <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                ${escapeHtml(pinnedMod.description || 'Pelajari materi fundamental web app AI terstruktur bersama mentor Zettbos.')}
              </p>

              <!-- Header Materi List -->
              <div class="text-[10px] font-bold text-slate-500 uppercase tracking-caps mb-1.5 flex items-center justify-between">
                <span>Daftar Materi di Modul Ini:</span>
                <span class="font-mono text-slate-500">${moduleLessons.length} Materi</span>
              </div>

              <!-- Scrollable Episodes List (Vertikal Scrollable Sesuai Permintaan Gambar 3) -->
              <div class="max-h-40 overflow-y-auto custom-scrollbar surface-well p-1.5 space-y-1 mb-3.5">
                ${moduleLessons.map((l, i) => {
                  const isDone = userCompletedLessonIds.includes(l.id);
                  return `
                    <div 
                      onclick="event.stopPropagation(); navigate('learn', { lessonId: '${l.id}' })"
                      class="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800/80 transition-colors cursor-pointer border border-transparent"
                    >
                      <div class="flex items-center gap-2 truncate">
                        ${isDone 
                          ? '<svg class="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M5 13l4 4L19 7"/></svg>' 
                          : '<svg class="w-3.5 h-3.5 text-slate-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="6" stroke-width="1.8"/></svg>'}
                        <span class="truncate ${isDone ? 'text-emerald-300 font-medium' : 'text-slate-300'}">${i + 1}. ${escapeHtml(l.title)}</span>
                      </div>
                      <span class="text-[10px] text-slate-500 font-mono flex-shrink-0">${l.durationMinutes || 15}m</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Bottom Action Row -->
            <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3 mt-auto">
              <span class="text-[11px] text-slate-400 font-mono">
                ${moduleLessons.length} Video • ${totalMinutes} Menit
              </span>
              <button 
                onclick="event.stopPropagation(); ${targetLessonId ? `navigate('learn', { lessonId: '${targetLessonId}' })` : `showToast('Modul ini belum memiliki materi', 'info')`}" 
                class="btn-primary-action px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-950/50 flex items-center gap-1.5 group-hover:scale-[1.02] transition-transform"
              >
                <span>${completedCount > 0 ? 'Lanjutkan Belajar' : 'Mulai Belajar'}</span>
                <svg class="w-3.5 h-3.5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </button>
            </div>
          </div>
        `;
  }).join('')}
    </div>
  `;
}
window.renderPinnedModuleHero = renderPinnedModuleHero;

// ==========================================
// 2. CURRICULUM MODULE CATALOG & FILTERING
// ==========================================

function renderModuleCategoryPills() {
  const container = document.getElementById('module-category-pills');
  if (!container) return;

  const user = AppState.currentUser;
  const isSuperAdmin = user && (user.role === 'admin' || user.email?.toLowerCase() === 'zettbos2025@gmail.com');
  const visibleModules = AppState.modules.filter(m => isSuperAdmin || !m.isDraft);

  // Extract unique categories dynamically from visible modules
  const rawCategories = visibleModules
    .map(m => (m.category || '').trim())
    .filter(cat => cat.length > 0);
  const uniqueCategories = Array.from(new Set(rawCategories));

  // Build categories array with "all" as first option
  const categories = [
    { key: 'all', label: 'Semua Modul', count: visibleModules.length },
    ...uniqueCategories.map(cat => ({
      key: cat,
      label: cat,
      count: visibleModules.filter(m => (m.category || '').trim() === cat).length
    }))
  ];

  // If active filter is not in list and not 'all', revert to 'all'
  if (AppState.activeModuleCategory !== 'all' && !uniqueCategories.includes(AppState.activeModuleCategory)) {
    AppState.activeModuleCategory = 'all';
  }

  container.innerHTML = categories.map(cat => {
    const isActive = AppState.activeModuleCategory === cat.key;
    const activeClass = isActive
      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/50 font-bold shadow-sm'
      : 'bg-[var(--surface-subtle)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-hover)] border-[var(--border)] font-medium';

    const safeKey = cat.key.replace(/'/g, "\\'");
    return `
      <button 
        onclick="setModuleCategory('${safeKey}')" 
        class="px-3 py-1.5 rounded-lg text-xs border transition-all flex items-center gap-1.5 ${activeClass}"
      >
        <span>${escapeHtml(cat.label)}</span>
        <span class="text-[10px] font-mono px-1 rounded ${isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-[var(--surface)] text-[var(--fg-muted)]'}">
          ${cat.count}
        </span>
      </button>
    `;
  }).join('');
}

function setModuleCategory(catKey) {
  AppState.activeModuleCategory = catKey;
  renderModuleCategoryPills();
  renderModuleCatalogGrid();
}

function handleModuleSearch() {
  const input = document.getElementById('input-module-search');
  const clearBtn = document.getElementById('btn-clear-module-search');
  if (!input) return;

  AppState.moduleSearchQuery = input.value.trim().toLowerCase();
  if (clearBtn) {
    if (AppState.moduleSearchQuery) clearBtn.classList.remove('hidden');
    else clearBtn.classList.add('hidden');
  }
  renderModuleCatalogGrid();
}

function clearModuleSearch() {
  const input = document.getElementById('input-module-search');
  const clearBtn = document.getElementById('btn-clear-module-search');
  if (input) input.value = '';
  if (clearBtn) clearBtn.classList.add('hidden');
  AppState.moduleSearchQuery = '';
  renderModuleCatalogGrid();
}

function renderModuleCatalogGrid() {
  const container = document.getElementById('dash-modules-grid');
  if (!container) return;

  const user = AppState.currentUser;
  const isSuperAdmin = user && (user.role === 'admin' || user.email?.toLowerCase() === 'zettbos2025@gmail.com');
  const userCompletedLessonIds = (user && AppState.progress[user.email]) ? AppState.progress[user.email] : [];
  const userFavs = (user && AppState.favorites[user.email]) ? AppState.favorites[user.email] : [];

  let filtered = AppState.modules.filter(mod => {
    // Non-admin (siswa) hanya melihat modul yang sudah dipublikasikan (bukan draft)
    if (!isSuperAdmin && mod.isDraft) return false;

    if (AppState.activeModuleCategory !== 'all' && (mod.category || '').trim() !== AppState.activeModuleCategory) {
      return false;
    }
    if (AppState.moduleSearchQuery) {
      const q = AppState.moduleSearchQuery;
      const modMatch = mod.title.toLowerCase().includes(q) || (mod.description && mod.description.toLowerCase().includes(q));
      const modLessons = AppState.lessons.filter(l => l.moduleId === mod.id && (isSuperAdmin || !l.isDraft));
      const lessonMatch = modLessons.some(l => l.title.toLowerCase().includes(q));
      if (!modMatch && !lessonMatch) return false;
    }
    return true;
  });

  filtered.sort((a, b) => a.orderIndex - b.orderIndex);

  const badgeEl = document.getElementById('dash-module-count-badge');
  if (badgeEl) {
    badgeEl.textContent = `${filtered.length} Modul Ditampilkan`;
  }

  if (AppState.modules.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center glass-card rounded-2xl border border-slate-800">
        <div class="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-400">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
        </div>
        <h4 class="text-base font-bold text-white mb-1.5">Belum Ada Modul Kurikulum</h4>
        <p class="text-xs text-slate-400 mb-5 max-w-md mx-auto">${isSuperAdmin ? 'Database telah dibersihkan ke 0. Masuk ke Admin Panel untuk mulai membuat modul dan pelajaran pertama Anda.' : 'Kurikulum sedang disusun oleh tim mentor Zettbos. Silakan akses dokumen dan resource pembelajaran yang tersedia.'}</p>
        ${isSuperAdmin ? `
        <button onclick="navigate('admin')" class="btn-primary-action px-5 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2">
          <span>Buka Panel Kurikulum Admin</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        </button>
        ` : `
        <button onclick="navigate('resources')" class="btn-primary-action px-5 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2">
          <span>Buka Dokumen &amp; Resource Hub</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        </button>
        `}
      </div>
    `;
    return;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center glass-card rounded-2xl border border-slate-800">
        <div class="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
        <h4 class="text-sm font-bold text-white mb-1">Tidak ada materi yang sesuai</h4>
        <p class="text-xs text-slate-400 mb-4 max-w-sm mx-auto">Coba ubah kata kunci pencarian atau pilih kategori filter lain.</p>
        <button onclick="clearModuleSearch(); setModuleCategory('all');" class="btn-primary-action px-4 py-2 rounded-lg text-xs font-semibold">
          Reset Filter &amp; Pencarian
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = '';

  filtered.forEach(mod => {
    const moduleLessons = AppState.lessons.filter(l => l.moduleId === mod.id && (isSuperAdmin || !l.isDraft)).sort((a, b) => a.orderIndex - b.orderIndex);
    const modCompleted = moduleLessons.filter(l => userCompletedLessonIds.includes(l.id)).length;
    const isModFullyCompleted = moduleLessons.length > 0 && modCompleted === moduleLessons.length;
    const isModFav = userFavs.some(f => f.type === 'module' && f.targetId === mod.id);
    const totalMinutes = moduleLessons.reduce((acc, l) => acc + (l.durationMinutes || 15), 0);
    const completionPercent = moduleLessons.length > 0 ? Math.round((modCompleted / moduleLessons.length) * 100) : 0;

    const targetLessonId = (modCompleted > 0
      ? (moduleLessons.find(l => !userCompletedLessonIds.includes(l.id)) || moduleLessons[0])?.id
      : moduleLessons[0]?.id);

    const card = document.createElement('div');
    card.className = 'glass-card squircle-card rounded-3xl overflow-hidden flex flex-col justify-between group transition-all duration-300 border border-[#03624C]/45 hover:border-[#00DF81]/60 cursor-pointer hover:shadow-2xl hover:-translate-y-1.5';

    card.onclick = () => {
      if (mod.isLocked) {
        showToast(mod.lockReason || 'Modul terkunci', 'info');
        return;
      }
      if (targetLessonId) {
        navigate('learn', { lessonId: targetLessonId });
      } else {
        showToast('Modul ini belum memiliki materi', 'info');
      }
    };

    card.innerHTML = `
      <div>
        <!-- Cyber Pill Header & Status Strip (Revisi 87: No Image, Space-Saving) -->
        <div class="relative px-4 sm:px-5 pt-3.5 pb-3 border-b border-[var(--border)] bg-slate-900/80 flex items-center justify-between gap-2 overflow-hidden">
          <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 opacity-70 group-hover:opacity-100 transition-opacity"></div>
          
          <div class="flex items-center gap-2 flex-wrap">
            <span class="px-2.5 py-0.5 rounded text-[10px] font-extrabold tracking-wider font-mono uppercase ${isModFullyCompleted ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 shadow-sm' : 'bg-slate-950 text-cyan-400 border border-cyan-500/40'}">
              ${escapeHtml(mod.badge || 'MODUL')}
            </span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
              ${escapeHtml(mod.category || 'Kurikulum')}
            </span>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold ${modCompleted > 0 ? 'bg-emerald-950/90 text-emerald-400 border border-emerald-500/30' : 'bg-slate-950/80 text-slate-400 border border-[var(--border)]'}">
              ${modCompleted}/${moduleLessons.length} Selesai (${completionPercent}%)
            </span>
          </div>

          <button onclick="event.stopPropagation(); toggleModuleFavorite('${mod.id}')" title="${isModFav ? 'Hapus dari Favorit' : 'Simpan Modul ke Favorit'}" class="p-1.5 rounded-lg ${isModFav ? 'bg-amber-950/90 text-amber-300 border border-amber-500/60' : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-[var(--border)]'} shadow-sm transition-colors z-10">
            <svg class="w-3.5 h-3.5 ${isModFav ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
          </button>
        </div>

        <div class="p-4 sm:p-5 pb-3">
          <h3 class="font-black text-lg sm:text-xl text-white group-hover:text-emerald-400 transition-colors leading-tight tracking-tight mb-2.5 line-clamp-2">
            ${escapeHtml(mod.title)}
          </h3>
          <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3.5">
            ${escapeHtml(mod.description || 'Modul pembelajaran terstruktur web app AI bersama mentor Zettbos.')}
          </p>

          <div class="flex flex-wrap items-center gap-1.5 mb-3.5">
            ${getModuleMicroTags(mod).map(tag => `
              <span class="micro-tag-pill">
                ${getMonolineSvgIcon(tag.icon, 'w-3 h-3 text-emerald-400')}
                <span>${escapeHtml(tag.label)}</span>
              </span>
            `).join('')}
          </div>

          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-caps mb-2 flex items-center justify-between">
            <span>Materi di Modul Ini:</span>
            <span class="font-mono text-slate-500">${moduleLessons.length} Materi</span>
          </div>
          
          <div class="max-h-36 overflow-y-auto custom-scrollbar surface-well p-1 space-y-1 mb-2">
            ${moduleLessons.map((les, idx) => {
      const isDone = userCompletedLessonIds.includes(les.id);
      let iconSvg = '';
      let textClass = 'text-slate-300';
      let rowBg = 'hover:bg-[var(--surface-hover)] hover:border-[var(--border)]';

      if (mod.isLocked) {
        iconSvg = `<svg class="w-3.5 h-3.5 text-amber-500/80 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>`;
        textClass = 'text-slate-500';
      } else if (isDone) {
        iconSvg = `<svg class="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M5 13l4 4L19 7"/></svg>`;
        textClass = 'text-emerald-300';
      } else {
        iconSvg = `<svg class="w-3.5 h-3.5 text-slate-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="6" stroke-width="1.8"/></svg>`;
        textClass = 'text-slate-400';
      }

      return `
                <div 
                  onclick="event.stopPropagation(); ${mod.isLocked ? `showToast('${escapeHtml(mod.lockReason || 'Modul terkunci')}', 'info')` : `navigate('learn', { lessonId: '${les.id}' })`}"
                  class="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs ${rowBg} transition-colors cursor-pointer border border-transparent"
                >
                  <div class="flex items-center gap-2 truncate">
                    ${iconSvg}
                    <span class="truncate ${textClass}">${idx + 1}. ${escapeHtml(les.title)}</span>
                  </div>
                  <span class="text-[10px] text-slate-500 font-mono flex-shrink-0">${les.durationMinutes || 15} min</span>
                </div>
              `;
    }).join('')}
          </div>
        </div>
      </div>

      <div class="px-4 sm:p-5 pt-3 pb-4 border-t border-[var(--border)] mt-auto flex items-center justify-between gap-2">
        <span class="text-[11px] text-[var(--fg-muted)] font-mono">
          ${moduleLessons.length} Materi • ${totalMinutes} Menit
        </span>

        ${mod.isLocked ? `
          <button onclick="event.stopPropagation(); showToast('${escapeHtml(mod.lockReason || 'Modul terkunci')}', 'info')" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--surface-subtle)] text-slate-500 border border-[var(--border)] flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            <span>Terkunci</span>
          </button>
        ` : (isModFullyCompleted ? `
          <button onclick="event.stopPropagation(); navigate('learn', { lessonId: '${moduleLessons[0]?.id}' })" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/25 flex items-center gap-1.5 transition-colors">
            <span>Ulas Modul</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>
        ` : (modCompleted > 0 ? `
          <button onclick="event.stopPropagation(); navigate('learn', { lessonId: '${(moduleLessons.find(l => !userCompletedLessonIds.includes(l.id)) || moduleLessons[0])?.id}' })" class="btn-primary-action px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
            <span>Lanjutkan</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>
        ` : `
          <button onclick="event.stopPropagation(); navigate('learn', { lessonId: '${moduleLessons[0]?.id}' })" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] text-[var(--fg)] border border-[var(--border)] flex items-center gap-1.5 transition-colors">
            <span>Masuk Modul</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>
        `))}
      </div>
    `;

    container.appendChild(card);
  });
}

function renderHome() {
  const user = AppState.currentUser;
  if (!user) return;

  const userCompletedLessonIds = AppState.progress[user.email] || [];
  const totalLessons = AppState.lessons.length;
  const completedCount = userCompletedLessonIds.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const greetingEl = document.getElementById('dash-user-greeting');
  const countEl = document.getElementById('dash-completed-count');
  const percentEl = document.getElementById('dash-progress-percent');
  const progressBar = document.getElementById('dash-progress-bar');

  if (greetingEl) greetingEl.textContent = user.fullName || user.email;
  if (countEl) countEl.textContent = `${completedCount} dari ${totalLessons} Materi Selesai`;
  if (percentEl) percentEl.textContent = `${progressPercent}%`;
  if (progressBar) progressBar.style.width = `${progressPercent}%`;

  renderResumeLearningCard();
  renderQuickActionHub();
  renderPinnedModuleHero();
  renderModuleCategoryPills();
  renderModuleCatalogGrid();
  renderAppBrandLogo();
}

// ==========================================
// 3. USER DASHBOARD & MONTHLY LEARNING CALENDAR
// ==========================================

function renderUserDashboard() {
  const user = AppState.currentUser;
  if (!user) return;

  const userCompleted = AppState.progress[user.email] || [];
  const totalLessons = AppState.lessons.length;
  const completedCount = userCompleted.length;
  const percent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const totalMinutes = userCompleted.reduce((acc, lesId) => {
    const l = AppState.lessons.find(item => item.id === lesId);
    return acc + (l ? (l.durationMinutes || 15) : 15);
  }, 0) || (userCompleted.length * 16);

  const elTotalMin = document.getElementById('stat-total-minutes');
  const elOverallPercent = document.getElementById('stat-overall-percent');
  const elOverallText = document.getElementById('stat-overall-text');
  const circleEl = document.getElementById('zeigarnik-svg-circle');
  const percentLabel = document.getElementById('zeigarnik-ring-percent-label');
  const promptEl = document.getElementById('stat-zeigarnik-prompt');

  if (elTotalMin) elTotalMin.textContent = `${totalMinutes} Menit`;
  if (elOverallPercent) elOverallPercent.textContent = `${percent}%`;
  if (elOverallText) elOverallText.textContent = `${completedCount} dari ${totalLessons} Materi Selesai`;

  // Zeigarnik Progress Ring & Donut (Gambar 2 & Neuro-Pedagogy)
  if (circleEl) {
    const circumference = 251.2; // 2 * pi * 40
    const offset = circumference - (percent / 100) * circumference;
    circleEl.style.strokeDashoffset = offset;
  }
  if (percentLabel) {
    percentLabel.textContent = `${percent}%`;
  }
  if (promptEl) {
    const remaining = totalLessons - completedCount;
    if (remaining === 0 && totalLessons > 0) {
      promptEl.textContent = '🎉 Luar biasa! Seluruh materi telah tuntas Anda selesaikan 100%!';
    } else if (remaining <= 3 && remaining > 0) {
      promptEl.textContent = `🔥 Tinggal ${remaining} materi lagi untuk menuntaskan kelas ini! Selesaikan sekarang!`;
    } else {
      promptEl.textContent = `Progres mantap! ${completedCount} materi tuntas, tersisa ${remaining} materi lagi.`;
    }
  }

  renderMonthlyLearningCalendar();

  const breakdownList = document.getElementById('module-breakdown-list');
  if (breakdownList) {
    breakdownList.innerHTML = '';

    AppState.modules.sort((a, b) => a.orderIndex - b.orderIndex).forEach(mod => {
      const modLessons = AppState.lessons.filter(l => l.moduleId === mod.id);
      const modDoneCount = modLessons.filter(l => userCompleted.includes(l.id)).length;
      const modPercent = modLessons.length > 0 ? Math.round((modDoneCount / modLessons.length) * 100) : 0;

      const targetLessonId = (modLessons.find(l => !userCompleted.includes(l.id)) || modLessons[0])?.id;

      const item = document.createElement('div');
      item.className = 'p-3.5 sm:p-4 rounded-xl glass-card border border-[var(--border)] module-progress-interactive-card group';
      if (targetLessonId) {
        item.onclick = () => navigate('learn', { lessonId: targetLessonId });
        item.title = `Buka ${escapeHtml(mod.title)} di Ruang Belajar`;
      }

      item.innerHTML = `
        <div class="flex items-center justify-between text-xs mb-1.5">
          <span class="font-bold text-[var(--fg)] group-hover:text-emerald-400 transition-colors flex items-center gap-1.5 truncate pr-2">
            <span>${escapeHtml(mod.title)}</span>
            <svg class="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 text-emerald-400 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </span>
          <span class="font-mono flex-shrink-0 ${modPercent === 100 ? 'text-emerald-400 font-bold' : 'text-[var(--fg-muted)]'}">${modPercent}% (${modDoneCount}/${modLessons.length})</span>
        </div>
        <div class="w-full h-2 rounded-full bg-[var(--surface-well)] overflow-hidden mb-2">
          <div class="h-full bg-emerald-500 rounded-full" style="width: ${modPercent}%"></div>
        </div>
        <div class="flex flex-wrap gap-1.5 pt-1">
          ${modLessons.map(l => {
        const isDone = userCompleted.includes(l.id);
        return `
              <button 
                type="button" 
                onclick="event.stopPropagation(); navigate('learn', { lessonId: '${l.id}' })" 
                class="text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer hover:border-emerald-500/70 hover:text-white transition-all ${isDone ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-[var(--surface-subtle)] text-[var(--fg-muted)] border border-[var(--border)]'}" 
                title="Langsung buka: ${escapeHtml(l.title)}"
              >
                ${isDone ? `
                  <svg class="w-3 h-3 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M5 13l4 4L19 7"/></svg>
                ` : `
                  <svg class="w-3 h-3 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="6" stroke-width="1.8"/></svg>
                `}
                <span class="truncate max-w-[150px] font-medium">${escapeHtml(l.title)}</span>
              </button>
            `;
      }).join('')}
        </div>
      `;

      breakdownList.appendChild(item);
    });
  }
}

function renderMonthlyLearningCalendar() {
  const container = document.getElementById('learning-calendar-container');
  const countBadge = document.getElementById('calendar-active-days-count');
  if (!container) return;

  container.innerHTML = '';

  const user = AppState.currentUser;
  const userActivity = (user && AppState.activity && AppState.activity[user.email]) ? AppState.activity[user.email] : null;
  let studiedDates = (userActivity && Array.isArray(userActivity.studiedDates)) ? userActivity.studiedDates : [];

  for (let empty = 0; empty < 3; empty++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'calendar-day-empty';
    container.appendChild(emptyCell);
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 9 = October (0-indexed)
  const currentDate = now.getDate();

  const activeInOct = studiedDates.filter(d => d.startsWith('2026-10')).length;
  if (countBadge) {
    countBadge.innerHTML = `
      <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      <span>${activeInOct} Hari Belajar Bulan Ini</span>
    `;
  }

  for (let day = 1; day <= 31; day++) {
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `2026-10-${dayStr}`;
    const isStudied = studiedDates.includes(dateStr);
    const isToday = (currentYear === 2026 && currentMonth === 9 && currentDate === day);

    const cell = document.createElement('div');
    cell.className = `calendar-day-cell cursor-pointer ${isStudied ? 'calendar-day-active' : ''} ${isToday ? 'calendar-day-today' : ''}`;
    cell.title = isStudied
      ? `Tanggal ${day} Okt 2026: Aktif Belajar (Materi tuntas)`
      : isToday
        ? `Tanggal ${day} Okt 2026 (Hari Ini)`
        : `Tanggal ${day} Okt 2026: Istirahat`;

    cell.onclick = () => {
      showCalendarDayDetail(dateStr, isStudied, isToday, day);
    };

    cell.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="day-number text-xs font-mono font-bold ${isStudied ? 'text-emerald-400' : isToday ? 'text-cyan-400' : 'text-slate-400'}">${day}</span>
        ${isToday ? '<span class="text-[8px] font-extrabold px-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/80">HARI INI</span>' : ''}
      </div>
      <div class="flex items-center justify-end mt-1">
        ${isStudied ? `
          <span class="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold" title="Tuntas materi">
            <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
          </span>
        ` : `
          <span class="text-[9px] text-slate-600 font-mono">--</span>
        `}
      </div>
    `;

    container.appendChild(cell);
  }
}

function showCalendarDayDetail(dateStr, isStudied, isToday, day) {
  if (isStudied) {
    showToast(`${day} Okt 2026: Anda aktif belajar dan menuntaskan materi kurikulum.`, 'success');
  } else if (isToday) {
    showToast(`Hari ini (${day} Okt 2026): Tuntaskan 1 video materi untuk menyalakan status aktif belajar hari ini.`, 'info');
  } else {
    showToast(`${day} Okt 2026: Jadwal istirahat.`, 'info');
  }
}

// ==========================================
// 4. LEARNING ROOM & VIDEO PLAYER (2-STATE ARCHITECTURE)
// ==========================================

let learnModuleSearchQuery = '';
let activeLearnModuleCategory = 'all';

function setLearnModuleCategory(category) {
  activeLearnModuleCategory = category;
  renderLearnModuleCategoryPills();
  renderLearnModulesCatalog();
}

function handleLearnModuleSearch() {
  const inp = document.getElementById('learn-input-module-search');
  learnModuleSearchQuery = (inp ? inp.value : '').toLowerCase().trim();
  renderLearnModulesCatalog();
}

function clearLearnModuleSearch() {
  const inp = document.getElementById('learn-input-module-search');
  if (inp) inp.value = '';
  learnModuleSearchQuery = '';
  activeLearnModuleCategory = 'all';
  renderLearnModuleCategoryPills();
  renderLearnModulesCatalog();
}

function renderLearnModuleCategoryPills() {
  const container = document.getElementById('learn-module-category-pills');
  if (!container) return;

  const user = AppState.currentUser;
  const isSuperAdmin = user && (user.role === 'admin' || user.email?.toLowerCase() === 'zettbos2025@gmail.com');
  const visibleModules = (AppState.modules || []).filter(m => isSuperAdmin || !m.isDraft);

  const rawCategories = visibleModules
    .map(m => (m.category || '').trim())
    .filter(cat => cat.length > 0);
  const uniqueCategories = Array.from(new Set(rawCategories));

  const categories = [
    { id: 'all', label: 'Semua Modul', count: visibleModules.length },
    ...uniqueCategories.map(cat => ({
      id: cat,
      label: cat,
      count: visibleModules.filter(m => (m.category || '').trim() === cat).length
    }))
  ];

  if (activeLearnModuleCategory !== 'all' && !uniqueCategories.includes(activeLearnModuleCategory)) {
    activeLearnModuleCategory = 'all';
  }

  container.innerHTML = categories.map(cat => {
    const isActive = activeLearnModuleCategory === cat.id;
    const activeClass = isActive
      ? 'is-active bg-emerald-950 text-emerald-300 border-emerald-500/60 shadow-sm'
      : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border-slate-800';

    const safeId = cat.id.replace(/'/g, "\\'");
    return `
      <button 
        type="button" 
        onclick="setLearnModuleCategory('${safeId}')"
        class="category-pill px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${activeClass}"
      >
        <span>${escapeHtml(cat.label)}</span>
        <span class="category-pill-count text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isActive ? 'bg-emerald-900/60 text-emerald-300 font-bold' : 'bg-slate-800 text-slate-500'}">
          ${cat.count}
        </span>
      </button>
    `;
  }).join('');
}

function renderLearnModulesCatalog() {
  const container = document.getElementById('learn-catalog-grid');
  if (!container) return;

  const user = AppState.currentUser;
  const isSuperAdmin = user && (user.role === 'admin' || user.email?.toLowerCase() === 'zettbos2025@gmail.com');
  const userCompletedLessonIds = (user && AppState.progress[user.email]) ? AppState.progress[user.email] : [];

  let filtered = (AppState.modules || []).filter(m => isSuperAdmin || !m.isDraft);

  if (activeLearnModuleCategory !== 'all') {
    filtered = filtered.filter(m => (m.category || '').trim() === activeLearnModuleCategory);
  }

  if (learnModuleSearchQuery) {
    filtered = filtered.filter(m => {
      const titleMatch = (m.title || '').toLowerCase().includes(learnModuleSearchQuery);
      const descMatch = (m.description || '').toLowerCase().includes(learnModuleSearchQuery);
      const lessonsMatch = AppState.lessons.some(l => l.moduleId === m.id && (l.title || '').toLowerCase().includes(learnModuleSearchQuery));
      return titleMatch || descMatch || lessonsMatch;
    });
  }

  filtered.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || (a.orderIndex || 1) - (b.orderIndex || 1));

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-8 rounded-2xl glass-card border border-slate-800 text-center flex flex-col items-center justify-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
        </div>
        <h4 class="text-sm font-bold text-white">Tidak Ada Modul Ditemukan</h4>
        <p class="text-xs text-slate-400">Belum ada modul yang sesuai pencarian atau filter.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  filtered.forEach(mod => {
    const moduleLessons = AppState.lessons.filter(l => l.moduleId === mod.id && (isSuperAdmin || !l.isDraft)).sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    const totalMinutes = moduleLessons.reduce((acc, l) => acc + (l.durationMinutes || 15), 0);
    const modCompleted = moduleLessons.filter(l => userCompletedLessonIds.includes(l.id)).length;
    const completionPercent = moduleLessons.length > 0 ? Math.round((modCompleted / moduleLessons.length) * 100) : 0;
    const isModFullyCompleted = moduleLessons.length > 0 && modCompleted === moduleLessons.length;

    const userFavs = (user && AppState.favorites[user.email]) ? AppState.favorites[user.email] : [];
    const isModFav = userFavs.some(f => f.type === 'module' && f.targetId === mod.id);

    const targetLessonId = (modCompleted > 0
      ? (moduleLessons.find(l => !userCompletedLessonIds.includes(l.id)) || moduleLessons[0])?.id
      : moduleLessons[0]?.id);

    const card = document.createElement('div');
    card.className = 'glass-card glass-card-translucent rounded-2xl overflow-hidden flex flex-col justify-between group transition-all duration-300 border border-slate-800 hover:border-emerald-500/50 cursor-pointer hover:shadow-xl hover:-translate-y-1';

    card.onclick = () => {
      if (mod.isLocked) {
        showToast(mod.lockReason || 'Modul terkunci', 'info');
        return;
      }
      if (targetLessonId) {
        navigate('learn', { lessonId: targetLessonId });
      } else {
        showToast('Modul ini belum memiliki materi', 'info');
      }
    };

    card.innerHTML = `
      <div>
        <!-- Cyber Pill Header & Status Strip (No Image, Fast Load, Pinned Priority) -->
        <div class="relative px-4 sm:px-5 pt-3.5 pb-3 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between gap-2 overflow-hidden">
          <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 opacity-70 group-hover:opacity-100 transition-opacity"></div>
          
          <div class="flex items-center gap-2 flex-wrap">
            ${mod.isPinned ? `
              <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/50 flex items-center gap-1">
                <svg class="w-3 h-3 text-amber-400 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <span>PINNED</span>
              </span>
            ` : ''}
            <span class="px-2.5 py-0.5 rounded text-[10px] font-extrabold tracking-wider font-mono uppercase ${isModFullyCompleted ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 shadow-sm' : 'bg-slate-950 text-cyan-400 border border-cyan-500/40'}">
              ${escapeHtml(mod.badge || 'MODUL')}
            </span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
              ${escapeHtml(mod.category || 'Kurikulum')}
            </span>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold ${modCompleted > 0 ? 'bg-emerald-950/90 text-emerald-400 border border-emerald-500/30' : 'bg-slate-950/80 text-slate-400 border border-slate-800'}">
              ${modCompleted}/${moduleLessons.length} Selesai (${completionPercent}%)
            </span>
          </div>

          <button onclick="event.stopPropagation(); toggleModuleFavorite('${mod.id}')" title="${isModFav ? 'Hapus dari Favorit' : 'Simpan Modul ke Favorit'}" class="btn-card-bookmark p-1.5 rounded-lg ${isModFav ? 'is-active bg-amber-950/90 text-amber-300 border border-amber-500/60' : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'} shadow-sm transition-colors z-10">
            <svg class="w-3.5 h-3.5 ${isModFav ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
          </button>
        </div>

        <div class="p-4 sm:p-5 pb-3">
          <h3 class="font-black text-lg sm:text-xl text-white group-hover:text-emerald-400 transition-colors leading-tight tracking-tight mb-2.5 line-clamp-2">
            ${escapeHtml(mod.title)}
          </h3>
          <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3.5">
            ${escapeHtml(mod.description || 'Modul pembelajaran terstruktur web app AI bersama mentor Zettbos.')}
          </p>

          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-caps mb-2 flex items-center justify-between">
            <span>Materi di Modul Ini:</span>
            <span class="font-mono text-slate-500">${moduleLessons.length} Materi</span>
          </div>
          
          <div class="max-h-36 overflow-y-auto custom-scrollbar surface-well p-1 space-y-1 mb-2">
            ${moduleLessons.map((les, idx) => {
              const isDone = userCompletedLessonIds.includes(les.id);
              return `
                <div 
                  onclick="event.stopPropagation(); navigate('learn', { lessonId: '${les.id}' })"
                  class="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800/70 transition-colors cursor-pointer border border-transparent"
                >
                  <div class="flex items-center gap-2 truncate">
                    ${isDone 
                      ? '<svg class="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M5 13l4 4L19 7"/></svg>' 
                      : '<svg class="w-3.5 h-3.5 text-slate-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="6" stroke-width="1.8"/></svg>'}
                    <span class="truncate ${isDone ? 'text-emerald-300 font-medium' : 'text-slate-300'}">${idx + 1}. ${escapeHtml(les.title)}</span>
                  </div>
                  <span class="text-[10px] font-mono text-slate-500 flex-shrink-0">${les.durationMinutes || 15}m</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <div class="px-4 sm:p-5 pt-3 pb-4 border-t border-slate-800/80 mt-auto flex items-center justify-between gap-2">
        <span class="text-[11px] text-slate-400 font-mono">
          ${moduleLessons.length} Materi • ${totalMinutes} Menit
        </span>
        <button 
          onclick="event.stopPropagation(); ${targetLessonId ? `navigate('learn', { lessonId: '${targetLessonId}' })` : `showToast('Modul belum memiliki materi', 'info')`}" 
          class="btn-primary-action px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
        >
          <span>${modCompleted > 0 ? 'Lanjutkan' : 'Masuk Modul'}</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

function showLearnModulesCatalog() {
  const catalogView = document.getElementById('learn-catalog-view');
  const playerSubnav = document.getElementById('learn-player-subnav');
  const playerView = document.getElementById('learn-player-view');

  if (catalogView) catalogView.classList.remove('hidden');
  if (playerSubnav) playerSubnav.classList.add('hidden');
  if (playerView) playerView.classList.add('hidden');

  const centerLabel = document.getElementById('nav-current-page-label');
  if (centerLabel) centerLabel.textContent = 'Modul Pembelajaran';

  renderLearnModuleCategoryPills();
  renderLearnModulesCatalog();
}

/**
 * Returns all active curriculum lessons in strict sequence across all modules.
 * Sorted by module.orderIndex ASC, then lesson.orderIndex ASC.
 * Enables seamless cross-module navigation (e.g. last lesson of Modul 1 -> first lesson of Modul 2).
 */
function getCurriculumOrderedLessons() {
  const user = AppState.currentUser;
  const isSuperAdmin = user && (user.role === 'admin' || user.email?.toLowerCase() === 'zettbos2025@gmail.com');

  const sortedModules = (AppState.modules || [])
    .filter(m => isSuperAdmin || !m.isDraft)
    .sort((a, b) => (Number(a.orderIndex) || 0) - (Number(b.orderIndex) || 0));

  const orderedLessons = [];
  const handledIds = new Set();

  sortedModules.forEach(mod => {
    const modLessons = (AppState.lessons || [])
      .filter(l => l.moduleId === mod.id && (isSuperAdmin || !l.isDraft))
      .sort((a, b) => (Number(a.orderIndex) || 0) - (Number(b.orderIndex) || 0));

    modLessons.forEach(l => {
      orderedLessons.push(l);
      handledIds.add(l.id);
    });
  });

  // Include any orphan lessons not assigned to sorted modules (if any)
  (AppState.lessons || [])
    .filter(l => !handledIds.has(l.id) && (isSuperAdmin || !l.isDraft))
    .sort((a, b) => (Number(a.orderIndex) || 0) - (Number(b.orderIndex) || 0))
    .forEach(l => orderedLessons.push(l));

  return orderedLessons;
}

function renderLearningRoom(lessonId) {
  const catalogView = document.getElementById('learn-catalog-view');
  const playerSubnav = document.getElementById('learn-player-subnav');
  const playerView = document.getElementById('learn-player-view');

  if (catalogView) catalogView.classList.add('hidden');
  if (playerSubnav) playerSubnav.classList.remove('hidden');
  if (playerView) playerView.classList.remove('hidden');

  const lesson = AppState.lessons.find(l => l.id === lessonId) || AppState.lessons[0];
  if (!lesson) {
    showToast('Materi tidak ditemukan', 'error');
    showLearnModulesCatalog();
    return;
  }

  const user = AppState.currentUser;
  const isSuperAdmin = user && (user.role === 'admin' || user.email?.toLowerCase() === 'zettbos2025@gmail.com');
  if (lesson.isDraft && !isSuperAdmin) {
    showToast('Materi ini masih berupa draf dan belum dipublikasikan oleh mentor ke Supabase.', 'info');
    showLearnModulesCatalog();
    return;
  }

  AppState.currentLessonId = lesson.id;
  if (user && user.email) {
    try {
      localStorage.setItem(`zett_last_lesson_${user.email}`, lesson.id);
    } catch (e) {}

    // Pull student progress from cloud if not yet hydrated this session (Multi-device continuity)
    if (!window._userProgressHydrated) {
      window._userProgressHydrated = true;
      if (typeof window.pullMemberProgress === 'function') {
        window.pullMemberProgress(user.email).then(merged => {
          if (merged && AppState.currentLessonId) {
            updateStreamNavigationButtons(AppState.currentLessonId);
            renderCurriculumSidebar(AppState.currentLessonId);
            if (typeof updateHomeProgressCard === 'function') updateHomeProgressCard();
          }
        }).catch(e => console.warn('[Classroom Pull Progress Warning]', e));
      }
    }
  }
  const userCompleted = (user && AppState.progress[user.email]) ? AppState.progress[user.email] : [];
  const isLessonCompleted = userCompleted.includes(lesson.id);

  const parentModule = AppState.modules.find(m => m.id === lesson.moduleId);
  const modBadge = document.getElementById('learn-module-badge');
  const lesTitle = document.getElementById('learn-lesson-title');
  const durBadge = document.getElementById('learn-duration-badge');

  if (modBadge) modBadge.textContent = parentModule ? parentModule.title : 'Modul Pembelajaran';
  if (lesTitle) lesTitle.textContent = lesson.title;
  if (durBadge) durBadge.textContent = `${lesson.durationMinutes || 15} Menit`;

  AppState.renderedLessonIds = [lesson.id];

  const contentContainer = document.getElementById('learn-notion-content');
  if (contentContainer) {
    let blocksToRender = Array.isArray(lesson.blocks) ? [...lesson.blocks] : [];
    const hasVideoBlock = blocksToRender.some(b => b.type === 'video');
    if (!hasVideoBlock && (lesson.videoUrl || lesson.youtubeUrl || lesson.youtubeEmbedId)) {
      const url = lesson.videoUrl || lesson.youtubeUrl || `https://www.youtube.com/watch?v=${lesson.youtubeEmbedId}`;
      blocksToRender = [{ type: 'video', url }, ...blocksToRender];
    }
    contentContainer.innerHTML = `
      <div id="lesson-segment-${lesson.id}" class="lesson-stream-segment" data-lesson-id="${lesson.id}">
        <div class="lesson-segment-content">
          ${renderBlocksToHtml(blocksToRender)}
        </div>
      </div>
    `;
  }

  const userFavs = (user && AppState.favorites[user.email]) ? AppState.favorites[user.email] : [];
  const isLessonFav = userFavs.some(f => f.type === 'lesson' && f.targetId === lesson.id);
  const favBtn = document.getElementById('btn-toggle-favorite-lesson');
  const favLabel = document.getElementById('fav-btn-label');
  if (favBtn && favLabel) {
    if (isLessonFav) {
      favLabel.textContent = 'Tersimpan';
      favBtn.className = 'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-amber-950/70 text-amber-300 border border-amber-500/60 shadow-sm transition-all';
    } else {
      favLabel.textContent = 'Simpan';
      favBtn.className = 'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all';
    }
  }

  updateStreamNavigationButtons(lesson.id);
  renderCurriculumSidebar(lesson.id);
}

/**
 * Updates the navigation buttons (top subnav, reading footer, complete toggle)
 * to reflect the latest active lesson in the stream.
 */
function updateStreamNavigationButtons(activeLessonId) {
  const orderedLessons = getCurriculumOrderedLessons();
  const currentIndex = orderedLessons.findIndex(l => l.id === activeLessonId);
  const currentLesson = orderedLessons[currentIndex] || AppState.lessons.find(l => l.id === activeLessonId);
  if (!currentLesson) return;

  const prevLesson = currentIndex > 0 ? orderedLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < orderedLessons.length - 1 ? orderedLessons[currentIndex + 1] : null;

  const user = AppState.currentUser;
  const userCompleted = (user && AppState.progress[user.email]) ? AppState.progress[user.email] : [];
  const isLessonCompleted = userCompleted.includes(currentLesson.id);

  const parentModule = AppState.modules.find(m => m.id === currentLesson.moduleId);
  const lesTitle = document.getElementById('learn-lesson-title');
  const durBadge = document.getElementById('learn-duration-badge');
  const modBadge = document.getElementById('learn-module-badge');

  if (lesTitle) lesTitle.textContent = currentLesson.title;
  if (durBadge) durBadge.textContent = `${currentLesson.durationMinutes || 15} Menit`;
  if (modBadge && parentModule) modBadge.textContent = parentModule.title;

  const btnPrev = document.getElementById('btn-prev-lesson');
  const btnNext = document.getElementById('btn-next-lesson');
  const btnFooterPrev = document.getElementById('btn-footer-prev-lesson');
  const btnFooterNext = document.getElementById('btn-footer-next-lesson');
  const btnFooterComplete = document.getElementById('btn-footer-complete');
  const btnToggleComplete = document.getElementById('btn-toggle-complete');

  if (btnPrev) {
    btnPrev.disabled = !prevLesson;
    btnPrev.onclick = () => goToAdjacentLesson(-1);
    btnPrev.title = prevLesson ? `Sebelumnya: ${prevLesson.title}` : 'Materi pertama';
  }

  if (btnNext) {
    btnNext.disabled = !nextLesson;
    btnNext.onclick = () => handleNextLessonWithConfirm();
    btnNext.title = nextLesson ? `Lanjut: ${nextLesson.title}` : 'Materi terakhir';
  }

  if (btnFooterPrev) {
    btnFooterPrev.disabled = !prevLesson;
    if (prevLesson) {
      const prevMod = AppState.modules.find(m => m.id === prevLesson.moduleId);
      const isDiffMod = prevMod && prevMod.id !== currentLesson.moduleId;
      btnFooterPrev.innerHTML = isDiffMod
        ? `&larr; <span class="hidden sm:inline">${escapeHtml(prevMod.title)} &bull;</span> Materi Sebelumnya`
        : `&larr; Materi Sebelumnya`;
      btnFooterPrev.title = prevLesson.title;
    } else {
      btnFooterPrev.innerHTML = `&larr; Materi Sebelumnya`;
    }
  }

  if (btnFooterNext) {
    btnFooterNext.disabled = !nextLesson;
    if (nextLesson) {
      const nextMod = AppState.modules.find(m => m.id === nextLesson.moduleId);
      const isDiffMod = nextMod && nextMod.id !== currentLesson.moduleId;
      btnFooterNext.innerHTML = isDiffMod
        ? `<span class="hidden sm:inline">Lanjut: ${escapeHtml(nextMod.title)} &bull;</span> Materi Berikutnya &rarr;`
        : `Materi Berikutnya &rarr;`;
      btnFooterNext.title = nextLesson.title;
      btnFooterNext.onclick = () => handleNextLessonWithConfirm();
    } else {
      btnFooterNext.innerHTML = `Materi Terakhir Selesai`;
    }
  }

  if (btnFooterComplete) {
    btnFooterComplete.innerHTML = isLessonCompleted
      ? '<svg class="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg><span>Materi Selesai</span>'
      : '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg><span>Selesai & Lanjut</span>';
    btnFooterComplete.onclick = () => advanceToNextLesson(true);
  }

  if (btnToggleComplete) {
    if (isLessonCompleted) {
      btnToggleComplete.innerHTML = `
        <svg class="w-5 h-5 text-emerald-400 animate-pulse-check" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
        <span>Materi Selesai</span>
      `;
      btnToggleComplete.className = 'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-900/60 transition-all';
    } else {
      btnToggleComplete.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
        <span>Tandai Selesai & Lanjut</span>
      `;
      btnToggleComplete.className = 'btn-primary-action flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold';
    }
    btnToggleComplete.onclick = () => advanceToNextLesson(true);
  }

  // Update Zen Focus Mode Top Floating Bar (Revisi 96)
  const zenTitle = document.getElementById('zen-floating-title');
  const zenMod = document.getElementById('zen-floating-module');
  const zenPrev = document.getElementById('zen-floating-prev');
  const zenNext = document.getElementById('zen-floating-next');

  if (zenTitle) zenTitle.textContent = currentLesson.title;
  if (zenMod) zenMod.textContent = parentModule ? parentModule.title : 'Modul Kursus';
  if (zenPrev) {
    zenPrev.disabled = !prevLesson;
    zenPrev.onclick = () => goToAdjacentLesson(-1);
    zenPrev.title = prevLesson ? `Sebelumnya: ${prevLesson.title}` : 'Materi pertama';
  }
  if (zenNext) {
    zenNext.onclick = () => advanceToNextLesson(true);
  }
}

/**
 * Confirmation Interceptor before advancing to next lesson (Revisi 90):
 * If the current lesson is not yet marked complete, presents an elegant confirmation dialog.
 */
function handleNextLessonWithConfirm() {
  const user = AppState.currentUser;
  const currentLesson = AppState.lessons.find(l => l.id === AppState.currentLessonId);
  if (!currentLesson) {
    advanceToNextLesson(false);
    return;
  }

  const userProgress = (user && AppState.progress[user.email]) ? AppState.progress[user.email] : [];
  const isLessonCompleted = userProgress.includes(currentLesson.id);

  if (!isLessonCompleted) {
    openNextLessonConfirmModal(currentLesson);
  } else {
    advanceToNextLesson(false);
  }
}

function openNextLessonConfirmModal(lesson) {
  const modal = document.getElementById('modal-next-lesson-confirm');
  if (!modal) {
    if (typeof showCustomConfirm === 'function') {
      showCustomConfirm({
        title: 'Tandai Materi Selesai?',
        message: `Apakah Anda ingin menandai materi "${lesson.title}" sebagai selesai sebelum lanjut ke episode berikutnya?`,
        confirmText: 'Ya, Tandai Selesai & Lanjut',
        cancelText: 'Lanjut Tanpa Menandai',
        isDanger: false,
        onConfirm: () => advanceToNextLesson(true)
      });
    } else {
      advanceToNextLesson(false);
    }
    return;
  }

  const titleEl = document.getElementById('next-confirm-lesson-title');
  if (titleEl) titleEl.textContent = lesson.title || 'Materi Saat Ini';

  modal.classList.remove('hidden');
}

function closeNextLessonConfirmModal() {
  const modal = document.getElementById('modal-next-lesson-confirm');
  if (modal) modal.classList.add('hidden');
}

function confirmNextLessonAction(shouldMarkComplete) {
  closeNextLessonConfirmModal();
  advanceToNextLesson(shouldMarkComplete);
}

/**
 * Continuous Stream Advance Logic:
 * In the same module, appends next lesson vertically below.
 * When crossing to next module, cleanly switches page to Module N+1 Lesson 1.
 */
function advanceToNextLesson(isMarkComplete = false) {
  const user = AppState.currentUser;
  const orderedLessons = getCurriculumOrderedLessons();
  const currentLesson = AppState.lessons.find(l => l.id === AppState.currentLessonId);
  if (!currentLesson) return;

  const currentIndex = orderedLessons.findIndex(l => l.id === currentLesson.id);
  if (currentIndex === -1) return;

  // 1. Mark complete if requested
  if (isMarkComplete && user) {
    if (!AppState.progress[user.email]) {
      AppState.progress[user.email] = [];
    }
    if (!AppState.progress[user.email].includes(currentLesson.id)) {
      AppState.progress[user.email].push(currentLesson.id);

      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;
      if (!AppState.activity) AppState.activity = {};
      if (!AppState.activity[user.email]) AppState.activity[user.email] = { studiedDates: [] };
      if (!Array.isArray(AppState.activity[user.email].studiedDates)) AppState.activity[user.email].studiedDates = [];
      if (!AppState.activity[user.email].studiedDates.includes(todayStr)) {
        AppState.activity[user.email].studiedDates.push(todayStr);
      }
      saveState();

      // Push progress to Supabase Cloud asynchronously (Multi-device & Admin Realtime Sync)
      if (typeof window.pushMemberLessonProgress === 'function') {
        window.pushMemberLessonProgress(user.email, currentLesson.id);
      } else if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
        ZettSupabase.pushMemberLessonProgress(user.email, currentLesson.id);
      }

      // Push study activity to Supabase Cloud (Gambar 1 - Revisi 102)
      if (typeof window.pushMemberActivity === 'function') {
        window.pushMemberActivity(user.email, todayStr);
      } else if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
        ZettSupabase.pushMemberActivity(user.email, todayStr);
      }

      // Dopamine Micro-Reward Animation (Gambar 2 & Neuro-Pedagogy)
      const actionBtn = document.getElementById('btn-next-lesson') || document.getElementById('btn-footer-next-lesson') || document.getElementById('btn-toggle-complete-lesson');
      if (actionBtn) {
        actionBtn.classList.add('dopamine-ripple');
        setTimeout(() => actionBtn.classList.remove('dopamine-ripple'), 700);
      }
      showToast('🎉 Hebat! Materi berhasil diselesaikan!', 'success');
    }
  }

  // 2. Check if reached end of curriculum
  if (currentIndex >= orderedLessons.length - 1) {
    showToast('Selamat! Anda telah menyelesaikan seluruh kurikulum materi.', 'success');
    updateStreamNavigationButtons(currentLesson.id);
    renderCurriculumSidebar(currentLesson.id);
    return;
  }

  const nextLesson = orderedLessons[currentIndex + 1];

  // Case A: Next lesson is in the SAME module -> APPEND VERTICALLY DOWNWARD!
  if (nextLesson.moduleId === currentLesson.moduleId) {
    if (!Array.isArray(AppState.renderedLessonIds)) {
      AppState.renderedLessonIds = [currentLesson.id];
    }

    const contentContainer = document.getElementById('learn-notion-content');
    let existingSegment = document.getElementById(`lesson-segment-${nextLesson.id}`);

    if (!existingSegment && contentContainer) {
      AppState.renderedLessonIds.push(nextLesson.id);

      let blocksToRender = Array.isArray(nextLesson.blocks) ? [...nextLesson.blocks] : [];
      const hasVideoBlock = blocksToRender.some(b => b.type === 'video');
      if (!hasVideoBlock && (nextLesson.videoUrl || nextLesson.youtubeUrl || nextLesson.youtubeEmbedId)) {
        const url = nextLesson.videoUrl || nextLesson.youtubeUrl || `https://www.youtube.com/watch?v=${nextLesson.youtubeEmbedId}`;
        blocksToRender = [{ type: 'video', url }, ...blocksToRender];
      }

      const segment = document.createElement('div');
      segment.id = `lesson-segment-${nextLesson.id}`;
      segment.className = 'lesson-stream-segment mt-12 pt-8 border-t border-slate-800/80 scroll-mt-20';
      segment.dataset.lessonId = nextLesson.id;
      segment.innerHTML = `
        <div class="flex items-center gap-2 mb-3">
          <span class="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 font-mono">
            ${nextLesson.durationMinutes || 10} Menit
          </span>
          <span class="text-xs text-slate-400 font-medium">Lanjutan Materi</span>
        </div>
        <h2 class="text-xl sm:text-2xl font-extrabold text-white mb-6 tracking-tight">
          ${escapeHtml(nextLesson.title)}
        </h2>
        <div class="lesson-segment-content">
          ${renderBlocksToHtml(blocksToRender)}
        </div>
      `;
      contentContainer.appendChild(segment);
      existingSegment = segment;
    }

    AppState.currentLessonId = nextLesson.id;
    updateStreamNavigationButtons(nextLesson.id);
    renderCurriculumSidebar(nextLesson.id);

    if (existingSegment) {
      setTimeout(() => {
        existingSegment.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }

    showToast(`Membuka: ${nextLesson.title}`, 'info');
  } else {
    // Case B: Next lesson is in a DIFFERENT module -> CLEAN SWITCH PAGE (as requested by user!)
    const nextMod = AppState.modules.find(m => m.id === nextLesson.moduleId);
    showToast(`Lanjut ke Modul: ${nextMod ? nextMod.title : 'Selanjutnya'}`, 'info');
    renderLearningRoom(nextLesson.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function renderCurriculumSidebar(activeLessonId) {
  const desktopSidebar = document.getElementById('learn-curriculum-sidebar');
  const mobileTree = document.getElementById('mobile-curriculum-tree');
  const countBadge = document.getElementById('learn-curriculum-count');

  const user = AppState.currentUser;
  const isSuperAdmin = user && (user.role === 'admin' || user.email?.toLowerCase() === 'zettbos2025@gmail.com');
  const visibleLessons = AppState.lessons.filter(l => isSuperAdmin || !l.isDraft);
  const userCompleted = (user && AppState.progress[user.email]) ? AppState.progress[user.email] : [];

  if (countBadge) {
    countBadge.textContent = `${userCompleted.length}/${visibleLessons.length} Selesai`;
  }

  if (desktopSidebar) desktopSidebar.innerHTML = '';
  if (mobileTree) mobileTree.innerHTML = '';

  AppState.modules.filter(m => isSuperAdmin || !m.isDraft).sort((a, b) => a.orderIndex - b.orderIndex).forEach(mod => {
    const modLessons = AppState.lessons.filter(l => l.moduleId === mod.id && (isSuperAdmin || !l.isDraft));
    if (modLessons.length === 0) return;

    const modCompletedCount = modLessons.filter(l => userCompleted.includes(l.id)).length;

    if (desktopSidebar) {
      const modWrapper = document.createElement('div');
      modWrapper.className = 'mb-4';

      const modHeader = document.createElement('div');
      modHeader.className = 'px-3 py-2 text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center justify-between group overflow-hidden';
      modHeader.title = mod.title;
      modHeader.innerHTML = `
        <div class="marquee-hover-wrapper mr-2">
          <span class="marquee-hover-track">${escapeHtml(mod.title)}</span>
        </div>
        <span class="text-[10px] text-slate-500 font-normal flex-shrink-0 font-mono">${modCompletedCount}/${modLessons.length}</span>
      `;
      modHeader.addEventListener('mouseenter', () => {
        const track = modHeader.querySelector('.marquee-hover-track');
        const wrapper = modHeader.querySelector('.marquee-hover-wrapper');
        if (track && wrapper && track.scrollWidth > wrapper.clientWidth) {
          const overflowPx = track.scrollWidth - wrapper.clientWidth + 16;
          track.style.setProperty('--marquee-distance', `-${overflowPx}px`);
          track.classList.add('is-overflowing');
        }
      });
      modHeader.addEventListener('mouseleave', () => {
        const track = modHeader.querySelector('.marquee-hover-track');
        if (track) track.classList.remove('is-overflowing');
      });
      modWrapper.appendChild(modHeader);

      const lessonList = document.createElement('div');
      lessonList.className = 'space-y-1 mt-1';

      modLessons.sort((a, b) => a.orderIndex - b.orderIndex).forEach(l => {
        const isActive = l.id === activeLessonId;
        const isDone = userCompleted.includes(l.id);

        const item = document.createElement('button');
        item.type = 'button';
        item.className = `w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between gap-2.5 transition-all group overflow-hidden ${isActive
            ? 'active-sidebar-lesson bg-slate-800/90 text-white font-semibold border-l-4 border-emerald-500 shadow-sm'
            : 'text-slate-300 hover:bg-slate-850 hover:text-white'
          }`;
        item.onclick = () => renderLearningRoom(l.id);
        item.title = l.title;

        item.innerHTML = `
          <div class="flex items-center gap-2.5 flex-1 min-w-0 overflow-hidden">
            <div class="flex-shrink-0 ${isDone ? 'text-emerald-400' : 'text-slate-600'}">
              ${isDone ? `
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
              ` : `
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke-width="2"/></svg>
              `}
            </div>
            <div class="marquee-hover-wrapper">
              <span class="marquee-hover-track font-medium">${escapeHtml(l.title)}</span>
            </div>
          </div>
          <span class="text-[10px] text-slate-500 flex-shrink-0 ml-1.5 font-mono">${l.durationMinutes || 10}m</span>
        `;

        item.addEventListener('mouseenter', () => {
          const track = item.querySelector('.marquee-hover-track');
          const wrapper = item.querySelector('.marquee-hover-wrapper');
          if (track && wrapper && track.scrollWidth > wrapper.clientWidth) {
            const overflowPx = track.scrollWidth - wrapper.clientWidth + 16;
            track.style.setProperty('--marquee-distance', `-${overflowPx}px`);
            track.classList.add('is-overflowing');
          }
        });
        item.addEventListener('mouseleave', () => {
          const track = item.querySelector('.marquee-hover-track');
          if (track) track.classList.remove('is-overflowing');
        });

        lessonList.appendChild(item);
      });

      modWrapper.appendChild(lessonList);
      desktopSidebar.appendChild(modWrapper);
    }

    if (mobileTree) {
      const mWrapper = document.createElement('div');
      mWrapper.className = 'p-3 rounded-xl bg-slate-900/60 border border-slate-800';

      const mHeader = document.createElement('div');
      mHeader.className = 'text-xs font-bold text-slate-300 pb-2 mb-2 border-b border-slate-800/80 flex items-center justify-between group overflow-hidden';
      mHeader.title = mod.title;
      mHeader.innerHTML = `
        <div class="marquee-hover-wrapper mr-2">
          <span class="marquee-hover-track">${escapeHtml(mod.title)}</span>
        </div>
        <span class="text-[10px] text-emerald-400 font-mono flex-shrink-0">${modCompletedCount}/${modLessons.length}</span>
      `;
      mWrapper.appendChild(mHeader);

      const mLessonList = document.createElement('div');
      mLessonList.className = 'space-y-1.5';

      modLessons.sort((a, b) => a.orderIndex - b.orderIndex).forEach(l => {
        const isActive = l.id === activeLessonId;
        const isDone = userCompleted.includes(l.id);

        const mItem = document.createElement('button');
        mItem.type = 'button';
        mItem.className = `w-full text-left p-2.5 rounded-lg text-xs flex items-center justify-between gap-2.5 transition-all group overflow-hidden ${isActive
            ? 'active-sidebar-lesson bg-slate-800 text-white font-bold border-l-4 border-emerald-500'
            : 'text-slate-300 hover:bg-slate-850 hover:text-white'
          }`;
        mItem.onclick = () => {
          renderLearningRoom(l.id);
          closeMobileCurriculumDrawer();
        };
        mItem.title = l.title;

        mItem.innerHTML = `
          <div class="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
            <span class="${isDone ? 'text-emerald-400' : 'text-slate-600'} flex-shrink-0">
              ${isDone ? `
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
              ` : `
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke-width="2"/></svg>
              `}
            </span>
            <div class="marquee-hover-wrapper">
              <span class="marquee-hover-track font-medium">${escapeHtml(l.title)}</span>
            </div>
          </div>
          <span class="text-[10px] text-slate-500 font-mono flex-shrink-0 ml-1.5">${l.durationMinutes || 10}m</span>
        `;

        mItem.addEventListener('mouseenter', () => {
          const track = mItem.querySelector('.marquee-hover-track');
          const wrapper = mItem.querySelector('.marquee-hover-wrapper');
          if (track && wrapper && track.scrollWidth > wrapper.clientWidth) {
            const overflowPx = track.scrollWidth - wrapper.clientWidth + 16;
            track.style.setProperty('--marquee-distance', `-${overflowPx}px`);
            track.classList.add('is-overflowing');
          }
        });
        mItem.addEventListener('mouseleave', () => {
          const track = mItem.querySelector('.marquee-hover-track');
          if (track) track.classList.remove('is-overflowing');
        });

        mLessonList.appendChild(mItem);
      });

      mWrapper.appendChild(mLessonList);
      mobileTree.appendChild(mWrapper);
    }
  });

  // Auto-scroll active item into view inside desktop curriculum sidebar smoothly
  setTimeout(() => {
    const activeEl = desktopSidebar ? desktopSidebar.querySelector('.active-sidebar-lesson') : null;
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, 100);
}

function toggleLessonCompletion(lessonId) {
  const user = AppState.currentUser;
  if (!user) return;

  if (!AppState.progress[user.email]) {
    AppState.progress[user.email] = [];
  }

  const list = AppState.progress[user.email];
  const idx = list.indexOf(lessonId);

  if (idx > -1) {
    list.splice(idx, 1);
    saveState();

    // Remove from Supabase Cloud asynchronously
    if (typeof window.removeMemberLessonProgress === 'function') {
      window.removeMemberLessonProgress(user.email, lessonId);
    } else if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
      ZettSupabase.removeMemberLessonProgress(user.email, lessonId);
    }

    showToast('Status materi dikembalikan ke Belum Selesai', 'info');
    updateStreamNavigationButtons(lessonId);
    renderCurriculumSidebar(lessonId);
    if (typeof updateHomeProgressCard === 'function') updateHomeProgressCard();
  } else {
    if (AppState.currentLessonId === lessonId) {
      advanceToNextLesson(true);
    } else {
      list.push(lessonId);

      // Record activity for today (Gambar 1 - Revisi 102)
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      if (!AppState.activity) AppState.activity = {};
      if (!AppState.activity[user.email]) AppState.activity[user.email] = { studiedDates: [] };
      if (!Array.isArray(AppState.activity[user.email].studiedDates)) AppState.activity[user.email].studiedDates = [];
      if (!AppState.activity[user.email].studiedDates.includes(todayStr)) {
        AppState.activity[user.email].studiedDates.push(todayStr);
      }
      saveState();

      // Push progress to Supabase Cloud asynchronously
      if (typeof window.pushMemberLessonProgress === 'function') {
        window.pushMemberLessonProgress(user.email, lessonId);
      } else if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
        ZettSupabase.pushMemberLessonProgress(user.email, lessonId);
      }

      // Push study activity to Supabase Cloud
      if (typeof window.pushMemberActivity === 'function') {
        window.pushMemberActivity(user.email, todayStr);
      } else if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
        ZettSupabase.pushMemberActivity(user.email, todayStr);
      }

      showToast('🎉 Hebat! Materi berhasil diselesaikan!', 'success');
      updateStreamNavigationButtons(lessonId);
      renderCurriculumSidebar(lessonId);
      if (typeof updateHomeProgressCard === 'function') updateHomeProgressCard();
    }
  }
}

// ==========================================
// ==========================================
// 5. MOBILE CURRICULUM DRAWER (Floating Pill Removed in Revisi 97)
// ==========================================

function handleFloatingNextLesson() {
  handleNextLessonWithConfirm();
}

function setupFloatingPillScrollListener() {
  // Deprecated in Revisi 97 in favor of calm reading card & Zen Focus Mode
}

function openMobileCurriculumDrawer() {
  const modal = document.getElementById('modal-mobile-curriculum');
  if (modal) modal.classList.remove('hidden');
}

function closeMobileCurriculumDrawer() {
  const modal = document.getElementById('modal-mobile-curriculum');
  if (modal) modal.classList.add('hidden');
}

function dismissFloatingPill() {
  // Deprecated in Revisi 97
}

function goToAdjacentLesson(direction) {
  if (direction > 0) {
    advanceToNextLesson(false);
  } else {
    const orderedLessons = getCurriculumOrderedLessons();
    const currentIndex = orderedLessons.findIndex(l => l.id === AppState.currentLessonId);
    if (currentIndex <= 0) return;

    const prevLesson = orderedLessons[currentIndex - 1];
    const currentLesson = orderedLessons[currentIndex];

    const prevSegment = document.getElementById(`lesson-segment-${prevLesson.id}`);
    if (prevSegment && prevLesson.moduleId === currentLesson.moduleId) {
      AppState.currentLessonId = prevLesson.id;
      updateStreamNavigationButtons(prevLesson.id);
      renderCurriculumSidebar(prevLesson.id);
      prevSegment.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      renderLearningRoom(prevLesson.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}

function toggleCurrentLessonCompletion() {
  advanceToNextLesson(true);
}

// ==========================================
// 6. FAVORITES COLLECTION SYSTEM
// ==========================================

function getUserFavorites() {
  const user = AppState.currentUser;
  if (!user) return [];
  if (!Array.isArray(AppState.favorites[user.email])) {
    AppState.favorites[user.email] = [];
  }
  return AppState.favorites[user.email];
}

function toggleCurrentLessonFavorite() {
  const user = AppState.currentUser;
  if (!user) {
    showToast('Silakan login terlebih dahulu', 'error');
    return;
  }

  const lesson = AppState.lessons.find(l => l.id === AppState.currentLessonId);
  if (!lesson) return;

  const userFavs = getUserFavorites();
  const existingIndex = userFavs.findIndex(f => f.type === 'lesson' && f.targetId === lesson.id);
  const parentModule = AppState.modules.find(m => m.id === lesson.moduleId);

  if (existingIndex > -1) {
    const removedFav = userFavs[existingIndex];
    userFavs.splice(existingIndex, 1);
    saveState();
    if (typeof window.deleteMemberFavorite === 'function') {
      window.deleteMemberFavorite(user.email, removedFav.id);
    }
    showToast('Materi dihapus dari Favorit', 'info');
  } else {
    const newFav = {
      id: generateFormattedId('FAV', userFavs, 2),
      type: 'lesson',
      targetId: lesson.id,
      title: lesson.title,
      subtitle: parentModule ? parentModule.title : 'Modul Pembelajaran',
      durationMinutes: lesson.durationMinutes || 15,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      createdAt: new Date().toISOString()
    };
    userFavs.unshift(newFav);
    saveState();
    if (typeof window.pushMemberFavorite === 'function') {
      window.pushMemberFavorite(user.email, newFav);
    }
    showToast('Materi berhasil disimpan ke Favorit', 'success');
  }

  renderLearningRoom(lesson.id);
}

function toggleModuleFavorite(moduleId) {
  const user = AppState.currentUser;
  if (!user) {
    showToast('Silakan login terlebih dahulu', 'error');
    return;
  }

  const mod = AppState.modules.find(m => m.id === moduleId);
  if (!mod) return;

  const userFavs = getUserFavorites();
  const existingIndex = userFavs.findIndex(f => f.type === 'module' && f.targetId === mod.id);

  if (existingIndex > -1) {
    const removedFav = userFavs[existingIndex];
    userFavs.splice(existingIndex, 1);
    saveState();
    if (typeof window.deleteMemberFavorite === 'function') {
      window.deleteMemberFavorite(user.email, removedFav.id);
    }
    showToast(`Modul "${mod.title.slice(0, 20)}..." dihapus dari Favorit`, 'info');
  } else {
    const newFav = {
      id: generateFormattedId('FAV', userFavs, 2),
      type: 'module',
      targetId: mod.id,
      title: mod.title,
      subtitle: `${AppState.lessons.filter(l => l.moduleId === mod.id).length} Video Tutorial`,
      coverImage: mod.coverImage,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      createdAt: new Date().toISOString()
    };
    userFavs.unshift(newFav);
    saveState();
    if (typeof window.pushMemberFavorite === 'function') {
      window.pushMemberFavorite(user.email, newFav);
    }
    showToast(`Modul "${mod.title.slice(0, 20)}..." disimpan ke Favorit`, 'success');
  }

  if (AppState.currentView === 'home') renderHome();
  if (AppState.currentView === 'favorites') renderFavorites();
}

function saveSnippetToFavorites(codeId, language) {
  const user = AppState.currentUser;
  if (!user) {
    showToast('Silakan login terlebih dahulu', 'error');
    return;
  }

  const codeEl = document.getElementById(codeId);
  const codeContent = codeEl ? codeEl.innerText.trim() : '';
  if (!codeContent) {
    showToast('Gagal menyalin snippet kode', 'error');
    return;
  }

  const currentLesson = AppState.lessons.find(l => l.id === AppState.currentLessonId);
  const parentModule = currentLesson ? AppState.modules.find(m => m.id === currentLesson.moduleId) : null;

  const userFavs = getUserFavorites();
  const newFav = {
    id: generateFormattedId('FAV', userFavs, 2),
    type: 'snippet',
    targetId: AppState.currentLessonId,
    title: `Snippet ${(language || 'CODE').toUpperCase()} • ${currentLesson ? currentLesson.title : 'Materi'}`,
    subtitle: parentModule ? parentModule.title : 'Materi Pembelajaran',
    language: language || 'javascript',
    content: codeContent,
    date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    createdAt: new Date().toISOString()
  };
  userFavs.unshift(newFav);

  saveState();
  if (typeof window.pushMemberFavorite === 'function') {
    window.pushMemberFavorite(user.email, newFav);
  }
  showToast('Snippet kode berhasil disimpan ke Favorit', 'success');
}

function removeFavorite(favId) {
  const user = AppState.currentUser;
  const userFavs = getUserFavorites();
  const idx = userFavs.findIndex(f => f.id === favId);
  if (idx > -1) {
    const removedFav = userFavs[idx];
    userFavs.splice(idx, 1);
    saveState();
    if (user && typeof window.deleteMemberFavorite === 'function') {
      window.deleteMemberFavorite(user.email, removedFav.id);
    }
    showToast('Item favorit telah dihapus', 'info');
    renderFavorites();
    if (AppState.currentView === 'learn') {
      renderLearningRoom(AppState.currentLessonId);
    }
  }
}

function filterFavorites(tabType) {
  AppState.activeFavoritesTab = tabType;
  renderFavorites();
}

function handleSearchFavorites() {
  const input = document.getElementById('fav-search-input');
  AppState.favoritesSearchQuery = input ? input.value.trim().toLowerCase() : '';
  renderFavorites();
}

function renderFavorites() {
  const userFavs = getUserFavorites();
  const container = document.getElementById('favorites-grid-container');
  const emptyState = document.getElementById('favorites-empty-state');
  if (!container) return;

  const countAll = userFavs.length;
  const countLesson = userFavs.filter(f => f.type === 'lesson').length;
  const countModule = userFavs.filter(f => f.type === 'module').length;
  const countSnippet = userFavs.filter(f => f.type === 'snippet').length;

  const cAllEl = document.getElementById('fav-count-all');
  const cLessEl = document.getElementById('fav-count-lesson');
  const cModEl = document.getElementById('fav-count-module');
  const cSnipEl = document.getElementById('fav-count-snippet');

  if (cAllEl) cAllEl.textContent = countAll;
  if (cLessEl) cLessEl.textContent = countLesson;
  if (cModEl) cModEl.textContent = countModule;
  if (cSnipEl) cSnipEl.textContent = countSnippet;

  const tabs = ['all', 'lesson', 'module', 'snippet'];
  tabs.forEach(t => {
    const btn = document.getElementById(`fav-tab-${t}`);
    if (btn) {
      if (AppState.activeFavoritesTab === t) {
        btn.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/50 shadow-sm transition-colors';
      } else {
        btn.className = 'px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors';
      }
    }
  });

  let filtered = userFavs;
  if (AppState.activeFavoritesTab !== 'all') {
    filtered = filtered.filter(f => f.type === AppState.activeFavoritesTab);
  }

  if (AppState.favoritesSearchQuery) {
    const q = AppState.favoritesSearchQuery;
    filtered = filtered.filter(f => {
      return (f.title && f.title.toLowerCase().includes(q)) ||
        (f.subtitle && f.subtitle.toLowerCase().includes(q)) ||
        (f.content && f.content.toLowerCase().includes(q));
    });
  }

  if (filtered.length === 0) {
    container.innerHTML = '';
    container.classList.add('hidden');
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  container.classList.remove('hidden');
  if (emptyState) emptyState.classList.add('hidden');
  container.innerHTML = '';

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'glass-card rounded-xl p-4 sm:p-5 flex flex-col justify-between group border border-slate-800 hover:border-slate-700 transition-all';

    if (item.type === 'lesson') {
      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/80">
              MATERI VIDEO
            </span>
            <span class="text-[11px] text-slate-500 font-mono">${item.date || ''}</span>
          </div>
          <h3 class="text-sm font-bold text-white line-clamp-2 mb-1 group-hover:text-cyan-300 transition-colors">
            ${escapeHtml(item.title)}
          </h3>
          <p class="text-xs text-slate-400 mb-4 truncate">${escapeHtml(item.subtitle || '')}</p>
        </div>

        <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between mt-auto">
          <button onclick="navigate('learn', { lessonId: '${item.targetId}' })" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-950 hover:bg-cyan-900 text-cyan-200 border border-cyan-700/60 flex items-center gap-1.5 transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>Buka Materi</span>
          </button>
          <button onclick="removeFavorite('${item.id}')" title="Hapus dari Favorit" class="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      `;
    } else if (item.type === 'module') {
      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/80">
              MODUL LENGKAP
            </span>
            <span class="text-[11px] text-slate-500 font-mono">${item.date || ''}</span>
          </div>
          <h3 class="text-sm font-bold text-white line-clamp-2 mb-1 group-hover:text-emerald-300 transition-colors">
            ${escapeHtml(item.title)}
          </h3>
          <p class="text-xs text-slate-400 mb-4">${escapeHtml(item.subtitle || '')}</p>
        </div>

        <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between mt-auto">
          <button onclick="navigate('learn', { lessonId: '${AppState.lessons.find(l => l.moduleId === item.targetId)?.id || AppState.lessons[0].id}' })" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/60 flex items-center gap-1.5 transition-colors">
            <span>Pelajari Modul &rarr;</span>
          </button>
          <button onclick="removeFavorite('${item.id}')" title="Hapus dari Favorit" class="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      `;
    } else if (item.type === 'snippet') {
      const previewCode = (item.content || '').split('\n').slice(0, 4).join('\n');
      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/80 uppercase">
              SNIPPET ${(item.language || 'CODE')}
            </span>
            <span class="text-[11px] text-slate-500 font-mono">${item.date || ''}</span>
          </div>
          <h3 class="text-xs font-bold text-white mb-1 leading-snug line-clamp-1">
            ${escapeHtml(item.title)}
          </h3>
          <p class="text-[11px] text-slate-400 mb-2 truncate">${escapeHtml(item.subtitle || '')}</p>
          <pre class="favorite-snippet-pre p-2.5 rounded-lg bg-slate-950 border border-slate-800/90 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-24 leading-relaxed mb-3"><code>${escapeHtml(previewCode)}...</code></pre>
        </div>

        <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between mt-auto">
          <div class="flex items-center gap-1.5">
            <button onclick="copyFavoriteSnippet('${item.id}')" class="fav-copy-btn px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 transition-colors">
              <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
              <span>Salin</span>
            </button>
            ${item.targetId ? `
              <button onclick="navigate('learn', { lessonId: '${item.targetId}' })" class="px-2.5 py-1 rounded-md text-xs text-slate-400 hover:text-white transition-colors">
                Buka Asal &rarr;
              </button>
            ` : ''}
          </div>
          <button onclick="removeFavorite('${item.id}')" title="Hapus dari Favorit" class="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      `;
    }

    container.appendChild(card);
  });
}

// Global window bindings
window.copyFavoriteSnippet = function (favId) {
  const user = AppState.currentUser;
  const userFavs = (user && AppState.favorites && AppState.favorites[user.email]) ? AppState.favorites[user.email] : [];
  const fav = userFavs.find(f => f.id === favId);
  if (fav && fav.content) {
    navigator.clipboard.writeText(fav.content).then(() => {
      showToast('Kode disalin ke clipboard', 'success');
    }).catch(err => {
      console.error('Copy snippet error:', err);
      showToast('Gagal menyalin kode', 'error');
    });
  } else {
    showToast('Snippet tidak ditemukan', 'error');
  }
};

window.renderHome = renderHome;
window.renderUserDashboard = renderUserDashboard;
window.renderMonthlyLearningCalendar = renderMonthlyLearningCalendar;
window.showCalendarDayDetail = showCalendarDayDetail;
window.getCurriculumOrderedLessons = getCurriculumOrderedLessons;
window.advanceToNextLesson = advanceToNextLesson;
window.updateStreamNavigationButtons = updateStreamNavigationButtons;
window.renderLearningRoom = renderLearningRoom;
window.renderCurriculumSidebar = renderCurriculumSidebar;
window.toggleLessonCompletion = toggleLessonCompletion;
window.renderQuickActionHub = renderQuickActionHub;
window.executeQuickAction = executeQuickAction;
window.renderModuleCategoryPills = renderModuleCategoryPills;
window.setModuleCategory = setModuleCategory;
window.handleModuleSearch = handleModuleSearch;
window.clearModuleSearch = clearModuleSearch;
window.renderModuleCatalogGrid = renderModuleCatalogGrid;
window.handleFloatingNextLesson = handleFloatingNextLesson;
window.setupFloatingPillScrollListener = setupFloatingPillScrollListener;
window.openMobileCurriculumDrawer = openMobileCurriculumDrawer;
window.closeMobileCurriculumDrawer = closeMobileCurriculumDrawer;
window.dismissFloatingPill = dismissFloatingPill;
window.goToAdjacentLesson = goToAdjacentLesson;
window.toggleCurrentLessonCompletion = toggleCurrentLessonCompletion;
window.getUserFavorites = getUserFavorites;
window.toggleCurrentLessonFavorite = toggleCurrentLessonFavorite;
window.toggleModuleFavorite = toggleModuleFavorite;
window.saveSnippetToFavorites = saveSnippetToFavorites;
window.removeFavorite = removeFavorite;
window.filterFavorites = filterFavorites;
window.handleSearchFavorites = handleSearchFavorites;
window.renderFavorites = renderFavorites;
window.convertGoogleDriveUrl = convertGoogleDriveUrl;
window.renderAppBrandLogo = renderAppBrandLogo;
window.openWhatsAppContactModal = openWhatsAppContactModal;
window.closeWhatsAppContactModal = closeWhatsAppContactModal;
window.showLearnModulesCatalog = showLearnModulesCatalog;
window.renderLearnModulesCatalog = renderLearnModulesCatalog;
window.setLearnModuleCategory = setLearnModuleCategory;
window.handleLearnModuleSearch = handleLearnModuleSearch;
window.clearLearnModuleSearch = clearLearnModuleSearch;

/* ==========================================
   GLOBAL SEARCH & MENU COMMAND PALETTE (Revisi 68 - Poin 5)
   ========================================== */

function getGlobalSearchMenuItems() {
  const isAdmin = window.AppState?.currentUser?.role === 'admin';
  const items = [
    {
      id: 'menu-home',
      category: 'Halaman Utama',
      title: 'Home',
      subtitle: 'Overview ekosistem silabus dan materi pembelajaran',
      icon: `<svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`,
      badge: 'NAV',
      action: () => navigate('home')
    },
    {
      id: 'menu-dashboard',
      category: 'Halaman Utama',
      title: 'Dashboard',
      subtitle: 'Pantau streak belajar, progress persentase & kalender aktif',
      icon: `<svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
      badge: 'STATS',
      action: () => navigate('user-dashboard')
    },
    {
      id: 'menu-learn',
      category: 'Halaman Utama',
      title: 'Modul Pembelajaran',
      subtitle: 'Akses ruang belajar video, catatan notion, dan silabus lengkap',
      icon: `<svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
      badge: 'BELAJAR',
      action: () => navigate('learn')
    },
    {
      id: 'menu-resources',
      category: 'Halaman Utama',
      title: 'ZettLink',
      subtitle: 'Download template code, cheatsheet AI, dan asset proyek',
      icon: `<svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>`,
      badge: 'ZETTLINK',
      action: () => navigate('resources')
    },
    {
      id: 'menu-showcase',
      category: 'Halaman Utama',
      title: 'ZettShowcase',
      subtitle: 'Galeri karya web app full AI buatan seluruh member Zettbos',
      icon: `<svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
      badge: 'KARYA',
      action: () => navigate('showcase')
    },
    {
      id: 'menu-favorites',
      category: 'Halaman Utama',
      title: 'Favorite & Simpan',
      subtitle: 'Kumpulan materi dan snippet codeblock yang Anda simpan',
      icon: `<svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>`,
      badge: 'FAVORIT',
      action: () => navigate('favorites')
    },
    {
      id: 'menu-whatsapp-community',
      category: 'Komunitas & Bantuan',
      title: 'Komunitas VIP WhatsApp',
      subtitle: 'Diskusi bersama ratusan builder AI & mentor Zettbos resmi',
      icon: `<svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/></svg>`,
      badge: 'COMMUNITY',
      action: () => openWhatsAppContactModal()
    },
    {
      id: 'menu-whatsapp-mentor',
      category: 'Komunitas & Bantuan',
      title: 'Hubungi Mentor / Support WA',
      subtitle: 'Bantuan kendala teknis atau tanya jawab seputar kurikulum',
      icon: `<svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>`,
      badge: 'SUPPORT',
      action: () => openWhatsAppContactModal()
    },
    {
      id: 'menu-profile',
      category: 'Akun & Personalisasi',
      title: 'Pengaturan Profil Member',
      subtitle: 'Ubah nama tampilan, avatar, dan data akun pribadi',
      icon: `<svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`,
      badge: 'AKUN',
      action: () => openProfileSettingsModal()
    },
    {
      id: 'menu-theme',
      category: 'Akun & Personalisasi',
      title: 'Ganti Mode Tampilan (Dark / Light)',
      subtitle: 'Sesuaikan kenyamanan mata dengan mode gelap atau terang',
      icon: `<svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path stroke-linecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m14.14-14.14l-1.41 1.41"/></svg>`,
      badge: 'TEMA',
      action: () => toggleTheme()
    }
  ];

  if (isAdmin) {
    items.push({
      id: 'menu-admin',
      category: 'Manajemen Sistem',
      title: 'Admin Panel Kurikulum & CMS',
      subtitle: 'Kelola modul, upload materi video Notion, whitelist member, dan settings',
      icon: `<svg class="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
      badge: 'ADMIN',
      action: () => navigate('admin')
    });
  }

  // Modul-modul aktif dari AppState.modules untuk pencarian materi instan!
  const modules = (window.AppState?.modules || []).filter(m => !m.isDraft);
  modules.forEach(m => {
    items.push({
      id: `mod-${m.id}`,
      category: 'Modul Kurikulum',
      title: m.title,
      subtitle: m.description || `Modul pembelajaran ${m.badge || ''}`,
      icon: `<svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`,
      badge: m.badge || 'MODUL',
      action: () => navigate('learn', { moduleId: m.id })
    });
  });

  return items;
}

let activeSearchFilterQuery = '';

function openGlobalSearchModal() {
  const modal = document.getElementById('modal-global-search');
  if (!modal) return;
  modal.classList.remove('hidden');
  const input = document.getElementById('global-search-input');
  if (input) {
    input.value = '';
    activeSearchFilterQuery = '';
    setTimeout(() => input.focus(), 50);
  }
  renderGlobalSearchMenuList('');
}

function closeGlobalSearchModal() {
  const modal = document.getElementById('modal-global-search');
  if (!modal) return;
  modal.classList.add('hidden');
}

function handleGlobalSearchInput(query) {
  activeSearchFilterQuery = query || '';
  renderGlobalSearchMenuList(activeSearchFilterQuery);
}

function renderGlobalSearchMenuList(filterText) {
  const container = document.getElementById('global-search-results-list');
  const counterEl = document.getElementById('global-search-counter');
  if (!container) return;

  const allItems = getGlobalSearchMenuItems();
  const q = (filterText || '').trim().toLowerCase();

  const filtered = q
    ? allItems.filter(item =>
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.badge && item.badge.toLowerCase().includes(q))
    )
    : allItems;

  if (counterEl) {
    counterEl.textContent = `${filtered.length} Pilihan Ditemukan`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-slate-400">
        <svg class="w-8 h-8 mx-auto text-slate-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <p class="text-xs font-semibold text-slate-300">Tidak ada menu atau materi yang cocok</p>
        <p class="text-[11px] text-slate-500 mt-1">Coba kata kunci lain seperti "kurikulum", "video", "profil", atau "modul".</p>
      </div>
    `;
    return;
  }

  // Group by category
  const groups = {};
  filtered.forEach(item => {
    const cat = item.category || 'Lainnya';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(item);
  });

  let html = '';
  Object.keys(groups).forEach(cat => {
    html += `
      <div class="global-search-group-title pt-2.5 pb-1 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        ${escapeHtml(cat)}
      </div>
    `;
    groups[cat].forEach((item) => {
      html += `
        <button 
          type="button"
          onclick="executeGlobalSearchItem('${item.id}')"
          class="global-search-item w-full p-2.5 sm:p-3 rounded-xl flex items-center justify-between gap-3 text-left transition-all group bg-[#11141E]/60 hover:bg-[#1A202C] border border-[#202533] hover:border-emerald-500/50"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-8 h-8 rounded-lg bg-[#161A26] border border-[#262C3D] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              ${item.icon}
            </div>
            <div class="min-w-0">
              <div class="global-search-item-title text-xs sm:text-sm font-semibold text-slate-100 group-hover:text-emerald-300 truncate transition-colors flex items-center gap-2">
                <span>${escapeHtml(item.title)}</span>
              </div>
              <div class="global-search-item-sub text-[11px] text-slate-400 group-hover:text-slate-300 truncate transition-colors">
                ${escapeHtml(item.subtitle)}
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <span class="global-search-badge px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700/80">
              ${escapeHtml(item.badge || 'GO')}
            </span>
            <svg class="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </div>
        </button>
      `;
    });
  });

  container.innerHTML = html;
}

function executeGlobalSearchItem(itemId) {
  closeGlobalSearchModal();
  const allItems = getGlobalSearchMenuItems();
  const found = allItems.find(it => it.id === itemId);
  if (found && typeof found.action === 'function') {
    found.action();
  }
}

// ==========================================
// ZEN FOCUS MODE (Revisi 96 - Mode Bebas Distraksi)
// ==========================================
function toggleFocusMode(forceState) {
  const isCurrent = document.body.classList.contains('zen-focus-mode');
  const shouldBe = typeof forceState === 'boolean' ? forceState : !isCurrent;

  const btnSubnavLabel = document.getElementById('focus-mode-btn-label');
  const btnHeaderLabel = document.getElementById('header-focus-mode-label');

  if (shouldBe) {
    document.body.classList.add('zen-focus-mode');
    if (btnSubnavLabel) btnSubnavLabel.textContent = 'Keluar Fokus (Esc)';
    if (btnHeaderLabel) btnHeaderLabel.textContent = 'Keluar (Esc)';
    if (typeof showToast === 'function') {
      showToast('✨ Mode Fokus Aktif (Bebas Distraksi) • Tekan Esc atau F untuk keluar', 'info');
    }
  } else {
    document.body.classList.remove('zen-focus-mode');
    if (btnSubnavLabel) btnSubnavLabel.textContent = 'Mode Fokus (F)';
    if (btnHeaderLabel) btnHeaderLabel.textContent = 'Fokus (F)';
  }
}

// Global Keyboard Shortcut:
// - Ctrl + K / Cmd + K: Open global search
// - Escape: Close modals, or exit Zen Focus Mode if active
// - F / f: Toggle Zen Focus Mode (hanya saat berada di view-learn dan bukan di input/textarea/contenteditable)
window.addEventListener('keydown', (e) => {
  const activeTag = document.activeElement ? document.activeElement.tagName.toUpperCase() : '';
  const isEditable = document.activeElement && (
    document.activeElement.isContentEditable || 
    activeTag === 'INPUT' || 
    activeTag === 'TEXTAREA' || 
    activeTag === 'SELECT'
  );

  if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
    e.preventDefault();
    const modal = document.getElementById('modal-global-search');
    if (modal && !modal.classList.contains('hidden')) {
      closeGlobalSearchModal();
    } else {
      openGlobalSearchModal();
    }
  } else if (e.key === 'Escape') {
    const searchModal = document.getElementById('modal-global-search');
    if (searchModal && !searchModal.classList.contains('hidden')) {
      closeGlobalSearchModal();
      return;
    }
    const nextModal = document.getElementById('modal-next-lesson-confirm');
    if (nextModal && !nextModal.classList.contains('hidden')) {
      closeNextLessonConfirmModal();
      return;
    }
    const curriculumDrawer = document.getElementById('modal-mobile-curriculum');
    if (curriculumDrawer && !curriculumDrawer.classList.contains('hidden')) {
      closeMobileCurriculumDrawer();
      return;
    }
    // Jika Zen Focus Mode aktif, keluar dengan tombol Escape
    if (document.body.classList.contains('zen-focus-mode')) {
      toggleFocusMode(false);
    }
  } else if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey && !e.altKey) {
    if (!isEditable && AppState && AppState.currentView === 'learn') {
      const playerView = document.getElementById('learn-player-view');
      if (playerView && !playerView.classList.contains('hidden')) {
        e.preventDefault();
        toggleFocusMode();
      }
    }
  }
});

window.toggleFocusMode = toggleFocusMode;
window.openGlobalSearchModal = openGlobalSearchModal;
window.closeGlobalSearchModal = closeGlobalSearchModal;
window.handleGlobalSearchInput = handleGlobalSearchInput;
window.renderGlobalSearchMenuList = renderGlobalSearchMenuList;
window.executeGlobalSearchItem = executeGlobalSearchItem;
window.applySquareContainFavicon = applySquareContainFavicon;
window.handleNextLessonWithConfirm = handleNextLessonWithConfirm;
window.openNextLessonConfirmModal = openNextLessonConfirmModal;
window.closeNextLessonConfirmModal = closeNextLessonConfirmModal;
window.confirmNextLessonAction = confirmNextLessonAction;

