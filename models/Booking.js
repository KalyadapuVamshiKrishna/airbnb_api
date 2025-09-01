import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  place: { type: mongoose.Schema.Types.ObjectId, ref: "Place" }, // optional if type !== 'place'
  item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },   // for experience/service
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  checkIn: { type: String },
  checkOut: { type: String },
  date: { type: String }, // for experience/service
  numberOfGuests: { type: Number, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  price: { type: Number, required: true },
  address: { type: String }, // optional
  type: { type: String, required: true }, // 'place' | 'experience' | 'service'
  status: { type: String, default: "booked" },
  refundRequested: { type: Boolean, default: false },
});

export default mongoose.model("Booking", bookingSchema);
