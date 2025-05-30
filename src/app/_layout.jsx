import { Stack, useRouter } from "expo-router";
import { StatusBar, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { useNotifications } from "@/contexts/NotificationContext";

function NotificationHandler() {
  const notificationListener =
    (useRef < Notifications.Subscription) | (null > null);
  const responseListener =
    (useRef < Notifications.Subscription) | (null > null);
  const { updateCounts } = useNotifications();
  const router = useRouter();

  useEffect(() => {
    const configureNotifications = async () => {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.warn("Permissão para notificações não concedida");
        return;
      }

      notificationListener.current =
        Notifications.addNotificationReceivedListener(() => {
          updateCounts((prev) => ({
            total: (prev?.total || 0) + 1,
            unread: (prev?.unread || 0) + 1,
          }));
        });

      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          const targetScreen =
            response.notification.request.content.data?.screen;

          // Verifica se targetScreen é uma string válida e começa com "/"
          if (
            typeof targetScreen === "string" &&
            targetScreen.startsWith("/")
          ) {
            router.push(targetScreen);
          } else {
            // Se não tiver targetScreen válido, pode navegar para uma tela padrão, ex:
            router.push("/vacancys");
          }
        });
    };

    configureNotifications();

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [router, updateCounts]);

  return null;
}
function AuthRedirect() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace("/(tabs)");
      }
    }
  }, [user, router]);

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
