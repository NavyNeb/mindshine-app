import { useRouter } from "expo-router";
import { useState } from "react";
import { TextInput } from "react-native";
import { Button } from "@/src/components/Button";
import { Screen } from "@/src/components/Screen";
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
    <Screen className="justify-center">
      <Heading className="mb-6">Create your account</Heading>
      <TextInput placeholder="Name" value={name} onChangeText={setName}
        className="border border-ink/20 rounded-card px-4 py-3 mb-3 font-body" />
      <TextInput placeholder="Email" autoCapitalize="none" keyboardType="email-address"
        value={email} onChangeText={setEmail}
        className="border border-ink/20 rounded-card px-4 py-3 mb-3 font-body" />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword}
        className="border border-ink/20 rounded-card px-4 py-3 mb-3 font-body" />
      {error ? <Body className="text-red-600 mb-3 text-[14px]">{error}</Body> : null}
      <Button label={loading ? "Creating…" : "Sign Up"} disabled={loading} onPress={submit} />
    </Screen>
  );
}
