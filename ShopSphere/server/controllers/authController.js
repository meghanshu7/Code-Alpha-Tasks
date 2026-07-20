const { validationResult } = require("express-validator");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const sendToken = (user, statusCode, res) => {
  const token = generateToken(user._id);
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  res.status(statusCode).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      address: user.address,
      wishlist: user.wishlist,
      cart: user.cart
    }
  });
};

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password, phone } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: "Email already registered" });

  const user = await User.create({ name, email, password, phone });
  sendToken(user, 201, res);
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  sendToken(user, 200, res);
};

const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

const getProfile = async (req, res) => {
  res.json({ user: req.user });
};

const updateProfile = async (req, res) => {
  const { name, phone, address } = req.body;
  const user = await User.findById(req.user._id);
  user.name = name ?? user.name;
  user.phone = phone ?? user.phone;
  user.address = address ?? user.address;
  await user.save();
  res.json({ user });
};

const getUsers = async (req, res) => {
  const users = await User.find().select("-password").sort("-createdAt");
  res.json({ users });
};

module.exports = { register, login, logout, getProfile, updateProfile, getUsers };
