import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["host", "customer"], default: "customer" },
  wishlist: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Place",
  },
],
});

export default mongoose.model("User", UserSchema);
