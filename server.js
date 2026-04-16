require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
 
const connectDB = require('./config/db');
 
const app = express();
 
connectDB();
 
app.use(cors());
app.use(express.json());
 
// ✅ FIX 1: Serve uploaded images as static files
// Without this, product images never load on the frontend
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
 
app.use('/auth', require('./routes/authRoutes'));
app.use('/products', require('./routes/productRoutes'));
app.use('/orders', require('./routes/orderRoutes'));
 
const PORT = process.env.PORT || 5000;
 
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
 