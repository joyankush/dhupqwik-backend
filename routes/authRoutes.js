const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/admin-login', (req, res) => {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = jwt.sign({}, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    return res.json({ token });
  }

  res.status(401).json({ message: 'Invalid credentials' });
});

router.post('/customer-login', (req, res) => {
  res.json({ message: 'Logged in with phone' });
});

module.exports = router;
