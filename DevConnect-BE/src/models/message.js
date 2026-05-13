const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    conversationId: {
      type: String,
      required: true,
      // Format: "user1Id_user2Id" (sorted alphabetically)
    },
    text: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 5000,
    },
    readAt: {
      type: Date,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false, // Messages start as unread
      index: true, // Index for fast queries on unread messages
    },
  },
  { timestamps: true }
);

// Index for efficient querying
// When we search for messages between two users, this index is crucial
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ receiverId: 1, isRead: 1 }); // For finding unread messages
messageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // Optional: auto-delete after 30 days

const messageModel = new mongoose.model("Message", messageSchema);

module.exports = messageModel;
