import json, time, sys, re
import requests
from bs4 import BeautifulSoup

BASE = "https://greenturtlekava.co"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"

def scrape(url):
    r = requests.get(url, headers={"User-Agent": UA}, timeout=20)
    soup = BeautifulSoup(r.text, "lxml")
    def meta(name=None, prop=None):
        if name:
            tag = soup.find("meta", attrs={"name": name})
        else:
            tag = soup.find("meta", attrs={"property": prop})
        return tag["content"].strip() if tag and tag.get("content") else None
    canonical = soup.find("link", rel="canonical")
    jsonld = []
    for tag in soup.find_all("script", type="application/ld+json"):
        try:
            jsonld.append(json.loads(tag.string))
        except Exception:
            pass
    return {
        "status": r.status_code,
        "title": soup.title.string.strip() if soup.title and soup.title.string else None,
        "meta_description": meta(name="description"),
        "canonical": canonical["href"].strip() if canonical and canonical.get("href") else None,
        "og_title": meta(prop="og:title"),
        "og_description": meta(prop="og:description"),
        "og_image": meta(prop="og:image"),
        "og_type": meta(prop="og:type"),
        "twitter_card": meta(name="twitter:card"),
        "jsonld": jsonld,
    }

def main():
    items = json.load(open(sys.argv[1]))
    out_path = sys.argv[2]
    results = []
    for i, item in enumerate(items):
        url = item["link"]
        try:
            data = scrape(url)
        except Exception as e:
            data = {"status": "error", "error": str(e)}
        data["slug"] = item["slug"]
        data["link"] = url
        results.append(data)
        print(f"{i+1}/{len(items)} {url} -> {data.get('status')}", file=sys.stderr)
        time.sleep(0.15)
    json.dump(results, open(out_path, "w"), indent=2)

if __name__ == "__main__":
    main()
