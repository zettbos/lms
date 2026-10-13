/**
 * Zettbos LMS - Supabase Universal Client & Dual-Sync Engine
 * js/core/supabase.js
 * Menghubungkan LMS ke database cloud PostgreSQL Supabase (tampilan mirip Google Sheets).
 * Menyediakan fallback anggun ke LocalStorage saat offline / belum di-setup.
 */

const ZettSupabase = {
  client: null,
  isInitialized: false,

  getConfig() {
    const DEFAULT_URL = 'https://dtbbmpuqfstwxewylbao.supabase.co';
    const DEFAULT_KEY = 'sb_publishable_QX8Kjj5QukJXXqXcIILp5w_Dye0avf1';
    return {
      url: localStorage.getItem('zett_supabase_url') || DEFAULT_URL,
      anonKey: localStorage.getItem('zett_supabase_anon_key') || DEFAULT_KEY
    };
  },

  setConfig(url, anonKey) {
    if (url) localStorage.setItem('zett_supabase_url', url.trim());
    else localStorage.removeItem('zett_supabase_url');

    if (anonKey) localStorage.setItem('zett_supabase_anon_key', anonKey.trim());
    else localStorage.removeItem('zett_supabase_anon_key');

    return this.init();
  },

  init() {
    const { url, anonKey } = this.getConfig();

    if (!url || !anonKey) {
      this.client = null;
      this.isInitialized = false;
      this.updateStatusBadge();
      return false;
    }

    try {
      if (window.supabase && typeof window.supabase.createClient === 'function') {
        this.client = window.supabase.createClient(url, anonKey);
        this.isInitialized = true;
        this.updateStatusBadge();
        return true;
      } else {
        console.warn('[ZettSupabase] Supabase JS CDN belum dimuat, fallback ke LocalStorage');
        this.client = null;
        this.isInitialized = false;
        this.updateStatusBadge();
        return false;
      }
    } catch (e) {
      console.error('[ZettSupabase] Gagal inisialisasi client:', e);
      this.client = null;
      this.isInitialized = false;
      this.updateStatusBadge();
      return false;
    }
  },

  isConnected() {
    return this.isInitialized && this.client !== null;
  },

  updateStatusBadge() {
    const badge = document.getElementById('supabase-connection-status');
    const label = document.getElementById('supabase-status-label');
    if (!badge || !label) return;

    if (this.isConnected()) {
      badge.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse';
      label.textContent = 'Supabase Terhubung (Live Cloud)';
      label.className = 'text-[11px] font-mono text-emerald-400 font-bold';
    } else {
      badge.className = 'w-2 h-2 rounded-full bg-amber-400';
      label.textContent = 'Mode Lokal (LocalStorage Standalone)';
      label.className = 'text-[11px] font-mono text-amber-400';
    }
  },

  async testConnection() {
    if (!this.isConnected()) {
      showToast('Kredensial Supabase belum diisi. Masukkan URL & Anon Key.', 'error');
      return false;
    }

    try {
      const { data, error } = await this.client.from('curriculum_modules').select('id').limit(1);
      if (error) throw error;
      showToast('Koneksi Supabase berhasil & database siap digunakan!', 'success');
      return true;
    } catch (e) {
      console.error('[ZettSupabase Test Error]', e);
      showToast(`Koneksi gagal: ${e.message || 'Periksa URL dan Anon Key'}`, 'error');
      return false;
    }
  },

  async pullAllData() {
    if (!this.isConnected()) return false;

    try {
      showToast('Menyinkronkan data dari Supabase...', 'info');

      // 1. Pull Modules
      const { data: mods, error: modErr } = await this.client.from('curriculum_modules').select('*').order('order_index');
      if (!modErr && Array.isArray(mods) && mods.length > 0) {
        AppState.modules = mods.map(m => ({
          id: m.id,
          title: m.title,
          description: m.description,
          category: m.category,
          badge: m.badge,
          coverImage: m.cover_image,
          orderIndex: m.order_index,
          isLocked: m.is_locked,
          lockReason: m.lock_reason,
          isPinned: !!m.is_pinned
        }));
      }

      // 2. Pull Lessons
      const { data: less, error: lesErr } = await this.client.from('curriculum_lessons').select('*').order('order_index');
      if (!lesErr && Array.isArray(less) && less.length > 0) {
        AppState.lessons = less.map(l => ({
          id: l.id,
          moduleId: l.module_id,
          title: l.title,
          youtubeUrl: l.youtube_url,
          durationMinutes: l.duration_minutes,
          orderIndex: l.order_index,
          blocks: l.blocks || []
        }));
      }

      // 3. Pull Whitelist
      const { data: wl, error: wlErr } = await this.client.from('whitelist_members').select('*');
      if (!wlErr && Array.isArray(wl) && wl.length > 0) {
        AppState.whitelist = wl.map(w => ({
          id: w.id,
          email: w.email,
          fullName: w.full_name,
          role: w.role,
          isActive: w.is_active,
          passwordHash: w.password_hash || null,
          registeredAt: w.registered_at
        }));
      }

      // 4. Pull Resources
      const { data: res, error: resErr } = await this.client.from('shared_resources').select('*');
      if (!resErr && Array.isArray(res) && res.length > 0) {
        AppState.resources = res.map(r => ({
          id: r.id,
          title: r.title,
          description: r.description,
          url: r.url,
          category: r.category,
          badge: r.badge,
          date: r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID') : '-'
        }));
      }

      // 5. Pull Landing CMS
      const { data: cms, error: cmsErr } = await this.client.from('landing_cms').select('*').eq('id', 'active_cms').single();
      if (!cmsErr && cms && cms.hero) {
        AppState.landingCms = {
          hero: cms.hero,
          useCases: cms.use_cases || [],
          testimonials: cms.testimonials || []
        };
      }

      saveState();
      showToast('Sinkronisasi cloud Supabase berhasil!', 'success');

      // Refresh current view
      if (typeof navigate === 'function') {
        navigate(AppState.currentView || 'home');
      }

      return true;
    } catch (e) {
      console.error('[ZettSupabase Pull Error]', e);
      showToast('Gagal menarik data cloud: ' + (e.message || 'Koneksi error'), 'error');
      return false;
    }
  },

  async pushAllLocalDataToSupabase() {
    if (!this.isConnected()) {
      showToast('Harap hubungkan Supabase terlebih dahulu', 'error');
      return false;
    }

    try {
      showToast('Mengunggah data lokal ke Supabase...', 'info');

      // 1. Push Modules
      if (Array.isArray(AppState.modules) && AppState.modules.length > 0) {
        const payloadMods = AppState.modules.map(m => ({
          id: m.id,
          title: m.title,
          description: m.description,
          category: m.category,
          badge: m.badge,
          cover_image: m.coverImage,
          order_index: m.orderIndex,
          is_locked: m.isLocked,
          lock_reason: m.lockReason
        }));
        await this.client.from('curriculum_modules').upsert(payloadMods, { onConflict: 'id' });
      }

      // 2. Push Lessons
      if (Array.isArray(AppState.lessons) && AppState.lessons.length > 0) {
        const payloadLess = AppState.lessons.map(l => ({
          id: l.id,
          module_id: l.moduleId,
          title: l.title,
          youtube_url: l.youtubeUrl,
          duration_minutes: l.durationMinutes,
          order_index: l.orderIndex,
          blocks: l.blocks || []
        }));
        await this.client.from('curriculum_lessons').upsert(payloadLess, { onConflict: 'id' });
      }

      // 3. Push Whitelist
      if (Array.isArray(AppState.whitelist) && AppState.whitelist.length > 0) {
        const payloadWl = AppState.whitelist.map(w => ({
          id: w.id,
          email: w.email,
          full_name: w.fullName,
          role: w.role,
          is_active: w.isActive,
          password_hash: w.passwordHash || null
        }));
        await this.client.from('whitelist_members').upsert(payloadWl, { onConflict: 'email' });
      }

      // 4. Push Resources
      if (Array.isArray(AppState.resources) && AppState.resources.length > 0) {
        const payloadRes = AppState.resources.map(r => ({
          id: r.id,
          title: r.title,
          description: r.description,
          url: r.url,
          category: r.category,
          badge: r.badge
        }));
        await this.client.from('shared_resources').upsert(payloadRes, { onConflict: 'id' });
      }

      // 5. Push Landing CMS
      if (AppState.landingCms && AppState.landingCms.hero) {
        await this.client.from('landing_cms').upsert({
          id: 'active_cms',
          hero: AppState.landingCms.hero,
          use_cases: AppState.landingCms.useCases || [],
          testimonials: AppState.landingCms.testimonials || [],
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      }

      // 6. Push Quick Actions Hub
      if (Array.isArray(AppState.quickActions) && AppState.quickActions.length > 0) {
        const payloadQa = AppState.quickActions.map((q, idx) => ({
          id: q.id,
          title: q.title,
          subtitle: q.subtitle || '',
          icon: q.icon || 'folder',
          badge: q.badge || 'Akses',
          action_type: q.actionType || 'navigate',
          target: q.target || '',
          order_index: idx + 1
        }));
        await this.client.from('quick_actions').upsert(payloadQa, { onConflict: 'id' });
      }

      showToast('Seluruh data berhasil tersinkron ke tabel Supabase!', 'success');
      return true;
    } catch (e) {
      console.error('[ZettSupabase Push Error]', e);
      showToast('Gagal upload ke cloud: ' + (e.message || 'Cek konsol'), 'error');
      return false;
    }
  },

  async syncCurriculumFromCloud(silent = true) {
    if (!this.isConnected()) return false;
    try {
      // 1. Fetch modules ordered by order_index
      const { data: mods, error: modErr } = await this.client
        .from('curriculum_modules')
        .select('*')
        .order('order_index');

      // 2. Fetch lessons ordered by order_index
      const { data: less, error: lesErr } = await this.client
        .from('curriculum_lessons')
        .select('*')
        .order('order_index');

      let hasChanges = false;

      // Pertahankan draft lokal yang belum di-publish ke Supabase
      const localDraftMods = (AppState.modules || []).filter(m => m.isDraft);
      const localDraftLess = (AppState.lessons || []).filter(l => l.isDraft);

      if (!modErr && Array.isArray(mods) && mods.length > 0) {
        const cloudMods = mods.map(m => ({
          id: m.id,
          title: m.title,
          description: m.description,
          category: m.category || 'ai',
          badge: m.badge || 'MODUL',
          coverImage: m.cover_image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
          orderIndex: m.order_index || 1,
          isLocked: !!m.is_locked,
          lockReason: m.lock_reason || '',
          isDraft: false
        }));

        const draftsToKeep = localDraftMods.filter(dm => !cloudMods.some(cm => cm.id === dm.id));
        AppState.modules = [...cloudMods, ...draftsToKeep];
        hasChanges = true;
      }

      if (!lesErr && Array.isArray(less) && less.length > 0) {
        const cloudLessons = less.map(l => ({
          id: l.id,
          moduleId: l.module_id,
          title: l.title,
          youtubeUrl: l.youtube_url || '',
          durationMinutes: l.duration_minutes || 15,
          orderIndex: l.order_index || 1,
          blocks: l.blocks || [],
          isDraft: false
        }));

        const draftsToKeep = localDraftLess.filter(dl => !cloudLessons.some(cl => cl.id === dl.id));
        AppState.lessons = [...cloudLessons, ...draftsToKeep];
        hasChanges = true;
      }

      // 3. Fetch Quick Actions
      const { data: qas, error: qaErr } = await this.client
        .from('quick_actions')
        .select('*')
        .order('order_index');

      if (!qaErr && Array.isArray(qas) && qas.length > 0) {
        AppState.quickActions = qas.map(q => ({
          id: q.id,
          title: q.title,
          subtitle: q.subtitle,
          icon: q.icon || 'folder',
          badge: q.badge || 'Akses',
          actionType: q.action_type || 'navigate',
          target: q.target || '',
          orderIndex: q.order_index || 1
        }));
        hasChanges = true;
      }

      if (hasChanges) {
        saveState();
        if (!silent && typeof showToast === 'function') {
          showToast('Kurikulum Cloud berhasil disinkronkan ke layar!', 'success');
        }
        // Auto re-render active view
        if (AppState.currentView === 'home') {
          if (typeof renderHome === 'function') renderHome();
          if (typeof renderQuickActionHub === 'function') renderQuickActionHub();
        }
        else if (AppState.currentView === 'admin') {
          if (typeof renderAdminCurriculum === 'function') renderAdminCurriculum();
          if (typeof renderAdminQuickActions === 'function') renderAdminQuickActions();
        }
        else if (AppState.currentView === 'landing' && typeof renderLandingCurriculumBento === 'function') renderLandingCurriculumBento();
        else if (AppState.currentView === 'learn' && typeof renderLearningRoom === 'function') renderLearningRoom(AppState.currentLessonId);
      }
      return true;
    } catch (e) {
      console.warn('[ZettSupabase Auto-Sync Curriculum Error]', e);
      return false;
    }
  },

  async syncCurriculumToCloudLive(showNotification = true) {
    if (!this.isConnected()) {
      if (showNotification) showToast('Supabase belum terhubung. Periksa konfigurasi URL & Key.', 'warning');
      return false;
    }

    try {
      if (showNotification) showToast('Sedang mengunggah kurikulum live ke Supabase Cloud...', 'info');

      // 1. Push published (non-draft) modules
      const liveModules = (AppState.modules || []).filter(m => !m.isDraft);
      if (liveModules.length > 0) {
        const payloadMods = liveModules.map(m => ({
          id: m.id,
          title: m.title,
          description: m.description,
          category: m.category || 'ai',
          badge: m.badge || 'MODUL',
          cover_image: m.coverImage,
          order_index: m.orderIndex || 1,
          is_locked: !!m.isLocked,
          lock_reason: m.lockReason || null,
          is_pinned: !!m.isPinned
        }));
        const { error: modErr } = await this.client.from('curriculum_modules').upsert(payloadMods, { onConflict: 'id' });
        if (modErr) {
          // If remote table doesn't have is_pinned column yet, fallback safely
          const fallbackPayload = payloadMods.map(p => { const copy = { ...p }; delete copy.is_pinned; return copy; });
          await this.client.from('curriculum_modules').upsert(fallbackPayload, { onConflict: 'id' });
        }
      }

      // 2. Push published (non-draft) lessons
      const liveLessons = (AppState.lessons || []).filter(l => !l.isDraft);
      if (liveLessons.length > 0) {
        const payloadLess = liveLessons.map(l => ({
          id: l.id,
          module_id: l.moduleId,
          title: l.title,
          youtube_url: l.youtubeUrl || '',
          duration_minutes: l.durationMinutes || 15,
          order_index: l.orderIndex || 1,
          blocks: l.blocks || []
        }));
        const { error: lesErr } = await this.client.from('curriculum_lessons').upsert(payloadLess, { onConflict: 'id' });
        if (lesErr) throw lesErr;
      }

      if (showNotification) {
        const draftModsCount = (AppState.modules || []).filter(m => m.isDraft).length;
        const draftLessCount = (AppState.lessons || []).filter(l => l.isDraft).length;
        let note = `Sukses! ${liveModules.length} Modul & ${liveLessons.length} Materi berhasil LIVE di Cloud Supabase!`;
        if (draftModsCount > 0 || draftLessCount > 0) {
          note += ` (${draftModsCount} modul & ${draftLessCount} materi draft tetap tersimpan lokal)`;
        }
        showToast(note, 'success');
      }
      return true;
    } catch (e) {
      console.error('[ZettSupabase Sync Curriculum Error]', e);
      if (showNotification) {
        showToast('Gagal upload kurikulum ke Cloud: ' + (e.message || 'Error Supabase'), 'error');
      }
      return false;
    }
  }
};

// UI Handlers for Modal Settings
function openSupabaseSettingsModal() {
  const modal = document.getElementById('modal-supabase-settings');
  const inpUrl = document.getElementById('supabase-config-url');
  const inpKey = document.getElementById('supabase-config-anon');
  if (!modal) return;

  const conf = ZettSupabase.getConfig();
  if (inpUrl) inpUrl.value = conf.url;
  if (inpKey) inpKey.value = conf.anonKey;

  ZettSupabase.updateStatusBadge();
  modal.classList.remove('hidden');
}

function closeSupabaseSettingsModal() {
  const modal = document.getElementById('modal-supabase-settings');
  if (modal) modal.classList.add('hidden');
}

function handleSaveSupabaseConfig(e) {
  if (e) e.preventDefault();
  const url = document.getElementById('supabase-config-url').value.trim();
  const anonKey = document.getElementById('supabase-config-anon').value.trim();

  ZettSupabase.setConfig(url, anonKey);
  showToast('Pengaturan Supabase disimpan!', 'success');
  ZettSupabase.updateStatusBadge();
}

// Window bindings
window.ZettSupabase = ZettSupabase;
window.openSupabaseSettingsModal = openSupabaseSettingsModal;
window.closeSupabaseSettingsModal = closeSupabaseSettingsModal;
window.handleSaveSupabaseConfig = handleSaveSupabaseConfig;

// Initialize on script load
try {
  ZettSupabase.init();
} catch (e) {}
