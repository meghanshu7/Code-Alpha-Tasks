const express = require("express");
const { addReview, getReviews } = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/review", protect, addReview);
router.get("/review/:id", getReviews);

module.exports = router;
