const mongoose = require("mongoose");

const moviesSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  favourites: { type: Array },
  watchLater: { type: Array }
});

module.exports = mongoose.model("MovieDb", moviesSchema);
