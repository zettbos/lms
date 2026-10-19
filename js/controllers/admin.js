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
  const isSuperAdmin = user && user.email && user.email.toLowerCase() === 'zettbos2025@gmail.com';
  const isAdmin = isSuperAdmin || (user && user.role === 'admin');
  if (!user || !isAdmin) {
    showToast('Akses dibatasi hanya untuk Administrator LMS', 'error');
    navigate(user ? 'home' : 'landing');
    return;
  }

  switchAdminTab(AppState.activeAdminTab || 'curriculum');
}

function switchAdminTab(tabName) {
  AppState.activeAdminTab = tabName;
  ['curriculum', 'landing_cms', 'resources_cms', 'quickactions', 'showcase_cms', 'whitelist', 'analytics'].forEach(t => {
    const tabBtn = document.getElementById(`tab-btn-${t}`);
    const tabPane = document.getElementById(`tab-pane-${t}`);
    if (tabBtn) {
      if (t === tabName) {
        tabBtn.className = 'admin-tab-btn active px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-2 whitespace-nowrap transition-all shadow-sm';
      } else {
        tabBtn.className = 'admin-tab-btn px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 flex items-center gap-2 whitespace-nowrap transition-all border border-transparent';
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
  } else if (tabName === 'showcase_cms') {
    renderAdminShowcaseCms();
  } else if (tabName === 'whitelist') {
    renderAdminWhitelist();
    pullWhitelistFromSupabaseLive(true);
  } else if (tabName === 'analytics') {
    renderAdminAnalytics();
    if (typeof window.pullAllMembersProgressForAdmin === 'function') {
      window.pullAllMembersProgressForAdmin(true).then(() => {
        if (AppState.activeAdminTab === 'analytics') renderAdminAnalytics();
      });
    }
    if (typeof window.subscribeToMemberProgressRealtime === 'function') {
      window.subscribeToMemberProgressRealtime();
    }
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

  // Brand Logo Setting (Google Drive & Direct URL)
  const logoInp = document.getElementById('admin-brand-logo-input');
  if (logoInp) {
    logoInp.value = AppState.brandLogoUrl || localStorage.getItem('zettbos_brand_logo_url') || '';
    handleBrandLogoInputPreview(logoInp.value);
  }

  // Pengelola Kontak Admin WhatsApp (Dual-Admin)
  renderAdminContactsCms();

  // Facilities Grid (5 Fasilitas Kelas Lynk.id Showcase)
  const facGrid = document.getElementById('admin-facilities-grid');
  if (facGrid && Array.isArray(cms.facilities)) {
    facGrid.innerHTML = '';
    cms.facilities.forEach(fac => {
      const card = document.createElement('div');
      card.className = 'glass-card rounded-xl p-4 border border-slate-800 flex flex-col justify-between';
      const hasCustomImg = fac.imageUrl && fac.imageUrl.trim().length > 0;
      const convertedImg = hasCustomImg && typeof convertGoogleDriveUrl === 'function' ? convertGoogleDriveUrl(fac.imageUrl) : (fac.imageUrl || '');
      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-emerald-400">
                ${getMonolineSvgIcon(fac.icon || 'bot', 'w-3.5 h-3.5')}
              </div>
              <span class="text-xs font-bold text-white">${escapeHtml(fac.title)}</span>
            </div>
            <div class="flex items-center gap-1.5">
              ${hasCustomImg ? '<span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">GAMBAR AKTIF</span>' : '<span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-500 border border-slate-800">UI VECTOR</span>'}
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 capitalize">${escapeHtml(fac.tint || 'emerald')}</span>
            </div>
          </div>
          ${hasCustomImg ? `
            <div class="mb-2.5 w-full h-24 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center p-1">
              <img src="${escapeHtml(convertedImg)}" alt="Preview ${escapeHtml(fac.title)}" class="w-full h-full object-cover rounded" onerror="this.onerror=null; this.parentElement.innerHTML='<span class=\\'text-[10px] text-rose-400 font-mono\\'>Gagal memuat link</span>';">
            </div>
          ` : ''}
          <p class="text-xs text-slate-400 mb-3">${escapeHtml(fac.description || fac.desc || '')}</p>
          <div class="flex flex-wrap gap-1 mb-3">
            ${(fac.tags || []).map(t => `<span class="micro-tag-pill text-[10px]">${escapeHtml(t)}</span>`).join('')}
          </div>
        </div>
        <div class="pt-2.5 border-t border-slate-800 flex justify-end">
          <button onclick="openEditFacilityModal('${fac.id}')" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 flex items-center gap-1.5 transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            <span>Edit Fasilitas</span>
          </button>
        </div>
      `;
      facGrid.appendChild(card);
    });
  }

  // Target Siswa / Use-Cases Grid (4 Kartu Grid)
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
              <div class="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400">
                ${getMonolineSvgIcon(uc.icon || 'briefcase', 'w-3.5 h-3.5')}
              </div>
              <span class="text-xs font-bold text-white">${escapeHtml(uc.title)}</span>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 capitalize">${escapeHtml(uc.tint || 'amber')}</span>
          </div>
          <p class="text-xs text-slate-400 mb-3">${escapeHtml(uc.description || uc.desc || '')}</p>
          <div class="flex flex-wrap gap-1 mb-3">
            ${(uc.tags || []).map(t => `<span class="micro-tag-pill text-[10px]">${escapeHtml(t)}</span>`).join('')}
          </div>
        </div>
        <div class="pt-2.5 border-t border-slate-800 flex justify-end">
          <button onclick="openEditUseCaseModal('${uc.id}')" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center gap-1.5 transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            <span>Edit Target Siswa</span>
          </button>
        </div>
      `;
      ucGrid.appendChild(card);
    });
  }

  // Testimonials Table (Revisi 97 Moderasi Testimoni Member)
  const tBody = document.getElementById('admin-testimonials-table-body');
  if (tBody && Array.isArray(cms.testimonials)) {
    tBody.innerHTML = '';
    cms.testimonials.forEach((t, idx) => {
      const isApproved = t.status === 'approved' || !t.status;
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
          <div class="font-bold text-white flex items-center gap-1.5">
            <span>${escapeHtml(t.name)}</span>
            ${t.userEmail ? `<span class="text-[10px] font-mono text-slate-400 font-normal">(${escapeHtml(t.userEmail)})</span>` : ''}
          </div>
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
        <td class="py-3 px-4 text-center">
          ${isApproved ? `
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              APPROVED
            </span>
          ` : `
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40 animate-pulse">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              PENDING
            </span>
          `}
        </td>
        <td class="py-3 px-4 text-right">
          <div class="flex items-center justify-end gap-1.5">
            ${!isApproved ? `
              <button onclick="approveTestimonial('${t.id}')" class="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1 transition-all shadow-sm" title="Setujui & Tayangkan di Landing Page">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                <span>Setujui</span>
              </button>
            ` : `
              <button onclick="unapproveTestimonial('${t.id}')" class="p-1.5 text-amber-400 hover:text-amber-300 rounded hover:bg-amber-950/40" title="Jadikan Pending (Sembunyikan dari Landing Page)">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </button>
            `}
            ${t.proofPhotoUrl ? `
              <button onclick="openTestimonialProofModal('${escapeHtml(t.proofPhotoUrl)}', '${escapeHtml(t.name)}', '${escapeHtml(t.outcomeBadge || 'Testimoni Member')}', '${escapeHtml(t.quote)}')" class="p-1.5 text-emerald-400 hover:text-white rounded hover:bg-slate-800" title="Lihat Foto Bukti">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              </button>
            ` : ''}
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

function autoPushLandingCmsIfConnected() {
  if (window.ZettSupabase && typeof window.ZettSupabase.pushLandingCmsToSupabase === 'function' && window.ZettSupabase.isConnected()) {
    window.ZettSupabase.pushLandingCmsToSupabase(true);
  }
}

async function handleManualSyncCmsToCloud() {
  if (!window.ZettSupabase || !window.ZettSupabase.isConnected()) {
    showToast('Supabase belum terhubung. Periksa konfigurasi di tab Database.', 'warning');
    return;
  }
  showToast('Menyinkronkan seluruh konten CMS ke Cloud Supabase...', 'info');
  const ok = await window.ZettSupabase.pushLandingCmsToSupabase(false);
  if (ok) {
    showToast('CMS Landing Page berhasil dipublikasikan ke seluruh dunia via Supabase!', 'success');
  }
}
window.handleManualSyncCmsToCloud = handleManualSyncCmsToCloud;

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
  autoPushLandingCmsIfConnected();
  if (typeof renderLandingFromCms === 'function') renderLandingFromCms();
  if (window.HeroTypewriterController) window.HeroTypewriterController.init();
  showToast('Pengaturan Hero Banner & Typewriter berhasil disimpan!', 'success');
}

function resetLandingHeroToDefault() {
  showCustomConfirm({
    title: 'Reset Pengaturan Hero Banner?',
    message: 'Kembalikan pengaturan teks headline, badge, deskripsi, dan tombol CTA Hero Banner ke bawaan awal default?',
    confirmText: 'Ya, Reset ke Default',
    cancelText: 'Batal',
    isDanger: true,
    onConfirm: () => {
      const zData = window.ZettData || {};
      if (zData.SEED_LANDING_CMS?.hero) {
        AppState.landingCms.hero = JSON.parse(JSON.stringify(zData.SEED_LANDING_CMS.hero));
        saveState();
        autoPushLandingCmsIfConnected();
        renderAdminLandingCms();
        if (typeof renderLandingFromCms === 'function') renderLandingFromCms();
        if (window.HeroTypewriterController) window.HeroTypewriterController.init();
        showToast('Hero Banner berhasil di-reset ke default!', 'info');
      }
    }
  });
}

// ==========================================
// PENGATURAN KONTAK WHATSAPP DUAL-ADMIN (CMS)
// ==========================================

function renderAdminContactsCms() {
  const contacts = (AppState.landingCms?.adminContacts && Array.isArray(AppState.landingCms.adminContacts) && AppState.landingCms.adminContacts.length > 0)
    ? AppState.landingCms.adminContacts
    : [
        { id: 'admin1', name: 'Admin Farhan', phone: '0851-1122-6452', role: 'Support & Operasional LMS', status: 'Online' },
        { id: 'admin2', name: 'Admin Asep', phone: '0821-9527-7812', role: 'Pendaftaran & Konsultasi Member', status: 'Online' }
      ];

  const admin1 = contacts[0] || { name: 'Admin Farhan', phone: '0851-1122-6452', role: 'Support & Operasional LMS' };
  const admin2 = contacts[1] || { name: 'Admin Asep', phone: '0821-9527-7812', role: 'Pendaftaran & Konsultasi Member' };

  const n1 = document.getElementById('admin-contact-name-1');
  const p1 = document.getElementById('admin-contact-phone-1');
  const r1 = document.getElementById('admin-contact-role-1');
  const n2 = document.getElementById('admin-contact-name-2');
  const p2 = document.getElementById('admin-contact-phone-2');
  const r2 = document.getElementById('admin-contact-role-2');

  if (n1) n1.value = admin1.name || '';
  if (p1) p1.value = admin1.phone || '';
  if (r1) r1.value = admin1.role || '';

  if (n2) n2.value = admin2.name || '';
  if (p2) p2.value = admin2.phone || '';
  if (r2) r2.value = admin2.role || '';
}

function handleSaveAdminContactsCms(e) {
  if (e) e.preventDefault();
  if (!AppState.landingCms) AppState.landingCms = {};

  const name1 = document.getElementById('admin-contact-name-1')?.value.trim() || 'Admin Farhan';
  const phone1 = document.getElementById('admin-contact-phone-1')?.value.trim() || '0851-1122-6452';
  const role1 = document.getElementById('admin-contact-role-1')?.value.trim() || 'Support & Operasional LMS';

  const name2 = document.getElementById('admin-contact-name-2')?.value.trim() || 'Admin Asep';
  const phone2 = document.getElementById('admin-contact-phone-2')?.value.trim() || '0821-9527-7812';
  const role2 = document.getElementById('admin-contact-role-2')?.value.trim() || 'Pendaftaran & Konsultasi Member';

  const updatedContacts = [
    { id: 'admin1', name: name1, phone: phone1, role: role1, status: 'Online' },
    { id: 'admin2', name: name2, phone: phone2, role: role2, status: 'Online' }
  ];

  AppState.landingCms.adminContacts = updatedContacts;
  if (!AppState.landingCms.hero) AppState.landingCms.hero = {};
  AppState.landingCms.hero.adminContacts = updatedContacts;
  AppState.landingCms.hero._adminContacts = updatedContacts;

  saveState();
  autoPushLandingCmsIfConnected();

  if (typeof renderWhatsAppContactCards === 'function') {
    renderWhatsAppContactCards();
  }

  showToast('Kontak WhatsApp Admin berhasil disimpan & LIVE di Cloud!', 'success');
}

function resetAdminContactsToDefault() {
  showCustomConfirm({
    title: 'Reset Kontak WhatsApp Admin?',
    message: 'Kembalikan data kontak WhatsApp Admin Farhan & Admin Asep ke pengaturan bawaan default?',
    confirmText: 'Ya, Reset ke Default',
    cancelText: 'Batal',
    isDanger: true,
    onConfirm: () => {
      const defaultContacts = [
        { id: 'admin1', name: 'Admin Farhan', phone: '0851-1122-6452', role: 'Support & Operasional LMS', status: 'Online' },
        { id: 'admin2', name: 'Admin Asep', phone: '0821-9527-7812', role: 'Pendaftaran & Konsultasi Member', status: 'Online' }
      ];

      if (!AppState.landingCms) AppState.landingCms = {};
      AppState.landingCms.adminContacts = defaultContacts;
      if (!AppState.landingCms.hero) AppState.landingCms.hero = {};
      AppState.landingCms.hero.adminContacts = defaultContacts;
      AppState.landingCms.hero._adminContacts = defaultContacts;

      saveState();
      autoPushLandingCmsIfConnected();
      renderAdminContactsCms();

      if (typeof renderWhatsAppContactCards === 'function') {
        renderWhatsAppContactCards();
      }

      showToast('Kontak WhatsApp Admin berhasil di-reset ke default!', 'info');
    }
  });
}

// ==========================================
// PENGATELORAN FASILITAS KELAS (LYNK.ID SHOWCASE)
// ==========================================

function handleFacilityImagePreview(val) {
  const previewBox = document.getElementById('edit-facility-img-preview');
  if (!previewBox) return;
  const converted = typeof convertGoogleDriveUrl === 'function' ? convertGoogleDriveUrl(val) : val;
  if (converted && converted.trim()) {
    previewBox.innerHTML = `
      <img src="${escapeHtml(converted.trim())}" alt="Preview" class="w-full h-full object-contain" onerror="this.onerror=null; this.parentElement.innerHTML='<span class=\\'text-xs text-rose-400 font-mono\\'>Gagal memuat gambar (cek link)</span>';">
    `;
  } else {
    previewBox.innerHTML = `<span class="text-[11px] text-slate-500 font-mono">Pratinjau Gambar (Mockup Bawaan Aktif)</span>`;
  }
}
window.handleFacilityImagePreview = handleFacilityImagePreview;

function openEditFacilityModal(id) {
  const fac = (AppState.landingCms?.facilities || []).find(u => u.id === id);
  if (!fac) return;

  document.getElementById('edit-facility-id').value = fac.id;
  document.getElementById('edit-facility-title').value = fac.title;
  document.getElementById('edit-facility-icon').value = fac.icon || 'bot';
  document.getElementById('edit-facility-tint').value = fac.tint || 'emerald';
  document.getElementById('edit-facility-tags').value = (fac.tags || []).join(', ');
  document.getElementById('edit-facility-desc').value = fac.description || fac.desc || '';
  
  const imgInp = document.getElementById('edit-facility-imageurl');
  if (imgInp) {
    imgInp.value = fac.imageUrl || '';
    handleFacilityImagePreview(fac.imageUrl || '');
  }

  document.getElementById('modal-edit-facility').classList.remove('hidden');
}

function closeEditFacilityModal() {
  document.getElementById('modal-edit-facility').classList.add('hidden');
}

function handleSaveFacilitySubmit(e) {
  if (e) e.preventDefault();
  const id = document.getElementById('edit-facility-id').value;
  const fac = (AppState.landingCms?.facilities || []).find(u => u.id === id);
  if (!fac) return;

  fac.title = document.getElementById('edit-facility-title').value.trim();
  fac.icon = document.getElementById('edit-facility-icon').value;
  fac.tint = document.getElementById('edit-facility-tint').value;
  fac.tags = document.getElementById('edit-facility-tags').value.split(',').map(t => t.trim()).filter(t => t.length > 0);
  const descVal = document.getElementById('edit-facility-desc').value.trim();
  fac.description = descVal;
  fac.desc = descVal;

  const imgInp = document.getElementById('edit-facility-imageurl');
  fac.imageUrl = imgInp ? imgInp.value.trim() : '';

  saveState();
  autoPushLandingCmsIfConnected();
  closeEditFacilityModal();
  renderAdminLandingCms();
  if (typeof renderLandingFromCms === 'function') renderLandingFromCms();
  showToast('Fasilitas Kelas berhasil diperbarui!', 'success');
}

function resetLandingFacilitiesToDefault() {
  showCustomConfirm({
    title: 'Reset Kartu Fasilitas Kelas?',
    message: 'Kembalikan 5 kartu fasilitas resmi di landing page ke pengaturan bawaan awal default?',
    confirmText: 'Ya, Reset ke Default',
    cancelText: 'Batal',
    isDanger: true,
    onConfirm: () => {
      const zData = window.ZettData || {};
      if (zData.SEED_LANDING_CMS?.facilities) {
        AppState.landingCms.facilities = JSON.parse(JSON.stringify(zData.SEED_LANDING_CMS.facilities));
        saveState();
        autoPushLandingCmsIfConnected();
        renderAdminLandingCms();
        if (typeof renderLandingFromCms === 'function') renderLandingFromCms();
        showToast('Kartu fasilitas berhasil di-reset!', 'info');
      }
    }
  });
}

// ==========================================
// PENGELOLA TARGET SISWA / AUDIENS (4 KARTU GRID)
// ==========================================

function openEditUseCaseModal(id) {
  const uc = (AppState.landingCms?.useCases || []).find(u => u.id === id);
  if (!uc) return;

  document.getElementById('edit-usecase-id').value = uc.id;
  document.getElementById('edit-usecase-title').value = uc.title;
  document.getElementById('edit-usecase-icon').value = uc.icon || 'briefcase';
  document.getElementById('edit-usecase-tint').value = uc.tint || 'amber';
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
  autoPushLandingCmsIfConnected();
  closeEditUseCaseModal();
  renderAdminLandingCms();
  if (typeof renderLandingFromCms === 'function') renderLandingFromCms();
  showToast('Target Siswa berhasil diperbarui!', 'success');
}

function resetLandingUseCasesToDefault() {
  showCustomConfirm({
    title: 'Reset Kartu Target Siswa?',
    message: 'Kembalikan 4 kartu target siswa di landing page ke pengaturan bawaan awal default?',
    confirmText: 'Ya, Reset ke Default',
    cancelText: 'Batal',
    isDanger: true,
    onConfirm: () => {
      const zData = window.ZettData || {};
      if (zData.SEED_LANDING_CMS?.useCases) {
        AppState.landingCms.useCases = JSON.parse(JSON.stringify(zData.SEED_LANDING_CMS.useCases));
        saveState();
        autoPushLandingCmsIfConnected();
        renderAdminLandingCms();
        if (typeof renderLandingFromCms === 'function') renderLandingFromCms();
        showToast('Kartu target siswa berhasil di-reset!', 'info');
      }
    }
  });
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

  const proofUrl = document.getElementById('edit-testi-proof-url');
  const proofFile = document.getElementById('edit-testi-proof-file');
  const previewBox = document.getElementById('testi-proof-preview-container');
  const previewImg = document.getElementById('testi-proof-preview-img');
  const uploadStatus = document.getElementById('testi-proof-upload-status');

  if (proofUrl) proofUrl.value = '';
  if (proofFile) proofFile.value = '';
  if (previewBox) previewBox.classList.add('hidden');
  if (previewImg) previewImg.src = '';
  if (uploadStatus) uploadStatus.classList.add('hidden');

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

  const proofUrl = document.getElementById('edit-testi-proof-url');
  const proofFile = document.getElementById('edit-testi-proof-file');
  const previewBox = document.getElementById('testi-proof-preview-container');
  const previewImg = document.getElementById('testi-proof-preview-img');
  const uploadStatus = document.getElementById('testi-proof-upload-status');

  if (proofFile) proofFile.value = '';
  if (uploadStatus) uploadStatus.classList.add('hidden');
  if (proofUrl) proofUrl.value = t.proofPhotoUrl || '';

  if (previewBox && previewImg) {
    if (t.proofPhotoUrl) {
      previewImg.src = t.proofPhotoUrl;
      previewBox.classList.remove('hidden');
    } else {
      previewImg.src = '';
      previewBox.classList.add('hidden');
    }
  }

  document.getElementById('modal-edit-testimonial').classList.remove('hidden');
}

function closeEditTestimonialModal() {
  document.getElementById('modal-edit-testimonial').classList.add('hidden');
}

async function handleTestiProofFileUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showToast('Ukuran foto terlalu besar (maksimal 5MB)', 'error');
    return;
  }

  const uploadStatus = document.getElementById('testi-proof-upload-status');
  const previewBox = document.getElementById('testi-proof-preview-container');
  const previewImg = document.getElementById('testi-proof-preview-img');
  const proofUrl = document.getElementById('edit-testi-proof-url');

  if (uploadStatus) {
    uploadStatus.textContent = 'Mengunggah ke Supabase Storage...';
    uploadStatus.classList.remove('hidden');
  }

  try {
    let uploadedUrl = '';
    if (typeof ZettSupabase !== 'undefined' && typeof ZettSupabase.uploadTestimonialProof === 'function') {
      uploadedUrl = await ZettSupabase.uploadTestimonialProof(file);
    } else {
      uploadedUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result || '');
        reader.readAsDataURL(file);
      });
    }

    if (uploadedUrl) {
      if (proofUrl) proofUrl.value = uploadedUrl;
      if (previewImg) previewImg.src = uploadedUrl;
      if (previewBox) previewBox.classList.remove('hidden');
      showToast('Foto bukti berhasil diunggah!', 'success');
    } else {
      showToast('Gagal mengunggah foto bukti', 'error');
    }
  } catch (err) {
    console.error('[Upload Testimonial Proof Error]', err);
    showToast('Terjadi kendala saat mengunggah foto', 'error');
  } finally {
    if (uploadStatus) uploadStatus.classList.add('hidden');
  }
}

function handleRemoveTestiProof() {
  const proofUrl = document.getElementById('edit-testi-proof-url');
  const proofFile = document.getElementById('edit-testi-proof-file');
  const previewBox = document.getElementById('testi-proof-preview-container');
  const previewImg = document.getElementById('testi-proof-preview-img');

  if (proofUrl) proofUrl.value = '';
  if (proofFile) proofFile.value = '';
  if (previewImg) previewImg.src = '';
  if (previewBox) previewBox.classList.add('hidden');
  showToast('Foto bukti telah dilepas', 'info');
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
  const proofPhotoUrl = document.getElementById('edit-testi-proof-url')?.value?.trim() || '';

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
      target.proofPhotoUrl = proofPhotoUrl;
      target.status = target.status || 'approved';
    }
  } else {
    const newId = generateFormattedId('TESTI', AppState.landingCms?.testimonials || [], 2);
    AppState.landingCms.testimonials.unshift({
      id: newId,
      name,
      role,
      initials,
      quote,
      outcomeBadge,
      tint,
      proofPhotoUrl,
      status: 'approved'
    });
  }

  saveState();
  autoPushLandingCmsIfConnected();
  closeEditTestimonialModal();
  renderAdminLandingCms();
  if (typeof renderLandingFromCms === 'function') renderLandingFromCms();
  showToast('Testimoni berhasil disimpan!', 'success');
}

function approveTestimonial(id) {
  if (!AppState.landingCms?.testimonials) return;
  const target = AppState.landingCms.testimonials.find(item => item.id === id);
  if (!target) return;
  target.status = 'approved';
  saveState();
  autoPushLandingCmsIfConnected();
  renderAdminLandingCms();
  if (typeof renderLandingFromCms === 'function') renderLandingFromCms();
  showToast(`Testimoni dari "${target.name}" disetujui & tayang di landing!`, 'success');
}

function unapproveTestimonial(id) {
  if (!AppState.landingCms?.testimonials) return;
  const target = AppState.landingCms.testimonials.find(item => item.id === id);
  if (!target) return;
  target.status = 'pending';
  saveState();
  autoPushLandingCmsIfConnected();
  renderAdminLandingCms();
  if (typeof renderLandingFromCms === 'function') renderLandingFromCms();
  showToast(`Testimoni dari "${target.name}" diubah ke status Pending.`, 'info');
}

function deleteTestimonial(id) {
  showCustomConfirm({
    title: 'Hapus Testimoni Member?',
    message: 'Hapus testimoni member ini dari landing page secara permanen?',
    confirmText: 'Ya, Hapus Testimoni',
    cancelText: 'Batal',
    isDanger: true,
    onConfirm: () => {
      AppState.landingCms.testimonials = (AppState.landingCms.testimonials || []).filter(t => t.id !== id);
      saveState();
      autoPushLandingCmsIfConnected();
      renderAdminLandingCms();
      if (typeof renderLandingFromCms === 'function') renderLandingFromCms();
      showToast('Testimoni telah dihapus', 'info');
    }
  });
}

function resetLandingTestimonialsToDefault() {
  showCustomConfirm({
    title: 'Reset Daftar Testimoni?',
    message: 'Kembalikan seluruh daftar testimoni member ke pengaturan bawaan awal default?',
    confirmText: 'Ya, Reset ke Default',
    cancelText: 'Batal',
    isDanger: true,
    onConfirm: () => {
      const zData = window.ZettData || {};
      if (zData.SEED_LANDING_CMS?.testimonials) {
        AppState.landingCms.testimonials = JSON.parse(JSON.stringify(zData.SEED_LANDING_CMS.testimonials));
        saveState();
        autoPushLandingCmsIfConnected();
        renderAdminLandingCms();
        if (typeof renderLandingFromCms === 'function') renderLandingFromCms();
        showToast('Daftar testimoni berhasil di-reset!', 'info');
      }
    }
  });
}

// ==========================================
// 3. CMS SHARED RESOURCES
// ==========================================

function renderAdminCategoryList() {
  const container = document.getElementById('admin-category-pills-container');
  if (!container) return;

  const categories = AppState.resourceCategories || [];
  const resources = AppState.resources || [];

  if (categories.length === 0) {
    container.innerHTML = '<span class="text-xs text-slate-500 font-mono">Belum ada folder/kategori. Klik "+ Tambah Folder / Kategori".</span>';
    return;
  }

  container.innerHTML = categories.map(cat => {
    const linkCount = resources.filter(r => 
      r.category === cat.id || 
      (r.category || '').toLowerCase() === cat.name.toLowerCase()
    ).length;

    return `
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200">
        <span class="flex items-center gap-1.5 font-semibold text-white">
          <span>${typeof getCategoryIconSvg === 'function' ? getCategoryIconSvg(cat.icon, 'w-3.5 h-3.5 text-emerald-400') : '📁'}</span>
          <span>${escapeHtml(cat.name)}</span>
        </span>
        <span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-emerald-400 font-bold border border-emerald-500/20">
          ${linkCount} Link
        </span>
        <div class="flex items-center gap-1 ml-1 pl-1 border-l border-slate-700">
          <button onclick="openEditCategoryModal('${escapeHtml(cat.id)}')" title="Edit Kategori" class="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <button onclick="deleteCategory('${escapeHtml(cat.id)}')" title="Hapus Kategori" class="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function openAddCategoryModal() {
  const idInput = document.getElementById('manage-category-id');
  const nameInput = document.getElementById('manage-category-name');
  const iconInput = document.getElementById('manage-category-icon');
  const badgeInput = document.getElementById('manage-category-badge');
  const titleEl = document.getElementById('manage-category-modal-title');

  if (idInput) idInput.value = '';
  if (nameInput) nameInput.value = '';
  if (iconInput) iconInput.value = 'folder';
  if (badgeInput) badgeInput.value = '';
  if (titleEl) titleEl.textContent = 'Tambah Folder / Kategori ZettLink';

  const modal = document.getElementById('modal-manage-category');
  if (modal) modal.classList.remove('hidden');
}

function openEditCategoryModal(catId) {
  const cat = (AppState.resourceCategories || []).find(c => c.id === catId);
  if (!cat) return;

  const idInput = document.getElementById('manage-category-id');
  const nameInput = document.getElementById('manage-category-name');
  const iconInput = document.getElementById('manage-category-icon');
  const badgeInput = document.getElementById('manage-category-badge');
  const titleEl = document.getElementById('manage-category-modal-title');

  if (idInput) idInput.value = cat.id;
  if (nameInput) nameInput.value = cat.name;
  if (iconInput) iconInput.value = cat.icon || 'folder';
  if (badgeInput) badgeInput.value = cat.badge || '';
  if (titleEl) titleEl.textContent = 'Edit Folder / Kategori ZettLink';

  const modal = document.getElementById('modal-manage-category');
  if (modal) modal.classList.remove('hidden');
}

function closeCategoryModal() {
  const modal = document.getElementById('modal-manage-category');
  if (modal) modal.classList.add('hidden');
}

async function handleSaveCategorySubmit(e) {
  if (e) e.preventDefault();
  const id = document.getElementById('manage-category-id')?.value;
  const name = document.getElementById('manage-category-name')?.value.trim();
  const icon = document.getElementById('manage-category-icon')?.value || 'folder';
  const badge = document.getElementById('manage-category-badge')?.value.trim();

  if (!name) {
    showToast('Harap isi nama folder / kategori', 'error');
    return;
  }

  AppState.resourceCategories = AppState.resourceCategories || [];

  if (id) {
    const existing = AppState.resourceCategories.find(c => c.id === id);
    if (existing) {
      existing.name = name;
      existing.icon = icon;
      existing.badge = badge;
    }
  } else {
    const newId = 'cat-' + Date.now();
    AppState.resourceCategories.push({
      id: newId,
      name,
      icon,
      badge: badge || name,
      orderIndex: AppState.resourceCategories.length + 1
    });
  }

  saveState();

  if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
    try {
      await ZettSupabase.pushLandingCmsToSupabase(true);
    } catch (err) {
      console.warn('[Category Sync Error]', err);
    }
  }

  closeCategoryModal();
  renderAdminCategoryList();
  if (typeof populateCategoryDropdowns === 'function') populateCategoryDropdowns();
  if (typeof renderAdminResourcesCms === 'function') renderAdminResourcesCms();
  if (typeof renderResources === 'function') renderResources();
  showToast('Kategori ZettLink berhasil disimpan!', 'success');
}

function deleteCategory(catId) {
  showCustomConfirm({
    title: 'Hapus Kategori ZettLink?',
    message: 'Apakah Anda yakin ingin menghapus kategori ini? Link di dalamnya tidak akan terhapus, namun kategori ini akan dihilangkan dari menu.',
    confirmText: 'Ya, Hapus Kategori',
    cancelText: 'Batal',
    isDanger: true,
    onConfirm: async () => {
      AppState.resourceCategories = (AppState.resourceCategories || []).filter(c => c.id !== catId);
      saveState();

      if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
        try {
          await ZettSupabase.pushLandingCmsToSupabase(true);
        } catch (err) {
          console.warn('[Category Delete Sync Error]', err);
        }
      }

      renderAdminCategoryList();
      if (typeof populateCategoryDropdowns === 'function') populateCategoryDropdowns();
      if (typeof renderAdminResourcesCms === 'function') renderAdminResourcesCms();
      if (typeof renderResources === 'function') renderResources();
      showToast('Kategori ZettLink telah dihapus', 'info');
    }
  });
}

function renderAdminResourcesCms() {
  const tbody = document.getElementById('admin-resources-table-body');
  const countEl = document.getElementById('admin-resource-count');
  if (!tbody) return;

  renderAdminCategoryList();

  if (!AppState.resources || !Array.isArray(AppState.resources) || AppState.resources.length === 0) {
    const zData = window.ZettData || {};
    AppState.resources = zData.SEED_RESOURCES ? JSON.parse(JSON.stringify(zData.SEED_RESOURCES)) : [];
    saveState();
  }

  const all = AppState.resources || [];
  const categories = AppState.resourceCategories || [];
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

    const catObj = categories.find(c => c.id === res.category || c.name.toLowerCase() === (res.category || '').toLowerCase());
    const catDisplayName = catObj ? catObj.name : (res.badge || (res.category ? res.category.toUpperCase() : 'UMUM'));

    row.innerHTML = `
      <td class="py-3 px-4 text-center font-mono text-slate-500">${idx + 1}</td>
      <td class="py-3 px-4">
        <span class="px-2 py-0.5 rounded text-[10px] font-bold border bg-emerald-950 text-emerald-300 border-emerald-800/80">
          ${escapeHtml(catDisplayName)}
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
  if (typeof populateCategoryDropdowns === 'function') populateCategoryDropdowns();
  const res = (AppState.resources || []).find(r => r.id === id);
  if (!res) return;

  document.getElementById('edit-res-id').value = res.id;
  document.getElementById('edit-res-title').value = res.title;
  document.getElementById('edit-res-url').value = res.url;
  document.getElementById('edit-res-category').value = res.category || 'cat-modul';
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

  // Live Auto-Push ke Supabase Cloud tabel shared_resources
  if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
    ZettSupabase.client.from('shared_resources').upsert({
      id: res.id,
      title: res.title,
      description: res.description || '',
      url: res.url,
      category: res.category || 'sheet',
      badge: res.badge || 'Official Link',
      order_index: res.orderIndex || 1
    }, { onConflict: 'id' }).then(({ error }) => {
      if (error) console.warn('[Supabase Shared Resources Update Warning]', error);
    });
  }

  closeEditResourceModal();
  renderAdminResourcesCms();
  if (typeof renderResources === 'function') renderResources();
  showToast('Perubahan dokumen berhasil disimpan & LIVE ke Database!', 'success');
}

function resetResourcesToDefault() {
  showCustomConfirm({
    title: 'Reset Daftar Shared Resources?',
    message: 'Kembalikan seluruh daftar shared resource & link dokumen ke pengaturan awal default?',
    confirmText: 'Ya, Reset ke Default',
    cancelText: 'Batal',
    isDanger: true,
    onConfirm: () => {
      const zData = window.ZettData || {};
      AppState.resources = zData.SEED_RESOURCES ? JSON.parse(JSON.stringify(zData.SEED_RESOURCES)) : [];
      saveState();

      if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
        ZettSupabase.client.from('shared_resources').delete().neq('id', '__keep_none__').then(({ error }) => {
          if (error) console.warn('[Supabase Resources Wipe Warning]', error);
        });
      }

      renderAdminResourcesCms();
      if (typeof renderResources === 'function') renderResources();
      showToast('Resource berhasil di-reset ke default (0 dokumen)!', 'info');
    }
  });
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
        <div class="flex items-center justify-end gap-1.5">
          <button onclick="openEditQuickActionModal('${qa.id}')" class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 transition-colors inline-flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            <span>Edit</span>
          </button>
          <button onclick="deleteQuickAction('${qa.id}')" class="px-2 py-1 rounded-lg text-xs font-semibold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 transition-colors" title="Hapus kartu ini">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openAddQuickActionModal() {
  document.getElementById('edit-qa-id').value = '';
  document.getElementById('edit-qa-title').value = '';
  document.getElementById('edit-qa-subtitle').value = '';
  document.getElementById('edit-qa-icon').value = 'folder';
  document.getElementById('edit-qa-badge').value = 'Akses';
  document.getElementById('edit-qa-actiontype').value = 'navigate';
  document.getElementById('edit-qa-target-url').value = '';
  document.getElementById('edit-qa-target-view').value = 'resources';

  const titleEl = document.querySelector('#modal-edit-quickaction h3');
  if (titleEl) titleEl.innerHTML = `
    <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
    <span>Tambah Kartu Quick Action Hub</span>
  `;

  toggleQuickActionTargetType();
  document.getElementById('modal-edit-quickaction').classList.remove('hidden');
}
window.openAddQuickActionModal = openAddQuickActionModal;

function openEditQuickActionModal(qaId) {
  const qa = (AppState.quickActions || []).find(a => a.id === qaId);
  if (!qa) return;

  document.getElementById('edit-qa-id').value = qa.id;
  document.getElementById('edit-qa-title').value = qa.title || '';
  document.getElementById('edit-qa-subtitle').value = qa.subtitle || '';
  document.getElementById('edit-qa-icon').value = qa.icon || 'folder';
  document.getElementById('edit-qa-badge').value = qa.badge || '';
  document.getElementById('edit-qa-actiontype').value = qa.actionType || 'navigate';

  const titleEl = document.querySelector('#modal-edit-quickaction h3');
  if (titleEl) titleEl.innerHTML = `
    <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
    <span>Edit Kartu Quick Action Hub</span>
  `;

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

async function handleSaveQuickActionSubmit(e) {
  if (e) e.preventDefault();

  const id = document.getElementById('edit-qa-id').value;
  const title = document.getElementById('edit-qa-title').value.trim();
  const subtitle = document.getElementById('edit-qa-subtitle').value.trim();
  const icon = document.getElementById('edit-qa-icon').value;
  const badge = document.getElementById('edit-qa-badge').value.trim() || 'Akses';
  const actionType = document.getElementById('edit-qa-actiontype').value;
  const target = actionType === 'url'
    ? document.getElementById('edit-qa-target-url').value.trim()
    : document.getElementById('edit-qa-target-view').value;

  if (!title) {
    showToast('Judul kartu tidak boleh kosong', 'error');
    return;
  }

  if (id) {
    // Edit existing
    const qa = (AppState.quickActions || []).find(a => a.id === id);
    if (qa) {
      qa.title = title;
      qa.subtitle = subtitle;
      qa.icon = icon;
      qa.badge = badge;
      qa.actionType = actionType;
      qa.target = target;
    }
  } else {
    // Add new
    const newQa = {
      id: generateFormattedId('QA', AppState.quickActions, 2),
      title: title,
      subtitle: subtitle,
      icon: icon,
      badge: badge,
      actionType: actionType,
      target: target,
      orderIndex: (AppState.quickActions || []).length + 1
    };
    if (!Array.isArray(AppState.quickActions)) AppState.quickActions = [];
    AppState.quickActions.push(newQa);
  }

  saveState();

  // Live Auto-Push ke Supabase Cloud
  if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
    const payload = AppState.quickActions.map((q, i) => ({
      id: q.id,
      title: q.title,
      subtitle: q.subtitle || '',
      icon: q.icon || 'folder',
      badge: q.badge || 'Akses',
      action_type: q.actionType || 'navigate',
      target: q.target || '',
      order_index: i + 1
    }));
    try {
      const { error } = await ZettSupabase.client.from('quick_actions').upsert(payload, { onConflict: 'id' });
      if (error) throw error;
      showToast(id ? 'Kartu Quick Action berhasil diperbarui & LIVE di Cloud!' : 'Quick Action baru berhasil ditambahkan & LIVE di Cloud!', 'success');
    } catch (err) {
      console.error('[Supabase QA Save Error]', err);
      showToast(`Tersimpan lokal, tapi gagal ke Cloud: ${err.message || 'RLS'}`, 'warning');
    }
  } else {
    showToast(id ? 'Kartu Quick Action berhasil diperbarui!' : 'Quick Action baru berhasil ditambahkan!', 'success');
  }

  closeEditQuickActionModal();
  renderAdminQuickActions();
  if (typeof renderQuickActionHub === 'function') renderQuickActionHub();
}
window.handleSaveQuickActionSubmit = handleSaveQuickActionSubmit;

function deleteQuickAction(qaId) {
  const qa = (AppState.quickActions || []).find(a => a.id === qaId);
  if (!qa) return;

  showCustomConfirm({
    title: 'Hapus Kartu Quick Action?',
    message: `Hapus kartu "${qa.title}" dari tampilan Home beranda?`,
    confirmText: 'Ya, Hapus Kartu',
    cancelText: 'Batal',
    isDanger: true,
    onConfirm: async () => {
      AppState.quickActions = (AppState.quickActions || []).filter(a => a.id !== qaId);
      saveState();

      if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
        try {
          const { error } = await ZettSupabase.client.from('quick_actions').delete().eq('id', qaId);
          if (error) throw error;
          showToast(`Kartu "${qa.title}" berhasil dihapus dari cloud & lokal.`, 'info');
        } catch (err) {
          console.error('[Supabase QA Delete Error]', err);
          showToast(`Kartu dihapus di lokal, tapi gagal di Cloud: ${err.message || 'RLS'}`, 'warning');
        }
      } else {
        showToast(`Kartu "${qa.title}" berhasil dihapus.`, 'info');
      }

      renderAdminQuickActions();
      if (typeof renderQuickActionHub === 'function') renderQuickActionHub();
    }
  });
}
window.deleteQuickAction = deleteQuickAction;

function resetQuickActionsToDefault() {
  showCustomConfirm({
    title: 'Reset Quick Action Hub?',
    message: 'Kembalikan 4 kartu Quick Action Hub di halaman depan ke pengaturan awal default?',
    confirmText: 'Ya, Reset ke Default',
    cancelText: 'Batal',
    isDanger: true,
    onConfirm: () => {
      const zData = window.ZettData || {};
      AppState.quickActions = zData.SEED_QUICK_ACTIONS ? JSON.parse(JSON.stringify(zData.SEED_QUICK_ACTIONS)) : [];
      saveState();

      if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
        const payload = AppState.quickActions.map((q, i) => ({
          id: q.id,
          title: q.title,
          subtitle: q.subtitle || '',
          icon: q.icon || 'folder',
          badge: q.badge || 'Akses',
          action_type: q.actionType || 'navigate',
          target: q.target || '',
          order_index: i + 1
        }));
        ZettSupabase.client.from('quick_actions').upsert(payload, { onConflict: 'id' });
      }

      renderAdminQuickActions();
      if (typeof renderQuickActionHub === 'function') renderQuickActionHub();
      showToast('Quick Action Hub berhasil di-reset ke default!', 'info');
    }
  });
}

// ==========================================
// 5. CURRICULUM MANAGEMENT & NOTION BLOCK EDITOR
// ==========================================

function renderAdminCurriculum() {
  const moduleSelect = document.getElementById('admin-module-select');
  const lessonSelect = document.getElementById('admin-lesson-select');
  const moduleMoveSelect = document.getElementById('admin-edit-module');
  if (!moduleSelect || !lessonSelect) return;

  // Background check: Auto-sync jika lokal ada modul tapi Supabase belum punya
  if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
    if (AppState.modules.length > 0 && !window._isSyncingCurriculumBackground) {
      window._isSyncingCurriculumBackground = true;
      ZettSupabase.client.from('curriculum_modules').select('id').limit(1).then(({ data, error }) => {
        window._isSyncingCurriculumBackground = false;
        if (!error && Array.isArray(data) && data.length === 0 && AppState.modules.length > 0) {
          ZettSupabase.syncCurriculumToCloudLive(false);
        }
      }).catch(() => {
        window._isSyncingCurriculumBackground = false;
      });
    } else if (AppState.modules.length === 0 && !window._isPullingCurriculumBackground) {
      window._isPullingCurriculumBackground = true;
      ZettSupabase.syncCurriculumFromCloud(true).finally(() => {
        window._isPullingCurriculumBackground = false;
      });
    }
  }

  // Jika belum ada modul sama sekali
  if (AppState.modules.length === 0) {
    moduleSelect.innerHTML = '<option value="">(Belum ada modul kurikulum)</option>';
    lessonSelect.innerHTML = '<option value="">(Belum ada materi)</option>';
    if (moduleMoveSelect) moduleMoveSelect.innerHTML = '<option value="">(Belum ada modul)</option>';
    AppState.adminSelectedModuleId = null;
    AppState.adminSelectedLessonId = null;

    clearEditorFields();
    showEditorEmptyState('Kurikulum Bersih (0 Modul)', 'Klik tombol <strong>+ Modul Baru</strong> di atas untuk membuat modul dan mulai menyusun materi.');
    return;
  }

  // 1. Render Daftar Modul ke Tier 1 Select
  moduleSelect.innerHTML = '';
  if (moduleMoveSelect) moduleMoveSelect.innerHTML = '';

  AppState.modules.sort((a, b) => a.orderIndex - b.orderIndex).forEach(mod => {
    const opt = document.createElement('option');
    opt.value = mod.id;
    const statusText = mod.isDraft ? '[DRAFT] ' : '';
    const pinText = mod.isPinned ? '📌 ' : '';
    opt.textContent = `${pinText}${statusText}${mod.badge || 'MODUL'}: ${mod.title}`;
    moduleSelect.appendChild(opt);

    if (moduleMoveSelect) {
      const moveOpt = document.createElement('option');
      moveOpt.value = mod.id;
      moveOpt.textContent = `${pinText}${statusText}${mod.title}`;
      moduleMoveSelect.appendChild(moveOpt);
    }
  });

  // Pastikan ada modul aktif terpilih
  if (!AppState.adminSelectedModuleId || !AppState.modules.some(m => m.id === AppState.adminSelectedModuleId)) {
    AppState.adminSelectedModuleId = AppState.modules[0].id;
  }
  moduleSelect.value = AppState.adminSelectedModuleId;

  // Sync Pin button state
  const pinBtn = document.getElementById('btn-admin-pin-module');
  if (pinBtn) {
    const curMod = AppState.modules.find(m => m.id === AppState.adminSelectedModuleId);
    if (curMod && curMod.isPinned) {
      pinBtn.innerHTML = '📌 Pinned';
      pinBtn.className = 'btn-micro-action bg-amber-500/20 text-amber-300 font-bold border-amber-500/40';
      pinBtn.title = 'Modul ini disematkan di Beranda. Klik untuk melepas sematan.';
    } else {
      pinBtn.innerHTML = '📌 Pin';
      pinBtn.className = 'btn-micro-action bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25 flex items-center gap-0.5';
      pinBtn.title = 'Sematkan modul ini di bagian atas Beranda';
    }
  }

  // 2. Render Materi Milik Modul Terpilih ke Tier 2 Select
  renderLessonsForSelectedModule();
}

function renderLessonsForSelectedModule() {
  const lessonSelect = document.getElementById('admin-lesson-select');
  if (!lessonSelect) return;

  const currentModuleId = AppState.adminSelectedModuleId;
  const modLessons = AppState.lessons.filter(l => l.moduleId === currentModuleId);

  lessonSelect.innerHTML = '';

  if (modLessons.length === 0) {
    lessonSelect.innerHTML = '<option value="">(Belum ada materi di modul ini)</option>';
    AppState.adminSelectedLessonId = null;
    clearEditorFields();
    showEditorEmptyState('Belum ada materi dalam modul ini', 'Klik tombol <strong>+ Materi Baru</strong> di atas untuk menambahkan video ke modul ini.');
    return;
  }

  modLessons.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)).forEach(les => {
    const opt = document.createElement('option');
    opt.value = les.id;
    const statusText = les.isDraft ? '[DRAFT] ' : '';
    opt.textContent = `${statusText}${les.title}`;
    lessonSelect.appendChild(opt);
  });

  // Pilih lesson aktif
  if (!AppState.adminSelectedLessonId || !modLessons.some(l => l.id === AppState.adminSelectedLessonId)) {
    AppState.adminSelectedLessonId = modLessons[0].id;
  }
  lessonSelect.value = AppState.adminSelectedLessonId;

  const targetLesson = modLessons.find(l => l.id === AppState.adminSelectedLessonId) || modLessons[0];
  if (targetLesson) {
    loadLessonToEditor(targetLesson);
  }
}

function handleAdminModuleChange(moduleId) {
  if (!moduleId) return;
  AppState.adminSelectedModuleId = moduleId;
  AppState.adminSelectedLessonId = null;

  // Sync Pin button state
  const pinBtn = document.getElementById('btn-admin-pin-module');
  if (pinBtn) {
    const curMod = AppState.modules.find(m => m.id === moduleId);
    if (curMod && curMod.isPinned) {
      pinBtn.innerHTML = '📌 Pinned';
      pinBtn.className = 'text-[11px] text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 font-bold px-1.5 py-0.5 rounded transition-colors flex items-center gap-0.5 border border-amber-500/40';
      pinBtn.title = 'Modul ini disematkan di Beranda. Klik untuk melepas sematan.';
    } else {
      pinBtn.innerHTML = '📌 Pin';
      pinBtn.className = 'text-[11px] text-amber-400 hover:text-amber-300 font-semibold px-1 py-0.5 rounded hover:bg-amber-950/60 transition-colors flex items-center gap-0.5';
      pinBtn.title = 'Sematkan modul ini di bagian atas Beranda';
    }
  }

  renderLessonsForSelectedModule();
}
window.handleAdminModuleChange = handleAdminModuleChange;

function handleAdminLessonChange(lessonId) {
  if (!lessonId) return;
  AppState.adminSelectedLessonId = lessonId;
  const lesson = AppState.lessons.find(l => l.id === lessonId);
  if (lesson) {
    loadLessonToEditor(lesson);
  }
}
window.handleAdminLessonChange = handleAdminLessonChange;

function clearEditorFields() {
  const titleInp = document.getElementById('admin-edit-title');
  const durInp = document.getElementById('admin-edit-duration');
  if (titleInp) titleInp.value = '';
  if (durInp) durInp.value = '15';
}

function showEditorEmptyState(title, subtitle) {
  const previewContainer = document.getElementById('editor-live-preview');
  if (previewContainer) {
    previewContainer.innerHTML = `
      <div class="py-12 text-center text-slate-400">
        <p class="text-sm font-semibold text-white mb-1">${title}</p>
        <p class="text-xs">${subtitle}</p>
      </div>
    `;
  }
  const editorRoot = document.getElementById('notion-editor-root');
  if (editorRoot) {
    editorRoot.innerHTML = `
      <div class="py-12 text-center text-slate-500 font-mono text-xs">
        [Pilih atau Tambahkan Materi Baru untuk Membuka Blok Editor Notion]
      </div>
    `;
  }
}

function loadLessonToEditor(lesson) {
  AppState.adminSelectedLessonId = lesson.id;
  const titleInp = document.getElementById('admin-edit-title');
  const durInp = document.getElementById('admin-edit-duration');
  const moduleSelect = document.getElementById('admin-edit-module');

  if (titleInp) titleInp.value = lesson.title || '';
  if (durInp) durInp.value = lesson.durationMinutes || 15;
  if (moduleSelect) moduleSelect.value = lesson.moduleId;

  // Update Status Badge Live vs Draft
  const statusBadge = document.getElementById('admin-lesson-status-badge');
  if (statusBadge) {
    if (lesson.isDraft) {
      statusBadge.className = 'text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/40';
      statusBadge.textContent = '🟡 DRAFT LOKAL';
      statusBadge.title = 'Materi ini baru disimpan di browser lokal Anda (belum masuk ke Supabase Cloud)';
    } else {
      statusBadge.className = 'text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/40';
      statusBadge.textContent = '🟢 LIVE SUPABASE';
      statusBadge.title = 'Materi ini tersinkron di Cloud Supabase dan live dapat diakses siswa';
    }
  }

  const editorContainer = document.getElementById('notion-editor-root');
  if (editorContainer) {
    AppState.editorInstance = new NotionBlockEditor('notion-editor-root', lesson.blocks || [], (updatedBlocks) => {
      updateEditorLivePreview(updatedBlocks);
    });
    updateEditorLivePreview(lesson.blocks || []);
  }
}

function updateEditorLivePreview(blocks) {
  const previewContainer = document.getElementById('editor-live-preview');
  if (previewContainer) {
    previewContainer.innerHTML = renderBlocksToHtml(blocks);
  }
}

async function saveLessonFromEditor(publishToCloud = true) {
  if (!AppState.editorInstance || !AppState.adminSelectedLessonId) {
    showToast('Pilih materi yang ingin disimpan terlebih dahulu', 'error');
    return;
  }

  const lesson = AppState.lessons.find(l => l.id === AppState.adminSelectedLessonId);
  if (!lesson) return;

  const titleVal = document.getElementById('admin-edit-title')?.value.trim();
  if (!titleVal) {
    showToast('Judul materi tidak boleh kosong!', 'error');
    return;
  }

  lesson.title = titleVal;
  lesson.youtubeUrl = lesson.youtubeUrl || '';
  lesson.durationMinutes = parseInt(document.getElementById('admin-edit-duration')?.value) || 15;
  
  const moduleMoveSelect = document.getElementById('admin-edit-module');
  if (moduleMoveSelect && moduleMoveSelect.value && moduleMoveSelect.value !== lesson.moduleId) {
    lesson.moduleId = moduleMoveSelect.value;
    AppState.adminSelectedModuleId = moduleMoveSelect.value;
  }

  lesson.blocks = AppState.editorInstance.getBlocks();
  lesson.isDraft = !publishToCloud;

  saveState();

  if (publishToCloud) {
    // Live Auto-Push ke Supabase Cloud
    if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
      try {
        const { error } = await ZettSupabase.client.from('curriculum_lessons').upsert({
          id: lesson.id,
          module_id: lesson.moduleId,
          title: lesson.title,
          youtube_url: lesson.youtubeUrl || '',
          duration_minutes: lesson.durationMinutes || 15,
          order_index: lesson.orderIndex || 1,
          blocks: lesson.blocks || []
        }, { onConflict: 'id' });

        if (error) throw error;
        showToast(`Materi '${lesson.title}' berhasil disimpan & LIVE di Supabase Cloud!`, 'success');
      } catch (err) {
        console.error('[Supabase Lesson Editor Save Error]', err);
        showToast(`Tersimpan lokal, tapi GAGAL dikirim ke Supabase: ${err.message || 'Izin ditolak (RLS)'}`, 'error');
      }
    } else {
      showToast(`Materi '${lesson.title}' tersimpan lokal (Supabase belum terhubung).`, 'warning');
    }
  } else {
    showToast(`Materi '${lesson.title}' disimpan sebagai DRAFT lokal (belum masuk ke Supabase).`, 'info');
  }

  renderAdminCurriculum();
  if (typeof renderLandingCurriculumBento === 'function') renderLandingCurriculumBento();
}
window.saveLessonFromEditor = saveLessonFromEditor;

// Helper Auto-Converter: Link Google Drive ke Direct Image CDN (lh3.googleusercontent.com)
function convertGoogleDriveToLh3(url) {
  if (!url || typeof url !== 'string') return url;
  const str = url.trim();
  // Format 1: drive.google.com/file/d/FILE_ID/view...
  const match1 = str.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match1 && match1[1]) {
    return `https://lh3.googleusercontent.com/d/${match1[1]}=w1000`;
  }
  // Format 2: drive.google.com/open?id=FILE_ID atau uc?id=FILE_ID
  const match2 = str.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match2 && match2[1]) {
    return `https://lh3.googleusercontent.com/d/${match2[1]}=w1000`;
  }
  return str;
}
window.convertGoogleDriveToLh3 = convertGoogleDriveToLh3;

// Modal Modul Management & Cover Presets
function updateModuleCoverPreview(url) {
  const input = document.getElementById('manage-module-cover');
  const preview = document.getElementById('manage-module-cover-preview');
  const empty = document.getElementById('manage-module-cover-empty');
  if (!preview || !empty) return;

  let cleanUrl = (url || '').trim();
  const convertedUrl = convertGoogleDriveToLh3(cleanUrl);
  if (convertedUrl !== cleanUrl) {
    cleanUrl = convertedUrl;
    if (input && input.value !== cleanUrl) {
      input.value = cleanUrl;
      if (typeof showToast === 'function') {
        showToast('Link Google Drive otomatis dikonversi ke format direct image CDN (lh3)!', 'success');
      }
    }
  }

  if (cleanUrl) {
    preview.src = cleanUrl;
    preview.classList.remove('hidden');
    empty.classList.add('hidden');
    preview.onerror = () => {
      preview.classList.add('hidden');
      empty.classList.remove('hidden');
    };
  } else {
    preview.src = '';
    preview.classList.add('hidden');
    empty.classList.remove('hidden');
  }
}
window.updateModuleCoverPreview = updateModuleCoverPreview;

function selectPresetModuleCover(url) {
  const input = document.getElementById('manage-module-cover');
  if (input) {
    input.value = url;
    updateModuleCoverPreview(url);
  }
}
window.selectPresetModuleCover = selectPresetModuleCover;

function openAddModuleModal() {
  document.getElementById('modal-module-title').innerHTML = `
    <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
    <span>Tambah Modul Kurikulum Baru</span>
  `;
  document.getElementById('manage-module-id').value = '';
  document.getElementById('manage-module-title').value = '';
  document.getElementById('manage-module-badge').value = `MODUL 0${AppState.modules.length + 1}`;
  document.getElementById('manage-module-desc').value = '';

  const defaultCategory = 'Fundamental & Workflow AI';
  const categoryInp = document.getElementById('manage-module-category');
  if (categoryInp) categoryInp.value = defaultCategory;

  const defaultCover = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
  const coverInp = document.getElementById('manage-module-cover');
  if (coverInp) coverInp.value = defaultCover;
  updateModuleCoverPreview(defaultCover);

  const pinnedInp = document.getElementById('manage-module-pinned');
  if (pinnedInp) pinnedInp.checked = false;

  document.getElementById('modal-manage-module').classList.remove('hidden');
}
window.openAddModuleModal = openAddModuleModal;

function openEditModuleModal() {
  if (!AppState.adminSelectedModuleId) {
    showToast('Pilih modul yang ingin diedit terlebih dahulu', 'error');
    return;
  }
  const mod = AppState.modules.find(m => m.id === AppState.adminSelectedModuleId);
  if (!mod) return;

  document.getElementById('modal-module-title').innerHTML = `
    <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
    <span>Edit Modul Kurikulum</span>
  `;
  document.getElementById('manage-module-id').value = mod.id;
  document.getElementById('manage-module-title').value = mod.title;
  document.getElementById('manage-module-badge').value = mod.badge || '';
  document.getElementById('manage-module-desc').value = mod.description || '';

  const categoryInp = document.getElementById('manage-module-category');
  if (categoryInp) categoryInp.value = mod.category || 'Fundamental & Workflow AI';

  const coverInp = document.getElementById('manage-module-cover');
  if (coverInp) coverInp.value = mod.coverImage || '';
  updateModuleCoverPreview(mod.coverImage || '');

  const pinnedInp = document.getElementById('manage-module-pinned');
  if (pinnedInp) pinnedInp.checked = !!mod.isPinned;

  document.getElementById('modal-manage-module').classList.remove('hidden');
}
window.openEditModuleModal = openEditModuleModal;

async function togglePinCurrentModule() {
  if (!AppState.adminSelectedModuleId) return;
  const mod = AppState.modules.find(m => m.id === AppState.adminSelectedModuleId);
  if (!mod) return;

  mod.isPinned = !mod.isPinned;
  saveState();

  if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
    try {
      const { error } = await ZettSupabase.client.from('curriculum_modules')
        .update({ is_pinned: !!mod.isPinned })
        .eq('id', mod.id);
      if (error) throw error;
      showToast(mod.isPinned ? `Modul "${mod.title}" berhasil disematkan di Beranda & LIVE ke Database!` : `Sematkan modul "${mod.title}" dilepas.`, 'success');
    } catch (err) {
      console.warn('[Supabase Module Pin Update Warning]', err);
      showToast(`Status pin berubah di lokal, tapi gagal ke cloud: ${err.message || 'RLS'}`, 'warning');
    }
  } else {
    showToast(mod.isPinned ? `Modul "${mod.title}" disematkan di Beranda.` : `Sematkan modul "${mod.title}" dilepas.`, 'info');
  }

  renderAdminCurriculum();
  if (typeof renderPinnedModuleHero === 'function') renderPinnedModuleHero();
}
window.togglePinCurrentModule = togglePinCurrentModule;

function closeManageModuleModal() {
  document.getElementById('modal-manage-module')?.classList.add('hidden');
}
window.closeManageModuleModal = closeManageModuleModal;

async function handleSaveModuleSubmit(e, publishToCloud = true) {
  if (e) e.preventDefault();
  const id = document.getElementById('manage-module-id').value;
  const title = document.getElementById('manage-module-title').value.trim();
  const badge = document.getElementById('manage-module-badge').value.trim() || `MODUL 0${AppState.modules.length + 1}`;
  const desc = document.getElementById('manage-module-desc').value.trim();
  const category = (document.getElementById('manage-module-category')?.value.trim()) || 'Fundamental & Workflow AI';
  const cover = (document.getElementById('manage-module-cover')?.value.trim()) || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
  const isPinned = !!document.getElementById('manage-module-pinned')?.checked;

  if (!title) {
    showToast('Judul modul wajib diisi', 'error');
    return;
  }

  let targetMod = null;
  if (id) {
    // Edit existing module
    targetMod = AppState.modules.find(m => m.id === id);
    if (targetMod) {
      targetMod.title = title;
      targetMod.badge = badge;
      targetMod.description = desc;
      targetMod.category = category;
      targetMod.coverImage = cover;
      targetMod.isPinned = isPinned;
      targetMod.isDraft = !publishToCloud;
    }
  } else {
    // Add new module
    const newModId = generateFormattedId('MOD', AppState.modules, 2);
    targetMod = {
      id: newModId,
      title: title,
      badge: badge,
      description: desc,
      category: category,
      coverImage: cover,
      orderIndex: AppState.modules.length + 1,
      isLocked: false,
      isPinned: isPinned,
      isDraft: !publishToCloud
    };
    AppState.modules.push(targetMod);
    AppState.adminSelectedModuleId = newModId;
  }

  saveState();

  if (publishToCloud) {
    // Live Auto-Push ke Supabase Cloud
    if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected() && targetMod) {
      const payload = {
        id: targetMod.id,
        title: targetMod.title,
        description: targetMod.description || '',
        category: targetMod.category || 'ai',
        badge: targetMod.badge || 'MODUL',
        cover_image: targetMod.coverImage,
        order_index: targetMod.orderIndex || 1,
        is_locked: !!targetMod.isLocked,
        lock_reason: targetMod.lockReason || null,
        is_pinned: !!targetMod.isPinned
      };

      try {
        let { error } = await ZettSupabase.client.from('curriculum_modules').upsert(payload, { onConflict: 'id' });
        if (error) {
          // If column is_pinned does not exist in remote DB, fallback safely
          delete payload.is_pinned;
          const retry = await ZettSupabase.client.from('curriculum_modules').upsert(payload, { onConflict: 'id' });
          if (retry.error) throw retry.error;
        }
        showToast(`Modul '${title}' berhasil disimpan & LIVE di Supabase Cloud!`, 'success');
      } catch (err) {
        console.error('[Supabase Module Save Error]', err);
        showToast(`Tersimpan di lokal, tapi GAGAL dikirim ke Supabase Cloud: ${err.message || 'Izin ditolak (RLS)'}`, 'error');
      }
    } else {
      showToast(`Modul '${title}' tersimpan lokal (Supabase belum terhubung).`, 'warning');
    }
  } else {
    showToast(`Modul '${title}' disimpan sebagai DRAFT lokal (belum masuk ke Supabase).`, 'info');
  }

  closeManageModuleModal();
  renderAdminCurriculum();
  if (typeof renderPinnedModuleHero === 'function') renderPinnedModuleHero();
  if (typeof renderLandingCurriculumBento === 'function') renderLandingCurriculumBento();
}
window.handleSaveModuleSubmit = handleSaveModuleSubmit;

function deleteCurrentModule() {
  if (!AppState.adminSelectedModuleId) return;
  const mod = AppState.modules.find(m => m.id === AppState.adminSelectedModuleId);
  if (!mod) return;

  showCustomConfirm({
    title: 'Hapus Modul Kurikulum?',
    message: `Hapus modul "${mod.title}" beserta seluruh materi di dalamnya secara permanen?`,
    confirmText: 'Ya, Hapus Modul',
    cancelText: 'Batal',
    isDanger: true,
    onConfirm: async () => {
      const delModId = mod.id;
      AppState.modules = AppState.modules.filter(m => m.id !== delModId);
      AppState.lessons = AppState.lessons.filter(l => l.moduleId !== delModId);
      AppState.adminSelectedModuleId = AppState.modules[0]?.id || null;
      AppState.adminSelectedLessonId = null;

      saveState();

      if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
        try {
          // Hapus materi di dalam modul terlebih dahulu untuk menjamin cascade bersih
          await ZettSupabase.client.from('curriculum_lessons').delete().eq('module_id', delModId);
          const { error } = await ZettSupabase.client.from('curriculum_modules').delete().eq('id', delModId);
          if (error) throw error;
          showToast(`Modul "${mod.title}" telah dihapus dari cloud & lokal.`, 'info');
        } catch (err) {
          console.error('[Supabase Module Delete Error]', err);
          showToast(`Modul dihapus di lokal, tapi gagal di Cloud: ${err.message || 'RLS'}`, 'warning');
        }
      } else {
        showToast(`Modul "${mod.title}" telah dihapus.`, 'info');
      }

      renderAdminCurriculum();
      if (typeof renderLandingCurriculumBento === 'function') renderLandingCurriculumBento();
    }
  });
}
window.deleteCurrentModule = deleteCurrentModule;

function openAddLessonModal() {
  if (AppState.modules.length === 0) {
    showToast('Buat modul kurikulum terlebih dahulu dengan tombol [+ Modul Baru]', 'warning');
    openAddModuleModal();
    return;
  }

  const moduleSelect = document.getElementById('add-lesson-module-select');
  if (moduleSelect) {
    moduleSelect.innerHTML = '';
    AppState.modules.sort((a, b) => a.orderIndex - b.orderIndex).forEach(mod => {
      const opt = document.createElement('option');
      opt.value = mod.id;
      opt.textContent = `${mod.badge || 'MODUL'}: ${mod.title}`;
      moduleSelect.appendChild(opt);
    });
    const selectedModId = AppState.adminSelectedModuleId || AppState.modules[0].id;
    moduleSelect.value = selectedModId;
  }

  const titleInp = document.getElementById('add-lesson-title');
  const durInp = document.getElementById('add-lesson-duration');
  const ytInp = document.getElementById('add-lesson-youtube');
  const notesInp = document.getElementById('add-lesson-notes');

  if (titleInp) titleInp.value = '';
  if (durInp) durInp.value = '15';
  if (ytInp) ytInp.value = '';
  if (notesInp) notesInp.value = '';

  const modal = document.getElementById('modal-add-lesson');
  if (modal) {
    modal.classList.remove('hidden');
    setTimeout(() => {
      if (titleInp) titleInp.focus();
    }, 50);
  }
}
window.openAddLessonModal = openAddLessonModal;
window.addNewLessonPrompt = openAddLessonModal;

function closeAddLessonModal() {
  const modal = document.getElementById('modal-add-lesson');
  if (modal) modal.classList.add('hidden');
}
window.closeAddLessonModal = closeAddLessonModal;

async function handleSaveAddLessonSubmit(e, publishToCloud = true) {
  if (e) e.preventDefault();

  const targetModuleId = document.getElementById('add-lesson-module-select')?.value || AppState.adminSelectedModuleId || AppState.modules[0]?.id;
  const title = (document.getElementById('add-lesson-title')?.value || '').trim();
  const duration = parseInt(document.getElementById('add-lesson-duration')?.value, 10) || 15;
  const youtubeUrl = (document.getElementById('add-lesson-youtube')?.value || '').trim();
  const notes = (document.getElementById('add-lesson-notes')?.value || '').trim();

  if (!title) {
    showToast('Judul materi pembelajaran tidak boleh kosong', 'error');
    return;
  }

  const newId = generateFormattedId('LES', AppState.lessons, 2);
  const initialBlocks = [
    { type: 'h1', content: title },
    { type: 'callout', content: notes || 'Catatan penting untuk materi pembelajaran ini.' },
    { type: 'text', content: 'Tuliskan penjelasan detail materi atau petunjuk langkah di sini...' }
  ];

  const newLesson = {
    id: newId,
    moduleId: targetModuleId,
    title: title,
    durationMinutes: duration,
    orderIndex: AppState.lessons.filter(l => l.moduleId === targetModuleId).length + 1,
    youtubeUrl: youtubeUrl,
    blocks: initialBlocks,
    isDraft: !publishToCloud
  };

  AppState.lessons.push(newLesson);
  AppState.adminSelectedModuleId = targetModuleId;
  AppState.adminSelectedLessonId = newId;

  saveState();

  if (publishToCloud) {
    if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
      try {
        const { error } = await ZettSupabase.client.from('curriculum_lessons').upsert({
          id: newLesson.id,
          module_id: newLesson.moduleId,
          title: newLesson.title,
          youtube_url: newLesson.youtubeUrl || '',
          duration_minutes: newLesson.durationMinutes || 15,
          order_index: newLesson.orderIndex || 1,
          blocks: newLesson.blocks || []
        }, { onConflict: 'id' });

        if (error) throw error;
        showToast(`Materi "${title}" berhasil ditambahkan & LIVE di Supabase Cloud!`, 'success');
      } catch (err) {
        console.error('[Supabase Lesson Save Error]', err);
        showToast(`Tersimpan lokal, tapi GAGAL dikirim ke Supabase: ${err.message || 'RLS'}`, 'error');
      }
    } else {
      showToast(`Materi "${title}" tersimpan lokal (Supabase belum terhubung).`, 'warning');
    }
  } else {
    showToast(`Materi "${title}" ditambahkan sebagai DRAFT lokal (belum masuk ke Supabase).`, 'info');
  }

  closeAddLessonModal();
  renderAdminCurriculum();
  if (typeof renderLandingCurriculumBento === 'function') renderLandingCurriculumBento();
}
window.handleSaveAddLessonSubmit = handleSaveAddLessonSubmit;

function deleteCurrentLesson() {
  if (!AppState.adminSelectedLessonId) {
    showToast('Pilih materi yang ingin dihapus terlebih dahulu', 'error');
    return;
  }

  const lesson = AppState.lessons.find(l => l.id === AppState.adminSelectedLessonId);
  if (!lesson) return;

  showCustomConfirm({
    title: 'Hapus Materi Pembelajaran?',
    message: `Hapus materi "${lesson.title}" dari kurikulum secara permanen?`,
    confirmText: 'Ya, Hapus Materi',
    cancelText: 'Batal',
    isDanger: true,
    onConfirm: async () => {
      const delLesId = lesson.id;
      AppState.lessons = AppState.lessons.filter(l => l.id !== delLesId);
      AppState.adminSelectedLessonId = null;
      saveState();

      if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
        try {
          const { error } = await ZettSupabase.client.from('curriculum_lessons').delete().eq('id', delLesId);
          if (error) throw error;
          showToast('Materi telah dihapus dari cloud & lokal', 'info');
        } catch (err) {
          console.error('[Supabase Lesson Delete Error]', err);
          showToast(`Materi dihapus lokal, tapi gagal di Cloud: ${err.message || 'RLS'}`, 'warning');
        }
      } else {
        showToast('Materi telah dihapus', 'info');
      }

      renderAdminCurriculum();
      if (typeof renderLandingCurriculumBento === 'function') renderLandingCurriculumBento();
    }
  });
}
window.deleteCurrentLesson = deleteCurrentLesson;

// ==========================================
// 6. WHITELIST MEMBER FULL CRUD & ULTRA-FAST PAGINATION
// ==========================================

let whitelistState = {
  currentPage: 1,
  perPage: 25,
  search: '',
  filter: 'all'
};

function renderAdminWhitelist() {
  const tableBody = document.getElementById('whitelist-table-body');
  if (!tableBody) return;

  // Live Background Sync from Supabase Cloud (jika terhubung & belum sedang fetch)
  if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected() && !window._isSyncingWhitelistBackground) {
    window._isSyncingWhitelistBackground = true;
    Promise.all([
      ZettSupabase.client.from('whitelist_members').select('id, email, full_name, role, is_active, password_hash').not('password_hash', 'is', null),
      ZettSupabase.client.from('whitelist_members').select('id, email, full_name, role, is_active, password_hash').eq('role', 'admin')
    ]).then(([resPass, resAdmin]) => {
      window._isSyncingWhitelistBackground = false;
      const combined = [];
      const seenEmails = new Set();
      const addCloudRow = (cloudM) => {
        if (!cloudM || !cloudM.email) return;
        const cleanE = cloudM.email.toLowerCase().trim();
        if (!seenEmails.has(cleanE)) {
          seenEmails.add(cleanE);
          combined.push(cloudM);
        }
      };
      (resPass.data || []).forEach(addCloudRow);
      (resAdmin.data || []).forEach(addCloudRow);

      let hasChanges = false;

      // Resync status sandi: Supabase Cloud adalah Single Source of Truth
      // Jika di Supabase akun tidak terdaftar memiliki password_hash, reset passwordHash lokal menjadi null
      if (resPass && !resPass.error && Array.isArray(resPass.data)) {
        const cloudPassEmails = new Set(resPass.data.map(r => (r.email || '').toLowerCase().trim()));
        AppState.whitelist.forEach(localM => {
          const cleanE = (localM.email || '').toLowerCase().trim();
          if (localM.passwordHash && !cloudPassEmails.has(cleanE) && cleanE !== 'zettbos2025@gmail.com') {
            localM.passwordHash = null;
            hasChanges = true;
          }
        });
      }

      if (combined.length > 0) {
        combined.forEach(cloudM => {
          const cleanE = (cloudM.email || '').toLowerCase().trim();
          if (!cleanE) return;
          const localM = AppState.whitelist.find(m => (m.email || '').toLowerCase().trim() === cleanE);
          if (localM) {
            const cloudPass = cloudM.password_hash || null;
            if (localM.passwordHash !== cloudPass) {
              localM.passwordHash = cloudPass;
              hasChanges = true;
            }
            if (cloudM.full_name && localM.fullName !== cloudM.full_name) {
              localM.fullName = cloudM.full_name;
              hasChanges = true;
            }
            if (cloudM.role && localM.role !== cloudM.role) {
              localM.role = cloudM.role;
              hasChanges = true;
            }
            if (typeof cloudM.is_active === 'boolean' && localM.isActive !== cloudM.is_active) {
              localM.isActive = cloudM.is_active;
              hasChanges = true;
            }
          } else {
            AppState.whitelist.push({
              id: cloudM.id,
              email: cleanE,
              fullName: cloudM.full_name || cleanE.split('@')[0],
              role: cloudM.role || 'member',
              isActive: cloudM.is_active !== false,
              passwordHash: cloudM.password_hash || null,
              registeredAt: new Date().toISOString()
            });
            hasChanges = true;
          }
        });
      }

      if (hasChanges) {
        saveState();
        renderAdminWhitelist();
        if (AppState.activeAdminTab === 'analytics') renderAdminAnalytics();
      }
    }).catch(() => {
      window._isSyncingWhitelistBackground = false;
    });
  }

  // 1. Hitung statistik filter
  const total = AppState.whitelist.length;
  const activeCount = AppState.whitelist.filter(m => m.isActive).length;
  const hasPassCount = AppState.whitelist.filter(m => !!m.passwordHash).length;
  const noPassCount = AppState.whitelist.filter(m => !m.passwordHash).length;
  const adminCount = AppState.whitelist.filter(m => m.role === 'admin').length;

  const countBadge = document.getElementById('whitelist-total-badge');
  if (countBadge) countBadge.textContent = `${total} Member`;

  const elAll = document.getElementById('wl-count-all');
  const elAct = document.getElementById('wl-count-active');
  const elHasPass = document.getElementById('wl-count-haspass');
  const elNoPass = document.getElementById('wl-count-nopass');
  const elAdm = document.getElementById('wl-count-admin');
  if (elAll) elAll.textContent = total;
  if (elAct) elAct.textContent = activeCount;
  if (elHasPass) elHasPass.textContent = hasPassCount;
  if (elNoPass) elNoPass.textContent = noPassCount;
  if (elAdm) elAdm.textContent = adminCount;

  // 2. Filter data
  const searchLower = whitelistState.search.toLowerCase().trim();
  let filtered = AppState.whitelist.filter(m => {
    // Search
    const matchSearch = !searchLower ||
      (m.email && m.email.toLowerCase().includes(searchLower)) ||
      (m.fullName && m.fullName.toLowerCase().includes(searchLower));

    if (!matchSearch) return false;

    // Filter tab
    if (whitelistState.filter === 'active') return m.isActive;
    if (whitelistState.filter === 'haspass') return !!m.passwordHash;
    if (whitelistState.filter === 'nopass') return !m.passwordHash;
    if (whitelistState.filter === 'admin') return m.role === 'admin';
    return true;
  });

  // 3. Hitung pagination
  const totalPages = Math.ceil(filtered.length / whitelistState.perPage) || 1;
  if (whitelistState.currentPage > totalPages) whitelistState.currentPage = totalPages;
  if (whitelistState.currentPage < 1) whitelistState.currentPage = 1;

  const startIndex = (whitelistState.currentPage - 1) * whitelistState.perPage;
  const endIndex = Math.min(startIndex + whitelistState.perPage, filtered.length);
  const pageItems = filtered.slice(startIndex, endIndex);

  // 4. Update Pagination Controls
  const pageInfo = document.getElementById('whitelist-page-info');
  if (pageInfo) {
    pageInfo.textContent = filtered.length > 0 
      ? `Menampilkan ${startIndex + 1} - ${endIndex} dari ${filtered.length} member (Total: ${total})`
      : 'Tidak ada member yang cocok dengan filter';
  }

  const pageIndicator = document.getElementById('whitelist-page-indicator');
  if (pageIndicator) {
    pageIndicator.textContent = `Hal ${whitelistState.currentPage} / ${totalPages}`;
  }

  // 5. Render Baris Tabel (Hanya 25 item, super cepat < 1ms)
  tableBody.innerHTML = '';

  if (pageItems.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="py-12 text-center text-slate-500 font-mono text-xs">
          Tidak ada data member yang sesuai dengan pencarian atau filter.
        </td>
      </tr>
    `;
    return;
  }

  pageItems.forEach((m, idx) => {
    const row = document.createElement('tr');
    row.className = 'border-b border-slate-800/80 hover:bg-slate-900/50 text-xs transition-colors';

    const rowNum = startIndex + idx + 1;
    const hasPassword = !!m.passwordHash;
    const isSuperAdmin = m.email.toLowerCase() === 'zettbos2025@gmail.com';

    row.innerHTML = `
      <td class="py-3 px-4 text-center font-mono text-slate-500">${rowNum}</td>
      <td class="py-3 px-4">
        <div class="font-bold text-white flex items-center gap-1.5">
          <span>${escapeHtml(m.fullName || '-')}</span>
          ${isSuperAdmin ? '<span class="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono font-bold">OWNER</span>' : ''}
        </div>
        <div class="text-[10px] mt-0.5 flex items-center gap-1 font-mono">
          ${hasPassword 
            ? '<span class="text-emerald-400 flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Password Aktif</span>' 
            : '<span class="text-slate-500 flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg> Belum Buat Sandi</span>'}
        </div>
      </td>
      <td class="py-3 px-4 text-emerald-400 font-mono text-xs font-medium">${escapeHtml(m.email)}</td>
      <td class="py-3 px-4">
        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${m.role === 'admin' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-800 text-slate-300'}">
          ${(m.role || 'member').toUpperCase()}
        </span>
      </td>
      <td class="py-3 px-4 text-center">
        <button onclick="toggleMemberActive('${m.id}')" ${isSuperAdmin ? 'disabled' : ''} class="px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${m.isActive ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60 hover:bg-emerald-900/60' : 'bg-rose-950 text-rose-400 border border-rose-800/60 hover:bg-rose-900/60'}">
          ${m.isActive ? 'Aktif' : 'Diblokir'}
        </button>
      </td>
      <td class="py-3 px-4 text-right">
        <div class="inline-flex items-center gap-1.5 justify-end">
          <button onclick="openEditMemberModal('${m.id}')" class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 transition-colors inline-flex items-center gap-1" title="Edit Data Member">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            <span>Edit</span>
          </button>
          ${!isSuperAdmin ? `
          <button onclick="deleteMember('${m.id}')" class="p-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/60 border border-transparent hover:border-rose-900 transition-colors" title="Hapus Member">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
          ` : ''}
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function handleWhitelistSearch(val) {
  whitelistState.search = val || '';
  whitelistState.currentPage = 1;
  renderAdminWhitelist();
}
window.handleWhitelistSearch = handleWhitelistSearch;

function setWhitelistFilter(filterName) {
  whitelistState.filter = filterName;
  whitelistState.currentPage = 1;

  ['all', 'active', 'haspass', 'nopass', 'admin'].forEach(f => {
    const btn = document.getElementById(`wl-filter-${f}`);
    if (btn) {
      if (f === filterName) {
        btn.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/40 whitespace-nowrap';
      } else {
        btn.className = 'px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 whitespace-nowrap';
      }
    }
  });

  renderAdminWhitelist();
}
window.setWhitelistFilter = setWhitelistFilter;

function changeWhitelistPerPage(val) {
  whitelistState.perPage = parseInt(val, 10) || 25;
  whitelistState.currentPage = 1;
  renderAdminWhitelist();
}
window.changeWhitelistPerPage = changeWhitelistPerPage;

function gotoWhitelistPage(action) {
  const searchLower = whitelistState.search.toLowerCase().trim();
  let filtered = AppState.whitelist.filter(m => {
    const matchSearch = !searchLower ||
      (m.email && m.email.toLowerCase().includes(searchLower)) ||
      (m.fullName && m.fullName.toLowerCase().includes(searchLower));
    if (!matchSearch) return false;
    if (whitelistState.filter === 'active') return m.isActive;
    if (whitelistState.filter === 'haspass') return !!m.passwordHash;
    if (whitelistState.filter === 'nopass') return !m.passwordHash;
    if (whitelistState.filter === 'admin') return m.role === 'admin';
    return true;
  });

  const totalPages = Math.ceil(filtered.length / whitelistState.perPage) || 1;

  if (action === 'first') whitelistState.currentPage = 1;
  else if (action === 'prev') whitelistState.currentPage = Math.max(1, whitelistState.currentPage - 1);
  else if (action === 'next') whitelistState.currentPage = Math.min(totalPages, whitelistState.currentPage + 1);
  else if (action === 'last') whitelistState.currentPage = totalPages;

  renderAdminWhitelist();
}
window.gotoWhitelistPage = gotoWhitelistPage;

// Whitelist CRUD Modals
function openAddMemberModal() {
  document.getElementById('add-member-fullname').value = '';
  document.getElementById('add-member-email').value = '';
  document.getElementById('add-member-role').value = 'member';
  const passInp = document.getElementById('add-member-password');
  if (passInp) passInp.value = '';
  document.getElementById('modal-add-member').classList.remove('hidden');
}
window.openAddMemberModal = openAddMemberModal;

function closeAddMemberModal() {
  document.getElementById('modal-add-member')?.classList.add('hidden');
}
window.closeAddMemberModal = closeAddMemberModal;

async function handleSaveAddMemberSubmit(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('add-member-fullname').value.trim();
  const email = document.getElementById('add-member-email').value.trim().toLowerCase();
  const role = document.getElementById('add-member-role').value;
  const rawPass = (document.getElementById('add-member-password')?.value || '').trim();

  if (!email || !email.includes('@')) {
    showToast('Masukkan alamat email yang valid', 'error');
    return;
  }

  if (AppState.whitelist.some(m => m.email.toLowerCase() === email)) {
    showToast('Email ini sudah terdaftar di whitelist!', 'error');
    return;
  }

  let passHash = null;
  if (rawPass) {
    if (rawPass.length < 6) {
      showToast('Kata sandi minimal 6 karakter', 'error');
      return;
    }
    passHash = await hashPassword(rawPass);
  }

/**
 * Universal Sequential Whitelist ID Generator: "Baris Terakhir + 1" (WL-XXXX)
 * Scans both Supabase Cloud and local state to find the maximum existing sequence number,
 * ensuring no duplicate keys, no null values, and clean 4-digit formatting.
 */
async function getNextWhitelistIdFromCloudOrLocal() {
  let maxNum = 0;

  // 1. Cross-check langsung dari Supabase Cloud jika terhubung
  if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
    try {
      const { data } = await ZettSupabase.client
        .from('whitelist_members')
        .select('id')
        .like('id', 'WL-%')
        .order('id', { ascending: false })
        .limit(100);

      if (Array.isArray(data)) {
        data.forEach(r => {
          const match = String(r.id || '').toUpperCase().match(/^WL-(\d+)$/);
          if (match && match[1]) {
            const n = parseInt(match[1], 10);
            if (!isNaN(n) && n > maxNum && n < 1000000) maxNum = n;
          }
        });
      }
    } catch (e) {
      console.warn('[getNextWhitelistIdFromCloud Warning]', e);
    }
  }

  // 2. Cross-check dengan local AppState.whitelist
  (AppState.whitelist || []).forEach(m => {
    const match = String(m.id || '').toUpperCase().match(/^WL-(\d+)$/);
    if (match && match[1]) {
      const n = parseInt(match[1], 10);
      if (!isNaN(n) && n > maxNum && n < 1000000) maxNum = n;
    }
  });

  const nextNum = maxNum + 1;
  return `WL-${String(nextNum).padStart(4, '0')}`;
}
window.getNextWhitelistIdFromCloudOrLocal = getNextWhitelistIdFromCloudOrLocal;

async function handleSaveAddMemberSubmit(event) {
  if (event) event.preventDefault();
  const emailInput = document.getElementById('add-member-email');
  const nameInput = document.getElementById('add-member-name');
  const roleInput = document.getElementById('add-member-role');
  const passInput = document.getElementById('add-member-password');

  const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
  const name = nameInput ? nameInput.value.trim() : '';
  const role = roleInput ? roleInput.value : 'member';
  const rawPass = passInput ? passInput.value.trim() : '';

  if (!email || !email.includes('@')) {
    showToast('Masukkan alamat email yang valid', 'error');
    return;
  }

  if (AppState.whitelist.some(m => m.email.toLowerCase() === email)) {
    showToast('Email ini sudah terdaftar di whitelist!', 'error');
    return;
  }

  let passHash = null;
  if (rawPass) {
    if (rawPass.length < 6) {
      showToast('Kata sandi minimal 6 karakter', 'error');
      return;
    }
    passHash = await hashPassword(rawPass);
  }

  // Ambil ID urut berikutnya: Baris Terakhir + 1
  const nextId = await getNextWhitelistIdFromCloudOrLocal();

  const newMember = {
    id: nextId,
    email: email,
    fullName: name || email.split('@')[0],
    role: role || 'member',
    isActive: true,
    passwordHash: passHash,
    registeredAt: new Date().toISOString()
  };

  AppState.whitelist.unshift(newMember);
  saveState();

  // Simpan ke Supabase jika terhubung (Kirim ID yang pasti unik & urut!)
  if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
    try {
      const { error: insertErr } = await ZettSupabase.client.from('whitelist_members').upsert([{
        id: nextId,
        email: newMember.email,
        full_name: newMember.fullName,
        role: newMember.role,
        is_active: true,
        password_hash: passHash
      }], { onConflict: 'email' });
      if (insertErr) throw insertErr;
    } catch (err) {
      console.warn('[Supabase Insert Member Error]', err);
    }
  }

  closeAddMemberModal();
  showToast(`Siswa ${newMember.fullName} (${email}) berhasil ditambahkan sebagai ${nextId}!`, 'success');
  renderAdminWhitelist();
}
window.handleSaveAddMemberSubmit = handleSaveAddMemberSubmit;

async function handleBatchAddMembers() {
  const textarea = document.getElementById('batch-emails-textarea');
  if (!textarea) return;

  const rawText = textarea.value.trim();
  if (!rawText) {
    showToast('Silakan tempel daftar email terlebih dahulu', 'error');
    return;
  }

  // Pisahkan berdasarkan Enter, koma, titik koma, tab, atau spasi
  const rawList = rawText.split(/[\r\n,;\t]+/).map(e => e.trim().toLowerCase()).filter(Boolean);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validEmails = [];
  const seenInBatch = new Set();

  rawList.forEach(email => {
    if (emailRegex.test(email) && !seenInBatch.has(email)) {
      seenInBatch.add(email);
      validEmails.push(email);
    }
  });

  if (validEmails.length === 0) {
    showToast('Tidak ada alamat email valid yang ditemukan. Periksa format email.', 'error');
    return;
  }

  // Ambil email eksisting dari local AppState secara case-insensitive
  const existingEmailSet = new Set((AppState.whitelist || []).map(m => (m.email || '').trim().toLowerCase()));

  // Cek juga ke Supabase jika sedang terhubung untuk cross-check ganda
  if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
    try {
      const { data: dbRows } = await ZettSupabase.client.from('whitelist_members').select('email');
      if (Array.isArray(dbRows)) {
        dbRows.forEach(row => {
          if (row.email) existingEmailSet.add(row.email.trim().toLowerCase());
        });
      }
    } catch (dbErr) {
      console.warn('[Batch Whitelist] DB cross-check skipped, using local state:', dbErr);
    }
  }

  // Filter hanya email yang benar-benar baru (belum pernah ada)
  const newEmails = validEmails.filter(e => !existingEmailSet.has(e));
  const duplicateCount = validEmails.length - newEmails.length;

  if (newEmails.length === 0) {
    showToast(`Semua ${validEmails.length} email yang Anda masukkan sudah terdaftar di whitelist (tidak ada data baru).`, 'info');
    const modal = document.getElementById('modal-batch-whitelist');
    if (modal) modal.classList.add('hidden');
    return;
  }

  showToast(`Mendaftarkan ${newEmails.length} member baru ke whitelist...`, 'info');

  const nowIso = new Date().toISOString();
  const startingIdStr = await getNextWhitelistIdFromCloudOrLocal();
  let currentCounter = parseInt(startingIdStr.replace(/[^0-9]/g, ''), 10) || ((AppState.whitelist || []).length + 1);

  const newMembers = newEmails.map(email => {
    const id = 'WL-' + String(currentCounter++).padStart(4, '0');
    return {
      id: id,
      email: email,
      fullName: email.split('@')[0],
      role: 'member',
      isActive: true,
      passwordHash: null,
      registeredAt: nowIso
    };
  });

  // Tambahkan ke AppState.whitelist lokal
  AppState.whitelist.unshift(...newMembers);
  saveState();

  // Sinkronkan ke Supabase jika terhubung (Kirim ID urut non-null)
  if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
    try {
      const payload = newMembers.map(m => ({
        id: m.id,
        email: m.email,
        full_name: m.fullName,
        role: m.role,
        is_active: true,
        password_hash: null
      }));

      const batchSize = 100;
      for (let i = 0; i < payload.length; i += batchSize) {
        const chunk = payload.slice(i, i + batchSize);
        const { data: dbRows, error: batchErr } = await ZettSupabase.client
          .from('whitelist_members')
          .upsert(chunk, { onConflict: 'email' })
          .select('id, email');
        if (batchErr) throw batchErr;
        if (Array.isArray(dbRows)) {
          dbRows.forEach(row => {
            const match = newMembers.find(nm => nm.email === row.email);
            if (match && row.id) match.id = row.id;
          });
        }
      }
      saveState();
    } catch (err) {
      console.warn('[Supabase Batch Insert Error]', err);
    }
  }

  textarea.value = '';
  const modal = document.getElementById('modal-batch-whitelist');
  if (modal) modal.classList.add('hidden');

  if (duplicateCount > 0) {
    showToast(`Berhasil mendaftarkan ${newMembers.length} member baru! (${duplicateCount} email duplikat otomatis dilewati)`, 'success');
  } else {
    showToast(`Berhasil mendaftarkan seluruh ${newMembers.length} member baru ke whitelist!`, 'success');
  }
  renderAdminWhitelist();
}
window.handleBatchAddMembers = handleBatchAddMembers;

function openEditMemberModal(id) {
  const member = AppState.whitelist.find(m => m.id === id);
  if (!member) return;

  document.getElementById('edit-member-id').value = member.id;
  document.getElementById('edit-member-name').value = member.fullName || '';
  document.getElementById('edit-member-email').value = member.email || '';
  document.getElementById('edit-member-role').value = member.role || 'member';
  document.getElementById('edit-member-active').value = member.isActive ? 'true' : 'false';

  const newPassInp = document.getElementById('edit-member-newpass');
  if (newPassInp) newPassInp.value = '';

  const passStatusEl = document.getElementById('edit-member-pass-status');
  const resetPassBtn = document.getElementById('btn-reset-member-pass');

  if (member.passwordHash) {
    if (passStatusEl) {
      passStatusEl.textContent = 'Sudah Disetel';
      passStatusEl.className = 'font-mono text-[11px] text-emerald-400 font-bold';
    }
    if (resetPassBtn) resetPassBtn.classList.remove('hidden');
  } else {
    if (passStatusEl) {
      passStatusEl.textContent = 'Belum Dibuat (Wajib OTP saat login)';
      passStatusEl.className = 'font-mono text-[11px] text-amber-400 font-bold';
    }
    if (resetPassBtn) resetPassBtn.classList.add('hidden');
  }

  document.getElementById('modal-edit-member').classList.remove('hidden');
}
window.openEditMemberModal = openEditMemberModal;

function closeEditMemberModal() {
  document.getElementById('modal-edit-member')?.classList.add('hidden');
}
window.closeEditMemberModal = closeEditMemberModal;

async function handleSaveEditMemberSubmit(e) {
  if (e) e.preventDefault();
  const id = document.getElementById('edit-member-id').value;
  const member = AppState.whitelist.find(m => m.id === id);
  if (!member) return;

  const newName = document.getElementById('edit-member-name').value.trim();
  const newEmail = document.getElementById('edit-member-email').value.trim().toLowerCase();
  const newRole = document.getElementById('edit-member-role').value;
  const newActive = document.getElementById('edit-member-active').value === 'true';
  const rawNewPass = (document.getElementById('edit-member-newpass')?.value || '').trim();

  if (!newEmail) {
    showToast('Email tidak boleh kosong', 'error');
    return;
  }

  // Cek duplikasi jika ganti email
  if (newEmail !== member.email.toLowerCase() && AppState.whitelist.some(m => m.id !== id && m.email.toLowerCase() === newEmail)) {
    showToast('Alamat email tersebut sudah dipakai oleh member lain!', 'error');
    return;
  }

  let updatedPassHash = member.passwordHash;
  if (rawNewPass) {
    if (rawNewPass.length < 6) {
      showToast('Kata sandi baru minimal 6 karakter', 'error');
      return;
    }
    updatedPassHash = await hashPassword(rawNewPass);
    member.passwordHash = updatedPassHash;
  }

  member.fullName = newName;
  member.email = newEmail;
  member.role = newRole;
  member.isActive = newActive;

  saveState();

  // Sinkronkan ke Supabase jika terhubung
  if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
    try {
      const updatePayload = {
        full_name: newName,
        email: newEmail,
        role: newRole,
        is_active: newActive
      };
      if (rawNewPass) {
        updatePayload.password_hash = updatedPassHash;
      }
      await ZettSupabase.client.from('whitelist_members').update(updatePayload).eq('id', member.id);
    } catch (err) {
      console.warn('[Supabase Update Member Error]', err);
    }
  }

  closeEditMemberModal();
  showToast(`Data member ${member.fullName} berhasil diperbarui${rawNewPass ? ' (kata sandi baru tersimpan)' : ''}!`, 'success');
  renderAdminWhitelist();
}
window.handleSaveEditMemberSubmit = handleSaveEditMemberSubmit;

async function handleResetMemberPasswordFromModal() {
  const id = document.getElementById('edit-member-id').value;
  const member = AppState.whitelist.find(m => m.id === id);
  if (!member) return;

  showCustomConfirm({
    title: 'Reset Sandi Member?',
    message: `Reset kata sandi untuk ${member.email}? Siswa akan diwajibkan verifikasi OTP email dan membuat sandi baru saat login berikutnya.`,
    confirmText: 'Ya, Reset Sandi',
    cancelText: 'Batal',
    isDanger: true,
    onConfirm: async () => {
      member.passwordHash = null;
      saveState();

      if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
        try {
          await ZettSupabase.client.from('whitelist_members').update({
            password_hash: null
          }).eq('email', member.email);
        } catch (err) {
          console.warn('[Supabase Reset Pass Error]', err);
        }
      }

      showToast(`Kata sandi untuk ${member.email} berhasil di-reset!`, 'success');
      closeEditMemberModal();
      renderAdminWhitelist();
    }
  });
}
window.handleResetMemberPasswordFromModal = handleResetMemberPasswordFromModal;

async function toggleMemberActive(id) {
  const member = AppState.whitelist.find(m => m.id === id);
  if (!member) return;

  if (member.email.toLowerCase() === 'zettbos2025@gmail.com') {
    showToast('Akun Super Admin tidak dapat dinonaktifkan!', 'warning');
    return;
  }

  member.isActive = !member.isActive;
  saveState();

  if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
    try {
      await ZettSupabase.client.from('whitelist_members').update({
        is_active: member.isActive
      }).eq('id', member.id);
    } catch (err) {
      console.warn('[Supabase Toggle Active Error]', err);
    }
  }

  renderAdminWhitelist();
  showToast(`Status ${member.email} diubah menjadi ${member.isActive ? 'Aktif' : 'Diblokir'}`, 'info');
}
window.toggleMemberActive = toggleMemberActive;

async function deleteMember(id) {
  const member = AppState.whitelist.find(m => m.id === id);
  if (!member) return;

  if (member.email.toLowerCase() === 'zettbos2025@gmail.com') {
    showToast('Akun Super Admin tidak boleh dihapus!', 'error');
    return;
  }

  showCustomConfirm({
    title: 'Hapus Member dari Whitelist?',
    message: `Hapus ${member.email} (${member.fullName || 'Siswa'}) secara permanen dari whitelist?`,
    confirmText: 'Ya, Hapus Member',
    cancelText: 'Batal',
    isDanger: true,
    onConfirm: async () => {
      AppState.whitelist = AppState.whitelist.filter(m => m.id !== id);
      saveState();

      if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
        try {
          await ZettSupabase.client.from('whitelist_members').delete().eq('id', member.id);
        } catch (err) {
          console.warn('[Supabase Delete Member Error]', err);
        }
      }

      renderAdminWhitelist();
      showToast(`Email ${member.email} telah dihapus dari whitelist.`, 'info');
    }
  });
}
window.deleteMember = deleteMember;

async function syncWhitelistToSupabaseLive() {
  if (typeof ZettSupabase === 'undefined' || !ZettSupabase.isConnected()) {
    showToast('Supabase belum terhubung. Silakan atur URL & Key di tombol "Database Cloud".', 'warning');
    openSupabaseSettingsModal();
    return;
  }

  showToast('Sedang memproteksi kata sandi dan menyinkronkan whitelist ke Supabase Cloud...', 'info', 10000);

  try {
    // 1. Tarik dulu id, password_hash, dan full_name dari cloud agar data siswa TIDAK terhapus/ter-overwrite null!
    const { data: cloudWl } = await ZettSupabase.client
      .from('whitelist_members')
      .select('id, email, password_hash, full_name')
      .limit(10000);

    const cloudMap = new Map();
    const existingCloudIds = new Set();
    let maxIdNumber = 0;

    if (Array.isArray(cloudWl)) {
      cloudWl.forEach(c => {
        if (c.email) cloudMap.set(c.email.toLowerCase().trim(), c);
        if (c.id) {
          existingCloudIds.add(c.id);
          const match = String(c.id).toUpperCase().match(/^WL-(\d+)$/);
          if (match && match[1]) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num > maxIdNumber && num < 1000000) {
              maxIdNumber = num;
            }
          }
        }
      });
    }

    // Cross-check dengan local AppState.whitelist
    AppState.whitelist.forEach(m => {
      const match = String(m.id || '').toUpperCase().match(/^WL-(\d+)$/);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxIdNumber && num < 1000000) {
          maxIdNumber = num;
        }
      }
    });

    const payload = AppState.whitelist.map(m => {
      const cleanE = (m.email || '').toLowerCase().trim();
      const cloudItem = cloudMap.get(cleanE);

      const finalPass = m.passwordHash || cloudItem?.password_hash || null;
      const finalName = (m.fullName && m.fullName !== 'Siswa Zettbos')
        ? m.fullName
        : (cloudItem?.full_name || m.fullName || 'Siswa Zettbos');

      const isOwner = cleanE === 'zettbos2025@gmail.com' || m.role === 'admin';
      let finalId = cloudItem?.id || m.id;

      // Cek apakah ID sudah berformat rapi WL-XXXX (bukan timestamp wl-179...)
      const matchWl = String(finalId || '').toUpperCase().match(/^WL-(\d+)$/);
      const isCleanWl = matchWl && parseInt(matchWl[1], 10) < 1000000;

      if (isOwner) {
        finalId = finalId || 'owner-1';
      } else if (!isCleanWl || (finalId && existingCloudIds.has(finalId) && cloudItem?.email?.toLowerCase().trim() !== cleanE)) {
        // ID belum rapi atau bentrok dengan member lain: alokasikan nomor urut berikutnya!
        maxIdNumber++;
        finalId = 'WL-' + String(maxIdNumber).padStart(4, '0');
        while (existingCloudIds.has(finalId)) {
          maxIdNumber++;
          finalId = 'WL-' + String(maxIdNumber).padStart(4, '0');
        }
      }

      existingCloudIds.add(finalId);
      m.id = finalId;
      m.passwordHash = finalPass;
      m.fullName = finalName;

      return {
        id: finalId,
        email: cleanE,
        full_name: finalName,
        role: m.role || 'member',
        is_active: m.isActive !== false,
        password_hash: finalPass
      };
    });

    saveState();

    const batchSize = 100;
    for (let i = 0; i < payload.length; i += batchSize) {
      const chunk = payload.slice(i, i + batchSize);
      const { data: dbRows, error } = await ZettSupabase.client
        .from('whitelist_members')
        .upsert(chunk, { onConflict: 'email' })
        .select('id, email');
      if (error) throw error;

      if (Array.isArray(dbRows)) {
        dbRows.forEach(u => {
          const match = AppState.whitelist.find(m => (m.email || '').toLowerCase().trim() === u.email.toLowerCase().trim());
          if (match && u.id) match.id = u.id;
        });
      }
    }

    saveState();

    showToast(`Sukses menyinkronkan seluruh ${payload.length} akun whitelist ke Supabase Cloud (Anti-Overwrite & Multi-Device Aman)!`, 'success');
    renderAdminWhitelist();
  } catch (err) {
    console.error('[Sync Whitelist Error]', err);
    showToast(`Gagal menyinkronkan ke Supabase: ${err.message || err.toString()}`, 'error');
  }
}
window.syncWhitelistToSupabaseLive = syncWhitelistToSupabaseLive;

async function pullWhitelistFromSupabaseLive(isSilent = false) {
  if (typeof ZettSupabase === 'undefined' || !ZettSupabase.isConnected()) {
    if (!isSilent) {
      showToast('Supabase belum terhubung. Silakan atur URL & Key di tombol "Database Cloud".', 'warning');
      openSupabaseSettingsModal();
    }
    return;
  }

  if (!isSilent) {
    showToast('Menarik seluruh data member & status kata sandi terbaru dari Supabase Cloud...', 'info');
  }

  try {
    // 1. Tarik prioritas instan: Semua member dengan password aktif & semua akun Admin
    const [resPass, resAdmin] = await Promise.all([
      ZettSupabase.client.from('whitelist_members').select('id, email, full_name, role, is_active, password_hash').not('password_hash', 'is', null),
      ZettSupabase.client.from('whitelist_members').select('id, email, full_name, role, is_active, password_hash').eq('role', 'admin')
    ]);

    const allCloudRows = [];
    const seenEmails = new Set();

    const addRow = (row) => {
      if (!row || !row.email) return;
      const cleanE = row.email.toLowerCase().trim();
      if (!seenEmails.has(cleanE)) {
        seenEmails.add(cleanE);
        allCloudRows.push(row);
      } else {
        const idx = allCloudRows.findIndex(x => (x.email || '').toLowerCase().trim() === cleanE);
        if (idx !== -1) {
          allCloudRows[idx] = { ...allCloudRows[idx], ...row };
        }
      }
    };

    (resPass.data || []).forEach(addRow);
    (resAdmin.data || []).forEach(addRow);

    // 2. Tarik seluruh member (2.000+ data) secara chunked paging (0-999, 1000-1999, dst)
    let from = 0;
    const batchSize = 1000;
    let keepPaging = true;
    while (keepPaging) {
      const { data: chunk, error: pageErr } = await ZettSupabase.client
        .from('whitelist_members')
        .select('id, email, full_name, role, is_active, password_hash')
        .range(from, from + batchSize - 1);

      if (pageErr || !Array.isArray(chunk) || chunk.length === 0) {
        keepPaging = false;
      } else {
        chunk.forEach(addRow);
        if (chunk.length < batchSize) {
          keepPaging = false;
        } else {
          from += batchSize;
        }
      }
    }

    if (allCloudRows.length > 0) {
      let updatedCount = 0;
      let newCount = 0;

      allCloudRows.forEach(cloudM => {
        const cleanE = (cloudM.email || '').toLowerCase().trim();
        if (!cleanE) return;

        const localM = AppState.whitelist.find(m => (m.email || '').toLowerCase().trim() === cleanE);
        if (localM) {
          let modified = false;
          const cloudPass = cloudM.password_hash || null;
          if (localM.passwordHash !== cloudPass) {
            localM.passwordHash = cloudPass;
            modified = true;
          }
          if (cloudM.full_name && localM.fullName !== cloudM.full_name) {
            localM.fullName = cloudM.full_name;
            modified = true;
          }
          if (cloudM.role && localM.role !== cloudM.role) {
            localM.role = cloudM.role;
            modified = true;
          }
          if (typeof cloudM.is_active === 'boolean' && localM.isActive !== cloudM.is_active) {
            localM.isActive = cloudM.is_active;
            modified = true;
          }
          if (modified) updatedCount++;
        } else {
          AppState.whitelist.push({
            id: cloudM.id || ('WL-' + String(AppState.whitelist.length + 1).padStart(4, '0')),
            email: cleanE,
            fullName: cloudM.full_name || cleanE.split('@')[0],
            role: cloudM.role || 'member',
            isActive: cloudM.is_active !== false,
            passwordHash: cloudM.password_hash || null,
            registeredAt: new Date().toISOString()
          });
          newCount++;
        }
      });

      saveState();
      renderAdminWhitelist();
      if (AppState.activeAdminTab === 'analytics') renderAdminAnalytics();

      if (!isSilent) {
        showToast(`Sinkronisasi selesai! ${allCloudRows.length} member ditarik (${updatedCount} diperbarui, ${newCount} baru).`, 'success');
      }
    } else {
      if (!isSilent) showToast('Data whitelist di Cloud masih kosong.', 'info');
    }
  } catch (err) {
    console.error('[Pull Whitelist Live Error]', err);
    if (!isSilent) {
      showToast('Gagal menarik data dari Supabase: ' + (err.message || err.toString()), 'error');
    }
  }
}
window.pullWhitelistFromSupabaseLive = pullWhitelistFromSupabaseLive;

// ==========================================
// 7. SISWA PROGRESS ANALYTICS (FAST PAGINATION & FILTERS)
// ==========================================

let analyticsState = {
  currentPage: 1,
  perPage: 25,
  search: '',
  filter: 'all'
};

function renderAdminAnalytics() {
  const tableBody = document.getElementById('analytics-table-body');
  if (!tableBody) return;

  // Ensure Realtime subscription is active to catch live student completions
  if (typeof window.subscribeToMemberProgressRealtime === 'function') {
    window.subscribeToMemberProgressRealtime();
  }

  const totalLessons = AppState.lessons.length;
  const members = AppState.whitelist || [];

  // 1. Hitung progres setiap siswa terlebih dahulu
  const enrichedMembers = members.map(m => {
    const completedList = AppState.progress[m.email] || [];
    const count = completedList.length;
    const percent = totalLessons > 0 ? Math.round((count / totalLessons) * 100) : 0;
    return {
      ...m,
      completedCount: count,
      percent: percent,
      isCompleted: percent === 100 && totalLessons > 0,
      isLearning: percent > 0 && percent < 100,
      isNotStarted: percent === 0
    };
  });

  // 2. Hitung statistik keseluruhan
  const totalCount = enrichedMembers.length;
  const completedCount = enrichedMembers.filter(m => m.isCompleted).length;
  const learningCount = enrichedMembers.filter(m => m.isLearning).length;
  const notStartedCount = enrichedMembers.filter(m => m.isNotStarted).length;

  // Update badge & metric cards
  const elTotalBadge = document.getElementById('analytics-total-badge');
  if (elTotalBadge) elTotalBadge.textContent = `${totalCount.toLocaleString('id-ID')} Siswa`;

  const elStatTotal = document.getElementById('analytics-stat-total');
  const elStatComp = document.getElementById('analytics-stat-completed');
  const elStatLearn = document.getElementById('analytics-stat-learning');
  const elStatNot = document.getElementById('analytics-stat-notstarted');
  if (elStatTotal) elStatTotal.textContent = totalCount.toLocaleString('id-ID');
  if (elStatComp) elStatComp.textContent = completedCount.toLocaleString('id-ID');
  if (elStatLearn) elStatLearn.textContent = learningCount.toLocaleString('id-ID');
  if (elStatNot) elStatNot.textContent = notStartedCount.toLocaleString('id-ID');

  // Update counter badges on filter tabs
  const elCntAll = document.getElementById('an-count-all');
  const elCntComp = document.getElementById('an-count-completed');
  const elCntLearn = document.getElementById('an-count-learning');
  const elCntNot = document.getElementById('an-count-notstarted');
  if (elCntAll) elCntAll.textContent = totalCount.toLocaleString('id-ID');
  if (elCntComp) elCntComp.textContent = completedCount.toLocaleString('id-ID');
  if (elCntLearn) elCntLearn.textContent = learningCount.toLocaleString('id-ID');
  if (elCntNot) elCntNot.textContent = notStartedCount.toLocaleString('id-ID');

  // 3. Filter data berdasarkan tab & search input
  const searchLower = (analyticsState.search || '').toLowerCase().trim();
  let filtered = enrichedMembers.filter(m => {
    // Search
    const matchSearch = !searchLower ||
      (m.email && m.email.toLowerCase().includes(searchLower)) ||
      (m.fullName && m.fullName.toLowerCase().includes(searchLower));

    if (!matchSearch) return false;

    // Filter status
    if (analyticsState.filter === 'completed') return m.isCompleted;
    if (analyticsState.filter === 'learning') return m.isLearning;
    if (analyticsState.filter === 'notstarted') return m.isNotStarted;
    return true;
  });

  // 4. Hitung pagination
  const totalPages = Math.ceil(filtered.length / analyticsState.perPage) || 1;
  if (analyticsState.currentPage > totalPages) analyticsState.currentPage = totalPages;
  if (analyticsState.currentPage < 1) analyticsState.currentPage = 1;

  const startIndex = (analyticsState.currentPage - 1) * analyticsState.perPage;
  const endIndex = Math.min(startIndex + analyticsState.perPage, filtered.length);
  const pageItems = filtered.slice(startIndex, endIndex);

  // Update Footer Controls
  const pageInfo = document.getElementById('analytics-page-info');
  if (pageInfo) {
    pageInfo.textContent = filtered.length > 0 
      ? `Menampilkan ${(startIndex + 1).toLocaleString('id-ID')} - ${endIndex.toLocaleString('id-ID')} dari ${filtered.length.toLocaleString('id-ID')} siswa (Total: ${totalCount.toLocaleString('id-ID')})`
      : 'Tidak ada siswa yang cocok dengan filter';
  }

  const pageIndicator = document.getElementById('analytics-page-indicator');
  if (pageIndicator) {
    pageIndicator.textContent = `Hal ${analyticsState.currentPage} / ${totalPages}`;
  }

  // 5. Render Baris Tabel (Super Cepat < 1ms untuk 25 siswa)
  tableBody.innerHTML = '';

  if (pageItems.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="py-12 text-center text-slate-500 font-mono text-xs">
          Tidak ada data siswa yang sesuai dengan filter atau pencarian.
        </td>
      </tr>
    `;
    return;
  }

  pageItems.forEach((m, idx) => {
    const row = document.createElement('tr');
    row.className = 'border-b border-slate-800/80 hover:bg-slate-900/50 text-xs transition-colors';

    const rowNum = startIndex + idx + 1;
    const isSuperAdmin = m.email.toLowerCase() === 'zettbos2025@gmail.com';

    let statusBadge = '';
    if (m.isCompleted) {
      statusBadge = '<span class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">Lulus 100%</span>';
    } else if (m.isLearning) {
      statusBadge = '<span class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">Sedang Belajar</span>';
    } else {
      statusBadge = '<span class="px-2.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400">Belum Mulai</span>';
    }

    row.innerHTML = `
      <td class="py-3 px-4 text-center font-mono text-slate-500">${rowNum}</td>
      <td class="py-3 px-4">
        <div class="font-bold text-white flex items-center gap-1.5">
          <span>${escapeHtml(m.fullName || 'Siswa Zettbos')}</span>
          ${isSuperAdmin ? '<span class="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono font-bold">OWNER</span>' : ''}
        </div>
      </td>
      <td class="py-3 px-4 text-slate-400 font-mono text-xs">${escapeHtml(m.email)}</td>
      <td class="py-3 px-4 text-emerald-400 font-semibold font-mono">${m.completedCount} dari ${totalLessons} Materi</td>
      <td class="py-3 px-4">
        <div class="flex items-center gap-3">
          <div class="w-24 sm:w-28 h-2 rounded-full bg-slate-800 overflow-hidden">
            <div class="h-full bg-emerald-500 rounded-full transition-all duration-300" style="width: ${m.percent}%"></div>
          </div>
          <span class="font-bold font-mono text-xs ${m.percent === 100 ? 'text-emerald-400' : (m.percent > 0 ? 'text-cyan-300' : 'text-slate-400')}">${m.percent}%</span>
        </div>
      </td>
      <td class="py-3 px-4 text-center">
        ${statusBadge}
      </td>
      <td class="py-3 px-4 text-right">
        <button 
          onclick="openMemberProgressModal('${escapeHtml(m.email)}')" 
          class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 transition-colors inline-flex items-center gap-1 shadow-sm"
          title="Audit Rincian Modul & Episode Siswa"
        >
          <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          <span>Audit</span>
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function handleAnalyticsSearch(val) {
  analyticsState.search = val || '';
  analyticsState.currentPage = 1;
  renderAdminAnalytics();
}
window.handleAnalyticsSearch = handleAnalyticsSearch;

function setAnalyticsFilter(filterName) {
  analyticsState.filter = filterName;
  analyticsState.currentPage = 1;

  ['all', 'completed', 'learning', 'notstarted'].forEach(f => {
    const btn = document.getElementById(`an-filter-${f}`);
    if (btn) {
      if (f === filterName) {
        btn.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/40 whitespace-nowrap';
      } else {
        btn.className = 'px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 whitespace-nowrap';
      }
    }
  });

  renderAdminAnalytics();
}
window.setAnalyticsFilter = setAnalyticsFilter;

function changeAnalyticsPerPage(val) {
  analyticsState.perPage = parseInt(val, 10) || 25;
  analyticsState.currentPage = 1;
  renderAdminAnalytics();
}
window.changeAnalyticsPerPage = changeAnalyticsPerPage;

function gotoAnalyticsPage(action) {
  const totalLessons = AppState.lessons.length;
  const searchLower = (analyticsState.search || '').toLowerCase().trim();

  let filtered = (AppState.whitelist || []).filter(m => {
    const completedList = AppState.progress[m.email] || [];
    const count = completedList.length;
    const percent = totalLessons > 0 ? Math.round((count / totalLessons) * 100) : 0;

    const matchSearch = !searchLower ||
      (m.email && m.email.toLowerCase().includes(searchLower)) ||
      (m.fullName && m.fullName.toLowerCase().includes(searchLower));
    if (!matchSearch) return false;

    if (analyticsState.filter === 'completed') return percent === 100 && totalLessons > 0;
    if (analyticsState.filter === 'learning') return percent > 0 && percent < 100;
    if (analyticsState.filter === 'notstarted') return percent === 0;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / analyticsState.perPage) || 1;

  if (action === 'first') analyticsState.currentPage = 1;
  else if (action === 'prev') analyticsState.currentPage = Math.max(1, analyticsState.currentPage - 1);
  else if (action === 'next') analyticsState.currentPage = Math.min(totalPages, analyticsState.currentPage + 1);
  else if (action === 'last') analyticsState.currentPage = totalPages;

  renderAdminAnalytics();
}
window.gotoAnalyticsPage = gotoAnalyticsPage;

/**
 * Manually pulls all members' progress from Supabase Cloud.
 * Triggered by the [Tarik Progres Cloud] button on the Analytics Monitoring toolbar.
 */
async function handleManualPullProgressCloud() {
  const btn = document.getElementById('btn-manual-sync-progress');
  const originalHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<svg class="w-4 h-4 animate-spin inline-block mr-1.5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg> Menarik Progres...`;
  }
  showToast('Menghubungkan ke Cloud Supabase untuk menarik progres seluruh siswa...', 'info');

  try {
    let success = false;
    if (typeof window.pullAllMembersProgressForAdmin === 'function') {
      success = await window.pullAllMembersProgressForAdmin(false);
    } else if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
      success = await ZettSupabase.pullAllMembersProgressForAdmin(false);
    } else {
      showToast('Koneksi Supabase belum terkonfigurasi!', 'error');
    }

    if (success) {
      renderAdminAnalytics();
    }
  } catch (err) {
    console.error('[handleManualPullProgressCloud Error]', err);
    showToast('Terjadi kesalahan saat menarik progres cloud: ' + err.message, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalHtml || `<svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg> Tarik Progres Cloud`;
    }
  }
}
window.handleManualPullProgressCloud = handleManualPullProgressCloud;

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
window.openEditFacilityModal = openEditFacilityModal;
window.closeEditFacilityModal = closeEditFacilityModal;
window.handleSaveFacilitySubmit = handleSaveFacilitySubmit;
window.resetLandingFacilitiesToDefault = resetLandingFacilitiesToDefault;
window.handleFacilityImagePreview = handleFacilityImagePreview;
window.openEditUseCaseModal = openEditUseCaseModal;
window.closeEditUseCaseModal = closeEditUseCaseModal;
window.handleSaveUseCaseSubmit = handleSaveUseCaseSubmit;
window.resetLandingUseCasesToDefault = resetLandingUseCasesToDefault;
window.openAddTestimonialModal = openAddTestimonialModal;
window.openEditTestimonialModal = openEditTestimonialModal;
window.closeEditTestimonialModal = closeEditTestimonialModal;
window.handleSaveTestimonialSubmit = handleSaveTestimonialSubmit;
window.approveTestimonial = approveTestimonial;
window.unapproveTestimonial = unapproveTestimonial;
window.deleteTestimonial = deleteTestimonial;
window.resetLandingTestimonialsToDefault = resetLandingTestimonialsToDefault;
window.handleTestiProofFileUpload = handleTestiProofFileUpload;
window.handleRemoveTestiProof = handleRemoveTestiProof;
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
window.renderAdminContactsCms = renderAdminContactsCms;
window.handleSaveAdminContactsCms = handleSaveAdminContactsCms;
window.resetAdminContactsToDefault = resetAdminContactsToDefault;

// Handler Manual Rapikan & Format Semua ID Database
async function handleNormalizeAllIdsClick() {
  showCustomConfirm({
    title: '✨ Rapikan Format Seluruh ID Database?',
    message: 'Apakah Anda ingin menstandardisasi format seluruh ID di database lokal & Supabase Cloud (contoh: MOD-01, LES-01, WL-0001, QA-01)? ID lama yang acak akan dibersihkan.',
    confirmText: 'Ya, Rapikan Semua ID',
    cancelText: 'Batal',
    isDanger: false,
    onConfirm: async () => {
      showToast('Sedang merapikan seluruh nomor unik database...', 'info');
      await normalizeAllDatabaseIds(true);
      if (typeof renderAdminCurriculum === 'function') renderAdminCurriculum();
      if (typeof renderAdminQuickActions === 'function') renderAdminQuickActions();
      showToast('Semua nomor ID database berhasil distandardisasi & tersinkron!', 'success');
    }
  });
}
window.handleNormalizeAllIdsClick = handleNormalizeAllIdsClick;

// ==========================================
// PENGATURAN LOGO BRAND & GOOGLE DRIVE
// ==========================================

function handleBrandLogoInputPreview(val) {
  const box = document.getElementById('admin-logo-preview-box');
  const status = document.getElementById('admin-logo-preview-status');
  if (!box) return;

  const converted = typeof convertGoogleDriveUrl === 'function' ? convertGoogleDriveUrl(val) : val;

  if (converted && converted.trim()) {
    box.innerHTML = `<img src="${escapeHtml(converted.trim())}" alt="Logo Preview" class="w-full h-full object-contain" onerror="this.onerror=null; this.parentElement.innerHTML='<span class=\\'text-xs text-rose-400 font-mono\\'>Gagal</span>';">`;
    if (status) {
      status.innerText = (val && val.includes('drive.google.com')) ? 'Google Drive Link (Converted)' : 'Custom Image URL';
      status.className = 'text-[10px] text-emerald-400 mt-1.5 font-mono';
    }
  } else {
    box.innerHTML = `<span class="text-sm font-black text-emerald-400 font-mono">ZB</span>`;
    if (status) {
      status.innerText = 'Default Badge';
      status.className = 'text-[10px] text-slate-500 mt-1.5 font-mono';
    }
  }
}

function handleSaveBrandLogo(e) {
  if (e) e.preventDefault();
  const inp = document.getElementById('admin-brand-logo-input');
  const rawUrl = inp ? inp.value.trim() : '';

  AppState.brandLogoUrl = rawUrl;
  if (!AppState.landingCms) AppState.landingCms = {};
  if (!AppState.landingCms.hero) AppState.landingCms.hero = {};
  AppState.landingCms.hero.brandLogoUrl = rawUrl;
  AppState.landingCms.brandLogoUrl = rawUrl;

  if (rawUrl) {
    localStorage.setItem('zettbos_brand_logo_url', rawUrl);
  } else {
    localStorage.removeItem('zettbos_brand_logo_url');
  }

  saveState();

  // Live Auto-Push ke Supabase Cloud via hero JSONB container
  autoPushLandingCmsIfConnected();

  if (typeof renderAppBrandLogo === 'function') {
    renderAppBrandLogo();
  }

  handleBrandLogoInputPreview(rawUrl);
  showToast(rawUrl ? 'Logo brand berhasil disimpan & LIVE di Cloud Supabase!' : 'Logo direset ke badge default [ZB]', 'success');
}

function handleResetBrandLogo() {
  const inp = document.getElementById('admin-brand-logo-input');
  if (inp) inp.value = '';

  AppState.brandLogoUrl = '';
  if (AppState.landingCms && AppState.landingCms.hero) {
    AppState.landingCms.hero.brandLogoUrl = '';
  }
  if (AppState.landingCms) {
    AppState.landingCms.brandLogoUrl = '';
  }
  localStorage.removeItem('zettbos_brand_logo_url');

  saveState();

  // Live Auto-Push reset logo ke Supabase Cloud
  autoPushLandingCmsIfConnected();

  if (typeof renderAppBrandLogo === 'function') {
    renderAppBrandLogo();
  }

  handleBrandLogoInputPreview('');
  showToast('Logo dikembalikan ke badge bawaan [ZB] & LIVE di Cloud!', 'success');
}

function openMemberProgressModal(email) {
  const member = (AppState.whitelist || []).find(m => m.email.toLowerCase() === email.toLowerCase()) || {
    email: email,
    fullName: 'Siswa Zettbos'
  };

  const completedLessonIds = AppState.progress[email] || [];
  const totalLessonsCount = (AppState.lessons || []).length;
  const completedCount = completedLessonIds.length;
  const percent = totalLessonsCount > 0 ? Math.round((completedCount / totalLessonsCount) * 100) : 0;

  const modal = document.getElementById('modal-member-progress-detail');
  const subtitleEl = document.getElementById('audit-member-subtitle');
  const badgeEl = document.getElementById('audit-member-percent-badge');
  const statModules = document.getElementById('audit-stat-modules');
  const statCompleted = document.getElementById('audit-stat-completed');
  const statRemaining = document.getElementById('audit-stat-remaining');
  const container = document.getElementById('audit-member-modules-container');

  if (subtitleEl) subtitleEl.textContent = `${member.fullName || 'Siswa'} (${member.email})`;
  if (badgeEl) badgeEl.textContent = `${percent}% Selesai (${completedCount}/${totalLessonsCount} Materi)`;
  if (statModules) statModules.textContent = (AppState.modules || []).length;
  if (statCompleted) statCompleted.textContent = completedCount;
  if (statRemaining) statRemaining.textContent = Math.max(0, totalLessonsCount - completedCount);

  if (container) {
    const modules = (AppState.modules || []).slice().sort((a, b) => (a.orderIndex || 1) - (b.orderIndex || 1));

    if (modules.length === 0) {
      container.innerHTML = '<div class="p-6 text-center text-xs text-slate-500 font-mono">Belum ada kurikulum modul terdaftar.</div>';
    } else {
      container.innerHTML = modules.map(mod => {
        const moduleLessons = (AppState.lessons || [])
          .filter(l => l.moduleId === mod.id)
          .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

        const modDoneCount = moduleLessons.filter(l => completedLessonIds.includes(l.id)).length;
        const isModComplete = moduleLessons.length > 0 && modDoneCount === moduleLessons.length;

        return `
          <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div class="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800/60">
              <div class="flex items-center gap-2 truncate">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono ${isModComplete ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50' : 'bg-slate-950 text-slate-400 border border-slate-800'}">
                  ${escapeHtml(mod.badge || 'MODUL')}
                </span>
                <h4 class="text-xs font-bold text-white truncate">${escapeHtml(mod.title)}</h4>
              </div>
              <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded ${modDoneCount > 0 ? 'bg-emerald-950/80 text-emerald-400' : 'bg-slate-950 text-slate-500'} flex-shrink-0">
                ${modDoneCount}/${moduleLessons.length} Materi
              </span>
            </div>

            <div class="space-y-1">
              ${moduleLessons.length === 0 ? '<div class="text-[11px] text-slate-500 italic px-2">Belum ada materi di modul ini</div>' : ''}
              ${moduleLessons.map((l, i) => {
                const isDone = completedLessonIds.includes(l.id);
                return `
                  <div class="flex items-center justify-between gap-2 py-1 px-2 rounded hover:bg-slate-800/40 text-xs">
                    <div class="flex items-center gap-2 truncate">
                      ${isDone 
                        ? '<span class="w-4 h-4 rounded-full bg-emerald-950 border border-emerald-500/60 text-emerald-400 flex items-center justify-center flex-shrink-0 text-[10px]">✓</span>' 
                        : '<span class="w-4 h-4 rounded-full bg-slate-950 border border-slate-800 text-slate-600 flex items-center justify-center flex-shrink-0 text-[10px]">○</span>'}
                      <span class="truncate ${isDone ? 'text-emerald-300 font-medium' : 'text-slate-400'}">${i + 1}. ${escapeHtml(l.title)}</span>
                    </div>
                    <div class="flex items-center gap-2 flex-shrink-0 font-mono text-[10px]">
                      <span class="text-slate-500">${l.durationMinutes || 15}m</span>
                      <span class="px-1.5 py-0.2 rounded font-bold ${isDone ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-slate-950 text-slate-500'}">
                        ${isDone ? 'SELESAI' : 'BELUM'}
                      </span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }).join('');
    }
  }

  if (modal) modal.classList.remove('hidden');
}

function closeMemberProgressModal() {
  const modal = document.getElementById('modal-member-progress-detail');
  if (modal) modal.classList.add('hidden');
}

async function handleBrandLogoFileUpload(event) {
  const file = event?.target?.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('Harap pilih file gambar (PNG, JPG, WebP, SVG)', 'error');
    return;
  }

  showToast('Mengunggah logo brand...', 'info');

  try {
    let uploadedUrl = '';

    // 1. Coba upload langsung ke Supabase Storage bucket 'brand-assets' jika tersedia
    if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
      try {
        const fileExt = file.name.split('.').pop() || 'png';
        const fileName = `logo_${Date.now()}.${fileExt}`;
        const { data, error } = await ZettSupabase.client.storage
          .from('brand-assets')
          .upload(fileName, file, { cacheControl: '3600', upsert: true });

        if (!error && data) {
          const { data: pubData } = ZettSupabase.client.storage
            .from('brand-assets')
            .getPublicUrl(fileName);
          if (pubData && pubData.publicUrl) {
            uploadedUrl = pubData.publicUrl;
          }
        }
      } catch (stErr) {
        console.warn('[Supabase Storage Bucket Error, using Data URL fallback]', stErr);
      }
    }

    // 2. Jika storage bucket offline atau error, convert ke optimized Base64 Data URL (instan render)
    if (!uploadedUrl) {
      uploadedUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    }

    const inp = document.getElementById('admin-brand-logo-input');
    if (inp) inp.value = uploadedUrl;

    AppState.brandLogoUrl = uploadedUrl;
    if (!AppState.landingCms) AppState.landingCms = {};
    if (!AppState.landingCms.hero) AppState.landingCms.hero = {};
    AppState.landingCms.hero.brandLogoUrl = uploadedUrl;
    AppState.landingCms.brandLogoUrl = uploadedUrl;
    localStorage.setItem('zettbos_brand_logo_url', uploadedUrl);
    saveState();

    autoPushLandingCmsIfConnected();

    if (typeof renderAppBrandLogo === 'function') {
      renderAppBrandLogo();
    }

    handleBrandLogoInputPreview(uploadedUrl);
    showToast('Logo brand berhasil diupload & LIVE instan!', 'success');
  } catch (err) {
    console.error('[Upload Logo Error]', err);
    showToast(`Gagal mengunggah logo: ${err.message}`, 'error');
  }
}

window.handleBrandLogoInputPreview = handleBrandLogoInputPreview;
window.handleSaveBrandLogo = handleSaveBrandLogo;
window.handleResetBrandLogo = handleResetBrandLogo;
window.handleBrandLogoFileUpload = handleBrandLogoFileUpload;
window.openMemberProgressModal = openMemberProgressModal;
window.closeMemberProgressModal = closeMemberProgressModal;
window.renderAdminCategoryList = renderAdminCategoryList;
window.openAddCategoryModal = openAddCategoryModal;
window.openEditCategoryModal = openEditCategoryModal;
window.closeCategoryModal = closeCategoryModal;
window.handleSaveCategorySubmit = handleSaveCategorySubmit;
window.deleteCategory = deleteCategory;

// ==========================================
// ZETTSHOWCASE CMS MODERATION (Revisi 90)
// ==========================================

function renderAdminShowcaseCms() {
  const tbody = document.getElementById('admin-showcase-table-body');
  const countBadge = document.getElementById('admin-showcase-count-badge');
  if (!tbody) return;

  const projects = AppState.showcaseProjects || [];
  if (countBadge) {
    countBadge.textContent = `${projects.length} Proyek Terdaftar`;
  }

  tbody.innerHTML = '';
  if (projects.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="py-8 text-center text-slate-500 font-mono text-xs">
          Belum ada karya siswa yang diajukan.
        </td>
      </tr>
    `;
    return;
  }

  projects.forEach((p, idx) => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-slate-800/80 hover:bg-slate-900/50 transition-colors text-xs';

    const isApproved = p.status === 'approved';
    const isFeatured = !!p.is_featured;

    const statusBadge = isApproved
      ? '<span class="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-mono text-[10px]">Tayang (Approved)</span>'
      : '<span class="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40 font-mono text-[10px] animate-pulse">Menunggu Review</span>';

    tr.innerHTML = `
      <td class="py-3 px-3 text-center font-mono text-slate-500">${idx + 1}</td>
      <td class="py-3 px-3">
        <div class="font-bold text-white">${escapeHtml(p.title)}</div>
        <div class="text-[11px] text-slate-400 font-mono">${escapeHtml(p.tech_stack || '-')}</div>
      </td>
      <td class="py-3 px-3">
        <div class="flex flex-col gap-1">
          <span class="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-300 font-semibold">
            <span>🌐</span> ${escapeHtml(p.hosting || 'Vercel')}
          </span>
          <span class="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-300 font-semibold">
            <span>🗄️</span> ${escapeHtml(p.database || 'Supabase')}
          </span>
        </div>
      </td>
      <td class="py-3 px-3">
        <div class="font-semibold text-slate-200">${escapeHtml(p.user_name || 'Member')}</div>
        <div class="text-[11px] text-slate-500 font-mono">${escapeHtml(p.user_email || '-')}</div>
      </td>
      <td class="py-3 px-3">${statusBadge}</td>
      <td class="py-3 px-3">
        <button onclick="toggleFeaturedShowcase('${p.id}')" class="px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
          isFeatured 
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' 
            : 'bg-slate-900 text-slate-500 border border-slate-800 hover:text-slate-300'
        }">
          ${isFeatured ? '⭐ Unggulan' : '☆ Biasa'}
        </button>
      </td>
      <td class="py-3 px-3">
        <a href="${escapeHtml(p.demo_url)}" target="_blank" class="text-emerald-400 hover:underline inline-flex items-center gap-1 font-mono text-[11px]">
          <span>Live Demo</span>
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
        </a>
      </td>
      <td class="py-3 px-3 text-right">
        <div class="flex items-center justify-end gap-1.5">
          <button onclick="openAdminEditShowcaseModal('${p.id}')" class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/25 transition-colors flex items-center gap-1" title="Edit Data Proyek Siswa">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            <span>Edit</span>
          </button>
          ${!isApproved ? `
            <button onclick="approveShowcaseProject('${p.id}')" class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-900 transition-colors">
              Approve
            </button>
          ` : `
            <button onclick="rejectShowcaseProject('${p.id}')" class="px-2 py-1 rounded-lg text-xs font-semibold bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200 transition-colors">
              Unpublish
            </button>
          `}
          <button onclick="deleteShowcaseProject('${p.id}')" class="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors" title="Hapus Karya">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openAdminEditShowcaseModal(id) {
  const p = (AppState.showcaseProjects || []).find(x => x.id === id);
  if (!p) return;

  const idInput = document.getElementById('admin-edit-showcase-id');
  const titleInput = document.getElementById('admin-edit-showcase-title');
  const makerInput = document.getElementById('admin-edit-showcase-maker');
  const hostingSelect = document.getElementById('admin-edit-showcase-hosting');
  const dbSelect = document.getElementById('admin-edit-showcase-database');
  const demoInput = document.getElementById('admin-edit-showcase-demourl');
  const repoInput = document.getElementById('admin-edit-showcase-repourl');
  const techInput = document.getElementById('admin-edit-showcase-tech');
  const coverInput = document.getElementById('admin-edit-showcase-cover');
  const descInput = document.getElementById('admin-edit-showcase-desc');
  const statusSelect = document.getElementById('admin-edit-showcase-status');
  const featuredSelect = document.getElementById('admin-edit-showcase-featured');

  if (idInput) idInput.value = p.id;
  if (titleInput) titleInput.value = p.title || '';
  if (makerInput) makerInput.value = p.user_name || '';
  if (hostingSelect) hostingSelect.value = p.hosting || 'Google Apps Script';
  if (dbSelect) dbSelect.value = p.database || 'Google Sheets';
  if (demoInput) demoInput.value = p.demo_url || '';
  if (repoInput) repoInput.value = p.repo_url || '';
  if (techInput) techInput.value = p.tech_stack || '';
  if (coverInput) coverInput.value = p.cover_image || '';
  if (descInput) descInput.value = p.description || '';
  if (statusSelect) statusSelect.value = p.status || 'approved';
  if (featuredSelect) featuredSelect.value = p.is_featured ? 'true' : 'false';

  const modal = document.getElementById('modal-edit-showcase-admin');
  if (modal) modal.classList.remove('hidden');
}

function closeAdminEditShowcaseModal() {
  const modal = document.getElementById('modal-edit-showcase-admin');
  if (modal) modal.classList.add('hidden');
}

async function handleAdminEditCoverUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  showToast('Mengunggah cover proyek ke Cloud Storage...', 'info');
  try {
    if (typeof ZettSupabase !== 'undefined' && typeof ZettSupabase.uploadShowcaseCover === 'function') {
      const url = await ZettSupabase.uploadShowcaseCover(file);
      if (url) {
        const coverInput = document.getElementById('admin-edit-showcase-cover');
        if (coverInput) coverInput.value = url;
        showToast('Gambar cover berhasil diunggah!', 'success');
      }
    }
  } catch (err) {
    console.warn('[Admin Cover Upload Error]', err);
    showToast('Gagal mengunggah cover: ' + err.message, 'error');
  }
}

async function handleSaveAdminEditShowcase(event) {
  event.preventDefault();
  const id = document.getElementById('admin-edit-showcase-id')?.value;
  const p = (AppState.showcaseProjects || []).find(x => x.id === id);
  if (!p) return;

  p.title = document.getElementById('admin-edit-showcase-title')?.value.trim() || p.title;
  p.user_name = document.getElementById('admin-edit-showcase-maker')?.value.trim() || p.user_name;
  p.hosting = document.getElementById('admin-edit-showcase-hosting')?.value || 'Google Apps Script';
  p.database = document.getElementById('admin-edit-showcase-database')?.value || 'Google Sheets';
  p.demo_url = document.getElementById('admin-edit-showcase-demourl')?.value.trim() || p.demo_url;
  p.repo_url = document.getElementById('admin-edit-showcase-repourl')?.value.trim() || '';
  p.tech_stack = `${p.hosting}, ${p.database}`;
  p.cover_image = document.getElementById('admin-edit-showcase-cover')?.value.trim() || '';
  p.description = document.getElementById('admin-edit-showcase-desc')?.value.trim() || p.description;
  p.status = document.getElementById('admin-edit-showcase-status')?.value || 'approved';
  p.is_featured = document.getElementById('admin-edit-showcase-featured')?.value === 'true';

  saveState();

  if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
    try {
      await ZettSupabase.client.from('member_showcase').upsert({
        id: p.id,
        user_email: p.user_email,
        user_name: p.user_name,
        title: p.title,
        description: p.description,
        demo_url: p.demo_url,
        repo_url: p.repo_url,
        cover_image: p.cover_image,
        tech_stack: p.tech_stack,
        hosting: p.hosting,
        database: p.database,
        status: p.status,
        is_featured: p.is_featured,
        created_at: p.created_at
      }, { onConflict: 'id' });
    } catch (err) {
      console.warn('[Supabase Admin Edit Showcase Error]', err);
    }
  }

  closeAdminEditShowcaseModal();
  renderAdminShowcaseCms();
  if (typeof renderShowcase === 'function') renderShowcase();
  showToast('Perubahan data karya siswa berhasil disimpan ke Cloud!', 'success');
}

window.openAdminEditShowcaseModal = openAdminEditShowcaseModal;
window.closeAdminEditShowcaseModal = closeAdminEditShowcaseModal;
window.handleAdminEditCoverUpload = handleAdminEditCoverUpload;
window.handleSaveAdminEditShowcase = handleSaveAdminEditShowcase;

async function approveShowcaseProject(id) {
  const p = (AppState.showcaseProjects || []).find(x => x.id === id);
  if (!p) return;
  p.status = 'approved';
  p.approved_at = new Date().toISOString();
  saveState();

  if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
    try {
      await ZettSupabase.client.from('member_showcase').update({
        status: 'approved',
        approved_at: p.approved_at
      }).eq('id', id);
    } catch (e) { console.warn(e); }
  }

  renderAdminShowcaseCms();
  if (typeof renderShowcase === 'function') renderShowcase();
  showToast('Karya siswa disetujui & live di ZettShowcase!', 'success');
}

async function rejectShowcaseProject(id) {
  const p = (AppState.showcaseProjects || []).find(x => x.id === id);
  if (!p) return;
  p.status = 'pending';
  saveState();

  if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
    try {
      await ZettSupabase.client.from('member_showcase').update({
        status: 'pending'
      }).eq('id', id);
    } catch (e) { console.warn(e); }
  }

  renderAdminShowcaseCms();
  if (typeof renderShowcase === 'function') renderShowcase();
  showToast('Karya dikembalikan ke status pending.', 'info');
}

async function toggleFeaturedShowcase(id) {
  const p = (AppState.showcaseProjects || []).find(x => x.id === id);
  if (!p) return;
  p.is_featured = !p.is_featured;
  saveState();

  if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
    try {
      await ZettSupabase.client.from('member_showcase').update({
        is_featured: p.is_featured
      }).eq('id', id);
    } catch (e) { console.warn(e); }
  }

  renderAdminShowcaseCms();
  if (typeof renderShowcase === 'function') renderShowcase();
  showToast(p.is_featured ? 'Ditandai sebagai Karya Pilihan!' : 'Dihapus dari status Unggulan.', 'info');
}

async function deleteShowcaseProject(id) {
  showCustomConfirm({
    title: 'Hapus Karya Siswa?',
    message: 'Apakah Anda yakin ingin menghapus karya proyek ini secara permanen dari sistem?',
    confirmText: 'Ya, Hapus Karya',
    cancelText: 'Batal',
    isDanger: true,
    onConfirm: async () => {
      AppState.showcaseProjects = (AppState.showcaseProjects || []).filter(x => x.id !== id);
      saveState();

      if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
        try {
          await ZettSupabase.client.from('member_showcase').delete().eq('id', id);
        } catch (e) { console.warn(e); }
      }

      renderAdminShowcaseCms();
      if (typeof renderShowcase === 'function') renderShowcase();
      showToast('Karya proyek berhasil dihapus.', 'info');
    }
  });
}

window.renderAdminShowcaseCms = renderAdminShowcaseCms;
window.approveShowcaseProject = approveShowcaseProject;
window.rejectShowcaseProject = rejectShowcaseProject;
window.toggleFeaturedShowcase = toggleFeaturedShowcase;
window.deleteShowcaseProject = deleteShowcaseProject;




