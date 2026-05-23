import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAudioPlayerStatus, type AudioPlayer } from "expo-audio";
import { Image, ImageSourcePropType, Pressable, Text, View } from "react-native";
import { illustrationForTrack } from "@/src/features/content/illustrations";
import { usePlayerStore } from "@/src/features/player/playerStore";

export function MiniPlayer() {
  const router = useRouter();
  const track = usePlayerStore((s) => s.track);
  const player = usePlayerStore((s) => s.player);
  const toggle = usePlayerStore((s) => s.toggle);
  if (!track || !player) return null;
  return (
    <MiniPlayerBar
      onOpen={() => router.push("/player" as never)}
      onToggle={toggle}
      title={track.title}
      subtitle={track.subtitle ?? ""}
      illustration={illustrationForTrack(track.title)}
      player={player}
    />
  );
}

function MiniPlayerBar({
  onOpen, onToggle, title, subtitle, illustration, player,
}: {
  onOpen: () => void; onToggle: () => void; title: string; subtitle: string;
  illustration: ImageSourcePropType; player: AudioPlayer;
}) {
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
