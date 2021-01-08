const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/acid-test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

// db.on('error', console.error.bind(console, 'connection error:'));

// db.once('open', function () {
//   console.log('Connected...');
// });

const itemSchema = new mongoose.Schema({
  name: String,
  qty: Number,
});

const Item = mongoose.model('Item', itemSchema);

const newItem = new Item({ name: 'Ruler', qty: 2 });

newItem.save();
