/**
 * Zettbos LMS - Shared Resources & Documents Controller
 * js/controllers/resources.js
 * Menangani repository file shared, dokumen spreadsheet GAS, prompt AI, kode snippet & filter kategori.
 */

function filterResourceCategory(category) {
  AppState.activeResourceCategory = category;
  renderResources();
}

function handleSearchResources() {
  const input = document.getElementById('resource-search-input');
  AppState.resourceSearchQuery = input ? input.value.trim().toLowerCase() : '';
  renderResources();
}

function openAddResourceModal() {
  const modal = document.getElementById('modal-add-resource');
  if (modal) modal.classList.remove('hidden');
}

function closeAddResourceModal() {
  const modal = document.getElementById('modal-add-resource');
  if (modal) modal.classList.add('hidden');
}

function handleAddResourceSubmit(event) {
  event.preventDefault();
  const title = document.getElementById('new-res-title').value.trim();
  const url = document.getElementById('new-res-url').value.trim();
  const category = document.getElementById('new-res-category').value;
  const badge = document.getElementById('new-res-badge').value.trim() || 'Official Link';
  const description = document.getElementById('new-res-desc').value.trim();

  if (!title || !url) {
    showToast('Harap isi judul dan link URL dokumen', 'error');
    return;
  }

  const newRes = {
    id: generateFormattedId('RES', AppState.resources, 2),
    title,
    description,
    url,
    category,
    badge,
    icon: category,
    date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  };

  AppState.resources.unshift(newRes);
  saveState();

  if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
    ZettSupabase.client.from('shared_resources').upsert({
      id: newRes.id,
      title: newRes.title,
      description: newRes.description || '',
      url: newRes.url,
      category: newRes.category || 'sheet',
      badge: newRes.badge || 'Official Link',
      order_index: 1
    }, { onConflict: 'id' }).then(({ error }) => {
      if (error) console.warn('[Supabase Shared Resources Insert Warning]', error);
    });
  }

  closeAddResourceModal();
  event.target.reset();
  showToast('Link dokumen berhasil dibagikan & LIVE ke Database!', 'success');
  renderResources();
  if (typeof renderAdminResourcesCms === 'function') {
    renderAdminResourcesCms();
  }
}

function deleteResource(resId) {
  const user = AppState.currentUser;
  const isSuperAdmin = user && user.role === 'admin' && user.email.toLowerCase() === 'zettbos2025@gmail.com';
  if (!isSuperAdmin) {
    showToast('Hanya Super Admin yang dapat menghapus link dokumen', 'error');
    return;
  }

  showCustomConfirm({
    title: 'Hapus Dokumen Shared?',
    message: 'Hapus link dokumen ini dari daftar member secara permanen?',
    confirmText: 'Ya, Hapus Dokumen',
    cancelText: 'Batal',
    isDanger: true,
    onConfirm: () => {
      const idx = AppState.resources.findIndex(r => r.id === resId);
      if (idx > -1) {
        AppState.resources.splice(idx, 1);
        saveState();

        if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
          ZettSupabase.client.from('shared_resources').delete().eq('id', resId).then(({ error }) => {
            if (error) console.warn('[Supabase Shared Resources Delete Warning]', error);
          });
        }

        showToast('Link dokumen telah dihapus dari database', 'info');
        renderResources();
        if (typeof renderAdminResourcesCms === 'function') {
          renderAdminResourcesCms();
        }
      }
    }
  });
}

function renderResources() {
  const container = document.getElementById('resources-grid-container');
  const emptyState = document.getElementById('resources-empty-state');
  if (!container) return;

  const allResources = AppState.resources || [];

  // Update Category Tab Counts
  const countAll = allResources.length;
  const countSheet = allResources.filter(r => r.category === 'sheet').length;
  const countCode = allResources.filter(r => r.category === 'code').length;
  const countPrompt = allResources.filter(r => r.category === 'prompt' || r.category === 'sop').length;
  const countDrive = allResources.filter(r => r.category === 'drive').length;

  const cAll = document.getElementById('res-count-all');
  const cSheet = document.getElementById('res-count-sheet');
  const cCode = document.getElementById('res-count-code');
  const cPrompt = document.getElementById('res-count-prompt');
  const cDrive = document.getElementById('res-count-drive');

  if (cAll) cAll.textContent = countAll;
  if (cSheet) cSheet.textContent = countSheet;
  if (cCode) cCode.textContent = countCode;
  if (cPrompt) cPrompt.textContent = countPrompt;
  if (cDrive) cDrive.textContent = countDrive;

  // Update Tab Styling
  const categories = ['all', 'sheet', 'code', 'prompt', 'drive'];
  categories.forEach(cat => {
    const tabBtn = document.getElementById(`res-tab-${cat}`);
    if (tabBtn) {
      if (AppState.activeResourceCategory === cat) {
        tabBtn.className = 'px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/50 shadow-sm transition-colors';
      } else {
        tabBtn.className = 'px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors';
      }
    }
  });

  // Filter List
  let filtered = allResources;
  if (AppState.activeResourceCategory !== 'all') {
    if (AppState.activeResourceCategory === 'prompt') {
      filtered = filtered.filter(r => r.category === 'prompt' || r.category === 'sop');
    } else {
      filtered = filtered.filter(r => r.category === AppState.activeResourceCategory);
    }
  }

  if (AppState.resourceSearchQuery) {
    const q = AppState.resourceSearchQuery;
    filtered = filtered.filter(r => 
      r.title.toLowerCase().includes(q) || 
      (r.description && r.description.toLowerCase().includes(q)) ||
      (r.badge && r.badge.toLowerCase().includes(q))
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');
  container.innerHTML = '';

  const user = AppState.currentUser;
  const isSuperAdmin = user && user.role === 'admin' && user.email.toLowerCase() === 'zettbos2025@gmail.com';

  // Toggle '+ Bagikan Link Dokumen' button strictly for Super Admin
  const addBtn = document.getElementById('btn-admin-add-resource');
  if (addBtn) {
    if (isSuperAdmin) addBtn.classList.remove('hidden');
    else addBtn.classList.add('hidden');
  }

  filtered.forEach(item => {
    const card = document.createElement('div');
    const tintClassMap = {
      'sheet': 'card-tint-emerald',
      'code': 'card-tint-cyan',
      'prompt': 'card-tint-purple',
      'sop': 'card-tint-purple',
      'drive': 'card-tint-amber'
    };
    const tintClass = tintClassMap[item.category] || '';
    card.className = `glass-card glass-card-translucent ${tintClass} rounded-2xl p-4 sm:p-5 flex flex-col justify-between group relative overflow-hidden transition-all duration-200`;

    const badgeColorMap = {
      'sheet': 'bg-emerald-950/90 text-emerald-300 border-emerald-800/80',
      'code': 'bg-cyan-950/90 text-cyan-300 border-cyan-800/80',
      'prompt': 'bg-purple-950/90 text-purple-300 border-purple-800/80',
      'drive': 'bg-amber-950/90 text-amber-300 border-amber-800/80',
      'sop': 'bg-blue-950/90 text-blue-300 border-blue-800/80'
    };
    const badgeClass = badgeColorMap[item.category] || 'bg-slate-800 text-slate-300 border-slate-700';

    const categorySvgMap = {
      'sheet': `<svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`,
      'code': `<svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>`,
      'prompt': `<svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
      'drive': `<svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>`,
      'sop': `<svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`
    };
    const itemIconSvg = categorySvgMap[item.category] || categorySvgMap['sop'];

    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between gap-2 mb-2.5">
          <div class="flex items-center gap-1.5">
            <span class="flex-shrink-0">${itemIconSvg}</span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded border tracking-caps ${badgeClass}">
              ${escapeHtml(item.badge || 'DOKUMEN')}
            </span>
          </div>
          <span class="text-[10px] text-slate-500 font-mono">${item.date || ''}</span>
        </div>

        <h3 class="text-xs sm:text-sm font-bold text-white mb-1.5 leading-snug group-hover:text-emerald-300 transition-colors line-clamp-1">
          ${escapeHtml(item.title)}
        </h3>

        <p class="text-xs text-slate-400 mb-3 leading-relaxed line-clamp-2">
          ${escapeHtml(item.description || 'Tautan dokumen resmi untuk pembelajaran.')}
        </p>

        <div class="flex flex-wrap items-center gap-1.5 mb-3">
          <span class="micro-tag-pill">
            <svg class="w-2.5 h-2.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            <span>${escapeHtml(item.badge || 'Resource')}</span>
          </span>
          <span class="micro-tag-pill">
            <svg class="w-2.5 h-2.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            <span>Verified Link</span>
          </span>
        </div>
      </div>

      <div class="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
        <div class="flex items-center gap-1.5">
          <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="btn-primary-action px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all">
            <span>Buka Dokumen</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          </a>
          <button onclick="navigator.clipboard.writeText('${item.url}').then(() => showToast('Tautan dokumen berhasil disalin', 'success'))" title="Salin Link" class="px-2 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 flex items-center gap-1 transition-colors">
            <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
            <span class="hidden sm:inline text-[11px]">Salin</span>
          </button>
        </div>

        ${isSuperAdmin ? `
          <button onclick="deleteResource('${item.id}')" title="Hapus Dokumen" class="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        ` : ''}
      </div>
    `;

    container.appendChild(card);
  });
}

// Global window bindings
window.filterResourceCategory = filterResourceCategory;
window.handleSearchResources = handleSearchResources;
window.openAddResourceModal = openAddResourceModal;
window.closeAddResourceModal = closeAddResourceModal;
window.handleAddResourceSubmit = handleAddResourceSubmit;
window.deleteResource = deleteResource;
window.renderResources = renderResources;
