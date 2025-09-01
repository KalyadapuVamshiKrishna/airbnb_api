import express from "express";
import { createBooking, getUserBookings, deleteBooking  } from "../controllers/bookingController.js";
import { requireAuth } from "../middlewares/auth.js";



const router = express.Router();

router.post("/bookings", requireAuth, createBooking);
router.get("/bookings", requireAuth, getUserBookings);
router.delete("/bookings/:id", requireAuth, deleteBooking);


export default router;
