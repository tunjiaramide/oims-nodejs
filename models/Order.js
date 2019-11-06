let mongoose = require("mongoose");

var OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userName: String,
  deliveryAddress: String,
  productItems: Object,
  totalAmount: Number,
  invNumb: {
    type: String,
    default: 100
  },
  paymentChoice: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Order", OrderSchema);
