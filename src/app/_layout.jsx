// RootLayout.tsx (ou onde estiver seu layout)
import { Stack, useRouter } from "expo-router";
import { StatusBar, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import NotificationHandler from "@/components/NotificationHandler";
import { useEffect } from "react";

function AuthRedirect() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace("/(tabs)/");
      }
    }
  }, [user, isLoading, router]);

  return null;
}

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar barStyle="dark-content" />
            <NotificationHandler />
            <AuthRedirect />

            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
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
