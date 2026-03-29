#!/usr/bin/env node
/**
 * Frame-Extraktions-Script
 * Wandelt MP4-Videos in nummerierte WebP-Frames um
 *
 * Usage:
 *   node scripts/extract-frames.mjs assets/videos/hero.mp4 assets/hero-frames/ hero 90
 *
 * Args:
 *   1. Input video path
 *   2. Output folder
 *   3. Prefix (hero, bike, tennis)
 *   4. Number of frames to extract (default: 90)
 */

import { execSync } from 'child_process';
import { mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

const [,, inputVideo, outputDir, prefix = 'frame', totalFrames = '90'] = process.argv;

if (!inputVideo || !outputDir) {
  console.log(`
  Usage: node scripts/extract-frames.mjs <video> <output-dir> <prefix> <frames>

  Example:
    node scripts/extract-frames.mjs assets/videos/hero.mp4 assets/hero-frames/ hero 90
    node scripts/extract-frames.mjs assets/videos/bike.mp4 assets/bike-frames/ bike 90
    node scripts/extract-frames.mjs assets/videos/tennis.mp4 assets/tennis-frames/ tennis 90
  `);
  process.exit(1);
}

const framesCount = parseInt(totalFrames, 10);
const absInput = resolve(inputVideo);
const absOutput = resolve(outputDir);

// Create output dir
if (!existsSync(absOutput)) {
  mkdirSync(absOutput, { recursive: true });
}

// Check ffmpeg
try {
  execSync('ffmpeg -version', { stdio: 'ignore' });
} catch {
  console.error('ffmpeg nicht gefunden! Installiere mit: brew install ffmpeg');
  process.exit(1);
}

// Get video duration
const durationStr = execSync(
  `ffprobe -v error -show_entries format=duration -of csv=p=0 "${absInput}"`,
  { encoding: 'utf-8' }
).trim();
const duration = parseFloat(durationStr);

console.log(`Video: ${absInput}`);
console.log(`Dauer: ${duration.toFixed(2)}s`);
console.log(`Extrahiere ${framesCount} Frames als WebP...`);

// Calculate fps to get exact frame count
const fps = framesCount / duration;

// Extract frames with ffmpeg
const cmd = [
  'ffmpeg -y',
  `-i "${absInput}"`,
  `-vf "fps=${fps.toFixed(4)},scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2"`,
  `-c:v libwebp -quality 85`,
  `"${absOutput}/${prefix}-%04d.webp"`
].join(' ');

console.log(`\nRunning: ${cmd}\n`);

try {
  execSync(cmd, { stdio: 'inherit' });
  console.log(`\nFertig! ${framesCount} Frames gespeichert in ${absOutput}/`);
  console.log(`Dateien: ${prefix}-0001.webp bis ${prefix}-${String(framesCount).padStart(4, '0')}.webp`);
} catch (err) {
  console.error('Fehler beim Extrahieren:', err.message);
  process.exit(1);
}
