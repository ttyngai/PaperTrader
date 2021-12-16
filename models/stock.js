const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stocksSchema = new Schema({
  ticker: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  userAvatar: String,
});

module.exports = mongoose.model('stocks', stocksSchema);
