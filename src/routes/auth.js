const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { User, findOne, insert, update } = require('../models/database');

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password } = req.body;
  try {
    const existing = await findOne(User, { email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hash = bcrypt.hashSync(password, 10);
    console.log('Registering user:', email);
    const user = await insert(User, { name, email, password: hash, role: 'customer', createdAt: new Date() });
    console.log('User inserted:', user._id);
    req.session.user = { id: user._id.toString(), name: user.name, email: user.email, role: user.role, photo: user.photo || '' };
    res.json({ success: true, user: req.session.user });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const user = await findOne(User, { email });
    console.log('Login attempt:', email, '| user found:', !!user);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    req.session.user = { id: user._id.toString(), name: user.name, email: user.email, role: user.role, photo: user.photo || '' };
    res.json({ success: true, user: req.session.user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

router.post('/profile', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });
  const { name, photo } = req.body;
  try {
    await update(User, { _id: req.session.user.id }, { $set: { name, photo } });
    req.session.user.name = name;
    req.session.user.photo = photo;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
