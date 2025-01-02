// models/Post.js
const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  hashtags: {
    type: [String],
    required: false, // Optional, if you want hashtags to be optional
  },
  location: {
    type: String,
    required: false,
  },
  imageUrl: {
    type: String,
    required: false, // Optional, if image is not mandatory
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // Assuming each post is linked to a user
  },
  user: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
   },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  likes: { 
    type: Number,
    default: 0 },

  favoritesCount: {
      type: Number,
      default: 0,
    },
});

module.exports = mongoose.model("Post", PostSchema);
