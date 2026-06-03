import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Podcast } from "@/types/podcast";

export interface PlayerState {
  currentEpisode: Podcast | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  playbackRate: number;
  showMiniPlayer: boolean;
}

const initialState: PlayerState = {
  currentEpisode: null,
  isPlaying: false,
  progress: 0,
  duration: 0,
  volume: 1,
  playbackRate: 1,
  showMiniPlayer: false,
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setEpisode(state, action: PayloadAction<Podcast | null>) {
      state.currentEpisode = action.payload;
      state.progress = 0;
      state.duration = 0;
      state.isPlaying = Boolean(action.payload);
      state.showMiniPlayer = false;
    },
    play(state) {
      if (state.currentEpisode) state.isPlaying = true;
    },
    pause(state) {
      state.isPlaying = false;
    },
    seek(state, action: PayloadAction<number>) {
      state.progress = Math.max(0, action.payload);
    },
    setDuration(state, action: PayloadAction<number>) {
      state.duration = Math.max(0, action.payload);
    },
    setVolume(state, action: PayloadAction<number>) {
      state.volume = Math.min(1, Math.max(0, action.payload));
    },
    setPlaybackRate(state, action: PayloadAction<number>) {
      state.playbackRate = action.payload;
    },
    setShowMiniPlayer(state, action: PayloadAction<boolean>) {
      state.showMiniPlayer = action.payload;
    },
    clearEpisode(state) {
      state.currentEpisode = null;
      state.isPlaying = false;
      state.progress = 0;
      state.duration = 0;
      state.showMiniPlayer = false;
    },
  },
});

export const {
  setEpisode,
  play,
  pause,
  seek,
  setDuration,
  setVolume,
  setPlaybackRate,
  setShowMiniPlayer,
  clearEpisode,
} = playerSlice.actions;

export default playerSlice.reducer;
