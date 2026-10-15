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
    const { email } = req.body || {};
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Alamat email tidak valid.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Cek Super Admin Hardcoded Fallback
    if (cleanEmail === 'zettbos2025@gmail.com') {
      return res.status(200).json({
        success: true,
        isWhitelisted: true,
        role: 'admin',
        fullName: 'Owner Zettbos (Super Admin)'
      });
    }

    // 2. Query Supabase Database via REST API (Hanya Query 1 Email Ini)
    const supabaseUrl = process.env.SUPABASE_URL || 'https://dtbbmpuqfstwxewylbao.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_QX8Kjj5QukJXXqXcIILp5w_Dye0avf1';

    const response = await fetch(`${supabaseUrl}/rest/v1/whitelist_members?email=eq.${encodeURIComponent(cleanEmail)}&select=id,email,full_name,role,is_active,password_hash`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn('[Check Whitelist DB Query Warning]', response.statusText);
      return res.status(200).json({
        success: true,
        isWhitelisted: false,
        message: 'Email tidak ditemukan di whitelist.'
      });
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      const member = data[0];
      if (member.is_active === false) {
        return res.status(200).json({
          success: true,
          isWhitelisted: false,
          isActive: false,
          message: 'Akun Anda telah dinonaktifkan oleh mentor.'
        });
      }
      return res.status(200).json({
        success: true,
        isWhitelisted: true,
        role: member.role || 'member',
        fullName: member.full_name || cleanEmail.split('@')[0],
        hasPassword: !!member.password_hash
      });
    }

    return res.status(200).json({
      success: true,
      isWhitelisted: false,
      message: 'Email belum terdaftar di whitelist resmi Zettbos.'
    });

  } catch (err) {
    console.error('[Check Whitelist Error]', err);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat memeriksa whitelist: ' + (err.message || err.toString())
    });
  }
};
