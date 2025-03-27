import { Tabs } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
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
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons 
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
              <Ionicons 
                name={focused ? "person-circle-sharp" : "person-circle-outline"} 
                size={30} 
                color={color} 
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}