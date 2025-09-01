import express from "express";
import { register, login, profile, logout } from "../controllers/authController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", requireAuth, profile);
router.post("/logout", logout);

export default router;
