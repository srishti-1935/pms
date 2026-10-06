const router = require('express').Router();
const prisma = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const ownerId = req.user.id;
  const taskWhere = { project: { ownerId } };
  const [totalProjects, totalTasks, completedTasks, pendingTasks, projectsInProgress] =
    await Promise.all([
      prisma.project.count({ where: { ownerId } }),
      prisma.task.count({ where: taskWhere }),
      prisma.task.count({ where: { ...taskWhere, status: 'COMPLETED' } }),
      prisma.task.count({ where: { ...taskWhere, status: 'PENDING' } }),
      prisma.project.count({ where: { ownerId, status: 'IN_PROGRESS' } }),
    ]);
  res.json({ totalProjects, totalTasks, completedTasks, pendingTasks, projectsInProgress });
});

module.exports = router;
