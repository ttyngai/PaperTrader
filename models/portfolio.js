const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema(
  {
    ticker: { type: String, required: true },
    purchasedPrice: {
      type: Number,
      required: true,
    },
    sharesPurchased: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const portfolioSchema = new Schema({
  name: { type: String, required: true },
  capital: { type: Number, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  userAvatar: String,
  transactions: [transactionSchema],
});

module.exports = mongoose.model('portfolios', portfolioSchema);
