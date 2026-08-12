const { formidable } = require('formidable');
const fs = require('fs/promises');
const path = require('path');
const { extractText } = require('../lib/extract');
const { standardAnalyze } = require('../lib/standard');
const { aiAnalyze } = require('../lib/ai');

const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED = new Set(['.pdf', '.docx', '.txt']);

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Method not allowed.' });
  }

  let parsed;
  try {
    const form = formidable({
      multiples: false,
      maxFileSize: MAX_BYTES,
      keepExtensions: true
    });
    parsed = await form.parse(req);
  } catch (err) {
    let message = 'The upload could not be processed.';
    if (err && (err.code === 1009 || err.code === 'ETOOBIG')) {
      message = 'The file is larger than the 25 MB limit.';
    } else if (err && err.code === 1010) {
      message = 'The uploaded file is empty.';
    }
    return json(res, 400, { error: message });
  }

  const [parsedFields, parsedFiles] = Array.isArray(parsed)
    ? parsed
    : [parsed.fields, parsed.files];

  const fields = parsedFields || {};
  const files = parsedFiles || {};
  const uploaded = Array.isArray(files.file) ? files.file[0] : files.file;

  if (!uploaded) return json(res, 400, { error: 'No document was uploaded.' });

  const filepath = uploaded.filepath;
  try {
    const ext = path.extname(uploaded.originalFilename || '').toLowerCase();

    if (!ALLOWED.has(ext)) {
      return json(res, 415, {
        error: 'Only PDF, DOCX, and TXT files are supported.'
      });
    }

    const buffer = await fs.readFile(filepath);
    const text = await extractText(buffer, ext);

    if (!text.trim()) {
      return json(res, 422, {
        error: 'The document contains no extractable text. Scanned/image-only PDFs need OCR, which this MVP does not yet include.'
      });
    }

    const mode = String(
      Array.isArray(fields.mode) ? fields.mode[0] : (fields.mode || 'standard')
    ).toLowerCase();

    const apiKey = Array.isArray(fields.apiKey) ? fields.apiKey[0] : fields.apiKey;

    let result;
    if (mode === 'ai') {
      if (!apiKey) return json(res, 400, { error: 'AI mode requires your API key.' });
      result = await aiAnalyze(text, uploaded.originalFilename, apiKey);
    } else {
      result = standardAnalyze(text, uploaded.originalFilename);
    }

    return json(res, 200, result);
  } catch (err) {
    console.error('ActionFlow analysis error:', err);
    // Give the frontend a useful diagnostic without returning stack traces or secrets.
    return json(res, 500, {
      error: err && err.message
        ? `Analysis error: ${err.message}`
        : 'We could not analyze this document. Please try another file.'
    });
  } finally {
    if (filepath) await fs.rm(filepath, { force: true }).catch(() => {});
  }
};

module.exports.config = {
  api: { bodyParser: false }
};
