import { useRouter } from "expo-router";
import { ActivityIndicator, RefreshControl, ScrollView, View } from "react-native";
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
import { usePlayerStore } from "@/src/features/player/playerStore";
import type { TrackWithCategory } from "@/src/features/content/types";

export default function Home() {
  const router = useRouter();
  const loadAndPlay = usePlayerStore((s) => s.loadAndPlay);
  const { session } = useAuth();
  const { data: profile } = useProfile(session?.user.id);
  const { data: tracks, isLoading, isError, refetch, isRefetching } = useTracks();

  const openPlayer = (track: TrackWithCategory) => {
    loadAndPlay(track);
    router.push("/player");
  };

  const pick = tracks?.[0];
  const grid = tracks?.slice(1) ?? [];

  return (
    <View className="flex-1 bg-secondary">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <HomeHeader
          name={profile?.name}
          avatarUrl={profile?.avatar_url}
          streak={profile?.streak_count ?? 0}
        />
        <View className="flex-1 bg-primary rounded-t-[28px] overflow-hidden">
          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor="#0D1101"
              />
            }
          >
            {isLoading ? (
              <View className="items-center py-20">
                <ActivityIndicator color="#0D1101" />
              </View>
            ) : isError ? (
              <View className="items-center py-16">
                <Body className="mb-4">Couldn't load your content.</Body>
                <Button label="Retry" variant="secondary" onPress={() => refetch()} />
              </View>
            ) : !tracks || tracks.length === 0 ? (
              <View className="items-center py-16">
                <Body className="mb-1">No sessions yet.</Body>
                <Body className="text-ink/60 text-[13px]">
                  Run the Supabase seed to add content.
                </Body>
              </View>
            ) : (
              <>
                {pick ? (
                  <TodaysPickCard
                    title={pick.title}
                    subtitle={pick.subtitle}
                    durationSec={pick.duration_sec}
                    illustration={illustrationForTrack(pick.title)}
                    onPlay={() => openPlayer(pick)}
                  />
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
                        onPress={() => openPlayer(t)}
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
