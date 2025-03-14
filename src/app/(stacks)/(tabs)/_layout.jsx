import { Tabs } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import IconOcticons from "react-native-vector-icons/Octicons";
import React from "react";
import { StatusBar } from "react-native";

export default function _TabsLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#ffffff" />
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: "#181818",
            height: 58,
            paddingTop: 8,
          },
          tabBarActiveTintColor: "#F2F2F2",
          tabBarInactiveTintColor: "#676D75",
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Icon name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="vacancys"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <IconOcticons name="briefcase" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="addPost"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Icon name="plus" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Icon name="bell" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Icon name="user" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
