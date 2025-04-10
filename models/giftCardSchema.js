const mongoose = require("mongoose");

// Create a separate schema for gift cards owned
const giftCardSchema = new mongoose.Schema({
  cardId: { type: String, required: true },
  provider: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true, default: 'USD' },
  status: {
    type: String,
    enum: ['active', 'redeemed', 'expired', 'cancelled'],
    default: 'active'
  },
  purchaseDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  runaTransactionId: { type: String },
  redemptionCode: { type: String },
  sentTo: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    phone: { type: String },
    email: { type: String },
    shareLink: { type: String },
    sentDate: { type: Date }
  }
});


const GiftCard = mongoose.model("GiftCard", giftCardSchema);

module.exports = GiftCard;