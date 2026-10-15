const crypto = require('crypto');

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Metode tidak diizinkan. Gunakan POST.' });
  }

  try {
    const { email, passwordHash } = req.body || {};

    if (!email || !passwordHash) {
      return res.status(400).json({ success: false, error: 'Email dan kata sandi wajib disertakan.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Hitung Master Admin Password Hash (SHA-256)
    const adminDefaultPass = process.env.ADMIN_PASSWORD || 'Zettboz_1!';
    const expectedAdminHash = crypto.createHash('sha256').update(adminDefaultPass).digest('hex');

    // 2. Query Supabase untuk mendapatkan hash kata sandi akun ini
    const supabaseUrl = process.env.SUPABASE_URL || 'https://dtbbmpuqfstwxewylbao.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_QX8Kjj5QukJXXqXcIILp5w_Dye0avf1';

    let member = null;
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/whitelist_members?email=eq.${encodeURIComponent(cleanEmail)}&select=id,email,full_name,role,is_active,password_hash`, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          member = data[0];
        }
      }
    } catch (dbErr) {
      console.warn('[Verify Login DB Query Warning]', dbErr);
    }

    // 3. Penanganan Khusus Super Admin (Anti-Lockout Multi-Device)
    if (cleanEmail === 'zettbos2025@gmail.com') {
      const isValidAdminPass = passwordHash === expectedAdminHash || (member && member.password_hash === passwordHash);
      if (isValidAdminPass) {
        // Auto-heal Supabase row jika belum tersinkronisasi
        if (!member || !member.password_hash) {
          fetch(`${supabaseUrl}/rest/v1/whitelist_members`, {
            method: 'POST',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({
              id: 'owner-1',
              email: cleanEmail,
              full_name: 'Owner Zettbos (Super Admin)',
              role: 'admin',
              is_active: true,
              password_hash: expectedAdminHash
            })
          }).catch(() => {});
        }

        return res.status(200).json({
          success: true,
          message: 'Login berhasil!',
          user: {
            id: member ? member.id : 'owner-1',
            email: cleanEmail,
            fullName: (member && member.full_name) || 'Owner Zettbos (Super Admin)',
            role: 'admin'
          }
        });
      } else {
        return res.status(401).json({
          success: false,
          error: 'Kata sandi salah! Coba periksa kembali atau gunakan opsi "Lupa sandi? Kirim OTP".'
        });
      }
    }

    // 4. Verifikasi Akun Member Biasa
    if (!member) {
      return res.status(404).json({ success: false, error: 'Akun tidak terdaftar di whitelist Zettbos.' });
    }

    if (member.is_active === false) {
      return res.status(403).json({ success: false, error: 'Akun Anda telah dinonaktifkan oleh mentor.' });
    }

    if (!member.password_hash) {
      return res.status(400).json({ success: false, error: 'Akun ini belum memiliki kata sandi. Silakan masuk menggunakan kode OTP.' });
    }

    // Bandingkan hash kata sandi secara aman
    if (member.password_hash === passwordHash) {
      return res.status(200).json({
        success: true,
        message: 'Login berhasil!',
        user: {
          id: member.id,
          email: member.email,
          fullName: member.full_name || member.email.split('@')[0],
          role: member.role || 'member'
        }
      });
    } else {
      return res.status(401).json({
        success: false,
        error: 'Kata sandi salah! Coba periksa kembali atau gunakan opsi "Lupa sandi? Kirim OTP".'
      });
    }

  } catch (err) {
    console.error('[Verify Login Error]', err);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan pada server saat memverifikasi kata sandi.'
    });
  }
};
