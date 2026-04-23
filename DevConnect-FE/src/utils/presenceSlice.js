import { createSlice } from "@reduxjs/toolkit";

const presenceSlice = createSlice({
  name: "presence",
  initialState: { onlineIds: [] },
  reducers: {
    setOnlineUsers: (state, action) => {
      state.onlineIds = Array.from(new Set(action.payload || []));
    },
    setUserOnline: (state, action) => {
      const id = action.payload;
      if (id && !state.onlineIds.includes(id)) state.onlineIds.push(id);
    },
    setUserOffline: (state, action) => {
      state.onlineIds = state.onlineIds.filter((id) => id !== action.payload);
    },
  },
});

export const { setOnlineUsers, setUserOnline, setUserOffline } =
  presenceSlice.actions;
export default presenceSlice.reducer;
