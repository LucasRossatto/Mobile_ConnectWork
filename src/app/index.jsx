import { useRouter } from "expo-router";
import { View, Image, Text, TouchableOpacity } from "react-native";
import { BackHandler } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

   useEffect(() => {
    const backAction = () => {
      if (router.canGoBack()) {
        return false; 
      } else if (user === null) {
        BackHandler.exitApp();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [user, router]);

  const handleLoginPress = () => {
    router.push("/(auth)/login");
  };

  const handleRegisterPress = () => {
    router.push("/(auth)/register");
  };

  return (
    <View className="flex-1 justify-between bg-backgroundDark">
      <View className="flex-1 justify-center items-center">
        <Image
          source={require("@/assets/images/logo.png")}
          className="w-screen h-20"
          resizeMode="contain"
        />
      </View>

      <View className="bg-white flex gap-4 pt-14 pr-6 pl-6 w-full pb-6 rounded-t-[56]">
        <TouchableOpacity 
          className="border bg-black text-white p-5 rounded-full flex items-center"
          onPress={handleLoginPress}
        >
          <Text className="text-white text-lg font-medium">Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="border border-gray-300 shadow-md p-5 rounded-full flex items-center" 
          onPress={handleRegisterPress}
        >
          <Text className="text-black text-lg font-medium">Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}