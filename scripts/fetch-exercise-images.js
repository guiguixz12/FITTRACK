#!/usr/bin/env node
// Downloads exercise images from free-exercise-db for exercises with alta/media confidence.
// Saves to public/images/exercises/<slug-pt>/0.jpg and 1.jpg.
// Skips exercises with null db_id. Creates no broken paths.

const fs   = require('fs');
const path = require('path');
const https = require('https');

const MAP     = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/exercise_image_map.json'), 'utf8'));
const OUT_DIR = path.join(__dirname, '../public/images/exercises');
const BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
const DB      = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/free_exercise_db.json'), 'utf8'));

const byId = {};
DB.forEach(e => { byId[e.id] = e; });

function slugify(name) {
  return name
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const tmp = dest + '.tmp';
    const file = fs.createWriteStream(tmp);
    https.get(url, res => {
      if (res.statusCode !== 200) {
        file.close();
        fs.unlink(tmp, () => {});
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          fs.rename(tmp, dest, err => err ? reject(err) : resolve());
        });
      });
    }).on('error', err => {
      file.close();
      fs.unlink(tmp, () => {});
      reject(err);
    });
  });
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const entries = Object.entries(MAP).filter(([, v]) => v.db_id && (v.confidence === 'alta' || v.confidence === 'media'));
  const results = { ok: [], failed: [], skipped: [] };

  let i = 0;
  for (const [ptName, meta] of entries) {
    i++;
    const dbEntry = byId[meta.db_id];
    if (!dbEntry || !dbEntry.images || dbEntry.images.length < 1) {
      console.log(`[${i}/${entries.length}] SKIP (no images in DB): ${ptName}`);
      results.skipped.push(ptName);
      continue;
    }

    const slug    = slugify(ptName);
    const destDir = path.join(OUT_DIR, slug);
    fs.mkdirSync(destDir, { recursive: true });

    let allOk = true;
    for (let idx = 0; idx < Math.min(2, dbEntry.images.length); idx++) {
      const imgPath = dbEntry.images[idx];
      const url     = BASE_URL + imgPath;
      const dest    = path.join(destDir, `${idx}.jpg`);

      if (fs.existsSync(dest)) {
        // already downloaded
        continue;
      }

      try {
        await download(url, dest);
      } catch (err) {
        console.log(`  [FAIL] ${url} → ${err.message}`);
        allOk = false;
      }
    }

    if (allOk) {
      process.stdout.write(`[${i}/${entries.length}] OK: ${ptName} → ${slug}\n`);
      results.ok.push(ptName);
    } else {
      results.failed.push(ptName);
      // Remove dir if nothing downloaded successfully
      const files = fs.readdirSync(destDir);
      if (files.length === 0) fs.rmdirSync(destDir);
    }
  }

  console.log('\n=== DOWNLOAD CONCLUÍDO ===');
  console.log(`OK:      ${results.ok.length}`);
  console.log(`Falhou:  ${results.failed.length}`);
  console.log(`Pulado:  ${results.skipped.length}`);
  if (results.failed.length) {
    console.log('\nFalhas:');
    results.failed.forEach(n => console.log('  -', n));
  }
}

main().catch(err => { console.error(err); process.exit(1); });
