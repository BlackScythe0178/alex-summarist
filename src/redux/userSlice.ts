import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Plan } from "@/types/book";

export interface UserInfo {
  uid: string;
  email: string | null;
}

interface UserState {
  user: UserInfo | null;
  /** false until Firebase has reported the initial auth state */
  authReady: boolean;
  plan: Plan;
  /** false until the subscription listener has reported for the current user */
  subscriptionReady: boolean;
}

const initialState: UserState = {
  user: null,
  authReady: false,
  plan: "basic",
  subscriptionReady: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserInfo | null>) {
      state.user = action.payload;
      state.authReady = true;
      if (!action.payload) {
        state.plan = "basic";
        state.subscriptionReady = true;
      } else {
        state.subscriptionReady = false;
      }
    },
    setPlan(state, action: PayloadAction<Plan>) {
      state.plan = action.payload;
      state.subscriptionReady = true;
    },
  },
});

export const { setUser, setPlan } = userSlice.actions;
export default userSlice.reducer;
