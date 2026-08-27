# Luca Pedersoli — personal website

A minimal, editorial portfolio built for GitHub Pages.

## Structure

- `index.html` — profile and current practice
- `projects.html` — selected projects presented as descriptive case studies
- `cv.html` — experience, education and CV downloads in PDF and DOCX
- `teaching.html` — teaching archive and course materials
- `contact.html` — contact details and professional profiles
- `main.css` — the complete visual system and responsive layout
- `CV/` — Italian and English CVs in recruiter-ready PDF and editable DOCX formats, plus the current portrait

The site intentionally uses semantic HTML and modern CSS instead of a JavaScript framework. There is no build step, dependency installation or generated output to maintain. MathJax is loaded only on the home page for the displayed formula.

## Local preview

From the repository root:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Then open `http://127.0.0.1:4173/`.

## Deployment

GitHub Pages can publish the repository directly from the `master` branch. The public URL referenced in page metadata is:

`https://kessal001.github.io/website/`
