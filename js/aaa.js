// Juan Neyra · TeaParty Game Studio. Every game is a film chapter, built from js/data.js:
// intro, Lenis + ScrollTrigger, the loom curtain, chapters, cursor, magnetic buttons, player, EN/ES, sound, Konami.
(function () {
  const root = document.documentElement;
  const css = n => getComputedStyle(root).getPropertyValue(n).trim();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const h = (tag, attrs = {}, ...kids) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'style') el.style.cssText = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const k of kids.flat()) if (k != null && k !== false) el.append(k);
    return el;
  };

  /* ---------- language: English by default, same `lang` key as the classic site ---------- */
  let lang = 'en';
  try { lang = localStorage.getItem('lang') === 'es' ? 'es' : 'en'; } catch (e) {}
  const t = k => (UI[lang] && UI[lang][k]) || UI.en[k] || k;
  const pick = o => (o && typeof o === 'object' ? (o[lang] ?? o.en) : o);
  // a span that follows the language: from a UI key or from an { en, es } object
  const ui = (k, tag = 'span', attrs = {}) => h(tag, { ...attrs, 'data-i18n': k, text: t(k) });
  const tx = (o, tag = 'span', attrs = {}) => (o && typeof o === 'object'
    ? h(tag, { ...attrs, 'data-en': o.en, 'data-es': o.es ?? o.en, text: pick(o) })
    : h(tag, { ...attrs, text: o }));
  const mask = node => h('span', { class: 'mask' }, h('span', {}, node));
  const pad = n => String(n).padStart(2, '0');

  const ICONS = {
    browser: '<path d="M3 5h18v14H3zM3 9h18" fill="none" stroke="currentColor" stroke-width="2"/>',
    windows: '<path d="M3 5l8-1.2v7.7H3zM12 3.6L21 2v9.5h-9zM3 12.5h8v7.7L3 19zM12 12.5h9V22l-9-1.6z"/>',
    mobile: '<rect x="6" y="2" width="12" height="20" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>',
  };
  const svg = (paths, vb = '0 0 24 24') => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', vb); s.setAttribute('aria-hidden', 'true'); s.innerHTML = paths; return s; };
  const playIcon = () => svg('<path d="M0 0l10 6-10 6z"/>', '0 0 10 12');
  const ext = href => (/^https?:/.test(href) ? { target: '_blank', rel: 'noopener' } : {});
  // videos keep their poster in data-poster until they get close (see lazyPosters)
  const vid = (src, poster, attrs = {}) => h('video', { 'data-src-v': src, 'data-poster': poster, muted: true, loop: true, playsinline: true, preload: 'none', ...attrs });

  /* ---------- build: chapters, more games, trophies, brands, studio ---------- */
  const games = PROJECTS.filter(p => p.aaa).sort((a, b) => a.aaa.order - b.aaa.order);
  const chapters = games.filter(p => p.aaa.theme);
  const cards = games.filter(p => !p.aaa.theme);

  function chapter(p, i) {
    const A = p.aaa;
    const n = pad(i + 1);
    const stage = h('div', { class: 'stage' });
    if (A.back && A.back.video)
      stage.append(h('div', { class: 'stage__bg layer', 'data-depth': '0.12' },
        vid(A.back.video, A.back.poster, { 'data-auto': true, 'aria-hidden': 'true' })));
    if (A.back && A.back.cloth) stage.append(h('canvas', { class: 'stage__cloth layer', 'data-depth': '0.1', 'aria-hidden': 'true' }));
    stage.append(h('div', { class: 'stage__tint', 'aria-hidden': 'true' }));
    if (A.frame) {
      const v = vid(A.frame.video, A.frame.poster, { 'data-auto': true });
      if (A.frame.alt) v.setAttribute('aria-label', pick(A.frame.alt)); else v.setAttribute('aria-hidden', 'true');
      stage.append(h('div', { class: 'stage__frame layer', 'data-depth': '0.25', style: `aspect-ratio:${A.frame.ratio || '16 / 9'}` }, v));
    }
    if (A.char) stage.append(h('img', { class: 'stage__char layer', 'data-depth': A.theme === 'blob' ? '0.55' : '0.4', src: A.char.img, alt: pick(A.char.alt), width: A.char.w, height: A.char.h, loading: 'lazy', 'data-alt-en': A.char.alt.en, 'data-alt-es': A.char.alt.es }));

    const logo = A.logo.img
      ? h('h2', { class: 'ch-logo ch-logo--img reveal-fade' }, h('img', { src: A.logo.img, alt: A.logo.alt, width: A.logo.w, height: A.logo.h, loading: 'lazy' }))
      : h('h2', { class: `ch-logo ch-logo--${A.theme}` }, mask(document.createTextNode(A.logo.text)));
    const words = A.words.en.map((w, k) => h('li', {}, mask(tx({ en: w, es: A.words.es[k] }))));
    const cta = h('div', { class: 'cta reveal-fade' });
    if (A.play) cta.append(h('a', { class: 'btn btn--solid magnetic', href: A.play, ...ext(A.play), 'data-cursor': 'PLAY' }, h('span', { class: 'btn__in' }, ui('aaa.play'))));
    if (A.trailer) cta.append(h('button', { class: `btn ${A.play ? 'btn--ghost' : 'btn--solid'} magnetic`, type: 'button', 'data-trailer-en': A.trailer.en, 'data-trailer-es': A.trailer.es, 'data-cursor': 'WATCH' },
      h('span', { class: 'btn__in' }, playIcon(), A.watch ? tx(A.watch) : ui('aaa.watch'))));

    const copy = h('div', { class: 'stage__copy layer', 'data-depth': '-0.06' },
      h('p', { class: 'chapter__num pixel' }, ui('aaa.chapter'), ` ${n} · `, tx(A.kicker)),
      logo,
      h('p', { class: 'hook shine' }, A.hook.map(line => mask(document.createTextNode(line)))),
      h('ul', { class: 'power' }, words),
      A.ribbons && A.ribbons.length ? h('ul', { class: 'ribbons reveal-fade' }, A.ribbons.map(r => tx(r, 'li'))) : null,
      cta,
      A.platforms.length ? h('ul', { class: 'platforms reveal-fade' }, A.platforms.map(k => h('li', {}, svg(ICONS[k]), ui('aaa.pf.' + k)))) : null,
      A.fine ? tx(A.fine, 'p', { class: 'fine reveal-fade' }) : null);
    stage.append(copy);

    const shots = h('div', { class: 'shots' },
      h('div', { class: 'shots__head' }, ui('aaa.shots', 'p', { class: 'pixel' }), ui('aaa.shots.hint', 'p', { class: 'shots__hint pixel' })),
      h('ul', { class: `shots__track${A.tall ? ' shots__track--tall' : ''}` }, A.shots.map(s =>
        h('li', { class: `shot${s.wide ? ' shot--wide' : ''}${s.tallish ? ' shot--tall' : ''}` },
          vid(s.v + '.mp4', s.poster || s.v + '.webp', { 'data-cursor': 'PLAY', 'aria-label': pick(s) }),
          tx({ en: s.en, es: s.es }, 'p')))));

    return h('section', { class: `chapter chapter--${A.theme}`, id: p.id, 'data-bg': A.bg, 'data-ink': A.ink,
      'data-title': p.en.title.replace(/ Co-op Idle RPG$/, ''), 'data-n': n, 'aria-label': p.en.title }, stage, shots);
  }

  function moreGames() {
    const sec = $('#more');
    const lab = PROJECTS.filter(p => p.pillar === 'games' && p.lab);
    sec.append(
      h('h2', { class: 'more__title' }, mask(ui('aaa.more.title'))),
      h('ul', { class: 'more__grid' }, cards.map(p => {
        const C = p.aaa.card, L = p[lang];
        const media = C.video
          ? h('span', { class: 'game__media' }, vid(C.video, C.poster, { 'aria-hidden': 'true' }))
          : h('span', { class: 'game__media game__media--imgs' }, C.imgs.map((src, k) => h('img', { src, alt: k ? '' : p.en.title, loading: 'lazy' })));
        const href = p.links.play || p.links.steam;
        const buttons = h('span', { class: 'game__cta' },
          h('a', { class: 'btn btn--solid magnetic', href, ...ext(href), 'data-cursor': 'PLAY' }, h('span', { class: 'btn__in' }, ui(p.links.steam ? 'aaa.steam' : 'aaa.play'))),
          p.video && p.video.full ? h('button', { class: 'btn btn--ghost magnetic', type: 'button', 'data-trailer-en': p.video.full.en, 'data-trailer-es': p.video.full.es, 'data-cursor': 'WATCH' },
            h('span', { class: 'btn__in' }, playIcon(), ui('aaa.watch'))) : null);
        return h('li', { class: 'game' },
          h('a', { class: 'game__hit', href, ...ext(href), 'data-cursor': p.links.steam ? 'VIEW' : 'PLAY', 'aria-label': L.title }, media),
          C.ribbon ? tx(C.ribbon, 'span', { class: 'game__ribbon pixel' }) : null,
          h('span', { class: 'game__meta' }, tx(C.kicker, 'span', { class: 'pixel' }), h('b', { text: p.en.title }), buttons));
      })),
      lab.length ? h('p', { class: 'more__lab pixel' }, ui('aaa.more.lab'), ': ', lab.map(p => tx({ en: p.en.title, es: p.es.title })).flatMap((el, k) => (k ? [' · ', el] : [el]))) : null);
  }

  function trophies() {
    const sec = $('#trophies');
    sec.append(
      ui('aaa.trophies.kicker', 'p', { class: 'pixel trophies__kicker' }),
      h('h2', { class: 'trophies__title' }, mask(ui('aaa.trophies.title'))),
      h('ul', { class: 'trophies__grid' },
        TROPHIES.map(tr => h('li', { class: `trophy${tr.word ? ' trophy--word' : ''}` },
          tr.word
            ? h('b', { class: 'trophy__num trophy__num--word' }, tx(tr.word))
            : h('b', { class: 'trophy__num' }, h('span', { 'data-count': tr.n, text: tr.n }), tr.suffix || '', tr.sup ? tx(tr.sup, 'sup') : null),
          tx(tr.label, 'span', { class: 'trophy__label' }),
          tx(tr.src, 'span', { class: 'trophy__src pixel' }))),
        h('li', { class: 'trophy trophy--link' },
          h('a', { href: 'https://teapartygamestudio.itch.io', target: '_blank', rel: 'noopener', class: 'magnetic' },
            h('span', { class: 'btn__in' }, ui('aaa.trophies.more'), ' ↗')))));
  }

  function brands() {
    const sec = $('#brands');
    const web = PROJECTS.filter(p => p.pillar === 'web');
    const thumb = p => (p.img ? `img/${p.img}.webp` : p.video ? `video/${p.video.loop}.webp` : null);
    const row = (href, img, title, sub, line) => h('li', { class: 'brand' },
      h('a', { href, ...ext(href) },
        img ? h('img', { class: 'brand__img', src: img, alt: '', loading: 'lazy', width: 160, height: 100 }) : h('span', { class: 'brand__img brand__img--none', 'aria-hidden': 'true' }),
        h('span', { class: 'brand__txt' }, h('b', {}, title, ' ', sub), line),
        h('span', { class: 'brand__go', 'aria-hidden': 'true', text: '↗' })));
    sec.append(
      h('div', { class: 'brands__head' },
        ui('aaa.brands.kicker', 'p', { class: 'pixel brands__kicker' }),
        h('h2', { class: 'brands__title' }, mask(ui('aaa.brands.title'))),
        ui('aaa.brands.lead', 'p', { class: 'brands__lead reveal-fade' })),
      h('div', { class: 'brands__cols' },
        h('div', { class: 'brands__col' }, ui('aaa.brands.web', 'h3', { class: 'pixel' }),
          h('ul', {}, web.map(p => row(p.links.live, thumb(p), p.en.title, tx({ en: p.en.status, es: p.es.status }, 'span', { class: 'brand__status' }),
            tx({ en: p.en.text, es: p.es.text }, 'span', { class: 'brand__line' }))))),
        h('div', { class: 'brands__col' }, ui('aaa.brands.ai', 'h3', { class: 'pixel' }),
          h('ul', {}, AI_BLOCK.flows.map(f => row('classic.html#ai', null, tx({ en: f.en.title, es: f.es.title }), '',
            tx({ en: f.en.text, es: f.es.text }, 'span', { class: 'brand__line' }))))),
        h('div', { class: 'brands__col' }, ui('aaa.brands.exp', 'h3', { class: 'pixel' }),
          h('ul', { class: 'exp' }, EXPERIENCE.map(e => h('li', {},
            h('b', {}, tx({ en: e.en.role, es: e.es.role })),
            h('span', {}, tx(e.org), e.when ? ' · ' : '', e.when ? tx(e.when) : null),
            tx({ en: e.en.text, es: e.es.text }, 'span', { class: 'brand__line' })))))));
  }

  function studio() {
    const sec = $('#studio');
    const pipe = [['Unity', 'aaa.pipe.unity'], ['Blender', 'aaa.pipe.blender'], [null, 'aaa.pipe.ai', 'aaa.brands.ai']];
    sec.append(
      h('div', { class: 'studio__brand' },
        h('img', { class: 'studio__logo', src: 'media/tp-logo.webp', alt: 'TeaParty Game Studio', width: 640, height: 607, loading: 'lazy' })),
      h('div', { class: 'studio__body' },
        ui('aaa.studio.kicker', 'p', { class: 'pixel studio__kicker' }),
        h('h2', { class: 'studio__title' }, mask(ui('aaa.studio.title'))),
        ui('aaa.studio.mission', 'p', { class: 'studio__mission reveal-fade' }),
        ui('aaa.studio.pipeline', 'h3', { class: 'pixel studio__h' }),
        h('ol', { class: 'pipeline reveal-fade' }, pipe.map(([name, k, nk], i) => h('li', {},
          h('span', { class: 'pipeline__n pixel', text: pad(i + 1) }),
          h('b', {}, name || ui(nk)), ui(k)))),
        h('div', { class: 'studio__press reveal-fade' },
          h('a', { class: 'btn btn--solid magnetic', href: PRESSKIT.href, download: 'teaparty-presskit.zip' },
            h('span', { class: 'btn__in' }, svg('<path d="M12 3v12m0 0l-5-5m5 5l5-5M4 20h16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'), ui('aaa.studio.press'))),
          h('span', { class: 'studio__press-note' }, ui('aaa.studio.press.note'), ` · ZIP · ${PRESSKIT.size}`)),
        h('div', { class: 'studio__links reveal-fade' },
          h('div', {}, ui('aaa.studio.contact', 'h3', { class: 'pixel studio__h' }),
            h('ul', {}, CONTACT.filter(c => c.href).map(c => h('li', {}, h('a', { href: c.href, ...ext(c.href), rel: 'noopener me' },
              c.href.startsWith('mailto:') ? c.href.slice(7) : c.label, c.href.startsWith('mailto:') ? '' : ' ↗'))))),
          h('div', {}, ui('aaa.studio.follow', 'h3', { class: 'pixel studio__h' }),
            h('ul', {}, SOCIALS.filter(c => c.href).map(c => h('li', {}, h('a', { href: c.href, target: '_blank', rel: 'noopener me' },
              h('b', { text: c.label }), ' ', h('span', { text: c.handle })))))))));
  }

  $('#games').append(...chapters.map(chapter));
  moreGames(); trophies(); brands(); studio();
  const first = chapters[0];
  $('.weave-card__num').append(ui('aaa.chapter'), ' 01');
  $('.weave-card__title').textContent = first.en.title.replace(/ Co-op Idle RPG$/, '');

  /* ---------- language toggle ---------- */
  function applyLang() {
    root.lang = lang;
    $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    $$('[data-en]').forEach(el => { el.textContent = el.dataset[lang] ?? el.dataset.en; });
    $$('[data-alt-en]').forEach(el => { el.alt = lang === 'es' ? el.dataset.altEs : el.dataset.altEn; });
    $$('[data-lang]').forEach(el => el.classList.toggle('on', el.dataset.lang === lang));
    soundLabel();
  }
  $('.nav__lang').addEventListener('click', () => {
    lang = lang === 'es' ? 'en' : 'es';
    try { localStorage.setItem('lang', lang); } catch (e) {}
    applyLang();
    if (hasGsap) ScrollTrigger.refresh();
  });

  /* ---------- optional sound: off by default, synthesised with WebAudio, no files ---------- */
  let soundOn = false, actx = null, lastTick = 0;
  try { soundOn = localStorage.getItem('tp-sound') === '1'; } catch (e) {}
  const soundBtn = $('.nav__sound');
  function soundLabel() {
    soundBtn.setAttribute('aria-pressed', soundOn);
    soundBtn.setAttribute('aria-label', t(soundOn ? 'aaa.sound.on' : 'aaa.sound.off'));
    soundBtn.classList.toggle('is-on', soundOn);
  }
  function ctx() {
    if (!actx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; actx = new C(); }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  }
  function tone(freq, dur, type, vol, to) {
    const a = ctx(); if (!a) return;
    const o = a.createOscillator(), g = a.createGain(), now = a.currentTime;
    o.type = type; o.frequency.setValueAtTime(freq, now);
    if (to) o.frequency.exponentialRampToValueAtTime(to, now + dur);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(vol, now + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.connect(g).connect(a.destination); o.start(now); o.stop(now + dur + 0.02);
  }
  const sfx = {
    tick() { const n = performance.now(); if (!soundOn || n - lastTick < 70) return; lastTick = n; tone(2200 + Math.random() * 400, 0.035, 'triangle', 0.035); },
    thump() { if (!soundOn) return; tone(110, 0.42, 'sine', 0.32, 38); tone(240, 0.09, 'triangle', 0.05, 120); },
    chime() { if (!soundOn) return; [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.3, 'triangle', 0.06), i * 90)); },
  };
  soundBtn.addEventListener('click', () => {
    soundOn = !soundOn;
    try { localStorage.setItem('tp-sound', soundOn ? '1' : '0'); } catch (e) {}
    soundLabel();
    if (soundOn) tone(880, 0.12, 'triangle', 0.06);
  });
  document.addEventListener('pointerover', e => { if (e.target.closest('a, button')) sfx.tick(); });
  applyLang();

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
      let q = a;
      q = Math.imul(q ^ (q >>> 15), q | 1);
      q ^= q + Math.imul(q ^ (q >>> 7), q | 61);
      return ((q ^ (q >>> 14)) >>> 0) / 4294967296;
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
      for (let tx0 = 1; tx0 < cols; tx0 += 10) {
        const kind = r() < 0.25 ? null : KINDS[r() * KINDS.length | 0];
        const f = kind ? MOTIFS[kind] : randomMotif(r);
        let [bg, fg] = pair(r, cs);
        if (darks && r() < 0.4) { bg = darks[r() * darks.length | 0]; if (lum(fg) < 0.3) fg = cs[cs.length - 1]; }
        let acc = cs[r() * cs.length | 0];
        if (acc === fg || acc === bg) acc = cs[cs.length - 1];
        for (let my = 0; my < 9; my++) for (let mx = 0; mx < 9; mx++) {
          const gx = tx0 + mx, gy = y + my;
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
  function paintRows(c, grid, u, from, to) {
    for (let y = from; y < to && y < grid.length; y++) {
      const row = grid[y];
      for (let x = 0; x < row.length; x++) { if (!row[x]) continue; c.fillStyle = row[x]; c.fillRect(x * u, y * u, u, u); }
    }
  }
  function fitCanvas(canvas, unitDiv, min, max) {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const u = Math.max(min, Math.min(max, Math.round(rect.width / unitDiv)));
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const c = canvas.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.imageSmoothingEnabled = false;
    return { ctx: c, u, cols: Math.ceil(rect.width / u) + 1, rows: Math.ceil(rect.height / u) + 1, w: rect.width, h: rect.height };
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
    let rt;
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 150); });
    build();
    return { draw, full: () => draw(1) };
  }

  // Blobvarium's cloth: the same loom in moss, clay and cream, painted once
  const CLOTH = () => [css('--moss'), css('--clay'), css('--maiz'), css('--moss-ink'), css('--cream')];
  function cloth(canvas) {
    const g = fitCanvas(canvas, 110, 6, 12);
    paintRows(g.ctx, weave(g.cols, g.rows, 0xb10b, CLOTH(), css('--moss-ink')), g.u, 0, g.rows);
  }

  const curtain = Curtain($('.weave'));
  const cloths = $$('.stage__cloth');
  cloths.forEach(cloth);
  let ct;
  addEventListener('resize', () => { clearTimeout(ct); ct = setTimeout(() => cloths.forEach(cloth), 200); });

  /* ---------- videos: posters arrive when close; loops play only on screen; shots on hover (or centred on touch) ---------- */
  const near = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    const v = e.target;
    if (v.dataset.poster) { v.poster = v.dataset.poster; delete v.dataset.poster; }
    if (v.dataset.srcV) { v.src = v.dataset.srcV; delete v.dataset.srcV; }
    near.unobserve(v);
  }), { rootMargin: '1200px 0px' });
  $$('video[data-src-v]').forEach(v => near.observe(v));
  const load = v => { if (v.dataset.srcV) { v.src = v.dataset.srcV; delete v.dataset.srcV; } };
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    const v = e.target;
    if (e.isIntersecting && !reduced) { load(v); v.play().catch(() => {}); v.closest('.shot, .game')?.classList.add('is-playing'); }
    else { v.pause(); v.closest('.shot, .game')?.classList.remove('is-playing'); }
  }), { threshold: 0.6 });
  $$('video[data-auto]').forEach(v => io.observe(v));
  $$('.shot video, .game video').forEach(v => {
    if (finePointer) {
      const host = v.closest('.shot, .game');
      host.addEventListener('mouseenter', () => { load(v); v.play().catch(() => {}); });
      host.addEventListener('mouseleave', () => v.pause());
    } else io.observe(v);
  });
  // the hero reel pauses when it leaves the screen
  const reel = $('.hero__reel');
  new IntersectionObserver(([e]) => (e.isIntersecting ? reel.play().catch(() => {}) : reel.pause())).observe(reel);

  /* ---------- cinema player ---------- */
  const player = $('#player'), pv = $('.player__video', player);
  let lastFocus = null, lenis = null;
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
  document.addEventListener('click', e => {
    if (e.target.closest('[data-reel-open]')) return openPlayer('media/reel.mp4', true);
    const tr = e.target.closest('[data-trailer-en]');
    if (tr) openPlayer(lang === 'es' ? tr.dataset.trailerEs : tr.dataset.trailerEn, false);
  });
  $('.player__close', player).addEventListener('click', closePlayer);
  addEventListener('keydown', e => { if (e.key === 'Escape' && !player.hidden) closePlayer(); });

  /* ---------- the nav gets a backing once the page moves (phones keep it always) ---------- */
  const nav = $('.nav');
  const navState = () => nav.classList.toggle('is-solid', scrollY > 30);
  addEventListener('scroll', navState, { passive: true });
  navState();

  /* ---------- Konami: the loom weaves a blobi ---------- */
  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let kpos = 0, kBusy = false;
  addEventListener('keydown', e => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    kpos = k === KONAMI[kpos] ? kpos + 1 : (k === KONAMI[0] ? 1 : 0);
    if (kpos === KONAMI.length) { kpos = 0; weaveBlobi(); }
  });
  function weaveBlobi() {
    if (kBusy) return;
    kBusy = true;
    const canvas = $('.konami'), note = $('.konami__note');
    const img = new Image();
    img.onload = () => {
      canvas.classList.add('is-on');
      const g = fitCanvas(canvas, 60, 10, 22);
      const grid = weave(g.cols, g.rows, Date.now() & 0xffff, CLOTH(), css('--moss-ink'));
      // sample the real blobi into threads and lay it in the middle of the cloth
      const bh = Math.min(g.rows - 6, 44), bw = Math.round(bh * img.width / img.height);
      const off = document.createElement('canvas'); off.width = bw; off.height = bh;
      const oc = off.getContext('2d'); oc.drawImage(img, 0, 0, bw, bh);
      const px = oc.getImageData(0, 0, bw, bh).data;
      const x0 = (g.cols - bw) >> 1, y0 = (g.rows - bh) >> 1;
      for (let y = -2; y < bh + 2; y++) for (let x = -3; x < bw + 3; x++) if (grid[y0 + y]) grid[y0 + y][x0 + x] = css('--cream');
      for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
        const i = (y * bw + x) * 4;
        if (px[i + 3] > 120) grid[y0 + y][x0 + x] = `rgb(${px[i]},${px[i + 1]},${px[i + 2]})`;
      }
      sfx.chime();
      note.textContent = t('aaa.konami');
      note.classList.add('is-on');
      let row = 0;
      const step = () => {
        const next = reduced ? g.rows : Math.min(g.rows, row + Math.ceil(g.rows / 40));
        paintRows(g.ctx, grid, g.u, row, next); row = next;
        if (row < g.rows) requestAnimationFrame(step);
        else setTimeout(() => {
          canvas.classList.remove('is-on'); note.classList.remove('is-on');
          setTimeout(() => { g.ctx.clearRect(0, 0, g.w, g.h); kBusy = false; }, 700);
        }, 2400);
      };
      step();
    };
    img.onerror = () => { kBusy = false; };
    img.src = 'media/blob-blobi.webp';
  }

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
          if (inner) gsap.to(inner, { x: dx * 0.15, y: dy * 0.2, duration: .5, ease: 'power3.out' });
        }
      });
      btn.addEventListener('pointerleave', () => {
        if (hasGsap) gsap.to(inner ? [btn, inner] : btn, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, .35)' });
      });
    });
  }

  /* ---------- without GSAP the page is still whole: everything visible, the loom drawn as a hem ---------- */
  if (!hasGsap) { curtain.full(); return; }
  root.classList.add('gsap-ok');
  gsap.registerPlugin(ScrollTrigger);

  if (!reduced && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      const target = a && $(a.getAttribute('href'));
      if (target) { e.preventDefault(); lenis.scrollTo(target, { duration: 1.6, offset: target.id === 'top' ? 0 : -1 }); }
    });
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

  [...$$('.stage__copy'), ...$$('.more, .trophies, .brands__head, .brands__cols, .studio, .footer')].forEach(el =>
    ScrollTrigger.create({ trigger: el, start: 'top 75%', once: true, onEnter: () => reveal(el) }));
  $$('.shot, .game, .brand, .exp li').forEach(el => gsap.fromTo(el, { opacity: 0, y: reduced ? 0 : 50 }, {
    opacity: 1, y: 0, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 94%', once: true },
  }));

  /* page colour follows the chapter on screen; entering a chapter lands a soft thump */
  const setTheme = (bg, ink) => gsap.to(root, {
    '--page-bg': bg, '--page-ink': ink,
    duration: reduced ? 0.01 : 0.9, ease: 'power2.out', overwrite: true,
  });
  ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom 55%', onEnterBack: () => setTheme(css('--night'), css('--cream')) });
  $$('[data-bg]').forEach(el => {
    const on = () => { setTheme(el.dataset.bg, el.dataset.ink); if (el.classList.contains('chapter')) sfx.thump(); };
    ScrollTrigger.create({ trigger: el, start: 'top 55%', end: 'bottom 55%', onEnter: on, onEnterBack: on });
  });

  /* trophy counters */
  $$('[data-count]').forEach(el => {
    const n = +el.dataset.count, o = { v: 0 };
    el.textContent = '0';
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => gsap.to(o, { v: n, duration: reduced ? 0.01 : 1.8, ease: 'power3.out', onUpdate: () => (el.textContent = Math.round(o.v)) }),
    });
  });

  if (reduced) { curtain.full(); ScrollTrigger.refresh(); return; }

  const mm = gsap.matchMedia();

  // desktop: the hero holds while the loom weaves it shut, then the cloth rises with the page and chapter 01 is under it
  mm.add('(min-width: 900px)', () => {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=150%', pin: true, scrub: 0.6, anticipatePin: 1, refreshPriority: 20 },
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
        scrollTrigger: { trigger: stage, start: 'top top', end: '+=90%', pin: true, scrub: 0.8, refreshPriority: 19 - i },
      });
      $$('.layer', stage).forEach(l => {
        const d = +l.dataset.depth || 0;
        ctl.fromTo(l, { y: d * 260 }, { y: -d * 260, ease: 'none' }, 0);
      });
      const back = $('.stage__bg video, .stage__cloth', stage);
      if (back) ctl.fromTo(back, { scale: 1.12 }, { scale: 1, ease: 'none' }, 0);
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
