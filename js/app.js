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

  // 2B. Initialize Supabase Cloud Engine (Auto-connect or Local fallback)
  if (window.ZettSupabase && typeof window.ZettSupabase.init === 'function') {
    window.ZettSupabase.init();
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
});
