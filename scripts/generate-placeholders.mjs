#!/usr/bin/env node
/**
 * Generiert Platzhalter-Frames (farbige Gradienten mit Frame-Nummer)
 * zum Testen der Scroll-Animation ohne echte Videos
 */

import { mkdirSync, existsSync, writeFileSync } from 'fs';
import { resolve } from 'path';

async function generateWithPlaywright() {
  const { chromium } = await import('playwright');

  const sequences = [
    { folder: 'assets/hero-frames', prefix: 'hero', color1: '#FFE4C4', color2: '#1A1A1A', label: 'GEBURT' },
    { folder: 'assets/bike-frames', prefix: 'bike', color1: '#2D5016', color2: '#87CEEB', label: 'BIKES' },
    { folder: 'assets/tennis-frames', prefix: 'tennis', color1: '#F5F5DC', color2: '#228B22', label: 'TENNIS' },
  ];

  const TOTAL_FRAMES = 90;
  const WIDTH = 1920;
  const HEIGHT = 1080;

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });

  for (const seq of sequences) {
    const outDir = resolve(seq.folder);
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

    console.log(`Generiere ${TOTAL_FRAMES} Platzhalter fuer ${seq.label}...`);

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const progress = i / (TOTAL_FRAMES - 1);
      const frameNum = String(i + 1).padStart(4, '0');

      // Interpolate colors for gradient effect
      await page.setContent(`
        <html>
        <body style="margin:0; width:${WIDTH}px; height:${HEIGHT}px; display:flex; align-items:center; justify-content:center;
          background: linear-gradient(${progress * 360}deg, ${seq.color1}, ${seq.color2});
          font-family: -apple-system, sans-serif; color: white; text-align:center;">
          <div>
            <div style="font-size:120px; font-weight:800; opacity:0.3;">${seq.label}</div>
            <div style="font-size:48px; font-weight:300; margin-top:20px;">Frame ${i + 1} / ${TOTAL_FRAMES}</div>
            <div style="width:400px; height:4px; background:rgba(255,255,255,0.2); border-radius:2px; margin:30px auto 0;">
              <div style="width:${progress * 100}%; height:100%; background:white; border-radius:2px;"></div>
            </div>
          </div>
        </body>
        </html>
      `);

      const buffer = await page.screenshot({ type: 'png' });

      // Save as png (we'll rename to webp naming convention but keep png for placeholders)
      const filePath = `${outDir}/${seq.prefix}-${frameNum}.webp`;
      // Actually save as PNG but with .webp extension - browsers handle this fine
      writeFileSync(filePath, buffer);

      if ((i + 1) % 30 === 0) console.log(`  ${seq.label}: ${i + 1}/${TOTAL_FRAMES}`);
    }
  }

  await browser.close();
  console.log('\nAlle Platzhalter generiert!');
}

generateWithPlaywright().catch(console.error);
