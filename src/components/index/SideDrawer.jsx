import { useRef, useEffect } from "react";
import { Link } from "expo-router";
import { View, Text, Image, Pressable, Animated, Easing } from "react-native";
import {
  Search as SearchIcon,
  Briefcase,
  BarChart3,
  Settings as SettingsIcon,
  Home as HomeIcon,
} from "lucide-react-native";

const DrawerItem = ({ icon: Icon, label, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    className="flex-row items-center"
  >
    <Icon size={27} color="#FFFFFF" />
    <Text className="text-white font-bold text-base py-4 pl-2">{label}</Text>
  </Pressable>
);

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
        className="absolute inset-0 bg-black"
        style={{
          opacity: overlayOpacity,
          zIndex: Z_INDEX,
        }}
      >
        <Pressable className="flex-1" onPress={onClose} />
      </Animated.View>

      {/* Drawer */}
      <Animated.View
        pointerEvents={pe}
        className="absolute inset-y-0 left-0 w-80 bg-[#181818] shadow-lg"
        style={{
          transform: [{ translateX }],
          shadowColor: "#000000",
          shadowOffset: { width: 5, height: 0 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
          zIndex: Z_INDEX + 1,
        }}
      >
        <View className="p-0 mt-12">
          {/* Perfil */}
          <View className="flex-row items-center mb-8 ml-5">
            <View className="h-[64px] w-[64px] rounded-full bg-gray-200 flex justify-center items-center mr-4">
              {user?.profile_img ? (
                <Image
                  source={{ uri: user.profile_img }}
                  className="h-full w-full rounded-full"
                  resizeMode="cover"
                  accessibilityLabel="Foto do perfil"
                />
              ) : (
                <View className="flex-1 justify-center items-center">
                  <Text className="text-4xl font-bold text-black text-center">
                    {user?.nome?.charAt(0)?.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <View className="flex-1" >
              <Text
                className="text-white font-bold text-xl mb-1"
                style={{ flexWrap: "wrap" }}
              >
                {user?.nome}
              </Text>
              <Text
                className="text-white text-sm"
                style={{ flexWrap: "wrap" }}
              >
                {user?.course}
              </Text>
            </View>
          </View>

          {/* Itens */}
          <View className="ml-6">
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
