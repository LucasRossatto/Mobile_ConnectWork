import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import SettingsSenha from './SettingsSenha';
import DeleteAccount from './DeleteAccount';
import LogoutConfirm from './LogoutModal';

const Settings = () => {
  const [currentComponent, setCurrentComponent] = useState('senha');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Conteúdo principal */}
      <ScrollView style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
        {/* Menu de Configurações */}
        <View style={{ backgroundColor: 'white', padding: 16 }}>
          {/* Botão Alterar Senha */}
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}
            onPress={() => setCurrentComponent('senha')}
          >
            <Icon name="lock" size={20} color="#000" />
            <Text style={{ fontSize: 16, color: '#1f2937', marginLeft: 12 }}>Alterar Senha</Text>
          </TouchableOpacity>

          {/* Botão Sair da Conta */}
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}
            onPress={() => setCurrentComponent('logout')}
          >
            <Icon name="log-out" size={20} color="#000" />
            <Text style={{ fontSize: 16, color: '#1f2937', marginLeft: 12 }}>Sair da Conta</Text>
          </TouchableOpacity>

          {/* Botão Excluir Conta */}
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}
            onPress={() => setCurrentComponent('delete')}
          >
            <Icon name="trash-2" size={20} color="#000" />
            <Text style={{ fontSize: 16, color: '#1f2937', marginLeft: 12 }}>Excluir Conta</Text>
          </TouchableOpacity>
        </View>

        {/* Área de Configurações Principais */}
        <View style={{ padding: 16 }}>
          {currentComponent === 'senha' && <SettingsSenha />}
          {currentComponent === 'logout' && <LogoutConfirm onCancel={() => setCurrentComponent('senha')} />}
          {currentComponent === 'delete' && <DeleteAccount onCancel={() => setCurrentComponent('senha')} />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;