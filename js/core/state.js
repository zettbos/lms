/**
 * Zettbos LMS - Core State Management & Utilities
 * js/core/state.js
 */

const AppState = {
  currentUser: null,
  currentView: 'landing',
  whitelist: [],
  modules: [],
  lessons: [],
  progress: {}, // { 'email@domain.com': ['les-1', 'les-2'] }
  favorites: {}, // { 'email@domain.com': [...] }
  resources: [], // Shared links & document repository
  landingCms: null, // Dynamic Universal CMS for Landing Portal
  activeResourceCategory: 'all',
  resourceSearchQuery: '',
  activity: {}, // { 'email@domain.com': { studiedDates: [...] } }
  activeFavoritesTab: 'all',
  favoritesSearchQuery: '',
  quickActions: [], // Configurable Action Cards on Home
  moduleSearchQuery: '',
  activeModuleCategory: 'all',
  currentLessonId: null,
  adminSelectedLessonId: null,
  activeAdminTab: 'curriculum',
  editorInstance: null,
  pendingEmailForOtp: null,
  generatedOtpCode: null
};

window.AppState = AppState;

function initStorage() {
  let storedWhitelist = null;
  let storedModules = null;
  let storedLessons = null;
  let storedProgress = null;
  let storedFavorites = null;
  let storedResources = null;
  let storedLandingCms = null;
  let storedActivity = null;
  let storedQuickActions = null;
  let storedUser = null;

  try { storedWhitelist = JSON.parse(localStorage.getItem('zett_whitelist')); } catch (e) {}
  try { storedModules = JSON.parse(localStorage.getItem('zett_modules')); } catch (e) {}
  try { storedLessons = JSON.parse(localStorage.getItem('zett_lessons')); } catch (e) {}
  try { storedProgress = JSON.parse(localStorage.getItem('zett_progress')); } catch (e) {}
  try { storedFavorites = JSON.parse(localStorage.getItem('zett_favorites')); } catch (e) {}
  try { storedResources = JSON.parse(localStorage.getItem('zett_resources')); } catch (e) {}
  try { storedLandingCms = JSON.parse(localStorage.getItem('zett_landing_cms')); } catch (e) {}
  try { storedActivity = JSON.parse(localStorage.getItem('zett_activity')); } catch (e) {}
  try { storedQuickActions = JSON.parse(localStorage.getItem('zett_quick_actions')); } catch (e) {}
  try { storedUser = JSON.parse(localStorage.getItem('zett_current_user')); } catch (e) {}

  const DATA_CLEAN_VERSION = 'v31_whitelist_updated';
  const storedVersion = localStorage.getItem('zett_data_clean_version');
  
  // Whitelist import migration: Import 2.318 siswa unik & pertahankan hash password yang sudah diset
  if (storedVersion !== DATA_CLEAN_VERSION) {
    const existingPasswordMap = {};
    if (Array.isArray(storedWhitelist)) {
      storedWhitelist.forEach(item => {
        if (item.email && item.passwordHash) {
          existingPasswordMap[item.email.toLowerCase()] = item.passwordHash;
        }
      });
    }

    const studentList = (typeof WHITELIST_STUDENT_EMAILS !== 'undefined' && Array.isArray(WHITELIST_STUDENT_EMAILS))
      ? WHITELIST_STUDENT_EMAILS
      : [];

    const cleanWhitelist = [
      {
        id: 'owner-1',
        email: 'zettbos2025@gmail.com',
        fullName: 'Owner Zettbos (Super Admin)',
        role: 'admin',
        isActive: true,
        passwordHash: existingPasswordMap['zettbos2025@gmail.com'] || null,
        registeredAt: '2026-10-13'
      },
      ...studentList.map((email, idx) => ({
        id: 'wl-' + (idx + 1),
        email: email,
        fullName: 'Siswa Zettbos',
        role: 'member',
        isActive: true,
        passwordHash: existingPasswordMap[email.toLowerCase()] || null,
        registeredAt: '2026-10-13'
      }))
    ];
    localStorage.setItem('zett_whitelist', JSON.stringify(cleanWhitelist));
    localStorage.setItem('zett_data_clean_version', DATA_CLEAN_VERSION);
    storedWhitelist = cleanWhitelist;
  }

  const zData = window.ZettData || {};
  const seedWhitelist = Array.isArray(zData.SEED_WHITELIST) ? zData.SEED_WHITELIST : [];
  const seedModules = Array.isArray(zData.SEED_MODULES) ? zData.SEED_MODULES : [];
  const seedLessons = Array.isArray(zData.SEED_LESSONS) ? zData.SEED_LESSONS : [];
  const seedProgress = (zData.SEED_PROGRESS && typeof zData.SEED_PROGRESS === 'object') ? zData.SEED_PROGRESS : {};
  const seedFavorites = (zData.SEED_FAVORITES && typeof zData.SEED_FAVORITES === 'object') ? zData.SEED_FAVORITES : {};
  const seedResources = Array.isArray(zData.SEED_RESOURCES) ? zData.SEED_RESOURCES : [];
  const seedLandingCms = (zData.SEED_LANDING_CMS && typeof zData.SEED_LANDING_CMS === 'object') ? zData.SEED_LANDING_CMS : {};
  const seedActivity = (zData.SEED_ACTIVITY && typeof zData.SEED_ACTIVITY === 'object') ? zData.SEED_ACTIVITY : {};
  const seedQuickActions = Array.isArray(zData.SEED_QUICK_ACTIONS) ? zData.SEED_QUICK_ACTIONS : [];

  AppState.whitelist = Array.isArray(storedWhitelist) ? storedWhitelist : [...seedWhitelist];
  AppState.modules = Array.isArray(storedModules) ? storedModules : [...seedModules];
  AppState.lessons = Array.isArray(storedLessons) ? storedLessons : [...seedLessons];
  AppState.progress = (storedProgress && typeof storedProgress === 'object') ? storedProgress : { ...seedProgress };
  AppState.favorites = (storedFavorites && typeof storedFavorites === 'object') ? storedFavorites : { ...seedFavorites };
  AppState.resources = Array.isArray(storedResources) ? storedResources : [...seedResources];

  const CMS_COPY_VERSION = 'v27_clean_zero_start';
  const storedCmsVer = localStorage.getItem('zett_landing_cms_ver');
  if (storedCmsVer !== CMS_COPY_VERSION) {
    AppState.landingCms = JSON.parse(JSON.stringify(seedLandingCms));
    localStorage.setItem('zett_landing_cms_ver', CMS_COPY_VERSION);
  } else {
    AppState.landingCms = (storedLandingCms && typeof storedLandingCms === 'object' && storedLandingCms.hero && Array.isArray(storedLandingCms.useCases)) 
      ? storedLandingCms 
      : JSON.parse(JSON.stringify(seedLandingCms));
  }

  AppState.activity = (storedActivity && typeof storedActivity === 'object') ? storedActivity : { ...seedActivity };
  AppState.quickActions = (Array.isArray(storedQuickActions) && storedQuickActions.length > 0) ? storedQuickActions : [...seedQuickActions];
  AppState.currentUser = storedUser || null;

  // Jika user yang tersimpan adalah dummy yang sudah dihapus, ganti ke akun Owner Farhan
  if (AppState.currentUser && !AppState.whitelist.some(u => u.email.toLowerCase() === AppState.currentUser.email.toLowerCase())) {
    AppState.currentUser = AppState.whitelist[0] || null;
  }

  saveState();
}

function resetAllDataToZero() {
  showCustomConfirm({
    title: 'Bersihkan Seluruh Data ke 0?',
    message: 'Hapus seluruh data kurikulum, materi, resources, dan progres kembali ke 0 (bersih)? Akun Admin Zettbos akan tetap aman.',
    confirmText: 'Ya, Bersihkan ke 0',
    cancelText: 'Batal',
    isDanger: true,
    onConfirm: () => {
      AppState.modules = [];
      AppState.lessons = [];
      AppState.progress = {};
      AppState.favorites = {};
      AppState.resources = [];
      AppState.activity = {};
      AppState.quickActions = [];
      AppState.whitelist = [
        {
          id: 'owner-1',
          email: 'zettbos2025@gmail.com',
          fullName: 'Owner Zettbos (Super Admin)',
          role: 'admin',
          isActive: true,
          passwordHash: null,
          registeredAt: '2026-10-13'
        }
      ];
      if (AppState.landingCms) {
        AppState.landingCms.testimonials = [];
      }
      AppState.currentUser = AppState.whitelist[0];
      saveState();
      showToast('Seluruh data berhasil dibersihkan kembali ke 0!', 'success');
      if (window.navigate) navigate(AppState.currentView || 'admin');
    }
  });
}
window.resetAllDataToZero = resetAllDataToZero;

// ==========================================
// CRYPTOGRAPHIC UTILITIES & ANTI-INSPECT
// ==========================================

async function hashPassword(plainText) {
  if (!plainText || typeof plainText !== 'string') return '';
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(plainText.trim());
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    console.error('[Security] Gagal melakukan hashing password:', err);
    return '';
  }
}
window.hashPassword = hashPassword;

// Anti-Inspect & Anti-Tampering Protection
(function initAntiInspect() {
  // 1. Blokir Menu Klik Kanan
  document.addEventListener('contextmenu', e => {
    e.preventDefault();
    return false;
  });

  // 2. Blokir Shortcut DevTools (F12, Ctrl+Shift+I/J/C, Ctrl+U)
  document.addEventListener('keydown', e => {
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      return false;
    }
    if (e.ctrlKey && e.shiftKey && ['I','i','J','j','C','c'].includes(e.key)) {
      e.preventDefault();
      return false;
    }
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
      e.preventDefault();
      return false;
    }
  });

  // 3. Security Warning di Console
  try {
    console.log(
      '%c⛔ STOP! AREA DILINDUNGI SISTEM ZETTBOS LMS',
      'color: #ef4444; font-size: 22px; font-weight: 900; -webkit-text-stroke: 1px black;'
    );
    console.log(
      '%cSeluruh aktivitas, hak akses materi kurikulum, dan data di konsol ini diawasi secara ketat. Dilarang keras memodifikasi hak akses.',
      'color: #94a3b8; font-size: 13px;'
    );
  } catch (err) {}
})();

function saveState() {
  localStorage.setItem('zett_whitelist', JSON.stringify(AppState.whitelist));
  localStorage.setItem('zett_modules', JSON.stringify(AppState.modules));
  localStorage.setItem('zett_lessons', JSON.stringify(AppState.lessons));
  localStorage.setItem('zett_progress', JSON.stringify(AppState.progress));
  localStorage.setItem('zett_favorites', JSON.stringify(AppState.favorites));
  localStorage.setItem('zett_resources', JSON.stringify(AppState.resources));
  localStorage.setItem('zett_landing_cms', JSON.stringify(AppState.landingCms));
  localStorage.setItem('zett_activity', JSON.stringify(AppState.activity));
  localStorage.setItem('zett_quick_actions', JSON.stringify(AppState.quickActions));
  if (AppState.currentUser) {
    localStorage.setItem('zett_current_user', JSON.stringify(AppState.currentUser));
  } else {
    localStorage.removeItem('zett_current_user');
  }
}

// ==========================================
// CUSTOM CONFIRMATION MODAL (ZERO BROWSER POPUPS)
// ==========================================

let customConfirmCallback = null;

function showCustomConfirm({
  title = 'Konfirmasi Tindakan',
  message = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  isDanger = true,
  onConfirm
} = {}) {
  const modal = document.getElementById('modal-custom-confirm');
  if (!modal) {
    if (confirm(message)) {
      if (typeof onConfirm === 'function') onConfirm();
    }
    return;
  }

  const titleEl = document.getElementById('confirm-modal-title');
  const msgEl = document.getElementById('confirm-modal-message');
  const actionBtn = document.getElementById('confirm-modal-btn-action');
  const cancelBtn = document.getElementById('confirm-modal-btn-cancel');
  const iconContainer = document.getElementById('confirm-modal-icon-container');

  if (titleEl) titleEl.textContent = title;
  if (msgEl) msgEl.textContent = message;
  if (cancelBtn) cancelBtn.textContent = cancelText;

  if (actionBtn) {
    actionBtn.textContent = confirmText;
    if (isDanger) {
      actionBtn.className = 'w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/60 transition-colors';
    } else {
      actionBtn.className = 'w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/60 transition-colors';
    }
  }

  if (iconContainer) {
    if (isDanger) {
      iconContainer.className = 'w-12 h-12 rounded-2xl bg-rose-950/70 border border-rose-800/80 text-rose-400 mx-auto flex items-center justify-center mb-4';
    } else {
      iconContainer.className = 'w-12 h-12 rounded-2xl bg-amber-950/70 border border-amber-800/80 text-amber-400 mx-auto flex items-center justify-center mb-4';
    }
  }

  customConfirmCallback = onConfirm;
  modal.classList.remove('hidden');
}
window.showCustomConfirm = showCustomConfirm;

function closeCustomConfirmModal(isConfirmed) {
  const modal = document.getElementById('modal-custom-confirm');
  if (modal) modal.classList.add('hidden');
  if (isConfirmed && typeof customConfirmCallback === 'function') {
    customConfirmCallback();
  }
  customConfirmCallback = null;
}
window.closeCustomConfirmModal = closeCustomConfirmModal;

function resetAllToDefault() {
  showCustomConfirm({
    title: 'Reset ke Data Bawaan Awal?',
    message: 'Kembalikan seluruh data materi kurikulum, whitelist, dan progres belajar ke kondisi awal bawaan?',
    confirmText: 'Ya, Reset ke Awal',
    cancelText: 'Batal',
    isDanger: true,
    onConfirm: () => {
      localStorage.clear();
      initStorage();
      showToast('Data berhasil di-reset ke kondisi awal!', 'info');
      if (window.navigate) window.navigate('home');
    }
  });
}
window.resetAllToDefault = resetAllToDefault;

function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast-item ${type}`;

  let icon = `<svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
  if (type === 'success') icon = `<svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`;
  if (type === 'error') icon = `<svg class="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;

  toast.innerHTML = `
    <span class="flex-shrink-0 flex items-center">${icon}</span>
    <span class="flex-1">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getMonolineSvgIcon(iconName, customClass = 'w-4 h-4 text-emerald-400') {
  switch (iconName) {
    case 'folder':
      return `<svg class="${customClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>`;
    case 'calendar':
      return `<svg class="${customClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`;
    case 'bookmark':
      return `<svg class="${customClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>`;
    case 'chat':
      return `<svg class="${customClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>`;
    case 'code':
      return `<svg class="${customClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>`;
    case 'sparkles':
      return `<svg class="${customClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.286L13 21l-2.286-6.857L5 12l5.714-2.286L13 3z"/></svg>`;
    case 'play':
      return `<svg class="${customClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
    case 'briefcase':
      return `<svg class="${customClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`;
    case 'chart':
      return `<svg class="${customClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`;
    case 'users':
      return `<svg class="${customClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`;
    default:
      return `<svg class="${customClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`;
  }
}

const ThemeController = {
  SUN_SVG: `<svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path stroke-linecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m14.14-14.14l-1.41 1.41"/></svg>`,
  MOON_SVG: `<svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>`,

  getTheme() {
    try {
      return localStorage.getItem('zett_theme') || 'dark';
    } catch (e) {
      return 'dark';
    }
  },

  applyTheme(theme) {
    const isLight = theme === 'light';
    const root = document.documentElement;

    if (isLight) {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }

    try {
      localStorage.setItem('zett_theme', theme);
    } catch (e) {}

    this.updateUI(theme);
  },

  toggleTheme() {
    const current = this.getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    this.applyTheme(next);
    showToast(next === 'light' ? 'Mode Terang (Light Mode) aktif' : 'Mode Gelap (Dark Mode) aktif', 'info');
  },

  updateUI(theme) {
    const isDark = theme === 'dark';
    const iconSvg = isDark ? this.SUN_SVG : this.MOON_SVG;
    const tooltipText = isDark ? 'Beralih ke Mode Terang (Light Mode)' : 'Beralih ke Mode Gelap (Dark Mode)';

    const navBtn = document.getElementById('nav-btn-theme-toggle');
    const navIcon = document.getElementById('nav-theme-icon');
    if (navBtn) navBtn.title = tooltipText;
    if (navIcon) navIcon.innerHTML = iconSvg;

    const drawerIcon = document.getElementById('drawer-theme-icon');
    const drawerLabel = document.getElementById('drawer-theme-label');
    if (drawerIcon) drawerIcon.innerHTML = iconSvg;
    if (drawerLabel) {
      drawerLabel.textContent = isDark ? 'DARK' : 'LIGHT';
      drawerLabel.className = isDark 
        ? 'px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700'
        : 'px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300';
    }

    const landingBtn = document.getElementById('landing-btn-theme-toggle');
    const landingIcon = document.getElementById('landing-theme-icon');
    if (landingBtn) landingBtn.title = tooltipText;
    if (landingIcon) landingIcon.innerHTML = iconSvg;
  }
};

function toggleTheme() {
  ThemeController.toggleTheme();
}

function initTheme() {
  const current = ThemeController.getTheme();
  ThemeController.applyTheme(current);
}

// Global window bindings
window.initStorage = initStorage;
window.saveState = saveState;
window.resetAllToDefault = resetAllToDefault;
window.showToast = showToast;
window.escapeHtml = escapeHtml;
window.getMonolineSvgIcon = getMonolineSvgIcon;
window.ThemeController = ThemeController;
window.toggleTheme = toggleTheme;
window.initTheme = initTheme;
