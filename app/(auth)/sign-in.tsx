import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Image, Pressable, View } from "react-native";
import { AuthScaffold } from "@/src/components/AuthScaffold";
import { Button } from "@/src/components/Button";
import { Input } from "@/src/components/Input";
import { SocialRow } from "@/src/components/SocialRow";
import { Body, Heading } from "@/src/components/Typography";
import { mapAuthError, signInWithEmail } from "@/src/features/auth/auth.api";
import { images } from "@/src/theme/assets";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    const { error } = await signInWithEmail(email.trim(), password);
    setLoading(false);
    if (error) return setError(mapAuthError(error));
    router.replace("/(tabs)");
  }

  return (
    <AuthScaffold
      top={
        <View className="items-center py-4">
          <Image
            source={images.signInIllustration}
            style={{ width: "100%", height: 200 }}
            resizeMode="contain"
          />
        </View>
      }
    >
      <Heading className="text-[28px] leading-[32px] mb-2">Sign In</Heading>
      <Body className="text-ink/70 mb-6">
        Sign in to track your sessions and stay on your goals.
      </Body>

      <Input
        label="Email"
        placeholder="Enter your email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <Input
        label="Password"
        placeholder="Enter your password"
        secure
        value={password}
        onChangeText={setPassword}
      />

      <View className="items-end mb-6">
        <Pressable accessibilityLabel="Forgot password" hitSlop={8}>
          <Body className="font-heading text-ink text-[14px]">Forgot password?</Body>
        </Pressable>
      </View>

      {error ? (
        <Body className="text-red-600 mb-4 text-[14px]">{error}</Body>
      ) : null}

      <Button
        label={loading ? "Signing in…" : "Sign In"}
        disabled={loading}
        onPress={submit}
      />

      <SocialRow />

      <View className="flex-row justify-center mt-4">
        <Body className="text-[14px]">Don't have an account? </Body>
        <Link href="/(auth)/sign-up">
          <Body className="text-[14px] font-heading">Sign up</Body>
        </Link>
      </View>
    </AuthScaffold>
  );
}
