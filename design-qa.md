# Design QA — Bending Spoons project addition

**Comparison target**

- Source visual truth: the verified three-project portfolio captures in `C:\Users\LucaPedersoli\AppData\Local\Temp\codex-portfolio-build-qa-2026-08-28\`, specifically `home-full.png`, `projects-full.png` and `projects-desktop-exact.png`.
- Rendered implementation: Chrome captures in `C:\Users\LucaPedersoli\AppData\Local\Temp\codex-portfolio-bending-qa-2026-08-29\`, including `home-full.png`, `projects-full.png`, `projects-desktop.png`, `projects-mobile.png`, `bending-detail-desktop-v2.png` and `bending-detail-mobile-v2.png`.
- Side-by-side evidence: `compare-home-full.png`, `compare-projects-full.png` and `compare-projects-focused.png` in the implementation screenshot directory.
- Desktop viewport: 1905 × 904 CSS px at device scale factor 1; viewport screenshots are 1905 × 904 pixels. Browser content width is 1890 px when a vertical scrollbar is present.
- Mobile viewport: 390 × 844 CSS px at device scale factor 1; browser content width is 375 px with the vertical scrollbar.
- State: public, unauthenticated, light theme. Home and projects were compared as full pages and at page top; the new detail page was checked at page top.

**Findings**

- No actionable P0, P1 or P2 findings remain.
- Typography: the established Palatino/Georgia display system and sans-serif metadata remain unchanged. The long Bending Spoons title now uses a scoped responsive scale and holds the intended two-line hierarchy on desktop and mobile.
- Spacing and layout: the project area changes intentionally from a three-column row to a balanced two-by-two grid. Rules, gutters, card alignment and section rhythm remain consistent with the academic editorial source.
- Colors and tokens: the paper, ink, line and green accent tokens are unchanged. The navy, blue, green and red in the research preview belong to the real report asset rather than invented site decoration.
- Image quality: both project previews are pinned local copies from repository commit `e4fd44f879b3fe0c3f55b0b13c936879c0241ed8`. The document crop keeps the thesis title, conclusion and valuation chart legible at card scale; the full document remains available on the case-study page.
- Copy and content: the case study distinguishes a dated 28 August 2026 conclusion from current investment advice. It documents role, deliverables, methodology, assumptions, quality checks and output without claiming live market relevance.
- Responsiveness: Chrome reported no horizontal overflow on home, project index or the new case study at desktop and mobile sizes. Four cards collapse into one column below the existing breakpoint.
- Accessibility and interactions: the new image has descriptive alternative text; the page keeps semantic headings, project navigation and external-link safety attributes. The project card was used to navigate from the index to the new detail route successfully.
- Browser evidence: Chrome rendered the home, project index and Bending Spoons detail page. All four project images loaded with non-zero natural dimensions. Browser warning/error logs were empty after desktop and mobile navigation.

**Full-view comparison evidence**

- `compare-home-full.png` shows that the additional row increases only the Selected Work section while preserving the rest of the home hierarchy.
- `compare-projects-full.png` shows the intentional transition from a three-card row to a balanced four-card grid without changing the surrounding page language.

**Focused region comparison evidence**

- `compare-projects-focused.png` places the old and new project intros together at the same viewport. Typography, shell width, rules and header spacing remain aligned.
- `bending-detail-desktop-v2.png` and `bending-detail-mobile-v2.png` were inspected at native viewport size for title wrapping, fact-grid alignment and above-the-fold density.

**Comparison history**

1. First implementation — P2 title scale on the new detail page.
   Evidence: `bending-detail-desktop.png` and `bending-detail-mobile.png` showed the global display scale forcing the long name into four dominant lines.
   Fix: added `.project-header--long` with `font-size: clamp(3rem, 5vw, 6rem)` and applied it only to this case study.
   Post-fix evidence: `bending-detail-desktop-v2.png` and `bending-detail-mobile-v2.png` show a stable two-line title with the project deck and facts returning above the fold.

**Implementation Checklist**

- [x] Preserve the existing editorial design system.
- [x] Add a balanced four-project layout on home and project index.
- [x] Verify the new case study at desktop and mobile widths.
- [x] Test project-card navigation, asset loading and browser logs.
- [x] Resolve all P0/P1/P2 findings.

**Follow-up Polish**

- No P3 visual issue is material enough to hold for a future pass.

final result: passed
