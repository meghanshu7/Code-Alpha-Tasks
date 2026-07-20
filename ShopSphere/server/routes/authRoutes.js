const express = require("express");
const { body } = require("express-validator");
const {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  getUsers
} = require("../controllers/authController");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("phone").optional().isLength({ min: 7 }).withMessage("Phone number is too short")
  ],
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required")
  ],
  login
);

router.get("/logout", logout);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.get("/users", protect, adminOnly, getUsers);

module.exports = router;
