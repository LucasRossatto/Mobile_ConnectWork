import { Tabs } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import IconOcticons from "react-native-vector-icons/Octicons";
import React from "react";

export default function _TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: "#181818", height:65, paddingTop:8},
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#666666",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Feed",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="vacancys"
        options={{
          title: "Vagas",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <IconOcticons name="briefcase" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="addPost"
        options={{
          title: "Postar",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Icon name="plus" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notificações",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Icon name="bell" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Icon name="user" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
