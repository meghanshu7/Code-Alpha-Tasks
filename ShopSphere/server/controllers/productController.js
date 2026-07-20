const Product = require("../models/Product");
const Review = require("../models/Review");

const buildProductQuery = (query) => {
  const filter = {};
  if (query.search) filter.$text = { $search: query.search };
  if (query.category) filter.category = query.category;
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }
  return filter;
};

const getProducts = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 12, 50);
  const skip = (page - 1) * limit;
  const filter = buildProductQuery(req.query);

  const sortMap = {
    newest: "-createdAt",
    price_asc: "price",
    price_desc: "-price",
    rating: "-rating",
    popular: "-trending -rating"
  };

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sortMap[req.query.sort] || "-createdAt").skip(skip).limit(limit),
    Product.countDocuments(filter)
  ]);

  res.json({
    products,
    pagination: {
      page,
      pages: Math.ceil(total / limit),
      total
    }
  });
};

const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id).populate({
    path: "reviews",
    populate: { path: "user", select: "name" }
  });
  if (!product) return res.status(404).json({ message: "Product not found" });

  const related = await Product.find({
    _id: { $ne: product._id },
    category: product.category
  }).limit(4);

  res.json({ product, related });
};

const createProduct = async (req, res) => {
  const imageFiles = req.files?.map((file) => `/uploads/${file.filename}`) || [];
  const product = await Product.create({
    ...req.body,
    images: imageFiles.length ? imageFiles : req.body.images,
    featured: req.body.featured === "true" || req.body.featured === true,
    trending: req.body.trending === "true" || req.body.trending === true
  });
  res.status(201).json({ product });
};

const updateProduct = async (req, res) => {
  const imageFiles = req.files?.map((file) => `/uploads/${file.filename}`) || [];
  const updates = { ...req.body };
  if (imageFiles.length) updates.images = imageFiles;
  const product = await Product.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ product });
};

const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  await Review.deleteMany({ product: product._id });
  res.json({ message: "Product deleted" });
};

const getSuggestions = async (req, res) => {
  const search = req.query.q || "";
  const products = await Product.find({ name: { $regex: search, $options: "i" } })
    .select("name category")
    .limit(8);
  res.json({ suggestions: products });
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getSuggestions
};
