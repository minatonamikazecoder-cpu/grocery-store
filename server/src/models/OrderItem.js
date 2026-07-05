const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: mongoose.Schema.Types.Decimal128, required: true },
  discount: { type: mongoose.Schema.Types.Decimal128, default: 0 }
});

module.exports = mongoose.model("OrderItem", OrderItemSchema);
