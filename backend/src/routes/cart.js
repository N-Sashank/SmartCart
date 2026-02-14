import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../prisma.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      select: {
        id: true,
        quantity: true,
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            imageUrl: true
          }
        }
      }
    });

    return res.json({ cart: cartItems });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

router.post('/add-item', requireAuth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId)
      return res.status(400).json({ error: 'productId required' });

    const qty = quantity ? parseInt(quantity) : 1;
    if (qty < 1)
      return res.status(400).json({ error: 'Quantity must be at least 1' });

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product)
      return res.status(404).json({ error: 'Product not found' });

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: { userId: req.user.id, productId }
      }
    });

    let cartItem;
    if (existingItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: qty }
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId: req.user.id,
          productId,
          quantity: qty
        }
      });
    }

    return res.json({ message: 'Cart updated', cartItem });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update cart' });
  }
});

router.delete('/delete/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.cartItem.findUnique({ where: { id } });
    if (!item)
      return res.status(404).json({ error: 'Cart item not found' });

    if (item.userId !== req.user.id)
      return res.status(403).json({ error: 'Not your cart item' });

    await prisma.cartItem.delete({ where: { id } });

    return res.json({ message: 'Cart item removed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to remove item' });
  }
});

export default router;
