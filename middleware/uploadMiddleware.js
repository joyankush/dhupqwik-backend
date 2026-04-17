// ============================================================
//  middleware/uploadMiddleware.js
// ============================================================

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// 🔍 DEBUG: check if cloudinary config is loaded
console.log("Cloudinary config loaded:", {
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY ? "YES" : "NO",
  api_secret: process.env.API_SECRET ? "YES" : "NO"
});

// Cloudinary storage config
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    console.log("Uploading file:", file.originalname); // 🔍 DEBUG

    return {
      folder: "dhupqwik-products",
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png", "webp"]
    };
  }
});

// Multer setup
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

module.exports = upload;