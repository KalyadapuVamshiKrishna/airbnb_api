import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { jwtSecret } from "../middlewares/auth.js";
import * as z from "zod";
import Place from "../models/Place.js";
import Booking from "../models/Booking.js"

const bcryptSalt = bcrypt.genSaltSync(10);

// REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const userSchema = z.object({
      name : z.string(),
      email : z.email(),
      password : z.string()
    })

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ error: "Email already registered" });

    const hashedPassword = bcrypt.hashSync(password, bcryptSalt);

    const user = await User.create({ name, email, password: hashedPassword, role: role || "customer" });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (e) {
    console.error("Register Error:", e);
    res.status(500).json({ error: "Registration failed" });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const passOk = bcrypt.compareSync(password, user.password);
    if (!passOk) return res.status(401).json({ error: "Wrong password" });

    const token = jwt.sign({ email: user.email, id: user._id, role: user.role }, jwtSecret, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none",
      secure: process.env.NODE_ENV === "production",
      path: "/",  
    });

    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Login failed" });
  }
};

// PROFILE
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

export const stats= async (req, res) => {
  const userId = req.user._id;
  const listingsCount = await Place.countDocuments({ owner: req.user.id });
  const tripsCount = await Booking.countDocuments({ user: req.user.id });

  res.json({ listingsCount, tripsCount });
};

// LOGOUT
export const logout = (req, res) => {
  res.cookie("token", "", { httpOnly: true, expires: new Date(0) }).json({ success: true });
};

// BECOME HOST
export const becomeHost = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.role === "host") return res.status(400).json({ error: "You are already a host" });

    user.role = "host";
    await user.save();

    res.json({ success: true, message: "You are now a host!", role: user.role });
  } catch (err) {
    console.error("Become Host Error:", err);
    res.status(500).json({ error: "Failed to become a host" });
  }
};
