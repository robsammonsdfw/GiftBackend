const mongoose = require("mongoose");


const transactionSchema = new mongoose.Schema({
    type: {
      type: String,
      enum: ['deposit', 'withdrawal', 'gift_card_purchase', 'gift_card_received'],
      required: true
    },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'USD' },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending'
    },
    timestamp: { type: Date, default: Date.now },
    description: { type: String },
    reference: { type: String },
    giftCard: { type: mongoose.Schema.Types.ObjectId, ref: 'GiftCard' },
    relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  });
  
  const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;