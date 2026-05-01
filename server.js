require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/auth',     require('./routes/authRoutes'));
app.use('/products', require('./routes/productRoutes'));
app.use('/orders',   require('./routes/orderRoutes'));
app.use('/settings', require('./routes/settingsRoutes')); // ✅ NEW
app.use('/payment',  require('./routes/paymentRoutes'));  // ✅ NEW

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

app.use((err, req, res, next) => {
  console.error('GLOBAL ERROR:', err);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});
