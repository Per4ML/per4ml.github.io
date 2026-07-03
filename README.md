<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/d77e50db-c751-4246-8d66-1d16e8428668

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Preview a Production Build Locally

This builds the site exactly as it would be deployed and serves it locally, so you can catch any issues that only appear in the optimized build (e.g. missing assets, broken routes, minification bugs).

1. Install dependencies (if not already done):
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Build the production bundle (also runs the BibTeX → JSON pipeline):
   `npm run build`
4. Serve the build locally:
   `npm run preview`
5. Open the URL printed in the terminal (default: `http://localhost:4173`) in your browser.

To start fresh before rebuilding, run `npm run clean` first.

---

## Updating Site Content

Follow this whenever new information arrives — a **paper**, a **team member**, a
**research project**, **news**, **funders**, etc. Every section of the site is
driven by a JSON file under `contents/` (some are generated from a source you
edit). For each section you either **edit a JSON file directly** or **run a
script** — whichever is more convenient for that piece of information.

> **All scripts append / merge — they never wipe existing data.** Existing
> entries are preserved; only new ones are added (and, where noted, manual edits
> are kept). Re-running a script is safe and idempotent.

### Easiest option: the content-entry form

Instead of editing JSON or CSV files by hand, run the built-in form — one page
where you add a **team member, news item, project, funder, or paper**, and it
writes straight into the right `contents/` file (appending, never wiping).

**Opening the form on your laptop:**

1. Open the Terminal app.
2. Go to the project folder (adjust the path if yours differs):
   ```bash
   cd ~/Research/Stash/Per4ML
   ```
3. Install dependencies once (only needed the first time):
   ```bash
   npm install
   ```
4. Start the form:
   ```bash
   npm run admin
   ```
5. Open **http://localhost:8787** in your web browser.
6. Pick what you're adding, fill the fields, and click **Add to site**. You can
   keep adding more items. When finished, return to the Terminal and press
   **Ctrl-C** to stop the server.

Adding a **paper** also regenerates the publications list, word cloud, mindmap,
and stats automatically. To preview the result locally, run `npm run dev` and
open the URL it prints. (This form server runs on your laptop only and is never
deployed.) The manual steps below are still available if you prefer editing
files directly or importing from a CSV.

### Publishing your changes to GitHub

Your edits live only on your laptop until you push them. Once you've added the
content (via the form or by hand) and are happy with how it looks:

```bash
cd ~/Research/Stash/Per4ML
git add -A                         # stage every changed/new file
git commit -m "Update site content"   # describe what you added
git push                           # upload to GitHub
```

The first time on a new machine, Git/GitHub may ask you to sign in — follow the
browser prompt or use a personal access token. After `git push` succeeds, the
site rebuilds and deploys automatically (give it a couple of minutes).

> Tip: to see exactly what changed before committing, run `git status` (lists
> the files) or `git diff` (shows the line-by-line changes).

### One-time setup for the Python scripts

```bash
pip install -r requirements.txt   # bibtexparser + pandas
```

The BibTeX/keyword script (`scripts/bib2json.py`) can be run from anywhere. The
three CSV-driven updaters use relative paths, so **run them from inside
`scripts/`** (the commands below `cd scripts` first).

### What drives each section

| Website section | Source you update | How to apply |
| --- | --- | --- |
| **Publications** list, **Research-area word cloud** weights, **Publication mindmap**, stats | `contents/pubs.bib` (add a BibTeX entry) | `python3 scripts/bib2json.py` |
| **Research Areas** word-cloud seed keywords | `contents/keywords.json` (edit directly) | `python3 scripts/bib2json.py` |
| **Team** | `contents/members.json` (edit directly) **or** `contents/Team+Members.csv` | `cd scripts && python3 update_members.py` |
| **Alumni** (Meet the Team) | `contents/alumni.json` (edit directly, or via the form) | rebuild only |
| **Collaborators** (Meet the Team) | `contents/collaborators.json` (edit directly, or via the form) | rebuild only |
| **News** | `contents/news.json` (edit directly) **or** `contents/news.csv` | `cd scripts && python3 update_news.py` |
| **Research Projects** (carousel) | `contents/projects.json` (edit directly) **or** `contents/Rsearch+Projects2.csv` | `cd scripts && python3 update_projects.py` |
| **Our Funders** | `contents/funders.json` (edit directly) | rebuild only |
| **PI info / funding total / contact email** | `contents/pi.json` (edit directly) | rebuild only |

### Step-by-step

Do **only the steps relevant** to what changed, then finish with the rebuild
step at the bottom.

**1. New paper(s)**
1. Append the BibTeX entry to `contents/pubs.bib` (one entry; fields on single lines).
2. Regenerate the derived data:
   ```bash
   python3 scripts/bib2json.py
   ```
   This rebuilds `src/data/publications.json`, the mindmap's
   `public/publications.json`, the word-cloud weights
   (`src/data/keywords_computed.json`), and `src/data/stats.json`.
   *Source of truth is the `.bib` file — you append entries, the JSON is regenerated.*

**2. New research-area keyword** (a word-cloud term / chip)
1. Add an entry to `contents/keywords.json`, e.g.
   ```json
   { "text": "Reinforcement Learning", "aliases": ["RL", "policy gradient"] }
   ```
   `aliases` are extra phrases that count as a mention of this keyword in a paper.
2. Regenerate: `python3 scripts/bib2json.py`.
   The weight of each word = how many papers mention it (seeds always show, floored at 1).

**3. New team member**
- *Directly:* add an object to `contents/members.json`, **or**
- *From CSV:* add a row to `contents/Team+Members.csv`, then
  ```bash
  cd scripts && python3 update_members.py
  ```
  Existing members are preserved (matched by `id`); only new rows are appended.
  To **change** an existing member, edit `contents/members.json` directly, or
  use the form (Team member → pick someone → edit / remove).

> **AI & search discoverability is automatic.** On every build, `scripts/generate_seo.py`
> regenerates the site's structured data so Google, Gemini, ChatGPT, Perplexity,
> and Claude can read and recommend the group: schema.org JSON-LD + keywords
> injected into `index.html`, plus `public/llms.txt`, `public/robots.txt`, and
> `public/sitemap.xml`. It reads the same content files (PI, keywords, members,
> publications, projects), so it stays current with no manual step. The JSON-LD
> in `index.html` is machine-generated between markers — don't hand-edit it.

**3a. Alumni & collaborators** (the lists under "Meet the Team")
- Easiest via the form: choose **Alumni (past member)** or **Collaborator**, then
  add / pick-to-edit / remove. Or edit `contents/alumni.json` /
  `contents/collaborators.json` directly.
- **Automatic:** any team member you mark **inactive** (uncheck "Active" in the
  form, or set `"active": false`) is shown under **Alumni** automatically —
  no need to copy them over. `alumni.json` is only for past people who were
  never in the live team list.

**4. News item**
- *Directly:* add an object to `contents/news.json`, **or**
- *From CSV:* add a row to `contents/news.csv`, then
  ```bash
  cd scripts && python3 update_news.py            # appends new items
  # or, to also re-sort the CSV oldest→newest:
  python3 update_news.py --sort-csv
  ```
  Duplicates (same date + headline) are skipped automatically.

**5. New research project**
- *Directly:* add an object to `contents/projects.json`, **or**
- *From CSV:* add a row to `contents/Rsearch+Projects2.csv`, then
  ```bash
  cd scripts && python3 update_projects.py
  ```
  Existing projects are merged by `id` (your manual edits to `image`, `url`,
  `featured`, `active`, `tags` are kept), new rows are appended, and projects
  that exist only in the JSON (not in the CSV) are preserved.

**6. New funder**
- Add an entry to `contents/funders.json`:
  ```json
  { "name": "ARPA-E", "label": "Advanced Research Projects Agency–Energy" }
  ```

**7. PI details / funding total / contact email**
- Edit `contents/pi.json` directly.

**Final step — see your changes**
```bash
npm run dev        # live dev server (also re-runs scripts/bib2json.py automatically)
# or, to verify the production build:
npm run build && npm run preview
```
`npm run dev` and `npm run build` run `scripts/bib2json.py` for you via the
`prebuild`/`dev` hooks, so for **publications** and **keywords** you don't even
need to run the script manually if you go straight to `npm run dev`. The
CSV-driven updaters (team / news / projects) are **not** part of that hook — run
them yourself when you use a CSV.
