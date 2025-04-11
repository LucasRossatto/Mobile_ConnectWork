import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const VerifyCodeStep = ({
  email,
  onSubmit,
  loading,
  error,
  resendCode,
  onBack,
}) => {
  const [code, setCode] = useState("");

  const handleSubmit = () => {
    if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
      onSubmit(code);
      return;
    }
    onSubmit(code);
  };

  return (
    <View
      className="w-full px-5"
      accessibilityLabel="Tela de verificação de código"
    >
      <View className="flex items-center">
        <MaterialCommunityIcons
          className="flex justify-center mt-28"
          name={"email-newsletter"}
          size={108}
          color={"#000"}
        />
        <Text className="text-4xl font-medium mb-4 mt-10 text-center">
          Verifique seu Email
        </Text>
        <Text className="text-xl text-green-500 text-center">
          Enviamos o código para
        </Text>
        <Text className="text-xl mb-10 font-semibold">{email}</Text>
      </View>

      <TextInput
        className="h-20 border-2 border-gray-300 rounded-full px-4 text-center text-4xl tracking-[10px] font-bold text-gray-800"
        placeholder="------"
        placeholderTextColor="#D1D5DB"
        keyboardType="number-pad"
        value={code}
        maxLength={6}
        onChangeText={setCode}
        autoFocus={true}
        selectionColor="#3B82F6"
        caretHidden={true}
        inputMode="numeric"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        accessibilityLabel="Campo para digitar código de verificação de 6 dígitos"
        accessibilityHint="Digite o código de 6 dígitos recebido por email"
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
        className="py-6 rounded-lg items-center"
        onPress={resendCode}
        disabled={loading}
        accessibilityLabel="ReenviarCodigo"
        accessibilityRole="button"
      >
        <View className="flex flex-row gap-2 items-center ">
          <Text className="text-gray-400 text-base font-medium">
            Não recebeu o código?
          </Text>
          <Text className="text-base font-semibold">Reenviar</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        className={`w-full bg-black p-5 rounded-full mb-8 ${
          loading ? "opacity-70" : ""
        }`}
        onPress={handleSubmit}
        disabled={loading}
        accessibilityLabel="Botão para verificar código"
        accessibilityRole="button"
      >
        <Text className="text-white text-center text-lg font-medium">
          {loading ? "Verificando..." : "Verificar Código"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default VerifyCodeStep;
