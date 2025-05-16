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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [passwordPass, setPasswordPass] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  return (
    <ScrollView className="flex-1 bg-gray-50 px-4">
      {/* Cabeçalho */}
      <Text className="text-2xl font-bold text-gray-900 mt-6 mb-6">
        Alterar senha
      </Text>
      
      {/* Informações importantes */}
      <View className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
        <View className="flex-row items-start mb-2">
          <Icon name="info" size={18} color="#3B82F6" className="mt-1 mr-2" />
          <Text className="text-blue-800 flex-1">
            Sua senha deve conter pelo menos:
          </Text>
        </View>
        <View className="ml-6">
          <Text className="text-blue-800 mb-1">• 8 caracteres</Text>
          <Text className="text-blue-800 mb-1">• 1 letra maiúscula</Text>
          <Text className="text-blue-800 mb-1">• 1 número</Text>
          <Text className="text-blue-800">• 1 caractere especial (@$!%*?&)</Text>
        </View>
      </View>

      {/* Formulário */}
      <View className="bg-white rounded-xl shadow-sm p-5">
        {/* Campo Senha Atual */}
        <View className="mb-5">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Senha atual *
          </Text>
          <View className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3">
            <TextInput
              secureTextEntry={!showCurrentPassword}
              value={passwordPass}
              onChangeText={setPasswordPass}
              className="flex-1 text-gray-800"
              placeholder="Digite sua senha atual"
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              className="ml-2"
            >
              <Icon
                name={showCurrentPassword ? "eye" : "eye-off"}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Campo Nova Senha */}
        <View className="mb-5">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Nova senha *
          </Text>
          <View className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3">
            <TextInput
              secureTextEntry={!showNewPassword}
              value={newPassword}
              onChangeText={setNewPassword}
              className="flex-1 text-gray-800"
              placeholder="Digite sua nova senha"
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity
              onPress={() => setShowNewPassword(!showNewPassword)}
              className="ml-2"
            >
              <Icon
                name={showNewPassword ? "eye" : "eye-off"}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Campo Confirmar Nova Senha */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Confirmar nova senha *
          </Text>
          <View className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3">
            <TextInput
              secureTextEntry={!showConfirmNewPassword}
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              className="flex-1 text-gray-800"
              placeholder="Confirme sua nova senha"
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
              className="ml-2"
            >
              <Icon
                name={showConfirmNewPassword ? "eye" : "eye-off"}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Botão de ação */}
        <TouchableOpacity 
          className="bg-black py-4 rounded-lg items-center justify-center"
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold text-base">
            Salvar alterações
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default SettingsSenha;