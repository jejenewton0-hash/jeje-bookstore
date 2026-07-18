const express = require('express');
const router = express.Router();
const { Product, Category, find, findOne } = require('../models/database');

async function withCategory(products, categories) {
  const catMap = {};
  categories.forEach(c => { catMap[c._id] = c; });
  return products.map(p => ({ ...p, category: catMap[p.categoryId] || null }));
}

router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let products = await find(Product);
    if (category) products = products.filter(p => p.categoryId === category);
    if (search) {
      const re = new RegExp(search, 'i');
      products = products.filter(p => re.test(p.name) || re.test(p.author));
    }
    const categories = await find(Category);
    res.json(await withCategory(products, categories));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/categories', async (req, res) => {
  try {
    res.json(await find(Category));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await findOne(Product, { _id: req.params.id });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const category = await findOne(Category, { _id: product.categoryId });
    res.json({ ...product, category });
  } catch (err) {
    res.status(404).json({ error: 'Product not found' });
  }
});

module.exports = router;
