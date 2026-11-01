# Toast, Cat, Gravity

An experimental web companion to **Toast, Cat, Gravity: The Buttered Cat’s Guide To Reality**, by Matthew Chenoweth Wright with Millie Sievert and MillieComplex.

The site includes the complete **88-page manuscript**, all **eight source charts**, a searchable reader, seven core chapter entry points, four interludes, local notes/bookmarks, and the original PDF.

## Two experiments

**The paradox playground** compares an explicitly fictional hover animation with ideal gravity-only free fall. Height, spin, playback, reset, and a time slider expose the model assumptions. Free fall uses `h(t) = max(0, h0 - 0.5*g*t*t)`, `g = 9.81 m/s²`, zero initial vertical velocity, and no drag. Contact stops the point marker; no animal biomechanics are modeled. The hover path approaches a prescribed 0.1016 m setpoint with an exponential rule. It is not derived from EFMW and supplies no demonstration of antigravity or free energy.

**The signal lab** constructs 500 samples over 100 days from periods of 3.14, 6.28, and 1.57 days plus seeded Gaussian noise, reflecting the recipe on PDF pp. 77–78. A mean-centered, unwindowed discrete Fourier transform exposes the three strongest separated peaks. Toggle the planted cycles off to examine finite-sample noise peaks. CSV export includes the seed and recipe settings. The JavaScript PRNG differs from NumPy's, so this is a reproducible companion demonstration, not a bit-for-bit recreation of the manuscript's chart.

Neither demonstration measures cognition, neuroplasticity, or gravitational waves. Recovering planted periods is not independent evidence of a physical correlation. The source’s proposed proofs, AGI descriptions, and personal breakthrough predictions are preserved as manuscript content, with clearly separated editorial reading notes where needed.

## Read and run

Open `index.html` directly in a modern browser, or run `python3 -m http.server 8000`. No package install, API key, external fonts, or runtime service is required. All application paths are relative and work at a GitHub Pages project subpath.

JavaScript is needed for the experiments and extracted reader. The original PDF remains available without JavaScript. Local storage and downloads can behave differently under `file:` URLs; use a local web server for consistent behavior. Notes stay in the current browser and can be exported as JSON; they do not sync between devices.

```sh
node --check app.js
node --check models.js
node scripts/test.cjs
node scripts/build.cjs
```

The GitHub workflow runs validation only. It does not activate or configure Pages.

## GitHub Pages — manual activation

As requested, activate Pages yourself: **Settings → Pages → Deploy from a branch → main → / (root)**. The root `index.html` and `.nojekyll` are ready. No GitHub Actions deployment setup is needed. The expected address after activation is `https://enuminous.github.io/Toast-Cat-Gravity/`.

## Source and reproduction

`assets/toast-cat-gravity-manuscript.pdf` is the unchanged uploaded PDF. Its SHA-256 hash is recorded in `source-manifest.json` and checked by the tests. `manuscript.js` contains page-aligned extracted text. Wrapped paragraphs are reconstructed, zero-width spaces removed, and explicit line breaks retained. The extraction asserts that each page's words match the PDF text after whitespace normalization. Equation extraction can include duplicated or malformed symbols already present in the PDF text layer; consult the original PDF for layout and typesetting. Charts are displayed as source images and their embedded lettering is not OCR indexed.

The manuscript’s Python snippets are displayed as text, never executed. To regenerate the web text and source chart images, install PyMuPDF and Pillow in a Python environment and run:

```sh
python scripts/extract.py '/path/to/toast cat gravity.pdf'
```

The author credits follow the title page. Editorial descriptions and the two new interactive models are distinct from the preserved manuscript. No additional open-content license is granted to the manuscript by this edition. Original rights remain with their respective rights holders.

## References for editorial context

- [NASA Glenn: Motion of Free Falling Object](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/motion-of-free-falling-object/) — constant-acceleration model and vacuum assumptions.
- [Clay Mathematics Institute: P vs NP](https://www.claymath.org/millennium/p-vs-np/) — publicly listed as unsolved when checked October 31, 2026. The foreword’s assertions do not constitute verified proof in this edition.
- Source PDF pp. 8–16 and 77–79 — synthetic signal generation and the planted-period analysis.

Contact Matthew on X: [@enuminous](https://x.com/enuminous).
