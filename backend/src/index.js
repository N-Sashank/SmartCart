import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import 'dotenv/config';

import authRoutes from './routes/auth.js';
import storeRoutes from './routes/stores.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import checkoutRoutes from './routes/checkout.js';
import orderRoutes from './routes/orders.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors())


app.use('/auth', authRoutes);
app.use('/stores', storeRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/checkout', checkoutRoutes);
app.use('/orders', orderRoutes);

const PORT = 4000;
app.listen(PORT, () => console.log("Server running on port 4000"));

app.get('/health', (req, res) => {
  return res.json({
    report:"OK"
  });
});
