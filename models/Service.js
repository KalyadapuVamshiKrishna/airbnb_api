import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  rating: Number,
  image: String
});

export const Service = mongoose.model("Service", serviceSchema);
