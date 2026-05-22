import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { Avatar } from "@/src/components/Avatar";
import { Pill } from "@/src/components/Pill";
import { greetingForHour } from "./greeting";

export function HomeHeader({ name, avatarUrl, streak }: { name?: string | null; avatarUrl?: string | null; streak: number }) {
  const greeting = greetingForHour(new Date().getHours());
  return (
    <View className="px-5 pt-2 pb-5">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <Avatar uri={avatarUrl} name={name} />
          <View className="ml-3 flex-1">
            <Text className="font-heading text-ink text-[18px]" numberOfLines={1}>{name ?? "there"}! {greeting}</Text>
            <Text className="font-body text-ink/70 text-[14px]">Start your day with mindshine!</Text>
          </View>
        </View>
        <Pressable accessibilityLabel="Notifications" className="w-11 h-11 rounded-pill border-2 border-ink items-center justify-center" hitSlop={6}>
          <Ionicons name="notifications-outline" size={20} color="#0D1101" />
        </Pressable>
      </View>
      <View className="flex-row gap-3 mt-4">
        <Pill label={`${streak}-day streak`} filled />
        <Pill label="Keep it going" />
      </View>
    </View>
  );
}
