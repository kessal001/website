"""Dependency-free structural checks for the static portfolio."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = sorted(ROOT.glob("*.html"))
errors: list[str] = []

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
    if not parser.lang: errors.append(f"{current}: missing html lang")
    if parser.h1 != 1: errors.append(f"{current}: expected one h1, found {parser.h1}")
    if not parser.description: errors.append(f"{current}: missing description")
    if current != "404.html" and not parser.canonical: errors.append(f"{current}: missing canonical")
    duplicates = sorted({item for item in parser.ids if parser.ids.count(item) > 1})
    if duplicates: errors.append(f"{current}: duplicate ids: {', '.join(duplicates)}")
    for href in parser.hrefs + parser.assets:
        parts = urlsplit(href)
        if parts.scheme or href.startswith(("mailto:", "tel:", "#")): continue
        target = (page.parent / unquote(parts.path)).resolve() if parts.path else page.resolve()
        if not target.exists(): errors.append(f"{current}: broken local link: {href}")

if errors:
    print("Site checks failed:")
    for error in errors: print(f"- {error}")
    raise SystemExit(1)
print(f"Site checks passed for {len(HTML_FILES)} HTML pages.")
