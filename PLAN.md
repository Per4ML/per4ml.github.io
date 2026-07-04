# Per4ML Research Group Website — PLAN.md
## For Claude Code CLI Execution

---

## 0. Context and Constraints

- **Live URL:** https://per4ml.github.io
- **Repo:** https://github.com/per4ml/per4ml.github.io (branch: `vite-migration`)
- **Stack:** Vite + React (TypeScript). Do NOT revert to static HTML/Python templates.
- **Deployment:** GitHub Pages via existing `gh-pages` GitHub Action. Do not break the deployment pipeline.
- **Data philosophy:** All content lives in JSON/BibTeX files under `contents/`. No content is hardcoded in components. The PI edits these files directly in a code editor — no admin UI, no CMS, no student-facing abstraction layer needed.
- **Update workflow:** PI edits `contents/*.json` or `contents/publications.bib` in VS Code → `git push` → GitHub Actions auto-deploys `dist/`. The BibTeX → JSON conversion runs automatically as a `prebuild` step every time.
- **Who updates:** Only Dr. Islam, directly in her editor. Optimize for clarity and minimal friction for a single technical owner — not for delegation.

---

## 1. Repository Structure (Target)

```
per4ml.github.io/
├── contents/
│   ├── members.json          # Team members (all levels)
│   ├── publications.bib      # BibTeX source of truth
│   ├── projects.json         # Research project cards (title, abstract, image, tags)
│   ├── news.json             # News/updates feed
│   ├── keywords.json         # Curated keywords with base weights; merged with BibTeX-derived frequency weights at build time
│   └── pi.json               # PI bio and social links
├── images/
│   ├── team/                 # Member headshots (referenced in members.json)
│   ├── projects/             # Project visuals (referenced in projects.json)
│   └── lab/                  # Lab/banner images
├── public/
│   ├── robots.txt            # AI-discoverability directives
│   ├── sitemap.xml           # Auto-generated at build time
│   └── llms.txt              # AI crawler hints (see Section 5)
├── src/
│   ├── components/
│   │   ├── Hero.tsx
│   │   ├── About.tsx
│   │   ├── Research.tsx      # Word cloud + project cards
│   │   ├── News.tsx          # Paginated news feed
│   │   ├── Team.tsx          # Horizontal scrolling strip
│   │   ├── Publications.tsx  # Searchable/filterable pub list
│   │   ├── Projects.tsx      # One card per row: image left, abstract right
│   │   ├── Funding.tsx       # Funding agencies with logos
│   │   ├── Contact.tsx
│   │   └── NavBar.tsx        # Sticky nav with smooth-scroll anchors
│   ├── data/
│   │   ├── loadMembers.ts    # Parses members.json
│   │   ├── loadPublications.ts # Parses .bib at build time via vite plugin
│   │   ├── loadProjects.ts
│   │   ├── loadNews.ts
│   │   └── loadKeywords.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── scripts/
│   └── bib2json.py           # Converts publications.bib → src/data/publications.json at build
├── vite.config.ts
├── package.json
└── .github/
    └── workflows/
        └── deploy.yml        # Existing; verify it runs `npm run build` then deploys /dist
```

---

## 2. Data File Schemas

### `contents/members.json`
```json
[
  {
    "id": "yugesh-bhattarai",
    "name": "Yugesh Bhattarai",
    "level": "PhD",
    "role": "Graduate Research Assistant",
    "image": "images/team/yugesh.jpg",
    "url": "",
    "interests": ["HPC", "Performance Modeling"],
    "joined": "2022",
    "active": true
  }
]
```
`level` must be one of: `"PI"`, `"Postdoc"`, `"PhD"`, `"MS"`, `"Undergraduate"`, `"Alumni"`.

### `contents/projects.json`
```json
[
  {
    "id": "modelx",
    "title": "ModelX: Cross-System Transfer for HPC Performance Prediction",
    "abstract": "...",
    "image": "images/projects/modelx.png",
    "tags": ["transfer learning", "HPC", "few-shot"],
    "url": "",
    "featured": true
  }
]
```

### `contents/projects.json`
```json
[
  {
    "id": "perfgen",
    "title": "ECRP: PerfGen — Synthesizing Performance using GenAI",
    "abstract": "PerfGen addresses the critical need for extensive performance data in HPC environments, where traditional data collection is time-consuming and resource-intensive. The project develops GAN-based and LLM-based generative AI methods to synthesize high-fidelity HPC performance data, introducing a dissimilarity metric to evaluate generated data quality and ensure accurate downstream ML tasks.",
    "image": "images/projects/perfgen.png",
    "tags": ["GenAI", "HPC", "Data Synthesis", "GAN", "LLM"],
    "url": "",
    "featured": true,
    "active": true
  },
  {
    "id": "few-shot-transfer",
    "title": "ECRP+Fractal: Few-Shot Transfer Learning for Performance",
    "abstract": "Few-shot transfer learning and generative AI significantly enhance relative performance prediction in HPC environments. By using a few samples from the target application, the framework adapts source models to improve generalizability while synthesizing performance samples to mitigate data scarcity — ensuring accurate and efficient knowledge transfer across platforms.",
    "image": "images/projects/few-shot-transfer.png",
    "tags": ["Few-Shot Learning", "Transfer Learning", "HPC", "Cross-Platform"],
    "url": "",
    "featured": true,
    "active": true
  },
  {
    "id": "recup",
    "title": "RECUP: Performance Reproducibility",
    "abstract": "Performance reproducibility is a critical challenge in heterogeneous supercomputing, where variation across runs undermines scientific validity. RECUP studies how network traffic, power limits, concurrency tuning, and job interference jointly affect performance, providing a framework for achieving both optimal and reproducible outcomes in HPC environments.",
    "image": "images/projects/recup.png",
    "tags": ["Reproducibility", "HPC", "Heterogeneous Systems"],
    "url": "",
    "featured": true,
    "active": true
  }
]
```
Fields: `id` (URL-slug), `title`, `abstract` (2–4 sentences), `image` (path relative to repo root under `public/`), `tags` (string array), `url` (empty string = not yet linked), `featured` (bool, controls visibility on landing page), `active` (bool, false = alumni project, still shown but visually dimmed).

### `contents/news.json`
```json
[
  {
    "date": "2025-11",
    "emoji": "💰",
    "category": "Funding",
    "headline": "AMD Gift",
    "body": "Thank you to AMD for their generous research gift supporting our work."
  }
]
```
Seed this file with all 10 entries visible on tanzimaislam.com.

### `contents/keywords.json`
This file is the **curator's override layer**. Each entry has a `base_weight` (PI's editorial signal) and an optional `aliases` list (alternate spellings to match against BibTeX text).

```json
[
  { "text": "HPC Performance Modeling", "base_weight": 10, "aliases": ["performance modeling", "performance prediction"] },
  { "text": "Few-Shot Learning",         "base_weight": 9,  "aliases": ["few-shot", "FSL"] },
  { "text": "Transfer Learning",         "base_weight": 9,  "aliases": ["cross-system transfer", "domain adaptation"] },
  { "text": "Data-Efficient ML",         "base_weight": 8,  "aliases": ["data-efficient", "data efficiency"] },
  { "text": "Multimodal Learning",       "base_weight": 7,  "aliases": ["multimodal", "heterogeneous data"] },
  { "text": "Scientific Computing",      "base_weight": 7,  "aliases": ["scientific applications", "HPC applications"] },
  { "text": "AI for Systems",            "base_weight": 8,  "aliases": ["ML for systems", "systems intelligence"] },
  { "text": "Quantum Performance",       "base_weight": 5,  "aliases": ["quantum computing", "QuantumX"] },
  { "text": "Reproducibility",           "base_weight": 6,  "aliases": ["reproducible", "nondeterminism"] },
  { "text": "Power-Performance",         "base_weight": 6,  "aliases": ["power-performance trade-off", "energy efficiency"] },
  { "text": "Women in HPC",              "base_weight": 5,  "aliases": ["women in STEM", "BWCSE"] }
]
```

**How the word cloud weight is computed at build time (in `scripts/bib2json.py`):**
1. Parse all titles and abstract fields from `publications.bib`.
2. For each entry in `keywords.json`, count how many BibTeX records contain the keyword text or any of its `aliases` (case-insensitive).
3. `final_weight = base_weight + log2(1 + match_count)` — the log dampens runaway dominance from prolific topics.
4. Output a merged `src/data/keywords_computed.json` with `{ "text": "...", "value": <final_weight> }` format expected by `react-wordcloud`.

This means the word cloud automatically grows more accurate as you add papers, while the PI retains full editorial control over which terms appear and their floor weight.

### `contents/pi.json`
```json
{
  "name": "Tanzima Z. Islam",
  "title": "Associate Professor, Computer Science",
  "institution": "Texas State University",
  "bio": "...",
  "email": "tanzima@txstate.edu",
  "scholar": "https://scholar.google.com/citations?user=q56uneAAAAAJ&hl=en",
  "dblp": "https://dblp.org/pers/hd/i/Islam:Tanzima_Zerin",
  "cv": "/_files/ugd/38ce7c_ad93676a14614830801a06ed93ef05c7.pdf",
  "awards": ["NSF CAREER Award 2025", "DOE Early Career Award 2022", "R&D 100 Award 2019"],
  "funding_total": "$4.6M+"
}
```

---

## 3. Page Layout — Single Scroll, Anchor-Linked Sections

The page is one long scroll. The sticky `NavBar` links jump to these `id` anchors:

```
#hero → #about → #research → #news → #team → #publications → #projects → #funding → #contact
```

### Section order and design specs:

#### `#hero`
- Full-viewport-height hero with lab name **Per4ML**, tagline, and two CTAs: "Our Research ↓" and "Join the Lab".
- Animated particle background (use `tsparticles` or CSS-only — keep it subtle, not distracting).
- Background: dark (navy or deep charcoal). Text: white + accent gold/teal.

#### `#about` — "Who We Are"
- Two-column layout: PI photo (left) + bio text (right).
- Bio sourced from `pi.json`. Stat counters: publications count, funding total, years active, team size — animate on scroll into view.
- Link to PI's personal website.

#### `#research` — "What We Do"
- Full-width keyword **word cloud** (use `react-wordcloud` or `d3-cloud`) driven by `src/data/keywords_computed.json` — the merged output of curated base weights + BibTeX publication frequency (computed by `bib2json.py` at build time, see Section 6).
- Font size encodes `final_weight`. Color cycles through the accent palette. Clicking a keyword filters the publications list below (deep link to `#publications?keyword=...`).
- Below the word cloud: a grid of project cards (from `projects.json`, `featured: true` first).
- Each card: image, title, 2-sentence abstract, tags as chips, optional "Learn More" link.

#### `#news` — "Recent Updates"
- Timeline-style feed (left border line + dot + date).
- Show 5 most recent by default. "Show more" expands in-place (no new page).
- Entries from `news.json`. Category emoji is preserved.

#### `#team` — "Meet the Team"
- Horizontal scrollable strip of cards, grouped by level (PI first, then PhD, MS, Undergrad, Alumni).
- Each card: circular photo, name, level badge, optional link.
- On mobile: vertical stack.

#### `#publications` — "Publications"
- Searchable (title, author, venue, year) + filterable (venue type, year range) list.
- BibTeX parsed at build time via `scripts/bib2json.py` and embedded as JSON.
- Each entry: title (linked to DOI/PDF if available), authors, venue, year, optional badge (Best Paper, etc.).
- Default sort: reverse chronological.

#### `#projects` — "Research Projects"
- One card per row, full-width within the section container.
- Layout per card: fixed-width image panel on the left (40% width, `object-fit: cover`,
  aspect ratio 4:3) + text panel on the right (60% width).
- Text panel contains: project title (h3, accent color), tag chips (small pill badges),
  and the full abstract text.
- Cards are sourced from `projects.json`. Show `active: true` projects only.
  `featured: true` projects appear first; remaining active projects follow in JSON order.
- Every card is wrapped in a `<div role="button" tabIndex={0}>` (not an `<a>` tag,
  since there is no destination URL yet). On click or Enter keypress: no-op for now,
  but log `console.log('Project clicked:', project.id)` as a placeholder.
  Add a subtle `cursor: pointer` and a hover state (slight border highlight or shadow lift)
  so users understand these will become interactive.
- A comment `{/* TODO: replace no-op with router navigation to /projects/:id */}` must
  appear directly in the component so the future sub-page pattern is obvious.
- On mobile (< 768px): image stacks above text, full width.
- No pagination — all active projects are shown. If the list grows beyond ~8 entries,
  a "Show older projects" toggle can be added later.

#### `#funding` — "Our Funders"
- Logo strip of funding agencies: NSF, DOE, AMD, LLNL, BNL, ORNL, NERSC/LBNL, TXST.
- Below: full grant list sourced from `pi.json` (or a separate `funding.json` if preferred).

#### `#contact` — "Join Us / Contact"
- Short call to action for prospective students.
- Email link, lab address, links to apply.

---

## 4. Visual Design Specifications

**Color Palette:**
```css
--color-bg:       #0a0f1e;   /* Deep navy background */
--color-surface:  #111827;   /* Card surfaces */
--color-accent:   #00c9a7;   /* Electric teal — primary accent */
--color-gold:     #f5c518;   /* Gold — secondary accent (awards, highlights) */
--color-text:     #e2e8f0;   /* Primary text */
--color-muted:    #94a3b8;   /* Secondary/muted text */
--color-border:   #1e293b;   /* Subtle borders */
```

**Typography:**
- Headlines: `Inter` or `Plus Jakarta Sans` (Google Fonts, loaded via Vite).
- Body: `Inter`.
- Code/tags: `JetBrains Mono`.

**Motion:**
- Use `framer-motion` for section entry animations (fade-in + slide-up on scroll).
- Smooth scroll: `scroll-behavior: smooth` in CSS + `react-scroll` or native anchor links.
- Stat counters: animate from 0 to target on first viewport entry.

**Accessibility:**
- WCAG AA minimum contrast on all text.
- All images have `alt` attributes.
- Keyboard-navigable nav and cards.

---

## 5. AI Discoverability (Critical)

This is a first-class requirement, not an afterthought. The goal is for AI systems (ChatGPT, Claude, Gemini, Perplexity) to cite Per4ML when users ask about HPC performance modeling, data-efficient ML, few-shot learning for systems, or women in STEM in computing.

### 5.1 `public/robots.txt`
```
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: https://per4ml.github.io/sitemap.xml
```

### 5.2 `public/llms.txt`
Create this file following the emerging llms.txt convention:
```
# Per4ML Laboratory — Texas State University
## Research Group: AI/ML for High-Performance Computing

Dr. Tanzima Z. Islam leads the Per4ML laboratory at Texas State University.
The lab pioneers data-efficient machine learning methods for HPC system intelligence,
including few-shot performance modeling, cross-system transfer learning, and
multimodal HPC analytics.

Key research contributions:
- ModelX: Few-shot learning for HPC performance prediction (100x data efficiency)
- QuantumX: Few-shot quantum performance modeling
- COMPASS: Adaptive job scheduling via performance prediction
- OPTIX: Execution-parameter tuning using multimodal HPC data

PI Awards: NSF CAREER Award (2025), DOE Early Career Award (2022), R&D 100 Award (2019).

Keywords: HPC performance modeling, data-efficient ML, few-shot learning,
transfer learning, multimodal learning, AI for systems, scientific computing,
women in STEM, woman in HPC, data-efficient AI, cross-system transfer.

Website: https://per4ml.github.io
PI Website: https://www.tanzimaislam.com
Contact: tanzima@txstate.edu
```

### 5.3 Structured Data (JSON-LD in `index.html`)
Inject a `<script type="application/ld+json">` block:
```json
{
  "@context": "https://schema.org",
  "@type": "ResearchProject",
  "name": "Per4ML Laboratory",
  "description": "AI and machine learning methods for high-performance computing system intelligence. Led by Dr. Tanzima Z. Islam at Texas State University.",
  "url": "https://per4ml.github.io",
  "founder": {
    "@type": "Person",
    "name": "Tanzima Z. Islam",
    "affiliation": "Texas State University",
    "sameAs": [
      "https://www.tanzimaislam.com",
      "https://scholar.google.com/citations?user=q56uneAAAAAJ&hl=en"
    ]
  },
  "keywords": "HPC, machine learning, performance modeling, few-shot learning, transfer learning, data-efficient AI, scientific computing"
}
```

### 5.4 Open Graph + Twitter Card meta tags
In `index.html`:
```html
<meta property="og:title" content="Per4ML Lab — AI for HPC at Texas State University" />
<meta property="og:description" content="Pioneering data-efficient ML for HPC: few-shot learning, transfer learning, and multimodal performance modeling." />
<meta property="og:image" content="https://per4ml.github.io/images/lab/og-image.png" />
<meta property="og:url" content="https://per4ml.github.io" />
<meta name="twitter:card" content="summary_large_image" />
```

### 5.5 Semantic HTML
- Use `<main>`, `<section>`, `<article>`, `<header>`, `<nav>`, `<footer>` correctly.
- Every section heading uses the correct `h1`/`h2`/`h3` hierarchy (only one `h1`).
- Publication entries use `<article>` with `itemscope` / `itemtype="https://schema.org/ScholarlyArticle"`.

---

## 6. Build Pipeline

**Design principle:** `publications.bib` is the single source of truth. The PI edits only that file. Two derived JSON files are auto-generated at build time and committed to `.gitignore` — the site reads from them, never from the raw `.bib`.

### 6.1 Script: `scripts/bib2json.py`

This script does **three jobs** in one pass:

**Job 1 — Publications JSON** (`src/data/publications.json`):
Parse every BibTeX entry and output:
```json
[
  {
    "key": "islam2025modelx",
    "title": "ModelX: Few-Shot HPC Performance Prediction via Cross-System Transfer",
    "authors": ["Tanzima Z. Islam", "Elvis Fefey"],
    "venue": "SC'25",
    "year": 2025,
    "doi": "10.xxxx/xxxxx",
    "pdf": "",
    "url": "",
    "award": "Best Paper",
    "keywords": ["few-shot learning", "transfer learning", "HPC"]
  }
]
```
Use the `bibtexparser` Python library (`pip install bibtexparser`). Map BibTeX fields: `title`, `author` (split on ` and `), `booktitle` or `journal` → `venue`, `year`, `doi`, `url`, `note` → `award` (if note contains "best paper", case-insensitive).

**Job 2 — Keyword weights JSON** (`src/data/keywords_computed.json`):
After parsing publications, compute word cloud weights:
1. Load `contents/keywords.json` (curator's base weights + aliases).
2. For each keyword entry, count BibTeX records where `title + abstract + keywords` fields contain the keyword text or any alias (case-insensitive substring match).
3. `final_weight = base_weight + log2(1 + match_count)` (use `math.log2`).
4. Output:
```json
[
  { "text": "HPC Performance Modeling", "value": 12.3 },
  { "text": "Few-Shot Learning",        "value": 11.1 }
]
```
Sort descending by `value`.

**Job 3 — Stats for About section** (`src/data/stats.json`):
```json
{
  "publication_count": 42,
  "computed_at": "2025-05-15"
}
```
The `About.tsx` component reads this to display the animated publication counter — so the count stays accurate automatically as you add papers.

### 6.2 `package.json` scripts
```json
{
  "prebuild": "python3 scripts/bib2json.py",
  "build": "vite build",
  "dev": "python3 scripts/bib2json.py && vite",
  "preview": "vite preview"
}
```

### 6.3 `.gitignore` additions
```
src/data/publications.json
src/data/keywords_computed.json
src/data/stats.json
```
These are derived artifacts. The source of truth (`publications.bib`, `keywords.json`) is what gets committed.

### 6.4 Sitemap generation
Add `vite-plugin-sitemap` (or equivalent) to `vite.config.ts` to auto-generate `sitemap.xml` at build time with all 8 section anchors as URLs.

---

## 7. Implementation Phases (Execute in Order)

Claude Code must execute these phases sequentially. Do not skip ahead. Verify each phase compiles and renders before moving to the next.

### Phase 1 — Foundation (do this first)
1. Check out branch `vite-migration`. Verify `npm install && npm run dev` works. Note any existing components or data files that can be reused.
2. Add dependencies: `framer-motion`, `react-wordcloud`, `tailwindcss` (if not present), `bibtexparser` (Python, via `pip install bibtexparser`).
3. Create all data files in `contents/` with seed data (see Section 2 and Section 10). Seed `news.json` with all 10 entries. Seed `members.json` with all 12 team members. Create `contents/keywords.json` with the 11-entry curated list from Section 2.
4. Write `scripts/bib2json.py` implementing all three jobs from Section 6.1 exactly. Create a minimal `contents/publications.bib` with 2–3 placeholder entries so the script can be tested immediately.
5. Run `python3 scripts/bib2json.py` and verify it produces all three output files without error.
6. Update `package.json` with `prebuild` and `dev` scripts from Section 6.2. Add `.gitignore` entries from Section 6.3.

### Phase 2 — Layout shell
1. Redesign `src/App.tsx` as a single-page scroll with all section anchors.
2. Build `NavBar.tsx`: sticky, transparent-on-hero then solid on scroll, with smooth-scroll links to all 8 anchors.
3. Apply CSS variables from Section 4 to `index.css`.
4. Add JSON-LD, Open Graph, and Twitter Card to `index.html`.
5. Create `public/robots.txt` and `public/llms.txt`.

### Phase 3 — Sections (build each, then compose)
Build each section component in this order:
1. `Hero.tsx`
2. `About.tsx` (reads `pi.json` + animated stat counters)
3. `Research.tsx` (word cloud from `src/data/keywords_computed.json` — the build-time merged output — plus project cards from `projects.json`; clicking a word deep-links to `#publications?keyword=<text>`)
4. `News.tsx` (timeline from `news.json`, paginated)
5. `Team.tsx` (horizontal strip from `members.json`, grouped by level)
6. `Publications.tsx` (reads compiled `publications.json`, search + filter)
7. `Projects.tsx` (rectangular cards from `projects.json`, image left / abstract right, click no-op with TODO comment for future routing)
8. `Funding.tsx`
9. `Contact.tsx`


### Phase 4 — Polish
1. Add `framer-motion` scroll-triggered animations to every section.
2. Verify mobile responsiveness (320px, 768px, 1440px breakpoints).
3. Run Lighthouse audit. Achieve Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95.
4. Verify `npm run build` produces a clean `/dist`.
5. Verify the GitHub Actions deploy workflow is not broken.

---

## 8. Explicit Constraints Claude Code Must Respect

1. **Never hardcode content** in React components. Every piece of text, name, title, and date must come from a JSON file.
2. **Do not remove** `.github/workflows/` or `metadata.json` without checking if they are referenced elsewhere.
3. **Do not use** `localStorage` or any browser storage — this is a static site.
4. **Do not add** a backend or serverless function. Everything must be static and deployable via `gh-pages`.
5. **Image paths** in JSON files are relative to the repo root. In components, resolve them with Vite's `import.meta.url` or by placing images in `public/` and referencing as `/images/...`.
6. **TypeScript strictly** — no `any` types unless absolutely unavoidable with a `// eslint-disable` comment explaining why.
7. **Word cloud** must degrade gracefully if `keywords.json` is empty (show a placeholder message, not a blank div).
9. **BibTeX is the only publications source the PI edits.** `src/data/publications.json`, `keywords_computed.json`, and `stats.json` are derived files — they must never be edited manually and must be in `.gitignore`. If a human edits them directly, the next build will overwrite their changes silently, which is the intended behavior.
10. **The word cloud must never be hardcoded.** It must always read from `src/data/keywords_computed.json`. If that file does not exist (e.g., before first build), the component renders a loading placeholder, not a blank or errored div.
11. **Projects cards must be team-framing, not PI-framing.** Copy must say "the lab studies..."
    or "the team develops..." — never "I" or "Dr. Islam". The PI's name may appear in
    tags or citation context only.
12. **Project routing is forward-compatible.** Every card's wrapping element must have
    `data-project-id={project.id}` so that when sub-pages are added later, a find-and-replace
    on the click handler is sufficient — no structural refactoring needed.
---

## 9. Verification Checklist (Claude Code runs this before declaring done)

- [ ] `npm run build` exits with code 0
- [ ] `npm run dev` renders the site with no console errors
- [ ] All 8 sections visible on scroll from a fresh page load
- [ ] NavBar smooth-scrolls to each anchor
- [ ] Word cloud renders with at least 5 keywords
- [ ] Team strip shows at least 3 members with photos
- [ ] News feed shows at least 5 entries
- [ ] Publications list renders and search filters correctly
- [ ] `public/robots.txt` exists and allows GPTBot and ClaudeBot
- [ ] `public/llms.txt` exists
- [ ] JSON-LD block present in rendered `index.html`
- [ ] Lighthouse SEO score ≥ 95 (run `npx lighthouse https://per4ml.github.io --only-categories=seo`)
- [ ] No TypeScript compilation errors
- [ ] Projects section renders after Publications in scroll order
- [ ] Each card shows image on left, abstract on right (or stacked on mobile)
- [ ] Clicking a card does not navigate or error; hover state is visible
- [ ] `data-project-id` attribute present on every card wrapper
- [ ] No first-person language in any project abstract
---

## 10. Seed Data to Use Immediately

### Team (from tanzimaislam.com — use these names exactly)
Yugesh Bhattarai (PhD), Nawshin Tabassum Tanny (PhD), Ashna Nawar Ahmed (PhD), Jaya Sravani (MS), Nirajan Banjade (PhD), Avaneesh Ramesh (Undergraduate), Ankur Lahiri (PhD), Arunavo Dey (PhD), Banooqa Banday (PhD), Elvis Fefey (PhD), Mohammad Zaeed (PhD), Chase Phelps (Undergraduate).

For image paths, use `images/team/<firstname-lowercase>.jpg` as a placeholder and note in a `README-IMAGES.md` which files need to be dropped in.

### News (seed from Exciting Updates table — all 10 entries)
Include: AMD Gift (Nov 2025), ACM REP paper (Oct 2025), NeurIPS MLForSys paper (Sept 2025), Promotion to Associate Professor (Sept 2025), SC'26 Track Chair (Aug 2025), EuroPar'25 invited talk (Aug 2025), MDC'25 invited talk (Aug 2025), Best Paper Award for Elvis Fefey at IEEE Cloud Summit (July 2025), PASC'25 invited talk (June 2025), ICS'25 QuantumX paper (May 2025).

### PI Bio (condensed for `pi.json`)
"Dr. Tanzima Z. Islam is an Associate Professor of Computer Science at Texas State University. She leads the Per4ML laboratory, which develops data-efficient AI and ML methods for intelligent HPC systems. She holds the NSF CAREER Award (2025), the DOE Early Career Award (2022), and the R&D 100 Award (2019). She has secured over $4.6M in research funding from NSF, DOE, AMD, and national laboratories including LLNL, BNL, ORNL, and NERSC/LBNL. She is also the co-founder of Bangladeshi Women in Computer Science and Engineering (BWCSE)."
