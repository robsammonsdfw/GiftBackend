const mongoose = require("mongoose");
const giftCardSchema = require('./giftCardSchema')
const transactionSchema =   require('./transactionSchema')

const userSchema = new mongoose.Schema({
    // Basic Information
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3
    },
    bio: { 
      type: String,
      maxlength: 500 
    },
    password: { 
      type: String, 
      required: true 
    },
    profileImage: { 
      type: String,
      required: true 
    },
    phoneNumber: {
      type: String,
      unique: true,
      sparse: true // Allows null/undefined values to not trigger unique constraint
    },
  
    // Account Status and Verification
    verified: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isPhoneVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationCode: {
      code: String,
      expiresAt: Date
    },
    phoneVerificationCode: {
      code: String,
      expiresAt: Date
    },
    verificationToken: {
      token: String,
      createdAt: Date
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  
    // Financial Information
    wallet: {
      balance: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
      lastUpdated: { type: Date, default: Date.now }
    },
    runaCustomerId: { type: String }, // Store Runa.io customer ID
    paymentMethods: [{
      type: { type: String, enum: ['card', 'bank_account'] },
      isDefault: { type: Boolean, default: false },
      lastFour: String,
      provider: String,
      token: String
    }],
  
  
    
    notificationPreferences: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: true }
    },
    fcmToken: {
      type: String,
      default: null,
    },
  
    // Administrative
    role: {
      type: String,
      enum: ['user', 'admin', 'superadmin'],
      default: 'user',
    },
    age: {
      type: Date, // Store date of birth
      required: true,
    },
    joinedDate: { 
      type: Date, 
      default: Date.now 
    },
    lastActive: { 
      type: Date, 
      default: Date.now 
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'deactivated'],
      default: 'active'
    }
  }, {
    timestamps: true
  });
  
  // Indexes for better query performance
const User = mongoose.model("User", userSchema);

module.exports = User;