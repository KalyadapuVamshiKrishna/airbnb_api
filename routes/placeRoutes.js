import express from "express";
import { 
  createPlace, editPlace, getAllPlaces, getPlaceById, getUserPlaces , deletePlace
} from "../controllers/placeController.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireHost } from "../middlewares/role.js";
import {
  toggleWishlist,
  getWishlist,
} from "../controllers/wishlistController.js";

const router = express.Router();

// Only hosts can create or edit their own places
router.post("/places", requireAuth, requireHost, createPlace);
router.put("/places/:id", requireAuth, requireHost, editPlace);

// Public routes
router.get("/places", getAllPlaces);
router.get("/places/:id", getPlaceById);

// Only hosts can view their own places
router.get("/user-places", requireAuth, requireHost, getUserPlaces);
router.delete('/places/:id',requireAuth, requireHost, deletePlace);

router.post("/places/:id/toggle-wishlist", requireAuth, toggleWishlist);
router.get("/wishlist", requireAuth, getWishlist);



export default router;
