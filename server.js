import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

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

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin:"https://airbnb-clone-client-l9bm.vercel.app/",
}));

// Static folder for uploads (if needed)
app.use("/uploads", express.static("uploads"));

// API routes
app.use("/",(req,res)=>{
  res.send("API is running")
})
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
