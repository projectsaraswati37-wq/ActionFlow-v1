# ActionFlow

ActionFlow is a document-to-action-plan web app with a browser frontend and Vercel serverless backend.

## Flow

1. Select or drag a PDF, DOCX, or TXT document (25 MB maximum).
2. The frontend sends the file to `POST /api/analyze`.
3. The backend extracts text with `pdf-parse`, `mammoth`, or plain-text decoding.
4. Standard mode uses deterministic extraction. AI mode sends the extracted text to OpenAI using the API key supplied for that session.
5. The JSON result is rendered into the dashboard.
6. `POST /api/export-csv` generates a real CSV download.
7. `POST /api/export-pdf` generates a real PDF download with PDFKit.

## Deploy to Vercel

Push the whole repository to GitHub and import the repository into Vercel. Keep `index.html`, `api/`, `lib/`, `package.json`, and `vercel.json` at the repository root as provided.

No frontend API URL needs to be configured when the frontend and API are deployed together: the browser uses `/api/analyze`, `/api/export-csv`, and `/api/export-pdf` on the same origin.

## AI mode

AI mode requires a user-provided OpenAI API key. The key is sent to the backend for the analysis request and is not stored by ActionFlow code. For a public production application, a server-managed provider key or an authenticated backend should be considered instead of asking users for their own key.

## Current limitation

Scanned/image-only PDFs are not OCR'd. The extractor requires selectable text.
