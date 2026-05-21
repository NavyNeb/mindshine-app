import { useEffect, useRef, useState } from "react";
import { Dimensions, Image, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { images } from "@/src/theme/assets";

const SCREEN_WIDTH = Dimensions.get("window").width;

export function SplashScreen() {
  const [progress, setProgress] = useState(0);

  // Subtle continuous scale pulse: 1.0 → 0.97 → 1.0 looping
  const scale = useSharedValue(1);
  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    // Start the scale pulse
    scale.value = withRepeat(
      withSequence(
        withTiming(0.97, { duration: 500 }),
        withTiming(1.0, { duration: 500 })
      ),
      -1, // infinite
      false
    );

    // Animate loading counter from 0 to 100 over ~1.2 s
    const DURATION_MS = 1200;
    const INTERVAL_MS = 16; // ~60 fps
    const steps = Math.ceil(DURATION_MS / INTERVAL_MS);
    let current = 0;

    const id = setInterval(() => {
      current += 1;
      const value = Math.min(Math.round((current / steps) * 100), 100);
      setProgress(value);
      if (current >= steps) clearInterval(id);
    }, INTERVAL_MS);

    return () => clearInterval(id);
  }, [scale]);

  return (
    <View className="flex-1 bg-primary items-center justify-center">
      {/* Centered logo with pulse */}
      <Animated.View style={[logoStyle, { width: SCREEN_WIDTH * 0.7 }]}>
        <Image
          source={images.mindshineLogoSplash}
          style={{ width: "100%", aspectRatio: 1 }}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Bottom lime blob anchored to bottom */}
      <View
        style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
        pointerEvents="none"
      >
        <Image
          source={images.splashBlob}
          style={{ width: SCREEN_WIDTH }}
          resizeMode="contain"
        />

        {/* Loading text overlay — sits inside the blob area */}
        <View
          style={{
            position: "absolute",
            bottom: 24,
            left: 0,
            right: 0,
            alignItems: "center",
          }}
        >
          <Text
            style={{ fontFamily: "MPLUSRounded1c_700Bold", color: "#0D1101", fontSize: 14, opacity: 0.7 }}
          >
            {"Loading "}
            <Text style={{ fontWeight: "700", fontSize: 15, opacity: 1 }}>
              {progress}%
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
