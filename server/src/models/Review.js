const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 }, // Rating between 1 and 5
  review: { type: String, required: true },
  reviewDate: { type: Date, default: Date.now },
  reply: { type: String, default: null }, // Admin reply to the review
  replyDate: { type: Date, default: null } // Date when the reply was made
}, { timestamps: true });

module.exports = mongoose.model("Review", ReviewSchema);
