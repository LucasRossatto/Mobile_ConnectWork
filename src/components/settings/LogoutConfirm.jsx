import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { UserRound } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

const LogoutConfirm = () => {
  const [showPopup, setShowPopup] = useState(false);
  const { logout, user } = useAuth();

  const handleLogout = () => {
    setShowPopup(false);
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView 
      className="flex-1 bg-gray-50 px-4"
      keyboardShouldPersistTaps="handled"
    >
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

        {/* Botão de ação */}
        <Pressable
          className="bg-red-600 py-4 rounded-lg items-center justify-center"
          onPress={() => setShowPopup(true)}
          android_ripple={{ color: '#DC2626' }}
        >
          <Text className="text-white font-semibold text-base">
            Confirmar saída
          </Text>
        </Pressable>
      </View>

      {/* Modal de confirmação */}
      <Modal
        visible={showPopup}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPopup(false)}
      >
        <Pressable 
          className="flex-1 justify-center items-center bg-black/50 p-4"
          onPress={() => setShowPopup(false)}
        >
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
              <Pressable
                className="flex-1 border border-gray-300 py-3 rounded-lg items-center justify-center"
                onPress={() => setShowPopup(false)}
                android_ripple={{ color: '#E5E7EB' }}
              >
                <Text className="text-gray-800 font-medium">Cancelar</Text>
              </Pressable>
              <Pressable
                className="flex-1 bg-red-600 py-3 rounded-lg items-center justify-center"
                onPress={handleLogout}
                android_ripple={{ color: '#DC2626' }}
              >
                <Text className="text-white font-medium">Sair</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
};

export default LogoutConfirm;