const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+\@.+\..+/, "Please fill a valid email address"],
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  verificationCode: {
    type: Number, // Store the 6-digit verification code temporarily
    required: function () {
      return !this.isVerified;
    },
  },
  isVerified: {
    type: Boolean,
    default: false, // Initially set to false
  },
  // Additional profile fields
  phoneNumber: {
    type: String,
    default: null, // or set required if necessary
  },
  city: {
    type: String,
    default: null,
  },
  bio: {
    type: String,
    default: null,
  },
  dateOfBirth: {
    type: Date,
    default: null,
  },
  job: {
    type: String,
    default: null,
  },
  age: {
    type: Number,
    default: null,
  },
  imageUrl: {
    type: String,
    default: null, // Optional, if image is not mandatory
  },
  likedPosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  notifications: [
    {
      message: { type: String },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});
userSchema.methods.clearVerificationCode = function () {
  this.verificationCode = null; // Clear it after verification
};

const User = mongoose.model("User", userSchema);

module.exports = User;
