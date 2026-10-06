const router = require('express').Router();
const { ProjectStatus } = require('@prisma/client');
const prisma = require('../db');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const v = require('../validators');
const { parseId, enumQuery, notFound } = require('../utils/helpers');

router.use(auth);

router.get('/', async (req, res) => {
  const status = enumQuery(req.query.status, ProjectStatus, 'status');
  const search = (req.query.search || '').toString().trim();
  const projects = await prisma.project.findMany({
    where: {
      ownerId: req.user.id,
      ...(status && { status }),
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
    },
    include: { _count: { select: { tasks: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ projects });
});

router.get('/:id', async (req, res) => {
  const project = await prisma.project.findFirst({
    where: { id: parseId(req.params.id), ownerId: req.user.id },
    include: { tasks: { orderBy: { createdAt: 'desc' } } },
  });
  if (!project) notFound('Project');
  res.json({ project });
});

router.post('/', validate(v.projectCreate), async (req, res) => {
  const project = await prisma.project.create({
    data: { ...req.body, ownerId: req.user.id },
  });
  res.status(201).json({ project });
});

router.put('/:id', validate(v.projectUpdate), async (req, res) => {
  const id = parseId(req.params.id);
  const existing = await prisma.project.findFirst({ where: { id, ownerId: req.user.id } });
  if (!existing) notFound('Project');
  const merged = { ...existing, ...req.body };
  if (merged.startDate && merged.endDate && merged.endDate < merged.startDate) {
    return res.status(400).json({ error: 'endDate must be on or after startDate' });
  }
  const project = await prisma.project.update({ where: { id }, data: req.body });
  res.json({ project });
});

router.delete('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  const existing = await prisma.project.findFirst({ where: { id, ownerId: req.user.id } });
  if (!existing) notFound('Project');
  await prisma.project.delete({ where: { id } });
  res.status(204).end();
});

module.exports = router;
