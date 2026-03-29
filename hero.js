/* ============================================
   HOCHZEITSEINLADUNG — hero.js
   Scroll-driven Canvas Frame Sequence
   + Preloader + Elegant Animations
   ============================================ */

(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  // ---- Config ----
  const FRAME_SEQUENCES = [
    {
      id: 'hero',
      canvas: '#hero-canvas',
      section: '.section--hero',
      folder: 'assets/hero-frames/',
      prefix: 'hero-',
      totalFrames: 121,
      ext: 'jpg'
    }
  ];

  // ---- Frame Sequence Engine ----
  class FrameSequence {
    constructor(config) {
      this.config = config;
      this.canvas = document.querySelector(config.canvas);
      this.ctx = this.canvas.getContext('2d');
      this.images = [];
      this.loaded = 0;
      this.currentFrame = -1;
      this.ready = false;
    }

    framePath(index) {
      const num = String(index + 1).padStart(4, '0');
      return `${this.config.folder}${this.config.prefix}${num}.${this.config.ext}`;
    }

    preload() {
      return new Promise((resolve) => {
        for (let i = 0; i < this.config.totalFrames; i++) {
          const img = new Image();
          img.src = this.framePath(i);
          img.onload = img.onerror = () => {
            this.loaded++;
            if (this.loaded === this.config.totalFrames) {
              this.ready = true;
              resolve();
            }
          };
          this.images[i] = img;
        }
      });
    }

    render(frameIndex) {
      const idx = Math.max(0, Math.min(frameIndex, this.config.totalFrames - 1));
      if (idx === this.currentFrame) return;
      this.currentFrame = idx;

      const img = this.images[idx];
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const canvas = this.canvas;
      const ctx = this.ctx;
      const cw = canvas.width;
      const ch = canvas.height;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;

      const scale = Math.max(cw / iw, ch / ih);
      const sw = cw / scale;
      const sh = ch / scale;
      const sx = (iw - sw) / 2;
      const sy = (ih - sh) / 2;

      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.currentFrame = -1; // force re-render
      this.render(Math.max(0, this.currentFrame));
    }

    setupScrollTrigger() {
      const self = this;
      ScrollTrigger.create({
        trigger: this.config.section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.4,
        onUpdate: (st) => {
          const frame = Math.round(st.progress * (self.config.totalFrames - 1));
          self.render(frame);
        }
      });
    }
  }

  // ---- Hero Text Animations ----
  function setupHeroTextAnimation() {
    const overtitle = document.querySelector('.hero-overtitle');
    const words = gsap.utils.toArray('.hero-title-word');
    const scrollHint = document.querySelector('.hero-scroll-hint');

    if (!words.length) return;

    // Initial state
    gsap.set(overtitle, { opacity: 0, y: 20 });
    gsap.set(words, { opacity: 0, y: 60, rotateX: -45, transformOrigin: '50% 100%' });

    // Entrance timeline — plays on scroll
    const tlIn = gsap.timeline({
      scrollTrigger: {
        trigger: '.section--hero',
        start: 'top top',
        end: '18% top',
        scrub: 0.6
      }
    });

    tlIn.to(overtitle, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' })
      .to(words, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        stagger: 0.12,
        duration: 0.8,
        ease: 'power3.out'
      }, '-=0.2');

    // Exit timeline
    const tlOut = gsap.timeline({
      scrollTrigger: {
        trigger: '.section--hero',
        start: '55% top',
        end: '72% top',
        scrub: true
      }
    });

    tlOut.to('.hero-content', {
      opacity: 0,
      y: -60,
      scale: 0.97,
      duration: 1,
      ease: 'power2.in'
    });

    // Scroll hint fades out early
    if (scrollHint) {
      gsap.to(scrollHint, {
        scrollTrigger: {
          trigger: '.section--hero',
          start: '5% top',
          end: '12% top',
          scrub: true
        },
        opacity: 0
      });
    }
  }

  // ---- Details Section ----
  function setupDetailsAnimation() {
    const ornament = document.querySelector('.section--details .section-ornament');
    const label = document.querySelector('.details-label');
    const heading = document.querySelector('.section--details .section-heading');
    const card = document.querySelector('.details-card');
    const note = document.querySelector('.details-note');

    const elements = [ornament, label, heading, card, note].filter(Boolean);

    elements.forEach((el, i) => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none reverse'
        },
        y: 40,
        opacity: 0,
        duration: 1,
        delay: i * 0.12,
        ease: 'power2.out'
      });
    });
  }

  // ---- RSVP Section ----
  function setupRsvpAnimation() {
    const ornament = document.querySelector('.section--rsvp .section-ornament');
    const label = document.querySelector('.rsvp-label');
    const heading = document.querySelector('.section--rsvp .section-heading');
    const text = document.querySelector('.rsvp-text');
    const form = document.querySelector('.typeform-container');

    const elements = [ornament, label, heading, text, form].filter(Boolean);

    elements.forEach((el, i) => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none reverse'
        },
        y: 40,
        opacity: 0,
        duration: 1,
        delay: i * 0.12,
        ease: 'power2.out'
      });
    });
  }

  // ---- Preloader ----
  function runPreloader(sequences) {
    const preloader = document.getElementById('preloader');
    const barFill = document.querySelector('.preloader-bar-fill');

    const totalFrames = sequences.reduce((sum, s) => sum + s.config.totalFrames, 0);

    const interval = setInterval(() => {
      const loaded = sequences.reduce((sum, s) => sum + s.loaded, 0);
      const pct = Math.round((loaded / totalFrames) * 100);
      barFill.style.width = pct + '%';
    }, 50);

    return Promise.all(sequences.map((s) => s.preload())).then(() => {
      clearInterval(interval);
      barFill.style.width = '100%';

      return new Promise((resolve) => {
        setTimeout(() => {
          preloader.classList.add('hidden');
          resolve();
        }, 600);
      });
    });
  }

  // ---- Init ----
  async function init() {
    const sequences = FRAME_SEQUENCES.map((cfg) => new FrameSequence(cfg));

    sequences.forEach((s) => s.resize());
    window.addEventListener('resize', () => sequences.forEach((s) => s.resize()));

    await runPreloader(sequences);

    sequences.forEach((s) => {
      if (s.ready) s.render(0);
    });

    sequences.forEach((s) => s.setupScrollTrigger());
    setupHeroTextAnimation();
    setupDetailsAnimation();
    setupRsvpAnimation();

    ScrollTrigger.refresh();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
