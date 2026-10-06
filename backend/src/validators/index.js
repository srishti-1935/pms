const { z } = require('zod');

const date = z
  .string()
  .refine((s) => !isNaN(Date.parse(s)), 'Invalid date')
  .transform((s) => new Date(s));

const register = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(8).max(72),
});

const login = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

const projectBase = z.object({
  name: z.string().trim().min(1).max(150),
  description: z.string().trim().max(2000).nullable().optional(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']).optional(),
  startDate: date.nullable().optional(),
  endDate: date.nullable().optional(),
});
const rangeOk = (d) => !d.startDate || !d.endDate || d.endDate >= d.startDate;
const rangeMsg = { message: 'endDate must be on or after startDate' };
const projectCreate = projectBase.refine(rangeOk, rangeMsg);
const projectUpdate = projectBase.partial().refine(rangeOk, rangeMsg);

const taskBase = z.object({
  name: z.string().trim().min(1).max(150),
  description: z.string().trim().max(2000).nullable().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  dueDate: date.nullable().optional(),
  projectId: z.number().int().positive(),
});
const taskCreate = taskBase;
const taskUpdate = taskBase.partial();

module.exports = { register, login, projectCreate, projectUpdate, taskCreate, taskUpdate };
