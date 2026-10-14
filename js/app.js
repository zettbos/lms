/**
 * Zettbos LMS - Main Application Orchestrator
 * js/app.js
 * Bertindak sebagai entry-point dan orchestrator utama yang menyelaraskan
 * seluruh modul (Core State, Router, Particles, Auth, Landing, Classroom, Resources, Admin).
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Theme (Dark / Light)
  if (typeof initTheme === 'function') {
    initTheme();
  }

  // 2. Initialize Persistent Storage & State
  if (typeof initStorage === 'function') {
    initStorage();
  }

  // 2B. Initialize Brand Logo (Google Drive / Custom URL or default [ZB] badge)
  if (typeof renderAppBrandLogo === 'function') {
    renderAppBrandLogo();
  }

  // 2C. Initialize Supabase Cloud Engine & Auto-Sync Curriculum for all users
  if (window.ZettSupabase && typeof window.ZettSupabase.init === 'function') {
    const isReady = window.ZettSupabase.init();
    if (isReady && typeof window.ZettSupabase.syncCurriculumFromCloud === 'function') {
      window.ZettSupabase.syncCurriculumFromCloud(true);
    }
  }

  // 3. Setup OTP Modal listeners
  if (typeof setupOtpInputListeners === 'function') {
    setupOtpInputListeners();
  }

  // 4. Setup Floating Pill scroll watcher
  if (typeof setupFloatingPillScrollListener === 'function') {
    setupFloatingPillScrollListener();
  }

  // 5. Initialize Cyber Particle Background Engine
  if (window.ZettParticleEngine && typeof window.ZettParticleEngine.init === 'function') {
    window.ZettParticleEngine.init();
  }

  // 6. Initial Route Decision
  if (typeof navigate === 'function') {
    if (window.AppState && window.AppState.currentUser) {
      navigate('home');
    } else {
      navigate('landing');
    }
  }

  // 7. Initialize Landing Scroll UX (Progress Bar & Scroll Reveal) (Revisi 60)
  if (typeof initLandingScrollProgress === 'function') {
    initLandingScrollProgress();
  }
  if (typeof initLandingScrollReveal === 'function') {
    initLandingScrollReveal();
  }

  // 8. Elegant Dismissal of Initial Boot Loader (Revisi 60)
  const bootLoader = document.getElementById('app-boot-loader');
  if (bootLoader) {
    setTimeout(() => {
      bootLoader.classList.add('boot-loader-finish');
      setTimeout(() => {
        bootLoader.style.display = 'none';
      }, 450);
    }, 350);
  }
});
