import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Modal } from 'react-native';

const LogoutConfirm = ({ onCancel }) => {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      className="p-4 bg-gray-100"
    >
      <Text className="text-[20px] font-bold mb-4">Sair da Conta</Text>

      <View className="bg-white p-4 rounded-lg shadow-md">
        <Text className="font-bold text-[18px] text-center mb-5 mt-5">
          Tem certeza que deseja sair?
        </Text>
        {/* Informações do usuário */}
        <View className="flex-row items-center justify-center mb-4 mt-2">
          <Image
            source={{ uri: 'https://via.placeholder.com/150' }}
            className="w-12 h-12 rounded-full mr-3 bg-black"
          />
          <View>
            <Text className="text-[16px] font-medium">Nome do Usuário</Text>
            <Text className="text-[14px] text-gray-500">email@exemplo.com</Text>
          </View>
        </View>

        {/* Botão para abrir o pop-up de confirmação */}
        <TouchableOpacity
          className="bg-black py-3 rounded-lg items-center mt-5"
          onPress={() => setShowPopup(true)}
        >
          <Text className="text-white font-bold">Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Pop-up de confirmação */}
      <Modal
        visible={showPopup}
        transparent={true}
        animationType="fade" // Animação suave
        onRequestClose={() => setShowPopup(false)}
      >
        {/* Fundo escurecido */}
        <View className="flex-1 justify-center items-center bg-black/50">
          {/* Container do pop-up */}
          <View className="bg-white p-6 rounded-lg w-[90%] max-w-md">
            <Text className="text-[22px] font-bold mb-4 text-center">
              Confirmar saída
            </Text>
            <Text className="text-[16px] text-gray-500 mb-6 text-center">
              Você realmente deseja sair da conta?
            </Text>

            {/* Botões do pop-up */}
            <View className="flex-row justify-between">
              <TouchableOpacity
                className="flex-1 py-3 px-6 rounded-lg border border-gray-300 items-center mr-2" // Adicionado mr-2 para espaçamento
                onPress={() => setShowPopup(false)}
              >
                <Text className="text-black text-[16px]">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-black py-3 px-6 rounded-lg items-center ml-2" // Adicionado ml-2 para espaçamento
                onPress={() => {
                  setShowPopup(false); // Fecha o pop-up
                  onCancel(); // Executa a ação de logout
                }}
              >
                <Text className="text-white font-bold text-[16px]">Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default LogoutConfirm;