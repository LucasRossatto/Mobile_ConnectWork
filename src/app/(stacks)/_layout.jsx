import { Stack } from "expo-router";
import React from "react";
import "@/styles/global.css";
import AuthContext from "@/contexts/AuthContext";
import { StatusBar } from "react-native";
import Toast from 'react-native-toast-message';

export default function _layout() {
  return (
    <AuthContext>
      <StatusBar style="light" backgroundColor="#ffffff" />
      <Stack>
        <Stack.Screen
          name="index"
          options={{ title: "Home", headerShown: false }}
        />
        <Stack.Screen name="login" options={{ title: "Entrar" }} />
        <Stack.Screen name="register" options={{ title: "Cadastro" }} />
        <Stack.Screen
          name="pendingAccount"
          options={{ title: "Conta Solicitada", headerShown: false }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{ title: "tabs", headerShown: false }}
        />
        <Stack.Screen
          name="forgotPassword"
          options={{ title: ""}}
        />
      </Stack>
      
    </AuthContext>
  );
}
