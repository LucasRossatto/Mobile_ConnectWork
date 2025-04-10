import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";
import { validatePassword } from "@/utils/validations";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const NewPasswordStep = ({ onSubmit, loading, error }) => {
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = () => {
    if (!form.password || !form.confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Por favor, preencha ambos os campos",
      });
      return;
    }

    if (form.password !== form.confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "As senhas não coincidem",
      });
      return;
    }

    const validation = validatePassword(form.password);
    if (validation !== true) {
      Toast.show({
        type: "error",
        text1: "Senha inválida",
        text2: validation,
      });
      return;
    }

    onSubmit(form.password);
  };

  return (
    <View className="w-full px-5 flex items-center">
      <MaterialCommunityIcons
        className="mt-28"
        name={"shield-lock-outline"}
        size={108}
        color={"#000"}
      />
      <Text className="text-4xl font-medium mb-4 mt-10 text-center">
        Redefinindo a senha
      </Text>
      <Text className="text-xl text-gray-400 mb-10 text-center">
        Sua nova senha deve ser diferente da antiga
      </Text>

      <TextInput
        className="w-full bg-white border border-borderLight rounded-[14px] text-xl px-4 py-5 mb-6"
        placeholder="Nova senha"
        secureTextEntry
        value={form.password}
        onChangeText={(text) => setForm({ ...form, password: text })}
        accessibilityLabel="Campo para digitar nova senha"
      />

      <TextInput
        className="w-full bg-white border border-borderLight rounded-[14px] text-xl px-4 py-5 mb-6"
        placeholder="Confirme a nova senha"
        secureTextEntry
        value={form.confirmPassword}
        onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
        accessibilityLabel="Campo para confirmar nova senha"
      />

      {error ? (
        <Text
          className="text-red-500 mb-4 text-center"
          accessibilityRole="alert"
        >
          {error}
        </Text>
      ) : null}

      <TouchableOpacity
        className={`w-full bg-black p-5 rounded-full mb-8 ${
          loading ? "opacity-70" : ""
        }`}
        onPress={handleSubmit}
        disabled={loading}
        accessibilityLabel="Botão para atualizar senha"
        accessibilityRole="button"
      >
        <Text className="text-white text-center text-lg font-medium">
          {loading ? "Atualizando..." : "Atualizar Senha"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default NewPasswordStep;
