import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  place: { type: mongoose.Schema.Types.ObjectId, ref: "Place" }, // optional if type !== 'place'
  item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },   // for experience/service
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["place", "experience", "service"], required: true },
  
  // Dates
  checkIn: { type: String },
  checkOut: { type: String },
  date: { type: String },

  numberOfGuests: { type: Number, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String },

  // Payment
  price: { type: Number, required: true },
  serviceFee: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, default: "Test Gateway" },
  transactionId: { type: String, required: true },

  // Booking status
  status: { type: String, enum: ["pending", "confirmed", "canceled", "failed", "refunded"], default: "pending" },
  refundRequested: { type: Boolean, default: false },
  refundRequestedAt: { type: Date },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Booking", bookingSchema);
