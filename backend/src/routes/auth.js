import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { optionalAuth } from '../middleware/auth.js';
import { prisma } from '../prisma.js'; 

const router = Router();

// auth

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email and password required' });

    
    const allowedRoles = ['CUSTOMER', 'STORE_OWNER'];
    const finalRole = allowedRoles.includes(role) ? role : 'CUSTOMER';

    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return res.status(409).json({ error: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        provider: 'LOCAL',
        role: finalRole
      }
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

    return res.json({
      message: 'Registered successfully',
      token,
      role: user.role
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Registration failed' });
  }
});



router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash)
      return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid)
      return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

    return res.json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Login failed' });
  }
});


router.get('/me', optionalAuth, async (req, res) => {
  if (!req.user) return res.json({ authenticated: false, user: null });

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true, provider: true }
  });

  return res.json({ authenticated: Boolean(user), user });
});

export default router;
