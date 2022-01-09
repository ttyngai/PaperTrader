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
    // Membership
    premium: { type: Boolean, default: false },
    // First time login, for populating watch list
    firstTime: { type: Boolean, default: true },
    preferredTimeframe: { type: String, default: '2' },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
