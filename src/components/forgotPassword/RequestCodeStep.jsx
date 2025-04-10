import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { validateEmail } from "@/utils/validations";
import { Entypo } from "@expo/vector-icons";

const RequestCodeStep = ({ onSubmit, loading, error }) => {
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    const validation = validateEmail(email);
    if (validation !== true) {
      onSubmit(email);
      return;
    }
    onSubmit(email);
  };

  return (
    <View
      className=" flex-1 w-full px-5 flex items-center"
      accessibilityLabel="Tela de solicitação de código"
    >
      <Entypo
        className="flex justify-center mt-28"
        name={"mail-with-circle"}
        size={108}
        color={"#000"}
      />
      <View className="mt-10">
        <Text className="text-4xl font-medium mb-4 text-left ">
          Recuperação de conta
        </Text>
        <Text className="text-xl text-gray-400 mb-10 text-left">
          Digite o e-mail da sua conta . {"\n"}
          Enviaremos um código de segurança para você redefinir sua senha de
          forma rápida e segura.
        </Text>
      </View>

      <TextInput
        className="w-full bg-white border border-borderLight rounded-[14px] text-xl px-4 py-5 mb-6 mt-10"
        placeholder="SeuEmail@gmail.com"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        accessibilityLabel="Campo para digitar email"
        accessibilityHint="Digite o email associado à sua conta"
      />

      {error && (
        <Text
          className="text-red-500 mb-4 text-center"
          accessibilityRole="alert"
        >
          {error}
        </Text>
      )}

      <TouchableOpacity
        className={`w-full bg-black p-5 rounded-full  ${
          loading ? "opacity-70" : ""
        }`}
        onPress={handleSubmit}
        disabled={loading}
        accessibilityLabel="Botão para enviar código"
        accessibilityRole="button"
      >
        <Text className="text-white text-center text-lg font-medium">
          {loading ? "Enviando..." : "Enviar Código"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default RequestCodeStep;
