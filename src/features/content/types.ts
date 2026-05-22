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
