import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, TextInput, TextInputProps, View } from "react-native";

type Props = TextInputProps & { label: string; secure?: boolean };

export function Input({ label, secure, ...rest }: Props) {
  const [hidden, setHidden] = useState(!!secure);
  return (
    <View className="mb-4">
      <Text className="font-heading text-ink text-[16px] mb-2">{label}</Text>
      <View className="flex-row items-center bg-primary border-2 border-ink rounded-pill px-5">
        <TextInput
          placeholderTextColor="#0D1101AA"
          secureTextEntry={secure ? hidden : false}
          className="flex-1 py-4 font-body text-ink text-[16px]"
          {...rest}
        />
        {secure ? (
          <Pressable accessibilityLabel="Toggle password visibility" onPress={() => setHidden((h) => !h)} hitSlop={8}>
            <Ionicons name={hidden ? "eye-outline" : "eye-off-outline"} size={22} color="#0D1101" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
