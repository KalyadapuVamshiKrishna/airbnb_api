import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    reviewText: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const placeSchema = new mongoose.Schema(
  {
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

    // ⭐ Review system fields
    reviews: [
  {
    user: String,
    rating: Number,
    reviewText: String,
    createdAt: Date
  }
], rating: { type: Number, default: 0 }, 
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ⭐ Virtual for average rating
placeSchema.virtual("averageRating").get(function () {
  if (!this.reviews.length) return 0;
  const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
  return Number((sum / this.reviews.length).toFixed(1));
});

// ⚡ 2D index for geo-based filters
placeSchema.index({ coordinates: "2dsphere" });

export default mongoose.model("Place", placeSchema);
