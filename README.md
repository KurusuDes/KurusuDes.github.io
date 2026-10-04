# kurusudes.github.io

Portafolio de Juan Neyra: videojuegos, web e IA local.

Sitio estático, sin build: `index.html` + `css/` + `js/`. Se publica tal cual con GitHub Pages.

## Añadir o cambiar un trabajo

Todo el contenido está en [`js/data.js`](js/data.js):

- `PROJECTS`: un objeto por trabajo, con textos en `es` y `en`. Añadir uno es copiar un objeto y cambiarlo.
  - `pillar`: `games` o `web`. Decide la sección y el color.
  - `img`: nombre de un `.webp` en `img/` (o una URL completa), o `null` para que se teja una portada con el estado como sello.
  - `video`: `{ loop, full }`. El bucle sin audio va en `video/<loop>.mp4` con su póster `.webp`; `full` abre el tráiler con sonido.
  - `featured: true`: la tarjeta ocupa dos columnas.
  - `links`: `play`, `live`, `steam`, `itch`, `repo`. Si no hay ninguno público, la tarjeta dice "Código privado".
- `AI_BLOCK`: el bloque de IA local. Cada flujo es un diagrama de nodos: `[paso, herramienta, lo que sale]`.
- `CONTACT`: los canales del pie. Los vacíos no se muestran.
- `UI`: los textos fijos de la página en los dos idiomas.

Las imágenes van en `img/` como WebP de 1200 px de ancho como máximo.

## El telar

La portada teje filas de tocapus (los cuadros de los unkus andinos) con código. La semilla es la
fecha del día (`AAAAMMDD`), así que el tejido cambia cada día y "Tejer otro" genera uno al azar.
Está en [`js/loom.js`](js/loom.js).

## Probar en local

```bash
python -m http.server 8770
```
