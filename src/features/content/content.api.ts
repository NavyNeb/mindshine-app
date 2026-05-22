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
