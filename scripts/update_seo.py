"""Refresh derived SEO metadata and sitemap after editing page content (stdlib only)."""
import html
import json
from pathlib import Path
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://kessal001.github.io/website/"
NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
IMAGE_NS = "http://www.google.com/schemas/sitemap-image/1.1"
START = "<!-- Generated SEO: python scripts/update_seo.py -->"
END = "<!-- End generated SEO -->"


def refresh():
    ET.register_namespace("", NS)
    ET.register_namespace("image", IMAGE_NS)
    sitemap = ET.Element(f"{{{NS}}}urlset")
    pages = sorted(ROOT.glob("*.html"), key=lambda p: (p.name != "index.html", p.name))
    for path in pages:
        source = path.read_text(encoding="utf-8")
        if re.search(r'name="robots"[^>]*content="[^"]*noindex', source):
            continue
        source = re.sub(re.escape(START) + r".*?" + re.escape(END) + r"\n?", "", source, flags=re.S)
        title = html.unescape(re.search(r"<title>(.*?)</title>", source, re.S)[1])
        description = html.unescape(re.search(r'<meta name="description" content="([^"]+)"', source)[1])
        canonical = re.search(r'<link rel="canonical" href="([^"]+)"', source)[1]
        image = re.search(r'<meta property="og:image" content="([^"]+)"', source)[1]
        label = title.split(" — ")[0]
        nodes = []
        page_type = {"index.html": "ProfilePage", "contact.html": "ContactPage", "projects.html": "CollectionPage", "teaching.html": "CollectionPage"}.get(path.name, "WebPage")
        page = {"@type": page_type, "@id": canonical + "#webpage", "url": canonical, "name": title, "description": description, "inLanguage": "en", "isPartOf": {"@id": BASE + "#website"}, "about": {"@id": BASE + "#person"}}
        if path.name == "index.html":
            page["mainEntity"] = {"@id": BASE + "#person"}
            nodes.append({"@type": "WebSite", "@id": BASE + "#website", "url": BASE, "name": "Luca Pedersoli", "inLanguage": "en", "publisher": {"@id": BASE + "#person"}})
        else:
            crumbs = [{"@type": "ListItem", "position": 1, "name": "Luca Pedersoli", "item": BASE}]
            if path.name.startswith("project-"):
                crumbs.append({"@type": "ListItem", "position": 2, "name": "Projects", "item": BASE + "projects.html"})
            crumbs.append({"@type": "ListItem", "position": len(crumbs) + 1, "name": label, "item": canonical})
            page["breadcrumb"] = {"@id": canonical + "#breadcrumb"}
            nodes.append({"@type": "BreadcrumbList", "@id": canonical + "#breadcrumb", "itemListElement": crumbs})
        nodes.append(page)
        # Keep authored project/person facts; connect their identity to this page.
        def connect(match):
            data = json.loads(match[1])
            if data.get("@type") == "Person":
                data["@id"] = BASE + "#person"
            else:
                data["@id"] = canonical + "#project"
                data["url"] = canonical
                data["mainEntityOfPage"] = {"@id": canonical + "#webpage"}
                page["mainEntity"] = {"@id": canonical + "#project"}
            return '<script type="application/ld+json">\n' + json.dumps(data, ensure_ascii=False, indent=2) + '\n</script>'
        source = re.sub(r'<script type="application/ld\+json">(.*?)</script>', connect, source, flags=re.S)
        esc = lambda value: html.escape(value, quote=True)
        tags = [START, '<meta name="robots" content="index, follow, max-image-preview:large">', '<meta property="og:site_name" content="Luca Pedersoli">', '<meta name="twitter:card" content="summary_large_image">', f'<meta name="twitter:title" content="{esc(title)}">', f'<meta name="twitter:description" content="{esc(description)}">', f'<meta name="twitter:image" content="{esc(image)}">', f'<meta property="og:image:alt" content="{esc(label)}">', f'<meta name="twitter:image:alt" content="{esc(label)}">', '<link rel="sitemap" type="application/xml" href="sitemap.xml">', '<script type="application/ld+json">', json.dumps({"@context": "https://schema.org", "@graph": nodes}, ensure_ascii=False, indent=2), '</script>', END]
        source = source.replace('</head>', '\n'.join(tags) + '\n</head>')
        path.write_text(source, encoding="utf-8")
        entry = ET.SubElement(sitemap, f"{{{NS}}}url")
        ET.SubElement(entry, f"{{{NS}}}loc").text = canonical
        # Include images actually displayed in this page, retaining original assets.
        images = dict.fromkeys(re.findall(r'<img\b[^>]*\bsrc="([^"]+)"', source))
        for src in images:
            image_entry = ET.SubElement(entry, f"{{{IMAGE_NS}}}image")
            ET.SubElement(image_entry, f"{{{IMAGE_NS}}}loc").text = BASE + src
    ET.indent(sitemap, space="  ")
    ET.ElementTree(sitemap).write(ROOT / "sitemap.xml", encoding="utf-8", xml_declaration=True)
    print("SEO metadata and sitemap refreshed.")


if __name__ == "__main__":
    refresh()
