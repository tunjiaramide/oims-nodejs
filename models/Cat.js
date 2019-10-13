var mongoose = require("mongoose");

var CatSchema = new mongoose.Schema({
  title: String
});

module.exports = mongoose.model("Cat", CatSchema);
