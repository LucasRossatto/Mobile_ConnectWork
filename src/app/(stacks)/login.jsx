import React, { useState } from "react";
import { Text, View, TextInput, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Octicons";
import { Link, useRouter } from "expo-router";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const goToHome = () => {
    router.push("/(tabs)");
  };

  return (
    <View className="flex-1 flex justify-center bg-backgroundLight p-4">
      <Text className="text-4xl font-medium mb-10 text-center">
        Faça o seu login
      </Text>

      <TextInput
        className="w-full bg-white border border-borderLight rounded-[14] text-xl px-4 py-5 mb-4"
        placeholder="Email"
        keyboardType="email-address"
      />

      <View className="relative mb-4">
        <TextInput
          className="w-full bg-white border border-borderLight rounded-[14] text-xl px-4 py-5 pr-12"
          placeholder="Senha"
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          className="absolute right-4 top-5"
          onPress={() => setShowPassword(!showPassword)}
        >
          <Icon
            name={showPassword ? "eye" : "eye-closed"}
            size={24}
            color="#666666"
          />
        </TouchableOpacity>
      </View>

      <View className="flex justify-end items-end mb-14">
        <Link
          href={"/(stacks)/register"}
          className="text-gray-400 text-base font-medium underline flex"
        >
          Esqueceu a senha?
        </Link>
      </View>

      <TouchableOpacity
        onPress={goToHome}
        className="border w-full bg-black text-white p-5 rounded-[14] text-center text-lg font-medium mb-8"
      >
        <Text className="text-white text-center text-lg font-medium">
          Entre agora
        </Text>
      </TouchableOpacity>

      <View className="flex-row flex justify-center items-center">
        <Text className="text-gray-600">Não tem uma conta? </Text>
        <Link
          href={"/(tabs)/home"}
          className="text-blue-500 text-base font-medium underline"
        >
          Cadastre-se
        </Link>
      </View>
    </View>
  );
}
