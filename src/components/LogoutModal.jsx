import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

const LogoutConfirm = ({ onCancel }) => {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Sair da Conta</Text>

        {/* Informações do usuário */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Image
            source={{ uri: 'https://via.placeholder.com/150' }}
            style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }}
          />
          <View>
            <Text style={{ fontSize: 16, fontWeight: '500' }}>Nome do Usuário</Text>
            <Text style={{ fontSize: 14, color: '#6b7280' }}>email@exemplo.com</Text>
          </View>
        </View>

        {/* Botão para abrir o pop-up de confirmação */}
        <TouchableOpacity
          style={{ backgroundColor: 'black', padding: 12, borderRadius: 8, alignItems: 'center' }}
          onPress={() => setShowPopup(true)}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Pop-up de confirmação */}
      {showPopup && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 12, width: '80%' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Confirmar saída</Text>
            <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>
              Você realmente deseja sair da conta?
            </Text>

            {/* Botões do pop-up */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                style={{ padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db' }}
                onPress={() => setShowPopup(false)}
              >
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ backgroundColor: 'black', padding: 12, borderRadius: 8 }}
                onPress={() => setShowPopup(false)}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </>
  );
};

export default LogoutConfirm;