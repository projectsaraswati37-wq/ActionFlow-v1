async function extractText(buffer, ext) {
  if (ext === '.txt') return buffer.toString('utf8');
  if (ext === '.docx') {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({buffer});
    return result.value || '';
  }
  if (ext === '.pdf') {
    const { PDFParse } = require('pdf-parse');
    const parser = new PDFParse({data: buffer});
    try {
      const result = await parser.getText();
      // pdf-parse emits "-- N of M --" page-separator boilerplate even for
      // pages with zero real text (e.g. scanned/image-only PDFs). Strip it
      // so an image-only document correctly resolves to empty text instead
      // of tricking the caller's text.trim() check into passing.
      const raw = result.text || '';
      return raw.replace(/--\s*\d+\s*of\s*\d+\s*--/g, '').trim();
    }
    finally { await parser.destroy(); }
  }
  throw new Error('Unsupported file type');
}
module.exports={extractText};
