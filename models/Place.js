import mongoose from "mongoose";

const placeSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  address: String,
  coordinates: {
    lat: Number,
    lng: Number,
  },
  photos: [String],
  description: String,
  perks: [String],
  extraInfo: String,
  checkIn: String,
  checkOut: String,
  maxGuests: Number,
  price: Number,
}, { timestamps: true }); 


placeSchema.index({ coordinates: '2dsphere' });

export default mongoose.model("Place", placeSchema);
