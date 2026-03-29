# Hochzeitseinladung — Technische Referenz

## Zweck
Digitale Einladung zur Hochzeitsfeier am 4. Juli 2026.

## Tech Stack
- Vanilla HTML + CSS + JS (kein Framework)
- GSAP 3.12 + ScrollTrigger (CDN)
- Canvas Frame Sequence fuer Hero Scroll-Video
- Typeform Embed fuer RSVP
- Playwright (npm) fuer visuelles Testen
- @fal-ai/client (npm) fuer KI-generierte Assets
- ffmpeg fuer Frame-Extraktion

## Sektionen
1. **Hero** — Scroll-Video mit 3D-Wort-Fly-In Text-Overlay
2. **Wann & Wo** — Datum, Uhrzeit, Ort mit Kalenderbild
3. **RSVP** — Eingebettetes Typeform-Formular (Deadline: 30. Mai)

## Frame-Pipeline
1. Hochzeitsvideo beschaffen (Download oder eigenes Video)
2. Ablegen als `assets/videos/hero.mp4`
3. 90 WebP-Frames extrahieren: `node scripts/extract-frames.mjs assets/videos/hero.mp4 assets/hero-frames/ hero 90`

## Entwicklung
- `npm run dev` startet Server auf Port 8765
- `npm run test-screenshots` erfasst Scroll-Positionen via Playwright
- `npm run extract-frames` konvertiert Video zu WebP-Frames
