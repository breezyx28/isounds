import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";
import { zoalcastApi } from "./api";
import { localApi } from "./localApi";
import playerReducer from "@/features/player/playerSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    player: playerReducer,
    [zoalcastApi.reducerPath]: zoalcastApi.reducer,
    [localApi.reducerPath]: localApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      zoalcastApi.middleware,
      localApi.middleware,
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
