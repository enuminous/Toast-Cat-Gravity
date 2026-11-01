# Validation record

Checked November 1, 2026 (UTC).

- JavaScript syntax checks and `node scripts/test.cjs` passed. These cover free-fall acceleration and contact, prescribed hover convergence, deterministic signals, paired noise, recovery of planted periods, and the zero-signal case.
- Extraction compared all 88 PDF pages against the web text after whitespace normalization, with no discrepancies. All eight chart images are present. The original PDF's SHA-256 matches the provenance manifest.
- Browser checks covered desktop and a 390-pixel mobile iframe: homepage, reader layout, chapter selection, mobile chapter menu, and horizontal overflow.
- Reader search found six pages for “mirror.” Saved page 77, a test note, and night reading persisted across reload. Test notes/bookmarks were removed afterward.
- Notes JSON download contained the selected bookmark and note. CSV download contained 500 samples and the chosen recipe metadata; the zero-noise/no-cycles configuration exported 500 zero amplitudes.
- Time-scrubbing reached the 8-second fictional endpoint and the free-fall contact time. Free-fall mode disables the illustrative spin control. Page notes distinguish source claims from the interactive models.
- Root-relative hosting is unnecessary: local assets use relative paths, and the source PDF link works from the project directory. The static build completed without package installation.

This verifies the site and its stated model behavior, not the manuscript's proposed physical or mathematical claims. GitHub Pages activation is intentionally left to the repository owner.
