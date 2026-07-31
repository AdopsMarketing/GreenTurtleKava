import json, os, sys, time
import requests
from urllib.parse import urlparse

urls = json.load(open("raw/image-urls.json"))
HEADERS = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"}
OUT = "images"
ok, failed = 0, []
for i, url in enumerate(urls):
    path = urlparse(url).path  # /wp-content/uploads/2024/09/xxx.jpg
    rel = path.split("/wp-content/", 1)[-1]  # uploads/2024/09/xxx.jpg
    dest = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    if os.path.exists(dest):
        ok += 1
        continue
    try:
        r = requests.get(url, headers=HEADERS, timeout=20)
        if r.status_code == 200:
            with open(dest, "wb") as f:
                f.write(r.content)
            ok += 1
        else:
            failed.append((url, r.status_code))
    except Exception as e:
        failed.append((url, str(e)))
    if i % 20 == 0:
        print(f"{i+1}/{len(urls)}", file=sys.stderr)
    time.sleep(0.1)

print(f"ok={ok} failed={len(failed)}")
json.dump(failed, open("raw/image-failures.json", "w"), indent=2)
