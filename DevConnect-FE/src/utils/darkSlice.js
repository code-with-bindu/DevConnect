import { createSlice } from "@reduxjs/toolkit";

const saved = localStorage.getItem("dc-dark-mode");
const initialState = { dark: saved === "true" };

if (initialState.dark) {
  document.documentElement.classList.add("dark");
}

const darkSlice = createSlice({
  name: "dark",
  initialState,
  reducers: {
    toggleDark(state) {
      state.dark = !state.dark;
      localStorage.setItem("dc-dark-mode", String(state.dark));
      document.documentElement.classList.toggle("dark", state.dark);
    },
    setDark(state, action) {
      state.dark = action.payload;
      localStorage.setItem("dc-dark-mode", String(state.dark));
      document.documentElement.classList.toggle("dark", state.dark);
    },
  },
});

export const { toggleDark, setDark } = darkSlice.actions;
export default darkSlice.reducer;
