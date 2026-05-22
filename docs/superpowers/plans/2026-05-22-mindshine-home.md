# Mindshine Plan 3 — Home + Content Data Layer

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Build the pixel-perfect Home (Today) screen backed by a real Supabase content data layer (categories + tracks), plus the styled bottom tab bar.

**Architecture:** A `content` feature exposes TanStack Query hooks over Supabase (`tracks` joined to `categories`). Tracks are mapped to local illustration assets by title. A `profile` hook reads the signed-in user's name/avatar/streak. Home composes a header (greeting + streak pills), a "Today's pick" card, and a 2-column track grid, with loading/empty/error states. No audio playback yet (cards trigger a haptic placeholder; wiring to the player comes in the Player milestone).

**Tech Stack:** Expo Router · NativeWind v4 · TanStack Query · Supabase · Reanimated/expo-haptics · @expo/vector-icons.

**Design ref (READ while building):** `assets/design-refs/15. Home page.png`.

**PREREQUISITE (human):** The DB migration is already applied. To see content, run `supabase/seed.sql` in the Supabase dashboard (SQL Editor) so `categories` + `tracks` have rows. The screen handles the empty state gracefully if not seeded. (Audio bucket/playback NOT needed this milestone.)

**Design notes from the ref:**
- Lime (`bg-secondary`) header zone: circular avatar (left), greeting "<weather> <Name>! Good <time>" + subtitle "Start your day with mindshine!", a circular outline bell button (right). Two pills below: "{n}-day streak" (ink-filled) + "Keep it going" (outline).
- Green (`bg-primary`) content zone (rounded top): a "Today's pick" lime card (label, big title, "{min} min · {subtitle}", "Play Now" mint button, illustration on the right) + a 2-col grid of track cards (illustration, small category label, bold title, "{min} min"), neo-brutalist (ink border + hard shadow).
- Bottom tab bar: dark-green bar, 3 tabs Today / Explore / Profile with icons; active = white/ink.

---

## File Structure
```
src/features/content/
  types.ts            # Category, Track, TrackWithCategory
  illustrations.ts    # illustrationForTrack(title) → local asset  (+ test)
  content.api.ts      # fetchTracks(), fetchCategories() via supabase
  useContent.ts       # useTracks(), useCategories() TanStack Query hooks
src/features/profile/
  useProfile.ts       # current user's profile row (name/avatar/streak)
src/features/home/
  greeting.ts         # greetingForHour(hour)  (+ test)
  HomeHeader.tsx      # avatar + greeting + bell + streak pills
src/components/
  Avatar.tsx          # circular avatar (image or initial)
  TrackCard.tsx       # grid card
  TodaysPickCard.tsx  # featured card
app/(tabs)/index.tsx  # Home screen (rewrite)
app/(tabs)/_layout.tsx # styled tab bar (modify)
```

---

## Task 1: Content types, illustration map, data layer

**Files:** create `src/features/content/{types.ts,illustrations.ts,illustrations.test.ts,content.api.ts,useContent.ts}`

- [ ] **Step 1: `types.ts`**
```ts
export type Category = { id: string; name: string; accent_color: string };
export type Track = {
  id: string;
  title: string;
  subtitle: string | null;
  category_id: string | null;
  duration_sec: number;
  audio_path: string;
  image_url: string | null;
};
export type TrackWithCategory = Track & { categories: Pick<Category, "name" | "accent_color"> | null };
```

- [ ] **Step 2: Write failing test `illustrations.test.ts`**
```ts
import { illustrationForTrack } from "./illustrations";
import { images } from "@/src/theme/assets";

test("maps known track titles to local illustrations (case-insensitive)", () => {
  expect(illustrationForTrack("Stress release")).toBe(images.stressRelease);
  expect(illustrationForTrack("NIGHT SKY CAST")).toBe(images.nightSky);
});
test("falls back to a default illustration for unknown titles", () => {
  expect(illustrationForTrack("Whatever")).toBe(images.morningCalm);
});
```

- [ ] **Step 3: Run, verify fail** — `npx jest src/features/content/illustrations.test.ts` → cannot find module.

- [ ] **Step 4: Implement `illustrations.ts`**
```ts
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
```
NOTE: the "Today's pick / Morning calm" illustration in the ref is a sunset over a mountain. VIEW `assets/images/morning-calm.png` and `assets/images/birth-and-sun.png` with the Read tool and, if `birth-and-sun.png` is the sunset, map `"morning calm"` → `images.birthAndSun` and update the fallback accordingly. Keep the test passing (adjust expected fallback if you change it).

- [ ] **Step 5: Run, verify pass.**

- [ ] **Step 6: `content.api.ts`**
```ts
import { supabase } from "@/src/lib/supabase";
import type { Category, TrackWithCategory } from "./types";

export async function fetchTracks(): Promise<TrackWithCategory[]> {
  const { data, error } = await supabase
    .from("tracks")
    .select("*, categories(name, accent_color)")
    .order("title");
  if (error) throw error;
  return (data ?? []) as TrackWithCategory[];
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) throw error;
  return (data ?? []) as Category[];
}
```

- [ ] **Step 7: `useContent.ts`**
```ts
import { useQuery } from "@tanstack/react-query";
import { fetchCategories, fetchTracks } from "./content.api";

export const useTracks = () => useQuery({ queryKey: ["tracks"], queryFn: fetchTracks });
export const useCategories = () => useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
```

- [ ] **Step 8: Verify** `npx tsc --noEmit` + `npm test` green. **Commit** `feat: content data layer + illustration map`.

---

## Task 2: Profile hook

**Files:** create `src/features/profile/useProfile.ts`

- [ ] **Step 1: Implement** — read the signed-in user's profile row (own-row RLS allows it):
```ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/src/lib/supabase";

export type Profile = { id: string; name: string | null; avatar_url: string | null; streak_count: number };

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, avatar_url, streak_count")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => fetchProfile(userId!),
    enabled: !!userId,
  });
}
```

- [ ] **Step 2: Verify** `npx tsc --noEmit`. **Commit** `feat: profile hook`.

---

## Task 3: Avatar, TrackCard, TodaysPickCard components

**Files:** create `src/components/{Avatar.tsx,TrackCard.tsx,TodaysPickCard.tsx}`; **READ** `assets/design-refs/15. Home page.png`.

- [ ] **Step 1: `Avatar.tsx`** — circular; shows `uri` image if provided, else the name's initial on a mint circle:
```tsx
import { Image, Text, View } from "react-native";

export function Avatar({ uri, name, size = 48 }: { uri?: string | null; name?: string | null; size?: number }) {
  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  const initial = (name?.trim()?.[0] ?? "M").toUpperCase();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2 }} className="bg-primary border-2 border-ink items-center justify-center">
      <Text className="font-heading text-ink text-[18px]">{initial}</Text>
    </View>
  );
}
```

- [ ] **Step 2: `TrackCard.tsx`** — grid card (neo-brutalist, press + haptic). Reuse `NeoShadow`:
```tsx
import * as Haptics from "expo-haptics";
import { Image, ImageSourcePropType, Pressable, Text, View } from "react-native";
import { NeoShadow } from "./NeoShadow";

type Props = {
  title: string; category?: string | null; durationSec: number;
  illustration: ImageSourcePropType; onPress?: () => void; variant?: "primary" | "secondary";
};
export function TrackCard({ title, category, durationSec, illustration, onPress, variant = "primary" }: Props) {
  const min = Math.round(durationSec / 60);
  const bg = variant === "primary" ? "bg-primary" : "bg-secondary";
  return (
    <NeoShadow radius="rounded-card" offset="translate-x-1 translate-y-1.5">
      <Pressable
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress?.(); }}
        className={`${bg} border-2 border-ink rounded-card p-3`}
      >
        <Image source={illustration} resizeMode="contain" style={{ width: "100%", height: 96 }} />
        {category ? <Text className="font-body text-ink/70 text-[13px] mt-2">{category}</Text> : null}
        <Text className="font-heading text-ink text-[18px]">{title}</Text>
        <Text className="font-body text-ink/70 text-[13px] mt-1">{min} min</Text>
      </Pressable>
    </NeoShadow>
  );
}
```

- [ ] **Step 3: `TodaysPickCard.tsx`** — featured lime card with illustration + Play Now (reuse `Button`):
```tsx
import { Image, ImageSourcePropType, Text, View } from "react-native";
import { Button } from "./Button";
import { NeoShadow } from "./NeoShadow";

type Props = { title: string; subtitle?: string | null; durationSec: number; illustration: ImageSourcePropType; onPlay?: () => void };
export function TodaysPickCard({ title, subtitle, durationSec, illustration, onPlay }: Props) {
  const min = Math.round(durationSec / 60);
  return (
    <NeoShadow radius="rounded-card" offset="translate-x-1 translate-y-1.5">
      <View className="bg-secondary border-2 border-ink rounded-card p-4 overflow-hidden">
        <Image source={illustration} resizeMode="contain" style={{ position: "absolute", right: -10, bottom: -6, width: 150, height: 130 }} />
        <Text className="font-body text-ink/70 text-[13px]">Today's pick</Text>
        <Text className="font-heading text-ink text-[24px]">{title}</Text>
        <Text className="font-body text-ink/70 text-[13px] mt-1">{min} min · {subtitle ?? ""}</Text>
        <View className="mt-3 self-start"><Button label="Play Now" onPress={() => onPlay?.()} /></View>
      </View>
    </NeoShadow>
  );
}
```

- [ ] **Step 4: Verify** `npx tsc --noEmit` + `npm test` green. **Commit** `feat: home cards + avatar`.

---

## Task 4: Greeting util + HomeHeader

**Files:** create `src/features/home/{greeting.ts,greeting.test.ts,HomeHeader.tsx}`

- [ ] **Step 1: Failing test `greeting.test.ts`**
```ts
import { greetingForHour } from "./greeting";
test("greets by time of day", () => {
  expect(greetingForHour(8)).toBe("Good morning");
  expect(greetingForHour(14)).toBe("Good afternoon");
  expect(greetingForHour(21)).toBe("Good evening");
});
```
- [ ] **Step 2: Run, verify fail.**
- [ ] **Step 3: Implement `greeting.ts`**
```ts
export function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
```
- [ ] **Step 4: Run, verify pass.**
- [ ] **Step 5: `HomeHeader.tsx`** — lime zone: avatar + greeting/subtitle + bell, then the two pills. Reuse `Avatar`, `Pill`, `@expo/vector-icons` (Ionicons bell):
```tsx
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { Avatar } from "@/src/components/Avatar";
import { Pill } from "@/src/components/Pill";
import { greetingForHour } from "./greeting";

export function HomeHeader({ name, avatarUrl, streak }: { name?: string | null; avatarUrl?: string | null; streak: number }) {
  const greeting = greetingForHour(new Date().getHours());
  return (
    <View className="px-5 pt-2 pb-5">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <Avatar uri={avatarUrl} name={name} />
          <View className="ml-3 flex-1">
            <Text className="font-heading text-ink text-[18px]" numberOfLines={1}>{name ?? "there"}! {greeting}</Text>
            <Text className="font-body text-ink/70 text-[14px]">Start your day with mindshine!</Text>
          </View>
        </View>
        <Pressable accessibilityLabel="Notifications" className="w-11 h-11 rounded-pill border-2 border-ink items-center justify-center" hitSlop={6}>
          <Ionicons name="notifications-outline" size={20} color="#0D1101" />
        </Pressable>
      </View>
      <View className="flex-row gap-3 mt-4">
        <Pill label={`${streak}-day streak`} filled />
        <Pill label="Keep it going" />
      </View>
    </View>
  );
}
```
- [ ] **Step 6: Verify** tsc + `npm test` green. **Commit** `feat: greeting util + home header`.

---

## Task 5: Home screen

**Files:** rewrite `app/(tabs)/index.tsx`. **READ** `assets/design-refs/15. Home page.png` and match layout.

- [ ] **Step 1: Implement** — lime header zone (`HomeHeader`) over a green scrollable content zone (rounded top) holding `TodaysPickCard` + a 2-col grid of `TrackCard`s. Data via `useTracks()` + `useProfile(session.user.id)`. Today's pick = first track; grid = the rest. Map each track's illustration via `illustrationForTrack(track.title)` and category via `track.categories?.name`. Handle states:
  - `isLoading` → centered `ActivityIndicator` (color `#0D1101`).
  - `error` → message "Couldn't load your content." + a "Retry" `Button` calling `refetch()`.
  - empty (`tracks.length === 0`) → message "No sessions yet." + hint "Run the seed in Supabase to add content." (dev hint).
  - success → render pick + grid.
  Cards' `onPress`/`onPlay` = light haptic only this milestone (player wiring is a later milestone) — add a `// TODO(player): navigate to player` comment.
```tsx
import { ScrollView, View, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/src/components/Button";
import { TrackCard } from "@/src/components/TrackCard";
import { TodaysPickCard } from "@/src/components/TodaysPickCard";
import { Body } from "@/src/components/Typography";
import { HomeHeader } from "@/src/features/home/HomeHeader";
import { illustrationForTrack } from "@/src/features/content/illustrations";
import { useTracks } from "@/src/features/content/useContent";
import { useProfile } from "@/src/features/profile/useProfile";
import { useAuth } from "@/src/features/auth/useAuth";

export default function Home() {
  const { session } = useAuth();
  const { data: profile } = useProfile(session?.user.id);
  const { data: tracks, isLoading, isError, refetch, isRefetching } = useTracks();

  const pick = tracks?.[0];
  const grid = tracks?.slice(1) ?? [];

  return (
    <View className="flex-1 bg-secondary">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <HomeHeader name={profile?.name} avatarUrl={profile?.avatar_url} streak={profile?.streak_count ?? 0} />
        <View className="flex-1 bg-primary rounded-t-[28px] overflow-hidden">
          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#0D1101" />}
          >
            {isLoading ? (
              <View className="items-center py-20"><ActivityIndicator color="#0D1101" /></View>
            ) : isError ? (
              <View className="items-center py-16">
                <Body className="mb-4">Couldn't load your content.</Body>
                <Button label="Retry" variant="secondary" onPress={() => refetch()} />
              </View>
            ) : !tracks || tracks.length === 0 ? (
              <View className="items-center py-16">
                <Body className="mb-1">No sessions yet.</Body>
                <Body className="text-ink/60 text-[13px]">Run the Supabase seed to add content.</Body>
              </View>
            ) : (
              <>
                {pick ? (
                  <TodaysPickCard title={pick.title} subtitle={pick.subtitle} durationSec={pick.duration_sec} illustration={illustrationForTrack(pick.title)} />
                ) : null}
                <View className="flex-row flex-wrap justify-between mt-5">
                  {grid.map((t, i) => (
                    <View key={t.id} style={{ width: "48%" }} className="mb-4">
                      <TrackCard
                        title={t.title}
                        category={t.categories?.name}
                        durationSec={t.duration_sec}
                        illustration={illustrationForTrack(t.title)}
                        variant={i % 3 === 1 ? "secondary" : "primary"}
                      />
                    </View>
                  ))}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}
```
- [ ] **Step 2: Verify** `npx tsc --noEmit` clean; `npx expo export --platform web --output-dir /tmp/home-check` bundles; `npm test` green. (Runtime/visual check needs a device + seeded data — human step.)
- [ ] **Step 3: Commit** `feat: pixel-perfect home screen`

---

## Task 6: Bottom tab bar styling

**Files:** modify `app/(tabs)/_layout.tsx`. **READ** the tab bar in `assets/design-refs/15. Home page.png`.

- [ ] **Step 1: Implement** — keep the existing auth guard; add icons + colors (dark-green bar, ink/white active). Use Ionicons:
```tsx
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useAuth } from "@/src/features/auth/useAuth";

export default function TabsLayout() {
  const { session, initialized } = useAuth();
  if (initialized && !session) return <Redirect href="/(auth)/sign-in" />;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "rgba(255,255,255,0.65)",
        tabBarStyle: { backgroundColor: "#008A49", borderTopWidth: 0, height: 88, paddingTop: 8 },
        tabBarLabelStyle: { fontFamily: "Inter_500Medium", fontSize: 12 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Today", tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }} />
      <Tabs.Screen name="explore" options={{ title: "Explore", tabBarIcon: ({ color, size }) => <Ionicons name="albums-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}
```
- [ ] **Step 2: Verify** tsc + web export + `npm test`. **Commit** `feat: styled bottom tab bar`

---

## Self-Review
- **Coverage:** data layer (Task 1) → Home consumes it (Task 5); profile/greeting/header (Tasks 2,4); cards (Task 3); tab bar (Task 6). Home states (loading/empty/error/refresh) covered in Task 5. Illustration mapping + greeting are TDD'd.
- **Definition of done:** `npm test` green; tsc clean; web export bundles; Home matches ref `15` once seeded on a device (final visual = human check). Cards are visual + navigate-later (player milestone).
- **Type consistency:** `TrackWithCategory.categories` (nested) used consistently in api + Home; `illustrationForTrack(title)` signature consistent; `useProfile(userId?)` matches Home usage.

## Next plan
**Explore** (needs you to export the therapy/advice photos + a small "explore content" model), then **Player + Favourites**, then **Profile + Progress**.
