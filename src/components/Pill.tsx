import { Text, View } from "react-native";

export function Pill({ label, filled }: { label: string; filled?: boolean }) {
  return (
    <View className={`rounded-pill px-4 py-2 border ${filled ? "bg-ink border-ink" : "border-ink"}`}>
      <Text className={`font-medium text-[14px] ${filled ? "text-white" : "text-ink"}`}>{label}</Text>
    </View>
  );
}
