import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import SettingsSenha from "../settings/SettingsSenha";
import DeleteAccount from "../settings/DeleteAccount";
import LogoutConfirm from "../settings/LogoutModal";

const Settings = () => {
  const [currentComponent, setCurrentComponent] = useState(null);

  const renderComponent = () => {
    switch (currentComponent) {
      case "senha":
        return <SettingsSenha onClose={() => setCurrentComponent(null)} />;
      case "delete":
        return <DeleteAccount onCancel={() => setCurrentComponent(null)} />;
      case "logout":
        return <LogoutConfirm onCancel={() => setCurrentComponent(null)} />;
      default:
        return (
          <ScrollView className="flex-1 bg-gray-100">
            <View className="bg-white p-4">
              <TouchableOpacity
                className="flex-row items-center py-3 border-b border-gray-200"
                onPress={() => setCurrentComponent("senha")}
              >
                <Icon name="lock" size={30} color="#000" />
                <Text className="text-[20px] ml-3 text-gray-800">
                  Alterar Senha
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center py-3 border-b border-gray-200"
                onPress={() => setCurrentComponent("delete")}
              >
                <Icon name="trash-2" size={30} color="#000" />
                <Text className="text-[20px] ml-3 text-gray-800">
                  Deletar Conta
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center py-3"
                onPress={() => setCurrentComponent("logout")}
              >
                <Icon name="log-out" size={30} color="#000" />
                <Text className="text-[20px] ml-3 text-gray-800">
                  Sair da Conta
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">{renderComponent()}</SafeAreaView>
  );
};

export default Settings;
