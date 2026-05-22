import { PropsWithChildren, ReactNode } from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

export function AuthScaffold({ top, children }: PropsWithChildren<{ top?: ReactNode }>) {
  return (
    <View className="flex-1 bg-primary">
      <SafeAreaView className="flex-1" edges={["top"]}>
        {top ? <View className="px-5">{top}</View> : null}
        <View className="flex-1 mt-4 bg-secondary rounded-t-[32px] overflow-hidden">
          <KeyboardAwareScrollView
            bottomOffset={24}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </KeyboardAwareScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}
