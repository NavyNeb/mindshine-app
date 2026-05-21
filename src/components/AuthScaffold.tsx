import { PropsWithChildren, ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function AuthScaffold({ top, children }: PropsWithChildren<{ top?: ReactNode }>) {
  return (
    <View className="flex-1 bg-primary">
      <SafeAreaView className="flex-1" edges={["top"]}>
        {top ? <View className="px-5">{top}</View> : null}
        <View className="flex-1 mt-4 bg-secondary rounded-t-[32px] overflow-hidden">
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
            <ScrollView contentContainerClassName="px-6 pt-7 pb-10" keyboardShouldPersistTaps="handled">
              {children}
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </SafeAreaView>
    </View>
  );
}
