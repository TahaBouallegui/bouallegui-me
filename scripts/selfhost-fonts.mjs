// Copyright (c) 2026 Ahmed Taha Bouallegui
// SPDX-License-Identifier: GPL-3.0-or-later

// Re-download the latin subset of the three families used by the site into fonts/.
// Run: make fonts   (needs node and network access)
//
// Google serves identical bytes for every weight of a variable family, so files are
// deduplicated by content hash: one woff2 per family, one @font-face per weight.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const URL = 'https://fonts.googleapis.com/css2?' +
  'family=Inter:wght@400;500;600;700' +
  '&family=Space+Grotesk:wght@500;600;700' +
  '&family=JetBrains+Mono:wght@400;500;700&display=swap';

const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

const css = execFileSync('curl', ['-sfL', '-A', UA, URL]).toString();
rmSync('fonts', { recursive: true, force: true });
mkdirSync('fonts/files', { recursive: true });

const blocks = css.split('/*').map(b => '/*' + b).filter(b => b.startsWith('/* latin */'));
if (!blocks.length) { console.error('no latin @font-face blocks found - did the request succeed?'); process.exit(1); }

const byHash = new Map();
let out = '/* Self-hosted latin subsets: Inter, Space Grotesk, JetBrains Mono.\n' +
          '   One woff2 per family; regenerate with `make fonts`. Do not hand-edit. */\n\n';

for (const block of blocks) {
  const family = /font-family:\s*'([^']+)'/.exec(block)?.[1];
  const weight = /font-weight:\s*(\d+)/.exec(block)?.[1];
  const src = /src:\s*url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/.exec(block)?.[1];
  const range = /unicode-range:\s*([^;]+);/.exec(block)?.[1];
  if (!family || !weight || !src) continue;

  const bytes = execFileSync('curl', ['-sfL', '-A', UA, src]);
  const hash = createHash('sha256').update(bytes).digest('hex');
  let file = byHash.get(hash);
  if (!file) {
    file = `${family.replace(/\s+/g, '')}.woff2`;
    byHash.set(hash, file);
    writeFileSync(`fonts/files/${file}`, bytes);
    console.log(`  ${family}: fonts/files/${file} (${bytes.length} bytes)`);
  }

  out += `/* ${family} ${weight} - latin */\n` +
         `@font-face {\n  font-family: '${family}';\n  font-style: normal;\n` +
         `  font-weight: ${weight};\n  font-display: swap;\n` +
         `  src: url('./files/${file}') format('woff2');\n` +
         `  unicode-range: ${range};\n}\n\n`;
}

writeFileSync('fonts/fonts.css', out);
console.log(`wrote fonts/fonts.css: ${(out.match(/@font-face/g) || []).length} faces, ${byHash.size} files`);
