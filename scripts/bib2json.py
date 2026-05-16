#!/usr/bin/env python3
"""
bib2json.py — Per4ML build-time content pipeline.

Three jobs in one pass:
  1. publications.bib → src/data/publications.json
  2. keywords.json + bib text → src/data/keywords_computed.json
  3. bib stats → src/data/stats.json
"""

import json
import math
import os
import re
import sys
from datetime import date

import bibtexparser
from bibtexparser.bparser import BibTexParser
from bibtexparser.customization import convert_to_unicode

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BIB_FILE = os.path.join(REPO_ROOT, "contents", "pubs.bib")
KEYWORDS_FILE = os.path.join(REPO_ROOT, "contents", "keywords.json")
OUT_PUBS = os.path.join(REPO_ROOT, "src", "data", "publications.json")
OUT_KEYWORDS = os.path.join(REPO_ROOT, "src", "data", "keywords_computed.json")
OUT_STATS = os.path.join(REPO_ROOT, "src", "data", "stats.json")


def clean_latex(text: str) -> str:
    """Remove common LaTeX markup from a string."""
    if not text:
        return ""
    # Remove braces
    text = text.replace("{", "").replace("}", "")
    # Common accent commands
    accents = {
        r"\\'": "", r'\\"': "", r"\\`": "", r"\\^": "",
        r"\\~": "", r"\\=": "", r"\\.": "", r"\\u": "",
        r"\\v": "", r"\\H": "", r"\\t": "", r"\\c": "",
        r"\\d": "", r"\\b": "", r"\\r": "",
    }
    for cmd, repl in accents.items():
        text = text.replace(cmd, repl)
    # Remove remaining backslash commands like \dj \url{...}
    text = re.sub(r"\\url\{[^}]*\}", "", text)
    text = re.sub(r"\\[a-zA-Z]+\{([^}]*)\}", r"\1", text)
    text = re.sub(r"\\[a-zA-Z]+", "", text)
    return text.strip()


def split_authors(author_field: str) -> list[str]:
    """Split BibTeX author field on ' and ' into a list."""
    if not author_field:
        return []
    parts = re.split(r"\s+and\s+", author_field, flags=re.IGNORECASE)
    return [clean_latex(p.strip()) for p in parts]


def extract_award(note: str) -> str:
    """Return 'Best Paper' if note contains that phrase, else empty string."""
    if note and re.search(r"best\s+paper", note, re.IGNORECASE):
        return "Best Paper"
    return ""


def load_bib(path: str):
    parser = BibTexParser(common_strings=True)
    parser.customization = convert_to_unicode
    with open(path, encoding="utf-8") as fh:
        db = bibtexparser.load(fh, parser=parser)
    return db.entries


def job1_publications(entries: list) -> list:
    pubs = []
    for e in entries:
        venue = clean_latex(e.get("booktitle") or e.get("journal") or "")
        note_raw = e.get("note", "")
        award = extract_award(note_raw)
        keywords_raw = e.get("keywords", "")
        kws = [k.strip() for k in re.split(r"[;,]", keywords_raw) if k.strip()]

        pub = {
            "key": e.get("ID", ""),
            "title": clean_latex(e.get("title", "")),
            "authors": split_authors(e.get("author", "")),
            "venue": venue,
            "year": int(e["year"]) if e.get("year", "").isdigit() else 0,
            "doi": clean_latex(e.get("doi", "")),
            "pdf": clean_latex(e.get("pdf", "")),
            "url": clean_latex(e.get("url", "")),
            "award": award,
            "keywords": kws,
        }
        pubs.append(pub)

    pubs.sort(key=lambda x: x["year"], reverse=True)
    return pubs


def job2_keywords(entries: list, keywords_path: str) -> list:
    with open(keywords_path, encoding="utf-8") as fh:
        curated = json.load(fh)

    # Build one big corpus string per entry (title + abstract + keywords)
    corpora = []
    for e in entries:
        text = " ".join([
            e.get("title", ""),
            e.get("abstract", ""),
            e.get("keywords", ""),
        ]).lower()
        corpora.append(text)

    results = []
    for kw in curated:
        terms = [kw["text"]] + kw.get("aliases", [])
        match_count = sum(
            1 for corpus in corpora
            if any(term.lower() in corpus for term in terms)
        )
        final_weight = kw["base_weight"] + math.log2(1 + match_count)
        results.append({"text": kw["text"], "value": round(final_weight, 2)})

    results.sort(key=lambda x: x["value"], reverse=True)
    return results


def job3_stats(entries: list) -> dict:
    return {
        "publication_count": len(entries),
        "computed_at": date.today().isoformat(),
    }


def main():
    os.makedirs(os.path.join(REPO_ROOT, "src", "data"), exist_ok=True)

    if not os.path.exists(BIB_FILE):
        print(f"ERROR: BibTeX file not found: {BIB_FILE}", file=sys.stderr)
        sys.exit(1)

    print(f"Parsing {BIB_FILE} ...")
    entries = load_bib(BIB_FILE)
    print(f"  Found {len(entries)} entries.")

    pubs = job1_publications(entries)
    with open(OUT_PUBS, "w", encoding="utf-8") as fh:
        json.dump(pubs, fh, indent=2, ensure_ascii=False)
    print(f"  -> {OUT_PUBS} ({len(pubs)} publications)")

    if os.path.exists(KEYWORDS_FILE):
        kws = job2_keywords(entries, KEYWORDS_FILE)
        with open(OUT_KEYWORDS, "w", encoding="utf-8") as fh:
            json.dump(kws, fh, indent=2, ensure_ascii=False)
        print(f"  -> {OUT_KEYWORDS} ({len(kws)} keywords)")
    else:
        print(f"  WARNING: {KEYWORDS_FILE} not found — skipping keyword computation.")

    stats = job3_stats(entries)
    with open(OUT_STATS, "w", encoding="utf-8") as fh:
        json.dump(stats, fh, indent=2, ensure_ascii=False)
    print(f"  -> {OUT_STATS} (publication_count={stats['publication_count']})")

    print("Done.")


if __name__ == "__main__":
    main()
