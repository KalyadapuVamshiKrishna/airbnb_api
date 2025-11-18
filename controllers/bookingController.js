import Booking from "../models/Booking.js";
import Place from "../models/Place.js";

import {
  BOOKING_STATUS,
  validateCommonFields,
  validatePlaceDates,
  fetchItem,
  calculatePrice,
  checkOverlap,
  sendReceipt,
  autoExpireBookings,
} from "../services/booking.service.js";

import mongoose from "mongoose";

/* -------------------------------------------------------
   CREATE BOOKING
-------------------------------------------------------- */
export const createBooking = async (req, res) => {
  try {
    const error = validateCommonFields(req.body);
    if (error) return res.status(400).json({ success: false, error });

    const { type, itemId, checkIn, checkOut, date } = req.body;

    if (type === "place") {
      const dateErr = validatePlaceDates(checkIn, checkOut);
      if (dateErr)
        return res.status(400).json({ success: false, error: dateErr });
    }

    const itemDoc = await fetchItem(type, itemId);
    if (!itemDoc)
      return res.status(404).json({
        success: false,
        error: `${type} not found`,
      });

    if (type === "place") {
      const overlapping = await checkOverlap(itemId, checkIn, checkOut);
      if (overlapping)
        return res.status(400).json({
          success: false,
          error: "Place already booked for selected dates",
        });
    }

    const pricing = calculatePrice(type, itemDoc, req.body);

    const bookingData = {
      ...pricing,
      type,
      name: req.body.name,
      phone: req.body.phone,
      paymentMethod: req.body.paymentMethod,
      numberOfGuests: Number(req.body.numberOfGuests),
      user: req.user?.id || null,
      status: BOOKING_STATUS.CONFIRMED,
      transactionId:
        req.body.transactionId ||
        `TXN-${Date.now()}-${Math.floor(Math.random() * 99999)}`,
      address: itemDoc.address || itemDoc.location || "",
    };

    if (type === "place") {
      bookingData.place = itemId;
      bookingData.checkIn = checkIn;
      bookingData.checkOut = checkOut;
    } else {
      bookingData.item = itemId;
      bookingData.date = date;
      bookingData.itemModel = type === "experience" ? "Experience" : "Service";
    }

    const booking = await Booking.create(bookingData);

    res.status(201).json({ success: true, booking });
  } catch (err) {
    console.error("createBooking error:", err);
    res.status(500).json({ success: false, error: err.message || "Server error" });
  }
};

/* -------------------------------------------------------
   INITIATE PAYMENT
-------------------------------------------------------- */
export const initiatePayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) return res.status(400).json({ success: false, error: "Missing bookingId" });

    const booking = await Booking.findById(bookingId);
    if (!booking)
      return res.status(404).json({ success: false, error: "Booking not found" });

    if (booking.status !== BOOKING_STATUS.PENDING) {
      return res.status(400).json({
        success: false,
        error: "Booking not in pending state",
      });
    }

    const success = Math.random() > 0.2;
    if (!success)
      return res.status(402).json({ success: false, error: "Payment failed" });

    booking.status = BOOKING_STATUS.CONFIRMED;
    booking.transactionId = `TXN-${Date.now()}`;
    await booking.save();

    res.json({ success: true, transactionId: booking.transactionId });
  } catch (err) {
    console.error("initiatePayment error:", err);
    res.status(500).json({ success: false, error: "Payment failed" });
  }
};

/* -------------------------------------------------------
   GET USER BOOKINGS (AUTO EXPIRE)
-------------------------------------------------------- */
export const getUserBookings = async (req, res) => {
  try {
    // Guard: ensure authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const bookings = await Booking.find({ user: req.user.id })
      .populate("place")
      .populate("item");

    try {
      await autoExpireBookings(bookings);
    } catch (innerErr) {
      console.error("autoExpireBookings error:", innerErr);
      // don't fail whole request because of expiry update; continue to return bookings
    }

    const updated = await Booking.find({ user: req.user.id })
      .populate("place")
      .populate("item");

    res.json({ success: true, bookings: updated });
  } catch (err) {
    console.error("getUserBookings error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch bookings: " + (err.message || "") });
  }
};

/* -------------------------------------------------------
   GET BOOKING BY ID (AUTO EXPIRE)
-------------------------------------------------------- */
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, error: "Invalid ID" });

    let booking = await Booking.findById(id)
      .populate("place")
      .populate("item");

    if (!booking)
      return res.status(404).json({ success: false, error: "Booking not found" });

    try {
      await autoExpireBookings([booking]);
    } catch (innerErr) {
      console.error("autoExpireBookings error on single booking:", innerErr);
    }

    booking = await Booking.findById(id)
      .populate("place")
      .populate("item");

    res.json({ success: true, booking });
  } catch (err) {
    console.error("getBookingById error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch booking: " + (err.message || "") });
  }
};

/* -------------------------------------------------------
   CANCEL BOOKING
-------------------------------------------------------- */
export const cancelBooking = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking)
      return res.status(404).json({ success: false, error: "Not found" });

    // safe-check booking.user
    const bookingUserId = booking.user ? booking.user.toString() : null;
    if (bookingUserId !== req.user.id)
      return res.status(403).json({ success: false, error: "Unauthorized" });

    if (booking.status === BOOKING_STATUS.CANCELED)
      return res
        .status(400)
        .json({ success: false, error: "Already canceled" });

    booking.status = BOOKING_STATUS.CANCELED;
    await booking.save();

    res.json({ success: true, booking });
  } catch (err) {
    console.error("cancelBooking error:", err);
    res.status(500).json({ success: false, error: "Cancellation failed: " + (err.message || "") });
  }
};

/* -------------------------------------------------------
   REQUEST REFUND
-------------------------------------------------------- */
export const requestRefund = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking)
      return res.status(404).json({ success: false, error: "Not found" });

    const bookingUserId = booking.user ? booking.user.toString() : null;
    if (bookingUserId !== req.user.id)
      return res.status(403).json({ success: false, error: "Unauthorized" });

    if (booking.status !== BOOKING_STATUS.CANCELED)
      return res.status(400).json({
        success: false,
        error: "Only canceled bookings can be refunded",
      });

    if (booking.refundRequested)
      return res
        .status(400)
        .json({ success: false, error: "Refund already requested" });

    booking.refundRequested = true;
    booking.refundRequestedAt = new Date();
    await booking.save();

    res.json({ success: true, booking });
  } catch (err) {
    console.error("requestRefund error:", err);
    res.status(500).json({ success: false, error: "Failed to request refund: " + (err.message || "") });
  }
};

/* -------------------------------------------------------
   SEND RECEIPT EMAIL
-------------------------------------------------------- */
export const sendReceiptEmail = async (req, res) => {
  try {
    const booking = await Booking.findById(req.body.bookingId);
    if (!booking)
      return res.status(404).json({ success: false, error: "Booking not found" });

    const result = await sendReceipt(req.body.email, booking);

    res.json({
      success: true,
      message: result.simulated
        ? "Email simulated"
        : "Receipt sent successfully",
    });
  } catch (err) {
    console.error("sendReceiptEmail error:", err);
    res.status(500).json({ success: false, error: "Email failed: " + (err.message || "") });
  }
};

/* -------------------------------------------------------
   VERIFY BOOKING (PAYMENT SUCCESS PAGE)
-------------------------------------------------------- */
export const verifyBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      transactionId: req.query.tx,
    })
      .populate("place")
      .populate("item");

    if (!booking)
      return res.status(404).json({ success: false, error: "Not found" });

    res.json({ success: true, booking });
  } catch (err) {
    console.error("verifyBooking error:", err);
    res.status(500).json({ success: false, error: "Verification failed: " + (err.message || "") });
  }
};

/* -------------------------------------------------------
   GET ITEM DETAILS (PLACE / EXPERIENCE / SERVICE)
-------------------------------------------------------- */
export const getItemDetails = async (req, res) => {
  try {
    const item = await fetchItem(req.params.type, req.params.id);

    if (!item)
      return res.status(404).json({ success: false, error: "Not found" });

    res.json({ success: true, item });
  } catch (err) {
    console.error("getItemDetails error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch item: " + (err.message || "") });
  }
};

/* -------------------------------------------------------
   SUBMIT REVIEW (ONLY AFTER CHECKOUT)
-------------------------------------------------------- */
export const submitReview = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const { id } = req.params;
    const { rating, reviewText } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const bookingUserId = booking.user ? booking.user.toString() : null;
    if (bookingUserId !== req.user.id)
      return res.status(403).json({ error: "Unauthorized" });

    // Ensure stay is completed (or expired)
    const checkoutDate = booking.checkOut ? new Date(booking.checkOut) : null;
    if (!checkoutDate || checkoutDate > new Date())
      return res.status(400).json({ error: "Stay not completed yet" });

    // Mark booking as reviewed
    booking.reviewSubmitted = true;
    booking.reviewRating = rating;
    booking.reviewText = reviewText;
    await booking.save();

    // Save review to place (if place exists)
    if (booking.place) {
      const place = await Place.findById(booking.place);
      if (place) {
        place.reviews = place.reviews || [];
        place.reviews.push({
          user: booking.user,
          rating,
          reviewText,
        });
        await place.save();
      }
    }

    res.json({ success: true, message: "Review submitted!", booking });
  } catch (err) {
    console.error("submitReview error:", err);
    res.status(500).json({ error: "Review failed: " + (err.message || "") });
  }
};
