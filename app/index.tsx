import { Redirect } from "expo-router";
import { useAuth } from "@/src/features/auth/useAuth";
import { SplashScreen } from "@/src/features/auth/SplashScreen";

export default function Index() {
  const { session, initialized } = useAuth();
  if (!initialized) return <SplashScreen />;
  return <Redirect href={session ? "/(tabs)" : "/(auth)/sign-in"} />;
}
