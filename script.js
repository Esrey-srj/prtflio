

// polished particle field + subtle parallax + GSAP scroll reveals
(() => {
  // Canvas setup
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d');
  let W = canvas.width = innerWidth;
  let H = canvas.height = innerHeight;
  const particles = [];
  const TAU = Math.PI * 2;
  const palette = ['#7df9ff', '#c86fff', '#ff4dd2', '#8b5cff'];

  // Build initial particles (soft blobs + small dots)
  function buildParticles() {
    particles.length = 0;
    const n = Math.max(40, Math.floor((W * H) / 60000)); // scale
    for (let i = 0; i < n; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 40 + 6,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        hue: palette[Math.floor(Math.random() * palette.length)],
        alpha: 0.08 + Math.random() * 0.12,
        type: Math.random() > 0.7 ? 'dot' : 'blob'
      });
    }
  }

  function render() {
    ctx.clearRect(0, 0, W, H);

    // subtle background gradient
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, 'rgba(6,2,12,0.5)');
    g.addColorStop(1, 'rgba(2,0,6,0.7)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    for (let p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      // wrap around edges
      if (p.x < -100) p.x = W + 100;
      if (p.x > W + 100) p.x = -100;
      if (p.y < -100) p.y = H + 100;
      if (p.y > H + 100) p.y = -100;

      // draw particles
      if (p.type === 'blob') {
        const rg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2);
        rg.addColorStop(0, hexToRgba(p.hue, p.alpha));
        rg.addColorStop(1, hexToRgba(p.hue, 0));
        ctx.beginPath();
        ctx.fillStyle = rg;
        ctx.arc(p.x, p.y, p.r * 1.7, 0, TAU);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.fillStyle = hexToRgba(p.hue, 0.22);
        ctx.arc(p.x, p.y, Math.max(1.2, p.r / 10), 0, TAU);
        ctx.fill();
      }
    }

    requestAnimationFrame(render);
  }

  // utility
  function hexToRgba(hex, a = 1) {
    const h = hex.replace('#', '');
    const bigint = parseInt(h, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r},${g},${b},${a})`;
  }

  // interactive mouse splashes
  let mouse = { x: W / 2, y: H / 2 };
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    // add small bright dots near mouse
    for (let i = 0; i < 3; i++) {
      particles.push({
        x: e.clientX + (Math.random() - 0.5) * 40,
        y: e.clientY + (Math.random() - 0.5) * 40,
        r: Math.random() * 6 + 2,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        hue: palette[Math.floor(Math.random() * palette.length)],
        alpha: 0.6,
        type: 'dot'
      });
    }
    // limit growth
    if (particles.length > 300) particles.splice(0, 40);
  });

  // resize
  window.addEventListener('resize', () => {
    W = canvas.width = innerWidth;
    H = canvas.height = innerHeight;
    buildParticles();
  });

  // init
  buildParticles();
  render();

  // GSAP scroll reveals
  window.addEventListener('load', () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray('.panel-title, .panel-kicker, .story-step, .card, .hero-left, .hero-right, .contact-form').forEach((el, i) => {
      gsap.fromTo(el, { autoAlpha: 0, y: 40 }, {
        autoAlpha: 1, y: 0, duration: 1.0, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 82%', toggleActions: 'play none none reverse' },
        delay: i * 0.08
      });
    });

    // small parallax on diagram nodes
    const nodes = document.querySelectorAll('.diagram .node');
    nodes.forEach((n, idx) => {
      gsap.to(n, {
        y: idx % 2 ? -6 : 8,
        x: idx % 2 ? 6 : -8,
        ease: 'sine.inOut',
        duration: 6 + idx,
        repeat: -1,
        yoyo: true,
        opacity: 0.98
      });
    });

    // hover tilt for cards
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (py - 0.5) * 8;  // tilt X
        const ry = (px - 0.5) * -12; // tilt Y
        gsap.to(card, { rotationX: rx, rotationY: ry, transformPerspective: 600, transformOrigin: 'center', duration: 0.4, ease: 'power3.out' });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.6, ease: 'power3.out' });
      });
    });
  });
})(); 
