import Booking from "../models/Booking.js";
import Place from "../models/Place.js";
import Experience from "../models/Experience.js";
import { Service } from "../models/Service.js";
import nodemailer from "nodemailer";
import mongoose from "mongoose";

/* ======================================================
   ENV SAFE WRAPPER 
====================================================== */
const env =
  typeof globalThis !== "undefined" &&
  globalThis.process &&
  globalThis.process.env
    ? globalThis.process.env
    : {};

/* ======================================================
   STATUS CONSTANTS 
====================================================== */
export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELED: "canceled",
  EXPIRED: "expired", // FIXED
};

/* ======================================================
   VALIDATION HELPERS
====================================================== */
export function validateCommonFields(body) {
  const { type, itemId, numberOfGuests, name, phone, paymentMethod } = body;

  if (!type || !itemId || !numberOfGuests || !name || !phone || !paymentMethod)
    return "Missing required fields";

  if (!/^[6-9]\d{9}$/.test(phone)) return "Invalid phone number format";
  if (!/^[A-Za-z\s]{2,}$/.test(name)) return "Invalid name format";

  if (isNaN(numberOfGuests) || Number(numberOfGuests) <= 0)
    return "Invalid number of guests";

  return null;
}

export function validatePlaceDates(checkIn, checkOut) {
  if (!checkIn || !checkOut)
    return "Check-in and check-out required";

  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);

  if (isNaN(inDate.getTime()) || isNaN(outDate.getTime()))
    return "Invalid date format";

  if (outDate <= inDate)
    return "Check-out date must be after check-in";

  return null;
}

/* ======================================================
   FETCH ITEM BASED ON TYPE
====================================================== */
export async function fetchItem(type, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;

  switch (type) {
    case "place":
      return await Place.findById(id);
    case "experience":
      return await Experience.findById(id);
    case "service":
      return await Service.findById(id);
    default:
      return null;
  }
}

/* ======================================================
   PRICE CALCULATION
====================================================== */
export function calculatePrice(type, itemDoc, data) {
  let price = 0;

  if (type === "place") {
    const oneDay = 1000 * 60 * 60 * 24;
    const nights = Math.ceil(
      (new Date(data.checkOut) - new Date(data.checkIn)) / oneDay
    );
    price = itemDoc.price * nights;
  } else {
    price = itemDoc.price * Number(data.numberOfGuests);
  }

  const serviceFee = Math.max(50, +(price * 0.05).toFixed(2));
  const totalAmount = price + serviceFee;

  return { price, serviceFee, totalAmount };
}

/* ======================================================
   OVERLAPPING CHECK (PLACES ONLY)
====================================================== */
export async function checkOverlap(placeId, checkIn, checkOut) {
  return await Booking.findOne({
    place: placeId,
    status: BOOKING_STATUS.CONFIRMED,
    $or: [
      { checkIn: { $lt: checkOut, $gte: checkIn } },
      { checkOut: { $lte: checkOut, $gt: checkIn } },
      { checkIn: { $lte: checkIn }, checkOut: { $gte: checkOut } },
    ],
  });
}

/* ======================================================
   AUTO-EXPIRE BOOKINGS WITH PAST CHECKOUT DATE
====================================================== */
export async function autoExpireBookings(bookings) {
  const now = new Date();

  const updates = bookings.map(async (booking) => {
    if (
      booking.status === BOOKING_STATUS.CONFIRMED &&
      booking.checkOut &&
      new Date(booking.checkOut) < now
    ) {
      booking.status = BOOKING_STATUS.EXPIRED;
      await booking.save();
    }
  });

  await Promise.all(updates);
}

/* ======================================================
   EMAIL SENDER
====================================================== */
export async function sendReceipt(email, booking) {
  const subject = "Your Booking Receipt - Domio";
  const message = `Thank you for your booking with Domio!

Booking ID: ${booking._id}
Transaction ID: ${booking.transactionId}
Total Paid: ₹${booking.totalAmount}
Name: ${booking.name}
Guests: ${booking.numberOfGuests}
`;

  // If no SMTP config → simulate email
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    return { simulated: true };
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT) || 587,
    secure: Number(env.SMTP_PORT) === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  await transporter.verify();

  await transporter.sendMail({
    from: '"Domio" <no-reply@domio.com>',
    to: email,
    subject,
    text: message,
  });

  return { simulated: false };
}
