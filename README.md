# ActionFlow — Deployable MVP (Corrected)

This package preserves the supplied ActionFlow `index.html` UI and connects it to the
document-analysis backend.

## Structure

- `index.html` — supplied ActionFlow UI; visual layout is preserved
- `api/analyze.js` — POST document analysis endpoint
- `api/health.js` — GET deployment health check
- `lib/extract.js` — PDF/DOCX/TXT extraction with pdf-parse compatibility handling
- `lib/standard.js` — deterministic analysis
- `lib/ai.js` — optional user-key AI analysis
- `vercel.json` — minimal Vercel configuration; `/api` functions are auto-detected

## GitHub/Vercel deployment

The repository ROOT must directly contain:

```text
index.html
package.json
package-lock.json
vercel.json
api/
  analyze.js
  health.js
lib/
  extract.js
  standard.js
  ai.js
```

Do not put these inside another project folder.

After deployment, test:

`https://YOUR-DOMAIN.vercel.app/api/health`

Expected response:

```json
{"ok":true,"service":"actionflow-api"}
```

Then upload a text-based PDF, DOCX, or TXT through the ActionFlow UI.

## Supported files

PDF, DOCX, TXT up to 25 MB. Scanned/image-only PDFs are not OCR'd in this MVP.

## Modes

- Standard mode: uses the backend deterministic analysis engine.
- AI mode: sends extracted document text to OpenAI using the API key supplied for that request.
