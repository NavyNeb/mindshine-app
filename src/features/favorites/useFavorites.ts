import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/lib/supabase";

async function fetchIsFavorite(userId: string, trackId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from("favorites")
    .select("track_id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("track_id", trackId);
  if (error) throw error;
  return (count ?? 0) > 0;
}

export function useIsFavorite(userId: string | undefined, trackId: string | undefined) {
  return useQuery({
    queryKey: ["favorite", userId, trackId],
    queryFn: () => fetchIsFavorite(userId!, trackId!),
    enabled: !!userId && !!trackId,
  });
}

export function useToggleFavorite(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ trackId, isFav }: { trackId: string; isFav: boolean }) => {
      if (!userId) throw new Error("Not signed in");
      if (isFav) {
        const { error } = await supabase.from("favorites").delete().eq("user_id", userId).eq("track_id", trackId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("favorites").insert({ user_id: userId, track_id: trackId });
        if (error) throw error;
      }
    },
    onSuccess: (_d, { trackId }) => {
      qc.invalidateQueries({ queryKey: ["favorite", userId, trackId] });
      qc.invalidateQueries({ queryKey: ["favorites", userId] });
    },
  });
}
