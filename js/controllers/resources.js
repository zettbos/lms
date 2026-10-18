/**
 * Zettbos LMS - Shared Resources & Documents Controller (ZettLink)
 * js/controllers/resources.js
 * Menangani repository ZettLink: Card Grid kompak presisi (Gambar 2),
 * pengelompokan folder dinamis CMS, dan akses link dokumen.
 */

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
        category: newRes.category || 'cat-sheets',
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

// Helper to match an item to a category object
function isResourceInCategory(r, cat) {
  if (!r || !cat) return false;
  const rCat = (r.category || '').toLowerCase().trim();
  const cId = (cat.id || '').toLowerCase().trim();
  const cName = (cat.name || '').toLowerCase().trim();

  if (rCat === cId || rCat === cName) return true;

  // Legacy aliases
  if (cId === 'cat-sheets' && (rCat === 'sheet' || rCat === 'sheets' || rCat.includes('sheet'))) return true;
  if (cId === 'cat-code' && (rCat === 'code' || rCat === 'starter code' || rCat.includes('code'))) return true;
  if (cId === 'cat-prompt' && (rCat === 'prompt' || rCat === 'sop' || rCat.includes('prompt'))) return true;
  if (cId === 'cat-drive' && (rCat === 'drive' || rCat.includes('drive'))) return true;
  if (cId === 'cat-zettbot' && (rCat === 'bot' || rCat === 'zettbot' || rCat.includes('bot'))) return true;
  if (cId === 'cat-library' && (rCat === 'library' || rCat.includes('library') || rCat.includes('ebook'))) return true;
  if (cId === 'cat-modul' && (rCat === 'modul' || rCat.includes('modul'))) return true;

  return false;
}

function renderResources() {
  const container = document.getElementById('resources-grid-container');
  const tabsContainer = document.getElementById('zettlink-category-tabs');
  const emptyState = document.getElementById('resources-empty-state');
  if (!container) return;

  const allResources = AppState.resources || [];
  const categories = AppState.resourceCategories || [];

  // 1. Render Dynamic Filter Tabs
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
      const catCount = allResources.filter(r => isResourceInCategory(r, cat)).length;
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

  // 3. Render Mode: Gambar 2 Card Grid Layout
  if (AppState.activeResourceCategory === 'all' && !searchQ) {
    // Mode Grouping per Folder yang memiliki link
    const assignedIds = new Set();

    categories.forEach(cat => {
      const matchingItems = filtered.filter(r => isResourceInCategory(r, cat));
      if (matchingItems.length === 0) return; // Skip folder kosong agar tidak buang space!

      matchingItems.forEach(r => assignedIds.add(r.id));

      const sectionEl = document.createElement('div');
      sectionEl.className = 'mb-8 last:mb-2';

      sectionEl.innerHTML = `
        <div class="flex items-center justify-between gap-3 mb-3.5 pb-2.5 border-b border-slate-800/80">
          <div class="flex items-center gap-2.5">
            <div class="w-6 h-6 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
              ${getCategoryIconSvg(cat.icon, 'w-3.5 h-3.5 text-emerald-400')}
            </div>
            <h3 class="text-xs sm:text-sm font-bold text-white tracking-wide uppercase font-mono flex items-center gap-2">
              <span>${escapeHtml(cat.name)}</span>
              <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400">
                ${matchingItems.length} Link
              </span>
            </h3>
          </div>
          ${cat.badge ? `<span class="text-[11px] text-slate-400 font-mono hidden sm:inline">${escapeHtml(cat.badge)}</span>` : ''}
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          ${matchingItems.map(item => renderSingleResourceCardHtml(item, isSuperAdmin, cat.name)).join('')}
        </div>
      `;

      container.appendChild(sectionEl);
    });

    // Render items that don't match any explicit category
    const unassignedItems = filtered.filter(r => !assignedIds.has(r.id));
    if (unassignedItems.length > 0) {
      const otherSection = document.createElement('div');
      otherSection.className = 'mb-8 last:mb-2';
      otherSection.innerHTML = `
        <div class="flex items-center justify-between gap-3 mb-3.5 pb-2.5 border-b border-slate-800/80">
          <div class="flex items-center gap-2.5">
            <div class="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0">
              📁
            </div>
            <h3 class="text-xs sm:text-sm font-bold text-white tracking-wide uppercase font-mono flex items-center gap-2">
              <span>Link &amp; Dokumen Lainnya</span>
              <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                ${unassignedItems.length} Link
              </span>
            </h3>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          ${unassignedItems.map(item => renderSingleResourceCardHtml(item, isSuperAdmin, 'Lainnya')).join('')}
        </div>
      `;
      container.appendChild(otherSection);
    }
  } else {
    // Mode Filter Spesifik atau Pencarian Aktif: Render langsung Grid Kartu Kompak Gambar 2
    let displayItems = filtered;
    if (AppState.activeResourceCategory !== 'all') {
      const activeCat = categories.find(c => c.id === AppState.activeResourceCategory);
      if (activeCat) {
        displayItems = filtered.filter(r => isResourceInCategory(r, activeCat));
      }
    }

    if (displayItems.length === 0) {
      container.innerHTML = `
        <div class="p-8 rounded-2xl glass-card border border-slate-800 text-center flex flex-col items-center justify-center gap-2 col-span-full">
          <p class="text-xs text-slate-400 font-mono">Belum ada link di folder ini.</p>
        </div>
      `;
      return;
    }

    const gridContainer = document.createElement('div');
    gridContainer.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4';
    gridContainer.innerHTML = displayItems.map(item => {
      const matchedCat = categories.find(c => isResourceInCategory(item, c));
      return renderSingleResourceCardHtml(item, isSuperAdmin, matchedCat?.name);
    }).join('');

    container.appendChild(gridContainer);
  }
}

function renderSingleResourceCardHtml(item, isSuperAdmin, categoryNameFallback) {
  const badgeText = item.badge || 'Official Link';
  const catLabel = categoryNameFallback || item.category?.toUpperCase() || 'DOKUMEN';

  return `
    <div onclick="openResourceDetailModal('${item.id}')" class="glass-card bg-slate-900/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between group relative overflow-hidden transition-all duration-300 border border-slate-800 hover:border-emerald-500/50 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer">
      <div>
        <!-- Top Row: Category Badge & Date (Sesuai Gambar 2) -->
        <div class="flex items-center justify-between gap-2 mb-3">
          <span class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-800/80 tracking-caps truncate max-w-[170px] inline-flex items-center gap-1.5">
            <span>📁</span>
            <span class="truncate">${escapeHtml(catLabel)}</span>
          </span>
          <span class="text-[11px] text-slate-500 font-mono flex-shrink-0">${escapeHtml(item.date || '')}</span>
        </div>

        <!-- Title -->
        <h4 class="text-sm sm:text-base font-bold text-white mb-2 leading-snug group-hover:text-emerald-300 transition-colors line-clamp-2">
          ${escapeHtml(item.title)}
        </h4>

        <!-- Description -->
        <p class="text-xs text-slate-400 mb-3.5 leading-relaxed line-clamp-2">
          ${escapeHtml(item.description || 'Tautan resmi materi pembelajaran Zettbos.')}
        </p>

        <!-- Micro Tag Pills -->
        <div class="flex flex-wrap items-center gap-1.5 mb-3.5">
          <span class="micro-tag-pill">
            <svg class="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            <span>${escapeHtml(badgeText)}</span>
          </span>
          <span class="micro-tag-pill">
            <svg class="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            <span>Lihat SOP &amp; Detail ↗</span>
          </span>
        </div>
      </div>

      <!-- Bottom Action Bar (Gambar 3 - Revisi 89: Buka Modal Detail Sebelum Redirect) -->
      <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
        <div class="flex items-center gap-2">
          <button type="button" onclick="event.stopPropagation(); openResourceDetailModal('${item.id}')" class="btn-primary-action px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm">
            <span>Buka Dokumen</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          </button>
          <button type="button" onclick="event.stopPropagation(); navigator.clipboard.writeText('${item.url}').then(() => showToast('Tautan dokumen berhasil disalin', 'success'))" title="Salin Tautan" class="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition-colors">
            <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
            <span class="text-[11px]">Salin</span>
          </button>
        </div>

        ${isSuperAdmin ? `
          <button type="button" onclick="event.stopPropagation(); deleteResource('${item.id}')" title="Hapus Dokumen" class="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

function openResourceDetailModal(resId) {
  const item = (AppState.resources || []).find(r => r.id === resId);
  if (!item) return;

  const categories = AppState.resourceCategories || [];
  const matchedCat = categories.find(c => isResourceInCategory(item, c));
  const folderName = matchedCat ? matchedCat.name : (item.category ? item.category.toUpperCase() : 'Dokumen');

  const titleEl = document.getElementById('res-preview-title');
  const folderEl = document.getElementById('res-preview-folder-name');
  const badgeEl = document.getElementById('res-preview-badge');
  const dateEl = document.getElementById('res-preview-date');
  const descEl = document.getElementById('res-preview-desc');
  const btnOpen = document.getElementById('res-preview-btn-open');
  const btnCopy = document.getElementById('res-preview-btn-copy');

  if (titleEl) titleEl.textContent = item.title;
  if (folderEl) folderEl.textContent = folderName;
  if (badgeEl) badgeEl.textContent = item.badge || 'Official Link';
  if (dateEl) dateEl.textContent = item.date || '';
  if (descEl) {
    descEl.textContent = item.description || 'Tidak ada deskripsi tambahan untuk link dokumen ini.';
  }

  if (btnOpen) {
    btnOpen.href = item.url || '#';
  }

  if (btnCopy) {
    btnCopy.onclick = () => {
      if (item.url) {
        navigator.clipboard.writeText(item.url).then(() => {
          showToast('Tautan dokumen berhasil disalin!', 'success');
        });
      }
    };
  }

  const modal = document.getElementById('modal-resource-detail-preview');
  if (modal) modal.classList.remove('hidden');
}

function closeResourceDetailModal() {
  const modal = document.getElementById('modal-resource-detail-preview');
  if (modal) modal.classList.add('hidden');
}

// Global window bindings
window.filterResourceCategory = filterResourceCategory;
window.handleSearchResources = handleSearchResources;
window.openAddResourceModal = openAddResourceModal;
window.closeAddResourceModal = closeAddResourceModal;
window.populateCategoryDropdowns = populateCategoryDropdowns;
window.handleAddResourceSubmit = handleAddResourceSubmit;
window.deleteResource = deleteResource;
window.renderResources = renderResources;
window.openResourceDetailModal = openResourceDetailModal;
window.closeResourceDetailModal = closeResourceDetailModal;
