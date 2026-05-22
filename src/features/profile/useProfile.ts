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
