const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Product, Order, findOne, insert, update } = require('../models/database');

// MTN MoMo simulation
router.post('/momo', async (req, res) => {
  const { phone, amount } = req.body;
  if (!phone || !amount) return res.status(400).json({ error: 'Phone and amount required' });
  setTimeout(() => {
    res.json({ success: true, message: `Payment request of ${Number(amount).toLocaleString()} RWF sent to ${phone}. Approve on your phone.`, transactionId: 'TXN' + Date.now() });
  }, 1500);
});

router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('address').trim().notEmpty().withMessage('Address is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const cart = req.session.cart || [];
  if (cart.length === 0) return res.status(400).json({ error: 'Cart is empty' });

  const { name, email, phone, address, paymentMethod = 'cod' } = req.body;

  try {
    let total = 0;
    const orderItems = [];

    for (const item of cart) {
      const product = await findOne(Product, { _id: item.productId });
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for: ${product?.name || 'unknown'}` });
      }
      total += product.price * item.quantity;
      orderItems.push({ productId: product._id, name: product.name, image: product.image, quantity: item.quantity, price: product.price });
    }

    const order = await insert(Order, {
      userId: req.session.user?.id || null,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      customerAddress: address,
      paymentMethod,
      items: orderItems,
      total,
      status: 'pending',
      createdAt: new Date()
    });

    for (const item of cart) {
      await update(Product, { _id: item.productId }, { $inc: { stock: -item.quantity } });
    }

    req.session.cart = [];
    res.json({ success: true, orderId: order._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await findOne(Order, { _id: req.params.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(404).json({ error: 'Order not found' });
  }
});

module.exports = router;
