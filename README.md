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
