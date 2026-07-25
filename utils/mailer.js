const nodemailer = require('nodemailer');

function createTransport() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function sendVerificationCode(to, code) {
  const transport = createTransport();
  if (!transport) {
    // SMTP not configured — log for manual delivery (dev/test mode)
    console.log(`[EMAIL VERIFY] Para: ${to} | Código: ${code}`);
    return;
  }
  await transport.sendMail({
    from:    process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: 'FitTrack — Código de verificação',
    text:    `Seu código de verificação é: ${code}\n\nEle expira em 15 minutos.`,
    html:    `<p>Seu código de verificação é: <strong>${code}</strong></p><p>Ele expira em 15 minutos.</p>`,
  });
}

module.exports = { sendVerificationCode };
