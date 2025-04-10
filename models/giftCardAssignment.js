const mongoose = require('mongoose');

const GiftCardAssignmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    giftCardPlatform: { type: String, enum: ['tremendous', 'tango', 'existing', 'admin_upload'], required: true },
    giftCardId: { type: String, required: true }, // ID from the gift card platform
    redemptionCode: String,
    amount: Number,
    status: { type: String, default: 'pending' }, // e.g., pending, assigned, sent, redeemed
    assignedDate: { type: Date, default: Date.now },
    notes: String,
    // Add other relevant fields as needed
});

const GiftCardAssignment = mongoose.model('GiftCardAssignment', GiftCardAssignmentSchema);

module.exports = GiftCardAssignment;