import * as Haptics from "expo-haptics";
import { Pressable, Text } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { NeoShadow } from "./NeoShadow";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = { label: string; onPress: () => void; variant?: "primary" | "secondary"; disabled?: boolean };

export function Button({ label, onPress, variant = "primary", disabled }: Props) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const bg = variant === "primary" ? "bg-primary" : "bg-secondary";

  return (
    <NeoShadow radius="rounded-pill" className={disabled ? "opacity-50" : ""}>
      <AnimatedPressable
        accessibilityRole="button"
        disabled={disabled}
        onPressIn={() => { scale.value = withTiming(0.97, { duration: 80 }); }}
        onPressOut={() => { scale.value = withTiming(1, { duration: 120 }); }}
        onPress={() => { if (disabled) return; Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
        style={style}
        className={`${bg} border-2 border-ink rounded-pill px-6 py-4 items-center`}
      >
        <Text className="font-heading text-ink text-[18px]">{label}</Text>
      </AnimatedPressable>
    </NeoShadow>
  );
}
