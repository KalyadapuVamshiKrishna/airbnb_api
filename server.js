import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import axios from "axios"; // Added axios for making HTTP requests

import { v2 as cloudinary } from "cloudinary";

import authRoutes from "./routes/authRoutes.js";
import placeRoutes from "./routes/placeRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import experienceRoutes from "./routes/experienceRoutes.js";
import servicesRoute from "./routes/servicesRoutes.js";

dotenv.config();
const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const allowedOrigins = [
      'http://localhost:5173',
      'https://domio-client.vercel.app'
];


// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Static folder for uploads (if needed)
app.use("/uploads", express.static("uploads"));

// --- NEW: Nominatim (OpenStreetMap) API Proxy Routes ---

// Proxy for searching location by name (Geocoding)
app.get('/api/search-location', async (req, res, next) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" is required.' });
  }
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: { q, format: 'json', limit: 1 },
      headers: {
        // IMPORTANT: Nominatim requires a custom User-Agent.
        // Replace with your actual app name and contact email.
        'User-Agent': 'DomioApp/1.0 (contact@domio-app.com)',
      },
    });
    res.json(response.data);
  } catch (error) {
    // Pass the error to the centralized error handling middleware
    next(error);
  }
});

// Proxy for finding address from coordinates (Reverse Geocoding)
app.get('/api/reverse-geocode', async (req, res, next) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: 'Query parameters "lat" and "lon" are required.' });
  }
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
      params: { lat, lon, format: 'json' },
      headers: {
        'User-Agent': 'DomioApp/1.0 (contact@domio-app.com)',
      },
    });
    res.json(response.data);
  } catch (error) {
    next(error);
  }
});


// API routes
app.use("/api", authRoutes);
app.use("/api", placeRoutes);
app.use("/api", bookingRoutes);
app.use("/api", uploadRoutes);
app.use("/api/experiences", experienceRoutes);
app.use("/api/", servicesRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

// Connect to MongoDB and start server
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
  }
}

startServer();
