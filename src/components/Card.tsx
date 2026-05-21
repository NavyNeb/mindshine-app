import { View, ViewProps } from "react-native";

export function Card({ className = "", ...p }: ViewProps & { className?: string }) {
  return <View className={`rounded-card p-4 ${className}`} {...p} />;
}
