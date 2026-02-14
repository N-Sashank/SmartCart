
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../prisma.js';
const router = Router();

//Store 

router.post('/create-store', requireAuth, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) return res.status(400).json({ error: 'Store name required' });

     const userRole = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {role: true}
  });

    if (userRole.role !== 'STORE_OWNER') {
      return res.status(403).json({ error: 'Only store owners can create a store' });
        
    }

    const store = await prisma.store.create({
      data: {
        name,
        description: description || null,
        ownerId: req.user.id
      }
    });

    return res.json({ message: 'Store created', store });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create store' });
  }
});


router.get('/get-stores', async (req, res) => {
  try {
    const stores = await prisma.store.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        ownerId: true,
        createdAt: true
      }
    });

    return res.json({ stores });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch stores' });
  }
});



export default router;
