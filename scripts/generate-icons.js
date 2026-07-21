/**
 * Gera ícones PNG para o PWA usando sharp (já presente no projeto).
 * Execute: node scripts/generate-icons.js
 */
const sharp = require('sharp');
const path  = require('path');
const fs    = require('fs');

const OUT_DIR = path.join(__dirname, '../public/icons');
fs.mkdirSync(OUT_DIR, { recursive: true });

// Fundo laranja (#FF6B35) com "FT" branco centralizado via SVG
function iconSVG(size) {
  const pad    = Math.round(size * 0.18);
  const radius = Math.round(size * 0.22);
  const fs1    = Math.round(size * 0.36);
  const fs2    = Math.round(size * 0.20);
  const cy     = Math.round(size * 0.52);
  const cy2    = Math.round(size * 0.74);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="${size}" y2="${size}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#E85520"/>
      <stop offset="100%" stop-color="#FF8A60"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#g)"/>
  <text x="${size/2}" y="${cy}" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif"
    font-size="${fs1}" font-weight="800" letter-spacing="-1" fill="white">FIT</text>
  <text x="${size/2}" y="${cy2}" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif"
    font-size="${fs2}" font-weight="600" letter-spacing="4" fill="rgba(255,255,255,0.75)">TRACKER</text>
</svg>`;
}

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

async function main() {
  console.log('Gerando ícones PWA…');
  for (const size of SIZES) {
    const svgBuf = Buffer.from(iconSVG(size));
    const out    = path.join(OUT_DIR, `icon-${size}.png`);
    await sharp(svgBuf).png().toFile(out);
    console.log(`  ✓ icon-${size}.png`);
  }

  // apple-touch-icon: 180×180
  const atiBuf = Buffer.from(iconSVG(180));
  await sharp(atiBuf).png().toFile(path.join(OUT_DIR, 'apple-touch-icon.png'));
  console.log('  ✓ apple-touch-icon.png');

  // maskable icon: 512×512 com padding extra (safe zone)
  const maskSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <rect width="512" height="512" fill="#FF6B35"/>
    <text x="256" y="286" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif"
      font-size="160" font-weight="800" letter-spacing="-4" fill="white">FIT</text>
  </svg>`;
  await sharp(Buffer.from(maskSVG)).png().toFile(path.join(OUT_DIR, 'icon-maskable.png'));
  console.log('  ✓ icon-maskable.png');

  console.log('\nPronto! Ícones em public/icons/');
}

main().catch(e => { console.error(e); process.exit(1); });
