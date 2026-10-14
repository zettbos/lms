/**
 * Zettbos LMS - Landing Portal Controller (CMS, Typewriter, Bento Curriculum)
 * js/controllers/landing.js
 */

let landingActiveModuleId = 'mod-1';
let landingActiveFacilityId = 'feat-1';
let landingActiveFeatureId = 'feat-1';

function getModuleMicroTags(mod) {
  // Purged for clean visual hierarchy (Revisi 47)
  return [];
}

function renderLandingCurriculumBento(activeModuleId) {
  if (activeModuleId) landingActiveModuleId = activeModuleId;
  
  const tabsContainer = document.getElementById('landing-module-tabs');
  const previewContainer = document.getElementById('landing-module-preview');
  if (!tabsContainer || !previewContainer) return;

  const modules = (AppState.modules || []).filter(m => !m.isDraft).slice(0, 5).sort((a, b) => a.orderIndex - b.orderIndex);
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
        <h3 class="text-lg sm:text-xl font-bold text-white mb-2">Kurikulum Sedang Disusun</h3>
        <p class="text-xs text-slate-400 max-w-md leading-relaxed mb-6">
          Mentor Zettbos sedang mematangkan silabus dan modul pembelajaran. Silakan masuk dengan akun member Anda untuk mulai belajar.
        </p>
        <button onclick="navigate('login');" class="btn-primary-action px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg">
          <span>Masuk ke Member Hub</span>
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
    const modLessons = AppState.lessons.filter(l => l.moduleId === mod.id && !l.isDraft);
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
  const activeLessons = AppState.lessons.filter(l => l.moduleId === activeMod.id && !l.isDraft).sort((a, b) => a.orderIndex - b.orderIndex);
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

        <!-- Micro-Tag Chips (Render only if present) -->
        ${microTags && microTags.length > 0 ? `
          <div class="flex flex-wrap items-center gap-2 mb-5">
            ${microTags.map(tag => `
              <span class="micro-tag-pill">
                ${getMonolineSvgIcon(tag.icon, 'w-3 h-3 text-emerald-400')}
                <span>${escapeHtml(tag.label)}</span>
              </span>
            `).join('')}
          </div>
        ` : ''}

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
          onclick="navigate('login')" 
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
  navigate('login');
  const loginInput = document.getElementById('login-email-input');
  if (loginInput) {
    loginInput.value = email;
    loginInput.focus();
  }
}

// ==========================================
// 1. LYNK.ID STYLE INTERACTIVE FACILITY SHOWCASE (5 FASILITAS KELAS)
// ==========================================

function getFacilityFallbackMockupHtml(facilityId) {
  const target = (AppState.landingCms?.facilities || []).find(u => u.id === facilityId);
  const icon = target?.icon || '';
  const title = (target?.title || '').toLowerCase();

  if (facilityId === 'feat-1' || icon === 'bot' || title.includes('zettbot') || title.includes('ai')) {
    return `
      <div class="w-full h-full p-4 sm:p-5 flex flex-col justify-between bg-slate-950 font-mono text-xs">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800 text-[11px] text-slate-400">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
            <span class="ml-2 font-bold text-slate-300">zettbot-engine ~ v2.0</span>
          </div>
          <span class="text-emerald-400 font-bold">ONLINE</span>
        </div>
        <div class="space-y-3 py-3 flex-1 overflow-y-auto">
          <div class="text-slate-400 text-[11px] leading-relaxed">
            <span class="text-emerald-400 font-bold">$ zettbot</span> --generate-prompt --stack "Full AI Web App"
          </div>
          <div class="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-emerald-300 text-[11px] leading-relaxed shadow-sm">
            <div class="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              <span>AI Prompt &amp; Code Assistant</span>
            </div>
            "Buat antarmuka responsif modern, sambungkan Google Sheets via GAS endpoint, dan otomatis selesaikan error bug..."
          </div>
          <div class="text-slate-400 text-[10px] leading-relaxed space-y-1">
            <div class="text-slate-300 flex items-center gap-1.5"><span class="text-emerald-400">✔</span> Prompt prompt-ready dioptimasi</div>
            <div class="text-slate-300 flex items-center gap-1.5"><span class="text-emerald-400">✔</span> Skrip backend Google Apps Script siap pakai</div>
            <div class="text-emerald-400 font-bold flex items-center gap-1.5"><span>✔</span> Siap copy-paste ke workspace</div>
          </div>
        </div>
        <div class="pt-2.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
          <span class="text-emerald-400 font-semibold">Tanya AI Error Kapan Saja</span>
          <span>Latensi: 12ms</span>
        </div>
      </div>
    `;
  }

  if (facilityId === 'feat-2' || icon === 'library' || title.includes('library') || title.includes('template')) {
    return `
      <div class="w-full h-full p-4 sm:p-5 flex flex-col justify-between bg-slate-950 text-xs">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"/></svg>
            </div>
            <span class="text-xs font-bold text-white">Starter Library Vault</span>
          </div>
          <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">50+ Templates</span>
        </div>
        <div class="space-y-2.5 py-3 flex-1 overflow-y-auto">
          <div class="p-3 rounded-xl bg-slate-900 border border-cyan-500/30 flex items-center justify-between gap-2 shadow-sm">
            <div class="min-w-0">
              <div class="text-xs font-bold text-white truncate">Full POS Kasir &amp; Invoice Otomatis</div>
              <div class="text-[10px] text-slate-400 font-mono mt-0.5">Google Sheets + Tailwind + PDF Export</div>
            </div>
            <span class="px-2 py-1 rounded bg-cyan-500/15 text-cyan-400 font-bold text-[10px] whitespace-nowrap">Siap Pakai</span>
          </div>
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
            <div class="min-w-0">
              <div class="text-xs font-bold text-white truncate">CRM &amp; Sales Pipeline Tracker</div>
              <div class="text-[10px] text-slate-400 font-mono mt-0.5">Automated WA Reminder + Dashboard</div>
            </div>
            <span class="px-2 py-1 rounded bg-slate-800 text-slate-300 font-bold text-[10px] whitespace-nowrap">Tinggal Modif</span>
          </div>
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
            <div class="min-w-0">
              <div class="text-xs font-bold text-white truncate">Booking &amp; Reservasi Online</div>
              <div class="text-[10px] text-slate-400 font-mono mt-0.5">Kalender Real-time + Notifikasi Email</div>
            </div>
            <span class="px-2 py-1 rounded bg-slate-800 text-slate-300 font-bold text-[10px] whitespace-nowrap">Tinggal Modif</span>
          </div>
        </div>
        <div class="pt-2.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
          <span class="text-cyan-400 font-mono">100% Full Source Code</span>
          <span class="text-slate-400">Lisensi Bebas Modifikasi</span>
        </div>
      </div>
    `;
  }

  if (facilityId === 'feat-3' || icon === 'video' || title.includes('video') || title.includes('modul')) {
    return `
      <div class="w-full h-full p-4 sm:p-5 flex flex-col justify-between bg-slate-950 text-xs">
        <div class="relative w-full aspect-video rounded-xl bg-slate-900 border border-purple-500/30 overflow-hidden flex items-center justify-center group shadow-md">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
          <div class="w-12 h-12 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform">
            <svg class="w-5 h-5 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
          <div class="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[10px] text-slate-300 font-mono">
            <span>Modul 01: Setup AI &amp; Architecture</span>
            <span class="text-purple-300 font-bold">1080p HD</span>
          </div>
        </div>
        <div class="space-y-2 py-3 flex-1 overflow-y-auto">
          <div class="text-[11px] font-bold text-white">Alur Pembelajaran Step-by-Step:</div>
          <div class="p-2 rounded-lg bg-slate-900 border border-purple-500/20 flex items-center justify-between text-[11px]">
            <span class="text-slate-300">01. Setup Workspace &amp; Engine AI</span>
            <span class="text-purple-400 font-mono font-bold">✔ Selesai</span>
          </div>
          <div class="p-2 rounded-lg bg-purple-950/40 border border-purple-500/40 flex items-center justify-between text-[11px]">
            <span class="text-white font-semibold">02. Bikin Frontend &amp; Integrasi Sheet</span>
            <span class="text-purple-300 font-mono">Sedang Diputar</span>
          </div>
          <div class="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px]">
            <span class="text-slate-400">03. Deployment &amp; Pasang Domain</span>
            <span class="text-slate-500 font-mono">Tersedia</span>
          </div>
        </div>
        <div class="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span class="text-purple-400 font-semibold">Akses Kapan Saja</span>
          <span>Update Materi Berkala</span>
        </div>
      </div>
    `;
  }

  if (facilityId === 'feat-4' || icon === 'users' || title.includes('komunitas') || title.includes('grup')) {
    return `
      <div class="w-full h-full p-4 sm:p-5 flex flex-col justify-between bg-slate-950 text-xs">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <span class="text-xs font-bold text-white">VIP Community Lounge</span>
          </div>
          <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800">2.300+ Members</span>
        </div>
        <div class="space-y-3 py-3 flex-1 overflow-y-auto">
          <div class="flex items-start gap-2.5">
            <div class="w-7 h-7 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center font-bold text-[10px] text-emerald-400 flex-shrink-0">
              AR
            </div>
            <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] leading-relaxed">
              <div class="font-bold text-white text-[10px] mb-0.5">Arya (Member Batch 4)</div>
              <div class="text-slate-300">"Alhamdulillah sore ini sistem kasir web app pesanan klien pertama saya berhasil live dan dibayar lunas!"</div>
            </div>
          </div>
          <div class="flex items-start gap-2.5">
            <div class="w-7 h-7 rounded-full bg-blue-950 border border-blue-500/50 flex items-center justify-center font-bold text-[10px] text-blue-400 flex-shrink-0">
              ZB
            </div>
            <div class="p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-[11px] leading-relaxed">
              <div class="font-bold text-blue-300 text-[10px] mb-0.5 flex items-center gap-1">
                <span>Mentor Farhan</span>
                <span class="px-1 py-0.2 rounded bg-emerald-950 text-emerald-400 text-[9px] border border-emerald-800">MENTOR</span>
              </div>
              <div class="text-slate-200">"Keren mas Arya! Nanti malam kita review di grup ya biar yang lain bisa liat arsitekturnya."</div>
            </div>
          </div>
        </div>
        <div class="pt-2.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
          <span class="text-blue-400 font-semibold">Tanya Jawab Bebas Kapan Saja</span>
          <span>Diskusi Langsung</span>
        </div>
      </div>
    `;
  }

  // Default / feat-5: Private Mentoring 1 Bulan
  return `
    <div class="w-full h-full p-4 sm:p-5 flex flex-col justify-between bg-slate-950 text-xs">
      <div class="flex items-center justify-between pb-3 border-b border-slate-800">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-lg bg-amber-950 text-amber-400 border border-amber-500/40 flex items-center justify-center">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><circle cx="12" cy="12" r="6" stroke-width="2"/><circle cx="12" cy="12" r="2" stroke-width="2"/></svg>
          </div>
          <span class="text-xs font-bold text-white">VIP 1-on-1 Mentoring</span>
        </div>
        <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">VIP Mentorship</span>
      </div>
      <div class="space-y-3 py-3 flex-1 overflow-y-auto">
        <div class="p-3 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 shadow-sm">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-caps">KOMITMEN MENTOR</span>
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <h4 class="text-xs font-bold text-white">Dibimbing Sampai Bisa Bikin Sistem Sendiri</h4>
          <p class="text-[11px] text-slate-300 leading-relaxed mt-1">
            Minimal 1 bulan bimbingan intensif, didampingi penuh hingga aplikasi Anda selesai &amp; online normal.
          </p>
        </div>
        <div class="space-y-1.5 text-[11px]">
          <div class="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2 text-slate-300">
            <span class="text-emerald-400">✔</span> Sesi Konsultasi Privat Langsung ke Mentor
          </div>
          <div class="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2 text-slate-300">
            <span class="text-emerald-400">✔</span> Code Review &amp; Debugging Bersama
          </div>
          <div class="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2 text-slate-300">
            <span class="text-emerald-400">✔</span> Garansi Didampingi Sampai Aplikasi Live
          </div>
        </div>
      </div>
      <div class="pt-2.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <span class="text-amber-400 font-semibold">Minimal 1 Bulan • Max Sampai Bisa</span>
        <span class="text-emerald-400 font-bold">100% Didampingi</span>
      </div>
    </div>
  `;
}

function selectLandingFacilityPreview(facilityId) {
  if (!AppState.landingCms || !Array.isArray(AppState.landingCms.facilities)) return;
  const list = AppState.landingCms.facilities;
  const target = list.find(u => u.id === facilityId);
  if (!target) return;

  landingActiveFacilityId = facilityId;

  // 1. Update active styling on cards
  const container = document.getElementById('landing-facilities-container');
  if (container) {
    const cards = container.querySelectorAll('.feature-interactive-card');
    cards.forEach(card => {
      const cardId = card.getAttribute('data-facility-id');
      const isCardActive = cardId === facilityId;
      if (isCardActive) {
        card.classList.add('feature-card-active');
        const iconBox = card.querySelector('.feature-icon-box');
        if (iconBox) iconBox.className = 'feature-icon-box w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center flex-shrink-0 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]';
      } else {
        card.classList.remove('feature-card-active');
        const iconBox = card.querySelector('.feature-icon-box');
        if (iconBox) iconBox.className = 'feature-icon-box w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center flex-shrink-0 bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-emerald-300';
      }
    });
  }

  // 2. Update right device screen
  const tagEl = document.getElementById('facility-preview-tag');
  const titleEl = document.getElementById('facility-preview-title');
  const descEl = document.getElementById('facility-preview-desc');
  const screenEl = document.getElementById('landing-facility-preview-screen');

  if (tagEl) tagEl.textContent = target.badge || 'ZETTBOS ECOSYSTEM';
  if (titleEl) titleEl.textContent = target.title;
  if (descEl) descEl.textContent = target.description || target.desc || '';

  if (screenEl) {
    screenEl.classList.remove('feature-preview-fade');
    void screenEl.offsetWidth; // Trigger reflow for CSS animation
    screenEl.classList.add('feature-preview-fade');

    const rawImg = (target.imageUrl || '').trim();
    if (rawImg) {
      const convertedUrl = typeof convertGoogleDriveUrl === 'function' ? convertGoogleDriveUrl(rawImg) : rawImg;
      screenEl.innerHTML = `
        <div 
          onclick="openFacilityImageLightbox('${target.id}')"
          class="relative w-full h-full cursor-zoom-in group/zoom overflow-hidden flex items-center justify-center select-none"
          title="Klik untuk memperbesar foto ${escapeHtml(target.title)}"
        >
          <img 
            src="${escapeHtml(convertedUrl)}" 
            alt="${escapeHtml(target.title)}" 
            class="w-full h-full object-cover object-center group-hover/zoom:scale-105 transition-transform duration-500" 
            onerror="this.onerror=null; this.parentElement.parentElement.innerHTML = getFacilityFallbackMockupHtml('${target.id}');"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-60 group-hover/zoom:opacity-30 transition-opacity pointer-events-none"></div>
          
          <!-- Floating Zoom Affordance Badge -->
          <div class="absolute bottom-3 right-3 px-2.5 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5 shadow-xl group-hover/zoom:scale-105 group-hover/zoom:border-emerald-400 group-hover/zoom:bg-emerald-950/90 transition-all pointer-events-none">
            <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"/></svg>
            <span>Klik untuk Perbesar</span>
          </div>
        </div>
      `;
    } else {
      screenEl.innerHTML = `
        <div onclick="openFacilityImageLightbox('${target.id}')" class="w-full h-full cursor-pointer" title="Pratinjau Fasilitas ${escapeHtml(target.title)}">
          ${getFacilityFallbackMockupHtml(target.id)}
        </div>
      `;
    }
  }
}

// ==========================================
// 1.3. UNIVERSAL IMAGE LIGHTBOX CONTROLLER
// ==========================================

function openImageLightbox(imageUrl, title = 'Foto Pratinjau', badge = 'FASILITAS') {
  const modal = document.getElementById('modal-image-lightbox');
  const imgEl = document.getElementById('lightbox-image-target');
  const titleEl = document.getElementById('lightbox-image-title');
  const badgeEl = document.getElementById('lightbox-image-badge');
  const extBtn = document.getElementById('lightbox-image-external-btn');

  if (!modal || !imgEl) return;

  imgEl.src = imageUrl || '';
  imgEl.alt = title || 'Pratinjau Foto';
  if (titleEl) titleEl.textContent = title || 'Pratinjau Foto';
  if (badgeEl) badgeEl.textContent = badge || 'FASILITAS';
  if (extBtn) {
    extBtn.href = imageUrl || '#';
  }

  modal.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');

  // Register ESC key handler
  if (window._lightboxEscHandler) {
    window.removeEventListener('keydown', window._lightboxEscHandler);
  }
  window._lightboxEscHandler = function(e) {
    if (e.key === 'Escape') closeImageLightbox();
  };
  window.addEventListener('keydown', window._lightboxEscHandler);
}

function closeImageLightbox() {
  const modal = document.getElementById('modal-image-lightbox');
  if (modal) modal.classList.add('hidden');
  document.body.classList.remove('overflow-hidden');

  if (window._lightboxEscHandler) {
    window.removeEventListener('keydown', window._lightboxEscHandler);
    window._lightboxEscHandler = null;
  }
}

function openFacilityImageLightbox(facilityId) {
  const fid = facilityId || landingActiveFacilityId;
  const list = (AppState.landingCms && Array.isArray(AppState.landingCms.facilities)) ? AppState.landingCms.facilities : [];
  const target = list.find(u => u.id === fid) || list[0];
  if (!target) return;

  const rawImg = (target.imageUrl || '').trim();
  if (rawImg) {
    const convertedUrl = typeof convertGoogleDriveUrl === 'function' ? convertGoogleDriveUrl(rawImg) : rawImg;
    openImageLightbox(convertedUrl, target.title || 'Fasilitas Ekosistem Zettbos', target.badge || 'FASILITAS RESMI');
  } else {
    if (typeof showToast === 'function') {
      showToast('Fasilitas ini sedang menggunakan live interactive preview. Belum ada foto khusus.', 'info');
    }
  }
}

function renderLandingFacilitiesShowcase(cms) {
  const container = document.getElementById('landing-facilities-container');
  const facilities = cms.facilities || [];
  if (!container || !Array.isArray(facilities) || facilities.length === 0) return;

  const validActive = facilities.some(u => u.id === landingActiveFacilityId);
  if (!validActive) {
    landingActiveFacilityId = facilities[0].id;
  }

  const facilityCardsHtml = facilities.map(uc => {
    const isActive = uc.id === landingActiveFacilityId;
    const activeClass = isActive ? 'feature-card-active' : 'border-[var(--border)] hover:border-emerald-500/40 hover:bg-[var(--surface-hover)]';

    return `
      <div 
        data-facility-id="${uc.id}" 
        onclick="selectLandingFacilityPreview('${uc.id}')"
        class="feature-interactive-card glass-card card-elevated-highlight rounded-2xl p-5 sm:p-6 lg:p-7 border transition-all duration-300 group cursor-pointer flex flex-col justify-center min-h-[140px] sm:min-h-[155px] lg:min-h-[170px] ${activeClass}"
      >
        <div class="flex items-start gap-4 sm:gap-5">
          <div class="feature-icon-box w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${isActive ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]' : 'bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-emerald-300'}">
            ${getMonolineSvgIcon(uc.icon || 'bot', 'w-7 h-7 sm:w-8 sm:h-8')}
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-1.5 mb-1.5">
              <h3 class="text-base sm:text-lg lg:text-xl font-extrabold text-white group-hover:text-emerald-300 transition-colors leading-snug tracking-tight">
                ${escapeHtml(uc.title)}
              </h3>
              ${isActive ? '<span class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_#10B981] animate-pulse shrink-0"></span>' : ''}
            </div>
            <p class="text-xs sm:text-sm lg:text-[14.5px] text-slate-300 leading-relaxed font-normal">
              ${escapeHtml(uc.description || uc.desc || '')}
            </p>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const actionCardHtml = `
    <a 
      href="https://lynk.id/zettbos/50nxdkpjmowm" 
      target="_blank" 
      rel="noopener noreferrer" 
      class="feature-action-card card-elevated-highlight rounded-2xl p-5 sm:p-6 lg:p-7 border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/35 transition-all flex flex-col justify-center min-h-[140px] sm:min-h-[155px] lg:min-h-[170px] group cursor-pointer shadow-sm"
    >
      <div class="flex items-start gap-4 sm:gap-5">
        <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400 group-hover:scale-105 group-hover:bg-emerald-500/25 transition-all">
          <svg class="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="text-base sm:text-lg lg:text-xl font-extrabold text-emerald-300 group-hover:text-emerald-200 transition-colors leading-snug tracking-tight">
            Daftar &amp; Join Kelas Sekarang
          </h3>
          <p class="text-xs sm:text-sm lg:text-[14px] text-emerald-400/90 mt-1.5 leading-relaxed font-medium">
            Amankan slot mentoring 1-on-1 &amp; akses ZettBOT via Lynk.id &rarr;
          </p>
        </div>
      </div>
    </a>
  `;

  container.innerHTML = facilityCardsHtml + actionCardHtml;

  // Update right preview screen for active feature
  selectLandingFacilityPreview(landingActiveFacilityId);
}

// ==========================================
// 2. TARGET AUDIENS SECTION (4 KARTU GRID ASLI)
// ==========================================

function renderLandingUseCases(cms) {
  const container = document.getElementById('landing-usecases-container');
  if (!container || !Array.isArray(cms.useCases)) return;

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

  container.innerHTML = cms.useCases.map(uc => {
    const borderClass = tintBorderMap[uc.tint] || tintBorderMap.emerald;
    const iconBgClass = tintIconBgMap[uc.tint] || tintIconBgMap.emerald;
    const tags = Array.isArray(uc.tags) ? uc.tags : [];
    return `
      <div class="glass-card card-usecase-item card-elevated-highlight rounded-2xl p-4 sm:p-5 flex flex-col justify-between border ${borderClass} transition-all duration-300 group hover:-translate-y-1 shadow-md">
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

  // Dynamic Module Count on Overlap Banner CTA button (Gambar 1 Revisi 51)
  const bannerCountEl = document.getElementById('landing-banner-curriculum-count');
  if (bannerCountEl) {
    const activeModCount = (AppState.modules || []).filter(m => m.isPublished !== false).length;
    bannerCountEl.textContent = `Lihat ${activeModCount} Modul Kurikulum`;
  }

  // 2. Render 5 Fasilitas Kelas (Lynk.id Style Interactive Showcase)
  renderLandingFacilitiesShowcase(cms);

  // 3. Render 4 Target Audiens Siswa (Original 4-Card Grid)
  renderLandingUseCases(cms);


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
  if (typeof initLandingScrollSpy === 'function') initLandingScrollSpy();
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
    'alumni@zettbos.com'
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

// Smooth Landing Scroll-Spy Navigation (Revisi 47)
function initLandingScrollSpy() {
  const sections = document.querySelectorAll('#view-landing section[id]');
  const navLinks = document.querySelectorAll('header.fixed nav a');
  if (!sections.length || !navLinks.length) return;

  const onScroll = () => {
    let currentId = '';
    const scrollPos = window.scrollY + 160;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === '#' + currentId) {
        link.classList.add('text-emerald-400', 'font-bold');
        link.classList.remove('text-slate-300');
      } else {
        link.classList.remove('text-emerald-400', 'font-bold');
        link.classList.add('text-slate-300');
      }
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// Micro Scroll Progress Bar Controller (Revisi 60)
function initLandingScrollProgress() {
  const bar = document.getElementById('app-scroll-progress');
  if (!bar) return;

  const updateProgress = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = Math.min(100, Math.max(0, percent)) + '%';
  };

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

// Scroll Reveal Observer for Section Animations (Revisi 60)
function initLandingScrollReveal() {
  const reveals = document.querySelectorAll('.scroll-reveal');
  if (!reveals.length) return;

  if (!('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.1
  });

  reveals.forEach(el => observer.observe(el));
}

// Window bindings
window.getModuleMicroTags = getModuleMicroTags;
window.renderLandingCurriculumBento = renderLandingCurriculumBento;
window.selectLandingModule = selectLandingModule;
window.handleLandingEmailSubmit = handleLandingEmailSubmit;
window.renderLandingFromCms = renderLandingFromCms;
window.renderLandingFacilitiesShowcase = renderLandingFacilitiesShowcase;
window.selectLandingFacilityPreview = selectLandingFacilityPreview;
window.getFacilityFallbackMockupHtml = getFacilityFallbackMockupHtml;
window.renderLandingUseCases = renderLandingUseCases;
// Backwards compatibility aliases
window.renderLandingFeaturesShowcase = renderLandingFacilitiesShowcase;
window.selectLandingFeaturePreview = selectLandingFacilityPreview;
window.getFeatureFallbackMockupHtml = getFacilityFallbackMockupHtml;
window.HeroTypewriterController = HeroTypewriterController;
window.initHeroBannerOverlapCentering = initHeroBannerOverlapCentering;
window.initLandingScrollSpy = initLandingScrollSpy;
window.initLandingScrollProgress = initLandingScrollProgress;
window.initLandingScrollReveal = initLandingScrollReveal;
window.openImageLightbox = openImageLightbox;
window.closeImageLightbox = closeImageLightbox;
window.openFacilityImageLightbox = openFacilityImageLightbox;

