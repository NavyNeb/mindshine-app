import * as Haptics from "expo-haptics";
import { Pressable, Text } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = { label: string; onPress: () => void; variant?: "primary" | "secondary"; disabled?: boolean };

export function Button({ label, onPress, variant = "primary", disabled }: Props) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const bg = variant === "primary" ? "bg-primary" : "bg-secondary";

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={disabled}
      onPressIn={() => { scale.value = withTiming(0.96, { duration: 80 }); }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 120 }); }}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
      style={style}
      className={`${bg} rounded-pill px-6 py-4 items-center ${disabled ? "opacity-50" : ""}`}
    >
      <Text className="font-medium text-ink text-[16px]">{label}</Text>
    </AnimatedPressable>
  );
}
