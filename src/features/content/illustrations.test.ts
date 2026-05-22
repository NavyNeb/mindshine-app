import { illustrationForTrack } from "./illustrations";
import { images } from "@/src/theme/assets";

test("maps known track titles to local illustrations (case-insensitive)", () => {
  expect(illustrationForTrack("Stress release")).toBe(images.stressRelease);
  expect(illustrationForTrack("NIGHT SKY CAST")).toBe(images.nightSky);
});
test("falls back to a default illustration for unknown titles", () => {
  expect(illustrationForTrack("Whatever")).toBe(images.morningCalm);
});
