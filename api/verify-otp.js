const crypto = require('crypto');

const HMAC_SECRET = process.env.HMAC_SECRET || 'zettbos_secure_secret_2026';

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
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
    const { email, code, token } = req.body || {};

    if (!email || !code || !token) {
      return res.status(400).json({ success: false, error: 'Email, kode OTP, dan token verifikasi wajib disertakan.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    // 1. Ekstrak Expiration dan Signature dari Token (Format: expiresAt.signature)
    const parts = token.split('.');
    if (parts.length !== 2) {
      return res.status(400).json({ success: false, error: 'Token verifikasi tidak valid.' });
    }

    const expiresAt = parseInt(parts[0], 10);
    const signature = parts[1];

    // 2. Cek Masa Berlaku (10 Menit)
    if (Date.now() > expiresAt) {
      return res.status(400).json({ success: false, error: 'Kode OTP telah kadaluarsa. Silakan minta kode baru.' });
    }

    // 3. Verifikasi Tanda Tangan Kriptografis HMAC
    const payload = `${cleanEmail}:${cleanCode}:${expiresAt}`;
    const expectedSignature = crypto.createHmac('sha256', HMAC_SECRET).update(payload).digest('hex');

    if (crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'))) {
      return res.status(200).json({
        success: true,
        verified: true,
        email: cleanEmail,
        message: 'Kode OTP berhasil diverifikasi.'
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Kode OTP yang Anda masukkan salah. Periksa kembali kotak masuk email Anda.'
      });
    }

  } catch (err) {
    console.error('[Verify OTP Serverless Error]', err);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat memverifikasi kode OTP.'
    });
  }
};
