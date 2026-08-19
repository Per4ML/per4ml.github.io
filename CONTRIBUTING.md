# Contributing to the Per4ML website

This page is for Per4ML members who want to:

- **A.** Add a photo to the *Life in the Lab* gallery
- **B.** Link their name on *Meet the Team* to their own website

Both are small edits to data files. **You do not need to install anything** — everything
below can be done from your browser on GitHub.

Repo: <https://github.com/Per4ML/per4ml.github.io> · Site: <https://per4ml.github.io>

---

## Before you start

You need **write access** to the repo. Ask Dr. Islam to add you as a collaborator,
then accept the emailed invitation.

> **How your change goes live:** when a change lands on the `main` branch, GitHub
> Actions rebuilds the site automatically and publishes it in about 1–2 minutes.
> There is nothing to build or upload yourself. You can watch progress in the
> repo's **Actions** tab.

---

## A. Add a photo to the gallery

### Step 1 — Resize the photo first

**Please do not upload a photo straight off your phone.** A raw phone photo is
3–8 MB, which permanently bloats the repo and slows the site down for visitors.

Resize it to **max 1600 pixels wide** and **under ~600 KB**:

- **Mac:** open the photo in Preview → *Tools* → *Adjust Size…* → set Width to `1600`
  → *File* → *Export…* → set Quality to about 65% → Save.
- **Mac (terminal, faster):**
  ```bash
  sips -Z 1600 -s format jpeg -s formatOptions 65 input.jpg --out output.jpg
  ```
- **Windows:** right-click the photo → *Open with* → *Photos* → *…* → *Resize image*
  → choose a custom size of 1600px wide → Save a copy.

Name the file something short and descriptive, all lowercase, with dashes instead of
spaces — for example `zaeed-mug26.jpg` or `lab-retreat-2026.jpg`.

### Step 2 — Upload it to the gallery folder

1. Go to <https://github.com/Per4ML/per4ml.github.io/tree/main/public/images/gallery>
2. Click **Add file** → **Upload files**, and drag your resized photo in.
3. At the bottom, choose **Create a new branch for this commit and start a pull request**,
   then click **Propose changes**.
4. Give the branch any name you like, e.g. `add-my-photo`.

Keep this pull request open — you will add your caption to it in the next step.

### Step 3 — Add your caption

1. In your new pull request's branch, open
   [`contents/gallery.json`](https://github.com/Per4ML/per4ml.github.io/blob/main/contents/gallery.json)
2. Click the **pencil** icon to edit.
3. Add your entry to the list. Newest photos go **first**:

   ```json
   [
     {
       "image": "images/gallery/lab-retreat-2026.jpg",
       "caption": "Per4ML@Lab Retreat'26"
     },
     {
       "image": "images/gallery/zaeed-mug26.jpg",
       "caption": "Zaeed@MUG'26"
     }
   ]
   ```

4. Commit to the **same branch** you created in Step 2, not to `main`.

**Rules for the `image` path** — this trips people up:

- No leading slash: `images/gallery/...`, **not** `/images/gallery/...`
- Do **not** include `public/` — the site serves that folder from the root
- The filename must match exactly, including the extension (`.jpg` vs `.jpeg` matters)

**Rules for the `caption`:**

- One short line, in the style `Name@Venue'YY` — e.g. `Zaeed@MUG'26`, `Per4ML@SC'26`,
  `Us@KDD'26`
- Use `Per4ML@…` or `Us@…` when several people are in the photo
- Keep it under ~60 characters. It wraps to a maximum of two lines, and anything
  longer than that is cut off with "…"

### Step 4 — Ask for review

On your pull request, click **Reviewers** and request Dr. Islam. Once it is merged,
your photo appears on the site within a couple of minutes.

> The gallery starts scrolling automatically once there are enough photos to fill the
> row; below that it just shows them centered. That is expected — you do not need to
> change anything for it.

---

## B. Link your name to your own website

Your card in *Meet the Team* becomes a clickable link as soon as your entry has a
`url`. Clicking it opens your site in a new tab.

1. Open [`contents/members.json`](https://github.com/Per4ML/per4ml.github.io/blob/main/contents/members.json)
2. Click the **pencil** icon to edit.
3. Find your own entry and fill in the `url` field:

   ```json
   {
     "id": "mohammad-zaeed",
     "name": "Mohammad Zaeed",
     "level": "PhD",
     "image": "images/members/zaeed.png",
     "url": "https://your-site.example.com",
     "interests": ["LLM for Systems", "Performance Optimization"],
     "joined": "2021",
     "active": true
   }
   ```

4. Leave every other field alone, including other people's entries.
5. Commit to a new branch and open a pull request, same as above.

The URL must start with `https://`. Any public page works — a personal site, GitHub
profile, Google Scholar, or LinkedIn.

### Adding or updating your photo on the team card

Team headshots live in `public/images/members/`. Upload yours there the same way as a
gallery photo (resize it first — 800px wide is plenty for a headshot), then point the
`image` field at it, e.g. `images/members/yourname.jpg`.

If no photo file exists, the card falls back to a generated circle with your initials,
so nothing breaks in the meantime.

---

## Rules that apply to every change

**Never edit these files by hand.** They are regenerated by a script on every build,
so your edits will be silently overwritten:

- `index.html`
- `public/llms.txt`
- `public/sitemap.xml`
- `public/robots.txt`
- `public/publications.json`
- anything inside `dist/`

**Check your JSON before committing.** A single missing comma or bracket breaks the
whole build, and the site will not update. GitHub's editor highlights JSON syntax
errors — if you see a red squiggle, fix it before committing. Common mistakes:

- A trailing comma after the **last** entry in a list
- Curly quotes `"like this"` instead of straight quotes `"like this"` — this happens
  when you paste from Word, Google Docs, or Slack
- A missing comma **between** two entries

**Do not commit other people's photos without asking them first.**

---

## Working locally instead (optional)

If you would rather work on your own machine:

```bash
git clone https://github.com/Per4ML/per4ml.github.io.git
cd per4ml.github.io
npm install
npm run dev          # opens a live preview on http://localhost:3000
```

Make your edits, check them in the browser, then:

```bash
git checkout -b add-my-photo
git add contents/gallery.json public/images/gallery/your-photo.jpg
git commit -m "Add gallery photo from ..."
git push -u origin add-my-photo
```

Then open a pull request on GitHub. Do **not** commit the `dist/` folder — the build
happens automatically in CI.

---

## Getting help

If something looks wrong on the site after your change is merged, check the **Actions**
tab first — a red ✗ means the build failed, and clicking it shows the error (almost
always a JSON typo). Ask Dr. Islam if you are stuck.
