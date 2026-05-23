import { setAudioModeAsync } from "expo-audio";

/** Call once at app start: keep playing in silent mode + in background. */
export async function configureAudioMode() {
  await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true });
}
