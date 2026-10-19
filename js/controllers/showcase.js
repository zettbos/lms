/**
 * Zettbos LMS - ZettShowcase Controller (Galeri Karya Web App AI Member)
 * js/controllers/showcase.js
 * Fitur showcase karya web app AI buatan siswa Zettbos dari nol sampai online.
 * Mendukung kurasi admin dan pembatasan maksimal 2 proyek pending per member.
 */

// Sample Seed Showcase Projects (Kosong / Zero Dummy Data - Revisi 91)
const SEED_SHOWCASE_PROJECTS = [];

function initShowcaseDataIfEmpty() {
  if (!Array.isArray(AppState.showcaseProjects)) {
    AppState.showcaseProjects = [];
    saveState();
  } else {
    // Purge legacy hardcoded dummy projects SHOW-01..SHOW-03
    const hadDummies = AppState.showcaseProjects.some(p => ['SHOW-01', 'SHOW-02', 'SHOW-03'].includes(p.id));
    if (hadDummies) {
      AppState.showcaseProjects = AppState.showcaseProjects.filter(p => !['SHOW-01', 'SHOW-02', 'SHOW-03'].includes(p.id));
      localStorage.setItem('zett_showcase_projects', JSON.stringify(AppState.showcaseProjects));
      saveState();
    }
  }
}

function filterShowcaseCategory(cat) {
  AppState.activeShowcaseCategory = cat;
  renderShowcase();
}

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

  // Filter Hosting (Revisi 91)
  if (AppState.activeShowcaseHosting && AppState.activeShowcaseHosting !== 'all') {
    const activeH = AppState.activeShowcaseHosting.toLowerCase();
    items = items.filter(p => (p.hosting || '').toLowerCase().includes(activeH));
  }

  // Filter Database (Revisi 91)
  if (AppState.activeShowcaseDatabase && AppState.activeShowcaseDatabase !== 'all') {
    const activeD = AppState.activeShowcaseDatabase.toLowerCase();
    items = items.filter(p => (p.database || '').toLowerCase().includes(activeD));
  }

  // Filter Kategori (Legacy / Full-Stack / Prompting)
  if (AppState.activeShowcaseCategory && AppState.activeShowcaseCategory !== 'all') {
    const activeCat = AppState.activeShowcaseCategory.toLowerCase();
    items = items.filter(p => {
      const pCat = (p.category || '').toLowerCase();
      const pTech = (p.tech_stack || '').toLowerCase();
      return pCat.includes(activeCat) || pTech.includes(activeCat);
    });
  }

  // Filter Search
  if (AppState.showcaseSearchQuery) {
    const q = AppState.showcaseSearchQuery;
    items = items.filter(p => {
      return (p.title || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.user_name || '').toLowerCase().includes(q) ||
        (p.tech_stack || '').toLowerCase().includes(q) ||
        (p.hosting || '').toLowerCase().includes(q) ||
        (p.database || '').toLowerCase().includes(q);
    });
  }

  // Sort: Featured first, then newest
  items.sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  if (counterEl) {
    counterEl.textContent = `${items.length} Proyek Siswa Ditampilkan`;
  }

  // Update filter pills active state (Hosting & Database)
  renderShowcaseFilterPills();

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

function renderShowcaseFilterPills() {
  const hostingContainer = document.getElementById('gallery-hosting-pills');
  const dbContainer = document.getElementById('gallery-database-pills');

  const hostingList = [
    { id: 'all', label: 'Semua' },
    { id: 'Vercel', label: 'Vercel' },
    { id: 'Netlify', label: 'Netlify' },
    { id: 'Cloudflare', label: 'Cloudflare' },
    { id: 'GitHub Pages', label: 'GitHub Pages' },
    { id: 'VPS / Self-Hosted', label: 'VPS' }
  ];

  const dbList = [
    { id: 'all', label: 'Semua' },
    { id: 'Supabase', label: 'Supabase' },
    { id: 'Firebase', label: 'Firebase' },
    { id: 'PostgreSQL / Neon', label: 'Postgres' },
    { id: 'Local Storage / State', label: 'Local State' },
    { id: 'None / Static', label: 'Static' }
  ];

  const activeHosting = AppState.activeShowcaseHosting || 'all';
  const activeDb = AppState.activeShowcaseDatabase || 'all';

  if (hostingContainer) {
    hostingContainer.innerHTML = hostingList.map(h => {
      const isActive = activeHosting.toLowerCase() === h.id.toLowerCase();
      return `
        <button 
          type="button"
          onclick="filterShowcaseHosting('${h.id}')"
          class="px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            isActive
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
          }"
        >
          ${escapeHtml(h.label)}
        </button>
      `;
    }).join('');
  }

  if (dbContainer) {
    dbContainer.innerHTML = dbList.map(d => {
      const isActive = activeDb.toLowerCase() === d.id.toLowerCase();
      return `
        <button 
          type="button"
          onclick="filterShowcaseDatabase('${d.id}')"
          class="px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            isActive
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
          }"
        >
          ${escapeHtml(d.label)}
        </button>
      `;
    }).join('');
  }
}

function renderSingleShowcaseCardHtml(p, isSuperAdmin, currentUserEmail) {
  const isOwner = p.user_email?.toLowerCase() === currentUserEmail;
  const isPending = p.status === 'pending';
  const isFeatured = !!p.is_featured;

  const coverUrl = p.cover_image && p.cover_image.trim() 
    ? p.cover_image.trim() 
    : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';

  const techTags = (p.tech_stack || 'Web AI')
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);

  const createdDate = p.created_at 
    ? new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : '-';

  return `
    <div class="glass-card bg-slate-900/90 rounded-2xl overflow-hidden flex flex-col justify-between group transition-all duration-300 border ${
      isPending ? 'border-amber-500/40 bg-amber-950/10' : 'border-slate-800 hover:border-emerald-500/50'
    } hover:shadow-xl hover:-translate-y-1">
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
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>

          <!-- Top Status Badges -->
          <div class="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <div class="flex items-center gap-1.5 flex-wrap">
              ${isFeatured ? `
                <span class="px-2.5 py-0.5 rounded text-[10px] font-black bg-amber-500 text-slate-950 border border-amber-400 shadow-md font-mono flex items-center gap-1">
                  ⭐ KARYA PILIHAN
                </span>
              ` : ''}
              ${isPending ? `
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/90 text-amber-300 border border-amber-500/50 shadow-sm font-mono flex items-center gap-1 animate-pulse">
                  ⏳ MENUNGGU REVIEW ADMIN
                </span>
              ` : `
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 shadow-sm font-mono">
                  ✅ VERIFIED SHOWCASE
                </span>
              `}
            </div>

            <span class="px-2 py-0.5 rounded text-[10px] font-mono text-slate-300 bg-slate-950/80 backdrop-blur-md border border-slate-800">
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

          <!-- Hosting & Database Provider Badges (Revisi 91) -->
          <div class="flex items-center gap-2 mb-3">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 inline-flex items-center gap-1 shadow-sm">
              <span>🌐</span>
              <span>${escapeHtml(p.hosting || 'Vercel')}</span>
            </span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-1 shadow-sm">
              <span>🗄️</span>
              <span>${escapeHtml(p.database || 'Supabase')}</span>
            </span>
          </div>

          <!-- Description -->
          <p class="text-xs text-slate-400 mb-3.5 leading-relaxed line-clamp-3">
            ${escapeHtml(p.description || 'Web app hasil bimbingan praktek AI di Zettbos LMS.')}
          </p>

          <!-- Tech Stack Tags -->
          <div class="flex flex-wrap items-center gap-1.5 mb-2">
            ${techTags.map(tag => `
              <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                #${escapeHtml(tag)}
              </span>
            `).join('')}
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
              class="btn-primary-action px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/50"
            >
              <span>Buka Web App</span>
              <svg class="w-3.5 h-3.5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
            </a>
          ` : ''}

          ${p.repo_url ? `
            <a 
              href="${escapeHtml(p.repo_url)}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1"
              title="Lihat Repository GitHub / Kode"
            >
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
              <span class="text-[11px]">Repo</span>
            </a>
          ` : ''}
        </div>

        <div class="flex items-center gap-1.5">
          ${isSuperAdmin ? `
            <button 
              onclick="openAdminEditShowcaseModal('${escapeHtml(p.id)}')" 
              class="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-colors flex items-center gap-1"
              title="Edit Data Proyek Siswa (Admin)"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              <span>Edit</span>
            </button>
          ` : ''}

          <button 
            onclick="navigator.clipboard.writeText('${escapeHtml(p.demo_url || window.location.href)}').then(() => showToast('Tautan web app disalin!', 'success'))"
            title="Salin Tautan"
            class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

function openSubmitShowcaseModal() {
  const user = AppState.currentUser;
  if (!user) {
    showToast('Silakan login terlebih dahulu untuk submit karya', 'warning');
    return;
  }

  const userEmail = (user.email || '').toLowerCase();
  const isSuperAdmin = user.role === 'admin' || userEmail === 'zettbos2025@gmail.com';

  // Kuota check: maksimal 2 pending projects per member (Gambar 1 requirement)
  const userPendingCount = (AppState.showcaseProjects || []).filter(p => 
    p.user_email?.toLowerCase() === userEmail && p.status === 'pending'
  ).length;

  const quotaBox = document.getElementById('showcase-quota-warning');
  const submitBtn = document.getElementById('btn-submit-showcase-form');
  const form = document.getElementById('form-submit-showcase');

  if (form) form.reset();

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
            Anda saat ini memiliki <strong>2 karya</strong> yang sedang menunggu review Admin. Demi kualitas kurasi portofolio, harap menunggu verifikasi Admin sebelum mengajukan karya berikutnya.
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
}

async function handleSubmitShowcase(event) {
  event.preventDefault();
  const user = AppState.currentUser;
  if (!user) {
    showToast('Sesi login telah berakhir', 'error');
    return;
  }

  const title = document.getElementById('showcase-input-title')?.value.trim();
  const hosting = document.getElementById('showcase-input-hosting')?.value || 'Vercel';
  const database = document.getElementById('showcase-input-database')?.value || 'Supabase';
  const demoUrl = document.getElementById('showcase-input-demourl')?.value.trim();
  const repoUrl = document.getElementById('showcase-input-repourl')?.value.trim();
  const coverUrl = document.getElementById('showcase-input-cover')?.value.trim();
  const techStack = document.getElementById('showcase-input-tech')?.value.trim();
  const desc = document.getElementById('showcase-input-desc')?.value.trim();

  if (!title || !demoUrl || !techStack || !desc) {
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

  const newProject = {
    id: 'SHOW-' + Date.now().toString().slice(-6),
    user_email: user.email,
    user_name: user.fullName || user.email.split('@')[0],
    title,
    description: desc,
    demo_url: demoUrl,
    repo_url: repoUrl || '',
    cover_image: coverUrl || '',
    tech_stack: techStack,
    hosting,
    database,
    category: techStack.includes('Apps Script') ? 'Apps Script' : (techStack.includes('Prompt') ? 'Prompting AI' : 'Full-Stack AI'),
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
        repo_url: newProject.repo_url,
        cover_image: newProject.cover_image,
        tech_stack: newProject.tech_stack,
        hosting: newProject.hosting,
        database: newProject.database,
        status: newProject.status,
        is_featured: newProject.is_featured,
        created_at: newProject.created_at
      }, { onConflict: 'id' });

      if (error) console.warn('[Supabase Showcase Push Warning]', error);
    } catch (err) {
      console.warn('[Supabase Showcase Sync Error]', err);
    }
  }

  closeSubmitShowcaseModal();
  renderShowcase();

  if (isSuperAdmin) {
    showToast('Proyek berhasil dipublikasikan langsung ke ZettGallery!', 'success');
  } else {
    showToast('Karya berhasil diajukan! Menunggu peninjauan Admin sebelum tayang di ZettGallery.', 'success');
  }
}

// Window bindings
window.renderShowcase = renderShowcase;
window.filterShowcaseCategory = filterShowcaseCategory;
window.filterShowcaseHosting = filterShowcaseHosting;
window.filterShowcaseDatabase = filterShowcaseDatabase;
window.renderShowcaseFilterPills = renderShowcaseFilterPills;
window.handleSearchShowcase = handleSearchShowcase;
window.openSubmitShowcaseModal = openSubmitShowcaseModal;
window.closeSubmitShowcaseModal = closeSubmitShowcaseModal;
window.handleSubmitShowcase = handleSubmitShowcase;
