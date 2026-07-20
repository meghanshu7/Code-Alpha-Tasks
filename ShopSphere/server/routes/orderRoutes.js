const express = require("express");
const {
  placeOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus
} = require("../controllers/orderController");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.post("/order", protect, placeOrder);
router.get("/orders", protect, getOrders);
router.get("/order/:id", protect, getOrderById);
router.put("/order/:id/cancel", protect, cancelOrder);
router.put("/order/:id/status", protect, adminOnly, updateOrderStatus);

module.exports = router;
