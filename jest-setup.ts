// Provide fake Supabase env vars so createClient doesn't throw during module load in tests
process.env.EXPO_PUBLIC_SUPABASE_URL = "http://localhost:54321";
process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-anon-key";

import "react-native-gesture-handler/jestSetup";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("react-native-reanimated", () => require("react-native-reanimated/mock"));
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light", Medium: "medium", Heavy: "heavy" },
  NotificationFeedbackType: { Success: "success", Error: "error" },
}));
