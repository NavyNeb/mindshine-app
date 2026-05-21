import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export function OnboardingHeader({ onSkip }: { onSkip?: () => void }) {
  const router = useRouter();
  return (
    <View className="flex-row items-center justify-between py-2">
      <Pressable accessibilityLabel="Go back" onPress={() => router.back()} hitSlop={8}>
        <Ionicons name="arrow-back" size={26} color="#0D1101" />
      </Pressable>
      {onSkip ? (
        <Pressable accessibilityRole="button" onPress={onSkip} hitSlop={8}>
          <Text className="font-heading text-ink text-[18px]">Skip</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
