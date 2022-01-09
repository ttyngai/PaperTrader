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
    preferredTimeframe: { type: String, default: '2' },
    volume: { type: Boolean, default: true },
    sma1: { type: Boolean, default: false },
    sma2: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
