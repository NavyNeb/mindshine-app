import { BottomTabBar, type BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { View } from "react-native";
import { MiniPlayer } from "./MiniPlayer";

export function CustomTabBar(props: BottomTabBarProps) {
  return (
    <View style={{ backgroundColor: "#008A49" }}>
      <MiniPlayer />
      <BottomTabBar {...props} />
    </View>
  );
}
