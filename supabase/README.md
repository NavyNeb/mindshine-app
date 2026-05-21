# Supabase Setup

Follow these steps to apply the schema and seed data to your Supabase project.

## 1. Apply the migration

1. Open the [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project.
3. Go to **SQL Editor** (left sidebar).
4. Click **New query**, paste the contents of `migrations/0001_init.sql`, and click **Run**.

This creates all tables (`profiles`, `categories`, `tracks`, `favorites`, `sessions`), the `handle_new_user` trigger function, and all Row Level Security policies.

## 2. Create the `audio` Storage bucket

1. In the Supabase Dashboard, go to **Storage** (left sidebar).
2. Click **New bucket**, name it `audio`, and set it to **Public**.

This bucket will hold the royalty-free MP3 files used by the Player feature.

## 3. Apply the seed data (later — after real audio URLs exist)

> **Note:** The `seed.sql` file contains placeholder audio URLs (`<public-url-1.mp3>`, etc.). Do **not** run this file until you have uploaded real MP3 files to the `audio` bucket and replaced the placeholders with their actual public URLs.

Once real URLs are in place:

1. Edit `seed.sql`, replacing each `<public-url-N.mp3>` with the corresponding public URL from the `audio` bucket.
2. Open **SQL Editor** in the Supabase Dashboard.
3. Paste the updated contents of `seed.sql` and click **Run**.
