/**
 * Zettbos LMS - ZettGallery Controller (Portofolio Karya Web App AI Member)
 * js/controllers/showcase.js
 * Fitur kurasi karya web app AI buatan siswa Zettbos dari nol sampai online.
 * Mendukung filter Hosting & Database, upload cover ke Supabase Storage,
 * dan moderasi admin langsung.
 */

// Zero Seed Data (Revisi 91: Semua data dummy lama dihapus bersih)
const SEED_SHOWCASE_PROJECTS = [];

let showcaseCoverFileToUpload = null;

function initShowcaseDataIfEmpty() {
  if (Array.isArray(AppState.showcaseProjects)) {
    // Purge data dummy lama jika masih tersimpan di cache
    const initialLen = AppState.showcaseProjects.length;
    AppState.showcaseProjects = AppState.showcaseProjects.filter(p => !['SHOW-01', 'SHOW-02', 'SHOW-03'].includes(p.id));
    if (AppState.showcaseProjects.length !== initialLen) {
      saveState();
    }
  } else {
    AppState.showcaseProjects = [];
  }
}

// ==========================================
// FILTER HOSTING & DATABASE
// ==========================================

function filterShowcaseHosting(hosting) {
  AppState.activeShowcaseHosting = hosting;
  renderShowcase();
}

function filterShowcaseDatabase(db) {
  AppState.activeShowcaseDatabase = db;
  renderShowcase();
}

function handleSearchShowcase() {
  const input = document.getElementById('showcase-search-input');
  AppState.showcaseSearchQuery = input ? input.value.trim().toLowerCase() : '';
  renderShowcase();
}

function renderHostingAndDatabasePills() {
  const hostingContainer = document.getElementById('gallery-hosting-pills');
  const databaseContainer = document.getElementById('gallery-database-pills');

  const hostingList = [
    { id: 'all', label: 'Semua' },
    { id: 'Google Apps Script', label: 'Apps Script' },
    { id: 'Vercel', label: 'Vercel' },
    { id: 'Netlify', label: 'Netlify' },
    { id: 'Cloudflare Pages', label: 'Cloudflare' },
    { id: 'GitHub Pages', label: 'GitHub Pages' },
    { id: 'Lainnya', label: 'Lainnya' }
  ];

  const databaseList = [
    { id: 'all', label: 'Semua' },
    { id: 'Google Sheets', label: 'Google Sheets' },
    { id: 'Supabase', label: 'Supabase' },
    { id: 'Firebase', label: 'Firebase' },
    { id: 'PostgreSQL / Neon', label: 'PostgreSQL' },
    { id: 'Lainnya', label: 'Lainnya' }
  ];

  const currentHosting = AppState.activeShowcaseHosting || 'all';
  const currentDb = AppState.activeShowcaseDatabase || 'all';

  if (hostingContainer) {
    hostingContainer.innerHTML = hostingList.map(h => {
      const isActive = currentHosting.toLowerCase() === h.id.toLowerCase();
      return `
        <button 
          type="button"
          onclick="filterShowcaseHosting('${h.id}')"
          class="px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            isActive
              ? 'bg-[#00DF81] text-[#000F01] shadow-md shadow-[#00DF81]/30 font-black'
              : 'bg-[#032221] hover:bg-[#053331] text-[#707D7D] hover:text-[#F1F7F6] border border-[#03624C]/60'
          }"
        >
          ${escapeHtml(h.label)}
        </button>
      `;
    }).join('');
  }

  if (databaseContainer) {
    databaseContainer.innerHTML = databaseList.map(d => {
      const isActive = currentDb.toLowerCase() === d.id.toLowerCase();
      return `
        <button 
          type="button"
          onclick="filterShowcaseDatabase('${d.id}')"
          class="px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            isActive
              ? 'bg-[#2CC295] text-[#000F01] shadow-md shadow-[#2CC295]/30 font-black'
              : 'bg-[#032221] hover:bg-[#053331] text-[#707D7D] hover:text-[#F1F7F6] border border-[#03624C]/60'
          }"
        >
          ${escapeHtml(d.label)}
        </button>
      `;
    }).join('');
  }
}

// ==========================================
// RENDER GALLERY GRID
// ==========================================

function renderShowcase() {
  initShowcaseDataIfEmpty();
  const container = document.getElementById('showcase-grid-container');
  const emptyState = document.getElementById('showcase-empty-state');
  const counterEl = document.getElementById('showcase-counter-badge');
  if (!container) return;

  const user = AppState.currentUser;
  const isSuperAdmin = user && (user.role === 'admin' || user.email?.toLowerCase() === 'zettbos2025@gmail.com');
  const userEmail = user?.email?.toLowerCase() || '';

  // Filter items: Admin melihat semua, user biasa melihat approved + pending miliknya sendiri
  let items = (AppState.showcaseProjects || []).filter(p => {
    if (isSuperAdmin) return true;
    if (p.status === 'approved') return true;
    if (p.status === 'pending' && p.user_email?.toLowerCase() === userEmail) return true;
    return false;
  });

  // Filter Hosting
  if (AppState.activeShowcaseHosting && AppState.activeShowcaseHosting !== 'all') {
    const targetHosting = AppState.activeShowcaseHosting.toLowerCase();
    items = items.filter(p => {
      const h = (p.hosting || p.tech_stack || '').toLowerCase();
      return h.includes(targetHosting);
    });
  }

  // Filter Database
  if (AppState.activeShowcaseDatabase && AppState.activeShowcaseDatabase !== 'all') {
    const targetDb = AppState.activeShowcaseDatabase.toLowerCase();
    items = items.filter(p => {
      const d = (p.database || p.tech_stack || '').toLowerCase();
      return d.includes(targetDb);
    });
  }

  // Filter Search
  if (AppState.showcaseSearchQuery) {
    const q = AppState.showcaseSearchQuery;
    items = items.filter(p => {
      return (p.title || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.user_name || '').toLowerCase().includes(q) ||
        (p.hosting || '').toLowerCase().includes(q) ||
        (p.database || '').toLowerCase().includes(q) ||
        (p.tech_stack || '').toLowerCase().includes(q);
    });
  }

  // Sort: Featured first, then newest
  items.sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  if (counterEl) {
    counterEl.textContent = `${items.length} Karya Ditampilkan`;
  }

  // Update pills active state
  renderHostingAndDatabasePills();

  if (items.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      ${items.map(p => renderSingleShowcaseCardHtml(p, isSuperAdmin, userEmail)).join('')}
    </div>
  `;
}

function renderSingleShowcaseCardHtml(p, isSuperAdmin, currentUserEmail) {
  const isOwner = p.user_email?.toLowerCase() === currentUserEmail;
  const isPending = p.status === 'pending';
  const isFeatured = !!p.is_featured;

  const coverUrl = p.cover_image && p.cover_image.trim() 
    ? p.cover_image.trim() 
    : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';

  const createdDate = p.created_at 
    ? new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : '-';

  const hostingName = p.hosting || (p.tech_stack?.includes('Apps Script') ? 'Google Apps Script' : 'Web App');
  const databaseName = p.database || (p.tech_stack?.includes('Sheets') ? 'Google Sheets' : 'Database');

  return `
    <div class="glass-card squircle-card rounded-3xl overflow-hidden flex flex-col justify-between group transition-all duration-300 border ${
      isPending ? 'border-amber-500/40 bg-amber-950/10' : 'border-[#03624C]/45 hover:border-[#00DF81]/60'
    } hover:shadow-2xl hover:-translate-y-1.5">
      <div>
        <!-- Card Cover / Thumbnail -->
        <div class="relative h-44 overflow-hidden bg-slate-950 border-b border-slate-800/80">
          <img 
            src="${escapeHtml(coverUrl)}" 
            alt="${escapeHtml(p.title)}" 
            loading="lazy"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onerror="this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-[#000F01] via-[#000F01]/30 to-transparent"></div>

          <!-- Top Status Badges (Revisi 91: Hapus badge VERIFIED SHOWCASE) -->
          <div class="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <div class="flex items-center gap-1.5 flex-wrap">
              ${isFeatured ? `
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 border border-amber-400 shadow-md font-mono flex items-center gap-1">
                  ⭐ KARYA PILIHAN
                </span>
              ` : ''}
              ${isPending ? `
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/90 text-amber-300 border border-amber-500/50 shadow-sm font-mono flex items-center gap-1 animate-pulse">
                  ⏳ MENUNGGU REVIEW ADMIN
                </span>
              ` : ''}
            </div>

            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-slate-300 bg-slate-950/80 backdrop-blur-md border border-slate-800">
              ${escapeHtml(createdDate)}
            </span>
          </div>
        </div>

        <!-- Content Body -->
        <div class="p-4 sm:p-5">
          <!-- Title -->
          <h3 class="text-base sm:text-lg font-bold text-white mb-2 leading-snug group-hover:text-emerald-300 transition-colors line-clamp-2">
            ${escapeHtml(p.title)}
          </h3>

          <!-- Creator Meta -->
          <div class="flex items-center gap-2 mb-3 pb-2.5 border-b border-slate-800/80 text-xs text-slate-400">
            <div class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-[10px]">
              ${escapeHtml((p.user_name || 'M')[0].toUpperCase())}
            </div>
            <div class="truncate">
              <span class="font-bold text-white">${escapeHtml(p.user_name || 'Member Zettbos')}</span>
              ${isOwner ? '<span class="ml-1 text-[10px] text-cyan-400 font-mono">(Karya Anda)</span>' : ''}
            </div>
          </div>

          <!-- Description -->
          <p class="text-xs text-slate-400 mb-3.5 leading-relaxed line-clamp-3">
            ${escapeHtml(p.description || 'Web app hasil bimbingan praktek AI di Zettbos.')}
          </p>

          <!-- Hosting & Database Badges (Revisi 91) -->
          <div class="flex flex-wrap items-center gap-1.5 mb-2">
            <span class="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
              <svg class="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z"/></svg>
              <span>${escapeHtml(hostingName)}</span>
            </span>
            <span class="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 flex items-center gap-1">
              <svg class="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3V7m-16 0c0-2 1.5-3 3.5-3h9c2 0 3.5 1 3.5 3m-16 0h16M4 12h16"/></svg>
              <span>${escapeHtml(databaseName)}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Footer Action Row -->
      <div class="p-4 pt-3 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between gap-2 mt-auto">
        <div class="flex items-center gap-2">
          ${p.demo_url ? `
            <a 
              href="${escapeHtml(p.demo_url)}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="btn-primary-action px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#00DF81]/25"
            >
              <span>Buka Web App</span>
              <svg class="w-3.5 h-3.5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
            </a>
          ` : ''}

          ${isSuperAdmin ? `
            <button 
              onclick="openAdminEditShowcaseModal('${p.id}')"
              class="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#00DF81]/15 text-[#00DF81] border border-[#00DF81]/40 hover:bg-[#00DF81]/25 transition-colors flex items-center gap-1"
              title="Edit Data Karya Siswa (Admin)"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              <span>Edit</span>
            </button>
          ` : ''}
        </div>

        <button 
          onclick="navigator.clipboard.writeText('${escapeHtml(p.demo_url || window.location.href)}').then(() => showToast('Tautan web app disalin!', 'success'))"
          title="Salin Tautan"
          class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
        </button>
      </div>
    </div>
  `;
}

// ==========================================
// SUBMIT KARYA & COVER IMAGE UPLOAD (SUPABASE STORAGE)
// ==========================================

function handleShowcaseCoverFileSelect(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showToast('Ukuran gambar maksimal 5MB', 'warning');
    event.target.value = '';
    return;
  }

  showcaseCoverFileToUpload = file;

  const promptEl = document.getElementById('showcase-upload-prompt');
  const previewEl = document.getElementById('showcase-upload-preview');
  const imgEl = document.getElementById('showcase-cover-preview-img');
  const filenameEl = document.getElementById('showcase-upload-filename');

  const reader = new FileReader();
  reader.onload = (e) => {
    if (imgEl) imgEl.src = e.target.result;
    if (filenameEl) filenameEl.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    if (promptEl) promptEl.classList.add('hidden');
    if (previewEl) previewEl.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

function clearShowcaseCoverFile(event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  showcaseCoverFileToUpload = null;
  const fileInput = document.getElementById('showcase-input-cover-file');
  if (fileInput) fileInput.value = '';

  const promptEl = document.getElementById('showcase-upload-prompt');
  const previewEl = document.getElementById('showcase-upload-preview');
  const imgEl = document.getElementById('showcase-cover-preview-img');
  const filenameEl = document.getElementById('showcase-upload-filename');

  if (imgEl) imgEl.src = '';
  if (filenameEl) filenameEl.textContent = '';
  if (previewEl) previewEl.classList.add('hidden');
  if (promptEl) promptEl.classList.remove('hidden');
}

function openSubmitShowcaseModal() {
  const user = AppState.currentUser;
  if (!user) {
    showToast('Silakan login terlebih dahulu untuk submit karya', 'warning');
    return;
  }

  const userEmail = (user.email || '').toLowerCase();
  const isSuperAdmin = user.role === 'admin' || userEmail === 'zettbos2025@gmail.com';

  const userPendingCount = (AppState.showcaseProjects || []).filter(p => 
    p.user_email?.toLowerCase() === userEmail && p.status === 'pending'
  ).length;

  const quotaBox = document.getElementById('showcase-quota-warning');
  const submitBtn = document.getElementById('btn-submit-showcase-form');
  const form = document.getElementById('form-submit-showcase');

  if (form) form.reset();
  clearShowcaseCoverFile();

  if (userPendingCount >= 2 && !isSuperAdmin) {
    if (quotaBox) {
      quotaBox.classList.remove('hidden');
      quotaBox.innerHTML = `
        <div class="p-3.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs">
          <div class="font-bold flex items-center gap-1.5 mb-1 text-amber-300">
            <svg class="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            <span>Batas Kuota Pengajuan Tercapai (2/2)</span>
          </div>
          <p class="text-[11px] leading-relaxed text-amber-200/90">
            Anda saat ini memiliki <strong>2 karya</strong> yang sedang menunggu review Admin. Harap menunggu verifikasi Admin sebelum mengajukan karya berikutnya.
          </p>
        </div>
      `;
    }
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
  } else {
    if (quotaBox) quotaBox.classList.add('hidden');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }

  const modal = document.getElementById('modal-submit-showcase');
  if (modal) modal.classList.remove('hidden');
}

function closeSubmitShowcaseModal() {
  const modal = document.getElementById('modal-submit-showcase');
  if (modal) modal.classList.add('hidden');
  clearShowcaseCoverFile();
}

async function handleSubmitShowcase(event) {
  event.preventDefault();
  const user = AppState.currentUser;
  if (!user) {
    showToast('Sesi login telah berakhir', 'error');
    return;
  }

  const title = document.getElementById('showcase-input-title')?.value.trim();
  const hosting = document.getElementById('showcase-input-hosting')?.value || 'Google Apps Script';
  const database = document.getElementById('showcase-input-database')?.value || 'Google Sheets';
  const demoUrl = document.getElementById('showcase-input-demourl')?.value.trim();
  const coverUrlInput = document.getElementById('showcase-input-cover')?.value.trim();
  const desc = document.getElementById('showcase-input-desc')?.value.trim();

  if (!title || !demoUrl || !desc) {
    showToast('Harap lengkapi semua data wajib bertanda (*)', 'error');
    return;
  }

  const userEmail = (user.email || '').toLowerCase();
  const isSuperAdmin = user.role === 'admin' || userEmail === 'zettbos2025@gmail.com';

  // Periksa kuota lagi sebelum submit
  const userPendingCount = (AppState.showcaseProjects || []).filter(p => 
    p.user_email?.toLowerCase() === userEmail && p.status === 'pending'
  ).length;

  if (userPendingCount >= 2 && !isSuperAdmin) {
    showToast('Batas maksimal 2 proyek pending tercapai. Tunggu approval Admin.', 'warning');
    return;
  }

  const submitBtn = document.getElementById('btn-submit-showcase-form');
  const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      <span>Mengunggah Karya...</span>
    `;
  }

  let finalCoverUrl = coverUrlInput || '';

  // Upload file cover jika dipilih
  if (showcaseCoverFileToUpload) {
    try {
      if (typeof ZettSupabase !== 'undefined' && typeof ZettSupabase.uploadShowcaseCover === 'function') {
        const uploadedUrl = await ZettSupabase.uploadShowcaseCover(showcaseCoverFileToUpload);
        if (uploadedUrl) finalCoverUrl = uploadedUrl;
      }
    } catch (uploadErr) {
      console.warn('[Cover Upload Warning]', uploadErr);
    }
  }

  const newProject = {
    id: 'SHOW-' + Date.now().toString().slice(-6),
    user_email: user.email,
    user_name: user.fullName || user.email.split('@')[0],
    title,
    description: desc,
    demo_url: demoUrl,
    repo_url: '',
    cover_image: finalCoverUrl,
    hosting,
    database,
    tech_stack: `${hosting}, ${database}`,
    category: hosting.includes('Apps Script') ? 'Apps Script' : 'Web App AI',
    status: isSuperAdmin ? 'approved' : 'pending',
    is_featured: false,
    created_at: new Date().toISOString()
  };

  AppState.showcaseProjects.unshift(newProject);
  saveState();

  // Live Auto-Push ke Supabase Cloud tabel member_showcase
  if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
    try {
      const { error } = await ZettSupabase.client.from('member_showcase').upsert({
        id: newProject.id,
        user_email: newProject.user_email,
        user_name: newProject.user_name,
        title: newProject.title,
        description: newProject.description,
        demo_url: newProject.demo_url,
        repo_url: '',
        cover_image: newProject.cover_image,
        hosting: newProject.hosting,
        database: newProject.database,
        tech_stack: newProject.tech_stack,
        status: newProject.status,
        is_featured: newProject.is_featured,
        created_at: newProject.created_at
      }, { onConflict: 'id' });

      if (error) console.warn('[Supabase Showcase Push Warning]', error);
    } catch (err) {
      console.warn('[Supabase Showcase Sync Error]', err);
    }
  }

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnHtml;
  }

  closeSubmitShowcaseModal();
  renderShowcase();

  if (isSuperAdmin) {
    showToast('Proyek berhasil dipublikasikan langsung ke ZettGallery!', 'success');
  } else {
    showToast('Karya berhasil diajukan! Menunggu peninjauan Admin sebelum tayang.', 'success');
  }
}

// Window bindings
window.renderShowcase = renderShowcase;
window.filterShowcaseHosting = filterShowcaseHosting;
window.filterShowcaseDatabase = filterShowcaseDatabase;
window.handleSearchShowcase = handleSearchShowcase;
window.handleShowcaseCoverFileSelect = handleShowcaseCoverFileSelect;
window.clearShowcaseCoverFile = clearShowcaseCoverFile;
window.openSubmitShowcaseModal = openSubmitShowcaseModal;
window.closeSubmitShowcaseModal = closeSubmitShowcaseModal;
window.handleSubmitShowcase = handleSubmitShowcase;
