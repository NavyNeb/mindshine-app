import * as Haptics from "expo-haptics";
import { Redirect, useRouter } from "expo-router";
import { useAudioPlayerStatus, type AudioPlayer } from "expo-audio";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";

import { usePlayerStore } from "@/src/features/player/playerStore";
import { formatTime, formatRemaining } from "@/src/features/player/format";
import { useIsFavorite, useToggleFavorite } from "@/src/features/favorites/useFavorites";
import { illustrationForTrack } from "@/src/features/content/illustrations";
import { useAuth } from "@/src/features/auth/useAuth";
import type { TrackWithCategory } from "@/src/features/content/types";

// ─── Outer guard: redirect if nothing is loaded ──────────────────────────────
export default function PlayerScreen() {
  const track = usePlayerStore((s) => s.track);
  const player = usePlayerStore((s) => s.player);

  if (!track || !player) {
    return <Redirect href="/(tabs)" />;
  }

  return <NowPlayingInner track={track} player={player} />;
}

// ─── Inner component: hooks run unconditionally ───────────────────────────────
function NowPlayingInner({
  track,
  player,
}: {
  track: TrackWithCategory;
  player: AudioPlayer;
}) {
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id;

  const toggle = usePlayerStore((s) => s.toggle);
  const seekTo = usePlayerStore((s) => s.seekTo);

  const status = useAudioPlayerStatus(player);
  const { data: isFav = false } = useIsFavorite(userId, track.id);
  const toggleFav = useToggleFavorite(userId);

  const duration = status.duration || 1;
  const currentTime = status.currentTime;

  const illustration = illustrationForTrack(track.title);
  const subtitle = track.subtitle ?? track.categories?.name ?? "";

  function handleFavPress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFav.mutate({ trackId: track.id, isFav });
  }

  function handleRewind() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    seekTo(Math.max(0, currentTime - 15));
  }

  function handlePlayPause() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggle();
  }

  function handleForward() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    seekTo(Math.min(duration, currentTime + 15));
  }

  return (
    <View className="flex-1 bg-primary">
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>

        {/* ── Header (lime) ── */}
        <View
          className="bg-secondary mx-4 mt-2 mb-4 rounded-card px-4 py-3 flex-row items-center"
        >
          <Pressable onPress={() => router.back()} hitSlop={8} className="flex-row items-center">
            <Ionicons name="chevron-back" size={22} color="#0D1101" />
            <Text className="font-heading text-ink text-[15px] ml-1">Back</Text>
          </Pressable>
          <Text className="font-heading text-ink text-[17px] flex-1 text-center">Now playing</Text>
          <Ionicons name="settings-outline" size={22} color="#0D1101" />
        </View>

        {/* ── Album art ── */}
        <View className="items-center mt-2 mb-4">
          {/* Dashed outer ring */}
          <View
            style={{
              width: 264,
              height: 264,
              borderRadius: 132,
              borderWidth: 1.5,
              borderStyle: "dashed",
              borderColor: "rgba(13,17,1,0.25)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Solid mid ring */}
            <View
              style={{
                width: 240,
                height: 240,
                borderRadius: 120,
                borderWidth: 3,
                borderColor: "rgba(13,17,1,0.12)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Lime circle */}
              <View
                className="bg-secondary items-center justify-center overflow-hidden"
                style={{ width: 220, height: 220, borderRadius: 110 }}
              >
                <Image
                  source={illustration}
                  style={{ width: 220, height: 220, borderRadius: 110 }}
                  resizeMode="cover"
                />
              </View>
            </View>
          </View>
        </View>

        {/* ── Output pill ── */}
        <View className="items-center mb-4">
          <View
            className="flex-row items-center bg-secondary rounded-pill px-4 py-1.5"
            style={{ borderWidth: 1.5, borderColor: "rgba(13,17,1,0.15)" }}
          >
            <Ionicons name="headset-outline" size={16} color="#0D1101" />
            <Text className="font-body text-ink text-[13px] ml-2">Output</Text>
          </View>
        </View>

        {/* ── Title + queue/fav row ── */}
        <View className="flex-row items-center px-5 mb-2">
          {/* Queue button */}
          <Pressable
            className="w-11 h-11 rounded-full border-2 border-ink items-center justify-center"
            style={{ backgroundColor: "transparent" }}
          >
            <Ionicons name="list" size={20} color="#0D1101" />
          </Pressable>

          {/* Title block */}
          <View className="flex-1 items-center px-2">
            <Text
              className="font-heading text-ink text-[24px] text-center"
              numberOfLines={1}
            >
              {track.title}
            </Text>
            {!!subtitle && (
              <Text
                className="font-body text-[14px] text-center"
                style={{ color: "rgba(13,17,1,0.65)" }}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </View>

          {/* Favourite button */}
          <Pressable
            onPress={handleFavPress}
            className="w-11 h-11 rounded-full border-2 border-ink items-center justify-center"
            style={{ backgroundColor: "transparent" }}
          >
            <Ionicons
              name={isFav ? "heart" : "heart-outline"}
              size={20}
              color="#0D1101"
            />
          </Pressable>
        </View>

        {/* ── Scrub bar ── */}
        <View className="px-5 mb-1">
          <Slider
            value={currentTime}
            minimumValue={0}
            maximumValue={duration}
            onSlidingComplete={(v) => seekTo(v)}
            minimumTrackTintColor="#D3F761"
            maximumTrackTintColor="rgba(13,17,1,0.2)"
            thumbTintColor="#D3F761"
            style={{ width: "100%", height: 36 }}
          />
          <View className="flex-row justify-between px-1" style={{ marginTop: -4 }}>
            <Text className="font-body text-ink text-[13px]">
              {formatTime(currentTime)}
            </Text>
            <Text className="font-body text-ink text-[13px]">
              {formatRemaining(currentTime, status.duration)}
            </Text>
          </View>
        </View>

        {/* ── Transport ── */}
        <View className="flex-row items-center justify-center gap-x-6 px-5 mb-6 mt-2">
          {/* Shuffle */}
          <Pressable hitSlop={8}>
            <Ionicons name="shuffle" size={24} color="#0D1101" />
          </Pressable>

          {/* Rewind -15 */}
          <Pressable onPress={handleRewind} hitSlop={8}>
            <Ionicons name="play-skip-back" size={30} color="#0D1101" />
          </Pressable>

          {/* Play / Pause */}
          <Pressable
            onPress={handlePlayPause}
            className="bg-secondary rounded-full items-center justify-center border-2 border-ink"
            style={{ width: 68, height: 68 }}
          >
            <Ionicons
              name={status.playing ? "pause" : "play"}
              size={30}
              color="#0D1101"
            />
          </Pressable>

          {/* Forward +15 */}
          <Pressable onPress={handleForward} hitSlop={8}>
            <Ionicons name="play-skip-forward" size={30} color="#0D1101" />
          </Pressable>

          {/* Repeat */}
          <Pressable hitSlop={8}>
            <Ionicons name="repeat" size={24} color="#0D1101" />
          </Pressable>
        </View>

        {/* ── Breathing guide cards ── */}
        <View className="flex-row px-4 gap-x-3">
          <BreathCard icon="leaf-outline" label="Breath In" />
          <BreathCard icon="pause-circle-outline" label="Hold" />
          <BreathCard icon="water-outline" label="Breath out" />
        </View>

      </SafeAreaView>
    </View>
  );
}

// ─── Breathing guide card ─────────────────────────────────────────────────────
function BreathCard({
  icon,
  label,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
}) {
  return (
    <View
      className="flex-1 rounded-card items-center justify-center py-4"
      style={{
        backgroundColor: "rgba(13,17,1,0.06)",
        borderWidth: 2,
        borderColor: "#0D1101",
      }}
    >
      <Ionicons name={icon} size={28} color="#0D1101" />
      <Text className="font-body text-ink text-[13px] mt-2 text-center">{label}</Text>
    </View>
  );
}
