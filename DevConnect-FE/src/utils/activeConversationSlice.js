import { createSlice } from "@reduxjs/toolkit";

/**
 * Active Conversation Slice
 * 
 * Tracks which conversation/user is currently open in Chat.jsx
 * Used to determine if new messages should increment unread count
 * 
 * LOGIC:
 * - When Chat.jsx mounts with userId, set it as active
 * - When Chat.jsx unmounts, clear active conversation
 * - When new message arrives, check if it's from active conversation
 * - If NOT active, increment unread count
 * - If active, DON'T increment (will be marked as read)
 */

const activeConversationSlice = createSlice({
  name: "activeConversation",
  initialState: {
    userId: null, // ID of user we're currently chatting with
  },
  reducers: {
    setActiveConversation: (state, action) => {
      state.userId = action.payload; // Set to userId or null
    },
    clearActiveConversation: (state) => {
      state.userId = null;
    },
  },
});

export const { setActiveConversation, clearActiveConversation } =
  activeConversationSlice.actions;
export default activeConversationSlice.reducer;
