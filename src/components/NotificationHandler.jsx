import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { useNotifications } from "@/contexts/NotificationContext";
import { useRouter } from "expo-router";

export default function NotificationHandler() {
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
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

      notificationListener.current = Notifications.addNotificationReceivedListener(
        () => {
          updateCounts((prev) => ({
            total: (prev?.total || 0) + 1,
            unread: (prev?.unread || 0) + 1,
          }));
        }
      );

      responseListener.current = Notifications.addNotificationResponseReceivedListener(
        (response) => {
          const targetScreen =
            response.notification.request.content.data?.screen;
          if (targetScreen) {
            router.push(targetScreen);
          }
        }
      );
    };

    configureNotifications();

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [router, updateCounts]);

  return null;
}
