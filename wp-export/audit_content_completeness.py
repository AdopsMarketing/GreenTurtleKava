import json, os, re, sys
from bs4 import BeautifulSoup

ROOT = "/Users/remanth/Desktop/astro/GTK"
POSTS_JSON = os.path.join(ROOT, "wp-export/raw/posts.json")
BLOG_DIR = os.path.join(ROOT, "src/content/blog")

ALLOWED_WIDGETS = {"text-editor.default", "heading.default", "image.default", "accordion.default"}
# Widget types that are purely decorative / structural and never carry reader-facing content
HARMLESS_WIDGETS = {"divider.default", "spacer.default"}

def strip_frontmatter(md_text):
    if md_text.startswith("---"):
        parts = md_text.split("---", 2)
        if len(parts) >= 3:
            return parts[2]
    return md_text

def get_text_len(html):
    soup = BeautifulSoup(html, "lxml")
    text = soup.get_text(separator=" ", strip=True)
    return len(text), text

def count_imgs(html):
    soup = BeautifulSoup(html, "lxml")
    return len(soup.find_all("img"))

def get_widget_types(html):
    soup = BeautifulSoup(html, "lxml")
    types = []
    for el in soup.select("[data-widget_type]"):
        types.append(el.get("data-widget_type", ""))
    return types

def main():
    posts = json.load(open(POSTS_JSON))
    results = []

    for post in posts:
        slug = post["slug"]
        raw_html = post["content"]["rendered"]

        md_path = os.path.join(BLOG_DIR, f"{slug}.md")
        if not os.path.exists(md_path):
            results.append({
                "slug": slug,
                "missing_md_file": True,
            })
            continue

        md_text = open(md_path, encoding="utf-8").read()
        body = strip_frontmatter(md_text)

        raw_len, raw_text = get_text_len(raw_html)
        ext_len, ext_text = get_text_len(body)
        ratio = (ext_len / raw_len) if raw_len else 0.0

        raw_imgs = count_imgs(raw_html)
        ext_imgs = count_imgs(body)

        widget_types = get_widget_types(raw_html)
        unique_widgets = sorted(set(widget_types))
        unhandled = sorted(set(w for w in widget_types if w not in ALLOWED_WIDGETS))
        unhandled_non_harmless = sorted(set(w for w in unhandled if w not in HARMLESS_WIDGETS))

        flags = []
        if unhandled_non_harmless:
            flags.append(f"unhandled_widgets:{unhandled_non_harmless}")
        if ratio < 0.5:
            flags.append(f"low_text_ratio:{ratio:.2f}")
        if raw_imgs > 0 and ext_imgs < raw_imgs:
            flags.append(f"missing_images:{ext_imgs}/{raw_imgs}")

        results.append({
            "slug": slug,
            "raw_len": raw_len,
            "ext_len": ext_len,
            "ratio": round(ratio, 3),
            "raw_imgs": raw_imgs,
            "ext_imgs": ext_imgs,
            "unique_widgets": unique_widgets,
            "unhandled_widgets": unhandled,
            "unhandled_non_harmless": unhandled_non_harmless,
            "flags": flags,
        })

    # Print full table
    print(f"{'slug':<70} {'ratio':>6} {'imgs(raw/ext)':>14}  flags")
    for r in results:
        if r.get("missing_md_file"):
            print(f"{r['slug']:<70} {'N/A':>6} {'N/A':>14}  MISSING MD FILE")
            continue
        imgs_str = f"{r['raw_imgs']}/{r['ext_imgs']}"
        flag_str = "; ".join(r["flags"]) if r["flags"] else ""
        print(f"{r['slug']:<70} {r['ratio']:>6} {imgs_str:>14}  {flag_str}")

    print("\n\n=== FLAGGED POSTS ===")
    flagged = [r for r in results if r.get("flags") or r.get("missing_md_file")]
    for r in flagged:
        print(json.dumps(r, indent=2))

    print(f"\nTotal posts: {len(results)}  Flagged: {len(flagged)}")

    # Also dump all unique widget types seen across the whole corpus, with counts
    all_widgets = {}
    for post in posts:
        raw_html = post["content"]["rendered"]
        for w in get_widget_types(raw_html):
            all_widgets[w] = all_widgets.get(w, 0) + 1
    print("\n=== ALL WIDGET TYPES ACROSS CORPUS ===")
    for w, c in sorted(all_widgets.items(), key=lambda x: -x[1]):
        marker = "" if w in ALLOWED_WIDGETS else ("  <-- UNHANDLED" + (" (harmless)" if w in HARMLESS_WIDGETS else " (NEEDS REVIEW)"))
        print(f"{w:<40} {c:>4}{marker}")

if __name__ == "__main__":
    main()
