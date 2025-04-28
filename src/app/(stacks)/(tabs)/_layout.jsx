import React from "react";
import { StatusBar, Animated, Platform } from "react-native";
import { Tabs } from "expo-router";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { House, UserRound } from "lucide-react-native";

/* ---------------------------------
 *  Configurações visuais constantes
 * --------------------------------- */
const TABBAR_HEIGHT = 58; // altura da barra
const ANIM_DURATION = 200; // ms

/* ---------------------------------
 *  Animated.Value + helpers globais
 * --------------------------------- */
const tabBarAnim = new Animated.Value(0); // 0 = visível • 1 = oculto

export const hideTabBar = () =>
  Animated.timing(tabBarAnim, {
    toValue: 1,
    duration: ANIM_DURATION,
    useNativeDriver: true,
  }).start();

export const showTabBar = () =>
  Animated.timing(tabBarAnim, {
    toValue: 0,
    duration: ANIM_DURATION,
    useNativeDriver: true,
  }).start();

/* ---------------------------------
 *  TabBar animado (interno)
 * --------------------------------- */
function AnimatedTabBar(props) {
  const translateY = tabBarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TABBAR_HEIGHT + 20], // desliza totalmente + folga
  });

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#1B1D2A",
      }}
    >
      <BottomTabBar {...props} />
    </Animated.View>
  );
}

/* ---------------------------------
 *  Layout principal das abas
 * --------------------------------- */
export default function _TabsLayout() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <Tabs
        // usamos nossa TabBar customizada
        tabBar={(props) => <AnimatedTabBar {...props} />}
        screenOptions={{
          tabBarStyle: {
            backgroundColor: "#1B1D2A",
            height: TABBAR_HEIGHT,
            paddingTop: 8,
          },
          tabBarActiveTintColor: "#F2F2F2",
          tabBarInactiveTintColor: "#676D75",
          tabBarShowLabel: false,
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color }) => (
              <House size={28} color={color} strokeWidth={2} />
            ),
          }}
        />
        <Tabs.Screen
          name="vacancys"
          options={{
            tabBarIcon: ({ color, focused }) => (
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
            tabBarIcon: ({ color, focused }) => (
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
            tabBarIcon: ({ color, focused }) => (
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
            tabBarIcon: ({ color }) => (
              <UserRound size={28} color={color} strokeWidth={2} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
