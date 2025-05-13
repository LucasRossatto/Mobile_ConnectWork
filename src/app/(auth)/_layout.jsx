import { Stack } from "expo-router";
import React from "react";
import "@/styles/global.css";

export default function _Authlayout() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ title: "Entrar" }} />
      <Stack.Screen name="register" options={{ title: "Cadastro" }} />
      <Stack.Screen
        name="forgotPassword"
        options={{ title: "Esqueceu a senha" }}
      />

      <Stack.Screen
        name="pendingAccount"
        options={{ title: "Conta Solicitada", headerShown: false }}
      />
    </Stack>
  );
}
