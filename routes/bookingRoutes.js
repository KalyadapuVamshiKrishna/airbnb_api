import express from "express";
import {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  requestRefund,
  initiatePayment,
  sendReceiptEmail,
  verifyBooking,
  getItemDetails
} from "../controllers/bookingController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

router.get("/bookings/verify", verifyBooking);

// Payments & receipts
router.post("/payments/initiate", initiatePayment);
router.post("/bookings/send-receipt", sendReceiptEmail);

// Booking CRUD
router.post("/bookings", requireAuth, createBooking);
router.get("/bookings", requireAuth, getUserBookings);
 // must come BEFORE /:id
router.get("/bookings/:id", requireAuth, getBookingById);
router.delete("/bookings/:id", requireAuth, cancelBooking);
router.post("/bookings/:id/refund", requireAuth, requestRefund);

// Item details
router.get("/items/:type/:id", getItemDetails); // type = place/experience/service

export default router;
