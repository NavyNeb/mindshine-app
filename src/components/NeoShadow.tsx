import { PropsWithChildren } from "react";
import { View } from "react-native";

/** Wraps children with a hard ink shadow offset down-right (neo-brutalist). */
export function NeoShadow({
  children,
  radius = "rounded-pill",
  offset = "translate-x-1 translate-y-1.5",
  className = "",
}: PropsWithChildren<{ radius?: string; offset?: string; className?: string }>) {
  return (
    <View className={`relative ${className}`}>
      <View className={`absolute inset-0 bg-ink ${radius} ${offset}`} />
      <View className={radius}>{children}</View>
    </View>
  );
}
