import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "react-native-reanimated";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AuthProvider } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar barStyle="dark-content" />
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false, animation: "none" }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="neighbor/[userId]" options={{ title: " " }} />
              <Stack.Screen
                name="settings/settings"
                options={{ title: "Configurações" }}
              />
            </Stack>
          </GestureHandlerRootView>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
