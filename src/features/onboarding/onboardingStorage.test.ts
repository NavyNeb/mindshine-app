import AsyncStorage from "@react-native-async-storage/async-storage";
import { getOnboardingSeen, setOnboardingSeen } from "./onboardingStorage";

beforeEach(async () => {
  await AsyncStorage.clear();
});

test("defaults to not-seen, true after marking", async () => {
  expect(await getOnboardingSeen()).toBe(false);
  await setOnboardingSeen();
  expect(await getOnboardingSeen()).toBe(true);
});
