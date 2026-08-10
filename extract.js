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
    try { const result = await parser.getText(); return result.text || ''; }
    finally { await parser.destroy(); }
  }
  throw new Error('Unsupported file type');
}
module.exports={extractText};
