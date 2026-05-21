import "../global.css";
import { Inter_400Regular, Inter_500Medium } from "@expo-google-fonts/inter";
import { MPLUSRounded1c_700Bold } from "@expo-google-fonts/m-plus-rounded-1c";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    MPLUSRounded1c_700Bold,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return <Stack />;
}
