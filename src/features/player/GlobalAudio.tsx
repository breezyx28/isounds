import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getSoundUrl } from "@/lib/audio";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useIncrementViewsMutation } from "@/store/api";
import { useSaveListeningPositionMutation } from "@/store/localApi";
import {
  pause,
  play,
  seek,
  setDuration,
  setShowMiniPlayer,
} from "./playerSlice";

const SEEK_THROTTLE_MS = 250;

export function GlobalAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSavedAtRef = useRef(0);
  const lastSeekDispatchRef = useRef(0);
  const lastViewEpisodeRef = useRef<number | null>(null);
  const location = useLocation();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const player = useAppSelector((state) => state.player);
  const [incrementViews] = useIncrementViewsMutation();
  const [saveListeningPosition] = useSaveListeningPositionMutation();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      const now = Date.now();
      if (now - lastSeekDispatchRef.current >= SEEK_THROTTLE_MS) {
        lastSeekDispatchRef.current = now;
        dispatch(seek(audio.currentTime));
      }

      if (
        player.currentEpisode &&
        now - lastSavedAtRef.current >= 10_000 &&
        audio.duration > 0
      ) {
        lastSavedAtRef.current = now;
        void saveListeningPosition({
          podcast_id: player.currentEpisode.id,
          position_seconds: audio.currentTime,
          duration_seconds: audio.duration,
        });
      }
    };

    const onLoadedMetadata = () => {
      dispatch(setDuration(audio.duration || 0));
    };

    const onEnded = () => {
      dispatch(pause());
      dispatch(setShowMiniPlayer(false));
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [dispatch, player.currentEpisode, saveListeningPosition]);

  useEffect(() => {
    const audio = audioRef.current;
    const episode = player.currentEpisode;
    const token = auth.user?.token;
    if (!audio || !episode || !token || !player.isPlaying) return;

    const src = getSoundUrl(episode.id, token);
    if (audio.src !== src) {
      audio.src = src;
      audio.load();
      if (lastViewEpisodeRef.current !== episode.id) {
        lastViewEpisodeRef.current = episode.id;
        void incrementViews(episode.id);
      }
    }
  }, [auth.user?.token, incrementViews, player.currentEpisode, player.isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = player.volume;
  }, [player.volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = player.playbackRate;
  }, [player.playbackRate]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!player.currentEpisode || !auth.user?.token) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      dispatch(pause());
      dispatch(setShowMiniPlayer(false));
      return;
    }

    if (player.isPlaying) {
      void audio.play().then(
        () => dispatch(play()),
        () => dispatch(pause()),
      );
    } else {
      audio.pause();
    }
  }, [auth.user?.token, dispatch, player.currentEpisode, player.isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (Math.abs((audio.currentTime || 0) - player.progress) < 1) return;
    audio.currentTime = player.progress;
  }, [player.progress]);

  useEffect(() => {
    const isEpisodeRoute = location.pathname.startsWith("/podcasts/");
    dispatch(
      setShowMiniPlayer(
        !isEpisodeRoute && player.isPlaying && Boolean(player.currentEpisode),
      ),
    );
  }, [dispatch, location.pathname, player.currentEpisode, player.isPlaying]);

  return <audio ref={audioRef} preload="metadata" hidden />;
}
