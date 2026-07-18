const express = require('express');
const router = express.Router();
const { Product, Category, findOne } = require('../models/database');

const getCart = (req) => req.session.cart || [];
const saveCart = (req, cart) => { req.session.cart = cart; };

router.get('/', async (req, res) => {
  try {
    const cart = getCart(req);
    const enriched = await Promise.all(cart.map(async item => {
      const product = await findOne(Product, { _id: item.productId });
      if (!product) return null;
      const category = await findOne(Category, { _id: product.categoryId });
      return { ...product, category, productId: item.productId, quantity: item.quantity };
    }));
    const items = enriched.filter(Boolean);
    res.json({ items, total: items.reduce((s, i) => s + i.price * i.quantity, 0) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/add', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await findOne(Product, { _id: productId });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const cart = getCart(req);
    const existing = cart.find(i => i.productId === productId);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + Number(quantity), product.stock);
    } else {
      cart.push({ productId, quantity: Math.min(Number(quantity), product.stock) });
    }
    saveCart(req, cart);
    res.json({ success: true, cartCount: cart.reduce((s, i) => s + i.quantity, 0) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/update', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = getCart(req);
    const item = cart.find(i => i.productId === productId);
    if (!item) return res.status(404).json({ error: 'Item not in cart' });
    if (quantity <= 0) {
      saveCart(req, cart.filter(i => i.productId !== productId));
    } else {
      item.quantity = Number(quantity);
      saveCart(req, cart);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/remove/:productId', (req, res) => {
  const cart = getCart(req).filter(i => i.productId !== req.params.productId);
  saveCart(req, cart);
  res.json({ success: true });
});

router.delete('/clear', (req, res) => {
  saveCart(req, []);
  res.json({ success: true });
});

module.exports = router;
