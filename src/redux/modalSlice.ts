import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type AuthView = "login" | "signup" | "forgot";

interface ModalState {
  isOpen: boolean;
  view: AuthView;
}

const initialState: ModalState = { isOpen: false, view: "login" };

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openAuthModal(state, action: PayloadAction<AuthView | undefined>) {
      state.isOpen = true;
      state.view = action.payload ?? "login";
    },
    closeAuthModal(state) {
      state.isOpen = false;
    },
    setAuthView(state, action: PayloadAction<AuthView>) {
      state.view = action.payload;
    },
  },
});

export const { openAuthModal, closeAuthModal, setAuthView } = modalSlice.actions;
export default modalSlice.reducer;
