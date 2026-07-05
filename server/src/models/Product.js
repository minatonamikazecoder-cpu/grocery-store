const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },
  productName: { type: String, required: true },
  description: { type: String, required: true },
  productImage: { type: String, required: true },
  salePrice: { type: Number, required: true },
  costPrice: { type: Number, required: true },
  discount: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Product", ProductSchema);
