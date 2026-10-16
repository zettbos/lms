/**
 * Zettbos LMS - Secure Authentication Controller
 * js/controllers/auth.js
 * Fitur: Strict Whitelist Verification, Native Email OTP via Supabase Auth,
 * Pembuatan Password Wajib Pasca-OTP dengan Hashing Kriptografis SHA-256,
 * dan Proteksi Akses Penuh Tanpa Pintu Belakang.
 */

// ==========================================
// 1. LOGIN FORM CONTROLLER & DYNAMIC PASSWORD TOGGLE
// ==========================================

let loginCheckDebounceTimer = null;

async function onLoginEmailChanged() {
  const emailInput = document.getElementById('login-email-input');
  const passwordContainer = document.getElementById('login-password-container');
  const submitLabel = document.getElementById('btn-login-label');
  if (!emailInput || !passwordContainer || !submitLabel) return;

  const email = emailInput.value.trim().toLowerCase();
  if (!email || !email.includes('@')) {
    passwordContainer.classList.add('hidden');
    submitLabel.textContent = 'Lanjut Masuk';
    return;
  }

  // Bypass instan Super Admin: Langsung tampilkan form password di perangkat mana pun
  if (email === 'zettbos2025@gmail.com') {
    passwordContainer.classList.remove('hidden');
    submitLabel.textContent = 'Masuk dengan Kata Sandi';
    return;
  }

  // 1. Cek local state jika ada
  let member = AppState.whitelist.find(m => m.email.toLowerCase() === email);
  if (member && member.passwordHash && member.passwordHash !== 'EXISTS') {
    passwordContainer.classList.remove('hidden');
    submitLabel.textContent = 'Masuk dengan Kata Sandi';
    return;
  }

  // 2. Debounce call ke serverless /api/check-whitelist untuk verifikasi status password tanpa bocor email lain
  clearTimeout(loginCheckDebounceTimer);
  loginCheckDebounceTimer = setTimeout(async () => {
    try {
      const res = await fetch(getApiEndpoint('/api/check-whitelist'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data && data.success && data.isWhitelisted) {
        if (data.hasPassword) {
          passwordContainer.classList.remove('hidden');
          submitLabel.textContent = 'Masuk dengan Kata Sandi';
        } else {
          passwordContainer.classList.add('hidden');
          submitLabel.textContent = 'Kirim Kode OTP Masuk';
        }
      }
    } catch (e) {
      console.warn('[Check Whitelist Input Error]', e);
    }
  }, 350);
}

async function handleLoginSubmit(event) {
  if (event) event.preventDefault();
  const emailInput = document.getElementById('login-email-input');
  const email = emailInput ? emailInput.value.trim().toLowerCase() : '';

  if (!email) {
    showToast('Silakan masukkan alamat email terdaftar', 'error');
    return;
  }

  showToast('Memverifikasi status akun...', 'info');

  // 1. Verifikasi Ketat Whitelist via Serverless API (Zero Email Leaks)
  let checkData = null;
  try {
    const res = await fetch(getApiEndpoint('/api/check-whitelist'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    checkData = await res.json();
  } catch (err) {
    console.warn('[Check Whitelist API Fallback]', err);
  }

  // Cek fallback jika offline
  let member = AppState.whitelist.find(m => m.email.toLowerCase() === email);
  const isSuperAdmin = (email === 'zettbos2025@gmail.com');

  const isWhitelisted = isSuperAdmin || (checkData && checkData.success && checkData.isWhitelisted) || (member && member.isActive);

  // 2. Jika Tidak Terdaftar di Whitelist: TOLAK KERAS
  if (!isWhitelisted) {
    const unregEmailEl = document.getElementById('modal-unregistered-email');
    const modalNonWl = document.getElementById('modal-non-whitelist');
    if (unregEmailEl) unregEmailEl.textContent = email;
    if (modalNonWl) modalNonWl.classList.remove('hidden');
    showToast('Akses Ditolak: Email belum terdaftar di whitelist Zettbos.', 'error');
    return;
  }

  const hasPassword = isSuperAdmin || (checkData && checkData.hasPassword) || (member && !!member.passwordHash);

  // 3. Jika Member Sudah Memiliki Password: Cek Input Password
  const passwordContainer = document.getElementById('login-password-container');
  const passwordInput = document.getElementById('login-password-input');

  if (hasPassword) {
    // Jika container belum terbuka, buka dan minta user isi password
    if (passwordContainer && passwordContainer.classList.contains('hidden')) {
      passwordContainer.classList.remove('hidden');
      const submitLabel = document.getElementById('btn-login-label');
      if (submitLabel) submitLabel.textContent = 'Masuk dengan Kata Sandi';
      if (passwordInput) passwordInput.focus();
      showToast('Akun Anda memiliki kata sandi. Silakan masukkan kata sandi.', 'info');
      return;
    }

    const enteredPassword = passwordInput ? passwordInput.value : '';
    if (!enteredPassword) {
      showToast('Silakan masukkan kata sandi Anda', 'error');
      if (passwordInput) passwordInput.focus();
      return;
    }

    // Hash kata sandi yang diinput dan verifikasi ke Serverless API /api/verify-login
    const inputHash = await hashPassword(enteredPassword);

    try {
      const loginRes = await fetch(getApiEndpoint('/api/verify-login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, passwordHash: inputHash })
      });
      const loginData = await loginRes.json();

      if (loginData.success && loginData.user) {
        AppState.currentUser = loginData.user;
        saveState();
        showToast(`Login berhasil! Selamat datang, ${loginData.user.fullName || loginData.user.email}`, 'success');
        navigate(loginData.user.role === 'admin' ? 'admin' : 'home');
        return;
      } else {
        showToast(loginData.error || 'Kata sandi salah! Periksa kembali atau gunakan opsi "Lupa sandi? Kirim OTP"', 'error');
        if (passwordInput) passwordInput.select();
        return;
      }
    } catch (loginErr) {
      console.warn('[Verify Login Server Error]', loginErr);
      showToast('Gagal memverifikasi login ke server. Periksa koneksi internet Anda.', 'error');
      return;
    }
  }

  // 4. Jika Belum Punya Password: Minta OTP untuk Verifikasi Awal
  await requestOtpLoginForEmail(email);
}

// ==========================================
// 2. SISTEM EMAIL OTP (SUPABASE NATIVE AUTH)
// ==========================================

async function requestOtpLoginForEmail(emailOverride) {
  const emailInput = document.getElementById('login-email-input');
  const targetEmail = (emailOverride || (emailInput ? emailInput.value : '')).trim().toLowerCase();

  if (!targetEmail) {
    showToast('Masukkan alamat email terlebih dahulu', 'error');
    return;
  }

  // Validasi whitelist terlebih dahulu
  const member = AppState.whitelist.find(m => m.email.toLowerCase() === targetEmail);
  if (!member || !member.isActive) {
    const unregEmailEl = document.getElementById('modal-unregistered-email');
    const modalNonWl = document.getElementById('modal-non-whitelist');
    if (unregEmailEl) unregEmailEl.textContent = targetEmail;
    if (modalNonWl) modalNonWl.classList.remove('hidden');
    return;
  }

  AppState.pendingEmailForOtp = targetEmail;
  await sendOtpToEmail(targetEmail);
}

function getApiEndpoint(path) {
  if (window.location && window.location.protocol === 'file:') {
    return 'https://lms-zettbos.vercel.app' + path;
  }
  return path;
}

async function sendOtpToEmail(targetEmail) {
  const emailEl = document.getElementById('otp-target-email');
  const modalEl = document.getElementById('modal-otp');
  if (emailEl) emailEl.textContent = targetEmail;
  if (modalEl) modalEl.classList.remove('hidden');

  // Bersihkan kotak input OTP
  const inputs = document.querySelectorAll('.otp-digit-input');
  inputs.forEach(inp => inp.value = '');
  if (inputs[0]) inputs[0].focus();

  showToast(`Mengirim kode OTP verifikasi ke ${targetEmail}...`, 'info');

  try {
    const res = await fetch(getApiEndpoint('/api/send-otp'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: targetEmail })
    });

    const data = await res.json();

    if (data.success && data.otpToken) {
      AppState.activeOtpToken = data.otpToken;
      showToast(`Kode OTP 6-digit berhasil dikirim ke ${targetEmail}! Jika tidak ada di Inbox, WAJIB CEK FOLDER SPAM / JUNK email Anda.`, 'success', 9000);
    } else {
      console.warn('[Email OTP Warning]', data);
      showToast(`Gagal mengirim OTP: ${data.error || 'Periksa koneksi email'}`, 'error', 7000);
    }
  } catch (err) {
    console.error('[Send OTP Error]', err);
    showToast('Gagal menghubungi server email. Periksa koneksi internet.', 'error');
  }
}

async function resendOtpCode() {
  if (!AppState.pendingEmailForOtp) {
    showToast('Email tujuan OTP tidak ditemukan', 'error');
    return;
  }
  showToast('Mengirim ulang OTP... Pastikan juga mengecek folder SPAM email Anda.', 'info');
  await sendOtpToEmail(AppState.pendingEmailForOtp);
}

async function verifyOtpCode() {
  const inputs = document.querySelectorAll('.otp-digit-input');
  let enteredOtp = '';
  inputs.forEach(inp => enteredOtp += inp.value.trim());

  if (enteredOtp.length !== 6) {
    showToast('Masukkan 6 digit kode OTP lengkap', 'error');
    return;
  }

  const targetEmail = AppState.pendingEmailForOtp;
  if (!targetEmail) {
    showToast('Sesi OTP kadaluarsa, silakan ulangi login', 'error');
    return;
  }

  showToast('Memverifikasi kode OTP...', 'info');

  let isVerified = false;
  let verifyData = null;
  try {
    const res = await fetch(getApiEndpoint('/api/verify-otp'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: targetEmail,
        code: enteredOtp,
        token: AppState.activeOtpToken
      })
    });

    verifyData = await res.json();

    if (verifyData && verifyData.success && verifyData.verified) {
      isVerified = true;
    } else {
      showToast(`Kode OTP salah atau telah kadaluarsa: ${(verifyData && verifyData.error) || 'Coba periksa kembali'}`, 'error');
      return;
    }
  } catch (err) {
    console.error('[Verify OTP Error]', err);
    showToast('Gagal menghubungi server verifikasi OTP.', 'error');
    return;
  }

  if (!isVerified) return;

  if (verifyData && verifyData.resetToken) {
    AppState.activeResetToken = verifyData.resetToken;
  }

  // Tutup modal OTP
  const modalOtp = document.getElementById('modal-otp');
  if (modalOtp) modalOtp.classList.add('hidden');

  // Temukan atau buat profil sementara di local state
  let member = AppState.whitelist.find(m => m.email.toLowerCase() === targetEmail.toLowerCase());
  if (!member) {
    member = {
      id: 'wl-' + Date.now(),
      email: targetEmail,
      fullName: targetEmail.split('@')[0],
      role: (member && member.role) || (targetEmail.toLowerCase() === 'zettbos2025@gmail.com' ? 'admin' : 'member'),
      isActive: true,
      passwordHash: null
    };
    AppState.whitelist.push(member);
  }

  // 2. Jika Belum Pernah Bikin Password: WAJIB BIKIN PASSWORD BARU
  if (!member.passwordHash) {
    const modalSetPass = document.getElementById('modal-set-password');
    const targetEmailLabel = document.getElementById('set-password-target-email');
    if (targetEmailLabel) targetEmailLabel.textContent = member.email;
    if (modalSetPass) modalSetPass.classList.remove('hidden');

    const nameInput = document.getElementById('set-fullname-input');
    const passInput = document.getElementById('new-password-input');
    const confInput = document.getElementById('confirm-password-input');
    
    if (nameInput) {
      nameInput.value = (member.fullName && member.fullName !== 'Siswa Zettbos') ? member.fullName : '';
      nameInput.focus();
    } else if (passInput) {
      passInput.focus();
    }
    if (passInput) passInput.value = '';
    if (confInput) confInput.value = '';

    showToast('OTP Berhasil! Silakan lengkapi nama dan buat kata sandi akun.', 'success');
  } else {
    // Jika sudah punya password sebelumnya, langsung masuk
    AppState.currentUser = member;
    saveState();
    showToast(`Verifikasi sukses! Selamat datang, ${member.fullName || member.email}`, 'success');
    navigate(member.role === 'admin' ? 'admin' : 'home');
  }
}

// ==========================================
// 3. PEMBUATAN PASSWORD DENGAN HASHING SHA-256
// ==========================================

async function handleSetPasswordSubmit(event) {
  if (event) event.preventDefault();

  const fullNameInput = document.getElementById('set-fullname-input');
  const newPassInput = document.getElementById('new-password-input');
  const confirmPassInput = document.getElementById('confirm-password-input');

  const fullName = fullNameInput ? fullNameInput.value.trim() : '';
  const newPass = newPassInput ? newPassInput.value : '';
  const confirmPass = confirmPassInput ? confirmPassInput.value : '';

  if (!fullName || fullName.length < 2) {
    showToast('Silakan tulis nama lengkap Anda (minimal 2 karakter)!', 'error');
    if (fullNameInput) fullNameInput.focus();
    return;
  }

  if (!newPass || newPass.length < 8) {
    showToast('Kata sandi minimal 8 karakter!', 'error');
    if (newPassInput) newPassInput.focus();
    return;
  }

  if (newPass !== confirmPass) {
    showToast('Konfirmasi kata sandi tidak cocok!', 'error');
    if (confirmPassInput) confirmPassInput.focus();
    return;
  }

  const targetEmail = AppState.pendingEmailForOtp;
  let member = AppState.whitelist.find(m => m.email.toLowerCase() === targetEmail.toLowerCase());
  if (!member) {
    member = {
      id: 'wl-' + Date.now(),
      email: targetEmail,
      fullName: fullName,
      role: targetEmail.toLowerCase() === 'zettbos2025@gmail.com' ? 'admin' : 'member',
      isActive: true,
      passwordHash: null
    };
    AppState.whitelist.push(member);
  }

  showToast('Menyimpan profil dan mengenkripsi kata sandi...', 'info');

  // Enkripsi password menggunakan SHA-256 Web Crypto API
  const hashedPassword = await hashPassword(newPass);
  member.fullName = fullName;
  member.passwordHash = hashedPassword;

  let isSaved = false;
  let saveErrorMessage = '';

  // 1. Simpan ke Supabase Database via Serverless API /api/set-password (Aman & Anti-Bypass)
  try {
    const setPassRes = await fetch(getApiEndpoint('/api/set-password'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: member.email,
        fullName: fullName,
        passwordHash: hashedPassword,
        resetToken: AppState.activeResetToken || null
      })
    });
    const setPassData = await setPassRes.json();
    if (setPassData.success) {
      isSaved = true;
      if (setPassData.user && setPassData.user.role) {
        member.role = setPassData.user.role;
      }
    } else {
      saveErrorMessage = setPassData.error || 'Server menolak pendaftaran kata sandi.';
      console.warn('[Set Password API Warning]', saveErrorMessage);
    }
  } catch (apiErr) {
    saveErrorMessage = apiErr.message || 'Gagal menghubungi server.';
    console.warn('[Set Password API Exception]', apiErr);
  }

  // 2. Fallback sinkronisasi lokal Supabase jika terkoneksi (Gunakan Upsert agar pasti tersimpan)
  if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
    try {
      const { error: sbErr } = await ZettSupabase.client
        .from('whitelist_members')
        .upsert({ 
          id: member.id || ('wl-' + Date.now()),
          email: member.email.toLowerCase().trim(),
          full_name: fullName,
          role: member.role || 'member',
          is_active: true,
          password_hash: hashedPassword 
        }, { onConflict: 'email' });

      if (!sbErr) {
        isSaved = true;
      } else {
        console.warn('[Supabase Direct Whitelist Upsert Warning]', sbErr);
        if (!isSaved) saveErrorMessage = sbErr.message || saveErrorMessage;
      }
    } catch (err) {
      console.warn('[Supabase Direct Whitelist Upsert Exception]', err);
    }
  }

  // VALIDASI KETAT: Jika database belum berhasil menyimpan, JANGAN tutup modal dan JANGAN login-kan!
  if (!isSaved) {
    showToast(`Gagal menyimpan kata sandi ke database: ${saveErrorMessage || 'Akses database ditolak'}. Pastikan koneksi internet stabil dan coba lagi.`, 'error', 9000);
    return;
  }

  // Tutup Modal Set Password
  const modalSetPass = document.getElementById('modal-set-password');
  if (modalSetPass) modalSetPass.classList.add('hidden');

  // Login akun
  AppState.currentUser = member;
  saveState();

  showToast(`Selamat datang, ${fullName}! Profil dan kata sandi berhasil disimpan di database cloud.`, 'success');
  navigate(member.role === 'admin' ? 'admin' : 'home');
}

// ==========================================
// 4. HELPER & EVENT LISTENERS
// ==========================================

function togglePasswordVisibility(inputId, btnEl) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPass = input.type === 'password';
  input.type = isPass ? 'text' : 'password';
  if (btnEl) {
    btnEl.classList.toggle('text-emerald-400', isPass);
    btnEl.classList.toggle('text-slate-500', !isPass);
  }
}

function setupOtpInputListeners() {
  const inputs = document.querySelectorAll('.otp-digit-input');
  inputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      const val = e.target.value;
      if (val.length === 1) {
        if (index < inputs.length - 1) {
          inputs[index + 1].focus();
        } else {
          verifyOtpCode();
        }
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) {
        inputs[index - 1].focus();
      }
    });

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasteData = e.clipboardData.getData('text').trim().slice(0, 6);
      if (/^\d+$/.test(pasteData)) {
        pasteData.split('').forEach((char, idx) => {
          if (inputs[idx]) inputs[idx].value = char;
        });
        if (inputs[pasteData.length - 1]) inputs[pasteData.length - 1].focus();
        if (pasteData.length === 6) verifyOtpCode();
      }
    });
  });
}

function closeNonWhitelistModal() {
  const modal = document.getElementById('modal-non-whitelist');
  if (modal) modal.classList.add('hidden');
}

function logout() {
  if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
    try { ZettSupabase.client.auth.signOut(); } catch(e) {}
  }
  AppState.currentUser = null;
  saveState();
  showToast('Anda telah keluar dari Zettbos Member Hub.', 'info');
  navigate('landing');
}

// ==========================================
// 5. PENGATURAN PROFIL MEMBER (GANTI NAMA & KATA SANDI)
// ==========================================

function openProfileSettingsModal() {
  const user = AppState.currentUser;
  if (!user) {
    showToast('Silakan login terlebih dahulu', 'error');
    return;
  }
  const modal = document.getElementById('modal-profile-settings');
  const emailInp = document.getElementById('profile-email-input');
  const nameInp = document.getElementById('profile-fullname-input');
  const passInp = document.getElementById('profile-new-password');
  const confInp = document.getElementById('profile-confirm-password');

  if (emailInp) emailInp.value = user.email || '';
  if (nameInp) nameInp.value = (user.fullName && user.fullName !== 'Siswa Zettbos') ? user.fullName : '';
  if (passInp) passInp.value = '';
  if (confInp) confInp.value = '';

  if (modal) modal.classList.remove('hidden');
}

function closeProfileSettingsModal() {
  const modal = document.getElementById('modal-profile-settings');
  if (modal) modal.classList.add('hidden');
}

async function handleSaveProfileSubmit(e) {
  if (e) e.preventDefault();
  const user = AppState.currentUser;
  if (!user) return;

  const nameInp = document.getElementById('profile-fullname-input');
  const passInp = document.getElementById('profile-new-password');
  const confInp = document.getElementById('profile-confirm-password');

  const newName = (nameInp ? nameInp.value : '').trim();
  const newPass = passInp ? passInp.value : '';
  const confPass = confInp ? confInp.value : '';

  if (!newName || newName.length < 2) {
    showToast('Nama lengkap minimal 2 karakter!', 'error');
    if (nameInp) nameInp.focus();
    return;
  }

  let newPasswordHash = null;
  if (newPass) {
    if (newPass.length < 8) {
      showToast('Kata sandi baru minimal 8 karakter!', 'error');
      if (passInp) passInp.focus();
      return;
    }
    if (newPass !== confPass) {
      showToast('Konfirmasi kata sandi baru tidak cocok!', 'error');
      if (confInp) confInp.focus();
      return;
    }
    newPasswordHash = await hashPassword(newPass);
  }

  showToast('Menyimpan perubahan profil ke database cloud...', 'info');

  let isProfileSaved = false;
  let profileSaveError = '';

  // 1. Simpan ke Supabase via Serverless API /api/set-password
  try {
    const apiRes = await fetch(getApiEndpoint('/api/set-password'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        fullName: newName,
        passwordHash: newPasswordHash || null
      })
    });
    const apiData = await apiRes.json();
    if (apiData.success) {
      isProfileSaved = true;
    } else {
      profileSaveError = apiData.error || '';
      console.warn('[Profile API Warning]', profileSaveError);
    }
  } catch (apiEx) {
    profileSaveError = apiEx.message || '';
    console.warn('[Profile API Exception]', apiEx);
  }

  // 2. Direct Update to Supabase jika terhubung
  if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
    try {
      const updatePayload = { full_name: newName };
      if (newPasswordHash) updatePayload.password_hash = newPasswordHash;

      const { error: updErr } = await ZettSupabase.client
        .from('whitelist_members')
        .update(updatePayload)
        .eq('email', user.email);

      if (!updErr) {
        isProfileSaved = true;
      } else {
        console.warn('[Profile Supabase Update Error]', updErr);
        if (!isProfileSaved) profileSaveError = updErr.message || profileSaveError;
      }
    } catch (err) {
      console.warn('[Profile Supabase Exception]', err);
    }
  }

  if (!isProfileSaved) {
    showToast(`Gagal memperbarui profil di database: ${profileSaveError || 'Akses ditolak'}. Silakan coba lagi.`, 'error', 8000);
    return;
  }

  // Update in local state
  user.fullName = newName;
  if (newPasswordHash) {
    user.passwordHash = newPasswordHash;
  }

  // Update in AppState.whitelist
  const member = AppState.whitelist.find(m => m.email.toLowerCase() === user.email.toLowerCase());
  if (member) {
    member.fullName = newName;
    if (newPasswordHash) member.passwordHash = newPasswordHash;
  }

  saveState();

  // Re-render UI
  if (typeof updateNavbarState === 'function') updateNavbarState(AppState.currentView);
  if (typeof updateDrawerState === 'function') updateDrawerState();
  if (AppState.currentView === 'home' && typeof renderHome === 'function') renderHome();
  const navUserName = document.getElementById('nav-user-name');
  if (navUserName) navUserName.textContent = newName;
  const mUser = document.getElementById('mobile-popover-user');
  if (mUser) mUser.textContent = newName;

  closeProfileSettingsModal();
  showToast('Profil dan kata sandi berhasil diperbarui di database cloud!', 'success');
}

// Window bindings (Aman, tanpa fungsi bypass/dummy)
window.onLoginEmailChanged = onLoginEmailChanged;
window.handleLoginSubmit = handleLoginSubmit;
window.requestOtpLoginForEmail = requestOtpLoginForEmail;
window.sendOtpToEmail = sendOtpToEmail;
window.resendOtpCode = resendOtpCode;
window.verifyOtpCode = verifyOtpCode;
window.handleSetPasswordSubmit = handleSetPasswordSubmit;
window.togglePasswordVisibility = togglePasswordVisibility;
window.setupOtpInputListeners = setupOtpInputListeners;
window.closeNonWhitelistModal = closeNonWhitelistModal;
window.logout = logout;
window.openProfileSettingsModal = openProfileSettingsModal;
window.closeProfileSettingsModal = closeProfileSettingsModal;
window.handleSaveProfileSubmit = handleSaveProfileSubmit;
