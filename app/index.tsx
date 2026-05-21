import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/src/features/auth/useAuth";

export default function Index() {
  const { session, initialized } = useAuth();
  if (!initialized) {
    return <View className="flex-1 items-center justify-center bg-primary"><ActivityIndicator color="#0D1101" /></View>;
  }
  return <Redirect href={session ? "/(tabs)" : "/(auth)/sign-in"} />;
}
