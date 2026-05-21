# Mindshine Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Mindshine Expo app foundation — a running, themed, Supabase-connected app with a working auth flow, navigation skeleton, design system, and base component library — that the feature milestones build on.

**Architecture:** Expo (file-based Expo Router) + TypeScript. NativeWind v4 for styling, driven by design tokens extracted from the Figma variables. Supabase for auth/data/storage, with the session persisted on-device and exposed through an auth provider that gates routing. TanStack Query + Zustand are installed and provider-wired now; feature data/use comes in later plans.

**Tech Stack:** Expo Router · TypeScript · NativeWind v4 (Tailwind) · Supabase (`@supabase/supabase-js`) · TanStack Query · Zustand · Reanimated · expo-haptics · expo-font (Inter, M PLUS Rounded 1c) · Jest + React Native Testing Library.

**Scope note:** This plan delivers auth screens and base components that are *functionally complete* but only *approximately* styled. Pixel-perfect polish against exported Figma refs happens in the per-feature plans. Before polishing, the user must export design refs into `assets/design-refs/`.

---

## File Structure

```
package.json, app.json, tsconfig.json
babel.config.js, metro.config.js, tailwind.config.js, global.css, nativewind-env.d.ts
.env                      # gitignored — Supabase URL + publishable key
.gitignore
jest.config.js, jest-setup.ts

app/
  _layout.tsx             # providers (Query, Auth, GestureHandler), fonts, auth gate, global.css import
  index.tsx               # splash → redirect by session state
  (auth)/
    _layout.tsx           # stack for unauthenticated routes
    sign-in.tsx
    sign-up.tsx
  (tabs)/
    _layout.tsx           # Today / Explore / Profile tab bar (placeholder screens)
    index.tsx             # Home placeholder
    explore.tsx           # placeholder
    profile.tsx           # has working Sign Out

src/
  theme/
    tokens.ts             # Figma-derived color/space/radius/type tokens
    tokens.test.ts
  lib/
    supabase.ts           # supabase client + AppState autorefresh
    queryClient.ts        # TanStack Query client
  features/auth/
    AuthProvider.tsx      # session state + onAuthStateChange
    useAuth.ts            # context hook
    auth.api.ts           # signInWithPassword / signUp / signOut wrappers
  components/
    Button.tsx + Button.test.tsx
    Pill.tsx
    Card.tsx
    Typography.tsx        # Heading / Body text components bound to fonts
    Screen.tsx            # safe-area screen wrapper
  store/
    ui.ts                 # zustand UI store (stub)

supabase/
  migrations/0001_init.sql  # tables + RLS
  seed.sql                  # categories + sample royalty-free tracks

assets/
  design-refs/            # (empty) user drops exported Figma PNGs here
  images/                 # (empty) extracted illustrations/icons
  fonts/                  # bundled font files
```

---

## Task 1: Scaffold the Expo project

**Files:**
- Create: entire base project in `/Users/user/Documents/ReactNative`

- [ ] **Step 1: Scaffold into the current (empty) directory**

Run:
```bash
cd /Users/user/Documents/ReactNative
npx create-expo-app@latest . --template default
```
Expected: project files created (`app/`, `package.json`, `app.json`). The default template ships Expo Router + TypeScript.

- [ ] **Step 2: Reset to a clean app dir**

Run:
```bash
npm run reset-project
```
When prompted, keep the example moved aside, then delete it:
```bash
rm -rf app-example
```
Expected: `app/` contains a minimal `_layout.tsx` + `index.tsx`.

- [ ] **Step 3: Verify it boots**

Run:
```bash
npx expo start --web --port 8081
```
Expected: bundles with no errors (Ctrl-C to stop). If a device is available, `npx expo start` and open in Expo Go.

- [ ] **Step 4: Initialize git + commit**

Run:
```bash
git init && git add -A && git commit -m "chore: scaffold expo app"
```
Expected: initial commit created.

---

## Task 2: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install runtime + styling deps with Expo's installer (pins compatible versions)**

Run:
```bash
npx expo install nativewind tailwindcss react-native-reanimated react-native-gesture-handler \
  react-native-safe-area-context react-native-screens expo-haptics expo-secure-store \
  @react-native-async-storage/async-storage react-native-url-polyfill \
  @supabase/supabase-js @tanstack/react-query zustand expo-font
```
Expected: all installed, Expo picks SDK-compatible versions.

- [ ] **Step 2: Install dev/test deps**

Run:
```bash
npm install -D jest jest-expo @testing-library/react-native @testing-library/jest-native @types/jest
```
Expected: dev deps added.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json && git commit -m "chore: install core dependencies"
```

---

## Task 3: Configure NativeWind v4

> NativeWind v4 setup is version-sensitive. These files match NativeWind 4.x with Expo. If `npx expo start` reports a NativeWind/Tailwind config error, consult the installed version's docs (`node_modules/nativewind/README.md`) and adjust the global.css imports / metro wrapper accordingly, then re-verify Step 6.

**Files:**
- Create: `tailwind.config.js`, `global.css`, `metro.config.js`, `nativewind-env.d.ts`
- Modify: `babel.config.js`

- [ ] **Step 1: `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: { extend: {} }, // extended in Task 4 with Figma tokens
  plugins: [],
};
```

- [ ] **Step 2: `global.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 3: `babel.config.js`**

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

- [ ] **Step 4: `metro.config.js`**

```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, { input: "./global.css" });
```

- [ ] **Step 5: `nativewind-env.d.ts`**

```ts
/// <reference types="nativewind/types" />
```

- [ ] **Step 6: Import global.css and verify styling works**

Add `import "../global.css";` to the top of `app/_layout.tsx` (will be rewritten in Task 7 — keep the import).
Temporarily set the index screen content to `<View className="flex-1 items-center justify-center bg-emerald-500"><Text className="text-white text-2xl">NativeWind OK</Text></View>`.

Run: `npx expo start -c` (clear cache), open the app.
Expected: green full-screen background with white text. Revert the temporary index change after verifying.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "chore: configure nativewind v4"
```

---

## Task 4: Design tokens + Tailwind theme

**Files:**
- Create: `src/theme/tokens.ts`, `src/theme/tokens.test.ts`
- Modify: `tailwind.config.js`

- [ ] **Step 1: Write the failing test**

`src/theme/tokens.test.ts`:
```ts
import { colors, radii, fontFamily } from "./tokens";

test("brand colors match Figma variables", () => {
  expect(colors.primary.DEFAULT).toBe("#22D795");
  expect(colors.secondary.DEFAULT).toBe("#D3F761");
  expect(colors.ink.DEFAULT).toBe("#0D1101");
});

test("exposes a card radius and heading font", () => {
  expect(radii.card).toBe(24);
  expect(fontFamily.heading).toBe("MPLUSRounded1c_700Bold");
});
```

- [ ] **Step 2: Run it, verify it fails**

Run: `npx jest src/theme/tokens.test.ts`
Expected: FAIL — cannot find module `./tokens`.

- [ ] **Step 3: Implement `src/theme/tokens.ts`**

```ts
// Design tokens derived from Figma "Mindshine App UI Kit" variables.
export const colors = {
  primary: { DEFAULT: "#22D795", 100: "#4EDFAA", 200: "#00A462", 300: "#008A49" },
  secondary: { DEFAULT: "#D3F761", 400: "#6D9100", 500: "#547800" },
  ink: { DEFAULT: "#0D1101", 800: "#01130C" },
  white: "#FFFFFF",
} as const;

export const radii = { sm: 8, md: 16, card: 24, pill: 999 } as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const fontFamily = {
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  heading: "MPLUSRounded1c_700Bold",
} as const;

// Body type scale from Figma (size / lineHeight).
export const fontSize = {
  xs: [12, 20],
  sm: [14, 22],
  base: [16, 24],
  lg: [18, 28],
  h6: [20, 22],
} as const;
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npx jest src/theme/tokens.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Wire tokens into `tailwind.config.js` `theme.extend`**

```js
const { colors, radii, spacing, fontFamily } = require("./src/theme/tokens");

// inside module.exports:
theme: {
  extend: {
    colors: {
      primary: colors.primary,
      secondary: colors.secondary,
      ink: colors.ink,
    },
    borderRadius: {
      card: `${radii.card}px`,
      pill: `${radii.pill}px`,
    },
    fontFamily: {
      body: [fontFamily.body],
      medium: [fontFamily.bodyMedium],
      heading: [fontFamily.heading],
    },
  },
},
```
(Keep `presets`/`content` from Task 3.)

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: design tokens + tailwind theme"
```

---

## Task 5: Fonts

**Files:**
- Modify: `package.json` (add font packages), `app/_layout.tsx` (load fonts — full rewrite happens in Task 7)

- [ ] **Step 1: Install Google Fonts packages**

Run:
```bash
npx expo install @expo-google-fonts/inter @expo-google-fonts/m-plus-rounded-1c expo-splash-screen
```
Expected: installed.

- [ ] **Step 2: Load fonts (interim; consolidated in Task 7)**

In `app/_layout.tsx`, load fonts and hold the splash screen until ready:
```tsx
import { Inter_400Regular, Inter_500Medium } from "@expo-google-fonts/inter";
import { MPLUSRounded1c_700Bold } from "@expo-google-fonts/m-plus-rounded-1c";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

// inside the root component:
const [loaded] = useFonts({ Inter_400Regular, Inter_500Medium, MPLUSRounded1c_700Bold });
useEffect(() => { if (loaded) SplashScreen.hideAsync(); }, [loaded]);
if (!loaded) return null;
```
The token font keys (`Inter_400Regular`, `MPLUSRounded1c_700Bold`) must match these loaded names.

- [ ] **Step 3: Verify**

Run: `npx expo start -c`. Render a `<Text style={{ fontFamily: "MPLUSRounded1c_700Bold" }}>Mindshine</Text>` temporarily.
Expected: the rounded display font renders. Remove the temporary text.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: load Inter + M PLUS Rounded 1c fonts"
```

---

## Task 6: Environment + Supabase client

**Files:**
- Create: `.env`, `src/lib/supabase.ts`, `src/lib/queryClient.ts`
- Modify: `.gitignore`, `app.json`

- [ ] **Step 1: Ensure `.env` is gitignored BEFORE creating it**

Confirm `.gitignore` contains `.env` (add it if missing):
```
.env
.env.*
```

- [ ] **Step 2: Create `.env` (real values filled from the credentials provided in chat — never commit)**

```
EXPO_PUBLIC_SUPABASE_URL=https://azcefcysyhicwbnsgxqd.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<paste the sb_publishable_... key>
```
Verify it is ignored: `git status --porcelain .env` prints nothing.

- [ ] **Step 3: Create `src/lib/supabase.ts`**

```ts
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState } from "react-native";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(url, key, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Refresh tokens while the app is foregrounded.
AppState.addEventListener("change", (state) => {
  if (state === "active") supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});
```

- [ ] **Step 4: Create `src/lib/queryClient.ts`**

```ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 60_000 } },
});
```

- [ ] **Step 5: Verify the client constructs**

Add a temporary log in `app/index.tsx`: `import { supabase } from "@/src/lib/supabase"; console.log("supabase url ok", !!supabase);`
Run `npx expo start -c`; expected: no crash, log prints `true`. Remove the temporary log.
(Configure the `@` path alias in `tsconfig.json` `compilerOptions.paths` as `{"@/*": ["./*"]}` if not already present.)

- [ ] **Step 6: Commit (without `.env`)**

```bash
git add src/lib .gitignore tsconfig.json && git commit -m "feat: supabase + query clients"
```
Confirm `.env` is NOT staged.

---

## Task 7: Database schema, RLS, and seed

> Run these SQL files in the Supabase dashboard → SQL Editor (or via the Supabase CLI if linked). They are committed to the repo as the source of truth.

**Files:**
- Create: `supabase/migrations/0001_init.sql`, `supabase/seed.sql`

- [ ] **Step 1: `supabase/migrations/0001_init.sql`**

```sql
-- Profiles (1:1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text,
  avatar_url text,
  streak_count int not null default 0,
  onboarding_done boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  accent_color text not null
);

create table public.tracks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  category_id uuid references public.categories on delete set null,
  duration_sec int not null,
  audio_path text not null,
  image_url text
);

create table public.favorites (
  user_id uuid references auth.users on delete cascade,
  track_id uuid references public.tracks on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, track_id)
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  track_id uuid references public.tracks on delete cascade,
  played_sec int not null default 0,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row when a user signs up.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, name) values (new.id, new.raw_user_meta_data->>'name');
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles  enable row level security;
alter table public.favorites enable row level security;
alter table public.sessions  enable row level security;
alter table public.categories enable row level security;
alter table public.tracks    enable row level security;

-- Catalog is world-readable to authenticated users.
create policy "read categories" on public.categories for select to authenticated using (true);
create policy "read tracks"     on public.tracks     for select to authenticated using (true);

-- Users manage only their own rows.
create policy "own profile read"   on public.profiles  for select using (auth.uid() = id);
create policy "own profile update" on public.profiles  for update using (auth.uid() = id);
create policy "own favorites"      on public.favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own sessions"       on public.sessions  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

- [ ] **Step 2: Create the public Storage bucket for audio**

In Supabase dashboard → Storage: create a bucket named `audio`, set it **public** (read), so seeded sample tracks stream via public URLs. (Later plans can switch to signed URLs.)

- [ ] **Step 3: `supabase/seed.sql` — categories + royalty-free sample tracks**

> Replace the `audio_path` URLs with the actual public URLs of royalty-free MP3s uploaded to the `audio` bucket (or trusted CDN URLs of openly-licensed ambient tracks). Keep 4 categories matching the Home design: Meditation, Sleep, Move, Focus.

```sql
insert into public.categories (id, name, accent_color) values
  ('11111111-1111-1111-1111-111111111111', 'Meditation', '#22D795'),
  ('22222222-2222-2222-2222-222222222222', 'Sleep',      '#00A462'),
  ('33333333-3333-3333-3333-333333333333', 'Move',       '#D3F761'),
  ('44444444-4444-4444-4444-444444444444', 'Focus',      '#6D9100');

insert into public.tracks (title, subtitle, category_id, duration_sec, audio_path, image_url) values
  ('Morning calm', 'Stress relief', '11111111-1111-1111-1111-111111111111', 600, '<public-url-1.mp3>', null),
  ('Stress release', 'Meditation',  '11111111-1111-1111-1111-111111111111', 480, '<public-url-2.mp3>', null),
  ('Night sky cast', 'Sleep',       '22222222-2222-2222-2222-222222222222', 1800, '<public-url-3.mp3>', null),
  ('Morning yoga', 'Move',          '33333333-3333-3333-3333-333333333333', 900, '<public-url-4.mp3>', null),
  ('Deep work', 'Focus',            '44444444-4444-4444-4444-444444444444', 1500, '<public-url-5.mp3>', null);
```

- [ ] **Step 4: Apply + verify**

Run both SQL files in the SQL Editor. Then in the dashboard Table Editor confirm 4 categories and 5 tracks exist, and that RLS is enabled on all five tables.

- [ ] **Step 5: Commit**

```bash
git add supabase && git commit -m "feat: supabase schema, rls, seed"
```

---

## Task 8: Auth API + provider + hook

**Files:**
- Create: `src/features/auth/auth.api.ts`, `src/features/auth/AuthProvider.tsx`, `src/features/auth/useAuth.ts`, `src/features/auth/auth.api.test.ts`

- [ ] **Step 1: Write failing test for the API wrapper error mapping**

`src/features/auth/auth.api.test.ts`:
```ts
import { mapAuthError } from "./auth.api";

test("maps common supabase auth errors to friendly copy", () => {
  expect(mapAuthError({ message: "Invalid login credentials" } as any))
    .toBe("That email or password doesn't look right.");
  expect(mapAuthError({ message: "User already registered" } as any))
    .toBe("An account with this email already exists.");
  expect(mapAuthError(null)).toBe("");
});
```

- [ ] **Step 2: Run, verify fail**

Run: `npx jest src/features/auth/auth.api.test.ts`
Expected: FAIL — `mapAuthError` not exported.

- [ ] **Step 3: Implement `src/features/auth/auth.api.ts`**

```ts
import type { AuthError } from "@supabase/supabase-js";
import { supabase } from "@/src/lib/supabase";

export function mapAuthError(error: AuthError | null): string {
  if (!error) return "";
  const m = error.message.toLowerCase();
  if (m.includes("invalid login")) return "That email or password doesn't look right.";
  if (m.includes("already registered")) return "An account with this email already exists.";
  if (m.includes("password")) return "Password must be at least 6 characters.";
  return "Something went wrong. Please try again.";
}

export async function signInWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error };
}

export async function signUpWithEmail(name: string, email: string, password: string) {
  const { error } = await supabase.auth.signUp({
    email, password, options: { data: { name } },
  });
  return { error };
}

export async function signOut() {
  await supabase.auth.signOut();
}
```

- [ ] **Step 4: Run, verify pass**

Run: `npx jest src/features/auth/auth.api.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Implement `src/features/auth/AuthProvider.tsx`**

```tsx
import { createContext, PropsWithChildren, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/src/lib/supabase";

type AuthState = { session: Session | null; initialized: boolean };
export const AuthContext = createContext<AuthState>({ session: null, initialized: false });

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setInitialized(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ session, initialized }}>{children}</AuthContext.Provider>;
}
```

- [ ] **Step 6: Implement `src/features/auth/useAuth.ts`**

```ts
import { useContext } from "react";
import { AuthContext } from "./AuthProvider";

export const useAuth = () => useContext(AuthContext);
```

- [ ] **Step 7: Commit**

```bash
git add src/features/auth && git commit -m "feat: auth api, provider, hook"
```

---

## Task 9: Base UI components

**Files:**
- Create: `src/components/Typography.tsx`, `src/components/Button.tsx`, `src/components/Button.test.tsx`, `src/components/Pill.tsx`, `src/components/Card.tsx`, `src/components/Screen.tsx`

- [ ] **Step 1: `src/components/Typography.tsx`**

```tsx
import { Text, TextProps } from "react-native";

export function Heading({ className = "", ...p }: TextProps & { className?: string }) {
  return <Text className={`font-heading text-ink text-[20px] leading-[22px] ${className}`} {...p} />;
}
export function Body({ className = "", ...p }: TextProps & { className?: string }) {
  return <Text className={`font-body text-ink text-[16px] leading-[24px] ${className}`} {...p} />;
}
```

- [ ] **Step 2: Write failing test for Button**

`src/components/Button.test.tsx`:
```tsx
import { render, fireEvent } from "@testing-library/react-native";
import { Button } from "./Button";

test("renders label and fires onPress", () => {
  const onPress = jest.fn();
  const { getByText } = render(<Button label="Play Now" onPress={onPress} />);
  fireEvent.press(getByText("Play Now"));
  expect(onPress).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 3: Run, verify fail**

Run: `npx jest src/components/Button.test.tsx`
Expected: FAIL — cannot find `./Button`.

- [ ] **Step 4: Implement `src/components/Button.tsx` (with haptics + press animation)**

```tsx
import * as Haptics from "expo-haptics";
import { Pressable, Text } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = { label: string; onPress: () => void; variant?: "primary" | "secondary"; disabled?: boolean };

export function Button({ label, onPress, variant = "primary", disabled }: Props) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const bg = variant === "primary" ? "bg-primary" : "bg-secondary";

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={disabled}
      onPressIn={() => { scale.value = withTiming(0.96, { duration: 80 }); }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 120 }); }}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
      style={style}
      className={`${bg} rounded-pill px-6 py-4 items-center ${disabled ? "opacity-50" : ""}`}
    >
      <Text className="font-medium text-ink text-[16px]">{label}</Text>
    </AnimatedPressable>
  );
}
```

- [ ] **Step 5: Run, verify pass**

Run: `npx jest src/components/Button.test.tsx`
Expected: PASS. (If Reanimated errors in Jest, confirm `jest-setup.ts` from Task 11 mocks it; this task may be completed alongside Task 11.)

- [ ] **Step 6: `src/components/Pill.tsx`**

```tsx
import { Text, View } from "react-native";

export function Pill({ label, filled }: { label: string; filled?: boolean }) {
  return (
    <View className={`rounded-pill px-4 py-2 border ${filled ? "bg-ink border-ink" : "border-ink"}`}>
      <Text className={`font-medium text-[14px] ${filled ? "text-white" : "text-ink"}`}>{label}</Text>
    </View>
  );
}
```

- [ ] **Step 7: `src/components/Card.tsx`**

```tsx
import { View, ViewProps } from "react-native";

export function Card({ className = "", ...p }: ViewProps & { className?: string }) {
  return <View className={`rounded-card p-4 ${className}`} {...p} />;
}
```

- [ ] **Step 8: `src/components/Screen.tsx`**

```tsx
import { PropsWithChildren } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function Screen({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className={`flex-1 px-5 ${className}`}>{children}</View>
    </SafeAreaView>
  );
}
```

- [ ] **Step 9: Commit**

```bash
git add src/components && git commit -m "feat: base ui components"
```

---

## Task 10: Navigation skeleton + auth gate + screens

**Files:**
- Rewrite: `app/_layout.tsx`, `app/index.tsx`
- Create: `app/(auth)/_layout.tsx`, `app/(auth)/sign-in.tsx`, `app/(auth)/sign-up.tsx`, `app/(tabs)/_layout.tsx`, `app/(tabs)/index.tsx`, `app/(tabs)/explore.tsx`, `app/(tabs)/profile.tsx`

- [ ] **Step 1: `app/_layout.tsx` — providers + fonts + gate**

```tsx
import "../global.css";
import { Inter_400Regular, Inter_500Medium } from "@expo-google-fonts/inter";
import { MPLUSRounded1c_700Bold } from "@expo-google-fonts/m-plus-rounded-1c";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/src/features/auth/AuthProvider";
import { queryClient } from "@/src/lib/queryClient";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({ Inter_400Regular, Inter_500Medium, MPLUSRounded1c_700Bold });
  useEffect(() => { if (loaded) SplashScreen.hideAsync(); }, [loaded]);
  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Slot />
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

- [ ] **Step 2: `app/index.tsx` — splash redirect by session**

```tsx
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/src/features/auth/useAuth";

export default function Index() {
  const { session, initialized } = useAuth();
  if (!initialized) {
    return <View className="flex-1 items-center justify-center bg-primary"><ActivityIndicator color="#0D1101" /></View>;
  }
  return <Redirect href={session ? "/(tabs)" : "/(auth)/sign-in"} />;
}
```

- [ ] **Step 3: `app/(auth)/_layout.tsx`**

```tsx
import { Stack } from "expo-router";
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

- [ ] **Step 4: `app/(auth)/sign-in.tsx` — functional**

```tsx
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { TextInput, View } from "react-native";
import { Button } from "@/src/components/Button";
import { Screen } from "@/src/components/Screen";
import { Body, Heading } from "@/src/components/Typography";
import { mapAuthError, signInWithEmail } from "@/src/features/auth/auth.api";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    const { error } = await signInWithEmail(email.trim(), password);
    setLoading(false);
    if (error) return setError(mapAuthError(error));
    router.replace("/(tabs)");
  }

  return (
    <Screen className="justify-center">
      <Heading className="mb-6">Welcome back</Heading>
      <TextInput placeholder="Email" autoCapitalize="none" keyboardType="email-address"
        value={email} onChangeText={setEmail}
        className="border border-ink/20 rounded-card px-4 py-3 mb-3 font-body" />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword}
        className="border border-ink/20 rounded-card px-4 py-3 mb-3 font-body" />
      {error ? <Body className="text-red-600 mb-3 text-[14px]">{error}</Body> : null}
      <Button label={loading ? "Signing in…" : "Sign In"} disabled={loading} onPress={submit} />
      <View className="flex-row justify-center mt-4">
        <Body className="text-[14px]">No account? </Body>
        <Link href="/(auth)/sign-up"><Body className="text-[14px] font-medium text-primary-200">Sign up</Body></Link>
      </View>
    </Screen>
  );
}
```

- [ ] **Step 5: `app/(auth)/sign-up.tsx` — functional**

```tsx
import { useRouter } from "expo-router";
import { useState } from "react";
import { TextInput } from "react-native";
import { Button } from "@/src/components/Button";
import { Screen } from "@/src/components/Screen";
import { Body, Heading } from "@/src/components/Typography";
import { mapAuthError, signUpWithEmail } from "@/src/features/auth/auth.api";

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    const { error } = await signUpWithEmail(name.trim(), email.trim(), password);
    setLoading(false);
    if (error) return setError(mapAuthError(error));
    router.replace("/(tabs)");
  }

  return (
    <Screen className="justify-center">
      <Heading className="mb-6">Create your account</Heading>
      <TextInput placeholder="Name" value={name} onChangeText={setName}
        className="border border-ink/20 rounded-card px-4 py-3 mb-3 font-body" />
      <TextInput placeholder="Email" autoCapitalize="none" keyboardType="email-address"
        value={email} onChangeText={setEmail}
        className="border border-ink/20 rounded-card px-4 py-3 mb-3 font-body" />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword}
        className="border border-ink/20 rounded-card px-4 py-3 mb-3 font-body" />
      {error ? <Body className="text-red-600 mb-3 text-[14px]">{error}</Body> : null}
      <Button label={loading ? "Creating…" : "Sign Up"} disabled={loading} onPress={submit} />
    </Screen>
  );
}
```

- [ ] **Step 6: `app/(tabs)/_layout.tsx` — tab bar + auth guard**

```tsx
import { Redirect, Tabs } from "expo-router";
import { useAuth } from "@/src/features/auth/useAuth";

export default function TabsLayout() {
  const { session, initialized } = useAuth();
  if (initialized && !session) return <Redirect href="/(auth)/sign-in" />;
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: "#0D1101" }}>
      <Tabs.Screen name="index" options={{ title: "Today" }} />
      <Tabs.Screen name="explore" options={{ title: "Explore" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
```

- [ ] **Step 7: Placeholder tab screens**

`app/(tabs)/index.tsx`:
```tsx
import { Screen } from "@/src/components/Screen";
import { Heading } from "@/src/components/Typography";
export default function Home() { return <Screen className="justify-center"><Heading>Today</Heading></Screen>; }
```
`app/(tabs)/explore.tsx`:
```tsx
import { Screen } from "@/src/components/Screen";
import { Heading } from "@/src/components/Typography";
export default function Explore() { return <Screen className="justify-center"><Heading>Explore</Heading></Screen>; }
```
`app/(tabs)/profile.tsx` (with working sign out):
```tsx
import { Button } from "@/src/components/Button";
import { Screen } from "@/src/components/Screen";
import { Heading } from "@/src/components/Typography";
import { signOut } from "@/src/features/auth/auth.api";
export default function Profile() {
  return (
    <Screen className="justify-center">
      <Heading className="mb-6">Profile</Heading>
      <Button label="Sign Out" variant="secondary" onPress={signOut} />
    </Screen>
  );
}
```

- [ ] **Step 8: Verify the full auth loop on device/simulator**

Run `npx expo start -c`. Manually verify:
1. Cold start with no session → lands on Sign In.
2. Sign Up with a new email → lands on tabs (Today).
3. Kill + reopen app → still on tabs (session persisted).
4. Profile → Sign Out → returns to Sign In.
Expected: all four pass. In Supabase dashboard, confirm a `profiles` row was auto-created for the new user.

- [ ] **Step 9: Commit**

```bash
git add app && git commit -m "feat: navigation skeleton + auth gate + auth screens"
```

---

## Task 11: Test runner configuration

**Files:**
- Create: `jest.config.js`, `jest-setup.ts`
- Modify: `package.json` (test script)

- [ ] **Step 1: `jest.config.js`**

```js
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect", "<rootDir>/jest-setup.ts"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|nativewind|react-native-css-interop|@supabase/.*))",
  ],
};
```

- [ ] **Step 2: `jest-setup.ts` (Reanimated + haptics mocks)**

```ts
import "react-native-gesture-handler/jestSetup";

jest.mock("react-native-reanimated", () => require("react-native-reanimated/mock"));
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light", Medium: "medium", Heavy: "heavy" },
  NotificationFeedbackType: { Success: "success", Error: "error" },
}));
```

- [ ] **Step 3: Add the test script to `package.json`**

```json
"scripts": { "test": "jest" }
```

- [ ] **Step 4: Run the whole suite**

Run: `npm test`
Expected: all tests pass — `tokens.test.ts`, `auth.api.test.ts`, `Button.test.tsx`.

- [ ] **Step 5: Commit**

```bash
git add jest.config.js jest-setup.ts package.json && git commit -m "test: configure jest + rtl"
```

---

## Task 12: Asset intake placeholders + README note

**Files:**
- Create: `assets/design-refs/.gitkeep`, `assets/images/.gitkeep`, `docs/DESIGN-REFS.md`

- [ ] **Step 1: Create the intake folders**

```bash
mkdir -p assets/design-refs assets/images && touch assets/design-refs/.gitkeep assets/images/.gitkeep
```

- [ ] **Step 2: `docs/DESIGN-REFS.md` — export instructions for the user**

```md
# Design references

Export each MVP screen from Figma as **PNG @2x** into `assets/design-refs/`,
named `NN-screen.png` (e.g. `15-home.png`, `04-sign-in.png`).
Export illustrations/icons into `assets/images/`.
These drive the pixel-perfect polish pass in the feature plans.
```

- [ ] **Step 3: Commit**

```bash
git add assets docs/DESIGN-REFS.md && git commit -m "chore: design-ref intake folders + instructions"
```

---

## Self-Review

- **Spec coverage:** Tech stack (§3) → Tasks 1–3, 5, 11. Design system (§4) → Tasks 3–5, 9. Architecture/nav (§5) → Tasks 8, 10. Data model (§6) → Task 7. Config/secrets (§11) → Task 6. Hand-off (§12) → Task 12. Audio (§7), motion-everywhere (§8), error states for data (§9 spec) are intentionally deferred to feature plans (player, screens) — auth error handling is covered in Task 8/10.
- **Definition of done:** `npm test` green; cold-start → sign up → persist → sign out loop verified on device; tokens drive NativeWind classes; `.env` never committed.

---

## Next plans (not yet written — need design refs)

- **Plan 2 — Home + Explore:** content data layer (TanStack Query hooks over `tracks`/`categories`), pixel-perfect Home (greeting, streak pills, Today's pick, category grid) + Explore, against exported refs.
- **Plan 3 — Player + Favourites:** expo-audio player store, mini-player, full-screen player with animated seek + haptics, favourites toggle + list, `sessions` writes.
- **Plan 4 — Profile + My Progress + polish:** profile + progress/streaks from `sessions`, onboarding/personalize/splash screens, motion + final pixel-perfect pass across all screens.
