/**
 * Zettbos LMS - Shared Resources & Documents Controller (ZettLink)
 * js/controllers/resources.js
 * Menangani repository ZettLink: folder dinamis (ala Gambar 2 dengan estetika Gambar 1),
 * filter kategori CMS, sinkronisasi state, dan akses link dokumen.
 */

// State tracking for accordion folder expand/collapse
window._expandedFoldersState = window._expandedFoldersState || {};

function toggleFolderAccordion(folderId) {
  if (typeof window._expandedFoldersState[folderId] === 'undefined') {
    window._expandedFoldersState[folderId] = false; // Default was expanded, toggle to collapse
  } else {
    window._expandedFoldersState[folderId] = !window._expandedFoldersState[folderId];
  }
  renderResources();
}

function filterResourceCategory(categoryId) {
  AppState.activeResourceCategory = categoryId;
  renderResources();
}

function handleSearchResources() {
  const input = document.getElementById('resource-search-input');
  AppState.resourceSearchQuery = input ? input.value.trim().toLowerCase() : '';
  renderResources();
}

function openAddResourceModal() {
  populateCategoryDropdowns();
  const modal = document.getElementById('modal-add-resource');
  if (modal) modal.classList.remove('hidden');
}

function closeAddResourceModal() {
  const modal = document.getElementById('modal-add-resource');
  if (modal) modal.classList.add('hidden');
}

function populateCategoryDropdowns() {
  const categories = AppState.resourceCategories || [];
  const addSelect = document.getElementById('new-res-category');
  const editSelect = document.getElementById('edit-res-category');

  const optionsHtml = categories.map(cat => {
    return `<option value="${escapeHtml(cat.id)}">${escapeHtml(cat.name)}</option>`;
  }).join('') + `<option value="other">Lainnya / Umum</option>`;

  if (addSelect) {
    const curVal = addSelect.value;
    addSelect.innerHTML = optionsHtml;
    if (curVal && categories.some(c => c.id === curVal)) {
      addSelect.value = curVal;
    }
  }

  if (editSelect) {
    const curVal = editSelect.value;
    editSelect.innerHTML = optionsHtml;
    if (curVal && categories.some(c => c.id === curVal)) {
      editSelect.value = curVal;
    }
  }
}

async function handleAddResourceSubmit(event) {
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
    try {
      const { error } = await ZettSupabase.client.from('shared_resources').upsert({
        id: newRes.id,
        title: newRes.title,
        description: newRes.description || '',
        url: newRes.url,
        category: newRes.category || 'cat-modul',
        badge: newRes.badge || 'Official Link',
        order_index: 1
      }, { onConflict: 'id' });
      if (error) throw error;
      showToast('Link ZettLink berhasil dibagikan & LIVE ke Cloud!', 'success');
    } catch (err) {
      console.error('[Supabase Shared Resources Error]', err);
      showToast(`Tersimpan lokal, tapi gagal kirim ke Database: ${err.message || 'RLS'}`, 'warning');
    }
  } else {
    showToast('Link ZettLink berhasil disimpan secara lokal!', 'info');
  }

  closeAddResourceModal();
  event.target.reset();
  renderResources();
  if (typeof renderAdminResourcesCms === 'function') {
    renderAdminResourcesCms();
  }
}

function deleteResource(resId) {
  const user = AppState.currentUser;
  const isSuperAdmin = user && (user.role === 'admin' || user.email?.toLowerCase() === 'zettbos2025@gmail.com');
  if (!isSuperAdmin) {
    showToast('Hanya Administrator yang dapat menghapus link dokumen', 'error');
    return;
  }

  showCustomConfirm({
    title: 'Hapus Link ZettLink?',
    message: 'Hapus link ini dari ZettLink secara permanen?',
    confirmText: 'Ya, Hapus Link',
    cancelText: 'Batal',
    isDanger: true,
    onConfirm: async () => {
      const idx = AppState.resources.findIndex(r => r.id === resId);
      if (idx > -1) {
        AppState.resources.splice(idx, 1);
        saveState();

        if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
          try {
            const { error } = await ZettSupabase.client.from('shared_resources').delete().eq('id', resId);
            if (error) throw error;
            showToast('Link telah dihapus dari database & lokal', 'info');
          } catch (err) {
            console.error('[Supabase Resource Delete Error]', err);
            showToast(`Dihapus lokal, tapi gagal di database: ${err.message || 'RLS'}`, 'warning');
          }
        } else {
          showToast('Link telah dihapus', 'info');
        }

        renderResources();
        if (typeof renderAdminResourcesCms === 'function') {
          renderAdminResourcesCms();
        }
      }
    }
  });
}

function getCategoryIconSvg(iconType, extraClass = 'w-4 h-4 text-emerald-400') {
  switch (iconType) {
    case 'video':
      return `<svg class="${extraClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>`;
    case 'bot':
      return `<svg class="${extraClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`;
    case 'prompt':
      return `<svg class="${extraClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`;
    case 'library':
      return `<svg class="${extraClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`;
    case 'sheet':
      return `<svg class="${extraClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`;
    case 'code':
      return `<svg class="${extraClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>`;
    case 'drive':
      return `<svg class="${extraClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>`;
    default:
      return `<svg class="${extraClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>`;
  }
}

function renderResources() {
  const container = document.getElementById('resources-grid-container');
  const tabsContainer = document.getElementById('zettlink-category-tabs');
  const emptyState = document.getElementById('resources-empty-state');
  if (!container) return;

  const allResources = AppState.resources || [];
  const categories = AppState.resourceCategories || [];

  // 1. Render Dynamic Filter Tabs (Anti-Hardcode)
  if (tabsContainer) {
    const totalCount = allResources.length;
    const isAllActive = AppState.activeResourceCategory === 'all';

    let tabsHtml = `
      <button 
        onclick="filterResourceCategory('all')" 
        class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${isAllActive ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'}"
      >
        <span>Semua Link</span>
        <span class="font-mono text-[11px] opacity-80">(${totalCount})</span>
      </button>
    `;

    categories.forEach(cat => {
      const catCount = allResources.filter(r => 
        r.category === cat.id || 
        (r.category || '').toLowerCase() === cat.name.toLowerCase() ||
        (r.category || '').toLowerCase().replace(/[^a-z0-9]/g, '') === cat.name.toLowerCase().replace(/[^a-z0-9]/g, '')
      ).length;

      const isActive = AppState.activeResourceCategory === cat.id;

      tabsHtml += `
        <button 
          onclick="filterResourceCategory('${escapeHtml(cat.id)}')" 
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${isActive ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'}"
        >
          <span>${getCategoryIconSvg(cat.icon, 'w-3.5 h-3.5 text-emerald-400')}</span>
          <span>${escapeHtml(cat.name)}</span>
          <span class="font-mono text-[11px] opacity-80">(${catCount})</span>
        </button>
      `;
    });

    tabsContainer.innerHTML = tabsHtml;
  }

  // 2. Filter Resources by Search Query and Active Category
  let filtered = allResources;
  const searchQ = (AppState.resourceSearchQuery || '').toLowerCase();

  if (searchQ) {
    filtered = filtered.filter(r => 
      r.title.toLowerCase().includes(searchQ) || 
      (r.description && r.description.toLowerCase().includes(searchQ)) ||
      (r.badge && r.badge.toLowerCase().includes(searchQ)) ||
      (r.url && r.url.toLowerCase().includes(searchQ))
    );
  }

  const user = AppState.currentUser;
  const isSuperAdmin = user && (user.role === 'admin' || user.email?.toLowerCase() === 'zettbos2025@gmail.com');

  // Toggle '+ Bagikan Link ke ZettLink' button strictly for Super Admin
  const addBtn = document.getElementById('btn-admin-add-resource');
  if (addBtn) {
    if (isSuperAdmin) addBtn.classList.remove('hidden');
    else addBtn.classList.add('hidden');
  }

  if (filtered.length === 0) {
    container.innerHTML = '';
    if (emptyState) {
      emptyState.classList.remove('hidden');
      const emptyTitle = emptyState.querySelector('h3');
      const emptyDesc = emptyState.querySelector('p');
      if (emptyTitle) emptyTitle.textContent = searchQ ? 'Tidak Ada Link Ditemukan' : 'Belum Ada Link di ZettLink';
      if (emptyDesc) emptyDesc.textContent = searchQ 
        ? 'Tidak ada link dokumen yang cocok dengan kata kunci pencarian Anda.' 
        : 'Mentor Zettbos akan segera membagikan template dan tools pembelajaran di sini.';
    }
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');
  container.innerHTML = '';

  // 3. Group Filtered Resources into Categories/Folders (Ala Gambar 2 dengan Desain Gambar 1)
  // Determine folders to display
  let foldersToDisplay = [];
  if (AppState.activeResourceCategory === 'all') {
    foldersToDisplay = categories;
  } else {
    foldersToDisplay = categories.filter(c => c.id === AppState.activeResourceCategory);
  }

  // Also catch unassigned / legacy resources
  const assignedResIds = new Set();

  foldersToDisplay.forEach(cat => {
    const matchingItems = filtered.filter(r => {
      const match = r.category === cat.id || 
                    (r.category || '').toLowerCase() === cat.name.toLowerCase() ||
                    (r.category || '').toLowerCase().replace(/[^a-z0-9]/g, '') === cat.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (match) assignedResIds.add(r.id);
      return match;
    });

    // If search is active or specific tab selected, only show folders with items
    if (matchingItems.length === 0 && (searchQ || AppState.activeResourceCategory !== 'all')) {
      return;
    }

    // Default expanded state: true (if search is active, always expand; otherwise check window._expandedFoldersState)
    const isExpanded = searchQ ? true : (window._expandedFoldersState[cat.id] !== false);

    const folderCard = document.createElement('div');
    folderCard.className = 'glass-card glass-card-translucent rounded-2xl overflow-hidden border border-slate-800 transition-all duration-200';

    folderCard.innerHTML = `
      <!-- Folder Header Bar (Clickable Accordion) -->
      <div 
        onclick="toggleFolderAccordion('${escapeHtml(cat.id)}')"
        class="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer select-none bg-slate-900/60 hover:bg-slate-900/90 transition-colors border-b ${isExpanded ? 'border-slate-800/80' : 'border-transparent'}"
      >
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-sm">
            ${getCategoryIconSvg(cat.icon, 'w-5 h-5 text-emerald-400')}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>${escapeHtml(cat.name)}</span>
              </h3>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800/80 text-emerald-400 border border-emerald-500/30">
                ${matchingItems.length} Link${matchingItems.length !== 1 ? 's' : ''}
              </span>
            </div>
            ${cat.badge ? `<p class="text-[11px] text-slate-400 mt-0.5">${escapeHtml(cat.badge)}</p>` : ''}
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button 
            type="button" 
            class="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}"
            title="${isExpanded ? 'Tutup Folder' : 'Buka Folder'}"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </button>
        </div>
      </div>

      <!-- Folder Inner Links Grid -->
      <div class="${isExpanded ? 'p-4 sm:p-5' : 'hidden'} bg-slate-950/40">
        ${matchingItems.length === 0 ? `
          <div class="p-6 text-center text-xs text-slate-500 font-mono">
            Folder ini belum memiliki link atau file tersimpan.
          </div>
        ` : `
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
            ${matchingItems.map(item => renderSingleResourceCardHtml(item, isSuperAdmin)).join('')}
          </div>
        `}
      </div>
    `;

    container.appendChild(folderCard);
  });

  // Catch remaining unassigned links (if any)
  const unassignedItems = filtered.filter(r => !assignedResIds.has(r.id));
  if (unassignedItems.length > 0 && (AppState.activeResourceCategory === 'all' || AppState.activeResourceCategory === 'other')) {
    const isExpanded = searchQ ? true : (window._expandedFoldersState['other'] !== false);

    const otherCard = document.createElement('div');
    otherCard.className = 'glass-card glass-card-translucent rounded-2xl overflow-hidden border border-slate-800 transition-all duration-200';

    otherCard.innerHTML = `
      <div 
        onclick="toggleFolderAccordion('other')"
        class="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer select-none bg-slate-900/60 hover:bg-slate-900/90 transition-colors border-b ${isExpanded ? 'border-slate-800/80' : 'border-transparent'}"
      >
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-sm sm:text-base font-bold text-white tracking-tight">Dokumen &amp; Link Lainnya</h3>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800/80 text-slate-300 border border-slate-700">
                ${unassignedItems.length} Link
              </span>
            </div>
            <p class="text-[11px] text-slate-400 mt-0.5">Tautan pendukung kelas Zettbos.</p>
          </div>
        </div>
        <button 
          type="button" 
          class="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </button>
      </div>

      <div class="${isExpanded ? 'p-4 sm:p-5' : 'hidden'} bg-slate-950/40">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
          ${unassignedItems.map(item => renderSingleResourceCardHtml(item, isSuperAdmin)).join('')}
        </div>
      </div>
    `;

    container.appendChild(otherCard);
  }
}

function renderSingleResourceCardHtml(item, isSuperAdmin) {
  const badgeText = item.badge || 'Official Link';

  return `
    <div class="glass-card bg-slate-900/90 rounded-xl p-4 flex flex-col justify-between group relative overflow-hidden transition-all duration-200 border border-slate-800 hover:border-emerald-500/50">
      <div>
        <div class="flex items-center justify-between gap-2 mb-2">
          <div class="flex items-center gap-1.5 truncate">
            <span class="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse"></span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-800/80 tracking-caps truncate">
              ${escapeHtml(badgeText)}
            </span>
          </div>
          <span class="text-[10px] text-slate-500 font-mono flex-shrink-0">${escapeHtml(item.date || '')}</span>
        </div>

        <h4 class="text-xs sm:text-sm font-bold text-white mb-1.5 leading-snug group-hover:text-emerald-300 transition-colors line-clamp-2">
          ${escapeHtml(item.title)}
        </h4>

        ${item.description ? `
          <p class="text-xs text-slate-400 mb-3 leading-relaxed line-clamp-2">
            ${escapeHtml(item.description)}
          </p>
        ` : '<div class="mb-2"></div>'}
      </div>

      <div class="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
        <div class="flex items-center gap-1.5">
          <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="btn-primary-action px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all">
            <span>Buka</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          </a>
          <button onclick="navigator.clipboard.writeText('${item.url}').then(() => showToast('Tautan link berhasil disalin', 'success'))" title="Salin Tautan" class="px-2 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition-colors">
            <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
            <span class="hidden sm:inline text-[11px]">Salin</span>
          </button>
        </div>

        ${isSuperAdmin ? `
          <button onclick="deleteResource('${item.id}')" title="Hapus Link" class="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

// Global window bindings
window.toggleFolderAccordion = toggleFolderAccordion;
window.filterResourceCategory = filterResourceCategory;
window.handleSearchResources = handleSearchResources;
window.openAddResourceModal = openAddResourceModal;
window.closeAddResourceModal = closeAddResourceModal;
window.populateCategoryDropdowns = populateCategoryDropdowns;
window.handleAddResourceSubmit = handleAddResourceSubmit;
window.deleteResource = deleteResource;
window.renderResources = renderResources;
