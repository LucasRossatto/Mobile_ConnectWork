import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const LogoutConfirm = ({ onCancel }) => {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <ScrollView className="flex-1 bg-gray-50 px-4">
      {/* Cabeçalho */}
      <Text className="text-2xl font-bold text-gray-900 mt-6 mb-6">
        Sair da Conta
      </Text>

      {/* Card principal */}
      <View className="bg-white rounded-xl shadow-sm p-6">
        <View className="items-center mb-6">
          <Icon name="log-out" size={40} color="#EF4444" className="mb-4" />
          <Text className="text-xl font-bold text-gray-900 text-center">
            Deseja sair da sua conta?
          </Text>
        </View>

        {/* Informações do usuário */}
        <View className="flex-row items-center justify-center mb-8 p-4 bg-gray-50 rounded-lg">
          <View className="w-14 h-14 rounded-full bg-gray-200 mr-4 flex items-center justify-center">
            <Icon name="user" size={24} color="#4B5563" />
          </View>
          <View>
            <Text className="text-base font-medium text-gray-800">Nome do Usuário</Text>
            <Text className="text-sm text-gray-500">email@exemplo.com</Text>
          </View>
        </View>

        {/* Botão de ação */}
        <TouchableOpacity
          className="bg-red-600 py-4 rounded-lg items-center justify-center"
          activeOpacity={0.8}
          onPress={() => setShowPopup(true)}
        >
          <Text className="text-white font-semibold text-base">
            Confirmar saída
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
              <Icon name="alert-circle" size={40} color="#EF4444" />
              <Text className="text-xl font-bold text-gray-900 mt-3 text-center">
                Confirmação necessária
              </Text>
              <Text className="text-sm text-gray-600 text-center mt-2">
                Você será desconectado do aplicativo
              </Text>
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
                  setShowPopup(false);
                  onCancel();
                }}
              >
                <Text className="text-white font-medium">Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default LogoutConfirm;