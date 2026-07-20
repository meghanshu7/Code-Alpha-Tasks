const Product = require("../models/Product");
const Review = require("../models/Review");

const addReview = async (req, res) => {
  const { productId, rating, comment } = req.body;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const review = await Review.findOneAndUpdate(
    { product: productId, user: req.user._id },
    { rating, comment },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  const stats = await Review.aggregate([
    { $match: { product: product._id } },
    { $group: { _id: "$product", average: { $avg: "$rating" }, count: { $sum: 1 } } }
  ]);

  product.rating = stats[0]?.average || 0;
  product.reviews = await Review.find({ product: productId }).distinct("_id");
  await product.save();

  res.status(201).json({ review });
};

const getReviews = async (req, res) => {
  const reviews = await Review.find({ product: req.params.id })
    .populate("user", "name")
    .sort("-createdAt");
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((review) => review.rating === star).length
  }));
  res.json({ reviews, distribution });
};

module.exports = { addReview, getReviews };
