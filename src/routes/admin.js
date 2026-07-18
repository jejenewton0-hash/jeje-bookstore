const express = require('express');
const router = express.Router();
const { Product, Order, Category, User, find, findOne, insert, update, count } = require('../models/database');

function adminOnly(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
  next();
}

// Dashboard + Analytics
router.get('/', adminOnly, async (req, res) => {
  try {
    const [products, orders, categories, users] = await Promise.all([
      find(Product), find(Order), find(Category), find(User)
    ]);

    const activeOrders = orders.filter(o => o.status !== 'cancelled');
    const totalRevenue = activeOrders.reduce((s, o) => s + o.total, 0);

    // Sales by status
    const statusCount = { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
    orders.forEach(o => { if (statusCount[o.status] !== undefined) statusCount[o.status]++; });

    // Sales by day (last 7 days)
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-RW', { month: 'short', day: 'numeric' });
      const dayOrders = orders.filter(o => {
        const od = new Date(o.createdAt);
        return od.toDateString() === d.toDateString() && o.status !== 'cancelled';
      });
      last7.push({ label, revenue: dayOrders.reduce((s, o) => s + o.total, 0), count: dayOrders.length });
    }

    // Top selling products
    const productSales = {};
    orders.filter(o => o.status !== 'cancelled').forEach(o => {
      (o.items || []).forEach(item => {
        if (!productSales[item.name]) productSales[item.name] = { name: item.name, qty: 0, revenue: 0 };
        productSales[item.name].qty += item.quantity;
        productSales[item.name].revenue += item.price * item.quantity;
      });
    });
    const topProducts = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 5);

    // Recent users
    const recentUsers = users.filter(u => u.role !== 'admin')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    // Recent orders
    const recentOrders = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      products, orders, categories,
      totalRevenue,
      totalUsers: users.filter(u => u.role !== 'admin').length,
      statusCount,
      last7,
      topProducts,
      recentUsers,
      recentOrders
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error: ' + err.message);
  }
});

// Analytics page
router.get('/analytics', adminOnly, async (req, res) => {
  try {
    const [orders, users] = await Promise.all([find(Order), find(User)]);

    // Monthly revenue (last 6 months)
    const monthly = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleDateString('en-RW', { month: 'short', year: 'numeric' });
      const monthOrders = orders.filter(o => {
        const od = new Date(o.createdAt);
        return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear() && o.status !== 'cancelled';
      });
      monthly.push({ label, revenue: monthOrders.reduce((s, o) => s + o.total, 0), count: monthOrders.length });
    }

    // All users with order count
    const userStats = users.filter(u => u.role !== 'admin').map(u => {
      const userOrders = orders.filter(o =>
        (o.userId && o.userId === u._id.toString()) ||
        (o.customerEmail && o.customerEmail.toLowerCase() === u.email.toLowerCase())
      );
      return {
        name: u.name, email: u.email,
        orders: userOrders.length,
        spent: userOrders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0),
        createdAt: u.createdAt
      };
    }).sort((a, b) => b.spent - a.spent);

    // Payment method breakdown
    const paymentStats = { cod: 0, momo: 0 };
    orders.forEach(o => {
      if (o.paymentMethod === 'momo') paymentStats.momo++;
      else paymentStats.cod++;
    });

    res.render('admin/analytics', {
      title: 'Analytics',
      monthly, userStats, paymentStats,
      totalRevenue: orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0),
      totalOrders: orders.length,
      totalUsers: users.filter(u => u.role !== 'admin').length
    });
  } catch (err) {
    res.status(500).send('Server error: ' + err.message);
  }
});

// Products list
router.get('/products', adminOnly, async (req, res) => {
  try {
    const [products, categories] = await Promise.all([find(Product), find(Category)]);
    const catMap = {};
    categories.forEach(c => { catMap[c._id] = c; });
    const enriched = products.map(p => ({ ...p, category: catMap[p.categoryId] || null }));
    res.render('admin/products', { title: 'Manage Products', products: enriched, categories });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Add product
router.post('/products', adminOnly, async (req, res) => {
  try {
    const { name, description, price, stock, categoryId, author, isbn, image } = req.body;
    await insert(Product, { name, description, price: Number(price), stock: Number(stock), categoryId, author, isbn, image: image || '/images/book-placeholder.png', createdAt: new Date() });
    res.redirect('/admin/products');
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Edit product form
router.get('/products/:id/edit', adminOnly, async (req, res) => {
  try {
    const [product, categories] = await Promise.all([findOne(Product, { _id: req.params.id }), find(Category)]);
    if (!product) return res.redirect('/admin/products');
    res.render('admin/product-edit', { title: 'Edit Product', product, categories });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Update product
router.post('/products/:id/edit', adminOnly, async (req, res) => {
  try {
    const { name, description, price, stock, categoryId, author, isbn, image } = req.body;
    await update(Product, { _id: req.params.id }, { $set: { name, description, price: Number(price), stock: Number(stock), categoryId, author, isbn, image: image || '/images/book-placeholder.png' } });
    res.redirect('/admin/products');
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Delete product
router.post('/products/:id/delete', adminOnly, async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      Product.remove({ _id: req.params.id }, {}, (err) => err ? reject(err) : resolve());
    });
    res.redirect('/admin/products');
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Orders list
router.get('/orders', adminOnly, async (req, res) => {
  try {
    const orders = (await find(Order)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.render('admin/orders', { title: 'Manage Orders', orders });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Update order status
router.post('/orders/:id/status', adminOnly, async (req, res) => {
  try {
    await update(Order, { _id: req.params.id }, { $set: { status: req.body.status } });
    res.redirect('/admin/orders');
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Admin profile
router.get('/profile', adminOnly, async (req, res) => {
  try {
    const user = await findOne(User, { _id: req.session.user.id });
    res.render('admin/profile', { title: 'Admin Profile', user });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
