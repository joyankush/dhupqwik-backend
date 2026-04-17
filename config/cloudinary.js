// ============================================================
//  config/cloudinary.js
// ============================================================

const cloudinary = require('cloudinary').v2;

// ✅ FIX: env variable names must match what's in your .env file
// Your .env must have these exact names:
// CLOUDINARY_CLOUD_NAME=xxx
// CLOUDINARY_API_KEY=xxx
// CLOUDINARY_API_SECRET=xxx
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
