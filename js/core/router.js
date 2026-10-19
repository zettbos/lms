/**
 * Zettbos LMS - Router & Navigation Controller
 * js/core/router.js
 */

function toggleSidebarDrawer() {
  const isDesktop = window.innerWidth >= 1024;
  if (isDesktop) {
    const isExpanded = document.body.classList.contains('sidebar-desktop-open');
    if (isExpanded) {
      document.body.classList.remove('sidebar-desktop-open');
      localStorage.setItem('sidebar_desktop_collapsed', '1');
    } else {
      document.body.classList.add('sidebar-desktop-open');
      localStorage.setItem('sidebar_desktop_collapsed', '0');
    }
  } else {
    const drawer = document.getElementById('sidebar-drawer');
    const overlay = document.getElementById('sidebar-drawer-overlay');
    if (!drawer) return;
    const isHidden = drawer.classList.contains('hidden');
    if (isHidden) {
      openSidebarDrawer();
    } else {
      closeSidebarDrawer();
    }
  }
}

function openSidebarDrawer() {
  const isDesktop = window.innerWidth >= 1024;
  if (isDesktop) {
    document.body.classList.add('sidebar-desktop-open');
    localStorage.setItem('sidebar_desktop_collapsed', '0');
  } else {
    const drawer = document.getElementById('sidebar-drawer');
    const overlay = document.getElementById('sidebar-drawer-overlay');
    if (drawer) drawer.classList.remove('hidden');
    if (overlay) overlay.classList.remove('hidden');
  }
  updateDrawerState();
}

function closeSidebarDrawer() {
  const isDesktop = window.innerWidth >= 1024;
  if (isDesktop) {
    document.body.classList.remove('sidebar-desktop-open');
    localStorage.setItem('sidebar_desktop_collapsed', '1');
  } else {
    const drawer = document.getElementById('sidebar-drawer');
    const overlay = document.getElementById('sidebar-drawer-overlay');
    if (drawer) drawer.classList.add('hidden');
    if (overlay) overlay.classList.add('hidden');
  }
}

function handleDrawerNavClick(viewName, event) {
  if (event && (event.metaKey || event.ctrlKey || event.button === 1)) {
    // Biarkan browser membuka tab baru secara native jika menekan Ctrl/Cmd atau Middle-Click
    return;
  }
  if (event && typeof event.preventDefault === 'function') {
    event.preventDefault();
  }
  navigate(viewName);
  if (window.innerWidth < 1024) {
    closeSidebarDrawer();
  }
}

function updateDrawerState() {
  const user = AppState.currentUser;
  const drawerUserName = document.getElementById('drawer-user-name');
  const drawerUserRole = document.getElementById('drawer-user-role');
  const drawerAdminSec = document.getElementById('drawer-admin-section');
  if (user) {
    const isSuperAdmin = user.email && user.email.toLowerCase() === 'zettbos2025@gmail.com';
    const isAdmin = isSuperAdmin || user.role === 'admin';
    if (drawerUserName) drawerUserName.textContent = user.fullName || user.email;
    if (drawerUserRole) {
      drawerUserRole.textContent = isSuperAdmin ? 'OWNER / SUPER ADMIN' : (isAdmin ? 'ADMIN LMS' : 'MEMBER SISWA');
      drawerUserRole.className = isAdmin ? 'text-[10px] text-rose-400 font-mono font-bold' : 'text-[10px] text-emerald-400 font-mono font-bold';
    }
    if (drawerAdminSec) {
      if (isAdmin) drawerAdminSec.classList.remove('hidden');
      else drawerAdminSec.classList.add('hidden');
    }
  }

  // Highlight active drawer item
  const currentView = AppState.currentView;
  const drawerMap = {
    'home': 'drawer-btn-home',
    'user-dashboard': 'drawer-btn-dashboard',
    'learn': 'drawer-btn-learn',
    'resources': 'drawer-btn-resources',
    'showcase': 'drawer-btn-showcase',
    'favorites': 'drawer-btn-favorites',
    'admin': 'drawer-btn-admin'
  };

  const isLight = document.documentElement.classList.contains('light');
  const activeDrawerClass = isLight
    ? 'w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-400/80 shadow-sm flex items-center gap-3 transition-all'
    : 'w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 shadow-sm flex items-center gap-3 transition-all';

  const inactiveDrawerClass = isLight
    ? 'w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all flex items-center gap-3'
    : 'w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all flex items-center gap-3';

  Object.entries(drawerMap).forEach(([viewKey, btnId]) => {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.className = (currentView === viewKey) ? activeDrawerClass : inactiveDrawerClass;
    }
  });
}

function navigate(viewName, params = {}) {
  // Always close mobile menu popover if open
  if (typeof closeMobileMenuPopover === 'function') closeMobileMenuPopover();

  // Aliases
  if (viewName === 'dashboard') viewName = 'user-dashboard';

  // Hide all view containers
  const views = ['view-landing', 'view-login', 'view-home', 'view-user-dashboard', 'view-learn', 'view-favorites', 'view-resources', 'view-showcase', 'view-admin'];
  views.forEach(v => {
    const el = document.getElementById(v);
    if (el) el.classList.add('hidden');
  });

  // Strict Auth & Admin Route Guard
  if (!AppState.currentUser && viewName !== 'login' && viewName !== 'landing') {
    viewName = 'landing';
  }

  if (viewName === 'admin') {
    const user = AppState.currentUser;
    const isSuperAdmin = user && user.email && user.email.toLowerCase() === 'zettbos2025@gmail.com';
    const isAdmin = isSuperAdmin || (user && user.role === 'admin');
    if (!isAdmin) {
      if (typeof showToast === 'function') {
        showToast('Akses Ditolak! Halaman ini dilindungi khusus Administrator & Owner Zettbos.', 'error');
      }
      viewName = user ? 'home' : 'landing';
    }
  }

  AppState.currentView = viewName;

  // Hide floating pill if leaving learn room
  const pill = document.getElementById('floating-progress-pill');
  if (pill && viewName !== 'learn') {
    pill.classList.remove('visible-pill');
    pill.classList.add('hidden-pill');
  }

  // Navbar visibility & user badge update
  updateNavbarState(viewName);
  updateDrawerState();

  const targetView = document.getElementById('view-' + viewName);
  if (targetView) {
    targetView.classList.remove('hidden');
    targetView.classList.remove('animate-page-enter');
    void targetView.offsetWidth; // Force DOM reflow for smooth re-trigger
    targetView.classList.add('animate-page-enter');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Manage Desktop Push Sidebar auto-docking
  if (viewName !== 'landing' && viewName !== 'login') {
    if (window.innerWidth >= 1024) {
      const isCollapsed = localStorage.getItem('sidebar_desktop_collapsed') === '1';
      if (!isCollapsed) {
        document.body.classList.add('sidebar-desktop-open');
      } else {
        document.body.classList.remove('sidebar-desktop-open');
      }
    }
  } else {
    document.body.classList.remove('sidebar-desktop-open');
  }

  // Render view-specific content
  if (viewName === 'landing') {
    if (window.renderLandingFromCms) window.renderLandingFromCms();
    if (window.renderLandingCurriculumBento) window.renderLandingCurriculumBento();
    if (window.HeroTypewriterController) {
      window.HeroTypewriterController.init();
    }
  } else {
    if (window.HeroTypewriterController) {
      window.HeroTypewriterController.stop();
    }
    if (viewName === 'home') {
      if (window.renderHome) window.renderHome();
    } else if (viewName === 'user-dashboard') {
      if (window.renderUserDashboard) window.renderUserDashboard();
    } else if (viewName === 'learn') {
      const lessonId = params.lessonId;
      if (lessonId) {
        if (window.renderLearningRoom) window.renderLearningRoom(lessonId);
      } else {
        if (window.showLearnModulesCatalog) {
          window.showLearnModulesCatalog();
        } else if (window.renderLearningRoom) {
          window.renderLearningRoom(AppState.currentLessonId || AppState.lessons[0]?.id);
        }
      }
    } else if (viewName === 'resources') {
      if (window.renderResources) window.renderResources();
      if (typeof window.pullZettLinkFromCloudLive === 'function') {
        window.pullZettLinkFromCloudLive(true);
      }
    } else if (viewName === 'showcase') {
      if (window.renderShowcase) window.renderShowcase();
      if (typeof window.pullShowcaseFromCloudLive === 'function') {
        window.pullShowcaseFromCloudLive(true);
      }
    } else if (viewName === 'favorites') {
      if (window.renderFavorites) window.renderFavorites();
    } else if (viewName === 'admin') {
      if (window.renderAdminPanel) window.renderAdminPanel();
    }
  }

  // Sync browser URL hash for native Open in New Tab & bookmarks
  if (viewName !== 'landing' && viewName !== 'login') {
    const hashTarget = viewName === 'user-dashboard' ? 'dashboard' : viewName;
    if (window.location.hash !== '#' + hashTarget) {
      window.history.replaceState(null, '', '#' + hashTarget);
    }
  }
}

function updateNavbarState(currentView) {
  const navbar = document.getElementById('main-navbar');
  const userSection = document.getElementById('nav-user-section');
  const roleBadge = document.getElementById('nav-role-badge');
  const userNameEl = document.getElementById('nav-user-name');
  const modeSwitchBtn = document.getElementById('nav-mode-switch');
  const mobileBottomNav = document.getElementById('mobile-bottom-nav');
  const centerLabel = document.getElementById('nav-current-page-label');

  if (currentView === 'login' || currentView === 'landing') {
    if (navbar) navbar.classList.add('hidden');
    if (mobileBottomNav) mobileBottomNav.classList.add('hidden');
    return;
  }

  if (navbar) navbar.classList.remove('hidden');
  if (mobileBottomNav) mobileBottomNav.classList.remove('hidden');

  // Update center active page breadcrumb
  if (centerLabel) {
    const labels = {
      'home': 'Kurikulum',
      'user-dashboard': 'Data Belajar',
      'learn': 'Modul Pembelajaran',
      'resources': 'ZettLink',
      'showcase': 'ZettGallery',
      'favorites': 'Koleksi Favorit',
      'admin': 'Admin Panel'
    };
    centerLabel.textContent = labels[currentView] || 'Member Hub';
  }

  // Update mobile bottom nav active classes
  const mHome = document.getElementById('mobile-nav-home');
  const mDash = document.getElementById('mobile-nav-dashboard');
  const mLearn = document.getElementById('mobile-nav-learn');
  const mRes = document.getElementById('mobile-nav-resources');
  const mMenu = document.getElementById('mobile-nav-menu');
  const mUser = document.getElementById('mobile-popover-user');
  const mTheme = document.getElementById('mobile-theme-label');
  const mAdminBtn = document.getElementById('mobile-menu-admin-btn');

  const resetMobileBtn = (el) => {
    if (!el) return;
    el.className = 'flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl text-slate-400 hover:text-white transition-colors';
  };
  const setMobileActive = (el, colorClass) => {
    if (!el) return;
    el.className = `flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl font-bold transition-colors ${colorClass}`;
  };

  resetMobileBtn(mHome);
  resetMobileBtn(mDash);
  resetMobileBtn(mLearn);
  resetMobileBtn(mRes);
  resetMobileBtn(mMenu);

  if (currentView === 'home') setMobileActive(mHome, 'text-emerald-400');
  else if (currentView === 'user-dashboard') setMobileActive(mDash, 'text-cyan-400');
  else if (currentView === 'learn') setMobileActive(mLearn, 'text-emerald-400');
  else if (currentView === 'resources') setMobileActive(mRes, 'text-blue-400');
  else if (currentView === 'showcase' || currentView === 'favorites' || currentView === 'admin') setMobileActive(mMenu, 'text-emerald-400');

  // Update theme label inside mobile popover
  if (mTheme) {
    const isLight = document.documentElement.classList.contains('light');
    mTheme.textContent = isLight ? 'LIGHT' : 'DARK';
  }

  if (AppState.currentUser) {
    if (userSection) userSection.classList.remove('hidden');
    if (userNameEl) userNameEl.textContent = AppState.currentUser.fullName || AppState.currentUser.email;
    if (mUser) mUser.textContent = AppState.currentUser.fullName || AppState.currentUser.email;

    const isSuperAdmin = AppState.currentUser.email && AppState.currentUser.email.toLowerCase() === 'zettbos2025@gmail.com';
    const isAdmin = isSuperAdmin || AppState.currentUser.role === 'admin';
    if (mAdminBtn) {
      if (isAdmin) mAdminBtn.classList.remove('hidden');
      else mAdminBtn.classList.add('hidden');
    }

    if (isAdmin) {
      if (roleBadge) {
        roleBadge.textContent = isSuperAdmin ? 'OWNER' : 'ADMIN';
        roleBadge.className = isSuperAdmin
          ? 'px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-amber-950 text-amber-300 border border-amber-800/80'
          : 'px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-rose-950 text-rose-300 border border-rose-800/80';
      }
      if (modeSwitchBtn) modeSwitchBtn.classList.remove('nav-hidden');
    } else {
      if (roleBadge) {
        roleBadge.textContent = 'MEMBER';
        roleBadge.className = 'px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800/80';
      }
      if (modeSwitchBtn) modeSwitchBtn.classList.add('nav-hidden');
    }
  } else {
    if (userSection) userSection.classList.add('hidden');
  }
}

// Mobile Bottom Nav Elevated Popover Handlers (Gambar 4)
function toggleMobileMenuPopover() {
  const popover = document.getElementById('mobile-menu-popover');
  const backdrop = document.getElementById('mobile-menu-backdrop');
  if (!popover) return;
  const isHidden = popover.classList.contains('hidden');
  if (isHidden) {
    popover.classList.remove('hidden');
    if (backdrop) backdrop.classList.remove('hidden');
  } else {
    popover.classList.add('hidden');
    if (backdrop) backdrop.classList.add('hidden');
  }
}

function closeMobileMenuPopover() {
  const popover = document.getElementById('mobile-menu-popover');
  const backdrop = document.getElementById('mobile-menu-backdrop');
  if (popover) popover.classList.add('hidden');
  if (backdrop) backdrop.classList.add('hidden');
}

function handleMobilePopoverNav(viewName) {
  closeMobileMenuPopover();
  navigate(viewName);
}

// Window bindings
window.toggleSidebarDrawer = toggleSidebarDrawer;
window.openSidebarDrawer = openSidebarDrawer;
window.closeSidebarDrawer = closeSidebarDrawer;
window.handleDrawerNavClick = handleDrawerNavClick;
window.updateDrawerState = updateDrawerState;
window.navigate = navigate;
window.updateNavbarState = updateNavbarState;
window.toggleMobileMenuPopover = toggleMobileMenuPopover;
window.closeMobileMenuPopover = closeMobileMenuPopover;
window.handleMobilePopoverNav = handleMobilePopoverNav;

// Hashchange listener for native new tabs and browser back/forward buttons (Revisi 90)
window.addEventListener('hashchange', () => {
  let hash = window.location.hash.replace('#', '').trim();
  if (hash) {
    if (hash === 'dashboard') hash = 'user-dashboard';
    if (hash !== AppState.currentView && AppState.currentUser) {
      navigate(hash);
    }
  }
});
