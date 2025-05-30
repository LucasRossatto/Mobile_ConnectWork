import { StatusBar, Platform, View } from "react-native";
import { Redirect, Tabs } from "expo-router";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { House, UserRound } from "lucide-react-native";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";

/* ---------------------------------
 *  Configurações visuais constantes
 * --------------------------------- */
const TABBAR_HEIGHT = 58; // altura da barra

/* ---------------------------------
 *  TabBar simplificada (sem animações)
 * --------------------------------- */
function TabBar(props) {
  return (
    <View
      style={{
        backgroundColor: "#181818",
      }}
    >
      <BottomTabBar {...props} />
    </View>
  );
}

/* ---------------------------------
 *  Layout principal das abas
 * --------------------------------- */
export default function _TabsLayout() {
  const { counts } = useNotifications();
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{
          tabBarStyle: {
            backgroundColor: "#181818",
            height: TABBAR_HEIGHT,
            paddingTop: 8,
          },
          tabBarActiveTintColor: "#F2F2F2",
          tabBarInactiveTintColor: "#676D75",
          tabBarShowLabel: false,
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color }) => (
              <House size={28} color={color} strokeWidth={2} />
            ),
          }}
        />
        <Tabs.Screen
          name="vacancys"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "briefcase" : "briefcase-outline"}
                size={28}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="addPost"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "add-circle" : "add-circle-outline"}
                size={30}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "notifications" : "notifications-outline"}
                size={28}
                color={color}
              />
            ),
            tabBarBadge: counts.unread > 0 ? counts.unread : undefined,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ color }) => (
              <UserRound size={28} color={color} strokeWidth={2} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
