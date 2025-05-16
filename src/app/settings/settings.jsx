import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import ChangePassword from "@/components/settings/ChangePassword"; // Corrigido
import DeleteAccount from "@/components/settings/DeleteAccount"; // Corrigido
import LogoutConfirm from "@/components/settings/LogoutConfirm"; // Corrigido

const Settings = () => {
  const [currentComponent, setCurrentComponent] = useState(null);

  const renderComponent = () => {
    switch (currentComponent) {
      case "password":
        return <ChangePassword onClose={() => setCurrentComponent(null)} />;
      case "delete":
        return <DeleteAccount onCancel={() => setCurrentComponent(null)} />;
      case "logout":
        return <LogoutConfirm onCancel={() => setCurrentComponent(null)} />;
      default:
        return (
          <ScrollView className="flex-1 bg-gray-50 px-4">
            {/* Cabeçalho */}
            <Text className="text-2xl font-bold text-gray-900 mt-6 mb-8">
              Configurações
            </Text>
            
            {/* Seção Conta */}
            <View className="bg-white rounded-xl shadow-sm mb-6">
              <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 pt-4 pb-2">
                Conta
              </Text>
              
              <TouchableOpacity
                className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100"
                onPress={() => setCurrentComponent("password")} // Corrigido
              >
                <View className="flex-row items-center">
                  <Icon name="lock" size={22} className="text-gray-600" />
                  <Text className="text-lg text-gray-800 ml-3">
                    Alterar senha
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} className="text-gray-400" />
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center justify-between px-4 py-4"
                onPress={() => setCurrentComponent("delete")}
              >
                <View className="flex-row items-center">
                  <Icon name="trash-2" size={22} className="text-gray-600" />
                  <Text className="text-lg text-gray-800 ml-3">
                    Deletar conta
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} className="text-gray-400" />
              </TouchableOpacity>
            </View>

            {/* Seção Sessão */}
            <View className="bg-white rounded-xl shadow-sm">
              <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 pt-4 pb-2">
                Sessão
              </Text>
              
              <TouchableOpacity
                className="flex-row items-center justify-between px-4 py-4"
                onPress={() => setCurrentComponent("logout")}
              >
                <View className="flex-row items-center">
                  <Icon name="log-out" size={22} className="text-red-500" />
                  <Text className="text-lg text-red-500 ml-3">
                    Sair da conta
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} className="text-gray-400" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {renderComponent()}
    </SafeAreaView>
  );
};

export default Settings;