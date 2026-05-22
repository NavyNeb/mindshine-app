import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/src/components/Button";
import { useOnboardingSeen } from "@/src/features/onboarding/useOnboardingSeen";
import { images } from "@/src/theme/assets";
import { colors } from "@/src/theme/tokens";

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
            backgroundColor: i === current ? colors.ink.DEFAULT : "rgba(13,17,1,0.3)",
          }}
        />
      ))}
    </View>
  );
}

// ─── Slide 1 — "Find your calm" ───────────────────────────────────────────────
const CARD_TEXT = "Reduce Stress\nImprove Sleep\nBoost Focus";
const CARD_WIDTH = SCREEN_WIDTH * 0.72;

function Slide1({ onNext, page }: { onNext: () => void; page: number }) {
  return (
    <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
      {/* Full-bleed Figma background (green sky + birds + lime dome) */}
      <Image
        source={images.appBackground}
        style={{ position: "absolute", top: 0, left: 0, width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
        resizeMode="cover"
      />

      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        {/* Heading — centered in the green sky */}
        <View style={{ paddingTop: 24, paddingHorizontal: 28, alignItems: "center" }}>
          <Text
            style={{
              fontFamily: "MPLUSRounded1c_700Bold",
              fontSize: 40,
              lineHeight: 46,
              color: colors.ink.DEFAULT,
              textAlign: "center",
            }}
          >
            Find your calm
          </Text>
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 16,
              color: colors.ink.DEFAULT,
              opacity: 0.6,
              marginTop: 8,
              textAlign: "center",
            }}
          >
            Your daily moment of calm.
          </Text>
        </View>

        {/* Rotated card + frown — centered over the lime dome */}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <View style={{ width: CARD_WIDTH }}>
            {/* Hard ink shadow: identical box, offset down-right, same rotation */}
            <View
              style={{
                position: "absolute",
                top: 9,
                left: 8,
                width: CARD_WIDTH,
                borderRadius: 14,
                backgroundColor: colors.ink.DEFAULT,
                paddingVertical: 30,
                paddingHorizontal: 26,
                transform: [{ rotate: "-8deg" }],
              }}
            >
              <Text style={{ fontFamily: "MPLUSRounded1c_700Bold", fontSize: 34, lineHeight: 44, color: colors.ink.DEFAULT }}>
                {CARD_TEXT}
              </Text>
            </View>

            {/* Foreground amber card */}
            <View
              style={{
                width: CARD_WIDTH,
                borderRadius: 14,
                backgroundColor: colors.accentYellow,
                borderWidth: 3,
                borderColor: colors.ink.DEFAULT,
                paddingVertical: 30,
                paddingHorizontal: 26,
                transform: [{ rotate: "-8deg" }],
              }}
            >
              <Text style={{ fontFamily: "MPLUSRounded1c_700Bold", fontSize: 34, lineHeight: 44, color: colors.ink.DEFAULT }}>
                {CARD_TEXT}
              </Text>
            </View>

            {/* Pink frown bubble — overlapping the card's top-right */}
            <Image
              source={images.emojiButton}
              resizeMode="contain"
              style={{ position: "absolute", top: -26, right: -10, width: 66, height: 66, zIndex: 10 }}
            />
          </View>
        </View>

        {/* Bottom — dots + Get Started */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 8 }}>
          <PageDots current={page} />
          <Button label="Get Started" onPress={onNext} />
        </View>
      </SafeAreaView>
    </View>
  );
}

// ─── Slide 2 — "How are you feeling today?" ────────────────────────────────────
function Slide2({
  onDone,
  onSkip,
  onBack,
  page,
}: {
  onDone: () => void;
  onSkip: () => void;
  onBack: () => void;
  page: number;
}) {
  const [selected, setSelected] = useState<MoodKey | null>(null);

  function handleSelect(key: MoodKey) {
    setSelected(key);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  return (
    <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT, backgroundColor: colors.primary.DEFAULT }}>
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
            onPress={onBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={{ fontSize: 24, color: colors.ink.DEFAULT }}>{"←"}</Text>
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
                color: colors.ink.DEFAULT,
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
            color: colors.ink.DEFAULT,
          }}
        >
          How are you feeling today?
        </Text>
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 16,
            color: colors.ink.DEFAULT,
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
                  borderColor: isSelected ? colors.ink.DEFAULT : "transparent",
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
                  color: colors.ink.DEFAULT,
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
            backgroundColor: colors.secondary.DEFAULT,
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
          <PageDots current={page} />
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
  }

  function goToSlide1() {
    scrollRef.current?.scrollTo({ x: 0, animated: true });
  }

  function handleMomentumScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const offsetX = e.nativeEvent.contentOffset.x;
    setPage(Math.round(offsetX / SCREEN_WIDTH));
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
      scrollEnabled={true}
      onMomentumScrollEnd={handleMomentumScrollEnd}
      style={{ flex: 1 }}
      contentContainerStyle={{ flexDirection: "row" }}
    >
      <Slide1 onNext={goToSlide2} page={page} />
      <Slide2 onDone={handleDone} onSkip={handleDone} onBack={goToSlide1} page={page} />
    </ScrollView>
  );
}
