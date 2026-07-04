/**
 * Per4ML content-entry form — local admin server (zero dependencies).
 *
 * One page where you type in a new team member, news item, research project,
 * funder, or publication, and it is written straight into the matching
 * contents/*.json file (or contents/pubs.bib for publications).
 *
 * Run:   npm run admin      then open the URL it prints (default :8787).
 *
 * Everything APPENDS / MERGES — existing entries are preserved, never wiped.
 */

import http from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';

const ROOT = path.dirname(import.meta.dirname);          // repo root
const CONTENTS = path.join(ROOT, 'contents');
const BIB_FILE = path.join(CONTENTS, 'pubs.bib');
const PORT = process.env.ADMIN_PORT || 8787;

// ─── helpers ─────────────────────────────────────────────────────────────────

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const splitList = (s) =>
  (s || '').split(',').map((x) => x.trim()).filter(Boolean);

async function readJson(file) {
  const p = path.join(CONTENTS, file);
  if (!existsSync(p)) return [];
  return JSON.parse(await readFile(p, 'utf8'));
}

async function writeJson(file, data) {
  const p = path.join(CONTENTS, file);
  await writeFile(p, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

// Overwrite target fields only with non-empty incoming values (preserve the rest).
const mergeNonEmpty = (existing, incoming) => {
  const out = { ...existing };
  for (const [k, v] of Object.entries(incoming)) {
    const empty = v === '' || v === undefined || v === null ||
      (Array.isArray(v) && v.length === 0);
    if (!empty) out[k] = v;
  }
  return out;
};

const LEVEL_ORDER = { PI: 0, Postdoc: 1, PhD: 2, MS: 3, Undergraduate: 4, Alumni: 5 };
const NEWS_EMOJI = {
  Publication: '📄', Funding: '💰', Award: '🏆',
  Service: '🎤', Talk: '🎤', Research: '🔬', News: '📰',
};

// ─── per-type handlers ───────────────────────────────────────────────────────
// Each returns a human-readable message describing what happened.

async function addMember(f) {
  if (!f.name) throw new Error('Name is required.');
  const list = await readJson('members.json');
  const editId = f._editId || '';             // set when editing an existing member
  const first = f.name.trim().split(/\s+/)[0].toLowerCase();
  const level = f.level || 'Undergraduate';
  const entry = {
    id: editId || slugify(f.name),
    name: f.name.trim(),
    level,
    image: f.image || `images/members/${first}.jpg`,
    url: f.url || '',
    interests: splitList(f.interests),
    joined: f.joined || '',
    active: f.active !== false,
  };

  let verb;
  const i = list.findIndex((m) => m.id === entry.id);
  if (editId) {
    if (i < 0) throw new Error('Member to edit was not found.');
    list[i] = entry;            // full replace (lets you clear fields too)
    verb = 'Updated';
  } else if (i >= 0) {
    list[i] = mergeNonEmpty(list[i], entry);
    verb = 'Updated';
  } else {
    list.push(entry);
    verb = 'Added';
  }
  list.sort((a, b) =>
    (LEVEL_ORDER[a.level] ?? 100) - (LEVEL_ORDER[b.level] ?? 100) ||
    a.name.localeCompare(b.name));
  await writeJson('members.json', list);
  return `${verb} team member “${entry.name}” (${list.length} total).`;
}

async function removeMember(f) {
  if (!f.id) throw new Error('No member selected to remove.');
  const list = await readJson('members.json');
  const target = list.find((m) => m.id === f.id);
  if (!target) throw new Error('Member not found.');
  const next = list.filter((m) => m.id !== f.id);
  await writeJson('members.json', next);
  return `Removed team member “${target.name}” (${next.length} remaining).`;
}

// Factory for simple name-keyed lists (alumni, collaborators): add/edit + remove.
function listManager(file, noun, build) {
  const add = async (f) => {
    if (!f.name) throw new Error('Name is required.');
    const list = await readJson(file);
    const editId = f._editId || '';
    const entry = { id: editId || slugify(f.name), name: f.name.trim(), ...build(f) };
    let verb;
    const i = list.findIndex((x) => x.id === entry.id);
    if (editId) {
      if (i < 0) throw new Error(`That ${noun} was not found.`);
      list[i] = entry; verb = 'Updated';
    } else if (i >= 0) {
      list[i] = entry; verb = 'Updated';
    } else {
      list.push(entry); verb = 'Added';
    }
    list.sort((a, b) => a.name.localeCompare(b.name));
    await writeJson(file, list);
    return `${verb} ${noun} “${entry.name}” (${list.length} total).`;
  };
  const remove = async (f) => {
    if (!f.id) throw new Error(`No ${noun} selected to remove.`);
    const list = await readJson(file);
    const target = list.find((x) => x.id === f.id);
    if (!target) throw new Error(`${noun} not found.`);
    const next = list.filter((x) => x.id !== f.id);
    await writeJson(file, next);
    return `Removed ${noun} “${target.name}” (${next.length} remaining).`;
  };
  return { add, remove };
}

const alumniMgr = listManager('alumni.json', 'alum', (f) => ({ note: (f.note || '').trim() }));
const collaboratorMgr = listManager('collaborators.json', 'collaborator', (f) => ({ affiliation: (f.affiliation || '').trim() }));

async function addNews(f) {
  if (!f.headline || !f.body) throw new Error('Headline and body are required.');
  const list = await readJson('news.json');
  const category = f.category || 'News';
  const entry = {
    date: f.date || '',
    emoji: NEWS_EMOJI[category] || '📰',
    category,
    headline: f.headline.trim(),
    body: f.body.trim(),
  };
  const key = (x) => `${x.date.trim().toLowerCase()}|${x.headline.trim().toLowerCase()}`;
  const exists = list.some((n) => key(n) === key(entry));
  if (exists) return `Skipped — a news item with that date + headline already exists.`;
  list.push(entry);
  list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  await writeJson('news.json', list);
  return `Added news item “${entry.headline}” (${list.length} total).`;
}

async function addProject(f) {
  if (!f.title || !f.abstract) throw new Error('Title and abstract are required.');
  const list = await readJson('projects.json');
  const id = slugify(f.title);
  const tags = splitList(f.tags);
  const entry = {
    id,
    title: f.title.trim(),
    abstract: f.abstract.trim(),
    image: f.image || `images/projects/${id.split('-').slice(0, 4).join('-')}.png`,
    tags: tags.length ? tags : ['Research'],
    url: f.url || '',
    featured: f.featured !== false,
    active: f.active !== false,
  };
  const i = list.findIndex((p) => p.id === id);
  const verb = i >= 0 ? 'Updated' : 'Added';
  if (i >= 0) list[i] = mergeNonEmpty(list[i], entry);
  else list.push(entry);
  list.sort((a, b) => a.title.localeCompare(b.title));
  await writeJson('projects.json', list);
  return `${verb} project “${entry.title}” (${list.length} total).`;
}

async function addFunder(f) {
  if (!f.name || !f.label) throw new Error('Acronym and full name are required.');
  const list = await readJson('funders.json');
  if (list.some((x) => x.name.toLowerCase() === f.name.trim().toLowerCase()))
    return `Skipped — funder “${f.name}” already exists.`;
  list.push({ name: f.name.trim(), label: f.label.trim() });
  await writeJson('funders.json', list);
  return `Added funder “${f.name}” (${list.length} total).`;
}

// Build a BibTeX entry from structured fields (or use a pasted one as-is).
function buildBibtex(f) {
  if (f.bibtex && f.bibtex.trim()) return f.bibtex.trim();
  if (!f.title || !f.authors || !f.year)
    throw new Error('Provide raw BibTeX, or at least title, authors, and year.');
  const type = f.entrytype || 'article';
  const key = f.key || `${slugify(f.authors.split(/,| and /)[0] || 'anon')}${f.year}`;
  const lines = [
    `@${type}{${key},`,
    `  title={${f.title.trim()}},`,
    `  author={${f.authors.trim()}},`,
    `  year={${String(f.year).trim()}},`,
  ];
  if (f.venue) lines.push(`  ${type === 'article' ? 'journal' : 'booktitle'}={${f.venue.trim()}},`);
  if (f.url) lines.push(`  url={${f.url.trim()}},`);
  lines.push('}');
  return lines.join('\n');
}

function runPipeline() {
  return new Promise((resolve) => {
    const py = spawn('python3', [path.join('scripts', 'bib2json.py')], { cwd: ROOT });
    let out = '';
    py.stdout.on('data', (d) => (out += d));
    py.stderr.on('data', (d) => (out += d));
    py.on('close', (code) => resolve({ code, out }));
    py.on('error', (e) => resolve({ code: -1, out: String(e) }));
  });
}

async function addPublication(f) {
  const entry = buildBibtex(f);
  const keyMatch = entry.match(/@\w+\s*\{\s*([^,\s]+)/);
  const key = keyMatch ? keyMatch[1] : null;
  const bib = existsSync(BIB_FILE) ? await readFile(BIB_FILE, 'utf8') : '';
  if (key && new RegExp(`@\\w+\\s*\\{\\s*${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(bib))
    return `Skipped — a BibTeX entry with key “${key}” already exists in pubs.bib.`;
  const sep = bib.endsWith('\n') || bib === '' ? '' : '\n';
  await writeFile(BIB_FILE, `${bib}${sep}\n${entry}\n`, 'utf8');
  const { code, out } = await runPipeline();
  const tail = out.trim().split('\n').slice(-1)[0] || '';
  return code === 0
    ? `Added publication “${key || 'entry'}” to pubs.bib and regenerated the site data. ${tail}`
    : `Added to pubs.bib, but the data pipeline reported an issue:\n${out.trim()}`;
}

const HANDLERS = {
  member: addMember,
  alumni: alumniMgr.add,
  collaborator: collaboratorMgr.add,
  news: addNews,
  project: addProject,
  funder: addFunder,
  publication: addPublication,
};

const REMOVE_HANDLERS = {
  member: removeMember,
  alumni: alumniMgr.remove,
  collaborator: collaboratorMgr.remove,
};

const LIST_FILES = {
  member: 'members.json',
  alumni: 'alumni.json',
  collaborator: 'collaborators.json',
};

// ─── HTTP server ─────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/') {
      const html = await readFile(path.join(import.meta.dirname, 'index.html'), 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    }

    // List existing entries (for the edit/remove dropdown).
    const lm = req.url.match(/^\/api\/list\/(\w+)$/);
    if (req.method === 'GET' && lm) {
      const file = LIST_FILES[lm[1]];
      if (!file) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: false, message: 'No list for that type.' }));
      }
      const data = await readJson(file);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ok: true, items: data }));
    }

    // Add / update, or remove.
    const m = req.url.match(/^\/api\/(add|remove)\/(\w+)$/);
    if (req.method === 'POST' && m) {
      const [, action, type] = m;
      const handler = action === 'remove' ? REMOVE_HANDLERS[type] : HANDLERS[type];
      if (!handler) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: false, message: `Cannot ${action} type: ${type}` }));
      }
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', async () => {
        try {
          const fields = body ? JSON.parse(body) : {};
          const message = await handler(fields);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, message }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, message: err.message }));
        }
      });
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Server error: ' + err.message);
  }
});

server.listen(PORT, () => {
  console.log(`\n  Per4ML content form running at  http://localhost:${PORT}\n`);
  console.log('  Entries are written into contents/*.json (and pubs.bib for papers).');
  console.log('  Run `npm run dev` afterwards to see them on the site. Ctrl-C to stop.\n');
});
