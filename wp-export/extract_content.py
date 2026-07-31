import json, re, os, sys
from bs4 import BeautifulSoup, NavigableString

ALLOWED_TAGS = {"p","h1","h2","h3","h4","h5","h6","ul","ol","li","strong","em","b","i",
                "a","img","br","blockquote","table","thead","tbody","tr","td","th","hr"}

def clean_fragment(el):
    """Strip all attrs except href/src/alt from an element tree, drop disallowed wrapper tags but keep their children."""
    for tag in el.find_all(True):
        if tag.name not in ALLOWED_TAGS:
            tag.unwrap()
            continue
        attrs = {}
        if tag.name == "a" and tag.get("href"):
            attrs["href"] = tag["href"]
        if tag.name == "img":
            if tag.get("src"):
                attrs["src"] = tag["src"]
            if tag.get("alt"):
                attrs["alt"] = tag["alt"]
        tag.attrs = attrs
    return el

def extract_elementor_body(html):
    soup = BeautifulSoup(html, "lxml")
    out_parts = []
    for widget in soup.select("[data-widget_type]"):
        wtype = widget.get("data-widget_type", "")
        container = widget.select_one(".elementor-widget-container")
        if not container:
            continue
        if wtype.startswith("text-editor"):
            frag = clean_fragment(BeautifulSoup(str(container), "lxml"))
            for child in frag.find(class_="elementor-widget-container").children if frag.find(class_="elementor-widget-container") else []:
                pass
            inner = "".join(str(c) for c in container.contents)
            frag_soup = clean_fragment(BeautifulSoup(inner, "lxml"))
            out_parts.append(str(frag_soup).strip())
        elif wtype.startswith("heading"):
            h = container.find(re.compile("^h[1-6]$"))
            if h:
                text = h.get_text(strip=True)
                level = h.name
                out_parts.append(f"<{level}>{text}</{level}>")
        elif wtype.startswith("image"):
            img = container.find("img")
            if img and img.get("src"):
                alt = img.get("alt", "")
                out_parts.append(f'<img src="{img["src"]}" alt="{alt}">')
        elif wtype.startswith("accordion"):
            items = container.select(".elementor-accordion-item")
            for it in items:
                title_el = it.select_one(".elementor-tab-title")
                content_el = it.select_one(".elementor-tab-content")
                title = title_el.get_text(strip=True) if title_el else ""
                if title:
                    out_parts.append(f"<h3>{title}</h3>")
                if content_el:
                    inner = "".join(str(c) for c in content_el.contents)
                    frag_soup = clean_fragment(BeautifulSoup(inner, "lxml"))
                    out_parts.append(str(frag_soup).strip())
        # divider/html/other widgets: skip
    return "\n".join(p for p in out_parts if p.strip())

def extract_plain_body(html):
    soup = BeautifulSoup(html, "lxml")
    for tag in soup.find_all(True):
        tag.attrs = {}
    body = soup.body if soup.body else soup
    return "".join(str(c) for c in body.contents).strip()

def frontmatter(d):
    lines = ["---"]
    for k, v in d.items():
        if v is None:
            v = ""
        v = str(v).replace('"', '\\"').replace("\n", " ")
        lines.append(f'{k}: "{v}"')
    lines.append("---\n")
    return "\n".join(lines)

def media_lookup():
    path = "raw/media-map.json"
    if os.path.exists(path):
        return json.load(open(path))
    return {}

def main():
    kind = sys.argv[1]
    items = json.load(open(f"raw/{kind}.json" if kind != "events" else "raw/events-live.json"))
    seo_map = {x["slug"]: x for x in json.load(open(f"raw/{kind}-seo.json" if kind != "events" else "raw/events-seo.json"))}
    media = media_lookup()
    out_dir = f"content/{kind}"
    os.makedirs(out_dir, exist_ok=True)
    count = 0
    for it in items:
        slug = it["slug"]
        seo = seo_map.get(slug, {})
        title = it.get("title", {}).get("rendered", "") or seo.get("title", "")
        raw_html = it["content"]["rendered"]
        if "elementor" in raw_html:
            body = extract_elementor_body(raw_html)
        else:
            body = extract_plain_body(raw_html)
        featured_id = it.get("featured_media")
        featured_url = media.get(str(featured_id), "") if featured_id else ""
        fm = {
            "title": title,
            "slug": slug,
            "date": it.get("date", ""),
            "link": it.get("link", ""),
            "metaDescription": seo.get("meta_description") or "",
            "canonical": seo.get("canonical") or it.get("link", ""),
            "ogImage": seo.get("og_image") or featured_url,
        }
        content = frontmatter(fm) + body + "\n"
        with open(f"{out_dir}/{slug}.md", "w") as f:
            f.write(content)
        count += 1
    print(f"{kind}: wrote {count} files to {out_dir}/")

if __name__ == "__main__":
    main()
