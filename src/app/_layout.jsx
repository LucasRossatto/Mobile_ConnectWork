import { Stack } from "expo-router"; // Adicione esta importação
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
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
            <StatusBar />
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }}/>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="neighbor/[userId]" />
            </Stack>
          </GestureHandlerRootView>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}