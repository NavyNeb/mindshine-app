// Static asset registry — Figma exports only.
// SVG icons are wired in Plan 3 via react-native-svg.
export const images = {
  // Splash / branding
  mindshineLogoSplash: require("../../assets/images/mindshine-logo.png"),
  splashBlob: require("../../assets/images/splash-blob.png"),

  // Onboarding
  signInIllustration: require("../../assets/images/sign-in-illustration.png"),
  appBackground: require("../../assets/images/background-app-image.png"),

  // Session / content illustrations
  deepWork: require("../../assets/images/deep-work.png"),
  morningCalm: require("../../assets/images/morning-calm.png"),
  nightSky: require("../../assets/images/night-sky.png"),
  stressRelease: require("../../assets/images/stress-release.png"),
  morningYoga: require("../../assets/images/morning-yoga.png"),
  birthAndSun: require("../../assets/images/birth-and-sun.png"),

  // Mood check-in
  moodHappy: require("../../assets/images/mood-happy.png"),
  moodSad: require("../../assets/images/mood-sad.png"),
  moodAnxious: require("../../assets/images/mood-anxious.png"),
  moodOkay: require("../../assets/images/mood-okay.png"),
  moodContent: require("../../assets/images/mood-content.png"),

  // UI elements
  emojiButton: require("../../assets/images/emoji-button.png"),
} as const;

export type ImageKey = keyof typeof images;
