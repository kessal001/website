# Luca Pedersoli — personal website

A minimal, editorial portfolio built for GitHub Pages.

## Structure

- `index.html` — profile and current practice
- `projects.html` — concise index of selected work
- `project-*.html` — detailed, evidence-based project case studies
- `cv.html` — experience, education and CV downloads in PDF and DOCX
- `teaching.html` — teaching archive and course materials
- `contact.html` — contact details and professional profiles
- `main.css` — the complete visual system and responsive layout
- `assets/` — local, pinned project imagery and responsive portrait files
- `CV/` — Italian and English CVs in recruiter-ready PDF and editable DOCX formats, plus the current portrait
- `scripts/check_site.py` — dependency-free checks for links, metadata and HTML structure

The site intentionally uses semantic HTML, native MathML and modern CSS instead of a JavaScript framework. There is no build step, dependency installation or generated output to maintain. Project images are kept locally so the published pages do not depend on raw GitHub assets at runtime.

## Local preview

From the repository root:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Then open `http://127.0.0.1:4173/`.

Before publishing, run:

```powershell
python scripts/check_site.py
```

The same check runs automatically on pushes and pull requests through GitHub Actions.

## Deployment

GitHub Pages can publish the repository directly from the `master` branch. The public URL referenced in page metadata is:

`https://kessal001.github.io/website/`
