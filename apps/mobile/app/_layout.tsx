import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { COLORS } from "../src/theme/colors";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor={COLORS.background} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.background
          },
          headerTintColor: COLORS.white,
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: COLORS.background
          }
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
