const router = require('express').Router();
const { TaskStatus, Priority } = require('@prisma/client');
const prisma = require('../db');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const v = require('../validators');
const { parseId, enumQuery, notFound } = require('../utils/helpers');

router.use(auth);

const ownedProject = async (projectId, userId) => {
  const p = await prisma.project.findFirst({ where: { id: projectId, ownerId: userId } });
  if (!p) notFound('Project');
  return p;
};

router.get('/', async (req, res) => {
  const status = enumQuery(req.query.status, TaskStatus, 'status');
  const priority = enumQuery(req.query.priority, Priority, 'priority');
  const search = (req.query.search || '').toString().trim();
  const projectId = req.query.projectId ? parseId(req.query.projectId) : undefined;
  const tasks = await prisma.task.findMany({
    where: {
      project: { ownerId: req.user.id },
      ...(projectId && { projectId }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
    },
    include: { project: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ tasks });
});

router.get('/:id', async (req, res) => {
  const task = await prisma.task.findFirst({
    where: { id: parseId(req.params.id), project: { ownerId: req.user.id } },
    include: { project: { select: { id: true, name: true } } },
  });
  if (!task) notFound('Task');
  res.json({ task });
});

router.post('/', validate(v.taskCreate), async (req, res) => {
  await ownedProject(req.body.projectId, req.user.id);
  const task = await prisma.task.create({ data: req.body });
  res.status(201).json({ task });
});

router.put('/:id', validate(v.taskUpdate), async (req, res) => {
  const id = parseId(req.params.id);
  const existing = await prisma.task.findFirst({
    where: { id, project: { ownerId: req.user.id } },
  });
  if (!existing) notFound('Task');
  if (req.body.projectId) await ownedProject(req.body.projectId, req.user.id);
  const task = await prisma.task.update({ where: { id }, data: req.body });
  res.json({ task });
});

router.delete('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  const existing = await prisma.task.findFirst({
    where: { id, project: { ownerId: req.user.id } },
  });
  if (!existing) notFound('Task');
  await prisma.task.delete({ where: { id } });
  res.status(204).end();
});

module.exports = router;
