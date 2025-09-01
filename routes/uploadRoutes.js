import express from "express";
import fs from "fs";
import { photosMiddleware } from "../middlewares/multer.js";
import { requireAuth } from "../middlewares/auth.js";
import { v2 as cloudinary } from "cloudinary";

const router = express.Router();

// Cloudinary config (make sure you set these env variables)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload by link
router.post("/upload-by-link", requireAuth, async (req, res) => {
  const { link } = req.body;
  try {
    const result = await cloudinary.uploader.upload(link);
    res.json(result.secure_url);
  } catch (err) {
    res.status(500).json({ error: "Failed to upload image" });
  }
});

// Upload photos from form
router.post("/upload", requireAuth, photosMiddleware.array("photos", 100), async (req, res) => {
  try {
    const uploadedFiles = [];
    for (let file of req.files) {
      const result = await cloudinary.uploader.upload(file.path);
      uploadedFiles.push(result.secure_url);
      fs.unlinkSync(file.path); // remove temp file
    }
    res.json(uploadedFiles);
  } catch (err) {
    res.status(500).json({ error: "Failed to upload images" });
  }
});

export default router;
