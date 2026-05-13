const socket = require("socket.io");
const Message = require("../models/message.js");

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: (origin, cb) => cb(null, true),
      credentials: true,
    },
  });

  // Track active users and their socket IDs
  const activeUsers = {};

  io.on("connection", (socket) => {
    /**
     * EVENT: userOnline
     * User registers when they connect
     * WHY: Track who's online for status indicators
     */
    socket.on("userOnline", (userId) => {
      activeUsers[userId] = socket.id;
      io.emit("userStatusUpdate", { userId, status: "online" });
    });

    /**
     * EVENT: joinChat
     * User joins a specific chat room
     * STEP: Generate room ID from sorted user IDs
     */
    socket.on("joinChat", ({ userId, targetUserId }) => {
      const conversationId = [userId, targetUserId].sort().join("_");
      socket.join(conversationId);
    });

    /**
     * EVENT: sendMessage
     * FLOW:
     * 1. Validate message
     * 2. Save to MongoDB (persistence)
     * 3. Emit to room (real-time)
     * WHY BOTH?
     * - Save: User offline? Message waits in DB
     * - Emit: Instant delivery to online users
     */
    socket.on(
      "sendMessage",
      async ({ userId, targetUserId, text, tempMessageId }) => {
        try {
          // Validate empty messages
          if (!text || text.trim().length === 0) {
            socket.emit("error", {
              message: "Cannot send empty message",
            });
            return;
          }

          const conversationId = [userId, targetUserId].sort().join("_");

          // Save message to database
          const newMessage = new Message({
            senderId: userId,
            receiverId: targetUserId,
            conversationId,
            text: text.trim(),
            isRead: false, // New field for unread tracking
          });

          await newMessage.save();

          // Populate sender info for frontend
          await newMessage.populate("senderId", "firstName lastName photoUrl");

          // Prepare message payload
          const messagePayload = {
            _id: newMessage._id,
            tempMessageId, // Include tempId so frontend can match optimistic with real
            senderId: newMessage.senderId,
            text: newMessage.text,
            createdAt: newMessage.createdAt,
            isRead: newMessage.isRead,
          };

          // Emit to SENDER ONLY - confirm message was saved and get real _id
          socket.emit("messageSent", messagePayload);

          // Emit to RECEIVER ONLY (in room) - new message arrived
          socket.broadcast.to(conversationId).emit("messageReceived", messagePayload);

          /**
           * BONUS: Send unread notification to receiver
           * This is for incrementing unread count in real-time
           * Sent regardless of whether receiver is in the room or not
           */
          const receiverSocketId = activeUsers[targetUserId];
          if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessageNotification", {
              senderId: newMessage.senderId._id,
              senderName: newMessage.senderId.firstName,
              senderPhoto: newMessage.senderId.photoUrl,
              lastMessage: text.trim().substring(0, 100),
              conversationId,
            });
          }

          console.log(`Message from ${userId} saved and emitted`);
        } catch (error) {
          console.error("Error saving message:", error);
          socket.emit("error", {
            message: "Failed to send message",
          });
        }
      }
    );

    /**
     * EVENT: leaveChat
     * Clean up when user leaves chat page
     */
    socket.on("leaveChat", ({ userId, targetUserId }) => {
      const conversationId = [userId, targetUserId].sort().join("_");
      socket.leave(conversationId);
      console.log(`User ${userId} left room: ${conversationId}`);
    });

    // EVENT: typing indicator relay
    socket.on("typing", ({ userId, targetUserId, isTyping }) => {
      const conversationId = [userId, targetUserId].sort().join("_");
      socket.to(conversationId).emit("typing", { userId, isTyping });
    });

    // EVENT: client requests current online roster
    socket.on("getOnlineUsers", () => {
      socket.emit("onlineUsers", Object.keys(activeUsers));
    });

    // Project workspace rooms - used for live group chat + task updates.
    // Auth is enforced by the HTTP routes that emit into these rooms.
    socket.on("joinProjectRoom", ({ projectId }) => {
      if (projectId) socket.join(`project:${projectId}`);
    });
    socket.on("leaveProjectRoom", ({ projectId }) => {
      if (projectId) socket.leave(`project:${projectId}`);
    });

    /**
     * EVENT: disconnect
     * Clean up when socket disconnects
     */
    socket.on("disconnect", () => {
      // Remove user from active users
      for (let userId in activeUsers) {
        if (activeUsers[userId] === socket.id) {
          delete activeUsers[userId];
          io.emit("userStatusUpdate", { userId, status: "offline" });
          console.log(`User ${userId} is offline`);
          break;
        }
      }
      console.log("Client disconnected:", socket.id);
    });
  });

  // Helper: emit an event to a specific user (no-op if offline)
  io.emitToUser = (userId, event, data) => {
    const socketId = activeUsers[userId];
    if (socketId) io.to(socketId).emit(event, data);
  };
  io.getActiveUserIds = () => Object.keys(activeUsers);
  return io;
};

module.exports = initializeSocket;
