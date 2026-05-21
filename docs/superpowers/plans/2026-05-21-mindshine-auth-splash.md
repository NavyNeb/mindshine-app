# Mindshine Plan 2 — Design-System Upgrade + Splash + Auth (Pixel-Perfect)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Upgrade the base components to the Figma "neo-brutalist" visual language, then rebuild the Splash, Sign In, and Sign Up screens pixel-perfect against the exported design refs (auth already works against Supabase from the Foundation).

**Architecture:** Reusable primitives (`Button`, `Input`, `AuthScaffold`, `OnboardingHeader`, `SocialRow`, `NeoShadow`) carry the design language so each screen is thin composition. A custom animated in-app Splash replaces the ActivityIndicator shown while auth/fonts initialize. No backend changes.

**Tech Stack:** Expo Router · NativeWind v4 · Reanimated · expo-haptics · @expo/vector-icons (social glyphs) · existing Supabase auth.

**Design refs (read the actual PNGs while implementing):**
- `assets/design-refs/1. splash Screen.png`
- `assets/design-refs/4. Sign In.png`
- `assets/design-refs/5. Sign up.png`

**Key visual spec (from the refs + tokens):**
- Primary button/fill: mint `#22D795` (`bg-primary`); secondary: lime `#D3F761` (`bg-secondary`); text/border/shadow: ink `#0D1101` (`ink`).
- **Neo-brutalist treatment:** ~2px ink border + a **hard** ink shadow offset ~4–6px down-right (NO blur). Pill radius for buttons/inputs (`rounded-pill`), `rounded-card` for cards.
- Headings: `font-heading` (M PLUS Rounded 1c Bold), large; body/labels: `font-medium`/`font-body`.
- Auth screens: green (`bg-primary`) top region holding an illustration; lime (`bg-secondary`) bottom sheet with rounded top corners containing the form.

**Copy fixes (design has template typos — use corrected copy, note the change):** Sign In subtitle "Sign in to track your calories and stay on your goals." → "Sign in to track your sessions and stay on your goals." Sign Up similarly. Keep field labels/placeholders as shown ("Enter your email", "Create a password", "First Name").

---

## File Structure

```
assets/images/        # normalized PNGs (kebab-case): sign-in-illustration.png, splash-star.png, mindshine-wordmark.png, mood-*.png ...
assets/icons/         # normalized SVGs (used in Plan 3)
src/theme/assets.ts   # logical-name → require() map for PNGs (avoids spaces-in-path)
src/components/
  NeoShadow.tsx        # hard-offset-shadow wrapper (cross-platform)
  Button.tsx           # restyled neo-brutalist (update + test)
  Input.tsx + Input.test.tsx
  OnboardingHeader.tsx
  SocialRow.tsx
  AuthScaffold.tsx
src/features/auth/
  SplashScreen.tsx     # animated in-app splash
app/(auth)/sign-in.tsx # rebuilt pixel-perfect
app/(auth)/sign-up.tsx # rebuilt pixel-perfect
app/index.tsx          # uses SplashScreen while !initialized
.gitignore             # add .DS_Store + assets/design-refs/
```

---

## Task 1: Asset intake & normalization

**Files:** rename/move under `assets/`; create `src/theme/assets.ts`; modify `.gitignore`

- [ ] **Step 1: Ignore junk + reference-only refs**
Add to `.gitignore`:
```
.DS_Store
**/.DS_Store
assets/design-refs/
```
(Design refs stay local for matching; they're reference-only and large.)

- [ ] **Step 2: Normalize loose asset filenames**
The loose files in `assets/` (e.g. `Sign In Illustration.png`, `Splash Star.png`, `mindshine splash.png`, `Happy Mood Image.png`, `Meditation Icon.svg`, …) have spaces — bad for Metro `require`. Move PNGs to `assets/images/` and SVGs to `assets/icons/`, renamed kebab-case. Example mapping (verify each by listing `assets/`):
```bash
cd /Users/user/Documents/ReactNative
mkdir -p assets/icons
git mv "assets/Sign In Illustration.png" assets/images/sign-in-illustration.png
git mv "assets/Splash Star.png"          assets/images/splash-star.png
git mv "assets/mindshine splash.png"     assets/images/mindshine-splash.png
# ...repeat for every loose png → assets/images/<kebab>.png and every svg → assets/icons/<kebab>.svg
```
(Use `git mv` only for tracked files; for untracked, plain `mv` then `git add`. The Foundation committed nothing under `assets/` except template images + the design-refs `.gitkeep`, so most are untracked — use `mv` + `git add`.)

- [ ] **Step 3: Create `src/theme/assets.ts`** (logical name → require)
```ts
// Static asset registry. Add entries as screens need them.
export const images = {
  signInIllustration: require("../../assets/images/sign-in-illustration.png"),
  splashStar: require("../../assets/images/splash-star.png"),
  mindshineSplash: require("../../assets/images/mindshine-splash.png"),
} as const;
```
(Only include assets that exist; verify the filenames after Step 2.)

- [ ] **Step 4: Verify + commit**
Run `npx tsc --noEmit` (require paths resolve) and `npx expo export --platform web --output-dir /tmp/p2-assets` (bundles the assets).
Commit: `git add -A && git commit -m "chore: normalize design assets + asset registry"`.

---

## Task 2: NeoShadow primitive (hard offset shadow)

**Files:** Create `src/components/NeoShadow.tsx`

The design's hard, non-blurred offset shadow isn't achievable with RN's soft `elevation` on Android. Use a stacked layer: an ink layer offset behind the content.

- [ ] **Step 1: Implement `src/components/NeoShadow.tsx`**
```tsx
import { PropsWithChildren } from "react";
import { View } from "react-native";

/** Wraps children with a hard ink shadow offset down-right (neo-brutalist). */
export function NeoShadow({
  children,
  radius = "rounded-pill",
  offset = "translate-x-1 translate-y-1.5",
  className = "",
}: PropsWithChildren<{ radius?: string; offset?: string; className?: string }>) {
  return (
    <View className={`relative ${className}`}>
      <View className={`absolute inset-0 bg-ink ${radius} ${offset}`} />
      <View className={radius}>{children}</View>
    </View>
  );
}
```
The absolute ink layer sits behind (rendered first), offset by `offset`; the content layer renders on top with matching radius. Consumers pass a matching `radius`.

- [ ] **Step 2: Commit** `feat: NeoShadow hard-shadow primitive`

---

## Task 3: Restyle Button → neo-brutalist

**Files:** Modify `src/components/Button.tsx`; keep/extend `src/components/Button.test.tsx`

- [ ] **Step 1: Confirm existing test still describes intent**
The existing test renders `<Button label onPress />` and asserts press fires. Keep it. Add one assertion: a `disabled` button does not call `onPress`:
```tsx
test("disabled button does not fire onPress", () => {
  const onPress = jest.fn();
  const { getByText } = render(<Button label="Go" onPress={onPress} disabled />);
  fireEvent.press(getByText("Go"));
  expect(onPress).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: Run, expect the new case to fail or pass per current impl**
Run `npm test src/components/Button.test.tsx`. (Current impl sets `disabled` on Pressable, so press may already be blocked — if it passes, fine; if not, the restyle fixes it.)

- [ ] **Step 3: Restyle `Button.tsx`** — wrap content in `NeoShadow`, add ink border, keep press animation + haptics, keep `variant`/`disabled`/`label`/`onPress` API:
```tsx
import * as Haptics from "expo-haptics";
import { Pressable, Text } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { NeoShadow } from "./NeoShadow";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = { label: string; onPress: () => void; variant?: "primary" | "secondary"; disabled?: boolean };

export function Button({ label, onPress, variant = "primary", disabled }: Props) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const bg = variant === "primary" ? "bg-primary" : "bg-secondary";

  return (
    <NeoShadow radius="rounded-pill" className={disabled ? "opacity-50" : ""}>
      <AnimatedPressable
        accessibilityRole="button"
        disabled={disabled}
        onPressIn={() => { scale.value = withTiming(0.97, { duration: 80 }); }}
        onPressOut={() => { scale.value = withTiming(1, { duration: 120 }); }}
        onPress={() => { if (disabled) return; Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
        style={style}
        className={`${bg} border-2 border-ink rounded-pill px-6 py-4 items-center`}
      >
        <Text className="font-heading text-ink text-[18px]">{label}</Text>
      </AnimatedPressable>
    </NeoShadow>
  );
}
```

- [ ] **Step 4: Run `npm test` (full suite green) + `npx tsc --noEmit`.**

- [ ] **Step 5: Commit** `feat: neo-brutalist button`

---

## Task 4: Input component

**Files:** Create `src/components/Input.tsx`, `src/components/Input.test.tsx`

- [ ] **Step 1: Failing test** (`Input.test.tsx`)
```tsx
import { render, fireEvent } from "@testing-library/react-native";
import { Input } from "./Input";

test("renders label + placeholder and reports text changes", () => {
  const onChangeText = jest.fn();
  const { getByText, getByPlaceholderText } = render(
    <Input label="Email" placeholder="Enter your email" value="" onChangeText={onChangeText} />
  );
  getByText("Email");
  fireEvent.changeText(getByPlaceholderText("Enter your email"), "a@b.com");
  expect(onChangeText).toHaveBeenCalledWith("a@b.com");
});

test("password input toggles visibility via the eye control", () => {
  const { getByLabelText, getByPlaceholderText } = render(
    <Input label="Password" placeholder="Create a password" value="x" onChangeText={() => {}} secure />
  );
  const field = getByPlaceholderText("Create a password");
  expect(field.props.secureTextEntry).toBe(true);
  fireEvent.press(getByLabelText("Toggle password visibility"));
  expect(field.props.secureTextEntry).toBe(false);
});
```

- [ ] **Step 2: Run, verify fail** (`npm test src/components/Input.test.tsx`).

- [ ] **Step 3: Implement `Input.tsx`** (mint pill, ink border, label above, optional password eye via `@expo/vector-icons` Ionicons; uses `NeoShadow`? — inputs in the ref have a thin ink border but only a subtle/no shadow, so border only, no NeoShadow):
```tsx
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, TextInput, TextInputProps, View } from "react-native";

type Props = TextInputProps & { label: string; secure?: boolean };

export function Input({ label, secure, ...rest }: Props) {
  const [hidden, setHidden] = useState(!!secure);
  return (
    <View className="mb-4">
      <Text className="font-heading text-ink text-[16px] mb-2">{label}</Text>
      <View className="flex-row items-center bg-primary border-2 border-ink rounded-pill px-5">
        <TextInput
          placeholderTextColor="#0D1101AA"
          secureTextEntry={secure ? hidden : false}
          className="flex-1 py-4 font-body text-ink text-[16px]"
          {...rest}
        />
        {secure ? (
          <Pressable accessibilityLabel="Toggle password visibility" onPress={() => setHidden((h) => !h)} hitSlop={8}>
            <Ionicons name={hidden ? "eye-outline" : "eye-off-outline"} size={22} color="#0D1101" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
```
(`@expo/vector-icons` ships with Expo — no install needed. If missing, `npx expo install @expo/vector-icons`.)

- [ ] **Step 4: Run test green + tsc.**
- [ ] **Step 5: Commit** `feat: input component with password toggle`

---

## Task 5: OnboardingHeader + SocialRow

**Files:** Create `src/components/OnboardingHeader.tsx`, `src/components/SocialRow.tsx`

- [ ] **Step 1: `OnboardingHeader.tsx`** (back arrow left, optional Skip right)
```tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export function OnboardingHeader({ onSkip }: { onSkip?: () => void }) {
  const router = useRouter();
  return (
    <View className="flex-row items-center justify-between py-2">
      <Pressable accessibilityLabel="Go back" onPress={() => router.back()} hitSlop={8}>
        <Ionicons name="arrow-back" size={26} color="#0D1101" />
      </Pressable>
      {onSkip ? (
        <Pressable accessibilityRole="button" onPress={onSkip} hitSlop={8}>
          <Text className="font-heading text-ink text-[18px]">Skip</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
```

- [ ] **Step 2: `SocialRow.tsx`** ("OR" divider + 3 circular social buttons, placeholders with haptic)
```tsx
import { FontAwesome } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Pressable, Text, View } from "react-native";

const ITEMS = [
  { key: "google", name: "google" as const },
  { key: "apple", name: "apple" as const },
  { key: "facebook", name: "facebook" as const },
];

export function SocialRow() {
  return (
    <View className="items-center">
      <View className="flex-row items-center w-full my-4">
        <View className="flex-1 h-px bg-ink/30" />
        <Text className="font-heading text-ink text-[14px] mx-3">OR</Text>
        <View className="flex-1 h-px bg-ink/30" />
      </View>
      <View className="flex-row gap-5">
        {ITEMS.map((i) => (
          <Pressable
            key={i.key}
            accessibilityLabel={`Continue with ${i.key}`}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            className="w-14 h-14 rounded-pill bg-primary/40 items-center justify-center"
          >
            <FontAwesome name={i.name} size={24} color="#0D1101" />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
```
(Social auth is not wired this milestone — buttons are visual placeholders.)

- [ ] **Step 3: tsc clean. Commit** `feat: onboarding header + social row`

---

## Task 6: AuthScaffold (two-tone layout)

**Files:** Create `src/components/AuthScaffold.tsx`

- [ ] **Step 1: Implement** — green top region (holds optional `header` illustration/content) + lime rounded-top bottom sheet (scrollable `children`), keyboard-aware.
```tsx
import { PropsWithChildren, ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function AuthScaffold({ top, children }: PropsWithChildren<{ top?: ReactNode }>) {
  return (
    <View className="flex-1 bg-primary">
      <SafeAreaView className="flex-1" edges={["top"]}>
        {top ? <View className="px-5">{top}</View> : null}
        <View className="flex-1 mt-4 bg-secondary rounded-t-[32px] overflow-hidden">
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
            <ScrollView contentContainerClassName="px-6 pt-7 pb-10" keyboardShouldPersistTaps="handled">
              {children}
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </SafeAreaView>
    </View>
  );
}
```
(If `contentContainerClassName` isn't supported by the installed NativeWind, use `contentContainerStyle` with equivalent values.)

- [ ] **Step 2: tsc clean. Commit** `feat: auth scaffold layout`

---

## Task 7: Sign In screen — pixel-perfect

**Files:** Rewrite `app/(auth)/sign-in.tsx`

**READ `assets/design-refs/4. Sign In.png` and match it.** Structure: green top with the brain illustration (`images.signInIllustration`, centered, ~ height 200); lime sheet with "Sign In" heading, subtitle, Email `Input`, Password `Input` (secure), right-aligned "Forgot password?" link (routes nowhere yet — placeholder), primary `Button` "Sign In", `SocialRow`, footer "Don't have an account? Sign up" (Link to sign-up). Preserve the existing Supabase submit logic (`signInWithEmail` + `mapAuthError`, loading state, `router.replace("/(tabs)")`).

- [ ] **Step 1: Rewrite the screen** composing `AuthScaffold` + `Input` + `Button` + `SocialRow` + the brain `Image`. Keep submit/error/loading from the Foundation version. Use corrected subtitle copy. "Forgot password?" is a styled `Text`/`Pressable` placeholder (no nav target this milestone).
- [ ] **Step 2: Verify** `npx tsc --noEmit` + `npx expo export --platform web --output-dir /tmp/p2-signin` (bundles) + `npm test` (still green). Note runtime visual check needs a device (human).
- [ ] **Step 3: Commit** `feat: pixel-perfect sign in screen`

---

## Task 8: Sign Up screen — pixel-perfect

**Files:** Rewrite `app/(auth)/sign-up.tsx`

**READ `assets/design-refs/5. Sign up.png` and match it.** Structure: green top (no illustration, just spacing); lime sheet with "Sign Up" heading + subtitle, "First Name"/"Email"/"Password"(secure) `Input`s, primary `Button` "Sign Up", `SocialRow`, footer "Do you have an account? Sign in" (Link to sign-in). Preserve Supabase `signUpWithEmail(name,email,password)` + error/loading + `router.replace("/(tabs)")`.

- [ ] **Step 1: Rewrite** composing the primitives; corrected subtitle copy.
- [ ] **Step 2: Verify** tsc + web export + `npm test`.
- [ ] **Step 3: Commit** `feat: pixel-perfect sign up screen`

---

## Task 9: Animated Splash screen

**Files:** Create `src/features/auth/SplashScreen.tsx`; modify `app/index.tsx`

**READ `assets/design-refs/1. splash Screen.png`.** Full mint background; faded sun-ray graphic + the "mindshine" wordmark with smiley (`images.mindshineSplash` or `images.splashStar` — verify which asset is the wordmark vs the rays; if the rays are a separate asset use it, else draw rays with Reanimated-rotating Views); bottom lime blob with "Loading NN%". Subtle Reanimated animation: gentle scale/opacity pulse on the rays + the loading number counting up.

- [ ] **Step 1: Implement `SplashScreen.tsx`** — a self-contained full-screen component, props `{ progress?: number }` (or it animates a fake 0→100 over ~1.2s). Mint bg, centered wordmark image, animated rays, bottom lime blob with `Loading {n}%`. Use Reanimated for the pulse; no external state required.
- [ ] **Step 2: Wire into `app/index.tsx`** — replace the `ActivityIndicator` branch: while `!initialized`, render `<SplashScreen />` instead of the spinner. Keep the redirect logic once `initialized`.
```tsx
import { Redirect } from "expo-router";
import { useAuth } from "@/src/features/auth/useAuth";
import { SplashScreen } from "@/src/features/auth/SplashScreen";

export default function Index() {
  const { session, initialized } = useAuth();
  if (!initialized) return <SplashScreen />;
  return <Redirect href={session ? "/(tabs)" : "/(auth)/sign-in"} />;
}
```
- [ ] **Step 3: Verify** tsc + web export + `npm test`.
- [ ] **Step 4: Commit** `feat: animated splash screen`

---

## Self-Review

- **Coverage:** neo-brutalist primitives (Tasks 2–6) → Sign In (7), Sign Up (8), Splash (9). Assets normalized (1). Onboarding/personalization intentionally deferred to Plan 3.
- **Definition of done:** `npm test` green; `npx tsc --noEmit` clean; web export bundles; Sign In/Up/Splash visually match their refs (final visual confirmation on device is a human step). Auth still functions (logic unchanged).
- **No placeholder steps**; every code step shows code; primitive APIs (`Button`, `Input`, `AuthScaffold`, `NeoShadow`) are consistent across tasks.

## Next plan
**Plan 3 — Onboarding & Personalization:** SVG icon support (`react-native-svg-transformer`), `SelectableCard`/`SelectableRow`, Onboarding intro ("Find your calm"), Mood picker, Personalize goal + experience, save selections to `profiles`, and wire the full first-run flow (Splash → Onboarding → Auth → Personalize → Home).
