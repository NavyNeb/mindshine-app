import { Button } from "@/src/components/Button";
import { Screen } from "@/src/components/Screen";
import { Heading } from "@/src/components/Typography";
import { signOut } from "@/src/features/auth/auth.api";
export default function Profile() {
  return (
    <Screen className="justify-center">
      <Heading className="mb-6">Profile</Heading>
      <Button label="Sign Out" variant="secondary" onPress={signOut} />
    </Screen>
  );
}
