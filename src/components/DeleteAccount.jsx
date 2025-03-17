import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';

const DeleteAccount = ({ onCancel }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <>
      <View className="bg-white p-4 rounded-lg shadow-md">
        <Text className="text-[20px] font-bold mb-4">Excluir Conta</Text>

        {/* Informações do usuário */}
        <View className="flex-row items-center mb-4">
          <Image
            source={{ uri: 'https://via.placeholder.com/150' }}
            className="w-12 h-12 rounded-full mr-3"
          />
          <View>
            <Text className="text-[16px] font-medium">Nome do Usuário</Text>
            <Text className="text-[14px] text-gray-500">email@exemplo.com</Text>
          </View>
        </View>

        <Text className="text-[14px] text-gray-500 mb-4">
          Sua conta será permanentemente excluída. Tem certeza?
        </Text>

        {/* Botão para abrir o pop-up de confirmação */}
        <TouchableOpacity
          className="bg-black py-3 rounded-lg items-center"
          onPress={() => setShowPopup(true)}
        >
          <Text className="text-white font-bold">Deletar conta</Text>
        </TouchableOpacity>
      </View>

      {/* Pop-up de confirmação */}
      {showPopup && (
        <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-4 rounded-lg w-80">
            <Text className="text-[18px] font-bold mb-4">Confirmar exclusão?</Text>
            <Text className="text-[14px] text-gray-500 mb-4">
              Insira seu e-mail e senha para confirmar.
            </Text>

            {/* Campo: E-mail */}
            <TextInput
              placeholder="E-mail"
              value={email}
              onChangeText={setEmail}
              className="border border-gray-300 rounded-lg p-3 mb-3"
            />

            {/* Campo: Senha */}
            <TextInput
              placeholder="Senha"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              className="border border-gray-300 rounded-lg p-3 mb-4"
            />

            {/* Botões do pop-up */}
            <View className="flex-row justify-between">
              <TouchableOpacity
                className="py-3 px-6 rounded-lg border border-gray-300"
                onPress={() => setShowPopup(false)}
              >
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-black py-3 px-6 rounded-lg"
                onPress={() => setShowPopup(false)}
              >
                <Text className="text-white font-bold">Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </>
  );
};

export default DeleteAccount;