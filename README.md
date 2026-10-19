# kurusudes.github.io

Portfolio of **Juan Neyra**: Game Developer · Software Developer · AI Developer · Web Developer (Lima, Peru).

Unity and browser games, websites for real brands, and local AI workflows. Live: https://kurusudes.github.io

A static site with no build step: `index.html` + `css/` + `js/`, published as-is with GitHub Pages. The site
defaults to English and has a Spanish toggle.

## Adding or changing a project

All content lives in [`js/data.js`](js/data.js):

- `PROJECTS`: one object per project, with texts in `es` and `en`. To add one, copy an object and edit it.
  - `pillar`: `games` or `web`. Sets the section and the color.
  - `img`: name of a `.webp` in `img/` (or a full URL), or `null` to weave a cover with the status as a stamp. Projects with no cover (no `img` and no `video`) always go last in their section.
  - `video`: `{ loop, full }`. The silent loop lives in `video/<loop>.mp4` with a `.webp` poster; `full` opens the trailer with sound.
  - `gallery`: extra screenshots and videos for the project's detail view.
  - `role` (inside `es`/`en`): what I did and the hard technical problem. Shown on the card and in the detail view.
  - `stats` (inside `es`/`en`): measured numbers as `[number, label]` pairs.
  - `lab: true`: a prototype with no footage yet. It goes into the collapsed "Lab / In progress" list at the end of its section instead of getting a full card.
  - `featured: true`: the card spans two columns.
  - `links`: `play`, `live`, `steam`, `itch`, `repo`. With none of them public, the card says "Private code".
- `AI_BLOCK`: the local AI section. Each workflow is a node diagram: `[step, tool, output]`.
- `EXPERIENCE`: the experience timeline, most recent first.
- `CONTACT`: the footer channels. Empty ones are hidden.
- `CV`: path to the CV PDF in `cv/`. Empty hides the "Download CV" buttons.
- `UI`: the page's fixed strings in both languages.

Images go in `img/` as WebP, at most 1200 px wide.

## The loom

The hero weaves rows of tocapus (the squares on Andean unkus) with code. The seed is the day's date
(`YYYYMMDD`), so the weave changes every day, and "Weave another" makes a random one.
It lives in [`js/loom.js`](js/loom.js).

## Running locally

```bash
python -m http.server 8770
```

---

**En español:** portafolio de Juan Neyra. Todo el contenido, en los dos idiomas, está en `js/data.js`;
el sitio se sirve tal cual con GitHub Pages.
