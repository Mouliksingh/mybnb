const cloudinary = require("cloudinary").v2;
const multerCloudinary = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

let storage;

// Dynamically handle both v4.x (class constructor) and v2.x (factory function)
if (multerCloudinary.CloudinaryStorage) {
  storage = new multerCloudinary.CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "MyBnB_Listings",
      allowedFormats: ["png", "jpg", "jpeg"],
    },
  });
} else {
  storage = multerCloudinary({
    cloudinary: cloudinary,
    folder: "MyBnB_Listings",
    allowedFormats: ["png", "jpg", "jpeg"],
  });
}

module.exports = { cloudinary, storage };