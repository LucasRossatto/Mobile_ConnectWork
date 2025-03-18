import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";

const SettingsSenha = () => {
  // Estados para controlar a visibilidade da senha de cada campo
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // Estados para armazenar os valores dos campos
  const [passwordPass, setPasswordPass] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      className="p-4 bg-gray-100"
    >
      {/* Título fora da área branca */}
      <Text className="text-[22px] font-bold mb-4">Alterar senha</Text>

      {/* Área branca que engloba o formulário */}
      <View className="bg-white rounded-lg p-4">
        {/* Campo: Senha Atual */}
        <View className="mb-4">
          <Text className="text-[16px] font-medium mb-2">
            Digite sua senha atual *
          </Text>
          <View className="flex-row items-center border border-gray-300 rounded-lg p-1 pr-3">
            <TextInput
              secureTextEntry={!showCurrentPassword} // Controla a visibilidade da senha atual
              value={passwordPass}
              onChangeText={setPasswordPass}
              className="flex-1"
            />
            <TouchableOpacity
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              <Icon
                name={showCurrentPassword ? "eye" : "eye-off"}
                size={20}
                color="#000"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Campo: Nova Senha */}
        <View className="mb-4">
          <Text className="text-[16px] font-medium mb-2">
            Digite sua nova senha *
          </Text>
          <View className="flex-row items-center border border-gray-300 rounded-lg p-1 pr-3">
            <TextInput
              secureTextEntry={!showNewPassword} // Controla a visibilidade da nova senha
              value={newPassword}
              onChangeText={setNewPassword}
              className="flex-1"
            />
            <TouchableOpacity
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <Icon
                name={showNewPassword ? "eye" : "eye-off"}
                size={20}
                color="#000"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Campo: Confirmar Nova Senha */}
        <View className="mb-4">
          <Text className="text-[16px] font-medium mb-2">
            Confirme sua nova senha *
          </Text>
          <View className="flex-row items-center border border-gray-300 rounded-lg p-1 pr-3">
            <TextInput
              secureTextEntry={!showConfirmNewPassword} // Controla a visibilidade da confirmação
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              className="flex-1"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
            >
              <Icon
                name={showConfirmNewPassword ? "eye" : "eye-off"}
                size={20}
                color="#000"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Botão para salvar */}
        <TouchableOpacity className="bg-black py-4 rounded-lg mt-2 items-center">
          <Text className="text-white font-bold text-[17px]">Alterar senha</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default SettingsSenha;