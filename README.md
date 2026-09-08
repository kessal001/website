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

## SEO maintenance

After adding a page or changing its title, description, canonical URL or images:

```powershell
python scripts/update_seo.py
python scripts/check_site.py
```

The refresh script derives social cards, page and breadcrumb JSON-LD and an XML
sitemap with page images from the HTML. Authored Person and project facts remain
in their existing JSON-LD blocks. All generated metadata is static HTML, available
without JavaScript. The 404 page stays noindex and outside the sitemap. Dates are
intentionally omitted rather than presenting metadata regeneration as a content
update. Keep titles and descriptions specific to the actual content of each page.

### Google Search Console

1. Publish the changes to GitHub Pages.
2. Add or select the URL-prefix property `https://kessal001.github.io/website/`.
3. Verify using the HTML tag already present in the homepage head.
4. Submit `https://kessal001.github.io/website/sitemap.xml` in **Sitemaps**.
5. Inspect the homepage URL, run the live test and request indexing. Monitor
   indexing, search queries, clicks and Core Web Vitals as Google collects data.

GitHub project Pages hosts this site in a subdirectory. Crawlers use
`https://kessal001.github.io/robots.txt`, not `/website/robots.txt`. The repository's
robots file is retained for deployments at a domain root; it does not control the
current host. If managing the root site separately, add the sitemap declaration
there without overwriting any existing rules. Direct submission in Search Console
works independently of that file. A custom domain is optional and requires updating
all canonical/OG URLs and the `BASE` constants before republishing.

References: [Google's SEO developer guide](https://developers.google.com/search/docs/fundamentals/get-started-developers),
[sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap),
[robots.txt location](https://developers.google.com/search/docs/crawling-indexing/robots/create-robots-txt).

Local structural checks do not prove Google indexing, rich-result eligibility or
live performance scores. Search Console submission requires the owner's signed-in
account; no indexing or ranking guarantee is implied.
