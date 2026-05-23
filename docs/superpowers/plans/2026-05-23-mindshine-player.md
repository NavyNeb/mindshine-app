# Mindshine Plan 4 — Audio Player + Favourites

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Real audio playback — a global player store (expo-audio), a pixel-perfect "Now playing" screen, a persistent mini-player above the tab bar, and the ability to favourite a track. Tapping content on Home starts playback.

**Architecture:** A module-level `expo-audio` `AudioPlayer` lives in a Zustand store with `loadAndPlay/toggle/seek/stop`. UI reads reactive status via `useAudioPlayerStatus(player)`. The full player is a pushed route (`app/player.tsx`); a `MiniPlayer` renders inside a custom tab bar so it persists across tabs. Favourites use the Supabase `favorites` table via TanStack Query. Audio streams from each track's `audio_path` URL.

**Tech Stack:** expo-audio · @react-native-community/slider · Zustand · TanStack Query · Expo Router · NativeWind · Reanimated/expo-haptics.

**Design ref (READ):** `assets/design-refs/16. Music Play.png`.

**AUDIO CONTENT NOTE:** The player streams `track.audio_path` as a URL. The seed currently has placeholders. Task 6 updates the seed with **stable royalty-free test MP3s** (SoundHelix examples) so playback works immediately; you (human) re-run the seed in Supabase. Swap in real meditation audio later by uploading to the Storage `audio` bucket and putting those public URLs in `audio_path` — no app change needed.

**Design notes (ref 16):** lime header (Back · "Now playing" · settings gear); large circular album art (the track illustration in a lime circle) with a dashed ring; an output-device pill (decorative); track title + subtitle (from DB); a queue button (left) + heart/favourite (right); a scrub bar with elapsed (left) / remaining (right, negative); transport row (shuffle · −15s · play/pause · +15s · repeat); breathing-guide cards (Breath In / Hold / Breath out) — decorative this milestone.

---

## File Structure
```
src/features/player/
  format.ts            # formatTime / formatRemaining  (+ test)
  playerStore.ts       # zustand: AudioPlayer instance + actions
  audioMode.ts         # configureAudioMode() — silent + background
src/features/favorites/
  useFavorites.ts      # useIsFavorite(trackId) + useToggleFavorite()
src/components/
  MiniPlayer.tsx       # bar shown above tab bar when a track is loaded
  CustomTabBar.tsx     # default tab bar + MiniPlayer on top
app/player.tsx         # full "Now playing" screen (pushed route)
app/_layout.tsx        # call configureAudioMode() once (modify)
app/(tabs)/_layout.tsx # use CustomTabBar (modify)
app/(tabs)/index.tsx   # wire Play Now / card press → loadAndPlay + push (modify)
supabase/seed.sql      # real sample audio URLs (modify) + re-run (human)
app.json               # iOS background audio mode (modify)
```

---

## Task 1: Install deps + audio mode + background config

- [ ] **Step 1: Install** — `npx expo install expo-audio @react-native-community/slider`

- [ ] **Step 2: `src/features/player/audioMode.ts`**
```ts
import { setAudioModeAsync } from "expo-audio";

/** Call once at app start: keep playing in silent mode + in background. */
export async function configureAudioMode() {
  await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true });
}
```
(If a property name differs in the installed expo-audio version, check `node_modules/expo-audio` types and use the correct option names; the intent is silent-mode + background playback.)

- [ ] **Step 3: Call it in `app/_layout.tsx`** — add a `useEffect(() => { configureAudioMode(); }, [])` in `RootLayout` (preserve all existing providers/fonts/splash). Import from `@/src/features/player/audioMode`.

- [ ] **Step 4: `app.json` iOS background audio** — add to `expo.ios`:
```json
"infoPlist": { "UIBackgroundModes": ["audio"] }
```
(Merge into the existing `ios` block; keep `supportsTablet`.)

- [ ] **Step 5: Verify** `npx tsc --noEmit` clean; `npx expo export --platform web --output-dir /tmp/p4-deps` bundles. **Commit** `chore: expo-audio + slider + background audio config`.

---

## Task 2: Time format util (TDD) + player store

- [ ] **Step 1: Failing test `src/features/player/format.test.ts`**
```ts
import { formatTime, formatRemaining } from "./format";
test("formats seconds as M:SS", () => {
  expect(formatTime(0)).toBe("0:00");
  expect(formatTime(134)).toBe("2:14");
  expect(formatTime(75)).toBe("1:15");
});
test("formats remaining as negative", () => {
  expect(formatRemaining(134, 209)).toBe("-1:15"); // 209-134 = 75s
  expect(formatRemaining(10, 10)).toBe("-0:00");
});
```
- [ ] **Step 2: Run, verify fail.**
- [ ] **Step 3: Implement `src/features/player/format.ts`**
```ts
export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}
export function formatRemaining(current: number, duration: number): string {
  return `-${formatTime(Math.max(0, duration - current))}`;
}
```
- [ ] **Step 4: Run, verify pass.**

- [ ] **Step 5: `src/features/player/playerStore.ts`** — global player via Zustand + expo-audio `createAudioPlayer`:
```ts
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
    get().player?.release();
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
    get().player?.release();
    set({ track: null, player: null });
  },
}));
```
(Verify `createAudioPlayer`, `.play()/.pause()/.seekTo()/.release()`, and `.playing` against the installed `expo-audio` types; adjust names if the version differs. `seekTo` takes seconds.)

- [ ] **Step 6: Verify** `npm test` green; `npx tsc --noEmit` clean; `npx expo export --platform web --output-dir /tmp/p4-store` bundles. **Commit** `feat: player store + time format util`.

---

## Task 3: Favourites data layer

- [ ] **Step 1: `src/features/favorites/useFavorites.ts`**
```ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/lib/supabase";

async function fetchIsFavorite(userId: string, trackId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from("favorites")
    .select("track_id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("track_id", trackId);
  if (error) throw error;
  return (count ?? 0) > 0;
}

export function useIsFavorite(userId: string | undefined, trackId: string | undefined) {
  return useQuery({
    queryKey: ["favorite", userId, trackId],
    queryFn: () => fetchIsFavorite(userId!, trackId!),
    enabled: !!userId && !!trackId,
  });
}

export function useToggleFavorite(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ trackId, isFav }: { trackId: string; isFav: boolean }) => {
      if (!userId) throw new Error("Not signed in");
      if (isFav) {
        const { error } = await supabase.from("favorites").delete().eq("user_id", userId).eq("track_id", trackId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("favorites").insert({ user_id: userId, track_id: trackId });
        if (error) throw error;
      }
    },
    onSuccess: (_d, { trackId }) => {
      qc.invalidateQueries({ queryKey: ["favorite", userId, trackId] });
      qc.invalidateQueries({ queryKey: ["favorites", userId] });
    },
  });
}
```
- [ ] **Step 2: Verify** `npx tsc --noEmit` clean; `npm test` green. **Commit** `feat: favourites data layer`.

---

## Task 4: Music Play screen (`app/player.tsx`)

**READ `assets/design-refs/16. Music Play.png`.** Build the full screen, wired to the store + status + favourites.

- [ ] **Step 1: Implement `app/player.tsx`** — green screen with lime header. Read the current track from `usePlayerStore`; if none, `<Redirect href="/(tabs)" />`. Status via `useAudioPlayerStatus(player)`. Layout:
  - Header: Back (`router.back()`), "Now playing" centered, a settings gear (decorative).
  - Circular album art = `illustrationForTrack(track.title)` inside a lime circle with a dashed ring (use a bordered `View` with `borderStyle:"dashed"` for the ring; an exact progress arc is optional).
  - Output-device pill "🎧 Output" (decorative/static — do NOT hardcode a person's name).
  - Title = `track.title`; subtitle = `track.subtitle ?? track.categories?.name ?? ""` (use DB data, never a hardcoded artist).
  - Left circular button = queue (decorative); right circular button = heart toggling favourite via `useIsFavorite`/`useToggleFavorite` (filled when favourited) + light haptic.
  - Scrub bar: `@react-native-community/slider` with `value={status.currentTime}`, `maximumValue={status.duration || 1}`, `onSlidingComplete={(v) => seekTo(v)}`, lime `minimumTrackTintColor`. Left label `formatTime(status.currentTime)`, right label `formatRemaining(status.currentTime, status.duration)`.
  - Transport: shuffle (decorative), −15s (`seekTo(max(0, currentTime-15))`), big play/pause (`toggle()`, icon from `status.playing`), +15s (`seekTo(min(duration, currentTime+15))`), repeat (decorative). Haptics on the main controls.
  - Breathing cards row (Breath In / Hold / Breath out) — static, match the ref visually (small neo-brutalist cards with icons).
  Use Ionicons for control glyphs, token classes for colours. Match the ref's spacing/sizes.
- [ ] **Step 2: Verify** `npx tsc --noEmit` clean; `npx expo export --platform web --output-dir /tmp/p4-screen` bundles; `npm test` green. (Playback/visual = device check.)
- [ ] **Step 3: Commit** `feat: pixel-perfect now-playing screen`.

---

## Task 5: MiniPlayer + custom tab bar

- [ ] **Step 1: `src/components/MiniPlayer.tsx`** — compact bar; renders only when a track is loaded. Tapping the bar pushes `/player`; a play/pause button toggles. Shows illustration + title + subtitle.
```tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { illustrationForTrack } from "@/src/features/content/illustrations";
import { usePlayerStore } from "@/src/features/player/playerStore";
import { useAudioPlayerStatus } from "expo-audio";

export function MiniPlayer() {
  const router = useRouter();
  const { track, player, toggle } = usePlayerStore();
  if (!track || !player) return null;
  return <MiniPlayerBar onOpen={() => router.push("/player")} onToggle={toggle} title={track.title} subtitle={track.subtitle ?? ""} illustration={illustrationForTrack(track.title)} player={player} />;
}

function MiniPlayerBar({ onOpen, onToggle, title, subtitle, illustration, player }: any) {
  const status = useAudioPlayerStatus(player);
  return (
    <Pressable onPress={onOpen} className="flex-row items-center bg-secondary border-2 border-ink rounded-card mx-3 mb-2 p-2">
      <Image source={illustration} style={{ width: 40, height: 40, borderRadius: 8 }} resizeMode="cover" />
      <View className="flex-1 mx-3">
        <Text numberOfLines={1} className="font-heading text-ink text-[14px]">{title}</Text>
        <Text numberOfLines={1} className="font-body text-ink/70 text-[12px]">{subtitle}</Text>
      </View>
      <Pressable onPress={onToggle} hitSlop={8} className="w-9 h-9 rounded-pill bg-primary border-2 border-ink items-center justify-center">
        <Ionicons name={status.playing ? "pause" : "play"} size={18} color="#0D1101" />
      </Pressable>
    </Pressable>
  );
}
```
- [ ] **Step 2: `src/components/CustomTabBar.tsx`** — render `MiniPlayer` above the standard bottom tab bar:
```tsx
import { BottomTabBar, type BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { View } from "react-native";
import { MiniPlayer } from "./MiniPlayer";

export function CustomTabBar(props: BottomTabBarProps) {
  return (
    <View style={{ backgroundColor: "#008A49" }}>
      <MiniPlayer />
      <BottomTabBar {...props} />
    </View>
  );
}
```
(`@react-navigation/bottom-tabs` is a transitive dep of expo-router; if the import path isn't resolvable, `npx expo install @react-navigation/bottom-tabs`.)
- [ ] **Step 3: Use it in `app/(tabs)/_layout.tsx`** — add `tabBar={(props) => <CustomTabBar {...props} />}` to `<Tabs>` (keep the existing auth guard + screenOptions/icons).
- [ ] **Step 4: Verify** `npx tsc --noEmit`; `npx expo export --platform web --output-dir /tmp/p4-mini` bundles; `npm test` green. **Commit** `feat: mini-player in custom tab bar`.

---

## Task 6: Wire Home → player + real sample audio in seed

- [ ] **Step 1: Wire `app/(tabs)/index.tsx`** — import `usePlayerStore` + `useRouter`; on `TodaysPickCard` `onPlay` and `TrackCard` `onPress`, call `usePlayerStore.getState().loadAndPlay(track)` then `router.push("/player")`. Replace the `// TODO(player)` placeholders. Pass the right `track` object to each card handler.
- [ ] **Step 2: Update `supabase/seed.sql`** — replace the `<public-url-N.mp3>` placeholders with stable royalty-free test MP3s so playback works now (swap for real audio later). Use the SoundHelix example tracks:
```sql
-- audio_path values: stable royalty-free TEST audio (SoundHelix). Replace with real
-- meditation audio (upload to the `audio` Storage bucket) for production.
-- Morning calm
update public.tracks set audio_path = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' where title = 'Morning calm';
update public.tracks set audio_path = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' where title = 'Stress release';
update public.tracks set audio_path = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' where title = 'Night sky cast';
update public.tracks set audio_path = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' where title = 'Morning yoga';
update public.tracks set audio_path = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' where title = 'Deep work';
```
Also update the INSERT block's `audio_path` values to the same URLs (so a fresh seed is already playable). Keep the placeholder note updated.
- [ ] **Step 3: Verify** `npx tsc --noEmit`; `npx expo export --platform web --output-dir /tmp/p4-wire` bundles; `npm test` green. **Commit** `feat: play from home + playable sample audio in seed`.
- [ ] **Step 4 (human):** Re-run the updated `supabase/seed.sql` UPDATE statements in the Supabase SQL Editor so existing rows get the test URLs.

---

## Self-Review
- **Coverage:** audio infra (Tasks 1–2) → screen (4) consumes store/status/format; favourites (3) used by the screen heart; mini-player + custom tab bar (5); Home wiring + playable audio (6). `formatTime`/`formatRemaining` TDD'd.
- **Definition of done:** `npm test` green; tsc clean; web export bundles. End-to-end playback (tap Play → audio plays → mini-player persists → scrub/seek → favourite) verified on a **dev build + device** with the re-run seed (human step — expo-audio is native, web export validates bundling only).
- **Type consistency:** `loadAndPlay(track: TrackWithCategory)` matches Home's track objects; `seekTo(seconds)`, `toggle()`, store `player`/`track` used consistently across screen + mini-player; favourites hooks signatures `(userId, trackId)` consistent.

## Next plan
**Song List + Favourites list** (screens 17 + 18), then **Profile + My Progress** (with `sessions` writes feeding streaks/progress), then **Explore** (once you export its photos).
