// ============================================================
//  middleware/uploadMiddleware.js
// ============================================================

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Cloudinary storage config
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
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
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = upload;