import { Text, TextProps } from "react-native";

export function Heading({ className = "", ...p }: TextProps & { className?: string }) {
  return <Text className={`font-heading text-ink text-[20px] leading-[22px] ${className}`} {...p} />;
}
export function Body({ className = "", ...p }: TextProps & { className?: string }) {
  return <Text className={`font-body text-ink text-[16px] leading-[24px] ${className}`} {...p} />;
}
