import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { UserRound } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import api from "@/services/api";
import log from "@/utils/logger";

const DeleteAccount = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const { logout, user } = useAuth();

  const resetStates = () => {
    setEmail("");
    setPassword("");
    setShowPopup(false);
  };

  const handleDelete = async () => {
    // Validações básicas
    if (!email || !password) {
      Alert.alert("Erro", "Por favor, preencha todos os campos");
      return;
    }

    setIsLoading(true);
    
    try {
      const payload = {
        email,
        password,
        userId: user.id
      };

      log.debug("Enviando requisição para deletar conta:", payload);

      const response = await api.delete(
        "/user/delete-account",
        { data: payload }
      );

      log.debug("Resposta da exclusão:", response.data);

      Alert.alert("Sucesso", "Conta excluída com sucesso!");
      
      resetStates();
      logout();

    } catch (error) {
      log.error("Erro ao deletar conta:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });

      let errorMessage = "Erro ao excluir a conta";
      
      if (error.response?.status === 400) {
        errorMessage = "Dados inválidos fornecidos";
      } else if (error.response?.status === 401) {
        errorMessage = "Não autorizado. Sua sessão pode ter expirado.";
      } else if (error.response?.status === 404) {
        errorMessage = "Endpoint não encontrado. Contate o suporte.";
      } else if (error.message.includes("Network Error")) {
        errorMessage = "Erro de conexão. Verifique sua internet.";
      } else if (error.response?.data?.error) {
        errorMessage += `: ${error.response.data.error}`;
      }

      Alert.alert("Erro", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50 px-4"
      keyboardShouldPersistTaps="handled"
    >
      {/* Cabeçalho */}
      <Text className="text-2xl font-bold text-gray-900 mt-6 mb-6">
        Deletar Conta
      </Text>

      {/* Card principal */}
      <View className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <View className="items-center mb-6">
          <Icon name="trash-2" size={40} color="#EF4444" className="mb-4" />
          <Text className="text-xl font-bold text-gray-900 text-center">
            Deseja excluir sua conta permanentemente?
          </Text>
        </View>

        {/* Informações do usuário */}
        <View className="flex-row items-center justify-center mb-8 p-4 bg-gray-50 rounded-lg">
          <View className="w-14 h-14 rounded-full bg-gray-200 mr-4 flex items-center justify-center">
            {user?.profile_img ? (
              <Image
                source={{ uri: user.profile_img }}
                className="w-full h-full rounded-full"
                resizeMode="cover"
              />
            ) : (
              <UserRound size={24} color="#4B5563" />
            )}
          </View>
          <View>
            <Text className="text-base font-medium text-gray-800">
              {user?.nome || "Nome do Usuário"}
            </Text>
            <Text className="text-sm text-gray-500">
              {user?.email || "email@exemplo.com"}
            </Text>
          </View>
        </View>

        <Text className="text-sm text-gray-600 mb-6 text-center">
          Todos os seus dados serão permanentemente removidos e esta ação não pode ser desfeita.
        </Text>

        {/* Botão de ação */}
        <TouchableOpacity
          className="bg-red-600 py-4 rounded-lg items-center justify-center"
          activeOpacity={0.8}
          onPress={() => setShowPopup(true)}
          disabled={isLoading}
        >
          <Text className="text-white font-semibold text-base">
            Excluir minha conta
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal de confirmação */}
      <Modal
        visible={showPopup}
        transparent={true}
        animationType="fade"
        onRequestClose={() => !isLoading && setShowPopup(false)}
      >
        <TouchableOpacity
          className="flex-1 justify-center items-center bg-black/50 p-4"
          activeOpacity={1}
          onPressOut={() => !isLoading && setShowPopup(false)}
        >
          <View className="bg-white rounded-xl w-full max-w-md p-6">
            {/* Cabeçalho do modal */}
            <View className="items-center mb-5">
              <Icon name="alert-triangle" size={40} color="#EF4444" />
              <Text className="text-xl font-bold text-gray-900 mt-3 text-center">
                Confirmar exclusão da conta
              </Text>
              <Text className="text-sm text-gray-600 text-center mt-2">
                Digite seu e-mail e senha para confirmar
              </Text>
            </View>

            {/* Campo de e-mail */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                E-mail
              </Text>
              <TextInput
                placeholder="Digite seu e-mail"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            {/* Campo de senha */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Senha
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg px-4">
                <TextInput
                  placeholder="Digite sua senha"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  className="flex-1 py-3 text-gray-800"
                  editable={!isLoading}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <Icon
                    name={showPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Botões de ação */}
            <View className="flex-row justify-between space-x-3">
              <TouchableOpacity
                className="flex-1 border border-gray-300 py-3 rounded-lg items-center justify-center"
                activeOpacity={0.8}
                onPress={() => !isLoading && setShowPopup(false)}
                disabled={isLoading}
              >
                <Text className="text-gray-800 font-medium">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-red-600 py-3 rounded-lg items-center justify-center"
                activeOpacity={0.8}
                onPress={handleDelete}
                disabled={isLoading}
              >
                <Text className="text-white font-medium">
                  {isLoading ? "Processando..." : "Confirmar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

export default DeleteAccount;