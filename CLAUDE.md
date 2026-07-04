# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands
- Install dependencies: `npm install`
- Run development server: `npm run dev` (port 3000)
- Build for production: `npm run build`
- Run type-check (lint): `npm run lint`
- Preview production build: `npm run preview`
- Clean build artifacts: `npm run clean`

## Architecture & Project Structure
- **Frontend**: React 19 application bundled with Vite and styled with Tailwind CSS.
- **Visualization**: Uses D3.js for complex visualizations, specifically in `src/components/PublicationMindmap.tsx`.
- **Data Management**:
  - The site is data-driven, consuming JSON files from `public/` and `public/data/` (e.g., `publications.json`, `teams.json`).
  - Content sources include BibTeX files in `contents/pubs.bib`.
- **Content Pipeline**:
  - Python scripts in `scripts/` and the root `mkhtml.py` are used to process raw content (like BibTeX) into the JSON formats used by the frontend.
- **Key Files**:
  - `src/App.tsx`: Main application entry point and routing/layout.
  - `src/components/PublicationMindmap.tsx`: D3-based publication visualization.
  - `vite.config.ts`: Vite configuration, including environment variable handling for `GEMINI_API_KEY`.
