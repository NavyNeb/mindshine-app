import { Image, ImageSourcePropType, Text, View } from "react-native";
import { Button } from "./Button";
import { NeoShadow } from "./NeoShadow";

type Props = { title: string; subtitle?: string | null; durationSec: number; illustration: ImageSourcePropType; onPlay?: () => void };
export function TodaysPickCard({ title, subtitle, durationSec, illustration, onPlay }: Props) {
  const min = Math.round(durationSec / 60);
  return (
    <NeoShadow radius="rounded-card" offset="translate-x-1 translate-y-1.5">
      <View className="bg-secondary border-2 border-ink rounded-card p-4 overflow-hidden">
        <Image source={illustration} resizeMode="contain" style={{ position: "absolute", right: -10, bottom: -6, width: 150, height: 130 }} />
        <Text className="font-body text-ink/70 text-[13px]">Today's pick</Text>
        <Text className="font-heading text-ink text-[24px]">{title}</Text>
        <Text className="font-body text-ink/70 text-[13px] mt-1">{min} min · {subtitle ?? ""}</Text>
        <View className="mt-3 self-start"><Button label="Play Now" onPress={() => onPlay?.()} /></View>
      </View>
    </NeoShadow>
  );
}
