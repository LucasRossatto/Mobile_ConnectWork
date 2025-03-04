import React from "react";
import { Text, View, TextInput, TouchableOpacity } from "react-native";
import { Link } from "expo-router";

export default function Login() {
  return (
    <View className="flex-1 flex justify-center bg-backgroundLight p-4">
      {/* Título */}
      <Text className="text-3xl font-medium mb-8 text-center">
        Faça o seu login
      </Text>

      {/* Inputs */}
      <TextInput
        className="w-full border border-gray-300 rounded-[14] px-4 py-5 mb-4"
        placeholder="Email"
        keyboardType="email-address"
      />
      <TextInput
        className="w-full border border-gray-300 rounded-[14] px-4 py-5 mb-4"
        placeholder="Senha"
        secureTextEntry={true}
      />
      <View className="flex justify-end items-end">
        <Link
          href={"/(tabs)/register"}
          className="text-underlineLightBlue font-medium underline flex"
        >
          Esqueceu a senha?
        </Link>
      </View>
      {/* Botão de Login */}
      <TouchableOpacity className="border w-full bg-black text-white p-5 rounded-[14] text-center text-lg font-medium">
        <Text className="text-white text-center text-lg font-medium">
          Entre agora
        </Text>
      </TouchableOpacity>

      {/* Link para Cadastro */}
      <View className="flex-row flex justify-end items-center">
        <Text className="text-gray-600">Não tem uma conta? </Text>
        <Link
          href={"/(tabs)/register"}
          className="text-blue-500 font-medium underline"
        >
          Cadastre-se
        </Link>
      </View>
    </View>
  );
}
