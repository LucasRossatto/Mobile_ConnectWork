import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const SettingsSenha = () => {
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordPass, setPasswordPass] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4 bg-gray-100">
      <Text className="text-[20px] font-bold mb-4">Altere sua senha:</Text>

      {/* Campo: Senha Atual */}
      <View className="mb-4">
        <Text className="text-[14px] font-medium mb-2">Senha atual *</Text>
        <TextInput
          secureTextEntry={!showPasswords}
          value={passwordPass}
          onChangeText={setPasswordPass}
          className="border border-gray-300 rounded-lg p-3"
        />
      </View>

      {/* Campo: Nova Senha */}
      <View className="mb-4">
        <Text className="text-[14px] font-medium mb-2">Nova senha *</Text>
        <TextInput
          secureTextEntry={!showPasswords}
          value={newPassword}
          onChangeText={setNewPassword}
          className="border border-gray-300 rounded-lg p-3"
        />
      </View>

      {/* Campo: Confirmar Nova Senha */}
      <View className="mb-4">
        <Text className="text-[14px] font-medium mb-2">Confirme a nova senha *</Text>
        <TextInput
          secureTextEntry={!showPasswords}
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
          className="border border-gray-300 rounded-lg p-3"
        />
      </View>

      {/* Botão para mostrar/ocultar senhas */}
      <TouchableOpacity
        className="flex-row items-center mb-4"
        onPress={() => setShowPasswords(!showPasswords)}
      >
        <Icon name={showPasswords ? 'eye-off' : 'eye'} size={20} color="#000" />
        <Text className="ml-2">{showPasswords ? 'Ocultar senhas' : 'Mostrar senhas'}</Text>
      </TouchableOpacity>

      {/* Botão para salvar */}
      <TouchableOpacity
        className="bg-black py-3 rounded-lg mx-4 items-center"
      >
        <Text className="text-white font-bold">Alterar senha</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SettingsSenha;