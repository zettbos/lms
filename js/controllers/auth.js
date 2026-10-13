/**
 * Zettbos LMS - Authentication Controller (Whitelist & OTP Simulator)
 * js/controllers/auth.js
 */

function loginAsDemo(email) {
  if (window.initStorage) window.initStorage();
  const targetEmail = (email || 'farhan@zettbos.com').toLowerCase();
  let user = AppState.whitelist.find(m => m.email.toLowerCase() === targetEmail);
  
  const zData = window.ZettData || {};
  if (!user && zData.SEED_WHITELIST) {
    user = zData.SEED_WHITELIST.find(m => m.email.toLowerCase() === targetEmail);
    if (user) {
      AppState.whitelist.push(user);
    }
  }

  // During Dummy Preview: If user still doesn't exist, auto-create so tester is never locked!
  if (!user) {
    user = {
      id: 'user-' + Date.now(),
      email: targetEmail,
      fullName: targetEmail.split('@')[0],
      role: (targetEmail.includes('admin') || targetEmail.includes('farhan')) ? 'admin' : 'member',
      isActive: true,
      registeredAt: new Date().toISOString().split('T')[0]
    };
    AppState.whitelist.push(user);
  }

  AppState.currentUser = user;
  saveState();
  showToast(`Login berhasil sebagai ${user.fullName || user.email}`, 'success');
  navigate('home');
}

function handleLoginSubmit(event) {
  if (event) event.preventDefault();
  const emailInput = document.getElementById('login-email-input');
  const email = emailInput ? emailInput.value.trim().toLowerCase() : '';

  if (!email) {
    showToast('Silakan masukkan alamat email', 'error');
    return;
  }

  // FASE DUMMY / PROTOTYPE PREVIEW: JANGAN DIKUNCI!
  let member = AppState.whitelist.find(m => m.email.toLowerCase() === email);

  if (!member) {
    member = {
      id: 'user-' + Date.now(),
      email: email,
      fullName: email.split('@')[0],
      role: (email.includes('admin') || email.includes('farhan')) ? 'admin' : 'member',
      isActive: true,
      registeredAt: new Date().toISOString().split('T')[0]
    };
    AppState.whitelist.push(member);
    saveState();
    showToast(`[Mode Preview Dummy] Email '${email}' otomatis diizinkan masuk!`, 'info');
  }

  // Member is verified on Whitelist! Generate 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  AppState.pendingEmailForOtp = email;
  AppState.generatedOtpCode = otpCode;

  openOtpModal(email, otpCode);
}

function bypassAndLogin(email) {
  const targetEmail = (email && typeof email === 'string' && email.includes('@')) 
    ? email.trim().toLowerCase() 
    : 'preview.member@zettbos.com';
  loginAsDemo(targetEmail);
  closeNonWhitelistModal();
}

function openOtpModal(email, otpCode) {
  const emailEl = document.getElementById('otp-target-email');
  const modalEl = document.getElementById('modal-otp');
  if (emailEl) emailEl.textContent = email;
  if (modalEl) modalEl.classList.remove('hidden');

  // Clear inputs
  const inputs = document.querySelectorAll('.otp-digit-input');
  inputs.forEach(inp => inp.value = '');
  if (inputs[0]) inputs[0].focus();

  // Show simulation toast with code for zero-friction testing
  showToast(`Kode OTP Simulasi Anda: ${otpCode} (Klik untuk salin / langsung ketik)`, 'info', 10000);

  // Set simulation helper pill
  const helperEl = document.getElementById('otp-simulation-pill');
  if (helperEl) {
    helperEl.textContent = `[DEMO MODE] Kode OTP Anda: ${otpCode}`;
    helperEl.onclick = () => {
      inputs.forEach((inp, idx) => inp.value = otpCode[idx] || '');
      verifyOtpCode();
    };
  }
}

function verifyOtpCode() {
  const inputs = document.querySelectorAll('.otp-digit-input');
  let enteredOtp = '';
  inputs.forEach(inp => enteredOtp += inp.value);

  if (enteredOtp.length !== 6) {
    showToast('Masukkan 6 digit kode OTP lengkap', 'error');
    return;
  }

  if (enteredOtp === AppState.generatedOtpCode || enteredOtp === '123456') {
    const user = AppState.whitelist.find(m => m.email.toLowerCase() === AppState.pendingEmailForOtp.toLowerCase());
    AppState.currentUser = user;
    saveState();

    const modalOtp = document.getElementById('modal-otp');
    if (modalOtp) modalOtp.classList.add('hidden');
    showToast(`Login berhasil! Selamat datang, ${user.fullName || user.email}`, 'success');
    navigate('home');
  } else {
    showToast('Kode OTP salah! Coba periksa kembali', 'error');
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
      }
    });
  });
}

function closeNonWhitelistModal() {
  const modal = document.getElementById('modal-non-whitelist');
  if (modal) modal.classList.add('hidden');
}

function logout() {
  AppState.currentUser = null;
  saveState();
  showToast('Anda telah keluar.', 'info');
  navigate('landing');
}

// Window bindings
window.loginAsDemo = loginAsDemo;
window.handleLoginSubmit = handleLoginSubmit;
window.bypassAndLogin = bypassAndLogin;
window.openOtpModal = openOtpModal;
window.verifyOtpCode = verifyOtpCode;
window.setupOtpInputListeners = setupOtpInputListeners;
window.closeNonWhitelistModal = closeNonWhitelistModal;
window.logout = logout;
