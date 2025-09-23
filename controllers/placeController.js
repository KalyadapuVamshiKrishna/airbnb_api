import Place from "../models/Place.js";
import User from "../models/User.js";
import * as z from "zod";

// --- Validation Schemas ---
const placeSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  address: z.string().min(5, "Address is required"),
  photos: z.array(z.string()).optional(),
  description: z.string().min(10, "Description is too short"),
  perks: z.array(z.string()).optional(),
  extraInfo: z.string().optional(),
  checkIn: z.string(),
  checkOut: z.string(),
  maxGuests: z.number().min(1, "At least 1 guest allowed"),
  price: z.number().min(0, "Price must be positive"),
  city: z.string(),
  state: z.string(),
  country: z.string(),
});

/**
 * @desc Create a new place (only for hosts)
 * @route POST /api/places
 * @access Private
 */
export const createPlace = async (req, res) => {
  try {
    if (req.user.role !== "host") {
      return res.status(403).json({ error: "Only hosts can create places" });
    }

    const parsed = placeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }

    const place = await Place.create({
      owner: req.user.id,
      ...parsed.data,
    });

    res.status(201).json(place);
  } catch (err) {
    console.error("Error creating place:", err);
    res.status(500).json({ error: "Failed to create place" });
  }
};

/**
 * @desc Edit an existing place (only by the owner)
 * @route PUT /api/places/:id
 * @access Private
 */
export const editPlace = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ error: "Place not found" });

    if (place.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not allowed" });
    }

    const parsed = placeSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }

    Object.assign(place, parsed.data);
    await place.save();

    res.json(place);
  } catch (err) {
    console.error("Error editing place:", err);
    res.status(500).json({ error: "Failed to edit place" });
  }
};

/**
 * @desc Get all places with optional filters, search, and wishlist info
 * @route GET /api/places
 * @access Public (wishlist only if logged in)
 */
export const getAllPlaces = async (req, res) => {
  try {
    const {
      location,
      priceMin,
      priceMax,
      page = 1,
      limit = 6,
      sortBy = "newest",
      search,
    } = req.query;

    const query = {};

    // --- Location filter ---
    if (location && location.toLowerCase() !== "all locations") {
      const regex = new RegExp(location, "i");
      query.$or = [
        { city: regex },
        { state: regex },
        { country: regex },
        { address: regex },
      ];
    }

    // --- Price filter ---
    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = Number(priceMin);
      if (priceMax) query.price.$lte = Number(priceMax);
    }

    // --- Live search filter ---
    if (search && search.trim() !== "") {
      const regex = new RegExp(search, "i");
      query.$or = [
        { title: regex },
        { description: regex },
        { city: regex },
        { state: regex },
        { country: regex },
        { address: regex },
      ];
    }

    // --- Sorting ---
    let sortOption = {};
    switch (sortBy) {
      case "priceAsc":
        sortOption = { price: 1 };
        break;
      case "priceDesc":
        sortOption = { price: -1 };
        break;
      case "newest":
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    // --- Pagination ---
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // --- Fetch places ---
    const places = await Place.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    const total = await Place.countDocuments(query);

    // --- Wishlist enrichment ---
    let wishlistSet = new Set();
    if (req.user?.id) {
      const user = await User.findById(req.user.id).select("wishlist");
      if (user?.wishlist?.length) {
        wishlistSet = new Set(user.wishlist.map((id) => id.toString()));
      }
    }

    const enrichedPlaces = places.map((p) => ({
      ...p.toObject(),
      isFavorite: wishlistSet.has(p._id.toString()),
    }));

    res.json({
      places: enrichedPlaces,
      total,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error("Error fetching places:", err);
    res.status(500).json({ error: "Failed to fetch places" });
  }
};

/**
 * @desc Get a single place by ID (with wishlist info)
 * @route GET /api/places/:id
 * @access Public (wishlist only if logged in)
 */
export const getPlaceById = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ error: "Place not found" });

    let isFavorite = false;
    if (req.user?.id) {
      const user = await User.findById(req.user.id).select("wishlist");
      isFavorite = user?.wishlist
        ?.map((id) => id.toString())
        .includes(place._id.toString());
    }

    res.json({ ...place.toObject(), isFavorite });
  } catch (err) {
    console.error("Error fetching place:", err);
    res.status(500).json({ error: "Failed to fetch place" });
  }
};

/**
 * @desc Get places created by the logged-in user
 * @route GET /api/places/user
 * @access Private
 */
export const getUserPlaces = async (req, res) => {
  try {
    const places = await Place.find({ owner: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(places);
  } catch (err) {
    console.error("Error fetching user places:", err);
    res.status(500).json({ error: "Failed to fetch user places" });
  }
};

/**
 * @desc Delete a place (only by the owner)
 * @route DELETE /api/places/:id
 * @access Private
 */
export const deletePlace = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ error: "Place not found" });

    if (place.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not allowed" });
    }

    await place.deleteOne();
    res.json({ message: "Place deleted successfully" });
  } catch (err) {
    console.error("Error deleting place:", err);
    res.status(500).json({ error: "Failed to delete place" });
  }
};
