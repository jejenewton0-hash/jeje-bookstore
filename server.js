const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

require('./src/models/database'); // init NeDB

const app = express();
const PORT = process.env.PORT || 3000;

// ensure data directory exists
fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'jeje-secret-2025',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

app.use((req, res, next) => {
  res.locals.cartCount = req.session.cart ? req.session.cart.reduce((s, i) => s + i.quantity, 0) : 0;
  res.locals.user = req.session.user || null;
  next();
});

app.use('/', require('./src/routes/pages'));
app.use('/admin', require('./src/routes/admin'));
app.use('/api/products', require('./src/routes/products'));
app.use('/api/cart', require('./src/routes/cart'));
app.use('/api/orders', require('./src/routes/orders'));
app.use('/api/auth', require('./src/routes/auth'));

app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);
  res.status(500).send('Server error: ' + err.message);
});

app.listen(PORT, () => console.log(`🚀 JEJE running on http://localhost:${PORT}`));

module.exports = app;
