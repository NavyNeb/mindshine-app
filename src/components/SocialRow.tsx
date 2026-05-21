import { FontAwesome } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Pressable, Text, View } from "react-native";

const ITEMS = [
  { key: "google", name: "google" as const },
  { key: "apple", name: "apple" as const },
  { key: "facebook", name: "facebook" as const },
];

export function SocialRow() {
  return (
    <View className="items-center">
      <View className="flex-row items-center w-full my-4">
        <View className="flex-1 h-px bg-ink/30" />
        <Text className="font-heading text-ink text-[14px] mx-3">OR</Text>
        <View className="flex-1 h-px bg-ink/30" />
      </View>
      <View className="flex-row gap-5">
        {ITEMS.map((i) => (
          <Pressable
            key={i.key}
            accessibilityLabel={`Continue with ${i.key}`}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            className="w-14 h-14 rounded-pill bg-primary/40 items-center justify-center"
          >
            <FontAwesome name={i.name} size={24} color="#0D1101" />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
