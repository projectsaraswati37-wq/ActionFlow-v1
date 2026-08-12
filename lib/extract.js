async function extractText(buffer, ext) {
  if (ext === '.txt') return buffer.toString('utf8');

  if (ext === '.docx') {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  }

  if (ext === '.pdf') {
    const pdfParse = require('pdf-parse');

    // pdf-parse v2 API
    if (pdfParse && typeof pdfParse.PDFParse === 'function') {
      const parser = new pdfParse.PDFParse({ data: buffer });
      try {
        const result = await parser.getText();
        const raw = result && result.text ? result.text : '';
        return raw.replace(/--\s*\d+\s*of\s*\d+\s*--/g, '').trim();
      } finally {
        if (typeof parser.destroy === 'function') await parser.destroy();
      }
    }

    // Legacy pdf-parse API (kept as a compatibility fallback).
    if (typeof pdfParse === 'function') {
      const result = await pdfParse(buffer);
      return (result && result.text ? result.text : '').trim();
    }

    throw new Error('The installed pdf-parse package does not expose a supported PDF parser.');
  }

  throw new Error('Unsupported file type');
}

module.exports = { extractText };
