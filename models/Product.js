var mongoose = require("mongoose");

var ProductSchema = new mongoose.Schema({
  productTitle: { type: String, required: true },
  manDate: { type: Date },
  expDate: { type: Date },
  color: { type: String },
  imgUrl: { type: String },
  videoUrl: { type: String },
  priceRetail: { type: Number, required: true },
  priceWholesale: { type: Number, required: true },
  barCode: { type: String },
  sku: { type: Number },
  stockLevel: { type: Number },
  size: { type: String },
  weight: { type: String },
  productDesc: { type: String },
  category: [{ type: String }],
  brand: { type: String }
});

module.exports = mongoose.model("Product", ProductSchema);
