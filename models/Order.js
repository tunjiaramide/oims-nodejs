var mongoose = require("mongoose");

var OrderSchema = new mongoose.Schema({
  userName: String,
  deliveryAddress: String,
  productItems: Object,
  totalAmount: Number,
  paymentChoice: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Order", OrderSchema);
