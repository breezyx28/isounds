import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearEpisode,
  pause,
  play,
  prepareEpisode,
  seek,
  setEpisode,
  setPlaybackRate,
  setShowMiniPlayer,
  setVolume,
  selectPlayerProgress,
  selectPlayerTransport,
} from "./playerSlice";
import type { Podcast } from "@/types/podcast";

export function usePlayer() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const player = useAppSelector((state) => state.player);

  const openEpisode = useCallback(
    (podcastId: number) => {
      navigate(`/podcasts/${podcastId}`);
    },
    [navigate],
  );

  return {
    player,
    playEpisode: (episode: Podcast) => dispatch(setEpisode(episode)),
    prepareEpisode: (episode: Podcast) => dispatch(prepareEpisode(episode)),
    play: () => dispatch(play()),
    pause: () => dispatch(pause()),
    seek: (seconds: number) => dispatch(seek(seconds)),
    setVolume: (value: number) => dispatch(setVolume(value)),
    setPlaybackRate: (value: number) => dispatch(setPlaybackRate(value)),
    dismiss: () => dispatch(clearEpisode()),
    setShowMiniPlayer: (visible: boolean) => dispatch(setShowMiniPlayer(visible)),
    openEpisode,
  };
}

export function usePlayerTransport() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const transport = useAppSelector(selectPlayerTransport);

  const openEpisode = useCallback(
    (podcastId: number) => {
      navigate(`/podcasts/${podcastId}`);
    },
    [navigate],
  );

  return {
    ...transport,
    play: () => dispatch(play()),
    pause: () => dispatch(pause()),
    dismiss: () => dispatch(clearEpisode()),
    openEpisode,
  };
}

export function usePlayerProgress() {
  const dispatch = useAppDispatch();
  const progress = useAppSelector(selectPlayerProgress);

  return {
    ...progress,
    seek: (seconds: number) => dispatch(seek(seconds)),
  };
}
