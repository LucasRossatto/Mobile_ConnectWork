import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Animated,
  Easing,
  Image,
} from "react-native";

export default function PendingAccount() {
  const router = useRouter();
  const spinValue = useRef(new Animated.Value(0)).current;

  const goToLogin = () => {
    router.push("/login");
  };

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    spin.start();

    return () => spin.stop();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View className="flex-1 justify-center bg-backgroundDark p-4">
      <View className="items-center mb-6">
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Image
            source={require("@/assets/images/ampulheta.png")}
            className="w-[54] h-[54]"
          />
        </Animated.View>
      </View>

      <Text className="text-4xl text-white font-medium mb-4 text-center">
        Conta Solicitada!
      </Text>

      <View className="flex justify-center items-center">
        <Text className="text-xl text-gray-300 font-normal mb-10 text-center w-[70%]">
          Aguarde um administrador aceitar sua conta!
        </Text>
      </View>

      <View className="absolute bottom-10 left-0 right-0 px-5 mx-4">
        <TouchableOpacity
          className="bg-white py-5 rounded-[14]"
          onPress={goToLogin}
        >
          <Text className="text-black text-lg text-center">
            Ir para a tela de login
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
