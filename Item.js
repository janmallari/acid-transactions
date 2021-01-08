const mongoose = require('mongoose');
const { updateIfCurrentPlugin } = require('mongoose-update-if-current');

const itemSchema = new mongoose.Schema({
  name: String,
  qty: Number,
});

itemSchema.plugin(updateIfCurrentPlugin);

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
