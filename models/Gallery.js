var mongoose = require("mongoose");

var GallerySchema = new mongoose.Schema({
  imgUrl: String
});

module.exports = mongoose.model("Gallery", GallerySchema);
