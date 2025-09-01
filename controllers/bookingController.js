import Booking from "../models/Booking.js";

// CREATE BOOKING
export const createBooking = async (req, res) => {
  try {
    const { type, itemId, checkIn, checkOut, date, numberOfGuests, name, phone, price, address } = req.body;

    // Basic validations
    if (!type || !itemId || !numberOfGuests || !name || !phone || !price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const bookingData = {
      type,
      numberOfGuests,
      name,
      phone,
      price,
      user: req.user ? req.user.id : null,
    };

    if (type === "place") {
      if (!checkIn || !checkOut) {
        return res.status(400).json({ error: "Check-in and check-out are required for place bookings" });
      }
      bookingData.place = itemId;
      bookingData.checkIn = checkIn;
      bookingData.checkOut = checkOut;
      bookingData.address = address || "";
    } else {
      if (!date) {
        return res.status(400).json({ error: "Date is required for experience/service bookings" });
      }
      bookingData.item = itemId;
      bookingData.date = date;
    }

    const booking = await Booking.create(bookingData);
    res.status(201).json(booking);
  } catch (error) {
    console.error("Booking Error:", error);
    // Return detailed error message for development
    res.status(500).json({ error: error.message || "Booking failed" });
  }
};

// GET USER BOOKINGS
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).populate("place");
    res.json(bookings);
 
  } catch (error) {
    console.error("Get Bookings Error:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

// DELETE BOOKING
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    await Booking.findByIdAndDelete(id);
    res.json({ success: true, message: "Booking canceled successfully" });
  } catch (error) {
    console.error("Delete Booking Error:", error);
    res.status(500).json({ error: "Failed to delete booking" });
  }
};

// REQUEST REFUND
export const requestRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.status !== "canceled") return res.status(400).json({ error: "Only canceled bookings can be refunded" });

    booking.refundRequested = true;
    await booking.save();

    res.json({ success: true, message: "Refund request submitted" });
  } catch (error) {
    console.error("Refund Request Error:", error);
    res.status(500).json({ error: "Refund request failed" });
  }
};

