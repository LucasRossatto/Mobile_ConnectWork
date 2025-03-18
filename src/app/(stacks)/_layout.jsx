import { Stack } from "expo-router";
import React from "react";
import "@/styles/global.css";
import AuthContext from "@/contexts/AuthContext";
import { StatusBar } from "react-native";

export default function _layout() {
  return (
    <AuthContext>
      <StatusBar style="light" backgroundColor="#ffffff" />
      <Stack>
        <Stack.Screen
          name="index"
          options={{ title: "Home", headerShown: false }}
        />
        <Stack.Screen name="login" options={{ title: "Login" }} />
        <Stack.Screen name="register" options={{ title: "Cadastro" }} />
        <Stack.Screen
          name="pendingAccount"
          options={{ title: "Conta Solicitada", headerShown: false }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{ title: "tabs", headerShown: false }}
        />
      </Stack>
    </AuthContext>
  );
}
