import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { AuthScaffold } from "@/src/components/AuthScaffold";
import { Button } from "@/src/components/Button";
import { Input } from "@/src/components/Input";
import { SocialRow } from "@/src/components/SocialRow";
import { Body, Heading } from "@/src/components/Typography";
import { mapAuthError, signUpWithEmail } from "@/src/features/auth/auth.api";

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    const { error } = await signUpWithEmail(name.trim(), email.trim(), password);
    setLoading(false);
    if (error) return setError(mapAuthError(error));
    router.replace("/(tabs)");
  }

  return (
    <AuthScaffold>
      <Heading className="text-[28px] leading-[32px] mb-2">Sign Up</Heading>
      <Body className="text-ink/70 mb-6">
        Sign up to track your sessions and stay on your goals.
      </Body>

      <Input
        label="First Name"
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />

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
        placeholder="Create a password"
        secure
        value={password}
        onChangeText={setPassword}
      />

      {error ? (
        <Body className="text-red-600 mb-4 text-[14px]">{error}</Body>
      ) : null}

      <View className="mt-4">
        <Button
          label={loading ? "Creating…" : "Sign Up"}
          disabled={loading}
          onPress={submit}
        />
      </View>

      <SocialRow />

      <View className="flex-row justify-center mt-4">
        <Body className="text-[14px]">Do you have an account? </Body>
        <Link href="/(auth)/sign-in">
          <Body className="text-[14px] font-heading">Sign in</Body>
        </Link>
      </View>
    </AuthScaffold>
  );
}
