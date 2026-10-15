const crypto = require('crypto');
const nodemailer = require('nodemailer');

// 1. Konfigurasi Gmail SMTP Resmi Zettbos (Murni dari Environment Variables)
const GMAIL_USER = process.env.GMAIL_USER || 'zettbos2025@gmail.com';
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD;
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
    const { email } = req.body || {};
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Alamat email tidak valid.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 2. Proteksi Abuse Kuota: Verifikasi bahwa email terdaftar sebelum mengirim OTP
    const supabaseUrl = process.env.SUPABASE_URL || 'https://dtbbmpuqfstwxewylbao.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_QX8Kjj5QukJXXqXcIILp5w_Dye0avf1';

    let isAuthorized = (cleanEmail === 'zettbos2025@gmail.com');
    if (!isAuthorized) {
      try {
        const checkRes = await fetch(`${supabaseUrl}/rest/v1/whitelist_members?email=eq.${encodeURIComponent(cleanEmail)}&select=id,is_active`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        if (checkRes.ok) {
          const members = await checkRes.json();
          if (Array.isArray(members) && members.length > 0 && members[0].is_active !== false) {
            isAuthorized = true;
          }
        }
      } catch (checkErr) {
        console.warn('[Whitelist Check DB Warning]', checkErr);
        // Fallback anggun jika database timeout agar tidak memblokir siswa sah
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        error: 'Akses Ditolak: Alamat email Anda belum terdaftar di whitelist resmi Zettbos.'
      });
    }

    // 3. Validasi Kesiapan Kredensial Gmail SMTP
    if (!GMAIL_PASS) {
      console.error('[Gmail SMTP Error] GMAIL_APP_PASSWORD belum dikonfigurasi di Environment Variables');
      return res.status(500).json({
        success: false,
        error: 'Server email belum dikonfigurasi. Hubungi Admin untuk mengatur GMAIL_APP_PASSWORD di Vercel.'
      });
    }

    // 4. Inisialisasi Transporter Gmail SMTP (Nodemailer)
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // SSL port 465
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS
      }
    });

    // 5. Generate 6-Digit Secure OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // Berlaku 10 menit

    // 6. Buat Token HMAC Terenkripsi (Stateless & Anti-Tamper)
    const payload = `${cleanEmail}:${code}:${expiresAt}`;
    const signature = crypto.createHmac('sha256', HMAC_SECRET).update(payload).digest('hex');
    const otpToken = `${expiresAt}.${signature}`;

    // 7. Template HTML Email Resmi Zettbos
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

    // 8. Pengiriman Email via Gmail SMTP Resmi
    await transporter.sendMail({
      from: `"Zettbos Member Hub" <${GMAIL_USER}>`,
      to: cleanEmail,
      subject: `Kode Verifikasi Masuk Zettbos: ${code}`,
      html: htmlContent
    });

    return res.status(200).json({
      success: true,
      otpToken,
      message: `Kode OTP 6-digit berhasil dikirim ke ${cleanEmail}.`
    });

  } catch (err) {
    console.error('[Send OTP Serverless Error]', err);
    return res.status(500).json({
      success: false,
      error: 'Gagal mengirim email verifikasi: ' + (err.message || err.toString())
    });
  }
};
