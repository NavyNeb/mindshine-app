import { ImageSourcePropType } from "react-native";
import { images } from "@/src/theme/assets";

const MAP: Record<string, ImageSourcePropType> = {
  "morning calm": images.morningCalm,
  "stress release": images.stressRelease,
  "night sky cast": images.nightSky,
  "morning yoga": images.morningYoga,
  "deep work": images.deepWork,
};

export function illustrationForTrack(title: string): ImageSourcePropType {
  return MAP[title.trim().toLowerCase()] ?? images.morningCalm;
}
