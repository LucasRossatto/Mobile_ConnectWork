import React, { useRef, useEffect } from "react";
import { View, Text, Image, Pressable, Animated, Easing } from "react-native";
import {
  Search as SearchIcon,
  Briefcase,
  BarChart3,
  Settings as SettingsIcon,
  Home as HomeIcon,
  UserRound,
} from "lucide-react-native";

/* ------------------------------
 *  DrawerItem
 * ------------------------------ */
const DrawerItem = ({ icon: Icon, label, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    style={{ flexDirection: "row", alignItems: "center" }}
  >
    <Icon size={27} color="#FFFFFF" />
    <Text
      style={{
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 16,
        paddingVertical: 16,
        paddingLeft: 8,
      }}
    >
      {label}
    </Text>
  </Pressable>
);

/* ------------------------------
 *  SideDrawer
 * ------------------------------ */
const SideDrawer = ({ visible, onClose, user }) => {
  const anim = useRef(new Animated.Value(0)).current;

  /* anima abre/fecha */
  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [visible, anim]);

  /* interpolações */
  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-320, 0],
  });

  const overlayOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  /* pointerEvents evita bloquear toques quando invisible */
  const pe = visible ? "auto" : "none";

  /* zIndex alto para ficar acima do ModalSearch */
  const Z_INDEX = 100;

  return (
    <>
      {/* Overlay escurecido */}
      <Animated.View
        pointerEvents={pe}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#000000",
          opacity: overlayOpacity,
          zIndex: Z_INDEX,
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      {/* Drawer */}
      <Animated.View
        pointerEvents={pe}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: 320,
          backgroundColor: "#1B1D2A",
          transform: [{ translateX }],
          shadowColor: "#000000",
          shadowOffset: { width: 5, height: 0 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
          zIndex: Z_INDEX + 1,
        }}
      >
        <View style={{ padding: 16, marginTop: 48 }}>
          {/* Perfil */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 32,
              marginLeft: 20,
            }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: "#D1D5DB",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                marginRight: 16,
              }}
            >
              {user?.profile_img ? (
                <Image
                  source={{ uri: user.profile_img }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              ) : (
                <UserRound size={52} color="#6B7280" />
              )}
            </View>
            <View>
              <Text
                style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 20 }}
              >
                {user?.nome || "Visitante"}
              </Text>
              <Text style={{ color: "#FFFFFF", fontSize: 14 }}>
                {user?.course || "Nenhum curso"}
              </Text>
            </View>
          </View>

          {/* Itens */}
          <View style={{ marginLeft: 24 }}>
            <DrawerItem icon={HomeIcon} label="Home" onPress={onClose} />
            <DrawerItem
              icon={SearchIcon}
              label="Procurar Vagas"
              onPress={onClose}
            />
            <DrawerItem
              icon={Briefcase}
              label="Vagas em espera"
              onPress={() => {}}
            />
            <DrawerItem
              icon={BarChart3}
              label="Frequência"
              onPress={() => {}}
            />
            <DrawerItem
              icon={SettingsIcon}
              label="Configurações"
              onPress={() => {}}
            />
          </View>
        </View>
      </Animated.View>
    </>
  );
};

export default SideDrawer;
