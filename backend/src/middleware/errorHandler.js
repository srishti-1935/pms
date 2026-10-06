module.exports = (err, req, res, next) => {
  if (err.code === 'P2002') return res.status(409).json({ error: 'Already exists' });
  if (err.code === 'P2025') return res.status(404).json({ error: 'Resource not found' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON' });
  if (err.message === 'Not allowed by CORS') return res.status(403).json({ error: err.message });
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? 'Internal server error' : err.message });
};
