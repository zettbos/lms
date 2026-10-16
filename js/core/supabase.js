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

      // 3. Pull Whitelist (Diunduh jika pengguna aktif adalah Admin / Super Admin)
      const user = AppState.currentUser;
      const isAdmin = user && (user.role === 'admin' || user.email?.toLowerCase() === 'zettbos2025@gmail.com');
        const [resPass, resAdmin] = await Promise.all([
          this.client.from('whitelist_members').select('id, email, full_name, role, is_active, password_hash, registered_at').not('password_hash', 'is', null),
          this.client.from('whitelist_members').select('id, email, full_name, role, is_active, password_hash, registered_at').eq('role', 'admin')
        ]);

        const cloudMap = new Map();
        const addCloudMapItem = (w) => {
          if (w && w.email) {
            const cleanE = w.email.toLowerCase().trim();
            if (!cloudMap.has(cleanE)) {
              cloudMap.set(cleanE, w);
            } else {
              cloudMap.set(cleanE, { ...cloudMap.get(cleanE), ...w });
            }
          }
        };

        (resPass.data || []).forEach(addCloudMapItem);
        (resAdmin.data || []).forEach(addCloudMapItem);

        // Paging untuk seluruh 2.000+ member agar tidak terpotong batas 1.000 Supabase PostgREST
        let wlFrom = 0;
        const wlBatch = 1000;
        let wlKeepPaging = true;
        while (wlKeepPaging) {
          const { data: chunk, error: chunkErr } = await this.client
            .from('whitelist_members')
            .select('id, email, full_name, role, is_active, password_hash, registered_at')
            .range(wlFrom, wlFrom + wlBatch - 1);
          if (chunkErr || !Array.isArray(chunk) || chunk.length === 0) {
            wlKeepPaging = false;
          } else {
            chunk.forEach(addCloudMapItem);
            if (chunk.length < wlBatch) wlKeepPaging = false;
            else wlFrom += wlBatch;
          }
        }

        if (cloudMap.size > 0) {

          // Update data lokal dengan prioritas data cloud
          AppState.whitelist.forEach(localM => {
            const cleanE = (localM.email || '').toLowerCase().trim();
            if (cloudMap.has(cleanE)) {
              const c = cloudMap.get(cleanE);
              if (c.password_hash) localM.passwordHash = c.password_hash;
              if (c.full_name && c.full_name !== 'Siswa Zettbos') localM.fullName = c.full_name;
              if (c.role) localM.role = c.role;
              localM.isActive = c.is_active !== false;
              cloudMap.delete(cleanE);
            }
          });

          // Tambahkan member cloud yang belum ada di lokal
          cloudMap.forEach((c, cleanE) => {
            AppState.whitelist.push({
              id: c.id || ('wl-' + Date.now()),
              email: cleanE,
              fullName: c.full_name || cleanE.split('@')[0],
              role: c.role || 'member',
              isActive: c.is_active !== false,
              passwordHash: c.password_hash || null,
              registeredAt: c.registered_at || new Date().toISOString()
            });
          });
        }
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
        const zData = window.ZettData || {};
        AppState.landingCms = {
          hero: cms.hero,
          facilities: (Array.isArray(cms.facilities) && cms.facilities.length > 0)
            ? cms.facilities
            : ((cms.hero && Array.isArray(cms.hero._facilities) && cms.hero._facilities.length > 0)
                ? cms.hero._facilities
                : (zData.SEED_LANDING_CMS?.facilities || [])),
          useCases: cms.use_cases || (zData.SEED_LANDING_CMS?.useCases) || [],
          testimonials: cms.testimonials || [],
          adminContacts: (Array.isArray(cms.admin_contacts) && cms.admin_contacts.length > 0)
            ? cms.admin_contacts
            : ((cms.hero && Array.isArray(cms.hero._adminContacts) && cms.hero._adminContacts.length > 0)
                ? cms.hero._adminContacts
                : (AppState.landingCms?.adminContacts || [
                    { id: 'admin1', name: 'Admin Farhan', phone: '0851-1122-6452', role: 'Support & Operasional LMS', status: 'Online' },
                    { id: 'admin2', name: 'Admin Asep', phone: '0821-9527-7812', role: 'Pendaftaran & Konsultasi Member', status: 'Online' }
                  ]))
        };

        // Extract Brand Logo from Cloud (hero.brandLogoUrl or top-level)
        const cloudLogo = (cms.brand_logo_url || cms.hero?.brandLogoUrl || '').trim();
        if (cloudLogo) {
          AppState.brandLogoUrl = cloudLogo;
          localStorage.setItem('zettbos_brand_logo_url', cloudLogo);
        } else {
          // Proteksi: jangan hapus jika di browser ini sudah tersimpan logo lokal!
          const localLogo = localStorage.getItem('zettbos_brand_logo_url');
          if (localLogo) {
            AppState.brandLogoUrl = localLogo;
            if (AppState.landingCms && AppState.landingCms.hero) {
              AppState.landingCms.hero.brandLogoUrl = localLogo;
            }
          }
        }
        if (typeof renderAppBrandLogo === 'function') {
          renderAppBrandLogo();
        }
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

      // 3. Push Whitelist (DENGAN PROTEKSI ANTI-OVERWRITE PASSWORD CLOUD)
      if (Array.isArray(AppState.whitelist) && AppState.whitelist.length > 0) {
        // Tarik data cloud terlebih dahulu untuk memproteksi password_hash yang sudah dibuat siswa
        const { data: cloudWl } = await this.client
          .from('whitelist_members')
          .select('email, password_hash, full_name')
          .limit(10000);

        const cloudMap = new Map();
        if (Array.isArray(cloudWl)) {
          cloudWl.forEach(c => {
            if (c.email) cloudMap.set(c.email.toLowerCase().trim(), c);
          });
        }

        const payloadWl = AppState.whitelist.map(w => {
          const cleanE = (w.email || '').toLowerCase().trim();
          const cloudItem = cloudMap.get(cleanE);

          // Pertahankan password hash dari cloud jika lokal masih null/kosong
          const finalPass = w.passwordHash || cloudItem?.password_hash || null;
          // Pertahankan nama kustom dari cloud jika lokal masih default
          const finalName = (w.fullName && w.fullName !== 'Siswa Zettbos') 
            ? w.fullName 
            : (cloudItem?.full_name || w.fullName || 'Siswa Zettbos');

          // Sinkronkan balik ke state lokal
          w.passwordHash = finalPass;
          w.fullName = finalName;

          return {
            id: w.id,
            email: cleanE,
            full_name: finalName,
            role: w.role || 'member',
            is_active: w.isActive !== false,
            password_hash: finalPass
          };
        });

        // Batch upload per 100 baris agar andal
        for (let i = 0; i < payloadWl.length; i += 100) {
          const chunk = payloadWl.slice(i, i + 100);
          await this.client.from('whitelist_members').upsert(chunk, { onConflict: 'email' });
        }
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

      // 5. Push Landing CMS (With Resilient Fallback)
      if (AppState.landingCms && AppState.landingCms.hero) {
        await this.pushLandingCmsToSupabase(true);
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

  async pushLandingCmsToSupabase(silent = true) {
    if (!this.isConnected() || !AppState.landingCms) return false;
    try {
      const contactsToSave = AppState.landingCms.adminContacts || [
        { id: 'admin1', name: 'Admin Farhan', phone: '0851-1122-6452', role: 'Support & Operasional LMS', status: 'Online' },
        { id: 'admin2', name: 'Admin Asep', phone: '0821-9527-7812', role: 'Pendaftaran & Konsultasi Member', status: 'Online' }
      ];
      const heroWithBrand = {
        ...(AppState.landingCms.hero || {}),
        brandLogoUrl: AppState.brandLogoUrl || '',
        _adminContacts: contactsToSave
      };
      const payload = {
        id: 'active_cms',
        hero: heroWithBrand,
        facilities: AppState.landingCms.facilities || [],
        use_cases: AppState.landingCms.useCases || [],
        testimonials: AppState.landingCms.testimonials || [],
        updated_at: new Date().toISOString()
      };
      const { error } = await this.client.from('landing_cms').upsert(payload, { onConflict: 'id' });
      
      if (error) {
        // Fallback cerdas: Jika kolom 'facilities' belum ditambahkan di tabel Supabase Cloud
        const errMsg = (error.message || '').toLowerCase();
        if (errMsg.includes('facilities') || error.code === 'PGRST204') {
          console.warn('[ZettSupabase] Kolom facilities belum ada di schema Supabase. Menggunakan payload fallback JSONB hero._facilities...');
          const fallbackHero = {
            ...(AppState.landingCms.hero || {}),
            _facilities: AppState.landingCms.facilities || [],
            _adminContacts: contactsToSave,
            brandLogoUrl: AppState.brandLogoUrl || ''
          };
          const fallbackPayload = {
            id: 'active_cms',
            hero: fallbackHero,
            use_cases: AppState.landingCms.useCases || [],
            testimonials: AppState.landingCms.testimonials || [],
            updated_at: new Date().toISOString()
          };
          const { error: fallbackErr } = await this.client.from('landing_cms').upsert(fallbackPayload, { onConflict: 'id' });
          if (fallbackErr) throw fallbackErr;
        } else {
          throw error;
        }
      }

      if (!silent && typeof showToast === 'function') {
        showToast('CMS Landing Page berhasil disinkronkan ke Cloud Supabase!', 'success');
      }
      return true;
    } catch (e) {
      console.warn('[ZettSupabase Push CMS Error]', e);
      if (!silent && typeof showToast === 'function') {
        showToast('Gagal upload CMS ke cloud: ' + (e.message || 'Error'), 'error');
      }
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
          isPinned: !!m.is_pinned,
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

      // 4. Fetch Shared Resources
      const { data: sRes, error: resErr } = await this.client
        .from('shared_resources')
        .select('*')
        .order('order_index');

      if (!resErr && Array.isArray(sRes)) {
        const dummyFilter = (window.DUMMY_RESOURCE_TITLES || [
          'template google sheet',
          'starter codebase',
          'library prompt zettprompt',
          'google drive folder',
          'template sop revisi 2 lapis'
        ]);

        const dummyIds = sRes
          .filter(r => dummyFilter.some(dt => (r.title || '').toLowerCase().includes(dt)))
          .map(r => r.id);

        if (dummyIds.length > 0) {
          // Otomatis hapus baris dummy dari database Supabase Cloud
          this.client.from('shared_resources').delete().in('id', dummyIds).then(({ error }) => {
            if (!error) console.log('[Supabase Cloud Auto-Purge] Berhasil menghapus baris dummy:', dummyIds);
          });
        }

        const cleanResources = sRes.filter(r => !dummyFilter.some(dt => (r.title || '').toLowerCase().includes(dt)));
        AppState.resources = cleanResources.map(r => ({
          id: r.id,
          title: r.title,
          description: r.description || '',
          url: r.url,
          category: r.category || 'sheet',
          badge: r.badge || 'Official Link',
          icon: r.category || 'sheet',
          date: r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Aktif',
          orderIndex: r.order_index || 1
        }));
        hasChanges = true;
      }

      // 5. Fetch Landing CMS for All Users & Public Visitors
      try {
        const { data: cms, error: cmsErr } = await this.client
          .from('landing_cms')
          .select('*')
          .eq('id', 'active_cms')
          .single();

        if (!cmsErr && cms && cms.hero) {
          const zData = window.ZettData || {};
          AppState.landingCms = {
            hero: cms.hero,
            facilities: (Array.isArray(cms.facilities) && cms.facilities.length > 0)
              ? cms.facilities
              : ((cms.hero && Array.isArray(cms.hero._facilities) && cms.hero._facilities.length > 0)
                  ? cms.hero._facilities
                  : (zData.SEED_LANDING_CMS?.facilities || [])),
            useCases: (Array.isArray(cms.use_cases) && cms.use_cases.length > 0) ? cms.use_cases : (zData.SEED_LANDING_CMS?.useCases || []),
            testimonials: (Array.isArray(cms.testimonials) && cms.testimonials.length > 0) ? cms.testimonials : (zData.SEED_LANDING_CMS?.testimonials || []),
            adminContacts: (Array.isArray(cms.admin_contacts) && cms.admin_contacts.length > 0)
              ? cms.admin_contacts
              : ((cms.hero && Array.isArray(cms.hero._adminContacts) && cms.hero._adminContacts.length > 0)
                  ? cms.hero._adminContacts
                  : (AppState.landingCms?.adminContacts || [
                      { id: 'admin1', name: 'Admin Farhan', phone: '0851-1122-6452', role: 'Support & Operasional LMS', status: 'Online' },
                      { id: 'admin2', name: 'Admin Asep', phone: '0821-9527-7812', role: 'Pendaftaran & Konsultasi Member', status: 'Online' }
                    ]))
          };

          // Auto-Sync Brand Logo from Cloud to all client devices
          const cloudLogo = (cms.brand_logo_url || cms.hero?.brandLogoUrl || '').trim();
          if (cloudLogo) {
            AppState.brandLogoUrl = cloudLogo;
            localStorage.setItem('zettbos_brand_logo_url', cloudLogo);
          } else {
            const localLogo = localStorage.getItem('zettbos_brand_logo_url');
            if (localLogo) {
              AppState.brandLogoUrl = localLogo;
              if (AppState.landingCms && AppState.landingCms.hero) {
                AppState.landingCms.hero.brandLogoUrl = localLogo;
              }
            }
          }

          localStorage.setItem('zett_landing_cms', JSON.stringify(AppState.landingCms));
          hasChanges = true;
        }
      } catch (cmsFetchErr) {
        console.warn('[ZettSupabase Auto-Sync CMS Warning]', cmsFetchErr);
      }

      if (hasChanges) {
        saveState();
        if (!silent && typeof showToast === 'function') {
          showToast('Kurikulum Cloud berhasil disinkronkan ke layar!', 'success');
        }

        // Always re-render brand logo across all 4 targets (nav, drawer, landing, footer)
        if (typeof renderAppBrandLogo === 'function') {
          renderAppBrandLogo();
        }

        // Auto re-render active view
        if (AppState.currentView === 'home') {
          if (typeof renderHome === 'function') renderHome();
          if (typeof renderPinnedModuleHero === 'function') renderPinnedModuleHero();
          if (typeof renderQuickActionHub === 'function') renderQuickActionHub();
          if (typeof renderModuleCategoryPills === 'function') renderModuleCategoryPills();
          if (typeof renderModuleCatalogGrid === 'function') renderModuleCatalogGrid();
        }
        else if (AppState.currentView === 'admin') {
          if (typeof renderAdminCurriculum === 'function') renderAdminCurriculum();
          if (typeof renderAdminQuickActions === 'function') renderAdminQuickActions();
          if (typeof renderAdminLandingCms === 'function') renderAdminLandingCms();
          if (typeof renderAdminResourcesCms === 'function') renderAdminResourcesCms();
        }
        else if (AppState.currentView === 'resources') {
          if (typeof renderResources === 'function') renderResources();
        }
        else if (AppState.currentView === 'landing') {
          if (typeof renderLandingFromCms === 'function') renderLandingFromCms();
          if (typeof renderLandingCurriculumBento === 'function') renderLandingCurriculumBento();
          if (typeof renderLandingFacilitiesShowcase === 'function') renderLandingFacilitiesShowcase(AppState.landingCms);
          if (typeof renderLandingUseCases === 'function') renderLandingUseCases(AppState.landingCms);
          if (window.HeroTypewriterController && typeof window.HeroTypewriterController.init === 'function') {
            window.HeroTypewriterController.init();
          }
        }
        else if (AppState.currentView === 'learn') {
          const catalogView = document.getElementById('learn-catalog-view');
          if (catalogView && !catalogView.classList.contains('hidden')) {
            if (typeof renderLearnModulesCatalog === 'function') {
              renderLearnModuleCategoryPills();
              renderLearnModulesCatalog();
            }
          } else if (typeof renderLearningRoom === 'function') {
            renderLearningRoom(AppState.currentLessonId);
          }
        }
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

      // 3. Push Quick Actions live to Supabase Cloud
      if (Array.isArray(AppState.quickActions) && AppState.quickActions.length > 0) {
        const payloadQa = AppState.quickActions.map((q, idx) => ({
          id: q.id,
          title: q.title,
          subtitle: q.subtitle || '',
          icon: q.icon || 'folder',
          badge: q.badge || 'Akses',
          action_type: q.actionType || 'navigate',
          target: q.target || '',
          order_index: q.orderIndex || (idx + 1)
        }));
        const { error: qaErr } = await this.client.from('quick_actions').upsert(payloadQa, { onConflict: 'id' });
        if (qaErr) console.warn('[ZettSupabase QA Cloud Push Warning]', qaErr);
      }

      // 4. Push Shared Resources live to Supabase Cloud
      if (Array.isArray(AppState.resources) && AppState.resources.length > 0) {
        const payloadRes = AppState.resources.map((r, idx) => ({
          id: r.id,
          title: r.title,
          description: r.description || '',
          url: r.url,
          category: r.category || 'sheet',
          badge: r.badge || 'Official Link',
          order_index: r.orderIndex || (idx + 1)
        }));
        const { error: resErr } = await this.client.from('shared_resources').upsert(payloadRes, { onConflict: 'id' });
        if (resErr) console.warn('[ZettSupabase Resources Cloud Push Warning]', resErr);
      }

      if (showNotification) {
        const draftModsCount = (AppState.modules || []).filter(m => m.isDraft).length;
        const draftLessCount = (AppState.lessons || []).filter(l => l.isDraft).length;
        let note = `Sukses! Seluruh Kurikulum, Quick Actions & Dokumen LIVE di Supabase Cloud!`;
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
  },

  async syncNormalizedCurriculumToCloud(modIdMap = {}, lesIdMap = {}) {
    if (!this.isConnected()) return false;
    try {
      console.log('[ZettSupabase] Menyinkronkan normalisasi ID ke cloud...');

      // 1. Upsert normalized modules
      const liveMods = (AppState.modules || []).filter(m => !m.isDraft);
      if (liveMods.length > 0) {
        const payloadMods = liveMods.map(m => ({
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
        await this.client.from('curriculum_modules').upsert(payloadMods, { onConflict: 'id' });
      }

      // 2. Upsert normalized lessons
      const liveLessons = (AppState.lessons || []).filter(l => !l.isDraft);
      if (liveLessons.length > 0) {
        const payloadLessons = liveLessons.map(l => ({
          id: l.id,
          module_id: l.moduleId,
          title: l.title,
          youtube_url: l.youtubeUrl || '',
          duration_minutes: l.durationMinutes || 15,
          order_index: l.orderIndex || 1,
          blocks: l.blocks || []
        }));
        await this.client.from('curriculum_lessons').upsert(payloadLessons, { onConflict: 'id' });
      }

      // 3. Delete old messy module IDs from cloud (CASCADE will clean old lessons)
      const oldModIds = Object.keys(modIdMap).filter(id => id !== modIdMap[id]);
      if (oldModIds.length > 0) {
        for (const oldModId of oldModIds) {
          try {
            await this.client.from('curriculum_modules').delete().eq('id', oldModId);
          } catch (delErr) {
            console.warn('[ZettSupabase Delete Old Module]', delErr);
          }
        }
      }

      // 4. Upsert quick actions
      if (Array.isArray(AppState.quickActions) && AppState.quickActions.length > 0) {
        const payloadQa = AppState.quickActions.map(q => ({
          id: q.id,
          title: q.title,
          subtitle: q.subtitle || '',
          icon: q.icon || 'folder',
          badge: q.badge || 'Akses',
          action_type: q.actionType || 'navigate',
          target: q.target || '',
          order_index: q.orderIndex || 1
        }));
        await this.client.from('quick_actions').upsert(payloadQa, { onConflict: 'id' });
      }

      console.log('[ZettSupabase] Normalisasi ID berhasil tersinkron ke cloud!');
      return true;
    } catch (e) {
      console.warn('[ZettSupabase syncNormalizedCurriculumToCloud Error]', e);
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
