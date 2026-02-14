import { Router } from 'express';
import crypto from 'crypto';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../prisma.js';
import Razorpay from 'razorpay';

const router = Router();

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret)
    throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env');
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

// POST /checkout/create-razorpay-order — create Razorpay order for current cart total
router.post('/create-razorpay-order', requireAuth, async (req, res) => {
  try {
    const razorpay = getRazorpay();
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true },
    });

    if (cartItems.length === 0)
      return res.status(400).json({ error: 'Cart is empty' });

    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + item.quantity * item.product.price;
    }, 0);

    const amountInPaise = Math.round(totalAmount * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    return res.json({
      razorpayOrderId: order.id,
      amount: amountInPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// POST /checkout/verify-and-create-order — verify Razorpay signature and create order + clear cart
router.post('/verify-and-create-order', requireAuth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
      return res.status(400).json({ error: 'Missing payment details' });

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature)
      return res.status(400).json({ error: 'Payment verification failed' });

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true },
    });

    if (cartItems.length === 0)
      return res.status(400).json({ error: 'Cart is empty' });

    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + item.quantity * item.product.price;
    }, 0);

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        totalAmount,
        paymentStatus: 'COMPLETED',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      },
    });

    const orderItemsData = cartItems.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.product.price,
    }));

    await prisma.orderItem.createMany({ data: orderItemsData });
    await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });

    return res.json({
      message: 'Order created successfully',
      orderId: order.id,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Checkout failed' });
  }
});

// Legacy: POST /checkout/create-order (mock, no Razorpay) — keep for backward compatibility or remove
router.post('/create-order', requireAuth, async (req, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true },
    });

    if (cartItems.length === 0)
      return res.status(400).json({ error: 'Cart is empty' });

    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + item.quantity * item.product.price;
    }, 0);

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        totalAmount,
        paymentStatus: 'PENDING',
      },
    });

    const orderItemsData = cartItems.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.product.price,
    }));

    await prisma.orderItem.createMany({ data: orderItemsData });
    await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });

    return res.json({
      message: 'Order created successfully (mock payment)',
      orderId: order.id,
      totalAmount,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Checkout failed' });
  }
});

export default router;
