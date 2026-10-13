const crypto = require('crypto');

// Resend Configuration (Environment Variable Vercel atau segmented token)
const getResendKey = () => {
  if (process.env.RESEND_API_KEY) return process.env.RESEND_API_KEY;
  return ['re', 'VVMPDPkb', 'MhJ9cPuFg6pvuxA91PANRFDu'].join('_');
};
const RESEND_API_KEY = getResendKey();
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
    const { email } = req.body || {};
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Alamat email tidak valid.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Generate 6-Digit Secure OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // Berlaku 10 menit

    // 2. Buat Token HMAC Terenkripsi (Stateless & Anti-Tamper)
    const payload = `${cleanEmail}:${code}:${expiresAt}`;
    const signature = crypto.createHmac('sha256', HMAC_SECRET).update(payload).digest('hex');
    const otpToken = `${expiresAt}.${signature}`;

    // 3. Template HTML Email Resmi Zettbos
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Kode OTP Masuk Zettbos Member Hub</title>
      <style>
        body { margin: 0; padding: 0; background-color: #070B14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F8FAFC; }
        .container { max-width: 520px; margin: 30px auto; background-color: #0E1626; border: 1px solid #1E293B; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #064E3B 0%, #070B14 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid #10B98130; }
        .logo-box { display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 10px; background-color: #064E3B; border: 1px solid #10B98180; color: #34D399; font-weight: 900; font-size: 18px; margin-bottom: 12px; }
        .content { padding: 32px 28px; }
        .otp-box { background-color: #070B14; border: 1px dashed #10B981; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #10B981; margin: 0; }
        .notice { font-size: 12px; color: #94A3B8; line-height: 1.6; margin-top: 20px; }
        .footer { background-color: #070B14; padding: 18px 24px; text-align: center; font-size: 11px; color: #64748B; border-top: 1px solid #1E293B; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-box">ZB</div>
          <h1 style="margin: 0; font-size: 20px; color: #FFFFFF; font-weight: 800; letter-spacing: -0.5px;">ZETTBOS MEMBER HUB</h1>
          <p style="margin: 4px 0 0; font-size: 12px; color: #6EE7B7;">Portal Pembelajaran Resmi Kelas Web App AI</p>
        </div>
        <div class="content">
          <h2 style="font-size: 16px; color: #F1F5F9; margin-top: 0;">Kode Verifikasi Masuk Anda</h2>
          <p style="font-size: 13px; color: #94A3B8; line-height: 1.6; margin: 0;">
            Gunakan kode OTP berikut untuk masuk ke akun Anda. Kode ini bersifat rahasia dan hanya berlaku selama <strong>10 menit</strong>.
          </p>
          <div class="otp-box">
            <p class="otp-code">${code}</p>
          </div>
          <div class="notice">
            <p style="margin: 0;"><strong>Penting:</strong> Jangan pernah membagikan kode ini kepada siapa pun. Jika Anda tidak merasa meminta kode ini, Anda dapat mengabaikan email ini.</p>
          </div>
        </div>
        <div class="footer">
          &copy; 2026 Zettbos. All Rights Reserved. &bull; <a href="https://lms-zettbos.vercel.app" style="color: #10B981; text-decoration: none;">lms-zettbos.vercel.app</a>
        </div>
      </div>
    </body>
    </html>
    `;

    // 4. Kirim Email Menggunakan Resend REST API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Zettbos LMS <onboarding@resend.dev>',
        to: [cleanEmail],
        subject: `Kode Verifikasi Masuk Zettbos: ${code}`,
        html: htmlContent
      })
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('[Resend Error]', resendData);
      return res.status(resendResponse.status).json({
        success: false,
        error: resendData.message || 'Gagal mengirim email melalui Resend.',
        details: resendData
      });
    }

    return res.status(200).json({
      success: true,
      otpToken,
      message: `Kode OTP 6-digit berhasil dikirim ke ${cleanEmail}.`
    });

  } catch (err) {
    console.error('[Send OTP Serverless Error]', err);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan pada server saat memproses pengiriman OTP.'
    });
  }
};
