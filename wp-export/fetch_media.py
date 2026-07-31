import json, requests, sys, time

ids = json.load(open("raw/media-ids.json"))
media_map = {}
BASE = "https://greenturtlekava.co/wp-json/wp/v2/media"
HEADERS = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"}
chunk = 10
for i in range(0, len(ids), chunk):
    batch = ids[i:i+chunk]
    include = ",".join(str(x) for x in batch)
    r = requests.get(f"{BASE}?include={include}&per_page=100&_fields=id,source_url,alt_text,media_details", headers=HEADERS, timeout=30)
    r.raise_for_status()
    time.sleep(0.2)
    for m in r.json():
        media_map[str(m["id"])] = m["source_url"]
    print(f"fetched {i+len(batch)}/{len(ids)}", file=sys.stderr)

json.dump(media_map, open("raw/media-map.json", "w"), indent=2)
print(f"total resolved: {len(media_map)}")
