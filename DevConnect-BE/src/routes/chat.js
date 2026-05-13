const express = require("express");
const { userAuth } = require("../middlewares/auth.js");
const Message = require("../models/message.js");
const router = express.Router();

/**
 * GET /chat/messages/:userId
 * Fetch chat history between current user and another user
 *
 * WHY THIS ENDPOINT?
 * - When chat page opens, need to load previous messages from DB
 * - Socket.io only sends real-time messages (won't catch old ones)
 * - Pagination: load 50 messages at a time
 *
 * USAGE:
 * GET /chat/messages/60d5ec49c1234567890abcde?limit=50&skip=0
 * Returns: Array of messages sorted by time
 */
router.get("/chat/messages/:userId", userAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, skip = 0 } = req.query;
    const currentUserId = req.user._id;

    // Generate room ID (must match socket.io logic)
    const conversationId = [currentUserId, userId].sort().join("_");

    // Fetch messages
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 }) // Most recent first
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate("senderId", "firstName lastName photoUrl")
      .populate("receiverId", "firstName lastName photoUrl");

    // Reverse to show oldest to newest (for UI display)
    messages.reverse();

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /chat/conversations
 * List all conversations (optional, for chat list UI)
 * Shows last message from each conversation
 */
router.get("/chat/conversations", userAuth, async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Find unique conversations for this user
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: currentUserId },
            { receiverId: currentUserId },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$conversationId",
          lastMessage: { $first: "$text" },
          lastMessageTime: { $first: "$createdAt" },
          otherUserId: {
            $first: {
              $cond: [
                { $eq: ["$senderId", currentUserId] },
                "$receiverId",
                "$senderId",
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "otherUserId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $sort: { lastMessageTime: -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /chat/unread-count
 * Get total count of unread messages for current user
 * 
 * WHY NEEDED?
 * - Show badge on navbar (e.g., 🔴 5)
 * - User can see at a glance if they have new messages
 * 
 * RESPONSE:
 * { totalUnread: 5, conversations: [ { _id: convid, unreadCount: 2, ... } ] }
 */
router.get("/chat/unread-count", userAuth, async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Find all unread messages for this user
    const unreadMessages = await Message.aggregate([
      {
        $match: {
          receiverId: currentUserId,
          isRead: false,
        },
      },
      {
        $group: {
          _id: "$conversationId",
          unreadCount: { $sum: 1 },
          lastMessage: { $first: "$text" },
          lastMessageTime: { $first: "$createdAt" },
          senderId: { $first: "$senderId" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "senderId",
          foreignField: "_id",
          as: "senderInfo",
        },
      },
      {
        $unwind: {
          path: "$senderInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: { lastMessageTime: -1 },
      },
    ]);

    const totalUnread = unreadMessages.reduce(
      (sum, conv) => sum + conv.unreadCount,
      0
    );

    res.status(200).json({
      success: true,
      data: {
        totalUnread,
        conversations: unreadMessages,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * PUT /chat/mark-as-read/:conversationId
 * Mark all messages in a conversation as read
 * 
 * WHY NEEDED?
 * - When user opens a chat, mark those messages as read
 * - Update unread count instantly
 * 
 * CALLED WHEN:
 * - User opens Chat component
 * - User scrolls and sees old messages
 */
router.put("/chat/mark-as-read/:conversationId", userAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user._id;

    // Mark all unread messages as read
    const result = await Message.updateMany(
      {
        conversationId,
        receiverId: currentUserId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    res.status(200).json({
      success: true,
      message: `Marked ${result.modifiedCount} messages as read`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /chat/unread-per-user
 * Get unread count grouped by sender
 * Shows which users have unread messages
 * 
 * RESPONSE:
 * [ { userId: id, userName: "John", unreadCount: 3 }, ... ]
 */
router.get("/chat/unread-per-user", userAuth, async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Get unread count per user
    const unreadByUser = await Message.aggregate([
      {
        $match: {
          receiverId: currentUserId,
          isRead: false,
        },
      },
      {
        $group: {
          _id: "$senderId",
          unreadCount: { $sum: 1 },
          lastMessage: { $first: "$text" },
          lastMessageTime: { $max: "$createdAt" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $unwind: {
          path: "$userInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          userId: "$_id",
          userName: "$userInfo.firstName",
          userPhoto: "$userInfo.photoUrl",
          unreadCount: 1,
          lastMessage: 1,
          lastMessageTime: 1,
        },
      },
      {
        $sort: { lastMessageTime: -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: unreadByUser,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
