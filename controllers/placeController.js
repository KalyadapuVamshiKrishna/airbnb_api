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
    res.status(201).json(place);
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

// ✅ Get all places with Pagination, Search, and Sorting
export const getAllPlaces = async (req, res) => {
  try {
    const { location, priceMin, priceMax, page = 1, limit = 6 } = req.query;

    const query = {};

    // Filter by location (case-insensitive partial match)
    if (location && location !== "all locations") {
      query.address = { $regex: location, $options: "i" };
    }

    // Filter by price range
    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = Number(priceMin);
      if (priceMax) query.price.$lte = Number(priceMax);
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Fetch filtered places with pagination
    const places = await Place.find(query)
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(Number(limit));

    const total = await Place.countDocuments(query);

    res.json({
      places,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
    });
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
