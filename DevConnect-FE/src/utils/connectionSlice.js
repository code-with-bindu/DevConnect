import { createSlice } from "@reduxjs/toolkit";

const connectionSlice = createSlice({
  name: "connections",
  initialState: null,
  reducers: {
    addConnections: (state, action) => {
      return action.payload;
    },
    removeConnections: () => null,
    removeConnection: (state, action) => {
      if (!Array.isArray(state)) return state;
      return state.filter((c) => c._id !== action.payload);
    },
  },
});

export const { addConnections, removeConnections, removeConnection } =
  connectionSlice.actions;
export default connectionSlice.reducer;
