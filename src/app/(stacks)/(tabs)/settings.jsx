import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const Settings = () => {
  const [currentSection, setCurrentSection] = useState('senha'); // Controla a seção atual
  const [showLogoutModal, setShowLogoutModal] = useState(false); // Controla o modal de logout
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Controla o modal de exclusão de conta

  // Função para renderizar o conteúdo da seção atual
  const renderSection = () => {
    switch (currentSection) {
      case 'senha':
        return (
          <View className="bg-white p-4 rounded-lg">
            <Text className="text-lg font-bold text-gray-800">Alterar Senha</Text>
            <Text className="text-sm text-gray-600 mt-2">
              Para alterar sua senha, insira a senha atual e a nova senha.
            </Text>
          </View>
        );
      case 'logout':
        return (
          <View className="bg-white p-4 rounded-lg">
            <Text className="text-lg font-bold text-gray-800">Sair da Conta</Text>
            <Text className="text-sm text-gray-600 mt-2">
              Tem certeza que deseja sair da sua conta?
            </Text>
            <TouchableOpacity
              className="bg-black p-3 rounded-lg mt-4"
              onPress={() => setShowLogoutModal(true)}
            >
              <Text className="text-white text-center font-bold">Sair</Text>
            </TouchableOpacity>
          </View>
        );
      case 'delete':
        return (
          <View className="bg-white p-4 rounded-lg">
            <Text className="text-lg font-bold text-gray-800">Excluir Conta</Text>
            <Text className="text-sm text-gray-600 mt-2">
              Esta ação é irreversível. Tem certeza que deseja excluir sua conta?
            </Text>
            <TouchableOpacity
              className="bg-black p-3 rounded-lg mt-4"
              onPress={() => setShowDeleteModal(true)}
            >
              <Text className="text-white text-center font-bold">Excluir Conta</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Menu de Configurações */}
      <ScrollView className="bg-white p-4">
        <TouchableOpacity
          className="flex-row items-center py-3 border-b border-gray-200"
          onPress={() => setCurrentSection('senha')}
        >
          <Icon name="lock" size={20} color="#333" />
          <Text className="text-base text-gray-800 ml-3">Alterar Senha</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-row items-center py-3 border-b border-gray-200"
          onPress={() => setCurrentSection('logout')}
        >
          <Icon name="log-out" size={20} color="#333" />
          <Text className="text-base text-gray-800 ml-3">Sair da Conta</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-row items-center py-3 border-b border-gray-200"
          onPress={() => setCurrentSection('delete')}
        >
          <Icon name="trash-2" size={20} color="#333" />
          <Text className="text-base text-gray-800 ml-3">Excluir Conta</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Conteúdo da Seção Selecionada */}
      <View className="p-4">
        {renderSection()}
      </View>

      {/* Modal de Logout */}
      <Modal visible={showLogoutModal} transparent={true} animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white w-80 p-6 rounded-lg">
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

      {/* Modal de Exclusão de Conta */}
      <Modal visible={showDeleteModal} transparent={true} animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white w-80 p-6 rounded-lg">
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
    </View>
  );
};

export default Settings;