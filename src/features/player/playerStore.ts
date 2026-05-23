import { create } from "zustand";
import { createAudioPlayer, type AudioPlayer } from "expo-audio";
import type { TrackWithCategory } from "@/src/features/content/types";

type PlayerState = {
  track: TrackWithCategory | null;
  player: AudioPlayer | null;
  loadAndPlay: (track: TrackWithCategory) => void;
  toggle: () => void;
  seekTo: (seconds: number) => void;
  stop: () => void;
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  track: null,
  player: null,
  loadAndPlay: (track) => {
    get().player?.remove();
    const player = createAudioPlayer({ uri: track.audio_path });
    player.play();
    set({ track, player });
  },
  toggle: () => {
    const p = get().player;
    if (!p) return;
    if (p.playing) p.pause();
    else p.play();
  },
  seekTo: (seconds) => {
    get().player?.seekTo(seconds);
  },
  stop: () => {
    get().player?.remove();
    set({ track: null, player: null });
  },
}));
