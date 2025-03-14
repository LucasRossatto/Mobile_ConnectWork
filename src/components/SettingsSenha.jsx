import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const SettingsSenha = () => {
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordPass, setPasswordPass] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  return (
    <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Altere sua senha:</Text>

      {/* Campo: Senha Atual */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8 }}>Senha atual *</Text>
        <TextInput
          secureTextEntry={!showPasswords}
          value={passwordPass}
          onChangeText={setPasswordPass}
          style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12 }}
        />
      </View>

      {/* Campo: Nova Senha */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8 }}>Nova senha *</Text>
        <TextInput
          secureTextEntry={!showPasswords}
          value={newPassword}
          onChangeText={setNewPassword}
          style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12 }}
        />
      </View>

      {/* Campo: Confirmar Nova Senha */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8 }}>Confirme a nova senha *</Text>
        <TextInput
          secureTextEntry={!showPasswords}
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
          style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12 }}
        />
      </View>

      {/* Botão para mostrar/ocultar senhas */}
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
        onPress={() => setShowPasswords(!showPasswords)}
      >
        <Icon name={showPasswords ? 'eye-off' : 'eye'} size={20} color="#000" />
        <Text style={{ marginLeft: 8 }}>{showPasswords ? 'Ocultar senhas' : 'Mostrar senhas'}</Text>
      </TouchableOpacity>

      {/* Botão para salvar */}
      <TouchableOpacity
        style={{ backgroundColor: 'black', padding: 12, borderRadius: 8, alignItems: 'center' }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Alterar senha</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SettingsSenha;