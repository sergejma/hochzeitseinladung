/* ============================================
   HOCHZEITSEINLADUNG — hero.js
   Scroll-driven Canvas Frame Sequence
   + Preloader + Text Animations
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
      this.currentFrame = 0;
      this.ready = false;
    }

    // Build padded filename: hero-0001.webp
    framePath(index) {
      const num = String(index + 1).padStart(4, '0');
      return `${this.config.folder}${this.config.prefix}${num}.${this.config.ext}`;
    }

    // Preload all frames, return promise
    preload() {
      return new Promise((resolve) => {
        for (let i = 0; i < this.config.totalFrames; i++) {
          const img = new Image();
          img.src = this.framePath(i);
          img.onload = () => {
            this.loaded++;
            if (this.loaded === this.config.totalFrames) {
              this.ready = true;
              resolve();
            }
          };
          img.onerror = () => {
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

    // Render frame to canvas (cover-fit, centered crop for mobile)
    render(frameIndex) {
      const idx = Math.max(0, Math.min(frameIndex, this.config.totalFrames - 1));
      if (idx === this.currentFrame && this.ready) return;
      this.currentFrame = idx;

      const img = this.images[idx];
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const canvas = this.canvas;
      const ctx = this.ctx;
      const cw = canvas.width;
      const ch = canvas.height;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;

      // Cover-fit calculation
      const scale = Math.max(cw / iw, ch / ih);
      const sw = cw / scale;
      const sh = ch / scale;
      const sx = (iw - sw) / 2;
      const sy = (ih - sh) / 2;

      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
    }

    // Resize canvas to match display size
    resize() {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.render(this.currentFrame);
    }

    // Setup GSAP ScrollTrigger
    setupScrollTrigger() {
      const self = this;

      ScrollTrigger.create({
        trigger: this.config.section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        onUpdate: (st) => {
          const frame = Math.round(st.progress * (self.config.totalFrames - 1));
          self.render(frame);
        }
      });
    }
  }

  // ---- Navigation ----
  function setupNav() {
    const nav = document.getElementById('nav');

    ScrollTrigger.create({
      trigger: '.section--details',
      start: 'top 90%',
      onEnter: () => nav.classList.add('visible'),
      onLeaveBack: () => nav.classList.remove('visible')
    });
  }

  // ---- Hero Text: 3D Word Fly-In ----
  function setupHeroTextAnimation() {
    const words = gsap.utils.toArray('.hero-title-word');
    if (!words.length) return;

    // Initial state: words invisible and displaced
    gsap.set(words, {
      opacity: 0,
      y: 80,
      rotateX: -90,
      transformOrigin: '50% 50% -40px'
    });

    // Fly-in timeline pinned to scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.section--hero',
        start: 'top top',
        end: '25% top',
        scrub: 0.6
      }
    });

    tl.to(words, {
      opacity: 1,
      y: 0,
      rotateX: 0,
      stagger: 0.15,
      duration: 1,
      ease: 'power3.out'
    });

    // Fade out on further scroll
    const tlOut = gsap.timeline({
      scrollTrigger: {
        trigger: '.section--hero',
        start: '50% top',
        end: '70% top',
        scrub: true
      }
    });

    tlOut.to('.hero-content', {
      opacity: 0,
      y: -80,
      duration: 1,
      ease: 'power2.in'
    });
  }

  // ---- Details Section Animation ----
  function setupDetailsAnimation() {
    const elements = gsap.utils.toArray('.details-inner > *');
    elements.forEach((el, i) => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        delay: i * 0.2,
        ease: 'power2.out'
      });
    });
  }

  // ---- RSVP Section Animation ----
  function setupRsvpAnimation() {
    gsap.from('.rsvp-inner', {
      scrollTrigger: {
        trigger: '.section--rsvp',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out'
    });
  }

  // ---- Preloader ----
  function runPreloader(sequences) {
    const preloader = document.getElementById('preloader');
    const barFill = document.querySelector('.preloader-bar-fill');

    const totalFrames = sequences.reduce((sum, s) => sum + s.config.totalFrames, 0);

    // Update progress bar
    const interval = setInterval(() => {
      const loaded = sequences.reduce((sum, s) => sum + s.loaded, 0);
      const pct = Math.round((loaded / totalFrames) * 100);
      barFill.style.width = pct + '%';
    }, 50);

    // Wait for all sequences
    return Promise.all(sequences.map((s) => s.preload())).then(() => {
      clearInterval(interval);
      barFill.style.width = '100%';

      return new Promise((resolve) => {
        setTimeout(() => {
          preloader.classList.add('hidden');
          resolve();
        }, 400);
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
    setupNav();
    setupHeroTextAnimation();
    setupDetailsAnimation();
    setupRsvpAnimation();

    ScrollTrigger.refresh();
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
