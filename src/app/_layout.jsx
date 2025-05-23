import { Stack, useRouter } from "expo-router";
import { StatusBar, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NotificationProvider, useNotifications } from "@/contexts/NotificationContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef } from "react";
import * as Notifications from 'expo-notifications';

const queryClient = new QueryClient();

// Configura o handler global de notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function AuthRedirect() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const notificationListener = useRef();
  const responseListener = useRef();
  const { updateCounts } = useNotifications();

  useEffect(() => {
    const configureNotifications = async () => {
      // Configuração específica para Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      // Solicitar permissões
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permissão para notificações não concedida');
        return;
      }

      // Listener para notificações recebidas em primeiro plano
      notificationListener.current = 
        Notifications.addNotificationReceivedListener(notification => {
          updateCounts(prev => ({
            total: (prev?.total || 0) + 1,
            unread: (prev?.unread || 0) + 1
          }));
        });

      // Listener para cliques em notificações
      responseListener.current = 
        Notifications.addNotificationResponseReceivedListener(response => {
          // Navegação baseada no conteúdo da notificação
          const targetScreen = response.notification.request.content.data?.screen;
          if (targetScreen) {
            router.push(targetScreen);
          }
        });

      return () => {
        // Limpeza dos listeners
        if (notificationListener.current) {
          Notifications.removeNotificationSubscription(notificationListener.current);
        }
        if (responseListener.current) {
          Notifications.removeNotificationSubscription(responseListener.current);
        }
      };
    };

    configureNotifications();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace("/(tabs)/");
      }
    }
  }, [user, isLoading]);

  return null;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar />
            <AuthRedirect />
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="neighbor/[userId]" options={{ title: " " }} />
              <Stack.Screen
                name="settings/settings"
                options={{ title: "Voltar" }}
              />
            </Stack>
          </GestureHandlerRootView>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}