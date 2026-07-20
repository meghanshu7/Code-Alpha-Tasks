const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ["Laptop", "Shoes", "Watch", "Clothes", "Phone", "Accessories"]
    },
    stock: { type: Number, required: true, min: 0 },
    images: [{ type: String }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
    brand: { type: String, trim: true },
    discount: { type: Number, default: 0, min: 0, max: 90 },
    featured: { type: Boolean, default: false },
    trending: { type: Boolean, default: false }
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text", brand: "text", category: "text" });

module.exports = mongoose.model("Product", productSchema);
