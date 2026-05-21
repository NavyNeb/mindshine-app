# Design references

These drive the **pixel-perfect** polish pass in the feature plans (Home/Explore,
Player/Favourites, Profile/Progress).

## What to export from Figma

Source file: **Mindshine App UI Kit** → page **"UI Design"**.

1. **Screen references** → `assets/design-refs/`
   Export each MVP screen as **PNG @2x**, named `NN-screen.png`:
   - `04-sign-in.png`, `05-sign-up.png`, `06-personalize.png`
   - `15-home.png`, `19-explore.png`, `17-song-list.png`, `20-track-details.png`
   - `16-music-play.png`, `18-favourites.png`
   - `24-profile.png`, `25-my-progress.png`
   (Splash/onboarding too when we build them.)

2. **Illustrations & icons** → `assets/images/`
   Export the content-card illustrations and any custom icons as PNG (@2x/@3x) or
   SVG. These become real app assets, not just references.

## How to export
Select a frame in Figma → right panel **Export** → add `2x` PNG → Export.
For many frames at once, select them all and bulk-export.

> Note: `assets/design-refs/` images are reference-only (used by the developer/agent
> to match layouts); they are not bundled into the app build.
