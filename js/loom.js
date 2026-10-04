// Telar: teje filas de tocapus (los cuadros de los unkus andinos) a partir de una semilla.
// Cada tocapu es un motivo de 9×9 hilos con simetría, enmarcado por una línea de 1 hilo,
// y entre filas corre una franja en zigzag. Misma semilla, mismo tejido.
(function () {
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  function rng(seed) {                      // mulberry32
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hash(str) {
    let h = 2166136261;
    for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
    return h >>> 0;
  }

  // Motivos de 9×9: devuelven 0 (fondo), 1 (figura) o 2 (acento)
  const MOTIFS = {
    rombo(x, y) {                           // rombo escalonado con anillos
      const d = Math.abs(x - 4) + Math.abs(y - 4);
      return d === 0 ? 2 : d <= 4 ? (d % 2 ? 1 : 0) : 0;
    },
    chakana(x, y) {                         // cruz escalonada
      const ax = Math.abs(x - 4), ay = Math.abs(y - 4);
      if (ax <= 0 && ay <= 0) return 2;
      return (ax <= 1 && ay <= 3) || (ay <= 1 && ax <= 3) || (ax <= 2 && ay <= 2) ? 1 : 0;
    },
    ojo(x, y) {                             // cuadrados concéntricos
      const r = Math.max(Math.abs(x - 4), Math.abs(y - 4));
      return r === 0 ? 2 : r % 2 === 0 ? 1 : 0;
    },
    damero(x, y) {
      return ((x / 3 | 0) + (y / 3 | 0)) % 2 ? 1 : (x % 3 === 1 && y % 3 === 1 ? 2 : 0);
    },
    zigzag(x, y) {
      return ((x + Math.abs((y % 4) - 2)) % 4) < 2 ? 1 : 0;
    },
    llave(x, y) {                           // greca escalonada en diagonal
      const d = (x + y) % 6, e = (x - y + 9) % 6;
      return d < 2 && e < 4 ? 1 : (d === 3 && e === 4 ? 2 : 0);
    },
  };
  const KINDS = Object.keys(MOTIFS);

  // Motivo libre: 5×5 bits al azar con simetría de 4 ejes (como los glifos de Trama)
  function randomMotif(r) {
    const q = [];
    for (let i = 0; i < 25; i++) q.push(r() < 0.45 ? 1 : 0);
    q[24] = 2;
    return (x, y) => {
      const mx = x > 4 ? 8 - x : x, my = y > 4 ? 8 - y : y;
      return q[my * 5 + mx];
    };
  }

  function palette(only) {
    const all = {
      cochinilla: css('--cochinilla'), maiz: css('--maiz'), chilca: css('--chilca'),
      qocha: css('--qocha'), lana: css('--lana'), noche: css('--noche'), anil: css('--anil-2'),
    };
    return only ? only.map(k => all[k] || k) : Object.values(all);
  }

  // Dos colores con contraste suficiente para que el motivo se lea
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

  // Construye la cuadrícula de hilos: array de filas, cada fila un array de colores
  function weave(cols, rows, seed, opts = {}) {
    const r = rng(seed);
    const cs = palette(opts.colors);
    const frame = opts.frame || css('--noche');
    const grid = Array.from({ length: rows }, () => new Array(cols).fill(frame));
    const T = 10;                           // 9 hilos de motivo + 1 de marco
    const band = opts.band === false ? 0 : 4;
    let y = 1, rowIndex = 0;
    while (y < rows) {
      // franja entre filas de tocapus
      if (band && rowIndex > 0) {
        const [c1, c2] = pair(r, cs);
        for (let by = 0; by < band - 1 && y + by < rows; by++)
          for (let x = 0; x < cols; x++)
            grid[y + by][x] = ((x + (by === 1 ? 2 : 0)) % 4 < 2) === (by !== 2) ? c1 : c2;
        y += band;
      }
      for (let tx = 1; tx < cols; tx += T) {
        const kind = r() < 0.25 ? null : KINDS[r() * KINDS.length | 0];
        const f = kind ? MOTIFS[kind] : randomMotif(r);
        // en el telar grande, 4 de cada 10 tocapus van sobre fondo oscuro: da ritmo y deja respirar
        let [bg, fg] = pair(r, cs);
        if (!opts.colors && r() < 0.4) {
          bg = r() < 0.5 ? css('--noche') : css('--anil-2');
          if (lum(fg) < 0.3) fg = css('--lana');
        }
        let acc = cs[r() * cs.length | 0];
        if (acc === fg || acc === bg) acc = css('--lana');
        for (let my = 0; my < 9; my++) for (let mx = 0; mx < 9; mx++) {
          const gx = tx + mx, gy = y + my;
          if (gx >= cols || gy >= rows) continue;
          const v = f(mx, my);
          grid[gy][gx] = v === 0 ? bg : v === 1 ? fg : acc;
        }
      }
      y += T;
      rowIndex++;
    }
    return grid;
  }

  function paintRows(ctx, grid, u, from, to) {
    for (let y = from; y < to && y < grid.length; y++) {
      const row = grid[y];
      for (let x = 0; x < row.length; x++) {
        ctx.fillStyle = row[x];
        ctx.fillRect(x * u, y * u, u, u);
      }
    }
  }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Telar a pantalla completa con animación de tejido fila por fila
  function Loom(canvas) {
    let seed = 0, raf = 0, safety = 0, grid = null, u = 6;
    const ctx = canvas.getContext('2d');

    function size() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      u = Math.max(5, Math.min(9, Math.round(rect.width / 160)));
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
      return [Math.ceil(rect.width / u) + 1, Math.ceil(rect.height / u) + 1];
    }

    function draw(animate) {
      cancelAnimationFrame(raf);
      const [c, rws] = size();
      grid = weave(c, rws, seed);
      if (!animate || reduced) { paintRows(ctx, grid, u, 0, rws); return; }
      ctx.fillStyle = css('--anil');
      ctx.fillRect(0, 0, c * u, rws * u);
      let row = 0;
      const step = Math.max(2, Math.round(rws / 55));
      const tick = () => {
        paintRows(ctx, grid, u, row, row + step);
        row += step;
        if (row < rws) {
          // la lanzadera: una pasada de lana clara justo debajo de lo tejido
          ctx.fillStyle = css('--lana');
          ctx.fillRect(0, row * u, c * u, Math.max(1, u / 3));
          raf = requestAnimationFrame(tick);
        }
      };
      tick();
      // si el navegador congela los frames (pestaña en segundo plano), el tejido se completa igual
      clearTimeout(safety);
      safety = setTimeout(() => {
        if (row < rws) { cancelAnimationFrame(raf); paintRows(ctx, grid, u, row, rws); row = rws; }
      }, 2500);
    }

    let t;
    addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => draw(false), 150); });

    return {
      weave(s, animate = true) { seed = s >>> 0; draw(animate); },
    };
  }

  // Portada tejida pequeña para tarjetas sin captura
  function cover(canvas, id, colors) {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const u = Math.max(3, Math.round(rect.width / 64));
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const c = Math.ceil(rect.width / u) + 1, r = Math.ceil(rect.height / u) + 1;
    paintRows(ctx, weave(c, r, hash(id), { colors }), u, 0, r);
  }

  // Un solo tocapu (marca de la barra de navegación, favicon, viñetas)
  function mark(canvas, seed, colors) {
    const ctx = canvas.getContext('2d');
    const g = weave(11, 11, seed, { colors, band: false });
    const u = canvas.width / 11;
    for (let y = 0; y < 11; y++) for (let x = 0; x < 11; x++) {
      ctx.fillStyle = g[y][x]; ctx.fillRect(x * u, y * u, u, u);
    }
  }

  window.Telar = { Loom, cover, mark, hash };
})();
