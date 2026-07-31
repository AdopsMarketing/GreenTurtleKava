import json, csv, os

def load(path, default=None):
    if os.path.exists(path):
        return json.load(open(path))
    return default if default is not None else []

pages = load("raw/pages.json")
pages_seo = {x["slug"]: x for x in load("raw/pages-seo.json", [])}
posts = load("raw/posts.json")
posts_seo = {x["slug"]: x for x in load("raw/posts-seo.json", [])}
events = load("raw/events-live.json")
events_seo = {x["slug"]: x for x in load("raw/events-seo.json", [])}

rows = []

def add(items, seo_map, kind):
    for it in items:
        seo = seo_map.get(it["slug"], {})
        rows.append({
            "url": it["link"],
            "type": kind,
            "slug": it["slug"],
            "title": (seo.get("title") or it.get("title", {}).get("rendered", "")),
            "meta_description": seo.get("meta_description", ""),
            "canonical": seo.get("canonical", ""),
            "status": seo.get("status", ""),
            "og_image": seo.get("og_image", ""),
        })

add(pages, pages_seo, "page")
add(posts, posts_seo, "post")
add(events, events_seo, "event")

with open("../design-reference/url-inventory.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=["url", "type", "slug", "title", "meta_description", "canonical", "status", "og_image"])
    w.writeheader()
    w.writerows(rows)

print(f"wrote {len(rows)} rows ({len(pages)} pages, {len(posts)} posts, {len(events)} events; events SEO scraped so far: {len(events_seo)}/{len(events)})")
