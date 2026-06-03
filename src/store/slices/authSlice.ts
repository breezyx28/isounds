import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type AuthStatus = "guest" | "checking" | "subscribed" | "expired";

export interface AuthUser {
  token: string;
  msisdn?: string;
}

export interface SubscriberInfo {
  active?: boolean;
  raw?: unknown;
}

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  msisdn: string | null;
  subscriberInfo: SubscriberInfo | null;
  lastError: string | null;
}

const initialState: AuthState = {
  status: "guest",
  user: null,
  msisdn: null,
  subscriberInfo: null,
  lastError: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setChecking(state) {
      state.status = "checking";
      state.lastError = null;
    },
    setGuest(state, action: PayloadAction<{ error?: string } | undefined>) {
      state.status = "guest";
      state.user = null;
      state.subscriberInfo = null;
      state.lastError = action.payload?.error ?? null;
    },
    setSubscribed(
      state,
      action: PayloadAction<{
        user: AuthUser;
        msisdn?: string | null;
        subscriberInfo?: SubscriberInfo | null;
      }>,
    ) {
      state.status = "subscribed";
      state.user = action.payload.user;
      state.msisdn = action.payload.msisdn ?? action.payload.user.msisdn ?? null;
      state.subscriberInfo = action.payload.subscriberInfo ?? null;
      state.lastError = null;
    },
    setExpired(state, action: PayloadAction<{ error?: string } | undefined>) {
      state.status = "expired";
      state.lastError = action.payload?.error ?? null;
    },
    setAuthStatus(state, action: PayloadAction<AuthStatus>) {
      state.status = action.payload;
      if (action.payload !== "expired") state.lastError = null;
    },
    setMsisdn(state, action: PayloadAction<string | null>) {
      state.msisdn = action.payload;
    },
    setSubscriberInfo(state, action: PayloadAction<SubscriberInfo | null>) {
      state.subscriberInfo = action.payload;
    },
    setAuthUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
      state.status = action.payload?.token ? "subscribed" : "guest";
      if (action.payload?.msisdn) state.msisdn = action.payload.msisdn;
      if (!action.payload) state.subscriberInfo = null;
      state.lastError = null;
    },
    clearAuth(state) {
      state.user = null;
      state.status = "guest";
      state.msisdn = null;
      state.subscriberInfo = null;
      state.lastError = null;
    },
  },
});

export const {
  setChecking,
  setGuest,
  setSubscribed,
  setExpired,
  setAuthStatus,
  setMsisdn,
  setSubscriberInfo,
  setAuthUser,
  clearAuth,
} = authSlice.actions;
export default authSlice.reducer;
