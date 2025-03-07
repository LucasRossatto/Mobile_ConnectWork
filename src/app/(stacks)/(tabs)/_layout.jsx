import { Tabs } from "expo-router";

import React from "react";

export default function _TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{ title: "Feed", headerShown: false }}
      />
      <Tabs.Screen
        name="vacancys"
        options={{ title: "Vagas", headerShown: false }}
      />
      <Tabs.Screen
        name="addPost"
        options={{ title: "addPost", headerShown: false }}
      />
      <Tabs.Screen
        name="notifications"
        options={{ title: "Notificações", headerShown: false }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Perfil", headerShown: false }}
      />
    </Tabs>
  );
}
