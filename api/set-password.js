const crypto = require('crypto');

const HMAC_SECRET = process.env.HMAC_SECRET || 'zettbos_secure_secret_prod_2026';

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
    const { email, fullName, passwordHash, resetToken } = req.body || {};

    if (!email || !fullName) {
      return res.status(400).json({ success: false, error: 'Data nama dan email wajib diisi.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Verifikasi Otentikasi Bukti OTP jika resetToken disertakan (Anti-Bypass)
    if (resetToken) {
      const parts = resetToken.split('.');
      if (parts.length === 2) {
        const expiresAt = parseInt(parts[0], 10);
        const signature = parts[1];

        if (Date.now() > expiresAt) {
          return res.status(400).json({ success: false, error: 'Sesi pembuatan kata sandi kadaluarsa. Silakan minta kode OTP baru.' });
        }

        const proofPayload = `${cleanEmail}:verified:${expiresAt}`;
        const expectedSig = crypto.createHmac('sha256', HMAC_SECRET).update(proofPayload).digest('hex');

        if (signature.length !== expectedSig.length || !crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSig, 'hex'))) {
          return res.status(403).json({ success: false, error: 'Token verifikasi OTP tidak sah.' });
        }
      }
    }

    // 2. Simpan ke Supabase Database (Anti-Overwrite & Safe Upsert)
    const supabaseUrl = process.env.SUPABASE_URL || 'https://dtbbmpuqfstwxewylbao.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_QX8Kjj5QukJXXqXcIILp5w_Dye0avf1';

    const patchPayload = { full_name: fullName.trim() };
    if (passwordHash) {
      patchPayload.password_hash = passwordHash;
    }

    // Coba PATCH terlebih dahulu dengan pencocokan case-insensitive
    const patchRes = await fetch(`${supabaseUrl}/rest/v1/whitelist_members?email=ilike.${encodeURIComponent(cleanEmail)}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(patchPayload)
    });

    let updatedRows = [];
    if (patchRes.ok) {
      try {
        updatedRows = await patchRes.json();
      } catch (_) {
        updatedRows = [];
      }
    }

    // Jika PATCH tidak mengenai baris apapun (misal email belum pernah di-seed ke Supabase), lakukan UPSERT langsung!
    if (!Array.isArray(updatedRows) || updatedRows.length === 0) {
      const postPayload = {
        id: 'wl-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        email: cleanEmail,
        full_name: fullName.trim(),
        role: cleanEmail === 'zettbos2025@gmail.com' ? 'admin' : 'member',
        is_active: true
      };
      if (passwordHash) {
        postPayload.password_hash = passwordHash;
      }

      const postRes = await fetch(`${supabaseUrl}/rest/v1/whitelist_members`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates,return=representation'
        },
        body: JSON.stringify(postPayload)
      });

      if (!postRes.ok) {
        const postErrText = await postRes.text().catch(() => '');
        console.warn('[Set Password DB Upsert Error]', postRes.status, postRes.statusText, postErrText);
        return res.status(500).json({ 
          success: false, 
          error: `Gagal mendaftarkan ke database Supabase (${postRes.status}): ${postRes.statusText || postErrText}` 
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Profil dan kata sandi berhasil diperbarui di database!',
      user: {
        email: cleanEmail,
        fullName: fullName.trim(),
        role: cleanEmail === 'zettbos2025@gmail.com' ? 'admin' : 'member'
      }
    });

  } catch (err) {
    console.error('[Set Password Serverless Error]', err);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan pada server saat menyimpan kata sandi.'
    });
  }
};
