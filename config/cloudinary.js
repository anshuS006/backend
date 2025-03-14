"use strict";

var cloudinary = require("cloudinary").v2;
var _require = require("multer-storage-cloudinary"),
  CloudinaryStorage = _require.CloudinaryStorage;
var multer = require("multer");
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});
var storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "news-images",
    allowedFormats: ["jpg", "png", "jpeg"]
  }
});
var upload = multer({
  storage: storage
});
module.exports = {
  cloudinary: cloudinary,
  upload: upload
};