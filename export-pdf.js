const PDFDocument = require('pdfkit');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const docData = body.document || {};
    const tasks = Array.isArray(body.tasks) ? body.tasks : [];
    const requirements = Array.isArray(body.requirements) ? body.requirements : [];
    const deadlines = Array.isArray(body.deadlines) ? body.deadlines : [];
    const timeline = Array.isArray(body.timeline) ? body.timeline : [];
    const insights = Array.isArray(body.insights) ? body.insights : [];

    const pdf = new PDFDocument({ size: 'A4', margin: 48, bufferPages: true, info: { Title: 'ActionFlow Action Plan' } });
    const chunks = [];
    pdf.on('data', c => chunks.push(c));
    const done = new Promise((resolve, reject) => { pdf.on('end', resolve); pdf.on('error', reject); });

    pdf.fontSize(22).font('Helvetica-Bold').text('ActionFlow', { continued: false });
    pdf.moveDown(0.3).fontSize(16).text(`Action Plan — ${docData.name || 'Document'}`);
    pdf.moveDown(0.5).fontSize(10).font('Helvetica').fillColor('#475569').text(`Generated ${new Date().toLocaleString('en-IN')}`);
    pdf.fillColor('#0f172a').moveDown(1);

    section(pdf, 'Summary');
    pdf.fontSize(10).font('Helvetica').text(body.summary || 'No summary available.');

    section(pdf, 'Tasks');
    if (!tasks.length) pdf.fontSize(10).font('Helvetica').text('No tasks detected.');
    tasks.forEach((t, i) => {
      pdf.fontSize(11).font('Helvetica-Bold').text(`${i + 1}. ${t.title || 'Untitled task'}`);
      pdf.fontSize(9).font('Helvetica').text(`${t.description || ''}`);
      pdf.fontSize(9).fillColor('#475569').text(`Priority: ${t.priority || 'medium'}   Deadline: ${t.deadline || 'Not specified'}   Status: ${t.completed ? 'Completed' : 'Open'}`);
      pdf.fillColor('#0f172a').moveDown(0.45);
    });

    section(pdf, 'Important Requirements');
    requirements.forEach((r, i) => pdf.fontSize(10).font('Helvetica').text(`${i + 1}. ${r}`, { bullet: { indent: 8 } }));
    if (!requirements.length) pdf.fontSize(10).font('Helvetica').text('No requirements detected.');

    section(pdf, 'Deadlines');
    deadlines.forEach((d, i) => {
      pdf.fontSize(10).font('Helvetica-Bold').text(`${i + 1}. ${d.text || 'Deadline'}`);
      if (d.dates?.length) pdf.fontSize(9).font('Helvetica').fillColor('#475569').text(`Dates: ${d.dates.join(', ')}`);
      pdf.fillColor('#0f172a').moveDown(0.25);
    });
    if (!deadlines.length) pdf.fontSize(10).font('Helvetica').text('No deadline-related items detected.');

    section(pdf, 'Timeline');
    timeline.forEach((m, i) => {
      pdf.fontSize(10).font('Helvetica-Bold').text(`${i + 1}. ${m.label || 'Milestone'}`);
      pdf.fontSize(9).font('Helvetica').text(m.description || '');
      pdf.moveDown(0.25);
    });
    if (!timeline.length) pdf.fontSize(10).font('Helvetica').text('No milestones detected.');

    section(pdf, 'Insights');
    insights.forEach((x, i) => pdf.fontSize(10).font('Helvetica').text(`${i + 1}. ${x}`));
    if (!insights.length) pdf.fontSize(10).font('Helvetica').text('No additional insights.');

    const pages = pdf.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      pdf.switchToPage(i);
      pdf.fontSize(8).fillColor('#64748b').text(`ActionFlow • Page ${i + 1} of ${pages.count}`, 48, 806, { align: 'center', width: 499 });
    }
    pdf.end();
    await done;
    const buffer = Buffer.concat(chunks);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName(docData.name || 'action-plan')}.pdf"`);
    res.setHeader('Content-Length', buffer.length);
    return res.status(200).send(buffer);
  } catch (err) {
    console.error('PDF export error:', err);
    return res.status(400).json({ error: 'Could not generate the PDF export.' });
  }
};

function section(pdf, title) {
  pdf.moveDown(0.9).fontSize(13).font('Helvetica-Bold').fillColor('#2563eb').text(title);
  pdf.moveDown(0.25).fillColor('#0f172a');
}

function safeName(name) {
  return String(name).replace(/\.[^.]+$/, '').replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'action-plan';
}
