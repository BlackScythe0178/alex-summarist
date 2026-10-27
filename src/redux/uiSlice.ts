import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  sidebarOpen: boolean;
  /** Summary font size on the player page (px) */
  fontSize: number;
}

const initialState: UiState = { sidebarOpen: false, fontSize: 16 };

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    closeSidebar(state) {
      state.sidebarOpen = false;
    },
    setFontSize(state, action: PayloadAction<number>) {
      state.fontSize = action.payload;
    },
  },
});

export const { toggleSidebar, closeSidebar, setFontSize } = uiSlice.actions;
export default uiSlice.reducer;
