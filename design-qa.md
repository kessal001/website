# Design QA — Portfolio Optimizer project addition

**Comparison target**

- Source visual truth: the verified four-project portfolio captures in `C:\Users\LucaPedersoli\AppData\Local\Temp\codex-portfolio-bending-qa-2026-08-29\`, especially `projects-full.png` and `projects-desktop.png`.
- Rendered implementation: Chrome captures in `C:\Users\LucaPedersoli\AppData\Local\Temp\codex-portfolio-optimizer-qa-2026-08-31\`.
- Desktop viewport: 1905 × 904 CSS px at device scale factor 1; browser content width is 1890 px when the vertical scrollbar is present.
- Mobile viewport: 390 × 844 CSS px; browser content width is 375 px with the vertical scrollbar.
- State: local, unauthenticated, light theme. The project index and new case study were inspected at desktop and mobile widths.

**Findings**

- No actionable P0, P1 or P2 findings remain.
- Typography: the established Palatino/Georgia display system and sans-serif metadata remain unchanged. The new title has stable wrapping at both tested widths.
- Spacing and layout: the original two-column project rhythm remains intact. The fifth item becomes a single full-width editorial feature on desktop and returns to the established vertical card pattern on mobile.
- Colors and tokens: the paper, ink, line and green accent tokens are unchanged. Chart colors come from a real project output rather than decorative artwork.
- Image quality: the preview is a local copy of the efficient-frontier and walk-forward chart embedded in the repository guide. Its labels and overall analytical structure remain visible at card and case-study scale.
- Copy and content: the case study explains the problem, configurable acquisition layer, risk diagnostics, constrained construction and out-of-sample validation. It identifies the work as an analytical tool rather than financial advice.
- Responsiveness: Chrome reported no horizontal overflow on the project index or new case study at desktop and mobile widths. The wide card collapses into one column at the existing breakpoint.
- Accessibility and interactions: the image has descriptive alternative text; semantic headings, local navigation and external-link safety attributes are present. Navigation from the project card to the detail route succeeded.
- Browser evidence: all five project images loaded with non-zero natural dimensions and browser warning/error logs were empty.

**Visual evidence**

- `projects-desktop.png` records the unchanged project-index introduction and top-grid rhythm.
- `projects-wide-card-desktop-v2.png` records the corrected full-width fifth card with the complete chart visible.
- `projects-mobile.png` records the single-column project index at 390 px.
- `optimizer-detail-desktop.png` and `optimizer-detail-mobile.png` record the new case-study header and opening content at both target widths.

**Comparison history**

1. First implementation — P2 chart crop on the wide desktop card.
   Evidence: `projects-wide-card-desktop.png` cut off part of the chart timeline because the wide-card image inherited the global cover treatment.
   Fix: scoped the wide-card image to `object-fit: contain`, preserved its white analytical canvas and added a mobile minimum-height reset.
   Post-fix evidence: `projects-wide-card-desktop-v2.png` shows the full chart without distortion or layout overflow.

**Implementation Checklist**

- [x] Preserve the academic editorial design system.
- [x] Add a fifth descriptive project and dedicated case study.
- [x] Use a real project output instead of a generic illustration.
- [x] Verify desktop and mobile layout, navigation, asset loading and browser logs.
- [x] Resolve all P0/P1/P2 findings.

**Follow-up Polish**

- No material P3 visual issue remains for a future pass.

final result: passed
