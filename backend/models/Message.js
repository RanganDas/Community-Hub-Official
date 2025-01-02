const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    chatId: { type: String, required: true }, // A unique identifier for each conversation
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', MessageSchema);
