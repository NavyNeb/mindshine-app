import * as Haptics from "expo-haptics";
import { Image, ImageSourcePropType, Pressable, Text } from "react-native";
import { NeoShadow } from "./NeoShadow";

type Props = {
  title: string; category?: string | null; durationSec: number;
  illustration: ImageSourcePropType; onPress?: () => void; variant?: "primary" | "secondary";
};
export function TrackCard({ title, category, durationSec, illustration, onPress, variant = "primary" }: Props) {
  const min = Math.round(durationSec / 60);
  const bg = variant === "primary" ? "bg-primary" : "bg-secondary";
  return (
    <NeoShadow radius="rounded-card" offset="translate-x-1 translate-y-1.5">
      <Pressable
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress?.(); }}
        className={`${bg} border-2 border-ink rounded-card p-3`}
      >
        <Image source={illustration} resizeMode="contain" style={{ width: "100%", height: 96 }} />
        {category ? <Text className="font-body text-ink/70 text-[13px] mt-2">{category}</Text> : null}
        <Text className="font-heading text-ink text-[18px]">{title}</Text>
        <Text className="font-body text-ink/70 text-[13px] mt-1">{min} min</Text>
      </Pressable>
    </NeoShadow>
  );
}
