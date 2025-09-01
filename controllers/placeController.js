import Place from "../models/Place.js";

// Create a new place (only hosts)
export const createPlace = async (req, res) => {
  const { title, address, photos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price } = req.body;
  try {
    const place = await Place.create({
      owner: req.user.id,
      title,
      address,
      photos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
      price,
    });
    res.json(place);
  } catch (err) {
    res.status(422).json({ message: err.message });
  }
};

// Update an existing place (only by owner host)
export const editPlace = async (req, res) => {
  const { id } = req.params;
  try {
    const place = await Place.findById(id);
    if (!place) return res.status(404).json({ message: "Place not found" });
    if (place.owner.toString() !== req.user.id) return res.status(403).json({ message: "Not allowed" });

    Object.assign(place, req.body);
    await place.save();
    res.json(place);
  } catch (err) {
    res.status(422).json({ message: err.message });
  }
};

// Get all places (public)
export const getAllPlaces = async (req, res) => {
  try {
    const places = await Place.find();
    res.json(places);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single place by ID
export const getPlaceById = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ message: "Place not found" });
    res.json(place);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get places of a logged-in host
export const getUserPlaces = async (req, res) => {
  try {
    const places = await Place.find({ owner: req.user.id });
    res.json(places);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
