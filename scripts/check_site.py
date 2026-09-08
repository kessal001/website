"""Dependency-free structural checks for the static portfolio."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import json
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = sorted(ROOT.glob("*.html"))
errors: list[str] = []
BASE = "https://kessal001.github.io/website/"
canonicals = []
titles = []
descriptions = []

class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.ids: list[str] = []
        self.hrefs: list[str] = []
        self.assets: list[str] = []
        self.h1 = 0
        self.lang = False
        self.description = False
        self.canonical = False
    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if tag == "html" and data.get("lang"): self.lang = True
        if tag == "h1": self.h1 += 1
        if data.get("id"): self.ids.append(data["id"])
        if tag == "a" and data.get("href"):
            self.hrefs.append(data["href"])
            if data.get("target") == "_blank" and "noopener" not in data.get("rel", "").split():
                errors.append(f"{current}: target=_blank link lacks rel=noopener: {data['href']}")
        if tag in {"img", "script"} and data.get("src"): self.assets.append(data["src"])
        if tag == "link" and data.get("href") and data.get("rel") in {"stylesheet", "icon", "apple-touch-icon", "manifest"}: self.assets.append(data["href"])
        if tag == "meta" and data.get("name") == "description" and data.get("content"): self.description = True
        if tag == "link" and data.get("rel") == "canonical" and data.get("href"): self.canonical = True

for page in HTML_FILES:
    current = page.name
    parser = PageParser()
    parser.feed(page.read_text(encoding="utf-8"))
    source = page.read_text(encoding="utf-8")
    title = re.findall(r"<title>(.*?)</title>", source, re.S)
    if len(title) != 1 or not title[0].strip(): errors.append(f"{current}: expected one nonempty title")
    else: titles.append(title[0])
    descriptions.extend(re.findall(r'<meta name="description" content="([^"]+)"', source))
    if current != "404.html":
        expected = BASE + ("" if current == "index.html" else current)
        canonical = re.findall(r'<link rel="canonical" href="([^"]+)"', source)
        if canonical != [expected]: errors.append(f"{current}: canonical does not match public URL")
        canonicals.extend(canonical)
        if re.search(r'name="robots"[^>]*content="[^"]*noindex', source): errors.append(f"{current}: unexpected noindex")
        if f'property="og:url" content="{expected}"' not in source: errors.append(f"{current}: og:url mismatch")
        for name in ("twitter:card", "twitter:title", "twitter:description", "twitter:image"):
            if f'name="{name}" content="' not in source: errors.append(f"{current}: missing {name}")
        blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>', source, re.S)
        if not blocks: errors.append(f"{current}: missing structured data")
        for block in blocks:
            try:
                data = json.loads(block)
                if data.get("@context") != "https://schema.org": errors.append(f"{current}: invalid schema context")
            except (ValueError, AttributeError): errors.append(f"{current}: invalid JSON-LD")
    elif 'name="robots" content="noindex"' not in source:
        errors.append("404.html: missing noindex")
    for img in re.findall(r'<img\b[^>]*>', source):
        if not re.search(r'\balt="[^"]*"', img): errors.append(f"{current}: image missing alt")
        if not all(re.search(fr'\b{attr}="\d+"', img) for attr in ("width", "height")):
            errors.append(f"{current}: image missing intrinsic dimensions")
    if not parser.lang: errors.append(f"{current}: missing html lang")
    if parser.h1 != 1: errors.append(f"{current}: expected one h1, found {parser.h1}")
    if not parser.description: errors.append(f"{current}: missing description")
    if current != "404.html" and not parser.canonical: errors.append(f"{current}: missing canonical")
    duplicates = sorted({item for item in parser.ids if parser.ids.count(item) > 1})
    if duplicates: errors.append(f"{current}: duplicate ids: {', '.join(duplicates)}")
    for href in parser.hrefs + parser.assets:
        parts = urlsplit(href)
        if parts.scheme or href.startswith(("mailto:", "tel:", "#")): continue
        local_path = unquote(parts.path)
        if local_path.startswith("/website/"):
            target = (ROOT / local_path.removeprefix("/website/")).resolve()
        else:
            target = (page.parent / local_path).resolve() if local_path else page.resolve()
        if not target.exists(): errors.append(f"{current}: broken local link: {href}")

for values, label in ((titles, "title"), (descriptions, "description")):
    if len(values) != len(set(values)): errors.append(f"Duplicate page {label}")
try:
    sitemap = ET.parse(ROOT / "sitemap.xml")
    locations = [node.text for node in sitemap.findall("{*}url/{http://www.sitemaps.org/schemas/sitemap/0.9}loc")]
    if sorted(locations) != sorted(canonicals): errors.append("Sitemap must contain each indexable canonical exactly once")
    for node in sitemap.findall("{*}url/{http://www.google.com/schemas/sitemap-image/1.1}image/{*}loc"):
        if not node.text.startswith(BASE) or not (ROOT / unquote(node.text.removeprefix(BASE))).is_file():
            errors.append(f"Sitemap image missing: {node.text}")
except (ET.ParseError, OSError) as error:
    errors.append(f"Invalid sitemap: {error}")
if f"Sitemap: {BASE}sitemap.xml" not in (ROOT / "robots.txt").read_text():
    errors.append("robots.txt: missing sitemap reference")
if 'name="google-site-verification" content="nlcJfvqD6UtqCvkjObzPAK1iuus1svxKhA2I2Dyqnvs"' not in (ROOT / "index.html").read_text():
    errors.append("Homepage: missing Search Console verification")

if errors:
    print("Site checks failed:")
    for error in errors: print(f"- {error}")
    raise SystemExit(1)
print(f"Site checks passed for {len(HTML_FILES)} HTML pages.")
