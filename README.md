# ActionFlow — Deployable MVP

This package combines the supplied ActionFlow `index.html` UI with the supplied
fixed backend.

## Structure

- `index.html` — original ActionFlow UI, with application logic wired to `/api/analyze`
- `api/analyze.js` — document analysis endpoint
- `lib/extract.js` — PDF/DOCX/TXT extraction
- `lib/standard.js` — deterministic analysis
- `lib/ai.js` — optional user-key AI analysis
- `vercel.json` — Vercel function configuration

## Deploy

Upload these files/folders to the ROOT of a GitHub repository and import that
repository into Vercel. Do not place the whole project inside another folder.

The frontend sends multipart form data to:

`POST /api/analyze`

with `file`, `mode`, and (AI mode only) `apiKey`.

## Supported files

PDF, DOCX, TXT up to 25 MB. Scanned/image-only PDFs are not OCR'd in this MVP.
