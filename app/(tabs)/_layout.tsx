import { Redirect, Tabs } from "expo-router";
import { useAuth } from "@/src/features/auth/useAuth";

export default function TabsLayout() {
  const { session, initialized } = useAuth();
  if (initialized && !session) return <Redirect href="/(auth)/sign-in" />;
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: "#0D1101" }}>
      <Tabs.Screen name="index" options={{ title: "Today" }} />
      <Tabs.Screen name="explore" options={{ title: "Explore" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
