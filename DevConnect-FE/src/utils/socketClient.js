import io from "socket.io-client";
import { BASE_URL } from "./constants";

/**
 * Socket Connection Utility
 * 
 * WHY SEPARATE FILE?
 * - Centralize socket logic
 * - Easy to test and debug
 * - Reusable across components
 * - Can be enhanced with reconnection logic
 */

let socket = null;

/**
 * Initialize socket connection
 * Called once when user logs in
 */
export const initializeSocket = (userId) => {
  if (socket && socket.connected) {
    console.log("Socket already connected");
    return socket;
  }

  // Connect to current origin; vite proxies /socket.io -> backend in dev,
  // and the same-origin in production assumes the API is served alongside.
  socket = io({
    path: "/socket.io",
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
    // Notify server user is online
    socket.emit("userOnline", userId);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  return socket;
};

/**
 * Get existing socket instance
 */
export const getSocket = () => {
  return socket;
};

/**
 * Join a chat room
 * Called when user opens chat with another user
 */
export const joinChat = (userId, targetUserId) => {
  if (socket) {
    socket.emit("joinChat", { userId, targetUserId });
  }
};

/**
 * Send message to another user
 * Emits to server which saves to DB and broadcasts
 * Now includes tempMessageId for deduplication
 */
export const sendMessage = (userId, targetUserId, text, tempMessageId) => {
  if (socket) {
    socket.emit("sendMessage", { userId, targetUserId, text, tempMessageId });
  }
};

/**
 * Leave chat room
 * Called when user navigates away from chat
 */
export const leaveChat = (userId, targetUserId) => {
  if (socket) {
    socket.emit("leaveChat", { userId, targetUserId });
  }
};

/**
 * Listen for confirmation that message was sent (only sender receives)
 * Set up in Chat component to handle messageSent event
 */
export const onMessageSent = (callback) => {
  if (socket) {
    socket.on("messageSent", callback);
  }
};

/**
 * Remove message sent listener (cleanup)
 */
export const offMessageSent = () => {
  if (socket) {
    socket.off("messageSent");
  }
};

/**
 * Listen for incoming messages
 * Set up in Chat component
 */
export const onMessageReceived = (callback) => {
  if (socket) {
    socket.on("messageReceived", callback);
  }
};

/**
 * Remove message listener (cleanup)
 */
export const offMessageReceived = () => {
  if (socket) {
    socket.off("messageReceived");
  }
};

/**
 * Listen for user status updates (optional)
 */
export const onUserStatusUpdate = (callback) => {
  if (socket) {
    socket.on("userStatusUpdate", callback);
  }
};

/**
 * Listen for new message notifications (for unread count increment)
 * Fires when a message arrives from ANY sender, even if not in that chat
 * Used for real-time unread count updates
 */
export const onNewMessageNotification = (callback) => {
  if (socket) {
    socket.on("newMessageNotification", callback);
  }
};

/**
 * Remove new message notification listener (cleanup)
 */
export const offNewMessageNotification = () => {
  if (socket) {
    socket.off("newMessageNotification");
  }
};

/**
 * Ask the server for the current online roster (called once on connect)
 */
export const requestOnlineUsers = () => {
  if (socket) socket.emit("getOnlineUsers");
};
export const onOnlineUsers = (cb) => socket && socket.on("onlineUsers", cb);
export const offOnlineUsers = () => socket && socket.off("onlineUsers");

/**
 * Typing indicator helpers
 */
export const emitTyping = (userId, targetUserId, isTyping) => {
  if (socket) socket.emit("typing", { userId, targetUserId, isTyping });
};
export const onTyping = (cb) => socket && socket.on("typing", cb);
export const offTyping = () => socket && socket.off("typing");

/**
 * Project real-time event helpers
 */
export const onProjectActivity = (cb) =>
  socket && socket.on("projectActivity", cb);
export const offProjectActivity = () =>
  socket && socket.off("projectActivity");

export const onProjectInterest = (cb) =>
  socket && socket.on("projectInterest", cb);
export const offProjectInterest = () =>
  socket && socket.off("projectInterest");

export const onProjectDecision = (cb) =>
  socket && socket.on("projectDecision", cb);
export const offProjectDecision = () =>
  socket && socket.off("projectDecision");

/**
 * Connection request real-time event helpers
 */
export const onConnectionRequestNew = (cb) =>
  socket && socket.on("connectionRequestNew", cb);
export const offConnectionRequestNew = () =>
  socket && socket.off("connectionRequestNew");

export const onConnectionRequestDecision = (cb) =>
  socket && socket.on("connectionRequestDecision", cb);
export const offConnectionRequestDecision = () =>
  socket && socket.off("connectionRequestDecision");

export const offUserStatusUpdate = () =>
  socket && socket.off("userStatusUpdate");

/**
 * Project workspace room — for live group chat + task updates
 */
export const joinProjectRoom = (projectId) => {
  if (socket) socket.emit("joinProjectRoom", { projectId });
};
export const leaveProjectRoom = (projectId) => {
  if (socket) socket.emit("leaveProjectRoom", { projectId });
};

export const onProjectChatMessage = (cb) =>
  socket && socket.on("projectChatMessage", cb);
export const offProjectChatMessage = () =>
  socket && socket.off("projectChatMessage");

export const onProjectChatNotification = (cb) =>
  socket && socket.on("projectChatNotification", cb);
export const offProjectChatNotification = () =>
  socket && socket.off("projectChatNotification");

export const onProjectTaskAdded = (cb) =>
  socket && socket.on("projectTaskAdded", cb);
export const offProjectTaskAdded = () =>
  socket && socket.off("projectTaskAdded");

export const onProjectTaskUpdated = (cb) =>
  socket && socket.on("projectTaskUpdated", cb);
export const offProjectTaskUpdated = () =>
  socket && socket.off("projectTaskUpdated");

export const onProjectTaskDeleted = (cb) =>
  socket && socket.on("projectTaskDeleted", cb);
export const offProjectTaskDeleted = () =>
  socket && socket.off("projectTaskDeleted");

/**
 * Disconnect socket
 * Called when user logs out
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
