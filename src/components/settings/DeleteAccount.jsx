import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";

const DeleteAccount = ({ onCancel }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <ScrollView className="flex-1 bg-gray-50 px-4">
      {/* Cabeçalho */}
      <Text className="text-2xl font-bold text-gray-900 mt-6 mb-6">
        Deletar Conta
      </Text>

      {/* Card principal */}
      <View className="bg-white rounded-xl shadow-sm p-5 mb-6">
        {/* Informações do usuário */}
        <View className="flex-row items-center justify-center mb-5">
          <View className="w-16 h-16 rounded-full bg-gray-200 mr-4 flex items-center justify-center">
            <Icon name="user" size={28} color="#4B5563" />
          </View>
          <View>
            <Text className="text-lg font-medium text-gray-800">Nome do Usuário</Text>
            <Text className="text-sm text-gray-500">email@exemplo.com</Text>
          </View>
        </View>

        <Text className="text-sm text-gray-600 mb-6 text-center">
          Sua conta será permanentemente excluída junto com todos os dados associados. Esta ação não pode ser desfeita.
        </Text>

        {/* Botão para deletar conta */}
        <TouchableOpacity
          className="bg-red-600 py-4 rounded-lg items-center justify-center"
          activeOpacity={0.8}
          onPress={() => setShowPopup(true)}
        >
          <Text className="text-white font-semibold text-base">
            Deletar minha conta
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal de confirmação */}
      <Modal
        visible={showPopup}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPopup(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 p-4">
          <View className="bg-white rounded-xl w-full max-w-md p-6">
            {/* Cabeçalho do modal */}
            <View className="items-center mb-5">
              <Icon name="alert-triangle" size={40} color="#DC2626" />
              <Text className="text-xl font-bold text-gray-900 mt-3">
                Confirmar exclusão da conta
              </Text>
              <Text className="text-sm text-gray-600 text-center mt-2">
                Digite seu e-mail e senha para confirmar a exclusão permanente
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
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
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
                onPress={() => setShowPopup(false)}
              >
                <Text className="text-gray-800 font-medium">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-red-600 py-3 rounded-lg items-center justify-center"
                activeOpacity={0.8}
                onPress={() => {
                  console.log("E-mail:", email);
                  console.log("Senha:", password);
                  setShowPopup(false);
                }}
              >
                <Text className="text-white font-medium">Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default DeleteAccount;