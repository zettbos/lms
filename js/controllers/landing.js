/**
 * Zettbos LMS - Landing Portal Controller (CMS, Typewriter, Bento Curriculum)
 * js/controllers/landing.js
 */

let landingActiveModuleId = 'mod-1';

function getModuleMicroTags(mod) {
  const cat = mod.category || 'ai';
  if (cat === 'gas') {
    return [
      { label: 'GAS API', icon: 'sparkles' },
      { label: 'Sheets DB', icon: 'folder' },
      { label: 'Free Tier', icon: 'code' }
    ];
  } else if (cat === 'ai') {
    return [
      { label: 'Web App AI', icon: 'code' },
      { label: 'AI Workflow', icon: 'sparkles' },
      { label: 'Zero Syntax', icon: 'play' }
    ];
  } else if (cat === 'webhook') {
    return [
      { label: 'Webhook API', icon: 'code' },
      { label: 'Auto Sync', icon: 'sparkles' },
      { label: 'Real-time', icon: 'folder' }
    ];
  } else if (cat === 'cloud') {
    return [
      { label: 'Cloud Deploy', icon: 'folder' },
      { label: 'Production', icon: 'sparkles' },
      { label: 'SSL Auto', icon: 'code' }
    ];
  }
  return [
    { label: 'Tutorial AI', icon: 'code' },
    { label: 'Studi Kasus', icon: 'sparkles' }
  ];
}

function renderLandingCurriculumBento(activeModuleId) {
  if (activeModuleId) landingActiveModuleId = activeModuleId;
  
  const tabsContainer = document.getElementById('landing-module-tabs');
  const previewContainer = document.getElementById('landing-module-preview');
  if (!tabsContainer || !previewContainer) return;

  const modules = (AppState.modules || []).slice(0, 5).sort((a, b) => a.orderIndex - b.orderIndex);
  if (modules.length === 0) {
    tabsContainer.innerHTML = `
      <div class="p-6 rounded-2xl glass-card border border-[var(--border)] text-center flex flex-col items-center justify-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
        </div>
        <h4 class="text-sm font-bold text-white">Kurikulum Sedang Disusun</h4>
        <p class="text-xs text-slate-400 leading-relaxed max-w-xs">
          Belum ada modul kurikulum yang dipublikasikan. Masuk sebagai Admin untuk mulai menambahkan modul dan silabus materi dari 0.
        </p>
      </div>
    `;
    previewContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center text-center p-8 min-h-[300px]">
        <span class="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-caps mb-3">
          Status: Siap Diisi Materi Asli
        </span>
        <h3 class="text-lg sm:text-xl font-bold text-white mb-2">Mulai Masukkan Data Modul Anda</h3>
        <p class="text-xs text-slate-400 max-w-md leading-relaxed mb-6">
          Klik tombol di bawah ini untuk membuka Admin Panel dan membuat modul pertama beserta materi video YouTube dan catatan Notion.
        </p>
        <button onclick="loginAsDemo('farhan@zettbos.com'); navigate('admin');" class="btn-primary-action px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg">
          <span>Buka Admin &amp; Tambah Modul Pertama</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        </button>
      </div>
    `;
    return;
  }

  let activeMod = modules.find(m => m.id === landingActiveModuleId);
  if (!activeMod) {
    activeMod = modules[0];
    landingActiveModuleId = activeMod.id;
  }

  // 1. Render Left Bento Tabs
  tabsContainer.innerHTML = modules.map((mod, idx) => {
    const isActive = mod.id === landingActiveModuleId;
    const activeClass = isActive 
      ? 'bento-tab-active' 
      : 'hover:bg-[var(--surface-hover)] border-[var(--border)]';
    const modLessons = AppState.lessons.filter(l => l.moduleId === mod.id);
    const totalMinutes = modLessons.reduce((acc, l) => acc + (l.durationMinutes || 15), 0);

    return `
      <button 
        type="button" 
        onclick="selectLandingModule('${mod.id}')"
        class="w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all flex items-center justify-between gap-3 group ${activeClass}"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 ${isActive ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50' : 'bg-slate-900 text-slate-400 border border-slate-800'}">
            0${idx + 1}
          </div>
          <div class="min-w-0">
            <h4 class="text-xs sm:text-sm font-bold text-white truncate ${isActive ? 'text-emerald-400' : 'group-hover:text-emerald-300'}">
              ${escapeHtml(mod.title)}
            </h4>
            <p class="text-[11px] text-slate-400 truncate mt-0.5">
              ${modLessons.length} Materi • ${totalMinutes} Menit
            </p>
          </div>
        </div>
        <div class="flex items-center gap-1.5 flex-shrink-0">
          <span class="micro-tag-pill hidden sm:inline-flex">
            ${escapeHtml(mod.badge || 'MODUL')}
          </span>
          <svg class="w-4 h-4 text-slate-400 ${isActive ? 'text-emerald-400 translate-x-0.5' : 'group-hover:translate-x-0.5'} transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </div>
      </button>
    `;
  }).join('');

  // 2. Render Right Dynamic Preview Card
  const activeLessons = AppState.lessons.filter(l => l.moduleId === activeMod.id).sort((a, b) => a.orderIndex - b.orderIndex);
  const totalMin = activeLessons.reduce((acc, l) => acc + (l.durationMinutes || 15), 0);
  const microTags = getModuleMicroTags(activeMod);

  previewContainer.innerHTML = `
    <div class="flex flex-col h-full justify-between">
      <div>
        <div class="flex items-center justify-between gap-3 mb-3">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="px-2.5 py-0.5 rounded text-[10px] font-bold tracking-caps uppercase bg-emerald-950 text-emerald-300 border border-emerald-500/50">
              ${escapeHtml(activeMod.badge || 'MODUL UTAMA')}
            </span>
            <span class="text-[11px] font-mono text-slate-400">
              ${activeLessons.length} Video Pelajaran • ${totalMin} Menit
            </span>
          </div>
          <span class="text-xs font-mono font-bold text-emerald-400 hidden sm:inline">Kurikulum Terverifikasi</span>
        </div>

        <h3 class="text-lg sm:text-2xl font-black text-white tracking-tight mb-2">
          ${escapeHtml(activeMod.title)}
        </h3>

        <p class="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
          ${escapeHtml(activeMod.description || 'Pelajari materi terstruktur ini dengan studi kasus langsung.')}
        </p>

        <!-- Micro-Tag Chips -->
        <div class="flex flex-wrap items-center gap-2 mb-5">
          ${microTags.map(tag => `
            <span class="micro-tag-pill">
              ${getMonolineSvgIcon(tag.icon, 'w-3 h-3 text-emerald-400')}
              <span>${escapeHtml(tag.label)}</span>
            </span>
          `).join('')}
        </div>

        <!-- Lessons Syllabus List -->
        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-caps mb-2 flex items-center justify-between">
          <span>Silabus Materi:</span>
          <span class="font-mono text-slate-500">Preview 4 Topik Utama</span>
        </div>
        <div class="space-y-1.5 mb-6">
          ${activeLessons.slice(0, 4).map((les, i) => `
            <div class="flex items-center justify-between gap-2 p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs">
              <div class="flex items-center gap-2 min-w-0">
                <span class="w-5 h-5 rounded-md bg-emerald-950/80 text-emerald-400 flex items-center justify-center font-mono text-[10px] flex-shrink-0">
                  ${i + 1}
                </span>
                <span class="truncate text-slate-200 font-medium">${escapeHtml(les.title)}</span>
              </div>
              <span class="text-[10px] text-slate-400 font-mono flex-shrink-0">${les.durationMinutes || 15} Menit</span>
            </div>
          `).join('')}
          ${activeLessons.length > 4 ? `
            <div class="text-[11px] text-center text-slate-400 italic pt-1">
              + ${activeLessons.length - 4} materi lainnya dalam modul ini
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Action Button -->
      <div class="pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-2 text-xs text-slate-400">
          <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          <span>Termasuk Template Kode &amp; Prompt SOP</span>
        </div>
        <button 
          type="button" 
          onclick="loginAsDemo('member@zettbos.com')" 
          class="btn-primary-action w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-md whitespace-nowrap"
        >
          <span>Masuk &amp; Pelajari Modul Ini</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        </button>
      </div>
    </div>
  `;
}

function selectLandingModule(moduleId) {
  landingActiveModuleId = moduleId;
  renderLandingCurriculumBento(moduleId);
}

function handleLandingEmailSubmit(event) {
  if (event) event.preventDefault();
  const input = document.getElementById('landing-email-input');
  const email = input ? input.value.trim().toLowerCase() : '';
  if (!email) {
    showToast('Silakan masukkan alamat email', 'error');
    return;
  }
  loginAsDemo(email);
}

function renderLandingFromCms() {
  if (!AppState.landingCms) return;
  const cms = AppState.landingCms;
  const hero = cms.hero || {};

  // 1. Hero Dynamic Fields
  const badgeEl = document.getElementById('landing-hero-badge');
  const preEl = document.getElementById('landing-hero-pre');
  const postEl = document.getElementById('landing-hero-post');
  const descEl = document.getElementById('landing-hero-desc');
  const ctaBtnTextEl = document.getElementById('landing-cta-btn-text');
  const bannerTitleEl = document.getElementById('landing-banner-title');
  const bannerDescEl = document.getElementById('landing-banner-desc');

  if (badgeEl && hero.badge) badgeEl.textContent = hero.badge;
  if (preEl && hero.headlinePre) preEl.textContent = hero.headlinePre;
  if (postEl && hero.headlinePost) postEl.textContent = hero.headlinePost;
  if (descEl && hero.description) descEl.textContent = hero.description;
  if (ctaBtnTextEl && hero.ctaText) ctaBtnTextEl.textContent = hero.ctaText;
  if (bannerTitleEl && hero.bannerTitle) bannerTitleEl.textContent = hero.bannerTitle;
  if (bannerDescEl && hero.bannerDesc) bannerDescEl.textContent = hero.bannerDesc;

  // 2. Render Use-Cases (4 Cards)
  const usecasesContainer = document.getElementById('landing-usecases-container');
  if (usecasesContainer && Array.isArray(cms.useCases)) {
    const tintBorderMap = {
      emerald: 'border-emerald-500/30 hover:border-emerald-500/60',
      cyan: 'border-cyan-500/30 hover:border-cyan-500/60',
      purple: 'border-purple-500/30 hover:border-purple-500/60',
      amber: 'border-amber-500/30 hover:border-amber-500/60',
      blue: 'border-blue-500/30 hover:border-blue-500/60',
      rose: 'border-rose-500/30 hover:border-rose-500/60'
    };
    const tintIconBgMap = {
      emerald: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30',
      cyan: 'bg-cyan-950/80 text-cyan-400 border-cyan-500/30',
      purple: 'bg-purple-950/80 text-purple-400 border-purple-500/30',
      amber: 'bg-amber-950/80 text-amber-400 border-amber-500/30',
      blue: 'bg-blue-950/80 text-blue-400 border-blue-500/30',
      rose: 'bg-rose-950/80 text-rose-400 border-rose-500/30'
    };

    usecasesContainer.innerHTML = cms.useCases.map(uc => {
      const borderClass = tintBorderMap[uc.tint] || tintBorderMap.emerald;
      const iconBgClass = tintIconBgMap[uc.tint] || tintIconBgMap.emerald;
      const tags = Array.isArray(uc.tags) ? uc.tags : [];
      return `
        <div class="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between border ${borderClass} transition-all duration-300 group hover:-translate-y-1 shadow-md">
          <div>
            <div class="flex items-center justify-between mb-3">
              <div class="w-9 h-9 rounded-xl ${iconBgClass} border flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                ${getMonolineSvgIcon(uc.icon || 'briefcase', 'w-4 h-4')}
              </div>
              <span class="text-[10px] font-mono text-slate-500 tracking-caps uppercase">TARGET AUDIENS</span>
            </div>
            <h3 class="text-xs sm:text-sm font-bold text-white mb-1.5 leading-snug group-hover:text-emerald-300 transition-colors">
              ${escapeHtml(uc.title)}
            </h3>
            <p class="text-[11px] sm:text-xs text-slate-400 leading-relaxed mb-3">
              ${escapeHtml(uc.description || uc.desc || '')}
            </p>
          </div>
          <div class="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/60">
            ${tags.map(t => `<span class="micro-tag-pill text-[10px]">${escapeHtml(t)}</span>`).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  // 3. Render Testimonial Marquee Slider
  const testiTrack = document.getElementById('landing-testimonials-track');
  if (testiTrack && Array.isArray(cms.testimonials)) {
    const renderTestiCard = (t, isClone = false) => {
      const tintBorderMap = {
        emerald: 'border-emerald-500/20 hover:border-emerald-500/50',
        cyan: 'border-cyan-500/20 hover:border-cyan-500/50',
        purple: 'border-purple-500/20 hover:border-purple-500/50',
        amber: 'border-amber-500/20 hover:border-amber-500/50',
        blue: 'border-blue-500/20 hover:border-blue-500/50',
        rose: 'border-rose-500/20 hover:border-rose-500/50'
      };
      const tintAvatarMap = {
        emerald: 'bg-emerald-950 text-emerald-300 border-emerald-500/40',
        cyan: 'bg-cyan-950 text-cyan-300 border-cyan-500/40',
        purple: 'bg-purple-950 text-purple-300 border-purple-500/40',
        amber: 'bg-amber-950 text-amber-300 border-amber-500/40',
        blue: 'bg-blue-950 text-blue-300 border-blue-500/40',
        rose: 'bg-rose-950 text-rose-300 border-rose-500/40'
      };
      const bdr = tintBorderMap[t.tint] || tintBorderMap.emerald;
      const avt = tintAvatarMap[t.tint] || tintAvatarMap.emerald;

      return `
        <div class="testimonial-card p-5 sm:p-6 flex flex-col justify-between border ${bdr} transition-all" ${isClone ? 'aria-hidden="true"' : ''}>
          <div>
            <!-- Top: Member Profile Header -->
            <div class="flex items-center justify-between gap-3 mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full ${avt} border flex items-center justify-center font-bold font-mono text-xs flex-shrink-0 shadow-sm">
                  ${escapeHtml(t.initials || 'ZB')}
                </div>
                <div>
                  <div class="text-sm font-bold text-white leading-tight flex items-center gap-1.5">
                    <span>${escapeHtml(t.name)}</span>
                    <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                  </div>
                  <div class="text-[11px] text-slate-400 mt-0.5 truncate max-w-[190px]">${escapeHtml(t.role)}</div>
                </div>
              </div>
              <span class="text-[10px] font-mono font-semibold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/80 shrink-0">ALUMNI</span>
            </div>

            <!-- Review Stars & Outcome Badge -->
            <div class="flex items-center justify-between gap-2 mb-3.5">
              <div class="flex items-center text-amber-400 text-xs tracking-wider" title="5/5 Bintang Kepuasan">
                ★★★★★
              </div>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold bg-slate-900/90 border border-slate-800 text-emerald-300">
                <svg class="w-3 h-3 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                <span class="truncate max-w-[160px]">${escapeHtml(t.outcomeBadge || 'Hasil Nyata')}</span>
              </span>
            </div>

            <!-- Quote Text with natural wrapping -->
            <div class="relative">
              <p class="text-xs sm:text-[13px] text-slate-300 leading-relaxed italic">
                "${escapeHtml(t.quote)}"
              </p>
            </div>
          </div>

          <!-- Bottom: Verified Member & Progress -->
          <div class="testi-divider pt-3.5 border-t border-slate-800/80 mt-4 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Verified Member
            </span>
            <span class="text-emerald-400 font-semibold">100% Selesai</span>
          </div>
        </div>
      `;
    };

    if (cms.testimonials.length === 0) {
      testiTrack.innerHTML = `
        <div class="w-full text-center py-6 px-4">
          <p class="text-xs sm:text-sm text-slate-400 font-mono">Belum ada testimoni yang dipublikasikan. Anda dapat menambahkan ulasan member asli melalui Admin Panel (Tab CMS).</p>
        </div>
      `;
    } else {
      const originalSet = cms.testimonials.map(t => renderTestiCard(t, false)).join('');
      const cloneSet = cms.testimonials.map(t => renderTestiCard(t, true)).join('');
      testiTrack.innerHTML = originalSet + cloneSet;
    }
  }

  // Auto-center hero overlap banner dynamically like referensi.html
  initHeroBannerOverlapCentering();
}

const HeroTypewriterController = {
  headlinePhrases: [
    'Langsung Praktek Jadi Aplikasi',
    'Tanpa Perlu Hafal Koding',
    'Beresin Error Dibantu AI',
    'Gaperlu Bayar Vendor Mahal',
    'Sampai Pasang Domain Sendiri'
  ],
  terminalStatuses: [
    'siap mengeksekusi',
    'generating layout UI...',
    'GAS endpoint terhubung',
    'webhook trigger aktif',
    '100% cloud deployed'
  ],
  emailPlaceholders: [
    'Ketik email Anda...',
    'budi@perusahaan.com',
    'developer@startup.id',
    'owner@toko-online.com',
    'farhan@zettbos.com'
  ],

  headlineTimer: null,
  headlineWordIndex: 0,
  headlineCharIndex: 0,
  headlineIsDeleting: false,

  terminalTimer: null,
  terminalIndex: 0,

  emailTimer: null,
  emailIndex: 0,
  emailCharIndex: 0,
  emailIsDeleting: false,
  isEmailFocused: false,
  emailListenersBound: false,

  getPhrases() {
    if (AppState.landingCms && AppState.landingCms.hero && Array.isArray(AppState.landingCms.hero.phrases) && AppState.landingCms.hero.phrases.length > 0) {
      return AppState.landingCms.hero.phrases;
    }
    return this.headlinePhrases;
  },

  init() {
    this.stop();

    const phraseEl = document.getElementById('hero-typing-phrase');
    if (!phraseEl) return;

    const phrases = this.getPhrases();

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      phraseEl.textContent = phrases[0] || 'Web App Sendiri';
      return;
    }

    this.bindEmailListeners();
    this.startHeadlineTyping();
    this.startEmailTyping();
    this.startTerminalStatusCycle();
  },

  stop() {
    if (this.headlineTimer) {
      clearTimeout(this.headlineTimer);
      this.headlineTimer = null;
    }
    if (this.emailTimer) {
      clearTimeout(this.emailTimer);
      this.emailTimer = null;
    }
    if (this.terminalTimer) {
      clearTimeout(this.terminalTimer);
      this.terminalTimer = null;
    }
  },

  bindEmailListeners() {
    if (this.emailListenersBound) return;
    const input = document.getElementById('landing-email-input');
    if (!input) return;

    input.addEventListener('focus', () => {
      this.isEmailFocused = true;
      input.setAttribute('placeholder', 'Ketik email Anda...');
    });

    input.addEventListener('blur', () => {
      this.isEmailFocused = false;
      if (!input.value) {
        this.emailCharIndex = 0;
        this.emailIsDeleting = false;
        this.startEmailTyping();
      }
    });

    input.addEventListener('input', () => {
      if (input.value) {
        this.isEmailFocused = true;
      }
    });

    this.emailListenersBound = true;
  },

  startHeadlineTyping() {
    const phraseEl = document.getElementById('hero-typing-phrase');
    if (!phraseEl) return;

    const phrases = this.getPhrases();
    const currentPhrase = phrases[this.headlineWordIndex % phrases.length] || 'Web App Sendiri';

    if (this.headlineIsDeleting) {
      phraseEl.textContent = currentPhrase.substring(0, this.headlineCharIndex - 1);
      this.headlineCharIndex--;
    } else {
      phraseEl.textContent = currentPhrase.substring(0, this.headlineCharIndex + 1);
      this.headlineCharIndex++;
    }

    let speed = this.headlineIsDeleting ? 45 : 85;

    if (!this.headlineIsDeleting && this.headlineCharIndex === currentPhrase.length) {
      speed = 2200; // Hold full phrase
      this.headlineIsDeleting = true;
    } else if (this.headlineIsDeleting && this.headlineCharIndex === 0) {
      this.headlineIsDeleting = false;
      this.headlineWordIndex++;
      speed = 450; // Pause before typing next phrase
    }

    this.headlineTimer = setTimeout(() => this.startHeadlineTyping(), speed);
  },

  startEmailTyping() {
    const input = document.getElementById('landing-email-input');
    if (!input || this.isEmailFocused || (input.value && input.value.length > 0)) {
      return;
    }

    const currentEmail = this.emailPlaceholders[this.emailIndex % this.emailPlaceholders.length];

    if (this.emailIsDeleting) {
      input.setAttribute('placeholder', currentEmail.substring(0, this.emailCharIndex - 1));
      this.emailCharIndex--;
    } else {
      input.setAttribute('placeholder', currentEmail.substring(0, this.emailCharIndex + 1));
      this.emailCharIndex++;
    }

    let speed = this.emailIsDeleting ? 35 : 75;

    if (!this.emailIsDeleting && this.emailCharIndex === currentEmail.length) {
      speed = 2400; // Hold placeholder
      this.emailIsDeleting = true;
    } else if (this.emailIsDeleting && this.emailCharIndex === 0) {
      this.emailIsDeleting = false;
      this.emailIndex++;
      speed = 500;
    }

    this.emailTimer = setTimeout(() => this.startEmailTyping(), speed);
  },

  startTerminalStatusCycle() {
    const statusEl = document.getElementById('hero-terminal-status');
    if (!statusEl) return;

    this.terminalIndex = (this.terminalIndex + 1) % this.terminalStatuses.length;
    statusEl.textContent = this.terminalStatuses[this.terminalIndex];

    this.terminalTimer = setTimeout(() => this.startTerminalStatusCycle(), 3200);
  }
};

// Dynamic Overlap Centering with ResizeObserver (Inspirasi referensi.html)
function initHeroBannerOverlapCentering() {
  const bannerContainer = document.getElementById("landing-overlap-banner");
  if (!bannerContainer) return;
  const banner = bannerContainer.querySelector(".landing-frosted-strip");
  if (!banner) return;

  function centerBanner() {
    const isMobile = window.matchMedia("(max-width: 680px)").matches;
    const bannerHeight = banner.getBoundingClientRect().height;
    const overlap = isMobile ? Math.round(bannerHeight / 2) : 38;
    bannerContainer.style.marginTop = "-" + overlap + "px";
  }

  if (window.ResizeObserver) {
    const observer = new ResizeObserver(centerBanner);
    observer.observe(banner);
  } else {
    window.addEventListener("resize", centerBanner);
  }
  centerBanner();
}

// Window bindings
window.getModuleMicroTags = getModuleMicroTags;
window.renderLandingCurriculumBento = renderLandingCurriculumBento;
window.selectLandingModule = selectLandingModule;
window.handleLandingEmailSubmit = handleLandingEmailSubmit;
window.renderLandingFromCms = renderLandingFromCms;
window.HeroTypewriterController = HeroTypewriterController;
window.initHeroBannerOverlapCentering = initHeroBannerOverlapCentering;

