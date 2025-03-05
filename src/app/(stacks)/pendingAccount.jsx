import { useRouter } from "expo-router";
import React from "react";
import { Text, View, TouchableOpacity } from "react-native";

export default function pendingAccount() {
  const router = useRouter();
  const goToLogin = () => {
    router.push("/(stacks)/login");
  };
  return (
    <View className="flex-1 flex justify-center bg-backgroundDark p-4">
      <Text className="text-4xl text-white font-medium mb-4 text-center">
        Conta Solicitada!
      </Text>
      <View className="flex justify-center items-center">
        <Text className="text-xl text-gray-300 font-normal  mb-10 text-center w-[70%]">
          Aguarde um administrador aceitar sua conta!
        </Text>
      </View>
      <TouchableOpacity
        className="bg-white py-5 px-10 rounded-[14]"
        onPress={goToLogin}
      >
        <Text className="text-black text-lg">Ir para a tela de login</Text>
      </TouchableOpacity>
    </View>
  );
}
