const express = require('express');
const router = express.Router();
const { Product, Category, Order, find, findOne } = require('../models/database');

async function withCategory(products, categories) {
  const catMap = {};
  categories.forEach(c => { catMap[c._id] = c; });
  return products.map(p => ({ ...p, category: catMap[p.categoryId] || null }));
}

router.get('/', async (req, res) => {
  try {
    const [allProducts, categories] = await Promise.all([find(Product), find(Category)]);
    const sorted = allProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);
    const featured = await withCategory(sorted, categories);
    res.render('index', { featured, categories, title: 'JEJE' });
  } catch (err) {
    console.error('Homepage error:', err);
    res.status(500).send('Server error: ' + err.message);
  }
});

router.get('/products', async (req, res) => {
  try {
    const { category, search, min, max, page = 1 } = req.query;
    const limit = 9;
    const skip = (Number(page) - 1) * limit;
    let [products, categories] = await Promise.all([find(Product), find(Category)]);
    if (category) products = products.filter(p => p.categoryId === category);
    if (search) {
      const re = new RegExp(search, 'i');
      products = products.filter(p => re.test(p.name) || re.test(p.author));
    }
    if (min) products = products.filter(p => p.price >= Number(min));
    if (max) products = products.filter(p => p.price <= Number(max));
    products.sort((a, b) => a.name.localeCompare(b.name));
    const totalPages = Math.ceil(products.length / limit);
    const paginated = products.slice(skip, skip + limit);
    const enriched = await withCategory(paginated, categories);
    res.render('products', { products: enriched, categories, title: 'All Books', filters: req.query, currentPage: Number(page), totalPages });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const product = await findOne(Product, { _id: req.params.id });
    if (!product) return res.status(404).render('404', { title: 'Not Found' });
    const category = await findOne(Category, { _id: product.categoryId });
    const related = (await find(Product, { categoryId: product.categoryId }))
      .filter(p => p._id !== product._id).slice(0, 4);
    res.render('product-detail', { product: { ...product, category }, related, title: product.name });
  } catch (err) {
    res.status(404).render('404', { title: 'Not Found' });
  }
});

router.get('/cart', (req, res) => {
  res.render('cart', { title: 'Shopping Cart' });
});

router.get('/checkout', (req, res) => {
  if (!req.session.cart || req.session.cart.length === 0) return res.redirect('/cart');
  res.render('checkout', { title: 'Checkout', user: req.session.user || null });
});

router.get('/order-confirmation/:id', async (req, res) => {
  try {
    const order = await findOne(Order, { _id: req.params.id });
    if (!order) return res.redirect('/');
    res.render('order-confirmation', { order, items: order.items, title: 'Order Confirmed' });
  } catch (err) {
    res.redirect('/');
  }
});

router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('login', { title: 'Login' });
});

router.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('register', { title: 'Register' });
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

router.get('/dashboard', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  try {
    const { User, findOne, find } = require('../models/database');
    const user = await findOne(User, { _id: req.session.user.id });
    // Match orders by userId OR by customerEmail to catch both guest and logged-in orders
    const allOrders = await find(Order);
    const orders = allOrders.filter(o =>
      (o.userId && o.userId === req.session.user.id) ||
      (o.customerEmail && o.customerEmail.toLowerCase() === req.session.user.email.toLowerCase())
    );
    const sorted = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.render('dashboard', { title: 'My Dashboard', user, orders: sorted });
  } catch (err) {
    res.status(500).send('Server error: ' + err.message);
  }
});

router.get('/profile', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  try {
    const { User, findOne } = require('../models/database');
    const user = await findOne(User, { _id: req.session.user.id });
    res.render('profile', { title: 'My Profile', user });
  } catch (err) {
    res.status(500).send('Server error: ' + err.message);
  }
});

module.exports = router;
