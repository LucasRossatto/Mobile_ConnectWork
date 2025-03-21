import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text } from "react-native";
import Icon from "react-native-vector-icons/Octicons";

const InputField = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  email,
  isValid = true,
  errorMessage,
}) => {
  const [showPassword, setShowPassword] = useState(!secureTextEntry);

  if (placeholder.includes("Código")) {
    return (
      <>
        <Text className="text-lg mb-4">
          Digite o código de verificação enviado para o seu e-mail:{" "}
          <Text className="font-bold">{email}</Text>
        </Text>

        <View className="flex-row justify-between mb-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <TextInput
              key={index}
              className={`w-[15%] h-16 border ${
                isValid ? "border-black" : "border-red-500"
              } rounded text-center text-lg`}
              placeholder="-"
              value={value[index] || ""}
              onChangeText={(text) => {
                const newValue = value.split("");
                newValue[index] = text;
                onChangeText(newValue.join(""));
              }}
              keyboardType="numeric"
              maxLength={1}
            />
          ))}
        </View>

        {errorMessage && (
          <Text className="text-red-500 text-sm mt-2">{errorMessage}</Text>
        )}
      </>
    );
  }

  return (
    <View className="relative mb-4">
      <TextInput
        className={`w-full bg-white border ${
          isValid ? "border-gray-300" : "border-red-500"
        } rounded-2xl text-xl px-4 py-5`}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!showPassword && secureTextEntry}
        keyboardType={placeholder.includes("Código") ? "numeric" : "default"}
        maxLength={placeholder.includes("Código") ? 6 : undefined}
      />

      {/* Ícone de olho para campos de senha */}
      {secureTextEntry && (
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
      )}

      {/* Exibição de mensagens de erro */}
      {errorMessage && (
        <Text className="text-red-500 text-sm mt-2 ml-2">{errorMessage}</Text>
      )}
    </View>
  );
};

export default InputField;
