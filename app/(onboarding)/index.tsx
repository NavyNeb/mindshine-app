import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ImageSourcePropType,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/src/components/Button";
import { useOnboardingSeen } from "@/src/features/onboarding/useOnboardingSeen";
import { images } from "@/src/theme/assets";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ─── Mood bubble data ──────────────────────────────────────────────────────────
type MoodKey = "anxious" | "sad" | "content" | "happy" | "okay";

const MOODS: {
  key: MoodKey;
  label: string;
  image: ImageSourcePropType;
  size: number;
  top: number;
  left?: number;
  right?: number;
}[] = [
  { key: "anxious", label: "Anxious", image: images.moodAnxious, size: 100, top: 80,  left: 20 },
  { key: "sad",     label: "Sad",     image: images.moodSad,     size: 80,  top: 60,  right: 40 },
  { key: "content", label: "Content", image: images.moodContent, size: 90,  top: 200, left: 30 },
  { key: "happy",   label: "Happy",   image: images.moodHappy,   size: 85,  top: 240, left: SCREEN_WIDTH / 2 - 42 },
  { key: "okay",    label: "Okay",    image: images.moodOkay,    size: 80,  top: 180, right: 20 },
];

// ─── Page dot indicator ────────────────────────────────────────────────────────
function PageDots({ current }: { current: number }) {
  return (
    <View className="flex-row justify-center gap-x-2 py-3">
      {[0, 1].map((i) => (
        <View
          key={i}
          style={{
            width: i === current ? 24 : 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: i === current ? "#0D1101" : "rgba(13,17,1,0.3)",
          }}
        />
      ))}
    </View>
  );
}

// ─── Slide 1 — "Find your calm" ───────────────────────────────────────────────
function Slide1({ onNext }: { onNext: () => void }) {
  return (
    <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }} className="flex-1">
      {/* Top green section */}
      <View
        style={{ flex: 1, backgroundColor: "#22D795", paddingTop: 60, paddingHorizontal: 28 }}
      >
        <Text
          style={{
            fontFamily: "MPLUSRounded1c_700Bold",
            fontSize: 40,
            lineHeight: 46,
            color: "#0D1101",
          }}
        >
          Find your calm
        </Text>
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 16,
            color: "#0D1101",
            opacity: 0.65,
            marginTop: 10,
          }}
        >
          Reduce stress, sleep better, stay focused.
        </Text>
      </View>

      {/* Bottom lime section with hill curve */}
      <View style={{ flex: 1.3, backgroundColor: "#D3F761", alignItems: "center" }}>
        {/* Hill curve at the top */}
        <View
          style={{
            position: "absolute",
            top: -60,
            width: SCREEN_WIDTH * 1.6,
            height: 120,
            borderRadius: SCREEN_WIDTH * 0.8,
            backgroundColor: "#D3F761",
            alignSelf: "center",
          }}
        />

        {/* Rotated yellow card with neo-brutalist border */}
        <View style={{ marginTop: 40, alignItems: "center" }}>
          {/* Pink frowning emoji bubble — top-right of card */}
          <View
            style={{
              position: "absolute",
              top: -20,
              right: 24,
              zIndex: 10,
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: "#F97B7B",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 26 }}>😞</Text>
          </View>

          {/* Shadow layer */}
          <View
            style={{
              position: "absolute",
              top: 6,
              left: 6,
              width: SCREEN_WIDTH * 0.78,
              borderRadius: 12,
              backgroundColor: "#0D1101",
              paddingVertical: 28,
              paddingHorizontal: 24,
              transform: [{ rotate: "-4deg" }],
            }}
          >
            <Text style={{ fontSize: 36, lineHeight: 46, color: "#0D1101" }}>
              {"Reduce Stress\nImprove Sleep\nBoost Focus"}
            </Text>
          </View>

          {/* Foreground card */}
          <View
            style={{
              width: SCREEN_WIDTH * 0.78,
              borderRadius: 12,
              backgroundColor: "#FFBB00",
              borderWidth: 3,
              borderColor: "#0D1101",
              paddingVertical: 28,
              paddingHorizontal: 24,
              transform: [{ rotate: "-4deg" }],
            }}
          >
            <Text
              style={{
                fontFamily: "MPLUSRounded1c_700Bold",
                fontSize: 36,
                lineHeight: 46,
                color: "#0D1101",
              }}
            >
              {"Reduce Stress\nImprove Sleep\nBoost Focus"}
            </Text>
          </View>
        </View>
      </View>

      {/* Button + dots anchored near bottom */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#D3F761",
          paddingHorizontal: 24,
          paddingBottom: 40,
        }}
      >
        <PageDots current={0} />
        <Button label="Get Started" onPress={onNext} />
      </View>
    </View>
  );
}

// ─── Slide 2 — "How are you feeling today?" ────────────────────────────────────
function Slide2({ onDone, onSkip }: { onDone: () => void; onSkip: () => void }) {
  const [selected, setSelected] = useState<MoodKey | null>(null);

  function handleSelect(key: MoodKey) {
    setSelected(key);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  return (
    <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT, backgroundColor: "#22D795" }}>
      {/* Header */}
      <SafeAreaView edges={["top"]}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingTop: 4,
            paddingBottom: 8,
          }}
        >
          <TouchableOpacity
            accessibilityLabel="Go back"
            onPress={onSkip}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={{ fontSize: 24, color: "#0D1101" }}>{"←"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={onSkip}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text
              style={{
                fontFamily: "MPLUSRounded1c_700Bold",
                fontSize: 18,
                color: "#0D1101",
              }}
            >
              Skip
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Heading */}
      <View style={{ paddingHorizontal: 28, paddingTop: 16 }}>
        <Text
          style={{
            fontFamily: "MPLUSRounded1c_700Bold",
            fontSize: 36,
            lineHeight: 44,
            color: "#0D1101",
          }}
        >
          How are you feeling today?
        </Text>
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 16,
            color: "#0D1101",
            opacity: 0.65,
            marginTop: 8,
          }}
        >
          Choose your mood.
        </Text>
      </View>

      {/* Scattered mood bubbles */}
      <View style={{ flex: 1, position: "relative", marginTop: 16 }}>
        {MOODS.map((mood) => {
          const isSelected = selected === mood.key;
          return (
            <TouchableOpacity
              key={mood.key}
              activeOpacity={0.8}
              onPress={() => handleSelect(mood.key)}
              style={{
                position: "absolute",
                top: mood.top,
                left: mood.left,
                right: mood.right,
                alignItems: "center",
                width: mood.size + 16,
              }}
            >
              {/* Bubble background */}
              <View
                style={{
                  width: mood.size,
                  height: mood.size,
                  borderRadius: mood.size / 2,
                  backgroundColor: isSelected
                    ? "rgba(13,17,1,0.18)"
                    : "rgba(255,255,255,0.18)",
                  borderWidth: isSelected ? 3 : 0,
                  borderColor: isSelected ? "#0D1101" : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  source={mood.image}
                  style={{ width: mood.size * 0.82, height: mood.size * 0.82 }}
                  resizeMode="contain"
                />
              </View>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: "#0D1101",
                  marginTop: 6,
                  fontWeight: isSelected ? "700" : "400",
                }}
              >
                {mood.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Lime hill + Next button */}
      <View style={{ alignItems: "center" }}>
        {/* Hill */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            width: SCREEN_WIDTH * 1.5,
            height: 140,
            borderRadius: SCREEN_WIDTH * 0.75,
            backgroundColor: "#D3F761",
            alignSelf: "center",
          }}
        />
        <View
          style={{
            paddingHorizontal: 24,
            paddingBottom: 40,
            width: "100%",
          }}
        >
          <PageDots current={1} />
          <Button label="Next" onPress={onDone} />
        </View>
      </View>
    </View>
  );
}

// ─── Main carousel ─────────────────────────────────────────────────────────────
export default function OnboardingCarousel() {
  const router = useRouter();
  const { markSeen } = useOnboardingSeen();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);

  function goToSlide2() {
    scrollRef.current?.scrollTo({ x: SCREEN_WIDTH, animated: true });
    setPage(1);
  }

  async function handleDone() {
    await markSeen();
    router.replace("/(auth)/sign-in");
  }

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      scrollEnabled={false} // programmatic only — swipe disabled per spec (buttons drive flow)
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <Slide1 onNext={goToSlide2} />
      <Slide2 onDone={handleDone} onSkip={handleDone} />
    </ScrollView>
  );
}
