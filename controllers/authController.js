// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as z from "zod";

import User from "../models/User.js";
import Place from "../models/Place.js";
import Booking from "../models/Booking.js";
import { jwtSecret } from "../middlewares/auth.js";

// ====================== REGISTER ======================
export const register = async (req, res) => {
  try {
    // 1️⃣ Define Zod schema
    const userSchema = z.object({
      name: z.string().min(2, { message: "Name is too short" }),
      email: z.string().email({ message: "Invalid email format" }),
      password: z.string().min(6, { message: "Password must be at least 6 characters" }),
      role: z.string().optional(),
    });

    // 2️⃣ Parse and validate request body
    let parsed;
    try {
      parsed = userSchema.parse(req.body);
    } catch (validationError) {
      // If Zod validation fails, return 400 with detailed errors
      return res.status(400).json({ error: validationError.errors });
    }

    const { name, email, password, role } = parsed;

    // 3️⃣ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // 4️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5️⃣ Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "customer",
    });

    // 6️⃣ Respond with created user (excluding password)
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error("Register Error:", err);

    // If error is from Mongoose or other unknown errors
    res.status(500).json({ error: "Registration failed" });
  }
};

// ====================== LOGIN ======================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const passOk = await bcrypt.compare(password, user.password);
    if (!passOk) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { email: user.email, id: user._id, role: user.role },
      jwtSecret,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "None", // required for cross-site cookies
      secure: true, // required with SameSite=None
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Login failed" });
  }
};

// ====================== PROFILE ======================
export const profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Profile Error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// ====================== USER STATS ======================
export const stats = async (req, res) => {
  try {
    const listingsCount = await Place.countDocuments({ owner: req.user.id });
    const tripsCount = await Booking.countDocuments({ user: req.user.id });

    res.json({ listingsCount, tripsCount });
  } catch (err) {
    console.error("Stats Error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

// ====================== LOGOUT ======================
export const logout = (req, res) => {
  res.clearCookie("token", { httpOnly: true, path: "/" });
  res.json({ success: true, message: "Logged out successfully" });
};

// ====================== BECOME HOST ======================
export const becomeHost = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.role === "host") {
      return res.status(400).json({ error: "You are already a host" });
    }

    user.role = "host";
    await user.save();

    res.json({
      success: true,
      message: "You are now a host!",
      role: user.role,
    });
  } catch (err) {
    console.error("Become Host Error:", err);
    res.status(500).json({ error: "Failed to become a host" });
  }
};
