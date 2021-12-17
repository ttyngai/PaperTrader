const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema(
  {
    ticker: { type: String, required: true },

    shares: { type: Number, required: true },
    // portfolio: { type: String, required: true },
    price: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const portfolioSchema = new Schema({
  name: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  userAvatar: String,
  transactions: [transactionSchema],
});

module.exports = mongoose.model('portfolios', portfolioSchema);
