// models/Experience.js (sketch)
import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  user: { name: String, avatar: String },
  rating: Number,
  title: String,
  comment: String,
  createdAt: Date
}, { _id: false });

const ExperienceSchema = new mongoose.Schema({
  title: String,
  slug: String,
  shortTitle: String,
  description: String,
  location: String,
  coordinates: {
    lat: Number,
    lng: Number
  },
  category: String,
  tags: [String],
  photos: [String],
  coverPhoto: String,
  price: Number,
  currency: { type: String, default: "INR" },
  duration: String,
  durationHours: Number,
  maxGuests: Number,
  minAge: Number,
  cancellationPolicy: String,
  languages: [String],
  amenities: Object,
  host: {
    name: String,
    avatar: String,
    bio: String,
    isSuperhost: Boolean
  },
  itinerary: [{ title: String, description: String, approxMinutes: Number }],
  reviews: [ReviewSchema],
  rating: Number,
  reviewsCount: Number,
  ratingBreakdown: Object,
  availability: [String],
  highlights: [String],
  meetingPoint: String
}, { timestamps: true });

export default mongoose.model("Experience", ExperienceSchema);
