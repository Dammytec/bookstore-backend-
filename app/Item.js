const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  price: Number,
  image: String
});

const Item = mongoose.model("Item", ItemSchema);

module.exports = Item;
