# Doug Hyun Kim — personal website

A responsive academic bio and portfolio with an Apple-inspired Liquid Glass appearance: frosted panels, translucent navigation, soft blue light, and rounded surfaces. The website uses plain HTML and CSS with no build step or package installation. It includes reduced-motion, reduced-transparency, and unsupported-browser fallbacks.

## Files

- `index.html`: biography, publication, experience, projects, education, and contact links.
- `styles.css`: responsive design, colors, typography, and print styles.
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

Content was adapted from the supplied CV. LinkedIn is linked directly; profile content could not be independently read. Project performance figures preserve the CV's simulation, projected, or estimated context.
