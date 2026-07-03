#!/usr/bin/env python3
"""
bib2json.py — Per4ML build-time content pipeline.

Three jobs in one pass:
  1. publications.bib → src/data/publications.json
  2. keywords.json (seed list) + bib text → src/data/keywords_computed.json
  3. bib stats → src/data/stats.json

Keyword word-cloud (job 2):
  • SEED keywords come from contents/keywords.json — edit that file to add a
    research area; each entry is { "text": ..., "aliases": [...] }. Aliases are
    extra phrases that count as a mention of the keyword in a paper.
  • DERIVED keywords are mined automatically from the papers themselves
    (explicit bib `keywords={}` fields + recurring title phrases / acronyms).
  • The WEIGHT (`value`) of every word is how many papers mention it.
    Seed keywords are floored at 1 so a research area always shows even with
    no matching paper yet.
Re-run this script (or `npm run dev` / `npm run build`) to refresh the cloud.
"""

import json
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
# Second copy served at the site root — the publication mindmap fetches it.
OUT_PUBS_PUBLIC = os.path.join(REPO_ROOT, "public", "publications.json")
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


# Generic words that should never become a derived keyword on their own.
_STOPWORDS = {
    "a", "an", "the", "and", "or", "of", "for", "in", "on", "to", "with",
    "using", "via", "based", "toward", "towards", "their", "its", "from",
    "into", "as", "at", "by", "is", "are", "be", "this", "that", "these",
    "those", "we", "our", "study", "studies", "paper", "approach", "method",
    "methods", "framework", "frameworks", "novel", "new", "modular",
    "distributed", "evaluating", "impact", "use", "uses", "case", "cases",
    "analysis", "system", "systems", "data", "model", "models", "learning",
    "performance", "between", "across", "over", "under", "results",
}


def _document_frequency(terms: list[str], corpora: list[str]) -> int:
    """How many papers mention ANY of `terms` (word-boundary, case-insensitive)."""
    patterns = [re.compile(r"\b" + re.escape(t.lower()) + r"\b") for t in terms if t]
    count = 0
    for corpus in corpora:
        if any(p.search(corpus) for p in patterns):
            count += 1
    return count


def _mine_derived(entries: list, corpora: list[str], seed_terms: set[str]) -> dict[str, int]:
    """
    Pull candidate keywords straight out of the papers:
      • explicit bib `keywords={}` fields, and
      • recurring 2–3 word title phrases / all-caps acronyms.
    Returns {display_text: document_frequency}. Anything already represented by
    a seed keyword/alias is skipped (the seed already carries it).
    """
    # lowercased key -> (display form, min papers required to keep it)
    candidates: dict[str, tuple[str, int]] = {}

    def add(display: str, min_df: int):
        key = display.lower().strip()
        if len(key) < 3:
            return
        # Skip if subsumed by (or subsuming) a seed term/alias.
        if any(key in s or s in key for s in seed_terms):
            return
        # Keep the lowest threshold seen for a candidate (author keyword wins).
        if key in candidates:
            display, min_df = candidates[key][0], min(candidates[key][1], min_df)
        candidates[key] = (display.strip(), min_df)

    for e in entries:
        # 1) Author-provided keyword fields — trustworthy, kept at df>=1.
        for kw in re.split(r"[;,]", e.get("keywords", "")):
            kw = clean_latex(kw).strip()
            if kw:
                # Title-case for display, but keep existing acronyms uppercase.
                kw = " ".join(w if w.isupper() else w.capitalize() for w in kw.split())
                add(kw, 1)

        # 2) Title-mined terms — must recur (df>=2) to skip one-off tool names.
        title = clean_latex(e.get("title", ""))
        for tok in re.findall(r"\b[A-Z][A-Z0-9]{1,6}s?\b", title):  # acronyms
            add(tok, 2)
        words = re.findall(r"[A-Za-z][A-Za-z0-9\-]+", title.lower())
        for n in (2, 3):  # recurring 2–3 word phrases, stopword edges trimmed
            for i in range(len(words) - n + 1):
                gram = words[i:i + n]
                if gram[0] in _STOPWORDS or gram[-1] in _STOPWORDS:
                    continue
                if any(len(w) < 3 for w in gram):
                    continue
                add(" ".join(gram).title(), 2)

    # Score every candidate by how many papers mention it; keep recurring ones.
    derived: dict[str, int] = {}
    for key, (display, min_df) in candidates.items():
        df = _document_frequency([key], corpora)
        if df >= min_df:
            derived[display] = df
    return derived


def job2_keywords(entries: list, keywords_path: str) -> list:
    with open(keywords_path, encoding="utf-8") as fh:
        seeds = json.load(fh)

    # One lowercased, LaTeX-cleaned text blob per paper (no author names).
    corpora = []
    for e in entries:
        corpora.append(clean_latex(" ".join([
            e.get("title", ""),
            e.get("booktitle", ""),
            e.get("journal", ""),
            e.get("maintitle", ""),
            e.get("series", ""),
            e.get("keywords", ""),
            e.get("note", ""),
            e.get("abstract", ""),
        ])).lower())

    results: dict[str, int] = {}   # display text -> value (paper count)
    seed_terms: set[str] = set()   # every seed text + alias, lowercased

    # --- Seed keywords: value = papers mentioning text/alias, floored at 1. ---
    for kw in seeds:
        terms = [kw["text"]] + kw.get("aliases", [])
        for t in terms:
            seed_terms.add(t.lower())
        df = _document_frequency(terms, corpora)
        results[kw["text"]] = max(df, 1)

    # --- Derived keywords mined from the papers. ---
    for display, df in _mine_derived(entries, corpora, seed_terms).items():
        if display not in results:
            results[display] = df

    out = [{"text": text, "value": value} for text, value in results.items()]
    out.sort(key=lambda x: (-x["value"], x["text"].lower()))
    return out


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
    for out_path in (OUT_PUBS, OUT_PUBS_PUBLIC):
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        with open(out_path, "w", encoding="utf-8") as fh:
            json.dump(pubs, fh, indent=2, ensure_ascii=False)
        print(f"  -> {out_path} ({len(pubs)} publications)")

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
