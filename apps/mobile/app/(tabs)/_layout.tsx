import React from "react";
import { Tabs } from "expo-router";
import { Compass, Map, Bookmark, User } from "lucide-react-native";
import { COLORS } from "../../src/theme/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#10141D",
          borderTopColor: "rgba(255, 255, 255, 0.08)",
          height: 62,
          paddingBottom: 8,
          paddingTop: 8
        },
        tabBarActiveTintColor: COLORS.amber,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600"
        },
        headerStyle: {
          backgroundColor: COLORS.background
        },
        headerTintColor: COLORS.white,
        headerShadowVisible: false
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Лента",
          tabBarIcon: ({ color, size }) => <Compass size={size} color={color} />,
          headerTitle: "Mestory • Ростов"
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Карта",
          tabBarIcon: ({ color, size }) => <Map size={size} color={color} />,
          headerTitle: "Карта города"
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Закладки",
          tabBarIcon: ({ color, size }) => <Bookmark size={size} color={color} />,
          headerTitle: "Мои коллекции"
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Профиль",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          headerTitle: "Мой профиль"
        }}
      />
    </Tabs>
  );
}
