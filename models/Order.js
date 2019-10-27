let mongoose = require("mongoose");

var OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userName: String,
  invoiceNumber: String,
  deliveryAddress: String,
  productItems: Object,
  totalAmount: Number,
  paymentChoice: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Order", OrderSchema);
