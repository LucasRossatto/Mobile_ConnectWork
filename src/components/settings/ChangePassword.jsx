import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import log from "@/utils/logger";

const SettingsSenha = () => {
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  const resetStates = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  const validatePassword = (password) => {
    const validation = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
    setPasswordRequirements(validation);
    return Object.values(validation).every((req) => req);
  };

  const toggleShowPassword = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert("Erro", "Todos os campos são obrigatórios");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert("Erro", "As senhas não coincidem");
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert("Erro", "A nova senha deve ser diferente da senha atual");
      return;
    }

    if (!validatePassword(newPassword)) {
      Alert.alert("Erro", "A senha não atende a todos os requisitos");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        userId: user.id,
        oldPassword: currentPassword,
        newPassword: newPassword,
        confirmNewPassword: confirmNewPassword,
      };

      log.debug("Enviando payload:", payload);

      const response = await api.patch("/user/password", payload);

      log.debug("resposta:", response.data);

      Alert.alert("Sucesso", "Senha alterada com sucesso!");

      resetStates();
    } catch (error) {
      log.error("Erro completo:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });

      let errorMessage = "Erro ao atualizar a senha";

      if (error.response?.status === 404) {
        errorMessage = "Endpoint não encontrado. Contate o suporte técnico.";
      } else if (error.response?.data?.message) {
        errorMessage += `: ${error.response.data.message}`;
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }

      Alert.alert("Erro", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  const RequirementItem = ({ met, text }) => (
    <View className="flex-row items-center mb-1">
      <Icon
        name={met ? "check-circle" : "x-circle"}
        size={16}
        color={met ? "#10B981" : "#9CA3AF"}
        className="mr-2"
      />
      <Text className={`text-sm ${met ? "text-green-600" : "text-gray-500"}`}>
        {text}
      </Text>
    </View>
  );

  return (
    <ScrollView
      className="flex-1 bg-gray-50 px-4"
      keyboardShouldPersistTaps="handled"
    >
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
          <RequirementItem
            met={passwordRequirements.length}
            text="8 caracteres"
          />
          <RequirementItem
            met={passwordRequirements.uppercase}
            text="1 letra maiúscula (A-Z)"
          />
          <RequirementItem
            met={passwordRequirements.lowercase}
            text="1 letra minúscula (a-z)"
          />
          <RequirementItem
            met={passwordRequirements.number}
            text="1 número (0-9)"
          />
          <RequirementItem
            met={passwordRequirements.specialChar}
            text="1 caractere especial (@$!%*?&)"
          />
        </View>
      </View>

      {/* Formulário */}
      <View className="bg-white rounded-xl shadow-sm p-5">
        {/* Campo Senha Atual */}
        <View className="mb-5">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Senha atual *
          </Text>
          <View className="flex-row items-center border border-gray-300 rounded-lg px-4">
            <TextInput
              secureTextEntry={!showPassword.current}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              className="flex-1 py-3 text-gray-800"
              placeholder="Digite sua senha atual"
              placeholderTextColor="#9CA3AF"
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={() => toggleShowPassword("current")}
              className="ml-2"
              disabled={isLoading}
            >
              <Icon
                name={showPassword.current ? "eye" : "eye-off"}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>
        </View>
        // Campo Nova Senha (corrigido)
        <View className="mb-5">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Nova senha *
          </Text>
          <View className="flex-row items-center border border-gray-300 rounded-lg px-4">
            <TextInput
              secureTextEntry={!showPassword.new}
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                validatePassword(text);
              }}
              className="flex-1 py-3 text-gray-800"
              placeholder="Digite sua nova senha"
              placeholderTextColor="#9CA3AF"
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={() => toggleShowPassword("new")}
              className="ml-2"
              disabled={isLoading}
            >
              <Icon
                name={showPassword.new ? "eye" : "eye-off"}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>
        </View>
        // Campo Confirmar Nova Senha (corrigido)
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Confirmar nova senha *
          </Text>
          <View className="flex-row items-center border border-gray-300 rounded-lg px-4">
            <TextInput
              secureTextEntry={!showPassword.confirm}
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              className="flex-1 py-3 text-gray-800"
              placeholder="Confirme sua nova senha"
              placeholderTextColor="#9CA3AF"
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={() => toggleShowPassword("confirm")}
              className="ml-2"
              disabled={isLoading}
            >
              <Icon
                name={showPassword.confirm ? "eye" : "eye-off"}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>
        </View>
        {/* Botão de ação */}
        <TouchableOpacity
          className={`bg-black py-4 rounded-lg items-center justify-center ${
            isLoading ? "opacity-70" : ""
          }`}
          activeOpacity={0.8}
          onPress={handlePasswordChange}
          disabled={isLoading}
        >
          <Text className="text-white font-semibold text-base">
            {isLoading ? "Salvando..." : "Salvar alterações"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default SettingsSenha;
