import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useRouter } from 'expo-router';

const Settings = () => {
  const [showSenhaModal, setShowSenhaModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();

  const goBack = () => {
    router.push("/(tabs)/home");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Conteúdo principal */}
      <ScrollView className="flex-1 bg-gray-100">
        {/* Menu de Configurações */}
        <View className="bg-white p-4">
          {/* Botão Alterar Senha */}
          <TouchableOpacity
            className="flex-row items-center py-3 border-b border-gray-200 active:bg-black"
            onPress={() => setShowSenhaModal(true)}
          >
            <Icon name="lock" size={20} color="#000" />
            <Text className="text-base text-gray-800 ml-3">Alterar Senha</Text>
          </TouchableOpacity>

          {/* Botão Sair da Conta */}
          <TouchableOpacity
            className="flex-row items-center py-3 border-b border-gray-200 active:bg-black"
            onPress={() => setShowLogoutModal(true)}
          >
            <Icon name="log-out" size={20} color="#000" />
            <Text className="text-base text-gray-800 ml-3">Sair da Conta</Text>
          </TouchableOpacity>

          {/* Botão Excluir Conta */}
          <TouchableOpacity
            className="flex-row items-center py-3 border-b border-gray-200 active:bg-black"
            onPress={() => setShowDeleteModal(true)}
          >
            <Icon name="trash-2" size={20} color="#000" />
            <Text className="text-base text-gray-800 ml-3">Excluir Conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal Alterar Senha */}
      <Modal visible={showSenhaModal} transparent={true} animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white w-11/12 p-6 rounded-lg" style={{ maxWidth: 400 }}>
            <Text className="text-lg font-bold text-gray-800">Alterar Senha</Text>
            <Text className="text-sm text-gray-600 mt-2">
              Insira sua nova senha abaixo.
            </Text>
            {/* Adicione aqui os campos de entrada para a nova senha */}
            <View className="flex-row justify-end mt-4">
              <TouchableOpacity
                className="px-4 py-2"
                onPress={() => setShowSenhaModal(false)}
              >
                <Text className="text-gray-600">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-black px-4 py-2 rounded-lg ml-2"
                onPress={() => {
                  // Lógica para alterar senha
                  setShowSenhaModal(false);
                }}
              >
                <Text className="text-white font-bold">Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Sair da Conta */}
      <Modal visible={showLogoutModal} transparent={true} animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white w-11/12 p-6 rounded-lg" style={{ maxWidth: 400 }}>
            <Text className="text-lg font-bold text-gray-800">Sair da Conta</Text>
            <Text className="text-sm text-gray-600 mt-2">
              Tem certeza que deseja sair da sua conta?
            </Text>
            <View className="flex-row justify-end mt-4">
              <TouchableOpacity
                className="px-4 py-2"
                onPress={() => setShowLogoutModal(false)}
              >
                <Text className="text-gray-600">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-black px-4 py-2 rounded-lg ml-2"
                onPress={() => {
                  // Lógica para logout
                  setShowLogoutModal(false);
                }}
              >
                <Text className="text-white font-bold">Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Excluir Conta */}
      <Modal visible={showDeleteModal} transparent={true} animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white w-11/12 p-6 rounded-lg" style={{ maxWidth: 400 }}>
            <Text className="text-lg font-bold text-gray-800">Excluir Conta</Text>
            <Text className="text-sm text-gray-600 mt-2">
              Esta ação é irreversível. Tem certeza que deseja excluir sua conta?
            </Text>
            <View className="flex-row justify-end mt-4">
              <TouchableOpacity
                className="px-4 py-2"
                onPress={() => setShowDeleteModal(false)}
              >
                <Text className="text-gray-600">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-black px-4 py-2 rounded-lg ml-2"
                onPress={() => {
                  // Lógica para excluir conta
                  setShowDeleteModal(false);
                }}
              >
                <Text className="text-white font-bold">Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Settings;