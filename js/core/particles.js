/**
 * Zettbos LMS - Cyber Particle Network Engine (referensi2.html craft)
 * js/core/particles.js
 */

const ZettParticleEngine = {
  canvas: null,
  ctx: null,
  particles: [],
  animationFrameId: null,
  mouse: { x: null, y: null },
  isRunning: false,
  width: 0,
  height: 0,

  init() {
    this.canvas = document.getElementById('particles-canvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;

    // Respect user reduced-motion preference
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    this.resize();
    this.createParticles();
    this.bindEvents();
    this.start();
  },

  resize() {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
  },

  createParticles() {
    this.particles = [];
    const area = this.width * this.height;
    // Balanced density matching referensi2.html
    const count = Math.min(Math.max(Math.floor(area / 16000), 25), 110);
    const color = '#00ff84'; // Neon Green Zettbos

    for (let i = 0; i < count; i++) {
      const size = Math.random() * 2 + 1; // 1px to 3px
      const x = Math.random() * (this.width - size * 4) + size * 2;
      const y = Math.random() * (this.height - size * 4) + size * 2;
      const vx = (Math.random() * 0.4) - 0.2;
      const vy = (Math.random() * 0.4) - 0.2;

      this.particles.push({
        x,
        y,
        vx,
        vy,
        size,
        color
      });
    }
  },

  bindEvents() {
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.resize();
        this.createParticles();
      }, 200);
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });

    // Pause on background tab to save battery
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else {
        this.start();
      }
    });
  },

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    const loop = () => {
      if (!this.isRunning) return;
      this.updateAndDraw();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  },

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  },

  updateAndDraw() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const isLight = document.documentElement.classList.contains('light');

    ctx.clearRect(0, 0, w, h);

    const len = this.particles.length;
    const baseColor = isLight ? '#059669' : '#00ff84';
    const rgbLine = isLight ? '5, 150, 105' : '0, 255, 132';

    // 1. Update position & Draw particles
    for (let i = 0; i < len; i++) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > w) p.vx = -p.vx;
      if (p.y < 0 || p.y > h) p.vy = -p.vy;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2, false);
      ctx.fillStyle = baseColor;
      ctx.fill();
    }

    // 2. Connect particles with dynamic constellation lines
    const maxDist = (w / 7) * (h / 7);
    const lineFactor = isLight ? 0.35 : 0.65;

    for (let a = 0; a < len; a++) {
      const pA = this.particles[a];

      // Proximity to mouse
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dxM = pA.x - this.mouse.x;
        const dyM = pA.y - this.mouse.y;
        const distM = dxM * dxM + dyM * dyM;
        if (distM < 18000) { // ~134px
          const mOpacity = (1 - (distM / 18000)) * (isLight ? 0.5 : 0.85);
          ctx.strokeStyle = `rgba(${rgbLine}, ${mOpacity})`;
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(pA.x, pA.y);
          ctx.lineTo(this.mouse.x, this.mouse.y);
          ctx.stroke();
        }
      }

      // Proximity to other particles
      for (let b = a + 1; b < len; b++) {
        const pB = this.particles[b];
        const dx = pA.x - pB.x;
        const dy = pA.y - pB.y;
        const dist = dx * dx + dy * dy;

        if (dist < maxDist && dist < 22000) {
          const opacity = (1 - (dist / 22000)) * lineFactor;
          if (opacity > 0) {
            ctx.strokeStyle = `rgba(${rgbLine}, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pA.x, pA.y);
            ctx.lineTo(pB.x, pB.y);
            ctx.stroke();
          }
        }
      }
    }
  }
};

window.ZettParticleEngine = ZettParticleEngine;
