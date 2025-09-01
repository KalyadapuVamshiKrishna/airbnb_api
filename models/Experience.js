import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema({
  title: String,
  location: String,
  category: String, // e.g., Adventure, Cultural, Food, Wellness
  description: String,
  price: Number,
  duration: String, // e.g., "3 hours"
  host: String,
  photos: [String], 
});

export default mongoose.model("Experience", experienceSchema);
