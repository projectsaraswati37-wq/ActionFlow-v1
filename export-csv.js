function csvCell(value) {
  const s = value == null ? '' : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const tasks = Array.isArray(body.tasks) ? body.tasks : [];
    const rows = [['ID', 'Title', 'Description', 'Priority', 'Deadline', 'Completed']];
    for (const t of tasks) {
      rows.push([t.id, t.title, t.description, t.priority, t.deadline || '', t.completed ? 'Yes' : 'No']);
    }
    const csv = rows.map(r => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="actionflow-${safeName(body.document?.name || 'action-plan')}.csv"`);
    return res.status(200).send('\ufeff' + csv);
  } catch (err) {
    console.error('CSV export error:', err);
    return res.status(400).json({ error: 'Could not generate the CSV export.' });
  }
};

function safeName(name) {
  return String(name).replace(/\.[^.]+$/, '').replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'action-plan';
}
