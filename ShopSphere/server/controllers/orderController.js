const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

const coupons = {
  SAVE20: 0.2,
  WELCOME10: 0.1,
  FREESHIP: 0
};

const placeOrder = async (req, res) => {
  const { shippingAddress, paymentMethod = "COD", coupon } = req.body;
  const user = await User.findById(req.user._id).populate("cart.product");
  if (!user.cart.length) return res.status(400).json({ message: "Cart is empty" });

  const products = user.cart.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    image: item.product.images?.[0],
    price: item.product.price,
    quantity: item.quantity
  }));

  for (const item of user.cart) {
    if (item.product.stock < item.quantity) {
      return res.status(400).json({ message: `${item.product.name} is out of stock` });
    }
  }

  const subtotal = products.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = coupons[coupon] ? subtotal * coupons[coupon] : 0;
  const totalPrice = Math.max(0, subtotal - discount);

  const order = await Order.create({
    user: user._id,
    products,
    totalPrice,
    shippingAddress,
    paymentMethod,
    paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid"
  });

  await Promise.all(
    user.cart.map((item) =>
      Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } })
    )
  );

  user.cart = [];
  await user.save();

  res.status(201).json({
    order,
    emailPreview: `Hello ${user.name}, your order #${order._id} has been placed successfully.`
  });
};

const getOrders = async (req, res) => {
  const query = req.user.role === "admin" ? {} : { user: req.user._id };
  const orders = await Order.find(query).populate("user", "name email").sort("-createdAt");
  res.json({ orders });
};

const getOrderById = async (req, res) => {
  const query = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, user: req.user._id };
  const order = await Order.findOne(query).populate("user", "name email");
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json({ order });
};

const cancelOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (["Shipped", "Out for Delivery", "Delivered"].includes(order.orderStatus)) {
    return res.status(400).json({ message: "Order cannot be cancelled now" });
  }
  order.orderStatus = "Cancelled";
  await order.save();
  await Promise.all(
    order.products.map((item) => Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } }))
  );
  res.json({ order });
};

const updateOrderStatus = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });
  order.orderStatus = req.body.orderStatus || order.orderStatus;
  order.paymentStatus = req.body.paymentStatus || order.paymentStatus;
  await order.save();
  res.json({ order });
};

module.exports = { placeOrder, getOrders, getOrderById, cancelOrder, updateOrderStatus };
