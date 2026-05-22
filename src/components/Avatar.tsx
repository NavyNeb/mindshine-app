import { Image, Text, View } from "react-native";

export function Avatar({ uri, name, size = 48 }: { uri?: string | null; name?: string | null; size?: number }) {
  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  const initial = (name?.trim()?.[0] ?? "M").toUpperCase();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2 }} className="bg-primary border-2 border-ink items-center justify-center">
      <Text className="font-heading text-ink text-[18px]">{initial}</Text>
    </View>
  );
}
