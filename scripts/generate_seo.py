#!/usr/bin/env python3
"""
generate_seo.py — make the Per4ML site readable & discoverable by AI engines
(Google, Gemini, ChatGPT, Perplexity, Claude, …).

From the existing content files it generates, on every build:
  • index.html JSON-LD + <meta name="keywords">  (schema.org structured data)
  • public/llms.txt     — a plain-markdown brief of the lab for LLMs (llmstxt.org)
  • public/robots.txt   — explicitly welcomes search + AI crawlers, points to sitemap
  • public/sitemap.xml  — so crawlers find the site

Run after scripts/bib2json.py (publications.json must exist). Wired into the
`prebuild`/`dev` npm scripts, so it stays in sync automatically.
"""

import json
import os
import re
from datetime import date
from xml.sax.saxutils import escape

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENTS = os.path.join(ROOT, "contents")
PUBLIC = os.path.join(ROOT, "public")
INDEX_HTML = os.path.join(ROOT, "index.html")
SRC_DATA = os.path.join(ROOT, "src", "data")

BASE_URL = "https://per4ml.github.io"

# The video featured on the home page (keep in sync with
# src/components/FeaturedVideo.tsx). Described as a schema.org VideoObject,
# listed in llms.txt, and added to the sitemap so search engines and AI
# assistants can find it.
FEATURED_VIDEO = {
    "id": "tFrO_1K9598",
    "name": "OptimasX: An Agentic End-to-End GPU Performance Optimization "
            "Workflow in the Code Editor",
    "description": (
        "A one-minute demo of OptimasX, an agentic, end-to-end GPU performance "
        "optimization workflow that runs inside the code editor. OptimasX turns "
        "GPU code optimization, which usually takes deep expertise and as many "
        "as 30 manual steps, into one request to an AI assistant: \"Can you make "
        "my code run faster?\" Research poster at SC'26, nominated for the Best "
        "Research Poster Award."),
    "uploadDate": "2026-09-30T20:17:11-07:00",
    "duration": "PT1M5S",
    "pub_key": "bhattarai2026optimasx",
    "keywords": ["GPU performance optimization", "CUDA", "agentic AI",
                 "LLM code optimization", "AI coding assistant",
                 "code editor", "HPC", "SC'26 research poster"],
}


def load(path, default):
    try:
        with open(path, encoding="utf-8") as fh:
            return json.load(fh)
    except FileNotFoundError:
        return default


def main():
    pi = load(os.path.join(CONTENTS, "pi.json"), {})
    keywords = [k["text"] for k in load(os.path.join(CONTENTS, "keywords.json"), [])]
    members = load(os.path.join(CONTENTS, "members.json"), [])
    alumni = load(os.path.join(CONTENTS, "alumni.json"), [])
    collaborators = load(os.path.join(CONTENTS, "collaborators.json"), [])
    projects = load(os.path.join(CONTENTS, "projects.json"), [])
    pubs = load(os.path.join(SRC_DATA, "publications.json"), [])

    active = [m for m in members if m.get("active")]
    today = date.today().isoformat()

    # ── 1. JSON-LD structured data ───────────────────────────────────────────
    pi_links = [u for u in [pi.get("website"), pi.get("scholar"), pi.get("dblp")] if u]
    pi_node = {
        "@type": "Person",
        "@id": f"{BASE_URL}/#pi",
        "name": pi.get("name", ""),
        "jobTitle": pi.get("title", ""),
        "description": pi.get("bio", ""),
        "affiliation": {"@type": "CollegeOrUniversity", "name": pi.get("institution", "")},
        "knowsAbout": keywords,
        "sameAs": pi_links,
        "award": pi.get("awards", []),
    }
    org_node = {
        "@type": ["Organization", "ResearchOrganization"],
        "@id": f"{BASE_URL}/#org",
        "name": "Per4ML Research Group",
        "alternateName": "Per4ML Laboratory",
        "url": BASE_URL,
        "logo": f"{BASE_URL}/images/lab/per4ml-logo.png",
        "image": f"{BASE_URL}/images/lab/og-image.png",
        "description": (pi.get("bio", "") or
                        "Data-efficient AI and ML methods for high-performance computing."),
        "parentOrganization": {"@type": "CollegeOrUniversity",
                               "name": pi.get("institution", "Texas State University")},
        "founder": {"@id": f"{BASE_URL}/#pi"},
        "member": [{"@type": "Person", "name": m["name"]} for m in active],
        "knowsAbout": keywords,
        "funder": [{"@type": "Organization", "name": a} for a in pi.get("funding_agencies", [])],
    }
    pub_nodes = []
    for p in pubs:
        authors = p.get("authors", [])
        pub_nodes.append({
            "@type": "ScholarlyArticle",
            "headline": p.get("title", ""),
            "name": p.get("title", ""),
            "author": [{"@type": "Person", "name": a} for a in authors],
            "datePublished": str(p.get("year", "")),
            "publisher": p.get("venue", ""),
            "url": p.get("url", "") or BASE_URL,
            "isPartOf": {"@id": f"{BASE_URL}/#org"},
        })
    website_node = {
        "@type": "WebSite",
        "@id": f"{BASE_URL}/#website",
        "url": BASE_URL,
        "name": "Per4ML for HPC",
        "publisher": {"@id": f"{BASE_URL}/#org"},
        "about": {"@id": f"{BASE_URL}/#org"},
        "keywords": ", ".join(keywords),
    }
    v = FEATURED_VIDEO
    watch_url = f"https://www.youtube.com/watch?v={v['id']}"
    video_pub = next((p for p in pubs if p.get("key") == v["pub_key"]), {})
    video_node = {
        "@type": "VideoObject",
        "@id": f"{BASE_URL}/#featured-video",
        "name": v["name"],
        "description": v["description"],
        "thumbnailUrl": [f"https://i.ytimg.com/vi/{v['id']}/maxresdefault.jpg",
                         f"https://i.ytimg.com/vi/{v['id']}/hqdefault.jpg"],
        "uploadDate": v["uploadDate"],
        "duration": v["duration"],
        "embedUrl": f"https://www.youtube.com/embed/{v['id']}",
        "url": watch_url,
        "inLanguage": "en",
        "keywords": ", ".join(v["keywords"]),
        "author": [{"@type": "Person", "name": a} for a in video_pub.get("authors", [])],
        "publisher": {"@id": f"{BASE_URL}/#org"},
        "isPartOf": {"@id": f"{BASE_URL}/#org"},
    }
    graph = {"@context": "https://schema.org",
             "@graph": [org_node, pi_node, website_node, video_node] + pub_nodes}
    json_ld = ('<script type="application/ld+json">\n'
               + json.dumps(graph, indent=2, ensure_ascii=False)
               + "\n</script>")

    # ── 2. inject JSON-LD + keywords meta into index.html ────────────────────
    with open(INDEX_HTML, encoding="utf-8") as fh:
        html = fh.read()
    html = re.sub(
        r"<!-- STRUCTURED-DATA:START -->.*?<!-- STRUCTURED-DATA:END -->",
        f"<!-- STRUCTURED-DATA:START -->\n    {json_ld}\n    <!-- STRUCTURED-DATA:END -->",
        html, flags=re.DOTALL)
    kw_meta = f'<meta name="keywords" content="{", ".join(keywords)}" />'
    html = re.sub(
        r"<!-- META-KEYWORDS:START -->.*?<!-- META-KEYWORDS:END -->",
        f"<!-- META-KEYWORDS:START -->\n    {kw_meta}\n    <!-- META-KEYWORDS:END -->",
        html, flags=re.DOTALL)
    with open(INDEX_HTML, "w", encoding="utf-8") as fh:
        fh.write(html)

    # ── 3. llms.txt — a clean brief for AI engines ───────────────────────────
    L = []
    L.append("# Per4ML Research Group — Data-Efficient AI/ML for HPC")
    L.append("")
    L.append(f"> {pi.get('bio', '')}")
    L.append("")
    L.append(f"- Principal Investigator: {pi.get('name','')}, "
             f"{pi.get('title','')}, {pi.get('institution','')}")
    L.append(f"- Website: {BASE_URL}")
    if pi.get("website"):
        L.append(f"- PI website: {pi['website']}")
    if pi.get("scholar"):
        L.append(f"- Google Scholar: {pi['scholar']}")
    if pi.get("funding_total"):
        L.append(f"- Research funding secured: {pi['funding_total']} "
                 f"({', '.join(pi.get('funding_agencies', []))})")
    L.append("")
    L.append("## Featured: OptimasX demo video (SC'26 Best Research Poster nominee)")
    L.append(f"- Video: {watch_url}")
    L.append(f"- Title: {v['name']}")
    if video_pub.get("authors"):
        L.append(f"- Authors: {'; '.join(video_pub['authors'])}")
    L.append(f"- Summary: {v['description']}")
    L.append("- Who it is for: GPU, CUDA, and HPC developers, and anyone who "
             "uses an AI coding assistant in their editor and wants faster code.")
    L.append("")
    L.append("## Research Areas")
    L.append("The group works on, and welcomes collaborators and students in, "
             "the following topics:")
    L.append("")
    for k in keywords:
        L.append(f"- {k}")
    L.append("")
    L.append("## Current Team")
    for m in active:
        L.append(f"- {m['name']} ({m.get('level','')})")
    L.append("")
    L.append("## Selected Projects")
    for p in [pr for pr in projects if pr.get("active")]:
        tags = ", ".join(p.get("tags", []))
        L.append(f"- {p['title']}" + (f" — {tags}" if tags else ""))
    L.append("")
    L.append("## Publications")
    for p in pubs:
        authors = ", ".join(p.get("authors", []))
        url = p.get("url", "")
        line = f"- {p.get('title','')} ({p.get('year','')})"
        if p.get("venue"):
            line += f". {p['venue']}"
        if authors:
            line += f". Authors: {authors}"
        if url:
            line += f". {url}"
        L.append(line)
    L.append("")
    if alumni:
        L.append("## Alumni / Past Members")
        for a in alumni:
            note = "; ".join(p for p in (a.get("note", ""), a.get("inMemoriam") and f"in memoriam, {a['inMemoriam']}") if p)
            L.append(f"- {a['name']}" + (f" ({note})" if note else ""))
        L.append("")
    if collaborators:
        L.append("## Collaborators")
        for c in collaborators:
            L.append(f"- {c['name']}" + (f" ({c.get('affiliation','')})" if c.get("affiliation") else ""))
        L.append("")
    L.append("## For prospective students & collaborators")
    L.append("The lab welcomes PhD applicants, MS students, and undergraduate "
             "researchers interested in the research areas above. Reach out via "
             f"the PI's website: {pi.get('website', BASE_URL)}")
    L.append("")
    os.makedirs(PUBLIC, exist_ok=True)
    with open(os.path.join(PUBLIC, "llms.txt"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(L))

    # ── 4. robots.txt — welcome search + AI crawlers ─────────────────────────
    ai_bots = [
        "GPTBot", "ChatGPT-User", "OAI-SearchBot",          # OpenAI / ChatGPT
        "ClaudeBot", "Claude-Web", "anthropic-ai",          # Anthropic / Claude
        "PerplexityBot", "Perplexity-User",                 # Perplexity
        "Google-Extended", "GoogleOther",                   # Google Gemini / AI
        "Applebot-Extended", "Amazonbot", "CCBot", "Bytespider", "Meta-ExternalAgent",
    ]
    robots = ["# Per4ML — all search engines and AI assistants are welcome.",
              "User-agent: *", "Allow: /", ""]
    for b in ai_bots:
        robots += [f"User-agent: {b}", "Allow: /", ""]
    robots += [f"Sitemap: {BASE_URL}/sitemap.xml", ""]
    with open(os.path.join(PUBLIC, "robots.txt"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(robots))

    # ── 5. sitemap.xml ───────────────────────────────────────────────────────
    sitemap = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
        '        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n'
        f"  <url>\n    <loc>{BASE_URL}/</loc>\n    <lastmod>{today}</lastmod>\n"
        "    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n"
        "    <video:video>\n"
        f"      <video:thumbnail_loc>https://i.ytimg.com/vi/{v['id']}/hqdefault.jpg</video:thumbnail_loc>\n"
        f"      <video:title>{escape(v['name'])}</video:title>\n"
        f"      <video:description>{escape(v['description'])}</video:description>\n"
        f"      <video:player_loc>https://www.youtube.com/embed/{v['id']}</video:player_loc>\n"
        "      <video:duration>65</video:duration>\n"
        f"      <video:publication_date>{v['uploadDate']}</video:publication_date>\n"
        "    </video:video>\n  </url>\n"
        f"  <url>\n    <loc>{BASE_URL}/projects/</loc>\n    <lastmod>{today}</lastmod>\n"
        "    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n"
        f"  <url>\n    <loc>{BASE_URL}/llms.txt</loc>\n    <lastmod>{today}</lastmod>\n  </url>\n"
        "</urlset>\n"
    )
    with open(os.path.join(PUBLIC, "sitemap.xml"), "w", encoding="utf-8") as fh:
        fh.write(sitemap)

    print("generate_seo.py:")
    print(f"  -> index.html JSON-LD ({len(pub_nodes)} publications, {len(keywords)} keywords)")
    print(f"  -> public/llms.txt ({len(active)} members, {len(pubs)} pubs)")
    print("  -> public/robots.txt, public/sitemap.xml")


if __name__ == "__main__":
    main()
