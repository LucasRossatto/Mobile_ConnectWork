import { StatusBar, Animated, Platform } from "react-native";
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
const ANIM_DURATION = 200; // ms

/* ---------------------------------
 *  Animated.Value + helpers globais
 * --------------------------------- */
const tabBarAnim = new Animated.Value(0); // 0 = visível • 1 = oculto

export const hideTabBar = () =>
  Animated.timing(tabBarAnim, {
    toValue: 1,
    duration: ANIM_DURATION,
    useNativeDriver: true,
  }).start();

export const showTabBar = () =>
  Animated.timing(tabBarAnim, {
    toValue: 0,
    duration: ANIM_DURATION,
    useNativeDriver: true,
  }).start();

/* ---------------------------------
 *  TabBar animado (interno)
 * --------------------------------- */
function AnimatedTabBar(props) {
  const translateY = tabBarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TABBAR_HEIGHT + 20], // desliza totalmente + folga
  });

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#181818",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
      }}
    >
      <BottomTabBar {...props} />
    </Animated.View>
  );
}

/* ---------------------------------
 *  Layout principal das abas
 * --------------------------------- */
export default function _TabsLayout() {
  const { counts } = useNotifications();
  const { user, isLoading } = useAuth();

  // Correção: A condição estava invertida
  if (!isLoading) {
    return null;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
      <Tabs
        // usamos nossa TabBar customizada
        tabBar={(props) => <AnimatedTabBar {...props} />}
        screenOptions={{
          tabBarStyle: {
            backgroundColor: "#181818",
            height: TABBAR_HEIGHT,
            paddingTop: 8,
            borderTopWidth: 0, // Adicionado para remover a borda
          },
          tabBarActiveTintColor: "#F2F2F2",
          tabBarInactiveTintColor: "#676D75",
          tabBarShowLabel: false,
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="home"
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
            // Correção: Adicionado safe check para counts
            tabBarBadge: counts?.unread > 0 ? counts.unread : undefined,
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
  );
}