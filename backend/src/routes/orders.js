import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../prisma.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        totalAmount: true,
        paymentStatus: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            quantity: true,
            unitPrice: true,
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true
              }
            }
          }
        }
      }
    });

    return res.json({ orders });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

export default router;
