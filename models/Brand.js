var mongoose = require("mongoose");

var BrandSchema = new mongoose.Schema({
  title: String
});

module.exports = mongoose.model("Brand", BrandSchema);
