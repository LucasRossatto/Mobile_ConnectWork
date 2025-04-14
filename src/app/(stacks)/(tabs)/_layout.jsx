import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StatusBar } from "react-native";
import { House, UserRound } from "lucide-react-native";

export default function _TabsLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#000" />
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: "#1B1D2A",
            height: 58,
            paddingTop: 8,
          },

          tabBarActiveTintColor: "#676D75",
          tabBarInactiveTintColor: "#F2F2F2",
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused, size }) => (
              <House
                name={focused ? "home" : "home-outline"}
                size={28}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="vacancys"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons
                name={focused ? "briefcase" : "briefcase-outline"}
                size={28}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="addPost"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons
                name={focused ? "add-circle" : "add-circle-outline"}
                size={30}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons
                name={focused ? "notifications" : "notifications-outline"}
                size={28}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused, size }) => (
              <UserRound
                name={focused ? "person-circle-sharp" : "person-circle-outline"}
                size={28}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
