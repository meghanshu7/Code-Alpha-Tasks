const express = require("express");
const {
  addToCart,
  getCart,
  updateCart,
  removeFromCart,
  toggleWishlist,
  getWishlist
} = require("../controllers/cartController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/cart/add", protect, addToCart);
router.get("/cart", protect, getCart);
router.put("/cart/update", protect, updateCart);
router.delete("/cart/remove", protect, removeFromCart);
router.post("/wishlist", protect, toggleWishlist);
router.get("/wishlist", protect, getWishlist);

module.exports = router;
