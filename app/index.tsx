import { Redirect } from "expo-router";
import { SplashScreen } from "@/src/features/auth/SplashScreen";
import { useAuth } from "@/src/features/auth/useAuth";
import { useOnboardingSeen } from "@/src/features/onboarding/useOnboardingSeen";

export default function Index() {
  const { session, initialized } = useAuth();
  const { loading: onboardingLoading, seen } = useOnboardingSeen();
  if (!initialized || onboardingLoading) return <SplashScreen />;
  if (session) return <Redirect href="/(tabs)" />;
  if (!seen) return <Redirect href="/(onboarding)" />;
  return <Redirect href="/(auth)/sign-in" />;
}
