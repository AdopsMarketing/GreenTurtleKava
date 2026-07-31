import os, requests

HEADERS = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"}

paths = [l.strip() for l in open("/tmp/missing_images.txt") if l.strip()]
base_public = "/Users/remanth/Desktop/astro/GTK/public"

for p in paths:
    url = "https://greenturtlekava.co/wp-content" + p[len("/images"):]
    dest = base_public + p
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    r = requests.get(url, headers=HEADERS, timeout=20)
    if r.status_code == 200:
        open(dest, "wb").write(r.content)
        print(f"OK {len(r.content)} bytes: {p}")
    else:
        print(f"FAILED ({r.status_code}): {p}")
