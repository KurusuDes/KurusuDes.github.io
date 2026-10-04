(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const h = (tag, attrs = {}, ...kids) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else el.setAttribute(k, v);
    }
    for (const k of kids.flat()) if (k != null) el.append(k);
    return el;
  };

  // ── idioma ──
  let lang = 'es';
  try { lang = localStorage.getItem('lang') || (navigator.language || 'es').slice(0, 2); } catch (e) {}
  if (lang !== 'es' && lang !== 'en') lang = 'en';
  const t = k => (UI[lang] && UI[lang][k]) || UI.es[k] || k;

  const PILLAR_COLORS = {
    games: ['cochinilla', 'noche', 'lana', 'anil'],
    web: ['maiz', 'noche', 'lana', 'anil'],
    ai: ['chilca', 'noche', 'lana', 'anil'],
  };

  const LINK_ORDER = ['play', 'live', 'steam', 'trailer', 'itch', 'repo'];

  function card(p) {
    const L = p[lang];
    const pillar = PILLARS.find(x => x.id === p.pillar);
    const imgs = Array.isArray(p.img) ? p.img : p.img ? [p.img] : [];

    let media;
    if (p.video) {
      // bucle corto sin audio: se reproduce solo mientras la tarjeta está a la vista
      const v = p.video;
      media = h('div', { class: `card__media card__media--video${v.fit === 'contain' ? ' is-contain' : ''}`,
                         style: v.bg ? `background:${v.bg}` : null },
        h('video', { 'data-src': `video/${v.loop}.mp4`, poster: `video/${v.loop}.webp`,
                     muted: '', loop: '', playsinline: '', preload: 'none', 'aria-label': L.title }));
    } else if (imgs.length) {
      media = h('div', { class: `card__media${imgs.length > 1 ? ' card__media--duo' : ''}` },
        imgs.map((src, i) => h('img', { src: src.startsWith('http') ? src : `img/${src}.webp`, alt: i === 0 ? L.title : '', loading: 'lazy' })),
        p.credit ? h('p', { class: 'card__credit', text: p.credit }) : null);
    } else {
      const cv = h('canvas', { class: 'card__cover', 'data-cover': p.id, 'data-pillar': p.pillar, 'aria-hidden': 'true' });
      // sin captura todavía: tejido con el estado del proyecto como sello
      media = h('div', { class: 'card__media card__media--woven' }, cv,
        h('p', { class: 'card__stamp', text: L.status }));
    }

    const links = LINK_ORDER.filter(k => p.links[k]).map(k =>
      h('a', { href: p.links[k], ...(p.links[k].startsWith('http') ? { target: '_blank', rel: 'noopener' } : {}) },
        t('link.' + k), h('span', { 'aria-hidden': 'true', text: ' ↗' })));
    if (p.video && p.video.full)
      links.splice(1, 0, h('button', { type: 'button', class: 'card__watch', 'data-full': p.video.full[lang], 'data-title': L.title },
        h('span', { 'aria-hidden': 'true', text: '▶ ' }), t('link.video')));
    if (!p.links.repo && !p.links.live && !p.links.play && !p.links.steam)
      links.push(h('span', { class: 'card__private', text: t('card.private') }));

    return h('article', { class: `card${p.featured ? ' card--featured' : ''}`, style: `--c:${pillar.color}` },
      media,
      h('div', { class: 'card__body' },
        h('p', { class: 'card__meta' }, h('span', { text: p.year }), h('span', { class: 'card__status', text: L.status })),
        h('h3', { class: 'card__title', text: L.title }),
        h('p', { class: 'card__text', text: L.text }),
        h('ul', { class: 'card__tags' }, p.tags.map(tag => h('li', { text: tag }))),
        h('p', { class: 'card__links' }, links)));
  }

  // ── bloque de IA local: por qué, qué se despliega y cómo se usa ──
  function flow(f) {
    const L = f[lang];
    // el pipeline: cada nodo es [paso, herramienta, lo que pasa al siguiente]
    const pipe = h('ol', { class: 'pipe', 'aria-label': L.title },
      L.steps.map(([k, v, out], i) => h('li', { class: 'pipe__node', style: `--i:${i}` },
        h('span', { class: 'pipe__k', text: k }),
        h('span', { class: 'pipe__v', text: v }),
        out ? h('span', { class: 'pipe__out', text: out }) : null)));
    const proof = L.proof ? h('p', { class: 'flow__proof' }, h('b', { text: L.proof[0] }), h('span', { text: L.proof[1] })) : null;
    return h('article', { class: 'flow' },
      h('div', { class: 'flow__head' },
        h('div', {}, h('h4', { class: 'flow__title', text: L.title }), h('p', { class: 'flow__text', text: L.text })),
        proof),
      h('div', { class: 'pipe__scroll' }, pipe));
  }

  function aiBlock(p) {
    const A = AI_BLOCK[lang];
    return h('section', { class: 'pillar ai wrap', id: p.id, style: `--c:${p.color}`, 'aria-labelledby': `h-${p.id}` },
      h('header', { class: 'pillar__head' },
        h('h2', { class: 'section__title', id: `h-${p.id}`, text: p[lang].name }),
        h('p', { class: 'ai__lead', text: A.lead })),
      h('span', { class: 'thread thread--wide', 'aria-hidden': 'true' }),
      h('div', { class: 'ai__why' }, A.why.map(([k, v]) => h('div', {}, h('h3', { text: k }), h('p', { text: v })))),
      h('h3', { class: 'ai__sub', text: A.flowsTitle }),
      h('div', { class: 'ai__flows' }, AI_BLOCK.flows.map(flow)),
      h('h3', { class: 'ai__sub', text: A.stackTitle }),
      h('dl', { class: 'ai__stack' }, AI_BLOCK.stack.map(s => h('div', {},
        h('dt', { text: s[lang] }),
        h('dd', {}, h('ul', {}, s.items.map(i => h('li', { text: i }))))))),
      h('p', { class: 'ai__hw', text: A.hw }));
  }

  function render() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-lang]').forEach(el => el.classList.toggle('on', el.dataset.lang === lang));

    // hilos (leyenda que también sirve de índice)
    const list = $('.threads__list');
    list.replaceChildren(...PILLARS.map(p => {
      const label = p.custom
        ? `${AI_BLOCK.flows.length} ${t('threads.flows')}`
        : `${PROJECTS.filter(x => x.pillar === p.id).length} ${t('threads.projects')}`;
      return h('li', { style: `--c:${p.color}` },
        h('a', { href: '#' + p.id },
          h('span', { class: 'thread', 'aria-hidden': 'true' }),
          h('span', { class: 'threads__name', text: p[lang].name }),
          h('span', { class: 'threads__n', text: label })));
    }));

    // secciones
    $('.pillars').replaceChildren(...PILLARS.map(p => p.custom ? aiBlock(p) :
      h('section', { class: 'pillar wrap', id: p.id, style: `--c:${p.color}`, 'aria-labelledby': `h-${p.id}` },
        h('header', { class: 'pillar__head' },
          h('h2', { class: 'section__title', id: `h-${p.id}`, text: p[lang].name }),
          h('p', { class: 'pillar__blurb', text: p[lang].blurb })),
        h('span', { class: 'thread thread--wide', 'aria-hidden': 'true' }),
        h('div', { class: 'grid' }, PROJECTS.filter(x => x.pillar === p.id).map(card)))));

    // contacto
    $('.foot__links').replaceChildren(...CONTACT.filter(c => c.href).map(c =>
      h('li', {}, h('a', { href: c.href, target: '_blank', rel: 'noopener me', text: c.label + ' ↗' }))));

    setTimeout(drawCovers, 0);   // tras el layout, para que los canvas ya tengan tamaño
    watchVideos();
  }

  // ── vídeos: los bucles solo cargan y corren a la vista; con movimiento reducido se queda el póster ──
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    for (const e of entries) {
      const v = e.target;
      if (e.isIntersecting) {
        if (!v.src) v.src = v.dataset.src;
        v.play().catch(() => {});
      } else v.pause();
    }
  }, { threshold: 0.35 }) : null;

  function watchVideos() {
    if (reducedMotion || !io) return;
    document.querySelectorAll('video[data-src]').forEach(v => { v.muted = true; io.observe(v); });
  }

  // reproductor del tráiler completo, con sonido
  const player = $('.player');
  const pv = $('.player video');
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-full]');
    if (!b) return;
    pv.src = b.dataset.full;
    $('.player__title').textContent = b.dataset.title;
    player.showModal();
    pv.play().catch(() => {});
  });
  player.addEventListener('close', () => { pv.pause(); pv.removeAttribute('src'); pv.load(); });
  player.addEventListener('click', e => { if (e.target === player) player.close(); });
  $('.player__close').addEventListener('click', () => player.close());

  function drawCovers() {
    document.querySelectorAll('canvas[data-cover]').forEach(cv =>
      Telar.cover(cv, cv.dataset.cover, PILLAR_COLORS[cv.dataset.pillar]));
  }
  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(drawCovers, 200); });

  $('.lang').addEventListener('click', () => {
    lang = lang === 'es' ? 'en' : 'es';
    try { localStorage.setItem('lang', lang); } catch (e) {}
    render();
  });

  // ── telar del hero: la semilla es la fecha de hoy (AAAAMMDD) ──
  const d = new Date();
  let seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  const loom = Telar.Loom($('.loom'));
  const showSeed = () => { $('.seed__n').textContent = seed; };
  $('.seed__btn').addEventListener('click', () => {
    seed = (Math.random() * 1e8) | 0;
    showSeed(); loom.weave(seed);
  });

  render();
  showSeed();
  loom.weave(seed);
  Telar.mark($('.nav__mark'), seed);
})();
