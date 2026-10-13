/**
 * Zettbos LMS - Admin Panel & CMS Controller
 * js/controllers/admin.js
 * Menangani Manajemen Kurikulum, Notion Block Editor, Whitelist Member, CMS Landing Page, CMS Dokumen, dan Quick Actions.
 */

// ==========================================
// 1. ADMIN MAIN VIEW & TAB CONTROLLER
// ==========================================

function renderAdminPanel() {
  const user = AppState.currentUser;
  if (!user || user.role !== 'admin') {
    showToast('Akses dibatasi hanya untuk Admin', 'error');
    navigate('home');
    return;
  }

  switchAdminTab(AppState.activeAdminTab || 'curriculum');
}

function switchAdminTab(tabName) {
  AppState.activeAdminTab = tabName;
  ['curriculum', 'landing_cms', 'resources_cms', 'quickactions', 'whitelist', 'analytics'].forEach(t => {
    const tabBtn = document.getElementById(`tab-btn-${t}`);
    const tabPane = document.getElementById(`tab-pane-${t}`);
    if (tabBtn) {
      if (t === tabName) {
        tabBtn.className = 'px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/40';
      } else {
        tabBtn.className = 'px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800';
      }
    }
    if (tabPane) {
      if (t === tabName) tabPane.classList.remove('hidden');
      else tabPane.classList.add('hidden');
    }
  });

  if (tabName === 'curriculum') {
    renderAdminCurriculum();
  } else if (tabName === 'landing_cms') {
    renderAdminLandingCms();
  } else if (tabName === 'resources_cms') {
    renderAdminResourcesCms();
  } else if (tabName === 'whitelist') {
    renderAdminWhitelist();
  } else if (tabName === 'analytics') {
    renderAdminAnalytics();
  } else if (tabName === 'quickactions') {
    renderAdminQuickActions();
  }
}

// ==========================================
// 2. CMS LANDING PORTAL (HERO, TARGET AUDIENS, TESTIMONI)
// ==========================================

function renderAdminLandingCms() {
  if (!AppState.landingCms || !AppState.landingCms.hero) {
    const zData = window.ZettData || {};
    AppState.landingCms = JSON.parse(JSON.stringify(zData.SEED_LANDING_CMS || {}));
    saveState();
  }
  const cms = AppState.landingCms;
  const hero = cms.hero || {};

  // Hero Inputs
  const bInp = document.getElementById('admin-cms-hero-badge');
  const pInp = document.getElementById('admin-cms-hero-pre');
  const postInp = document.getElementById('admin-cms-hero-post');
  const phrInp = document.getElementById('admin-cms-hero-phrases');
  const dInp = document.getElementById('admin-cms-hero-desc');
  const ctaInp = document.getElementById('admin-cms-hero-cta');
  const bTitleInp = document.getElementById('admin-cms-hero-bannertitle');
  const bDescInp = document.getElementById('admin-cms-hero-bannerdesc');

  if (bInp) bInp.value = hero.badge || '';
  if (pInp) pInp.value = hero.headlinePre || '';
  if (postInp) postInp.value = hero.headlinePost || '';
  if (phrInp) phrInp.value = (hero.phrases || []).join('\n');
  if (dInp) dInp.value = hero.description || '';
  if (ctaInp) ctaInp.value = hero.ctaText || '';
  if (bTitleInp) bTitleInp.value = hero.bannerTitle || '';
  if (bDescInp) bDescInp.value = hero.bannerDesc || '';

  // Use-Cases Grid
  const ucGrid = document.getElementById('admin-usecases-grid');
  if (ucGrid && Array.isArray(cms.useCases)) {
    ucGrid.innerHTML = '';
    cms.useCases.forEach(uc => {
      const card = document.createElement('div');
      card.className = 'glass-card rounded-xl p-4 border border-slate-800 flex flex-col justify-between';
      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-emerald-400">
                ${getMonolineSvgIcon(uc.icon || 'briefcase', 'w-3.5 h-3.5')}
              </div>
              <span class="text-xs font-bold text-white">${escapeHtml(uc.title)}</span>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 capitalize">${escapeHtml(uc.tint || 'emerald')}</span>
          </div>
          <p class="text-xs text-slate-400 mb-3">${escapeHtml(uc.description || uc.desc || '')}</p>
          <div class="flex flex-wrap gap-1 mb-3">
            ${(uc.tags || []).map(t => `<span class="micro-tag-pill text-[10px]">${escapeHtml(t)}</span>`).join('')}
          </div>
        </div>
        <div class="pt-2.5 border-t border-slate-800 flex justify-end">
          <button onclick="openEditUseCaseModal('${uc.id}')" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center gap-1.5 transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            <span>Edit Kartu</span>
          </button>
        </div>
      `;
      ucGrid.appendChild(card);
    });
  }

  // Testimonials Table
  const tBody = document.getElementById('admin-testimonials-table-body');
  if (tBody && Array.isArray(cms.testimonials)) {
    tBody.innerHTML = '';
    cms.testimonials.forEach((t, idx) => {
      const row = document.createElement('tr');
      row.className = 'border-b border-slate-800/80 hover:bg-slate-900/50 transition-colors text-xs';
      row.innerHTML = `
        <td class="py-3 px-4 text-center font-mono text-slate-500">${idx + 1}</td>
        <td class="py-3 px-4 text-center">
          <div class="w-7 h-7 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-amber-300 mx-auto">
            ${escapeHtml(t.initials || 'ZB')}
          </div>
        </td>
        <td class="py-3 px-4">
          <div class="font-bold text-white">${escapeHtml(t.name)}</div>
          <div class="text-[11px] text-slate-400">${escapeHtml(t.role)}</div>
        </td>
        <td class="py-3 px-4">
          <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
            ${escapeHtml(t.outcomeBadge || '-')}
          </span>
        </td>
        <td class="py-3 px-4 text-slate-300 max-w-[280px] truncate" title="${escapeHtml(t.quote)}">
          "${escapeHtml(t.quote)}"
        </td>
        <td class="py-3 px-4 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button onclick="openEditTestimonialModal('${t.id}')" class="p-1.5 text-cyan-400 hover:text-white rounded hover:bg-slate-800" title="Edit Testimoni">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            <button onclick="deleteTestimonial('${t.id}')" class="p-1.5 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-950/40" title="Hapus Testimoni">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </td>
      `;
      tBody.appendChild(row);
    });
  }
}

function handleSaveLandingHeroCms(e) {
  if (e) e.preventDefault();
  if (!AppState.landingCms) AppState.landingCms = {};
  if (!AppState.landingCms.hero) AppState.landingCms.hero = {};

  const hero = AppState.landingCms.hero;
  hero.badge = document.getElementById('admin-cms-hero-badge').value.trim();
  hero.headlinePre = document.getElementById('admin-cms-hero-pre').value.trim();
  hero.headlinePost = document.getElementById('admin-cms-hero-post').value.trim();
  
  const phrasesRaw = document.getElementById('admin-cms-hero-phrases').value;
  hero.phrases = phrasesRaw.split('\n').map(p => p.trim()).filter(p => p.length > 0);
  if (hero.phrases.length === 0) hero.phrases = ['Web App Sendiri'];

  hero.description = document.getElementById('admin-cms-hero-desc').value.trim();
  hero.ctaText = document.getElementById('admin-cms-hero-cta').value.trim();
  hero.bannerTitle = document.getElementById('admin-cms-hero-bannertitle').value.trim();
  hero.bannerDesc = document.getElementById('admin-cms-hero-bannerdesc').value.trim();

  saveState();
  if (typeof renderLandingFromCms === 'function') renderLandingFromCms();
  if (window.HeroTypewriterController) window.HeroTypewriterController.init();
  showToast('Pengaturan Hero Banner & Typewriter berhasil disimpan!', 'success');
}

function resetLandingHeroToDefault() {
  if (confirm('Kembalikan pengaturan Hero Banner ke bawaan default?')) {
    const zData = window.ZettData || {};
    if (zData.SEED_LANDING_CMS?.hero) {
      AppState.landingCms.hero = JSON.parse(JSON.stringify(zData.SEED_LANDING_CMS.hero));
      saveState();
      renderAdminLandingCms();
      if (typeof renderLandingFromCms === 'function') renderLandingFromCms();
      if (window.HeroTypewriterController) window.HeroTypewriterController.init();
      showToast('Hero Banner berhasil di-reset ke default!', 'info');
    }
  }
}

function openEditUseCaseModal(id) {
  const uc = (AppState.landingCms?.useCases || []).find(u => u.id === id);
  if (!uc) return;

  document.getElementById('edit-usecase-id').value = uc.id;
  document.getElementById('edit-usecase-title').value = uc.title;
  document.getElementById('edit-usecase-icon').value = uc.icon || 'briefcase';
  document.getElementById('edit-usecase-tint').value = uc.tint || 'emerald';
  document.getElementById('edit-usecase-tags').value = (uc.tags || []).join(', ');
  document.getElementById('edit-usecase-desc').value = uc.description || uc.desc || '';

  document.getElementById('modal-edit-usecase').classList.remove('hidden');
}

function closeEditUseCaseModal() {
  document.getElementById('modal-edit-usecase').classList.add('hidden');
}

function handleSaveUseCaseSubmit(e) {
  if (e) e.preventDefault();
  const id = document.getElementById('edit-usecase-id').value;
  const uc = (AppState.landingCms?.useCases || []).find(u => u.id === id);
  if (!uc) return;

  uc.title = document.getElementById('edit-usecase-title').value.trim();
  uc.icon = document.getElementById('edit-usecase-icon').value;
  uc.tint = document.getElementById('edit-usecase-tint').value;
  uc.tags = document.getElementById('edit-usecase-tags').value.split(',').map(t => t.trim()).filter(t => t.length > 0);
  const descVal = document.getElementById('edit-usecase-desc').value.trim();
  uc.description = descVal;
  uc.desc = descVal;

  saveState();
  closeEditUseCaseModal();
  renderAdminLandingCms();
  if (typeof renderLandingFromCms === 'function') renderLandingFromCms();
  showToast('Kartu Target Audiens berhasil diperbarui!', 'success');
}

function resetLandingUseCasesToDefault() {
  if (confirm('Kembalikan 4 kartu target audiens ke bawaan default?')) {
    const zData = window.ZettData || {};
    if (zData.SEED_LANDING_CMS?.useCases) {
      AppState.landingCms.useCases = JSON.parse(JSON.stringify(zData.SEED_LANDING_CMS.useCases));
      saveState();
      renderAdminLandingCms();
      if (typeof renderLandingFromCms === 'function') renderLandingFromCms();
      showToast('Kartu target audiens berhasil di-reset!', 'info');
    }
  }
}

function openAddTestimonialModal() {
  document.getElementById('modal-testi-title').innerHTML = `
    <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
    Tambah Testimoni Member Baru
  `;
  document.getElementById('edit-testi-id').value = '';
  document.getElementById('edit-testi-name').value = '';
  document.getElementById('edit-testi-initials').value = '';
  document.getElementById('edit-testi-role').value = '';
  document.getElementById('edit-testi-tint').value = 'emerald';
  document.getElementById('edit-testi-outcome').value = '';
  document.getElementById('edit-testi-quote').value = '';

  document.getElementById('modal-edit-testimonial').classList.remove('hidden');
}

function openEditTestimonialModal(id) {
  const t = (AppState.landingCms?.testimonials || []).find(item => item.id === id);
  if (!t) return;

  document.getElementById('modal-testi-title').innerHTML = `
    <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
    Edit Testimoni Member
  `;
  document.getElementById('edit-testi-id').value = t.id;
  document.getElementById('edit-testi-name').value = t.name;
  document.getElementById('edit-testi-initials').value = t.initials;
  document.getElementById('edit-testi-role').value = t.role;
  document.getElementById('edit-testi-tint').value = t.tint || 'emerald';
  document.getElementById('edit-testi-outcome').value = t.outcomeBadge || '';
  document.getElementById('edit-testi-quote').value = t.quote;

  document.getElementById('modal-edit-testimonial').classList.remove('hidden');
}

function closeEditTestimonialModal() {
  document.getElementById('modal-edit-testimonial').classList.add('hidden');
}

function handleSaveTestimonialSubmit(e) {
  if (e) e.preventDefault();
  const id = document.getElementById('edit-testi-id').value;
  const name = document.getElementById('edit-testi-name').value.trim();
  const initials = document.getElementById('edit-testi-initials').value.trim().toUpperCase() || name.substring(0, 2).toUpperCase();
  const role = document.getElementById('edit-testi-role').value.trim();
  const tint = document.getElementById('edit-testi-tint').value;
  const outcomeBadge = document.getElementById('edit-testi-outcome').value.trim();
  const quote = document.getElementById('edit-testi-quote').value.trim();

  if (!AppState.landingCms) AppState.landingCms = {};
  if (!Array.isArray(AppState.landingCms.testimonials)) AppState.landingCms.testimonials = [];

  if (id) {
    const target = AppState.landingCms.testimonials.find(item => item.id === id);
    if (target) {
      target.name = name;
      target.initials = initials;
      target.role = role;
      target.tint = tint;
      target.outcomeBadge = outcomeBadge;
      target.quote = quote;
    }
  } else {
    const newId = 'testi-' + Date.now();
    AppState.landingCms.testimonials.unshift({
      id: newId,
      name,
      role,
      initials,
      quote,
      outcomeBadge,
      tint
    });
  }

  saveState();
  closeEditTestimonialModal();
  renderAdminLandingCms();
  if (typeof renderLandingFromCms === 'function') renderLandingFromCms();
  showToast('Testimoni berhasil disimpan!', 'success');
}

function deleteTestimonial(id) {
  if (confirm('Hapus testimoni member ini dari landing page?')) {
    AppState.landingCms.testimonials = (AppState.landingCms.testimonials || []).filter(t => t.id !== id);
    saveState();
    renderAdminLandingCms();
    if (typeof renderLandingFromCms === 'function') renderLandingFromCms();
    showToast('Testimoni telah dihapus', 'info');
  }
}

function resetLandingTestimonialsToDefault() {
  if (confirm('Kembalikan daftar testimoni ke bawaan default?')) {
    const zData = window.ZettData || {};
    if (zData.SEED_LANDING_CMS?.testimonials) {
      AppState.landingCms.testimonials = JSON.parse(JSON.stringify(zData.SEED_LANDING_CMS.testimonials));
      saveState();
      renderAdminLandingCms();
      if (typeof renderLandingFromCms === 'function') renderLandingFromCms();
      showToast('Daftar testimoni berhasil di-reset!', 'info');
    }
  }
}

// ==========================================
// 3. CMS SHARED RESOURCES
// ==========================================

function renderAdminResourcesCms() {
  const tbody = document.getElementById('admin-resources-table-body');
  const countEl = document.getElementById('admin-resource-count');
  if (!tbody) return;

  if (!AppState.resources || !Array.isArray(AppState.resources) || AppState.resources.length === 0) {
    const zData = window.ZettData || {};
    AppState.resources = zData.SEED_RESOURCES ? JSON.parse(JSON.stringify(zData.SEED_RESOURCES)) : [];
    saveState();
  }

  const all = AppState.resources || [];
  const searchVal = (document.getElementById('admin-resource-search-input')?.value || '').toLowerCase();

  const filtered = all.filter(r => 
    r.title.toLowerCase().includes(searchVal) ||
    (r.description && r.description.toLowerCase().includes(searchVal)) ||
    (r.url && r.url.toLowerCase().includes(searchVal)) ||
    (r.badge && r.badge.toLowerCase().includes(searchVal))
  );

  if (countEl) countEl.textContent = `${filtered.length} dari ${all.length} Dokumen Tersedia`;
  tbody.innerHTML = '';

  filtered.forEach((res, idx) => {
    const row = document.createElement('tr');
    row.className = 'border-b border-slate-800/80 hover:bg-slate-900/50 transition-colors text-xs';

    const catClassMap = {
      'sheet': 'bg-emerald-950 text-emerald-300 border-emerald-800',
      'code': 'bg-cyan-950 text-cyan-300 border-cyan-800',
      'prompt': 'bg-purple-950 text-purple-300 border-purple-800',
      'drive': 'bg-amber-950 text-amber-300 border-amber-800',
      'sop': 'bg-blue-950 text-blue-300 border-blue-800'
    };
    const badgeClass = catClassMap[res.category] || 'bg-slate-800 text-slate-300 border-slate-700';

    row.innerHTML = `
      <td class="py-3 px-4 text-center font-mono text-slate-500">${idx + 1}</td>
      <td class="py-3 px-4">
        <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${badgeClass}">
          ${escapeHtml(res.badge || res.category.toUpperCase())}
        </span>
      </td>
      <td class="py-3 px-4 max-w-[280px]">
        <div class="font-bold text-white truncate">${escapeHtml(res.title)}</div>
        <div class="text-[11px] text-slate-400 line-clamp-1">${escapeHtml(res.description || '')}</div>
      </td>
      <td class="py-3 px-4 max-w-[200px]">
        <a href="${res.url}" target="_blank" rel="noopener noreferrer" class="font-mono text-[11px] text-emerald-400 hover:underline truncate block">
          ${escapeHtml(res.url)}
        </a>
      </td>
      <td class="py-3 px-4 font-mono text-[11px] text-slate-400">${escapeHtml(res.date || '-')}</td>
      <td class="py-3 px-4 text-right">
        <div class="flex items-center justify-end gap-1.5">
          <button onclick="openEditResourceModal('${res.id}')" class="p-1.5 text-blue-400 hover:text-white rounded hover:bg-slate-800" title="Edit Dokumen">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <button onclick="deleteResource('${res.id}')" class="p-1.5 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-950/40" title="Hapus Dokumen">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function openEditResourceModal(id) {
  const res = (AppState.resources || []).find(r => r.id === id);
  if (!res) return;

  document.getElementById('edit-res-id').value = res.id;
  document.getElementById('edit-res-title').value = res.title;
  document.getElementById('edit-res-url').value = res.url;
  document.getElementById('edit-res-category').value = res.category || 'sheet';
  document.getElementById('edit-res-badge').value = res.badge || '';
  document.getElementById('edit-res-desc').value = res.description || '';

  document.getElementById('modal-edit-resource').classList.remove('hidden');
}

function closeEditResourceModal() {
  document.getElementById('modal-edit-resource').classList.add('hidden');
}

function handleSaveEditResourceSubmit(e) {
  if (e) e.preventDefault();
  const id = document.getElementById('edit-res-id').value;
  const res = (AppState.resources || []).find(r => r.id === id);
  if (!res) return;

  res.title = document.getElementById('edit-res-title').value.trim();
  res.url = document.getElementById('edit-res-url').value.trim();
  res.category = document.getElementById('edit-res-category').value;
  res.badge = document.getElementById('edit-res-badge').value.trim();
  res.description = document.getElementById('edit-res-desc').value.trim();

  saveState();
  closeEditResourceModal();
  renderAdminResourcesCms();
  if (typeof renderResources === 'function') renderResources();
  showToast('Perubahan dokumen berhasil disimpan!', 'success');
}

function resetResourcesToDefault() {
  if (confirm('Kembalikan seluruh daftar shared resource & link dokumen ke bawaan default?')) {
    const zData = window.ZettData || {};
    AppState.resources = zData.SEED_RESOURCES ? JSON.parse(JSON.stringify(zData.SEED_RESOURCES)) : [];
    saveState();
    renderAdminResourcesCms();
    if (typeof renderResources === 'function') renderResources();
    showToast('Resource berhasil di-reset ke default!', 'info');
  }
}

// ==========================================
// 4. QUICK ACTIONS HUB CMS
// ==========================================

function renderAdminQuickActions() {
  const tbody = document.getElementById('quickactions-table-body');
  if (!tbody) return;

  if (!AppState.quickActions || !Array.isArray(AppState.quickActions) || AppState.quickActions.length === 0) {
    const zData = window.ZettData || {};
    AppState.quickActions = zData.SEED_QUICK_ACTIONS ? JSON.parse(JSON.stringify(zData.SEED_QUICK_ACTIONS)) : [];
    saveState();
  }

  tbody.innerHTML = '';
  const actions = (AppState.quickActions || []).sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  actions.forEach((qa, idx) => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-slate-800/80 hover:bg-slate-900/50 transition-colors text-xs';

    const isUrl = qa.actionType === 'url';
    const actionTypeBadge = isUrl 
      ? '<span class="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/80 font-mono text-[10px]">Link Eksternal</span>'
      : '<span class="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-mono text-[10px]">Halaman LMS</span>';

    tr.innerHTML = `
      <td class="py-3 px-4 text-center font-mono text-slate-500">${idx + 1}</td>
      <td class="py-3 px-4 text-center">
        <div class="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400 mx-auto">
          ${getMonolineSvgIcon(qa.icon, 'w-4 h-4 text-emerald-400')}
        </div>
      </td>
      <td class="py-3 px-4">
        <div class="font-bold text-white">${escapeHtml(qa.title)}</div>
        <div class="text-[11px] text-slate-400">${escapeHtml(qa.subtitle)}</div>
      </td>
      <td class="py-3 px-4">${actionTypeBadge}</td>
      <td class="py-3 px-4 font-mono text-[11px] text-slate-300 max-w-[200px] truncate">
        ${escapeHtml(qa.target || '-')}
      </td>
      <td class="py-3 px-4">
        <span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-mono">
          ${escapeHtml(qa.badge || 'Akses')}
        </span>
      </td>
      <td class="py-3 px-4 text-right">
        <button onclick="openEditQuickActionModal('${qa.id}')" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 transition-colors inline-flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          <span>Edit</span>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openEditQuickActionModal(qaId) {
  const qa = (AppState.quickActions || []).find(a => a.id === qaId);
  if (!qa) return;

  document.getElementById('edit-qa-id').value = qa.id;
  document.getElementById('edit-qa-title').value = qa.title || '';
  document.getElementById('edit-qa-subtitle').value = qa.subtitle || '';
  document.getElementById('edit-qa-icon').value = qa.icon || 'folder';
  document.getElementById('edit-qa-badge').value = qa.badge || '';
  document.getElementById('edit-qa-actiontype').value = qa.actionType || 'navigate';

  toggleQuickActionTargetType();

  if (qa.actionType === 'url') {
    document.getElementById('edit-qa-target-url').value = qa.target || '';
  } else {
    document.getElementById('edit-qa-target-view').value = qa.target || 'resources';
  }

  document.getElementById('modal-edit-quickaction').classList.remove('hidden');
}

function closeEditQuickActionModal() {
  const modal = document.getElementById('modal-edit-quickaction');
  if (modal) modal.classList.add('hidden');
}

function toggleQuickActionTargetType() {
  const select = document.getElementById('edit-qa-actiontype');
  const viewContainer = document.getElementById('container-qa-view');
  const urlContainer = document.getElementById('container-qa-url');
  if (!select || !viewContainer || !urlContainer) return;

  if (select.value === 'url') {
    viewContainer.classList.add('hidden');
    urlContainer.classList.remove('hidden');
  } else {
    viewContainer.classList.remove('hidden');
    urlContainer.classList.add('hidden');
  }
}

function handleSaveQuickActionSubmit(e) {
  if (e) e.preventDefault();

  const id = document.getElementById('edit-qa-id').value;
  const title = document.getElementById('edit-qa-title').value.trim();
  const subtitle = document.getElementById('edit-qa-subtitle').value.trim();
  const icon = document.getElementById('edit-qa-icon').value;
  const badge = document.getElementById('edit-qa-badge').value.trim();
  const actionType = document.getElementById('edit-qa-actiontype').value;
  const target = actionType === 'url'
    ? document.getElementById('edit-qa-target-url').value.trim()
    : document.getElementById('edit-qa-target-view').value;

  if (!title) {
    showToast('Judul kartu tidak boleh kosong', 'error');
    return;
  }

  const qa = (AppState.quickActions || []).find(a => a.id === id);
  if (qa) {
    qa.title = title;
    qa.subtitle = subtitle;
    qa.icon = icon;
    qa.badge = badge;
    qa.actionType = actionType;
    qa.target = target;

    saveState();
    closeEditQuickActionModal();
    renderAdminQuickActions();
    if (typeof renderQuickActionHub === 'function') renderQuickActionHub();
    showToast('Kartu Quick Action berhasil diperbarui!', 'success');
  }
}

function resetQuickActionsToDefault() {
  if (confirm('Kembalikan 4 kartu Quick Action Hub ke pengaturan awal?')) {
    const zData = window.ZettData || {};
    AppState.quickActions = zData.SEED_QUICK_ACTIONS ? JSON.parse(JSON.stringify(zData.SEED_QUICK_ACTIONS)) : [];
    saveState();
    renderAdminQuickActions();
    if (typeof renderQuickActionHub === 'function') renderQuickActionHub();
    showToast('Quick Action Hub berhasil di-reset ke default!', 'info');
  }
}

// ==========================================
// 5. CURRICULUM MANAGEMENT & NOTION BLOCK EDITOR
// ==========================================

function renderAdminCurriculum() {
  const lessonSelect = document.getElementById('admin-lesson-select');
  const moduleSelect = document.getElementById('admin-edit-module');
  if (!lessonSelect) return;

  if (AppState.modules.length === 0) {
    lessonSelect.innerHTML = '<option value="">(Belum ada modul & materi)</option>';
    if (moduleSelect) moduleSelect.innerHTML = '<option value="">(Belum ada modul)</option>';
    AppState.adminSelectedLessonId = null;
    const titleInp = document.getElementById('admin-edit-title');
    const ytInp = document.getElementById('admin-edit-youtube');
    const durInp = document.getElementById('admin-edit-duration');
    if (titleInp) titleInp.value = '';
    if (ytInp) ytInp.value = '';
    if (durInp) durInp.value = '15';
    const previewContainer = document.getElementById('editor-live-preview');
    if (previewContainer) {
      previewContainer.innerHTML = `
        <div class="py-12 text-center text-slate-400">
          <p class="text-sm font-semibold text-white mb-1">Kurikulum Bersih (0 Modul)</p>
          <p class="text-xs">Klik tombol <strong>+ Modul Baru</strong> di atas untuk membuat modul dan mulai menyusun materi.</p>
        </div>
      `;
    }
    const editorRoot = document.getElementById('notion-editor-root');
    if (editorRoot) {
      editorRoot.innerHTML = `
        <div class="py-10 text-center text-slate-500 font-mono text-xs">
          [Editor Standby - Buat Modul &amp; Tambahkan Materi Baru untuk Mulai Mengetik Blok Notion]
        </div>
      `;
    }
    return;
  }

  if (moduleSelect) {
    moduleSelect.innerHTML = '';
    AppState.modules.sort((a, b) => a.orderIndex - b.orderIndex).forEach(mod => {
      const mOpt = document.createElement('option');
      mOpt.value = mod.id;
      mOpt.textContent = mod.title;
      moduleSelect.appendChild(mOpt);
    });
  }

  lessonSelect.innerHTML = '';
  AppState.modules.sort((a, b) => a.orderIndex - b.orderIndex).forEach(mod => {
    const optgroup = document.createElement('optgroup');
    optgroup.label = mod.title;
    const modLessons = AppState.lessons.filter(l => l.moduleId === mod.id);
    modLessons.forEach(l => {
      const opt = document.createElement('option');
      opt.value = l.id;
      opt.textContent = l.title;
      if (l.id === AppState.adminSelectedLessonId) opt.selected = true;
      optgroup.appendChild(opt);
    });
    lessonSelect.appendChild(optgroup);
  });

  const selectedLesson = AppState.lessons.find(l => l.id === lessonSelect.value) || AppState.lessons[0];
  if (selectedLesson) {
    loadLessonToEditor(selectedLesson);
  } else {
    AppState.adminSelectedLessonId = null;
    const titleInp = document.getElementById('admin-edit-title');
    const ytInp = document.getElementById('admin-edit-youtube');
    const durInp = document.getElementById('admin-edit-duration');
    if (titleInp) titleInp.value = '';
    if (ytInp) ytInp.value = '';
    if (durInp) durInp.value = '15';
    const previewContainer = document.getElementById('editor-live-preview');
    if (previewContainer) {
      previewContainer.innerHTML = `
        <div class="py-12 text-center text-slate-400">
          <p class="text-sm font-semibold text-white mb-1">Belum ada materi dalam modul</p>
          <p class="text-xs">Klik tombol <strong>+ Materi Baru</strong> di atas untuk menambahkan materi ke modul ini.</p>
        </div>
      `;
    }
    const editorRoot = document.getElementById('notion-editor-root');
    if (editorRoot) {
      editorRoot.innerHTML = `
        <div class="py-10 text-center text-slate-500 font-mono text-xs">
          [Pilih atau Tambahkan Materi Baru untuk Membuka Blok Editor Notion]
        </div>
      `;
    }
  }

  lessonSelect.onchange = (e) => {
    const target = AppState.lessons.find(l => l.id === e.target.value);
    if (target) loadLessonToEditor(target);
  };
}

function loadLessonToEditor(lesson) {
  AppState.adminSelectedLessonId = lesson.id;
  document.getElementById('admin-edit-title').value = lesson.title;
  document.getElementById('admin-edit-youtube').value = lesson.youtubeUrl || '';
  document.getElementById('admin-edit-duration').value = lesson.durationMinutes || 15;
  const moduleSelect = document.getElementById('admin-edit-module');
  if (moduleSelect) moduleSelect.value = lesson.moduleId;

  const editorContainer = document.getElementById('notion-editor-root');
  if (editorContainer) {
    AppState.editorInstance = new NotionBlockEditor('notion-editor-root', lesson.blocks, (updatedBlocks) => {
      updateEditorLivePreview(updatedBlocks);
    });
    updateEditorLivePreview(lesson.blocks);
  }
}

function updateEditorLivePreview(blocks) {
  const previewContainer = document.getElementById('editor-live-preview');
  if (previewContainer) {
    previewContainer.innerHTML = renderBlocksToHtml(blocks);
  }
}

function saveLessonFromEditor() {
  if (!AppState.editorInstance || !AppState.adminSelectedLessonId) return;

  const lesson = AppState.lessons.find(l => l.id === AppState.adminSelectedLessonId);
  if (!lesson) return;

  lesson.title = document.getElementById('admin-edit-title').value.trim();
  lesson.youtubeUrl = document.getElementById('admin-edit-youtube').value.trim();
  lesson.durationMinutes = parseInt(document.getElementById('admin-edit-duration').value) || 15;
  const moduleSelect = document.getElementById('admin-edit-module');
  if (moduleSelect) lesson.moduleId = moduleSelect.value;
  lesson.blocks = AppState.editorInstance.getBlocks();

  saveState();
  showToast('Perubahan materi berhasil disimpan ke sistem', 'success');
  renderAdminCurriculum();
  if (typeof renderLandingCurriculumBento === 'function') renderLandingCurriculumBento();
}

function addNewModulePrompt() {
  const title = prompt('Masukkan Judul Modul Baru:');
  if (!title || !title.trim()) return;

  const desc = prompt('Masukkan Deskripsi Singkat Modul:', 'Modul pembelajaran web app.');
  const newModId = 'mod-' + Date.now();
  const modCount = AppState.modules.length + 1;
  const newMod = {
    id: newModId,
    title: title.trim(),
    category: 'ai',
    description: (desc || '').trim(),
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    orderIndex: modCount,
    badge: `MODUL 0${modCount}`,
    isLocked: false
  };

  AppState.modules.push(newMod);
  saveState();
  showToast(`Modul '${newMod.title}' berhasil dibuat! Sekarang Anda dapat menambahkan materi ke modul ini.`, 'success');
  renderAdminCurriculum();
  if (typeof renderLandingCurriculumBento === 'function') renderLandingCurriculumBento();
}
window.addNewModulePrompt = addNewModulePrompt;

function addNewLessonPrompt() {
  if (AppState.modules.length === 0) {
    showToast('Belum ada modul kurikulum. Buat modul pertama terlebih dahulu dengan tombol [+ Modul Baru]', 'warning');
    addNewModulePrompt();
    return;
  }

  const title = prompt('Masukkan Judul Video/Materi Baru:');
  if (!title || !title.trim()) return;

  const moduleSelect = document.getElementById('admin-edit-module');
  const targetModuleId = (moduleSelect && moduleSelect.value) ? moduleSelect.value : AppState.modules[0].id;

  const newId = 'les-' + Date.now();
  const newLesson = {
    id: newId,
    moduleId: targetModuleId,
    title: title.trim(),
    durationMinutes: 15,
    orderIndex: AppState.lessons.filter(l => l.moduleId === targetModuleId).length + 1,
    youtubeUrl: '',
    blocks: [
      { type: 'h1', content: title.trim() },
      { type: 'callout', content: 'Catatan penting untuk materi ini...' },
      { type: 'text', content: 'Tulis penjelasan materi di sini...' }
    ]
  };

  AppState.lessons.push(newLesson);
  AppState.adminSelectedLessonId = newId;
  saveState();
  showToast('Materi video baru berhasil ditambahkan! Silakan lengkapi isi blok dan link YouTube videonya.', 'success');
  renderAdminCurriculum();
  if (typeof renderLandingCurriculumBento === 'function') renderLandingCurriculumBento();
}
window.addNewLessonPrompt = addNewLessonPrompt;

function deleteCurrentLesson() {
  if (!AppState.adminSelectedLessonId) {
    showToast('Pilih materi yang ingin dihapus terlebih dahulu', 'error');
    return;
  }

  const lesson = AppState.lessons.find(l => l.id === AppState.adminSelectedLessonId);
  if (!lesson) return;

  if (confirm(`Hapus materi '${lesson.title}' dari kurikulum?`)) {
    const idx = AppState.lessons.findIndex(l => l.id === lesson.id);
    if (idx > -1) {
      AppState.lessons.splice(idx, 1);
      AppState.adminSelectedLessonId = AppState.lessons[0]?.id || null;
      saveState();
      showToast('Materi telah dihapus', 'info');
      renderAdminCurriculum();
      if (typeof renderLandingCurriculumBento === 'function') renderLandingCurriculumBento();
    }
  }
}
window.deleteCurrentLesson = deleteCurrentLesson;

// ==========================================
// 6. WHITELIST MEMBER & ACCESS
// ==========================================

function renderAdminWhitelist() {
  const tableBody = document.getElementById('whitelist-table-body');
  if (!tableBody) return;

  tableBody.innerHTML = '';
  const searchVal = (document.getElementById('whitelist-search')?.value || '').toLowerCase();

  const filtered = AppState.whitelist.filter(m => 
    m.email.toLowerCase().includes(searchVal) || 
    (m.fullName && m.fullName.toLowerCase().includes(searchVal))
  );

  const countBadge = document.getElementById('whitelist-total-count');
  if (countBadge) {
    countBadge.textContent = `${AppState.whitelist.length} Member Terdaftar`;
  }

  filtered.forEach(m => {
    const row = document.createElement('tr');
    row.className = 'border-b border-slate-800/80 hover:bg-slate-900/50 text-xs transition-colors';

    row.innerHTML = `
      <td class="py-3 px-4 font-medium text-white">${m.fullName || '-'}</td>
      <td class="py-3 px-4 text-emerald-400 font-mono">${m.email}</td>
      <td class="py-3 px-4">
        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${m.role === 'admin' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-800 text-slate-300'}">
          ${m.role.toUpperCase()}
        </span>
      </td>
      <td class="py-3 px-4">
        <button onclick="toggleMemberActive('${m.id}')" class="px-2.5 py-1 rounded-full text-[10px] font-semibold ${m.isActive ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' : 'bg-rose-950 text-rose-400 border border-rose-800/60'}">
          ${m.isActive ? 'Aktif' : 'Diblokir'}
        </button>
      </td>
      <td class="py-3 px-4 text-right">
        <button onclick="deleteMember('${m.id}')" class="text-rose-400 hover:text-rose-300 p-1 hover:bg-rose-950/40 rounded transition-colors" title="Hapus dari Whitelist">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function handleAddSingleMember(e) {
  e.preventDefault();
  const emailInput = document.getElementById('add-member-email');
  const nameInput = document.getElementById('add-member-name');

  const email = emailInput.value.trim().toLowerCase();
  const name = nameInput.value.trim() || email.split('@')[0];

  if (!email) return;

  if (AppState.whitelist.some(m => m.email.toLowerCase() === email)) {
    showToast('Email ini sudah ada di dalam whitelist!', 'error');
    return;
  }

  AppState.whitelist.push({
    id: 'wl-' + Date.now(),
    email: email,
    fullName: name,
    role: 'member',
    isActive: true,
    enrolledAt: new Date().toISOString()
  });

  saveState();
  emailInput.value = '';
  nameInput.value = '';
  showToast(`Berhasil menambahkan ${email} ke Whitelist!`, 'success');
  renderAdminWhitelist();
}

function handleBatchAddMembers() {
  const textarea = document.getElementById('batch-emails-textarea');
  const rawText = textarea.value.trim();
  if (!rawText) {
    showToast('Masukkan daftar email terlebih dahulu', 'error');
    return;
  }

  const emails = rawText.split(/[\n,;\s]+/).map(e => e.trim().toLowerCase()).filter(e => e && e.includes('@'));
  let addedCount = 0;

  emails.forEach(email => {
    if (!AppState.whitelist.some(m => m.email.toLowerCase() === email)) {
      AppState.whitelist.push({
        id: 'wl-' + (Date.now() + Math.random()),
        email: email,
        fullName: email.split('@')[0],
        role: 'member',
        isActive: true,
        enrolledAt: new Date().toISOString()
      });
      addedCount++;
    }
  });

  saveState();
  textarea.value = '';
  document.getElementById('modal-batch-whitelist').classList.add('hidden');
  showToast(`Selesai! ${addedCount} email baru berhasil didaftarkan ke Whitelist.`, 'success');
  renderAdminWhitelist();
}

function toggleMemberActive(id) {
  const member = AppState.whitelist.find(m => m.id === id);
  if (!member) return;
  member.isActive = !member.isActive;
  saveState();
  renderAdminWhitelist();
  showToast(`Status ${member.email} diubah menjadi ${member.isActive ? 'Aktif' : 'Diblokir'}`, 'info');
}

function deleteMember(id) {
  const member = AppState.whitelist.find(m => m.id === id);
  if (!member) return;
  if (confirm(`Hapus ${member.email} dari daftar whitelist pendaftar?`)) {
    AppState.whitelist = AppState.whitelist.filter(m => m.id !== id);
    saveState();
    renderAdminWhitelist();
    showToast(`Email ${member.email} telah dihapus dari Whitelist`, 'info');
  }
}

// ==========================================
// 7. SISWA PROGRESS ANALYTICS
// ==========================================

function renderAdminAnalytics() {
  const tableBody = document.getElementById('analytics-table-body');
  if (!tableBody) return;

  tableBody.innerHTML = '';
  const totalLessons = AppState.lessons.length;

  AppState.whitelist.forEach(m => {
    const completedList = AppState.progress[m.email] || [];
    const count = completedList.length;
    const percent = totalLessons > 0 ? Math.round((count / totalLessons) * 100) : 0;

    const row = document.createElement('tr');
    row.className = 'border-b border-slate-800/80 hover:bg-slate-900/50 text-xs transition-colors';

    row.innerHTML = `
      <td class="py-3 px-4 font-medium text-white">${m.fullName || '-'}</td>
      <td class="py-3 px-4 text-slate-400 font-mono">${m.email}</td>
      <td class="py-3 px-4 text-emerald-400 font-semibold">${count} dari ${totalLessons} Materi</td>
      <td class="py-3 px-4">
        <div class="flex items-center gap-3">
          <div class="w-28 h-2 rounded-full bg-slate-800 overflow-hidden">
            <div class="h-full bg-emerald-500 rounded-full" style="width: ${percent}%"></div>
          </div>
          <span class="font-bold ${percent === 100 ? 'text-emerald-400' : 'text-slate-300'}">${percent}%</span>
        </div>
      </td>
      <td class="py-3 px-4 text-right">
        <span class="px-2 py-0.5 rounded text-[10px] ${percent === 100 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'}">
          ${percent === 100 ? 'Lulus / Selesai' : 'Sedang Belajar'}
        </span>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Global window bindings
window.renderAdminPanel = renderAdminPanel;
window.switchAdminTab = switchAdminTab;
window.renderAdminCurriculum = renderAdminCurriculum;
window.loadLessonToEditor = loadLessonToEditor;
window.updateEditorLivePreview = updateEditorLivePreview;
window.saveLessonFromEditor = saveLessonFromEditor;
window.addNewLessonPrompt = addNewLessonPrompt;
window.renderAdminWhitelist = renderAdminWhitelist;
window.handleAddSingleMember = handleAddSingleMember;
window.handleBatchAddMembers = handleBatchAddMembers;
window.toggleMemberActive = toggleMemberActive;
window.deleteMember = deleteMember;
window.renderAdminAnalytics = renderAdminAnalytics;
window.renderAdminLandingCms = renderAdminLandingCms;
window.handleSaveLandingHeroCms = handleSaveLandingHeroCms;
window.resetLandingHeroToDefault = resetLandingHeroToDefault;
window.openEditUseCaseModal = openEditUseCaseModal;
window.closeEditUseCaseModal = closeEditUseCaseModal;
window.handleSaveUseCaseSubmit = handleSaveUseCaseSubmit;
window.resetLandingUseCasesToDefault = resetLandingUseCasesToDefault;
window.openAddTestimonialModal = openAddTestimonialModal;
window.openEditTestimonialModal = openEditTestimonialModal;
window.closeEditTestimonialModal = closeEditTestimonialModal;
window.handleSaveTestimonialSubmit = handleSaveTestimonialSubmit;
window.deleteTestimonial = deleteTestimonial;
window.resetLandingTestimonialsToDefault = resetLandingTestimonialsToDefault;
window.renderAdminResourcesCms = renderAdminResourcesCms;
window.openEditResourceModal = openEditResourceModal;
window.closeEditResourceModal = closeEditResourceModal;
window.handleSaveEditResourceSubmit = handleSaveEditResourceSubmit;
window.resetResourcesToDefault = resetResourcesToDefault;
window.renderAdminQuickActions = renderAdminQuickActions;
window.openEditQuickActionModal = openEditQuickActionModal;
window.closeEditQuickActionModal = closeEditQuickActionModal;
window.toggleQuickActionTargetType = toggleQuickActionTargetType;
window.handleSaveQuickActionSubmit = handleSaveQuickActionSubmit;
window.resetQuickActionsToDefault = resetQuickActionsToDefault;
