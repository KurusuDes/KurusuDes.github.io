# kurusudes.github.io

Portfolio of **Juan Neyra**: Game Developer · Software Developer · AI Developer · Web Developer (Lima, Peru).

Unity and browser games, websites for real brands, and local AI workflows. Live: https://kurusudes.github.io

A static site with no build step, published as-is with GitHub Pages. The site defaults to English and has a
Spanish toggle (EN/ES, remembered in `localStorage`).

- `index.html` + `css/aaa.css` + `js/aaa.js`: the front page. Every game is a full-screen chapter with its own
  colour, the loom weaves the screen shut after the reel, and everything is generated from `js/data.js`.
  GSAP 3.12.5 + ScrollTrigger and Lenis 1.1.13 come from CDNs. Media lives in `media/` (and reuses `video/` and `img/`).
- `classic.html` + `css/style.css` + `js/main.js` + `js/loom.js`: the previous site, linked as "Classic version" in the footer.

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
  - `aaa`: what the front page needs for this game. Without it, the game only shows on `classic.html`.
    - `order`: position on the front page. Games with a `theme` get a chapter; the rest become a big card under "More games".
    - `theme`: `inf`, `blob`, `axie`, `lucky` or `mori`. Picks the chapter's layout and accent colours in `css/aaa.css`.
      A new game needs a new `.chapter--<theme>` block there.
    - `bg` / `ink`: the page colour and text colour while the chapter is on screen.
    - `kicker` (`{ en, es }`): the small line after "Chapter 0N".
    - `logo`: `{ img, w, h, alt }` for a logo file with transparency, or `{ text }` to letter it in CSS.
    - `hook`: the giant headline, one entry per line. It stays in English in both languages.
    - `words` (`{ en: [3], es: [3] }`): the three power words under the hook.
    - `back`: the full-screen background, `{ video, poster }` or `{ cloth: true }` for a woven backdrop.
      Background videos are 1920×1080 (H.264, CRF 20 or the lowest that stays under ~4 MB, 8–12 s loop with a 0.3 s crossfade at the wrap).
      Add `soft: true` when the footage only exists in 720p or less: the chapter then blurs it like depth of field,
      washes it in its `--soft-tint` colour, adds grain and moves it less (`.stage__bg--soft` in `css/aaa.css`).
    - `frame`: an optional framed clip on the right, `{ video, poster, ratio, alt }`.
    - `char`: an optional cut-out character with transparency, `{ img, w, h, alt: { en, es } }`.
    - `play`: the "Play free" link. Leave it out when there is no public page (MoriMonchis).
    - `trailer` (`{ en, es }`): the video for "Watch trailer". `watch` (`{ en, es }`) renames the button.
    - `platforms`: any of `browser`, `windows`, `mobile`.
    - `ribbons`: achievement ribbons, each `{ en, es }`. Only real facts.
    - `fine` (`{ en, es }`): an optional small line, like the Axie fan-game notice.
    - `shots`: the gameplay strip. Each `{ v, en, es }`, where `v` is the path without `.mp4` (the poster is `v + '.webp'`
      unless `poster` says otherwise). `wide` / `tallish` change the shape; `tall: true` on the block uses portrait cards.
    - `card` (games without `theme`): `{ video, poster }` or `{ imgs: [2] }`, plus `kicker` and an optional `ribbon`.
- `TROPHIES`: the trophy wall. `n` counts up when it appears (`suffix` and `sup` add "+", "k" or "th");
  `word` shows a word instead of a number. Real numbers only.
- `SOCIALS`: the studio's social accounts, shown in the Studio section.
- `PRESSKIT`: the press kit zip (`media/teaparty-presskit.zip`) and its size, for the download button.
- `AI_BLOCK`: the local AI section. Each workflow is a node diagram: `[step, tool, output]`.
- `EXPERIENCE`: the experience timeline, most recent first.
- `CONTACT`: the footer channels. Empty ones are hidden.
- `CV`: path to the CV PDF in `cv/`. Empty hides the "Download CV" buttons.
- `UI`: the page's fixed strings in both languages. The front page's keys start with `aaa.`.

Images go in `img/` as WebP, at most 1200 px wide. Front-page videos are muted MP4s (H.264) under 8 MB with a
WebP poster of the same name; only the hero reel preloads.

Extras on the front page: an optional 🔊 button (sounds are synthesised with WebAudio, off by default), and the
Konami code (↑↑↓↓←→←→BA) makes the loom weave a blobi.

## The loom

The hero weaves rows of tocapus (the squares on Andean unkus) with code. The seed is the day's date
(`YYYYMMDD`), so the weave changes every day, and "Weave another" makes a random one.
It lives in [`js/loom.js`](js/loom.js).

## Running locally

```bash
python -m http.server 8812
```

---

**En español:** portafolio de Juan Neyra. Todo el contenido, en los dos idiomas, está en `js/data.js`;
el sitio se sirve tal cual con GitHub Pages.
