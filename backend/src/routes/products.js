import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../prisma.js';

const router = Router();

//products 

router.post('/:storeId/add-product', requireAuth, async (req, res) => {
  try {
    const { storeId } = req.params;
    const { name, description, price, stock, imageUrl } = req.body;

    if (!name || !price)
      return res.status(400).json({ error: 'Name and price required' });

   const userRole = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {role: true}
  });

    if (userRole.role !== 'STORE_OWNER') {
      return res.status(403).json({ error: 'Only store owners can create a store' });
        
    }
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store)
      return res.status(404).json({ error: 'Store not found' });

    if (store.ownerId !== req.user.id)
      return res.status(403).json({ error: 'You do not own this store' });

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        stock: stock ? parseInt(stock) : 0,
        imageUrl: imageUrl || null,  
        storeId
      }
    });

    return res.json({ message: 'Product added', product });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to add product' });
  }
});


router.get('/:storeId/products', async (req, res) => {
  try {
    const { storeId } = req.params;

    const products = await prisma.product.findMany({
      where: { storeId },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        imageUrl: true, 
        createdAt: true
      }
    });

    return res.json({ products });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});


router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        imageUrl: true,  
        storeId: true
      }
    });

    if (!product)
      return res.status(404).json({ error: 'Product not found' });

    return res.json({ product });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch product' });
  }
});

export default router;
