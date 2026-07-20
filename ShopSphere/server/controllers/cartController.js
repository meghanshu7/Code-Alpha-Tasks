const User = require("../models/User");
const Product = require("../models/Product");

const populateCart = (user) => user.populate("cart.product");

const calculateCart = (cart) => {
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return { subtotal, total: subtotal };
};

const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });
  if (product.stock < quantity) return res.status(400).json({ message: "Insufficient stock" });

  const user = await User.findById(req.user._id);
  const existing = user.cart.find((item) => item.product.toString() === productId);
  if (existing) existing.quantity += Number(quantity);
  else user.cart.push({ product: productId, quantity });
  await user.save();

  await populateCart(user);
  res.json({ cart: user.cart, totals: calculateCart(user.cart) });
};

const getCart = async (req, res) => {
  const user = await User.findById(req.user._id).populate("cart.product");
  res.json({ cart: user.cart, totals: calculateCart(user.cart) });
};

const updateCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const user = await User.findById(req.user._id);
  const item = user.cart.find((cartItem) => cartItem.product.toString() === productId);
  if (!item) return res.status(404).json({ message: "Cart item not found" });
  item.quantity = Math.max(1, Number(quantity));
  await user.save();
  await populateCart(user);
  res.json({ cart: user.cart, totals: calculateCart(user.cart) });
};

const removeFromCart = async (req, res) => {
  const productId = req.body.productId || req.query.productId;
  const user = await User.findById(req.user._id);
  user.cart = user.cart.filter((item) => item.product.toString() !== productId);
  await user.save();
  await populateCart(user);
  res.json({ cart: user.cart, totals: calculateCart(user.cart) });
};

const toggleWishlist = async (req, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.user._id);
  const exists = user.wishlist.some((id) => id.toString() === productId);
  user.wishlist = exists
    ? user.wishlist.filter((id) => id.toString() !== productId)
    : [...user.wishlist, productId];
  await user.save();
  await user.populate("wishlist");
  res.json({ wishlist: user.wishlist });
};

const getWishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  res.json({ wishlist: user.wishlist });
};

module.exports = { addToCart, getCart, updateCart, removeFromCart, toggleWishlist, getWishlist };
