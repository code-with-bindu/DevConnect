import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    totalUnread: 0,
    unreadByUser: {}, // userId: count
  },
  reducers: {
    /**
     * Set total unread count and unread by user
     * Called after fetching from API
     */
    setUnreadCount: (state, action) => {
      state.totalUnread = action.payload.totalUnread || 0;
      const unreadByUser = {};
      if (action.payload.conversations && Array.isArray(action.payload.conversations)) {
        action.payload.conversations.forEach((conv) => {
          unreadByUser[conv._id] = conv.unreadCount;
        });
      }
      state.unreadByUser = unreadByUser;
    },

    /**
     * Update unread count for a specific conversation
     * Called when new message arrives via socket
     */
    incrementUnread: (state, action) => {
      const { senderId, count = 1 } = action.payload;
      state.totalUnread += count;
      state.unreadByUser[senderId] = (state.unreadByUser[senderId] || 0) + count;
    },

    /**
     * Clear unread for a conversation
     * Called when user opens a chat
     */
    clearUnread: (state, action) => {
      const { senderId, count = 0 } = action.payload;
      if (state.unreadByUser[senderId]) {
        state.totalUnread -= state.unreadByUser[senderId];
        delete state.unreadByUser[senderId];
      } else {
        state.totalUnread -= count;
      }
      // Ensure totalUnread doesn't go negative
      state.totalUnread = Math.max(0, state.totalUnread);
    },

    /**
     * Reset all unread counts
     * Called on logout
     */
    resetUnread: (state) => {
      state.totalUnread = 0;
      state.unreadByUser = {};
    },
  },
});

export const { setUnreadCount, incrementUnread, clearUnread, resetUnread } =
  notificationSlice.actions;

export default notificationSlice.reducer;
