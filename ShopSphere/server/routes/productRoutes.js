const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getSuggestions
} = require("../controllers/productController");
const { protect, adminOnly } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

router.get("/products", getProducts);
router.get("/products/suggestions", getSuggestions);
router.get("/product/:id", getProductById);
router.post("/product", protect, adminOnly, upload.array("images", 5), createProduct);
router.put("/product/:id", protect, adminOnly, upload.array("images", 5), updateProduct);
router.delete("/product/:id", protect, adminOnly, deleteProduct);

module.exports = router;
