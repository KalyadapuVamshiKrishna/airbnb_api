import Place from "../models/Place.js";
import User from "../models/User.js";

export const toggleWishlist = async (req, res) => {
  try {
    const { id: placeId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    const idx = user.wishlist.findIndex(
      (p) => p.toString() === placeId.toString()
    );

    let isFavorite;
    if (idx > -1) {
      // remove
      user.wishlist.splice(idx, 1);
      await user.save();
      isFavorite = false;
    } else {
      // add
      user.wishlist.push(placeId);
      await user.save();
      isFavorite = true;
    }

    // Return standardized response: isFavorite (for the toggled place) + current wishlist
    return res.json({
      message: isFavorite ? "Added to wishlist" : "Removed from wishlist",
      placeId,
      isFavorite,
      wishlist: user.wishlist.map((id) => id.toString()),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const getPlacesWithWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch all places
    const places = await Place.find();

    // Mark isFavorite based on user's wishlist
    const wishlistSet = new Set(user.wishlist.map((id) => id.toString()));

    const placesWithFlag = places.map((place) => ({
      ...place.toObject(),
      isFavorite: wishlistSet.has(place._id.toString()),
    }));

    res.json(placesWithFlag);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("wishlist");
    if (!user) return res.status(404).json({ message: "User not found" });

    const wishlistPlaces = user.wishlist.map((place) => ({
      ...place.toObject(),
      isFavorite: true, 
    }));

    res.json(wishlistPlaces);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
