// Juan Neyra · AAA prototype: intro, Lenis + ScrollTrigger, the loom curtain, chapters, cursor, magnetic buttons, player.
(function () {
  const root = document.documentElement;
  const css = n => getComputedStyle(root).getPropertyValue(n).trim();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const hasGsap = !!(window.gsap && window.ScrollTrigger);

  /* ---------- intro: 1 s, first visit of the session, skippable ---------- */
  const intro = $('#intro');
  let introDone = !root.classList.contains('has-intro');
  const introWaiters = [];
  function endIntro(skip) {
    if (introDone) return;
    introDone = true;
    try { sessionStorage.setItem('tp-intro', '1'); } catch (e) {}
    if (skip) intro.classList.add('is-out');
    setTimeout(() => { root.classList.remove('has-intro'); intro.remove(); }, skip ? 300 : 0);
    introWaiters.forEach(f => f());
  }
  const afterIntro = f => (introDone ? f() : introWaiters.push(f));
  if (!introDone) {
    try { sessionStorage.setItem('tp-intro', '1'); } catch (e) {}
    intro.addEventListener('click', () => endIntro(true));
    addEventListener('keydown', () => endIntro(true), { once: true });
    // timed from the first paint (set in <head>), not from when the CDN scripts arrive
    setTimeout(() => endIntro(false), Math.max(0, 1250 - (performance.now() - (window.__introT0 || 0))));
  } else if (intro) intro.remove();

  /* ---------- the loom (adapted from js/loom.js: same tocapus, same seed logic) ---------- */
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const MOTIFS = {
    rombo(x, y) { const d = Math.abs(x - 4) + Math.abs(y - 4); return d === 0 ? 2 : d <= 4 ? (d % 2 ? 1 : 0) : 0; },
    chakana(x, y) {
      const ax = Math.abs(x - 4), ay = Math.abs(y - 4);
      if (!ax && !ay) return 2;
      return (ax <= 1 && ay <= 3) || (ay <= 1 && ax <= 3) || (ax <= 2 && ay <= 2) ? 1 : 0;
    },
    ojo(x, y) { const r = Math.max(Math.abs(x - 4), Math.abs(y - 4)); return r === 0 ? 2 : r % 2 === 0 ? 1 : 0; },
    damero(x, y) { return ((x / 3 | 0) + (y / 3 | 0)) % 2 ? 1 : (x % 3 === 1 && y % 3 === 1 ? 2 : 0); },
    zigzag(x, y) { return ((x + Math.abs((y % 4) - 2)) % 4) < 2 ? 1 : 0; },
    llave(x, y) { const d = (x + y) % 6, e = (x - y + 9) % 6; return d < 2 && e < 4 ? 1 : (d === 3 && e === 4 ? 2 : 0); },
  };
  const KINDS = Object.keys(MOTIFS);
  function randomMotif(r) {
    const q = [];
    for (let i = 0; i < 25; i++) q.push(r() < 0.45 ? 1 : 0);
    q[24] = 2;
    return (x, y) => q[(y > 4 ? 8 - y : y) * 5 + (x > 4 ? 8 - x : x)];
  }
  function lum(hex) {
    const n = parseInt(hex.replace('#', ''), 16);
    return (0.299 * (n >> 16 & 255) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) / 255;
  }
  function pair(r, cols) {
    for (let i = 0; i < 20; i++) {
      const a = cols[r() * cols.length | 0], b = cols[r() * cols.length | 0];
      if (a !== b && Math.abs(lum(a) - lum(b)) > 0.22) return [a, b];
    }
    return [cols[0], cols[cols.length - 1]];
  }
  // grid of threads: rows of tocapus (9×9 motif + 1 frame thread) with zigzag bands between rows
  function weave(cols, rows, seed, cs, frame, darks) {
    const r = rng(seed);
    const grid = Array.from({ length: rows }, () => new Array(cols).fill(frame));
    let y = 1, rowIndex = 0;
    while (y < rows) {
      if (rowIndex > 0) {
        const [c1, c2] = pair(r, cs);
        for (let by = 0; by < 3 && y + by < rows; by++)
          for (let x = 0; x < cols; x++)
            grid[y + by][x] = ((x + (by === 1 ? 2 : 0)) % 4 < 2) === (by !== 2) ? c1 : c2;
        y += 4;
      }
      for (let tx = 1; tx < cols; tx += 10) {
        const kind = r() < 0.25 ? null : KINDS[r() * KINDS.length | 0];
        const f = kind ? MOTIFS[kind] : randomMotif(r);
        let [bg, fg] = pair(r, cs);
        if (darks && r() < 0.4) { bg = darks[r() * darks.length | 0]; if (lum(fg) < 0.3) fg = cs[cs.length - 1]; }
        let acc = cs[r() * cs.length | 0];
        if (acc === fg || acc === bg) acc = cs[cs.length - 1];
        for (let my = 0; my < 9; my++) for (let mx = 0; mx < 9; mx++) {
          const gx = tx + mx, gy = y + my;
          if (gx >= cols || gy >= rows) continue;
          const v = f(mx, my);
          grid[gy][gx] = v === 0 ? bg : v === 1 ? fg : acc;
        }
      }
      y += 10;
      rowIndex++;
    }
    return grid;
  }
  function paintRows(ctx, grid, u, from, to) {
    for (let y = from; y < to && y < grid.length; y++) {
      const row = grid[y];
      for (let x = 0; x < row.length; x++) { ctx.fillStyle = row[x]; ctx.fillRect(x * u, y * u, u, u); }
    }
  }
  function fitCanvas(canvas, unitDiv, min, max) {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const u = Math.max(min, Math.min(max, Math.round(rect.width / unitDiv)));
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    return { ctx, u, cols: Math.ceil(rect.width / u) + 1, rows: Math.ceil(rect.height / u) + 1, w: rect.width, h: rect.height };
  }

  // Curtain: weaves top to bottom as `progress` goes 0 → 1, with the shuttle (a pass of light wool) on the front
  function Curtain(canvas) {
    let g, grid, done = 0, progress = 0;
    const yarns = ['--cochinilla', '--maiz', '--chilca', '--qocha', '--anil-2', '--lana'].map(css);
    const darks = [css('--noche'), css('--anil-2')];
    function build() {
      g = fitCanvas(canvas, 120, 7, 14);
      grid = weave(g.cols, g.rows, 0x7e1a5, yarns, css('--noche'), darks);
      done = 0;
      draw(progress);
    }
    function draw(p) {
      progress = p;
      if (!g) return;
      const target = Math.round(g.rows * Math.min(1, Math.max(0, p)));
      if (target < done) { g.ctx.clearRect(0, target * g.u, g.w, g.h); done = target; }
      else if (target > done) { paintRows(g.ctx, grid, g.u, done, target); done = target; }
      // the shuttle line rides just under the woven edge
      if (done > 0 && done < g.rows) {
        g.ctx.clearRect(0, done * g.u, g.w, g.h);
        g.ctx.fillStyle = css('--lana');
        g.ctx.fillRect(0, done * g.u, g.w, Math.max(2, g.u / 3));
      }
    }
    let t;
    addEventListener('resize', () => { clearTimeout(t); t = setTimeout(build, 150); });
    build();
    return { draw, full: () => draw(1) };
  }

  // Blobvarium's cloth: the same loom in moss, clay and cream, painted once
  function cloth(canvas) {
    const g = fitCanvas(canvas, 110, 6, 12);
    const grid = weave(g.cols, g.rows, 0xb10b, [css('--moss'), css('--clay'), css('--maiz'), css('--moss-ink'), css('--cream')], css('--moss-ink'));
    paintRows(g.ctx, grid, g.u, 0, g.rows);
  }

  const curtain = Curtain($('.weave'));
  const clothCanvas = $('.stage__cloth');
  cloth(clothCanvas);
  let ct;
  addEventListener('resize', () => { clearTimeout(ct); ct = setTimeout(() => cloth(clothCanvas), 200); });

  /* ---------- videos: background loops play only on screen; shots play on hover (or when centred on touch) ---------- */
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    const v = e.target;
    if (e.isIntersecting) { v.play().catch(() => {}); v.closest('.shot, .game')?.classList.add('is-playing'); }
    else { v.pause(); v.closest('.shot, .game')?.classList.remove('is-playing'); }
  }), { threshold: 0.6 });
  $$('video[data-auto]').forEach(v => io.observe(v));
  $$('.shot video, .game video').forEach(v => {
    if (finePointer) {
      const host = v.closest('.shot, .game');
      host.addEventListener('mouseenter', () => v.play().catch(() => {}));
      host.addEventListener('mouseleave', () => v.pause());
    } else io.observe(v);
  });
  // the hero reel pauses when it leaves the screen
  const reel = $('.hero__reel');
  new IntersectionObserver(([e]) => (e.isIntersecting ? reel.play().catch(() => {}) : reel.pause())).observe(reel);

  /* ---------- cinema player ---------- */
  const player = $('#player'), pv = $('.player__video', player);
  let lastFocus = null;
  function openPlayer(src, muted) {
    lastFocus = document.activeElement;
    player.hidden = false;
    pv.src = src; pv.muted = !!muted; pv.currentTime = 0;
    pv.play().catch(() => {});
    lenis?.stop();
    if (hasGsap && !reduced) {
      gsap.fromTo('.player__bar', { scaleY: 4.2 }, { scaleY: 1, duration: .7, ease: 'expo.out' });
      gsap.fromTo(pv, { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: .6, ease: 'power3.out' });
    }
    $('.player__close', player).focus();
  }
  function closePlayer() {
    pv.pause(); pv.removeAttribute('src'); pv.load();
    player.hidden = true;
    lenis?.start();
    lastFocus?.focus();
  }
  $$('[data-reel-open]').forEach(el => el.addEventListener('click', () => openPlayer('media/reel.mp4', true)));
  $$('[data-trailer]').forEach(el => el.addEventListener('click', () => openPlayer(el.dataset.trailer, false)));
  $('.player__close', player).addEventListener('click', closePlayer);
  addEventListener('keydown', e => { if (e.key === 'Escape' && !player.hidden) closePlayer(); });

  /* ---------- custom cursor + magnetic buttons (fine pointers only) ---------- */
  if (finePointer && !reduced) {
    root.classList.add('has-cursor');
    const cur = $('.cursor'), label = $('.cursor__label');
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; cur.classList.add('is-on'); });
    document.addEventListener('pointerleave', () => cur.classList.remove('is-on'));
    (function loop() {
      cx += (x - cx) * 0.2; cy += (y - cy) * 0.2;
      cur.style.translate = `${cx}px ${cy}px`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener('pointerover', e => {
      const media = e.target.closest('[data-cursor]');
      const link = e.target.closest('a, button');
      cur.classList.toggle('is-media', !!media);
      cur.classList.toggle('is-link', !media && !!link);
      if (media) label.textContent = media.dataset.cursor;
    });

    $$('.magnetic').forEach(btn => {
      const inner = $('.btn__in', btn);
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        if (hasGsap) {
          gsap.to(btn, { x: dx * 0.35, y: dy * 0.45, duration: .5, ease: 'power3.out' });
          gsap.to(inner, { x: dx * 0.15, y: dy * 0.2, duration: .5, ease: 'power3.out' });
        }
      });
      btn.addEventListener('pointerleave', () => {
        if (hasGsap) gsap.to([btn, inner], { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, .35)' });
      });
    });
  }

  /* ---------- without GSAP the page is still whole: everything visible, the loom drawn as a hem ---------- */
  let lenis = null;
  if (!hasGsap) { curtain.full(); return; }
  root.classList.add('gsap-ok');
  gsap.registerPlugin(ScrollTrigger);

  if (!reduced && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const target = $(a.getAttribute('href'));
      if (target) { e.preventDefault(); lenis.scrollTo(target, { duration: 1.6 }); }
    }));
  }

  /* reveals: masked lines rise with a stagger (reduced motion: plain fades) */
  function reveal(scope, delay = 0) {
    const lines = $$('.mask > span', scope), fades = $$('.reveal-fade', scope);
    const tl = gsap.timeline({ delay });
    if (reduced) {
      gsap.set(lines, { yPercent: 0, y: 0 });
      tl.fromTo([...lines.map(l => l.parentNode), ...fades], { opacity: 0 }, { opacity: 1, duration: .6, stagger: .05 });
    } else {
      // y: 0 clears the CSS start offset, which GSAP would otherwise read as pixels on top of yPercent
      if (lines.length) tl.fromTo(lines, { y: 0, yPercent: 110 }, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: .08 });
      if (fades.length) tl.fromTo(fades, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .08 }, lines.length ? '-=.8' : 0);
    }
    return tl;
  }

  // hero waits for the intro to lift
  afterIntro(() => reveal($('.hero__content'), .1));

  [['.chapter--inf .stage__copy'], ['.chapter--blob .stage__copy'], ['.trophies'], ['.more'], ['.footer']].forEach(([sel]) => {
    const el = $(sel);
    ScrollTrigger.create({ trigger: el, start: 'top 72%', once: true, onEnter: () => reveal(el) });
  });
  $$('.shot, .game').forEach(el => gsap.fromTo(el, { opacity: 0, y: reduced ? 0 : 50 }, {
    opacity: 1, y: 0, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 92%', once: true },
  }));

  /* page colour follows the chapter on screen */
  const setTheme = el => gsap.to(root, {
    '--page-bg': css(el.dataset.bg), '--page-ink': css(el.dataset.ink || '--cream'),
    duration: reduced ? 0.01 : 0.9, ease: 'power2.out', overwrite: true,
  });
  ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom 55%', onEnterBack: () => setTheme({ dataset: { bg: '--night', ink: '--cream' } }) });
  $$('[data-bg]').forEach(el => ScrollTrigger.create({
    trigger: el, start: 'top 55%', end: 'bottom 55%',
    onEnter: () => setTheme(el), onEnterBack: () => setTheme(el),
  }));

  /* trophy counters */
  $$('[data-count]').forEach(el => {
    const n = +el.dataset.count, o = { v: 0 };
    el.textContent = '0';
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => gsap.to(o, { v: n, duration: reduced ? 0.01 : 1.8, ease: 'power3.out', onUpdate: () => (el.textContent = Math.round(o.v)) }),
    });
  });

  if (reduced) { curtain.full(); return; }

  const mm = gsap.matchMedia();

  // desktop: the hero holds while the loom weaves it shut, then the cloth rises with the page and chapter 01 is under it
  mm.add('(min-width: 900px)', () => {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=150%', pin: true, scrub: 0.6, anticipatePin: 1, refreshPriority: 10 },
    });
    const p = { v: 0 };
    tl.to('.hero__content, .scroll-cue', { y: -90, opacity: 0, ease: 'power2.in', duration: .3 }, 0)
      .to('.hero__reel', { scale: 1.12, ease: 'none', duration: .85 }, 0)
      .to(p, { v: 1, ease: 'none', duration: .7, onUpdate: () => curtain.draw(p.v) }, .1)
      .fromTo('.weave-card', { opacity: 0, scale: .92 }, { opacity: 1, scale: 1, ease: 'power3.out', duration: .15 }, .8);

    // chapters pin; layers drift at their own depth
    // pins refresh first (refreshPriority), so the colour and reveal triggers measure with their spacing
    $$('.chapter .stage').forEach((stage, i) => {
      const ctl = gsap.timeline({
        scrollTrigger: { trigger: stage, start: 'top top', end: '+=90%', pin: true, scrub: 0.8, refreshPriority: 9 - i },
      });
      $$('.layer', stage).forEach(l => {
        const d = +l.dataset.depth || 0;
        ctl.fromTo(l, { y: d * 260 }, { y: -d * 260, ease: 'none' }, 0);
      });
      ctl.fromTo($('.stage__bg video, .stage__cloth', stage), { scale: 1.12 }, { scale: 1, ease: 'none' }, 0);
    });
    return () => curtain.draw(0);
  });

  // phones: no pin; the loom weaves over the hero as it scrolls away
  mm.add('(max-width: 899px)', () => {
    const p = { v: 0 };
    gsap.to(p, {
      v: 1, ease: 'none', onUpdate: () => curtain.draw(p.v),
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 20%', scrub: 0.4 },
    });
    gsap.to('.weave-card', { opacity: 1, scrollTrigger: { trigger: '.hero', start: '55% top', end: '75% top', scrub: true } });
  });

  ScrollTrigger.sort();
  ScrollTrigger.refresh();
  addEventListener('load', () => ScrollTrigger.refresh());
})();
