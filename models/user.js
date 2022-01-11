const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: String,
    googleId: {
      type: String,
      required: true,
    },
    email: String,
    avatar: String,
    // Admin
    isAdmin: { type: Boolean, default: false },
    // Membership
    premium: { type: Boolean, default: false },
    // First time login, for populating watch list
    firstTime: { type: Boolean, default: true },
    chartSettings: {
      timeframe: { type: String, default: '2' },
      volume: { type: Boolean, default: true },
      sma1: { type: Boolean, default: true },
      sma2: { type: Boolean, default: true },
      sma3: { type: Boolean, default: true },
      sma4: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
