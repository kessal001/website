# Design QA — portfolio refresh

**Comparison target**

- Source visual truth: `C:\Users\LucaPedersoli\AppData\Local\Temp\codex-portfolio-audit-2026-08-28\01-home-desktop.png`, `02-projects-desktop.png`, `06-home-mobile.png`, `07-projects-mobile.png`.
- Rendered implementation: `C:\Users\LucaPedersoli\AppData\Local\Temp\codex-portfolio-build-qa-2026-08-28\home-desktop-exact.png`, `projects-desktop-exact.png`, `home-mobile-exact.png`, `projects-mobile-exact.png`, `home-full.png`, `projects-full.png`.
- Side-by-side comparison evidence: `compare-home-desktop.png`, `compare-projects-desktop.png`, `compare-home-mobile.png`, `compare-projects-mobile.png` in the implementation screenshot directory above.
- Desktop viewport: 1905 × 904 CSS px, device scale factor 1. Source and implementation captures are both 1905 × 904 pixels.
- Mobile viewport: 375 × 812 CSS px, device scale factor 1. Source and implementation captures are both 375 × 812 pixels.
- State: public, unauthenticated, light theme, page top. Full-page captures cover the complete home and projects index.

**Findings**

- No actionable P0, P1 or P2 findings remain.
- Typography: the existing Palatino/Georgia editorial system, sans-serif metadata hierarchy, optical weights and line lengths remain consistent with the source. New project titles use the same display treatment.
- Spacing and layout: shell width, rules, section indices and vertical rhythm remain consistent. The project index is intentionally shorter; the new three-column work grid follows the established rule-based academic layout without rounded cards or shadows.
- Colors and tokens: the paper, ink, muted ink, line and green accent tokens are unchanged.
- Image quality: the source portrait is preserved with responsive WebP derivatives. Project visuals are real, pinned repository assets stored locally; SVG remains vector and diagrams retain their original aspect ratios.
- Copy and content: the original positioning and Teaching archive remain intact. Project copy now separates problem, approach, capabilities, role, stack and result without inventing metrics or individual ownership.
- Responsiveness: Chrome rendering at 375 px and 390 px reports equal document and viewport widths with no overflowing elements. The mobile navigation now forms an intentional 3+2 grid with approximately 44 px-high links.
- Accessibility and interaction: semantic headings, skip links, visible focus styles, `aria-current`, descriptive alternative text and reduced-motion handling are present. Primary navigation, project-card routes, case-study pagination, CV downloads and local assets passed automated link checks.
- Browser evidence: Chrome-rendered screenshots were captured for home, project index and a project detail page. Primary route changes were exercised across the home, project index and all three detail URLs. Chrome produced no console error output during the captures; all inspected images loaded after their lazy-load scroll state.

**Full-view comparison evidence**

- `home-full.png` confirms the complete hierarchy from hero through abstract, current practice, selected work, trajectory and footer. All three project assets load at their intended crop.
- `projects-full.png` confirms the complete project index and footer, with one coherent card grid and no clipped content.

**Focused region comparison evidence**

- The four `compare-*.png` composites place source and implementation together at identical viewport dimensions. They were used to inspect header/navigation, hero typography, project intro hierarchy, portrait crop, rules, text wrapping and mobile spacing.

**Comparison history**

1. Earlier audit finding — P2 mobile navigation: 10.88 px labels, short tap targets and a visually accidental four-plus-one wrap.
   Fix: replaced wrapping flex behavior below 580 px with a deliberate 3+2 grid, 0.75 rem labels and 2.75 rem minimum link height.
   Post-fix evidence: `compare-home-mobile.png` and `compare-projects-mobile.png`; no clipping or horizontal overflow at 375 px or 390 px.
2. Earlier audit finding — P2 projects discoverability: the projects page was a long single document and the home did not expose project evidence.
   Fix: added a selected-work section to the home, converted `projects.html` into an index and created three dedicated case-study routes.
   Post-fix evidence: `home-full.png`, `projects-full.png` and `project-detail-desktop.png`; hierarchy and navigation remain consistent with the source system.

**Implementation Checklist**

- [x] Preserve the source editorial design system.
- [x] Verify desktop and mobile viewport rendering.
- [x] Verify local imagery, links, headings and metadata.
- [x] Verify full-page composition and focused source comparisons.
- [x] Resolve all P0/P1/P2 findings.

**Follow-up Polish**

- P3: capture hover/focus screenshots in a future regression suite if the site gains more interactive controls.

final result: passed
