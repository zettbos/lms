/**
 * Zettbos LMS - Classroom & Learning Experience Controller
 * js/controllers/classroom.js
 * Menangani Katalog Modul, Ruang Belajar, Kalender Pembelajaran, Progress Tracking, & Koleksi Favorit.
 */

// ==========================================
// 1. QUICK ACTION HUB (HOME)
// ==========================================

function renderQuickActionHub() {
  const container = document.getElementById('dash-quick-actions-grid');
  if (!container) return;

  container.innerHTML = '';
  const actions = (AppState.quickActions || []).sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  actions.forEach(qa => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'action-chip-btn px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 group cursor-pointer';
    btn.onclick = () => executeQuickAction(qa.id);

    btn.innerHTML = `
      <span class="w-5 h-5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform flex-shrink-0">
        ${getMonolineSvgIcon(qa.icon, 'w-3 h-3 text-emerald-400')}
      </span>
      <span class="font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">${escapeHtml(qa.title)}</span>
      <span class="text-[10px] text-slate-500 group-hover:text-emerald-400 font-mono transition-colors">↗</span>
    `;

    container.appendChild(btn);
  });
}

function executeQuickAction(id) {
  const qa = (AppState.quickActions || []).find(a => a.id === id);
  if (!qa) return;

  if (qa.actionType === 'url') {
    if (qa.target) window.open(qa.target, '_blank');
  } else {
    navigate(qa.target || 'home');
  }
}

// ==========================================
// 1.5. PINNED MODULE HERO (ADMIN FEATURED)
// ==========================================

function renderPinnedModuleHero() {
  const container = document.getElementById('dash-pinned-module-container');
  if (!container) return;

  const user = AppState.currentUser;
  const isSuperAdmin = user && user.role === 'admin' && user.email?.toLowerCase() === 'zettbos2025@gmail.com';
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
    <div class="space-y-6">
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
            class="pinned-hero-card relative overflow-hidden rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-slate-900/95 via-slate-950/90 to-slate-900/95 border border-emerald-500/40 shadow-2xl shadow-emerald-950/30 group cursor-pointer hover:border-emerald-500/70 hover:shadow-emerald-500/10 transition-all duration-300"
          >
            <!-- Background Ambient Glow -->
            <div class="absolute -top-20 -right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/15 transition-all"></div>
            <div class="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <!-- Top Header Badge -->
            <div class="flex flex-wrap items-center justify-between gap-3 mb-5 relative z-10 border-b border-slate-800/80 pb-3.5">
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm">
                  <svg class="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 24 24"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg>
                  <span>Modul Pilihan</span>
                </span>
                <span class="badge-module-pill text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900/90 text-cyan-400 border border-cyan-500/30">
                  ${escapeHtml(pinnedMod.badge || 'MODUL UTAMA')}
                </span>
              </div>

              <div class="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span class="badge-progress-pill px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-bold">
                  ${completedCount}/${moduleLessons.length} Materi Selesai (${percent}%)
                </span>
              </div>
            </div>

            <!-- Center Content: Grid with Large Cover Image & Detailed Information -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
              <!-- Big Cover Image Showcase -->
              <div class="lg:col-span-5 relative">
                <div class="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 group-hover:border-emerald-500/50 transition-all shadow-xl">
                  <img 
                    src="${coverImg}" 
                    alt="${escapeHtml(pinnedMod.title)}" 
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                  
                  <!-- Category Chip on Image -->
                  <div class="absolute top-3 left-3">
                    <span class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/40 shadow">
                      ${escapeHtml(pinnedMod.category || 'Fundamental AI')}
                    </span>
                  </div>

                  <!-- Big Floating Play Badge -->
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="w-14 h-14 rounded-full bg-emerald-500/90 text-slate-950 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-emerald-400 transition-all duration-300">
                      <svg class="w-7 h-7 ml-1 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </div>

                  <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-slate-300">
                    <span class="bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">${moduleLessons.length} Video Materi</span>
                    <span class="bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">${totalMinutes} Menit Total</span>
                  </div>
                </div>
              </div>

              <!-- Right Side: Title, Description, Lessons Highlight & Call to Action -->
              <div class="lg:col-span-7 flex flex-col justify-between space-y-4">
                <div>
                  <div class="text-xs font-semibold text-emerald-400 uppercase tracking-caps mb-1.5 flex items-center gap-1.5">
                    <span>★ Rekomendasi Utama Zettbos Academy</span>
                  </div>
                  <h2 class="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white group-hover:text-emerald-400 transition-colors leading-tight mb-2.5">
                    ${escapeHtml(pinnedMod.title)}
                  </h2>
                  <p class="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed mb-4">
                    ${escapeHtml(pinnedMod.description || 'Modul kurikulum unggulan yang disematkan langsung oleh mentor Zettbos. Tonton materi video dan pelajari studi kasusnya langkah demi langkah.')}
                  </p>

                  <!-- Micro Quick Lessons Preview -->
                  ${moduleLessons.length > 0 ? `
                    <div class="surface-well p-2 rounded-xl mb-4 max-h-28 overflow-y-auto custom-scrollbar space-y-1">
                      ${moduleLessons.slice(0, 3).map((l, i) => `
                        <div class="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-slate-800/60 text-slate-300">
                          <span class="truncate">${i + 1}. ${escapeHtml(l.title)}</span>
                          <span class="text-[10px] text-slate-500 font-mono flex-shrink-0">${l.durationMinutes || 15}m</span>
                        </div>
                      `).join('')}
                      ${moduleLessons.length > 3 ? `<div class="text-[11px] text-slate-500 italic px-2">+ ${moduleLessons.length - 3} materi lainnya di modul ini</div>` : ''}
                    </div>
                  ` : ''}
                </div>

                <!-- Bottom Action Buttons inside Card -->
                <div class="flex flex-wrap items-center gap-3 pt-2">
                  <button 
                    onclick="event.stopPropagation(); ${targetLessonId ? `navigate('learn', { lessonId: '${targetLessonId}' })` : `showToast('Modul ini belum memiliki materi', 'info')`}" 
                    class="btn-primary-action px-6 py-3 rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-emerald-950/50 flex items-center gap-2 group-hover:scale-[1.02] transition-transform"
                  >
                    <span>${completedCount > 0 ? 'Lanjutkan Belajar Modul Ini' : 'Mulai Belajar Modul Ini Sekarang'}</span>
                    <svg class="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                  </button>
                </div>
              </div>
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
  const isSuperAdmin = user && user.role === 'admin' && user.email?.toLowerCase() === 'zettbos2025@gmail.com';
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
  const isSuperAdmin = user && user.role === 'admin' && user.email?.toLowerCase() === 'zettbos2025@gmail.com';
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
    card.className = 'glass-card glass-card-translucent rounded-2xl overflow-hidden flex flex-col justify-between group transition-all duration-300 border border-[var(--border)] hover:border-emerald-500/50 cursor-pointer hover:shadow-xl hover:-translate-y-1';

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
        <div class="relative h-32 sm:h-36 w-full bg-[var(--surface-subtle)] overflow-hidden border-b border-[var(--border)]">
          <img src="${mod.coverImage}" alt="${escapeHtml(mod.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100">
          <div class="absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-[var(--surface)]/40 to-transparent"></div>
          
          <div class="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold tracking-caps uppercase ${isModFullyCompleted ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50' : 'bg-[var(--surface)] text-cyan-400 border border-cyan-500/40'}">
              ${escapeHtml(mod.badge || 'MODUL')}
            </span>
            <span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${modCompleted > 0 ? 'bg-emerald-950/90 text-emerald-400 border border-emerald-500/30' : 'bg-[var(--surface-subtle)] text-slate-400 border border-[var(--border)]'}">
              ${modCompleted}/${moduleLessons.length} Selesai (${completionPercent}%)
            </span>
          </div>

          <button onclick="event.stopPropagation(); toggleModuleFavorite('${mod.id}')" title="${isModFav ? 'Hapus dari Favorit' : 'Simpan Modul ke Favorit'}" class="absolute top-2.5 right-2.5 p-1.5 rounded-lg ${isModFav ? 'bg-amber-950/90 text-amber-300 border border-amber-500/60' : 'bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-slate-300 border border-[var(--border)]'} shadow-sm transition-colors z-10">
            <svg class="w-3.5 h-3.5 ${isModFav ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
          </button>
        </div>

        <div class="p-4 sm:p-5 pb-3">
          <h3 class="font-bold text-sm sm:text-base text-white group-hover:text-emerald-400 transition-colors leading-snug line-clamp-2 mb-1.5">
            ${escapeHtml(mod.title)}
          </h3>
          <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
            ${escapeHtml(mod.description || '')}
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

  let nextLesson = AppState.lessons.find(l => !userCompletedLessonIds.includes(l.id));
  if (!nextLesson && AppState.lessons.length > 0) {
    nextLesson = AppState.lessons[0];
  }

  const featuredCard = document.getElementById('dash-featured-lesson');
  if (nextLesson) {
    if (featuredCard) featuredCard.classList.remove('hidden');
    const parentModule = AppState.modules.find(m => m.id === nextLesson.moduleId);
    const featTitle = document.getElementById('feat-lesson-title');
    const featModuleTag = document.getElementById('feat-lesson-module-tag');
    const featDuration = document.getElementById('feat-lesson-duration');
    const featBtnResume = document.getElementById('feat-btn-resume');
    const featProgressBar = document.getElementById('feat-progress-bar');
    const featProgressPercent = document.getElementById('feat-progress-percent');

    if (featTitle) featTitle.textContent = nextLesson.title;
    if (featModuleTag) featModuleTag.textContent = parentModule ? parentModule.title : 'Modul Kurikulum';
    if (featDuration) featDuration.textContent = `${nextLesson.durationMinutes || 18} Menit`;
    
    const isNextDone = userCompletedLessonIds.includes(nextLesson.id);
    if (featProgressBar) featProgressBar.style.width = isNextDone ? '100%' : '48%';
    if (featProgressPercent) featProgressPercent.textContent = isNextDone ? '100% Selesai' : '48% Selesai (Sisa 9 Menit)';

    if (featBtnResume) {
      featBtnResume.innerHTML = `
        <span>Lanjutkan Belajar</span>
        <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
      `;
      featBtnResume.onclick = () => {
        navigate('learn', { lessonId: nextLesson.id });
      };
    }
  } else {
    if (featuredCard) {
      const featTitle = document.getElementById('feat-lesson-title');
      const featModuleTag = document.getElementById('feat-lesson-module-tag');
      const featDuration = document.getElementById('feat-lesson-duration');
      const featBtnResume = document.getElementById('feat-btn-resume');
      const featProgressBar = document.getElementById('feat-progress-bar');
      const featProgressPercent = document.getElementById('feat-progress-percent');

      if (featTitle) featTitle.textContent = isSuperAdmin ? 'Mulai Buat Modul & Materi Pelajaran Pertama' : 'Kurikulum Segera Hadir';
      if (featModuleTag) featModuleTag.textContent = isSuperAdmin ? 'Setup Awal Kurikulum' : 'Info Kelas';
      if (featDuration) featDuration.textContent = '0 Menit';
      if (featProgressBar) featProgressBar.style.width = '0%';
      if (featProgressPercent) featProgressPercent.textContent = '0%';

      if (featBtnResume) {
        if (isSuperAdmin) {
          featBtnResume.innerHTML = `
            <span>Buka Admin Kurikulum</span>
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          `;
          featBtnResume.onclick = () => {
            navigate('admin');
          };
        } else {
          featBtnResume.innerHTML = `
            <span>Jelajahi Resource &amp; SOP</span>
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          `;
          featBtnResume.onclick = () => {
            navigate('resources');
          };
        }
      }
    }
  }

  renderQuickActionHub();
  renderPinnedModuleHero();
  renderModuleCategoryPills();
  renderModuleCatalogGrid();
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

  if (elTotalMin) elTotalMin.textContent = `${totalMinutes} Menit`;
  if (elOverallPercent) elOverallPercent.textContent = `${percent}%`;
  if (elOverallText) elOverallText.textContent = `${completedCount} dari ${totalLessons} Materi Selesai`;

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
// 4. LEARNING ROOM & VIDEO PLAYER
// ==========================================

function renderLearningRoom(lessonId) {
  const lesson = AppState.lessons.find(l => l.id === lessonId) || AppState.lessons[0];
  if (!lesson) {
    showToast('Materi tidak ditemukan', 'error');
    navigate('home');
    return;
  }

  const user = AppState.currentUser;
  const isSuperAdmin = user && user.role === 'admin' && user.email?.toLowerCase() === 'zettbos2025@gmail.com';
  if (lesson.isDraft && !isSuperAdmin) {
    showToast('Materi ini masih berupa draf dan belum dipublikasikan oleh mentor ke Supabase.', 'info');
    navigate('home');
    return;
  }

  AppState.currentLessonId = lesson.id;
  const userCompleted = (user && AppState.progress[user.email]) ? AppState.progress[user.email] : [];
  const isLessonCompleted = userCompleted.includes(lesson.id);

  const parentModule = AppState.modules.find(m => m.id === lesson.moduleId);
  const modBadge = document.getElementById('learn-module-badge');
  const lesTitle = document.getElementById('learn-lesson-title');
  const durBadge = document.getElementById('learn-duration-badge');

  if (modBadge) modBadge.textContent = parentModule ? parentModule.title : 'Modul Pembelajaran';
  if (lesTitle) lesTitle.textContent = lesson.title;
  if (durBadge) durBadge.textContent = `${lesson.durationMinutes || 15} Menit`;

  const contentContainer = document.getElementById('learn-notion-content');
  if (contentContainer) {
    let blocksToRender = Array.isArray(lesson.blocks) ? [...lesson.blocks] : [];
    const hasVideoBlock = blocksToRender.some(b => b.type === 'video');
    if (!hasVideoBlock && (lesson.youtubeUrl || lesson.youtubeEmbedId)) {
      const url = lesson.youtubeUrl || `https://www.youtube.com/watch?v=${lesson.youtubeEmbedId}`;
      blocksToRender = [{ type: 'video', url }, ...blocksToRender];
    }
    contentContainer.innerHTML = renderBlocksToHtml(blocksToRender);
  }

  const btnToggleComplete = document.getElementById('btn-toggle-complete');
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
    btnToggleComplete.onclick = () => toggleLessonCompletion(lesson.id);
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

  const floatingTitle = document.getElementById('floating-pill-title');
  const floatingMod = document.getElementById('floating-pill-module');
  const floatingActions = document.getElementById('floating-pill-action-container');

  if (floatingTitle) floatingTitle.textContent = lesson.title;
  if (floatingMod) floatingMod.textContent = parentModule ? parentModule.title : 'Modul Kursus';

  if (floatingActions) {
    if (isLessonCompleted) {
      floatingActions.innerHTML = `
        <button onclick="handleFloatingNextLesson()" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-900/60 flex items-center gap-1.5 transition-all">
          <span>Lanjut &rarr;</span>
        </button>
        <button onclick="dismissFloatingPill()" title="Tutup Bar" class="p-1 text-slate-400 hover:text-white rounded">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      `;
    } else {
      floatingActions.innerHTML = `
        <button onclick="toggleLessonCompletion('${lesson.id}')" class="btn-primary-action px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
          <span>Selesai</span>
        </button>
        <button onclick="dismissFloatingPill()" title="Tutup Bar" class="p-1 text-slate-400 hover:text-white rounded">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      `;
    }
  }

  const visibleLessons = AppState.lessons.filter(l => isSuperAdmin || !l.isDraft);
  const currentIndex = visibleLessons.findIndex(l => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? visibleLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < visibleLessons.length - 1 ? visibleLessons[currentIndex + 1] : null;

  const btnPrev = document.getElementById('btn-prev-lesson');
  const btnNext = document.getElementById('btn-next-lesson');
  const btnFooterPrev = document.getElementById('btn-footer-prev-lesson');
  const btnFooterNext = document.getElementById('btn-footer-next-lesson');
  const btnFooterComplete = document.getElementById('btn-footer-complete');

  if (btnPrev) {
    btnPrev.disabled = !prevLesson;
    btnPrev.onclick = () => prevLesson && renderLearningRoom(prevLesson.id);
  }
  if (btnNext) {
    btnNext.disabled = !nextLesson;
    btnNext.onclick = () => nextLesson && renderLearningRoom(nextLesson.id);
  }
  if (btnFooterPrev) {
    btnFooterPrev.disabled = !prevLesson;
  }
  if (btnFooterNext) {
    btnFooterNext.disabled = !nextLesson;
  }
  if (btnFooterComplete) {
    btnFooterComplete.innerHTML = isLessonCompleted 
      ? '<svg class="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg><span>Materi Selesai</span>'
      : '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg><span>Selesai & Lanjut</span>';
  }

  renderCurriculumSidebar(lesson.id);
}

function renderCurriculumSidebar(activeLessonId) {
  const desktopSidebar = document.getElementById('learn-curriculum-sidebar');
  const mobileTree = document.getElementById('mobile-curriculum-tree');
  const countBadge = document.getElementById('learn-curriculum-count');

  const user = AppState.currentUser;
  const isSuperAdmin = user && user.role === 'admin' && user.email?.toLowerCase() === 'zettbos2025@gmail.com';
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
        item.className = `w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between gap-2.5 transition-all group overflow-hidden ${
          isActive 
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
        mItem.className = `w-full text-left p-2.5 rounded-lg text-xs flex items-center justify-between gap-2.5 transition-all group overflow-hidden ${
          isActive 
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
    showToast('Status materi dikembalikan ke Belum Selesai', 'info');
  } else {
    list.push(lessonId);
    showToast('Materi berhasil diselesaikan', 'success');

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    if (!AppState.activity) AppState.activity = {};
    if (!AppState.activity[user.email]) {
      AppState.activity[user.email] = { studiedDates: [] };
    }
    if (!Array.isArray(AppState.activity[user.email].studiedDates)) {
      AppState.activity[user.email].studiedDates = [];
    }
    if (!AppState.activity[user.email].studiedDates.includes(todayStr)) {
      AppState.activity[user.email].studiedDates.push(todayStr);
    }

    const currentIndex = AppState.lessons.findIndex(l => l.id === lessonId);
    if (currentIndex < AppState.lessons.length - 1) {
      setTimeout(() => {
        renderLearningRoom(AppState.lessons[currentIndex + 1].id);
      }, 700);
    }
  }

  saveState();
  renderLearningRoom(lessonId);
}

// ==========================================
// 5. FLOATING PROGRESS PILL & MOBILE DRAWER
// ==========================================

function handleFloatingNextLesson() {
  const currentIndex = AppState.lessons.findIndex(l => l.id === AppState.currentLessonId);
  if (currentIndex < AppState.lessons.length - 1) {
    renderLearningRoom(AppState.lessons[currentIndex + 1].id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    showToast('Selamat! Anda telah menyelesaikan seluruh materi di kelas ini', 'success');
  }
}

function setupFloatingPillScrollListener() {
  window.addEventListener('scroll', () => {
    const pill = document.getElementById('floating-progress-pill');
    if (!pill) return;

    if (AppState.currentView === 'learn' && window.scrollY > 300) {
      pill.classList.remove('hidden-pill');
      pill.classList.add('visible-pill');
    } else {
      pill.classList.remove('visible-pill');
      pill.classList.add('hidden-pill');
    }
  });
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
  const pill = document.getElementById('floating-progress-pill');
  if (pill) {
    pill.classList.remove('visible-pill');
    pill.classList.add('hidden-pill');
  }
}

function goToAdjacentLesson(direction) {
  const currentIndex = AppState.lessons.findIndex(l => l.id === AppState.currentLessonId);
  const targetIndex = currentIndex + direction;
  if (targetIndex >= 0 && targetIndex < AppState.lessons.length) {
    renderLearningRoom(AppState.lessons[targetIndex].id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function toggleCurrentLessonCompletion() {
  if (AppState.currentLessonId) {
    toggleLessonCompletion(AppState.currentLessonId);
  }
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
    userFavs.splice(existingIndex, 1);
    saveState();
    showToast('Materi dihapus dari Favorit', 'info');
  } else {
    userFavs.unshift({
      id: generateFormattedId('FAV', userFavs, 2),
      type: 'lesson',
      targetId: lesson.id,
      title: lesson.title,
      subtitle: parentModule ? parentModule.title : 'Modul Pembelajaran',
      durationMinutes: lesson.durationMinutes || 15,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    });
    saveState();
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
    userFavs.splice(existingIndex, 1);
    saveState();
    showToast(`Modul "${mod.title.slice(0, 20)}..." dihapus dari Favorit`, 'info');
  } else {
    userFavs.unshift({
      id: generateFormattedId('FAV', userFavs, 2),
      type: 'module',
      targetId: mod.id,
      title: mod.title,
      subtitle: `${AppState.lessons.filter(l => l.moduleId === mod.id).length} Video Tutorial`,
      coverImage: mod.coverImage,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    });
    saveState();
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
  userFavs.unshift({
    id: generateFormattedId('FAV', userFavs, 2),
    type: 'snippet',
    targetId: AppState.currentLessonId,
    title: `Snippet ${(language || 'CODE').toUpperCase()} • ${currentLesson ? currentLesson.title : 'Materi'}`,
    subtitle: parentModule ? parentModule.title : 'Materi Pembelajaran',
    language: language || 'javascript',
    content: codeContent,
    date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  });

  saveState();
  showToast('Snippet kode berhasil disimpan ke Favorit', 'success');
}

function removeFavorite(favId) {
  const userFavs = getUserFavorites();
  const idx = userFavs.findIndex(f => f.id === favId);
  if (idx > -1) {
    userFavs.splice(idx, 1);
    saveState();
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
          <pre class="p-2.5 rounded-lg bg-slate-950 border border-slate-800/90 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-24 leading-relaxed mb-3"><code>${escapeHtml(previewCode)}...</code></pre>
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
window.copyFavoriteSnippet = function(favId) {
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
