import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Theme } from "@/lib/theme";

export type Language = "ar" | "en";

interface UiState {
  theme: Theme;
  language: Language;
  mobileDrawerOpen: boolean;
}

const getInitialLanguage = (): Language => {
  const stored = localStorage.getItem("lang");
  if (stored === "ar" || stored === "en") return stored;
  return "ar";
};

const getInitialTheme = (): Theme => "light";

const initialState: UiState = {
  theme: getInitialTheme(),
  language: getInitialLanguage(),
  mobileDrawerOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTheme(state) {
      state.theme = "light";
    },
    setLanguage(state, action: PayloadAction<Language>) {
      state.language = action.payload;
    },
    setMobileDrawerOpen(state, action: PayloadAction<boolean>) {
      state.mobileDrawerOpen = action.payload;
    },
  },
});

export const { setTheme, setLanguage, setMobileDrawerOpen } = uiSlice.actions;
export default uiSlice.reducer;
