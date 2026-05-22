import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "onboarding_seen_v1";

export async function getOnboardingSeen(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEY)) === "1";
}

export async function setOnboardingSeen(): Promise<void> {
  await AsyncStorage.setItem(KEY, "1");
}
