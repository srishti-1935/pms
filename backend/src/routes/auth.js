const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const prisma = require('../db');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const v = require('../validators');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Try again in 15 minutes.' },
});

const sign = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

router.post('/register', authLimiter, validate(v.register), async (req, res) => {
  const { fullName, email, password } = req.body;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: 'Email already registered' });
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { fullName, email, passwordHash },
    select: { id: true, fullName: true, email: true, createdAt: true },
  });
  res.status(201).json({ user, token: sign(user.id) });
});

router.post('/login', authLimiter, validate(v.login), async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  const ok = user && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
  const { passwordHash, ...safe } = user;
  res.json({ user: safe, token: sign(user.id) });
});

router.post('/logout', auth, (req, res) => {
  res.json({ message: 'Logged out. Discard the token on the client.' });
});

router.get('/me', auth, (req, res) => res.json({ user: req.user }));

module.exports = router;
