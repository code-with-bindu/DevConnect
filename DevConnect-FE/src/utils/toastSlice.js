import { createSlice } from "@reduxjs/toolkit";

let nextId = 1;

const toastSlice = createSlice({
  name: "toast",
  initialState: { items: [] },
  reducers: {
    pushToast: {
      reducer: (state, action) => {
        state.items.push(action.payload);
        if (state.items.length > 5) state.items.shift();
      },
      prepare: (toast) => ({
        payload: { id: nextId++, createdAt: Date.now(), ...toast },
      }),
    },
    dismissToast: (state, action) => {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
  },
});

export const { pushToast, dismissToast } = toastSlice.actions;
export default toastSlice.reducer;
