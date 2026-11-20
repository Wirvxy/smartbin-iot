#!/usr/bin/env python3
"""
Builds the static online demo of the web dashboard (docs/demo/) from a running backend.

The backend must be running in the default "demo" profile (fresh H2 data):
    cd backend && mvn spring-boot:run
    python3 tools/demo/build_dashboard_demo.py http://localhost:8080

Each page is fetched exactly as the server renders it, logged in as the demo manager,
then links and assets are rewritten to relative files. tools/demo/demo.js replaces the
server for the live data and the few actions that make sense offline.
"""
import json
import pathlib
import re
import shutil
import sys
import time

import requests

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080").rstrip("/")
ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "docs" / "demo"
STATIC = ROOT / "backend" / "src" / "main" / "resources" / "static"
HERE = pathlib.Path(__file__).resolve().parent


def login(session):
    page = session.get(f"{BASE}/login").text
    token = re.search(r'name="_csrf" value="([^"]+)"', page).group(1)
    r = session.post(f"{BASE}/login", data={"username": "manager", "password": "manager123", "_csrf": token})
    if "/login" in r.url:
        sys.exit("Login failed: is the backend running with the demo profile?")


def rewrite(html, container_ids):
    # Security tokens of this build session are meaningless in a static page.
    html = re.sub(r'\s*<input type="hidden" name="_csrf" value="[^"]*"/?>', "", html)
    html = re.sub(r'data-csrf-token="[^"]*"', 'data-csrf-token="demo"', html)
    # Assets become relative files.
    html = html.replace('href="/css/', 'href="css/').replace('src="/js/', 'src="js/')
    # Server links to snapshot pages (forms and other links are handled by demo.js).
    pages = {"/dashboard": "dashboard.html", "/containers": "containers.html",
             "/alerts": "alerts.html", "/reports": "reports.html"}
    for path, file in pages.items():
        html = html.replace(f'href="{path}"', f'href="{file}"')
    for cid in container_ids:
        html = html.replace(f'href="/containers/{cid}"', f'href="container-{cid}.html"')
    # demo.js must run before the page's own scripts, so it goes first in <head>.
    html = html.replace(
        "<head>",
        '<head>\n    <script src="js/demo-data.js"></script>\n    <script src="js/demo.js"></script>'
        '\n    <link rel="stylesheet" href="css/demo.css">', 1)
    html = html.replace("<title>", '<meta name="robots" content="noindex">\n    <title>', 1)
    return html


def main():
    s = requests.Session()
    login_page = s.get(f"{BASE}/login").text
    login(s)
    containers = s.get(f"{BASE}/dashboard/data/containers").json()
    ids = [c["id"] for c in containers]
    alerts_html = s.get(f"{BASE}/alerts").text
    alerts = [{"id": int(a), "containerId": int(c)} for a, c in
              re.findall(r'data-alert-id="(\d+)">\s*<td>\s*<a class="rowlink" href="/containers/(\d+)"', alerts_html)]

    if OUT.exists():
        shutil.rmtree(OUT)
    (OUT / "js").mkdir(parents=True)
    shutil.copytree(STATIC / "css", OUT / "css")
    shutil.copy(STATIC / "js" / "map.js", OUT / "js" / "map.js")
    shutil.copy(HERE / "demo.js", OUT / "js" / "demo.js")
    shutil.copy(HERE / "demo.css", OUT / "css" / "demo.css")

    stamp = time.strftime("%Y-%m-%dT%H:%M:%S")
    data = {"generatedAt": stamp, "containers": containers, "alerts": alerts}
    (OUT / "js" / "demo-data.js").write_text(
        "// Snapshot of the demo backend's data, used by demo.js.\nwindow.SMARTBIN_DEMO = "
        + json.dumps(data, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")

    pages = {"index.html": login_page, "dashboard.html": s.get(f"{BASE}/dashboard").text,
             "containers.html": s.get(f"{BASE}/containers").text, "alerts.html": alerts_html,
             "reports.html": s.get(f"{BASE}/reports").text}
    for cid in ids:
        pages[f"container-{cid}.html"] = s.get(f"{BASE}/containers/{cid}").text
    for name, html in pages.items():
        (OUT / name).write_text(rewrite(html, ids), encoding="utf-8")
    print(f"Wrote {len(pages)} pages, {len(containers)} bins and {len(alerts)} alerts to {OUT}")


if __name__ == "__main__":
    main()
