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

function onLoginEmailChanged() {
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

  // Cek apakah akun ini terdaftar dan sudah memiliki password_hash
  const member = AppState.whitelist.find(m => m.email.toLowerCase() === email);
  if (member && member.passwordHash) {
    passwordContainer.classList.remove('hidden');
    submitLabel.textContent = 'Masuk dengan Kata Sandi';
  } else {
    passwordContainer.classList.add('hidden');
    submitLabel.textContent = 'Kirim Kode OTP Masuk';
  }
}

async function handleLoginSubmit(event) {
  if (event) event.preventDefault();
  const emailInput = document.getElementById('login-email-input');
  const email = emailInput ? emailInput.value.trim().toLowerCase() : '';

  if (!email) {
    showToast('Silakan masukkan alamat email terdaftar', 'error');
    return;
  }

  // 1. Verifikasi Ketat Whitelist (Local State & Supabase Live)
  let member = AppState.whitelist.find(m => m.email.toLowerCase() === email);

  if (!member && typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
    try {
      const { data, error } = await ZettSupabase.client
        .from('whitelist_members')
        .select('*')
        .eq('email', email)
        .single();
      
      if (data && !error) {
        member = {
          id: data.id,
          email: data.email,
          fullName: data.full_name,
          role: data.role || 'member',
          isActive: data.is_active !== false,
          passwordHash: data.password_hash || null,
          registeredAt: data.registered_at
        };
        AppState.whitelist.push(member);
        saveState();
      }
    } catch (err) {
      console.warn('[Auth Check Error]', err);
    }
  }

  // 2. Jika Tidak Terdaftar di Whitelist: TOLAK KERAS
  if (!member || !member.isActive) {
    const unregEmailEl = document.getElementById('modal-unregistered-email');
    const modalNonWl = document.getElementById('modal-non-whitelist');
    if (unregEmailEl) unregEmailEl.textContent = email;
    if (modalNonWl) modalNonWl.classList.remove('hidden');
    showToast('Akses Ditolak: Email belum terdaftar di whitelist Zettbos.', 'error');
    return;
  }

  // 3. Jika Member Sudah Memiliki Password: Cek Input Password
  const passwordContainer = document.getElementById('login-password-container');
  const passwordInput = document.getElementById('login-password-input');

  if (member.passwordHash) {
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

    // Hash kata sandi yang diinput dan bandingkan
    const inputHash = await hashPassword(enteredPassword);
    if (inputHash === member.passwordHash) {
      // Login Berhasil!
      AppState.currentUser = member;
      saveState();
      showToast(`Login berhasil! Selamat datang, ${member.fullName || member.email}`, 'success');
      navigate(member.role === 'admin' ? 'admin' : 'home');
      return;
    } else {
      showToast('Kata sandi salah! Coba periksa kembali atau gunakan opsi "Lupa sandi? Kirim OTP"', 'error');
      if (passwordInput) passwordInput.select();
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

async function sendOtpToEmail(targetEmail) {
  const emailEl = document.getElementById('otp-target-email');
  const modalEl = document.getElementById('modal-otp');
  if (emailEl) emailEl.textContent = targetEmail;
  if (modalEl) modalEl.classList.remove('hidden');

  // Bersihkan kotak input OTP
  const inputs = document.querySelectorAll('.otp-digit-input');
  inputs.forEach(inp => inp.value = '');
  if (inputs[0]) inputs[0].focus();

  showToast(`Mengirim kode OTP aman ke ${targetEmail}...`, 'info');

  if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
    try {
      const { data, error } = await ZettSupabase.client.auth.signInWithOtp({
        email: targetEmail,
        options: {
          shouldCreateUser: true
        }
      });

      if (error) {
        console.warn('[Supabase OTP Dispatch Warning]', error);
        showToast(`Info Pengiriman OTP: ${error.message || 'Cek email Anda'}`, 'info', 7000);
      } else {
        showToast(`Kode OTP 6-digit berhasil dikirim ke ${targetEmail}. Periksa kotak masuk / spam email Anda.`, 'success', 8000);
      }
    } catch (err) {
      console.error('[Supabase OTP Dispatch Exception]', err);
      showToast('Gagal menghubungi server email OTP. Periksa koneksi internet.', 'error');
    }
  } else {
    showToast('Koneksi database cloud Supabase belum aktif.', 'error');
  }
}

async function resendOtpCode() {
  if (!AppState.pendingEmailForOtp) {
    showToast('Email tujuan OTP tidak ditemukan', 'error');
    return;
  }
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

  // 1. Verifikasi dengan Supabase Auth
  let isVerified = false;
  if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
    try {
      const { data, error } = await ZettSupabase.client.auth.verifyOtp({
        email: targetEmail,
        token: enteredOtp,
        type: 'email'
      });

      if (error) {
        showToast(`Kode OTP tidak cocok atau sudah kadaluarsa: ${error.message}`, 'error');
        return;
      }
      isVerified = true;
    } catch (err) {
      console.error('[Supabase OTP Verify Error]', err);
      showToast('Terjadi kesalahan saat memverifikasi OTP ke cloud server.', 'error');
      return;
    }
  } else {
    showToast('Koneksi Supabase tidak terhubung. Tidak dapat memverifikasi OTP cloud.', 'error');
    return;
  }

  if (!isVerified) return;

  // Tutup modal OTP
  const modalOtp = document.getElementById('modal-otp');
  if (modalOtp) modalOtp.classList.add('hidden');

  // Temukan akun di whitelist
  const member = AppState.whitelist.find(m => m.email.toLowerCase() === targetEmail.toLowerCase());
  if (!member) {
    showToast('Akun tidak ditemukan di whitelist.', 'error');
    return;
  }

  // 2. Jika Belum Pernah Bikin Password: WAJIB BIKIN PASSWORD BARU
  if (!member.passwordHash) {
    const modalSetPass = document.getElementById('modal-set-password');
    const targetEmailLabel = document.getElementById('set-password-target-email');
    if (targetEmailLabel) targetEmailLabel.textContent = member.email;
    if (modalSetPass) modalSetPass.classList.remove('hidden');

    const passInput = document.getElementById('new-password-input');
    const confInput = document.getElementById('confirm-password-input');
    if (passInput) passInput.value = '';
    if (confInput) confInput.value = '';
    if (passInput) passInput.focus();

    showToast('OTP Berhasil! Wajib buat kata sandi akun untuk akses selanjutnya.', 'success');
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

  const newPassInput = document.getElementById('new-password-input');
  const confirmPassInput = document.getElementById('confirm-password-input');
  const newPass = newPassInput ? newPassInput.value : '';
  const confirmPass = confirmPassInput ? confirmPassInput.value : '';

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
  const member = AppState.whitelist.find(m => m.email.toLowerCase() === targetEmail.toLowerCase());
  if (!member) {
    showToast('Sesi pembuatan password kadaluarsa.', 'error');
    return;
  }

  showToast('Mengenkripsi & menyimpan kata sandi...', 'info');

  // Enkripsi password menggunakan SHA-256 Web Crypto API
  const hashedPassword = await hashPassword(newPass);
  member.passwordHash = hashedPassword;

  // Simpan ke Supabase Database Cloud
  if (typeof ZettSupabase !== 'undefined' && ZettSupabase.isConnected()) {
    try {
      await ZettSupabase.client
        .from('whitelist_members')
        .update({ password_hash: hashedPassword })
        .eq('email', member.email);

      // Sinkronkan juga password ke Supabase Auth
      try {
        await ZettSupabase.client.auth.updateUser({ password: newPass });
      } catch (authErr) {
        console.warn('[Supabase Auth Password Update]', authErr);
      }
    } catch (err) {
      console.warn('[Save Hash DB Error]', err);
    }
  }

  // Tutup Modal Set Password
  const modalSetPass = document.getElementById('modal-set-password');
  if (modalSetPass) modalSetPass.classList.add('hidden');

  // Login akun
  AppState.currentUser = member;
  saveState();

  showToast('Kata sandi berhasil dibuat dan dienkripsi (SHA-256)! Selamat datang.', 'success');
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
