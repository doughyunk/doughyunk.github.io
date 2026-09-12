# Doug Hyun Kim — personal website

A responsive academic bio with a dark aurora background and layered clear-glass surfaces. The updated page covers biography, research, experience, education, and contact information. The selected projects section has been removed.

The main page uses a static-site adaptation of the MIT-licensed `@zakisheriff/liquid-glass` filter and layer model. The earlier `liquidGL` WebGL design is preserved at `liquidgl.html`, and the original frosted design remains at `frosted.html`. The base stylesheet is the automatic fallback when JavaScript fails to load or reduced transparency is requested.

The website uses plain HTML, CSS, and JavaScript with no build step or package installation. Pointer-driven reflections respect reduced-motion preferences. The main bio and links work without JavaScript.

## Files

- `index.html`: biography, publication, experience, education, and contact links.
- `styles.css`: responsive design, colors, typography, and print styles.
- `layered-glass.css` and `layered-glass.js`: dark aurora background and layered clear-glass enhancement.
- `liquidgl.html`, `clear-glass.css`, and `clear-glass.js`: preserved WebGL version.
- `frosted.html` and `frosted.css`: preserved original design.
- `assets/vendor/liquidGL.js`: WebGL navigation renderer, with license and exact source revision alongside it.
- `assets/vendor/liquid-glass.js`: optional SVG panel refraction renderer, also with license and exact source revision.
- `assets/doug-hyun-kim.webp`: web-optimized encoding of the supplied photo.
- `assets/CV_Doug_Hyun_Kim.pdf`: the supplied CV, unchanged.
- `assets/favicon.svg`: site icon.
- `.nojekyll`: serves the site as plain static files.

## Publish on GitHub Pages

1. In the `doughyunk` GitHub account, create a public repository named `doughyunk.github.io`.
2. Upload the contents of this folder to the repository root. `index.html` should be at the root, with `assets` beside it.
3. Open **Settings → Pages**. Select **Deploy from a branch**, the `main` branch, and **/(root)**. Save.
4. After GitHub finishes deployment, open `https://doughyunk.github.io/`.

## Update the site

Edit `index.html` to update your biography or work. Replace `assets/CV_Doug_Hyun_Kim.pdf` to update the downloadable CV while keeping the existing links. The photo framing is controlled by `.portrait-frame img` in `styles.css`; the image content has not been retouched.

Content was adapted from the supplied CV. LinkedIn is linked directly; profile content could not be independently read. Project performance figures in the preserved original page retain the CV's simulation, projected, or estimated context.

## Open-source optics

The main version adapts the shared SVG filter formula and layered surface approach from [@zakisheriff/liquid-glass](https://github.com/zakisheriff/Liquid-Glass) 0.1.3, repository commit `a3e4c6367faca9ba9b7de0910ce61d4e45af5677`. The package declares the MIT license. Its React dependency is omitted; a small native JavaScript adapter adds one shared filter and pointer-responsive reflections to the existing semantic HTML. Attribution, source metadata, and the MIT notice are stored in `assets/vendor/zaki-liquid-glass.*`.

The filter uses a low-strength SVG displacement map and 0.3px blur over a high-contrast background. Browsers without SVG backdrop filters retain the clear tint, reflective border and readable text. Reduced-transparency preferences return to the opaque base design, while reduced-motion preferences disable pointer movement.

The preserved WebGL version uses [naughtyduk/liquidGL](https://github.com/naughtyduk/liquidGL), pinned to commit `17ccba9d2660289dba5a3dedb047868a505eeedf`, under the MIT license. The original source is bundled unchanged, with its license in `assets/vendor/liquidGL.LICENSE`. It provides WebGL refraction, chromatic dispersion and specular highlights with `frost: 0`. The library supports WebGL-enabled Chrome, Edge, Firefox and Safari, subject to device GPU support. Its page snapshot stays in the browser.

The site integrates the pinned renderer's canvas into the navigation's stacking context, preventing it from covering page text. Snapshot resolution is bounded to approximately six million pixels; animated highlights are capped at 30 fps and paused in hidden tabs. Reduced motion disables animated highlights and pointer reflections. The renderer's frame scheduling fields are used in this integration, so review `clear-glass.js` before upgrading the pinned vendor source.

Static panels use clear CSS surfaces and pointer-responsive reflective rims. On Chromium, [deepika-builds/liquid-glass](https://github.com/deepika-builds/liquid-glass), pinned to `98ed97bd99def529493fd37177228810f6422f6d`, adds SVG edge refraction at zero blur. This small MIT-licensed source is also bundled unchanged. Panels retain clear CSS reflections in browsers without SVG backdrop support. Off-screen SVG lenses initialize as they approach the viewport. All content remains selectable HTML; no runtime CDN or external image requests are needed.
