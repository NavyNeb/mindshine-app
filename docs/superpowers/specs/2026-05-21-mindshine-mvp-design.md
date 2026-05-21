# Mindshine MVP — Design Spec

**Date:** 2026-05-21
**Status:** Approved (pending final spec review)
**Source design:** Figma — "Mindshine App UI Kit" (`nHhFlj9zjlmnZG7UduEpwa`, page "UI Design" `0:1`)

## 1. Overview

Build a **functional MVP** of Mindshine, a meditation / music-therapy / wellness
mobile app, as a cross-platform **Expo** app (iOS + Android). The UI must be
**pixel-perfect** to the Figma design and follow current industry-standard React
Native / Expo practices. The app is wired to a real **Supabase** backend for
auth, data, and audio, and seeded with royalty-free meditation audio so the
player works end-to-end.

### Quality bar
- Pixel-perfect to Figma (layout, spacing, color, type, illustrations, icons).
- Subtle, polished motion via **Reanimated**, plus **haptic** + visual feedback
  on meaningful interactions.
- Clean, layered, testable architecture.

## 2. Scope

### In scope (~22 screens, 4 feature areas)
- **Auth & onboarding:** Splash, Onboarding carousel, Sign In, Sign Up,
  Personalization setup.
- **Browse content:** Home (Today), Explore, Song List, Therapy/Track Details.
- **Audio player:** Full-screen Music Play + persistent mini-player + real
  playback (play/pause, seek, background audio).
- **Personal:** Favourites, My Progress, Profile.

### Deferred (not in this MVP)
- Payments (Add Card, Secure Payment, Payment Done).
- Password recovery / OTP flow (Forgot Password, Enter OTP, Set New Password).
- Secondary profile screens (Delete Account, Edit Email, Language, Change
  Password, Notification Settings).

These can be pulled back in later without architectural change.

## 3. Tech stack

| Concern | Choice |
|---|---|
| Framework | Expo (latest SDK), **Expo Router** (file-based), **TypeScript** |
| Styling | **NativeWind v4** (Tailwind) with config derived from Figma tokens |
| Backend | **Supabase** — `@supabase/supabase-js`; session in `expo-secure-store` |
| Server state | **TanStack Query** |
| Client state | **Zustand** (audio player + UI) |
| Audio | **expo-audio** (current Expo audio API), background playback |
| Motion | **Reanimated** + **Gesture Handler** |
| Haptics | **expo-haptics** |
| Fonts | `expo-font` + Google Fonts: **Inter** (body), **M PLUS Rounded 1c** (headings) |
| Testing | **Jest** + **React Native Testing Library** |

## 4. Design system (from Figma variables)

- **Colors:** Primary mint `#22D795`; Secondary lime `#D3F761`; text near-black
  `#0D1101` / `#01130C`; white `#FFFFFF`. Primary shades `#4EDFAA / #00A462 /
  #008A49`; Secondary shades `#6D9100 / #547800`.
- **Typography:** `Inter` body — 12/14/16/18px (Regular 400, Medium 500);
  `M PLUS Rounded 1c` Bold for headings (e.g. H6 20px/700).
- **Language:** large rounded cards, green gradients, soft shadows, pill
  buttons, illustration-led content cards, 3-tab bottom bar
  (Today / Explore / Profile).
- Tokens live in `src/theme/tokens.ts` and feed the NativeWind config so colors,
  spacing, radii, and type scale are referenced by name, never hardcoded.

## 5. Architecture

```
UI (screens + components)
   ↓ uses
Hooks (useTracks, useFavorites, useAuth, usePlayer…)
   ↓ call
Services (supabase client, audio service)
   ↓
Supabase (Auth · Postgres · Storage)  +  expo-audio (device)
```

- **Server state** (tracks, categories, favourites, progress) → TanStack Query.
- **Client state** (current track, playback status, queue) → Zustand.
- **Auth session** → Supabase + `expo-secure-store`, exposed via an auth provider
  that gates routing.

### Navigation (Expo Router)
```
app/
  _layout.tsx              # providers, fonts, auth gate
  index.tsx                # splash → redirect by session
  (auth)/
    onboarding.tsx
    sign-in.tsx
    sign-up.tsx
    personalize.tsx
  (tabs)/
    _layout.tsx            # Today / Explore / Profile tab bar
    index.tsx              # Home (Today)
    explore.tsx
    profile.tsx
  track/[id].tsx           # Track / Therapy details
  player.tsx               # full-screen player (modal)
  song-list.tsx
  favourites.tsx
  progress.tsx
```
A persistent **mini-player** sits above the tab bar while audio plays; tapping it
opens the `player` modal.

### Project structure
```
src/
  components/   # reusable UI (Button, Card, Pill, TrackCard, MiniPlayer…)
  features/     # auth, home, player, library (hooks + screen-specific bits)
  lib/          # supabase client, query client, audio service
  store/        # zustand stores (player, ui)
  theme/        # tokens.ts (from Figma vars), nativewind config
  types/        # shared TS types
assets/
  design-refs/  # exported Figma PNGs (pixel-match reference, gitignored from build)
  images/       # production illustrations/icons extracted from Figma
  fonts/
```

## 6. Data model (Supabase)

| Table | Key columns |
|---|---|
| `profiles` | id (→ auth.users), name, avatar_url, streak_count, onboarding_done |
| `categories` | id, name (Meditation/Sleep/Move/Focus), accent_color |
| `tracks` | id, title, subtitle, category_id, duration_sec, audio_path, image_url |
| `favorites` | user_id, track_id (composite PK) |
| `sessions` | id, user_id, track_id, played_sec, completed, created_at |

- **Storage bucket** `audio/` holds royalty-free MP3s; rows reference them by path
  and stream via signed URLs.
- **Row-Level Security** on all user-scoped tables (a user sees only their own
  favourites/sessions). Delivered as a SQL migration + a seed script for
  categories and sample tracks.
- `sessions` powers **My Progress** and streak calculation.

## 7. Audio architecture

- `expo-audio` player wrapped in a Zustand store: `load(track)`, `play/pause`,
  `seek`, `next/prev`, reactive `status` (position, duration, isPlaying).
- Background playback enabled (iOS background audio mode; Android foreground
  service) via `app.json` config.
- A `sessions` row is created/updated as a track plays → feeds progress & streaks.

## 8. Motion, haptics & feedback

- **Reanimated** micro-interactions: button press scale, card entrance/stagger,
  screen/shared transitions, animated player progress + play/pause morph,
  tab-bar selection.
- **expo-haptics** on meaningful actions: button taps, play/pause, favourite
  toggle, tab switch, success/error events.
- Every interactive element has a visible pressed/active state.

## 9. Error handling

- **Auth:** typed Supabase errors surfaced inline (wrong password, email taken,
  weak password) with friendly copy.
- **Data:** TanStack Query retry + explicit loading / empty / error states on
  every list; pull-to-refresh.
- **Audio:** load-failure toast + retry; handle expired signed URLs.
- **Offline:** cached query data shown read-only; mutating actions blocked with a
  banner.

## 10. Testing

- **Unit:** player store logic, progress/streak calc, token mapping.
- **Component:** key screens (Sign In, Home, Player) via React Native Testing
  Library — render, interactions, states.
- Supabase + audio mocked at the service boundary.

## 11. Configuration & secrets

- Supabase URL + publishable key stored in a **gitignored `.env`**, read via
  `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_KEY`.
- Keys are client-side (publishable/anon), protected by RLS — safe to ship, never
  committed as literals.

## 12. Design hand-off workflow

Figma is on a **Starter plan** with an MCP tool-call rate limit, so all-screen
extraction through the MCP is unreliable. Hybrid approach:

1. **User exports** each MVP screen as **PNG @2x** into `assets/design-refs/`
   (named e.g. `15-home.png`) → the pixel-match reference.
2. **User exports** illustration/icon assets (PNG/SVG) into `assets/images/`,
   or the agent extracts them via the Figma MCP as the quota allows.
3. Agent spends MCP `get_design_context` calls **sparingly** for exact
   measurements on tricky screens.

## 13. Build sequence (milestones)

1. Scaffold + design system (tokens, NativeWind, fonts) + base components.
2. Supabase project wiring + schema migration + seed + auth flow.
3. Tab shell + Home + Explore with real data.
4. Player (audio + mini-player + full screen) + Favourites.
5. Profile + My Progress + motion/haptics + pixel-perfect polish pass.

## 14. Assumptions

- Supabase project already created; URL + publishable key provided.
- Targeting both iOS and Android.
- Audio content = royalty-free samples seeded into Supabase Storage.
