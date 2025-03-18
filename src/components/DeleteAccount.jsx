import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
} from "react-native";

const DeleteAccount = ({ onCancel }) => {
  const [showPopup, setShowPopup] = useState(false); // Controla a visibilidade do pop-up
  const [email, setEmail] = useState(""); // Estado para o e-mail
  const [password, setPassword] = useState(""); // Estado para a senha

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      className="p-4 bg-gray-100"
    >
      <Text className="text-[22px] font-bold mb-5">Deletar Conta</Text>

      <View className="bg-white rounded-lg p-4">
        {/* Informações do usuário */}
        <View className="flex-row items-center justify-center mb-4">
          <Image
            source={{ uri: "https://via.placeholder.com/150" }}
            className="w-12 h-12 rounded-full mr-3 bg-black"
          />
          <View>
            <Text className="text-[16px] font-medium">Nome do Usuário</Text>
            <Text className="text-[14px] text-gray-500">email@exemplo.com</Text>
          </View>
        </View>

        <Text className="text-[14px] text-gray-500 mb-4 text-center">
          Sua conta será permanentemente excluída. Tem certeza?
        </Text>

        {/* Botão para deletar conta */}
        <TouchableOpacity
          className="bg-black py-4 rounded-lg mt-2 items-center"
          onPress={() => setShowPopup(true)} // Abre o pop-up
        >
          <Text className="text-white font-bold text-[17px]">
            Deletar conta
          </Text>
        </TouchableOpacity>
      </View>

      {/* Pop-up de confirmação */}
      <Modal
        visible={showPopup}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPopup(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          {" "}
          {/* Fundo escurecido */}
          <View className="bg-white rounded-lg p-6 w-11/12">
            {" "}
            {/* Área branca do pop-up */}
            <Text className="text-[20px] font-bold mb-4 text-center text-red-600">
              Confirmar exclusão?
            </Text>
            <Text className="text-[14px] text-gray-500 mb-4 text-center">
              Insira seu e-mail e senha para confirmar.
            </Text>
            {/* Campo de e-mail */}
            <View className="mb-4">
              <TextInput
                placeholder="E-mail"
                value={email}
                onChangeText={setEmail}
                className="border border-gray-300 rounded-lg p-2 h-12"
              />
            </View>
            {/* Campo de senha */}
            <View className="mb-6">
              <TextInput
                placeholder="Senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true} // Oculta a senha
                className="border border-gray-300 rounded-lg p-2 h-12"
              />
            </View>
            {/* Botões de confirmação e cancelamento */}
            <View className="flex-row justify-between">
              <TouchableOpacity
                className="border-gray-500 border-2 py-3 px-6 rounded-lg"
                onPress={() => setShowPopup(false)} // Fecha o pop-up
              >
                <Text className="text-black text-[16px]">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-black py-3 px-6 rounded-lg"
                onPress={() => {
                  // Lógica para confirmar a exclusão
                  console.log("E-mail:", email);
                  console.log("Senha:", password);
                  setShowPopup(false); // Fecha o pop-up após a confirmação
                }}
              >
                <Text className="text-white text-[16px]">
                  Confirmar exclusão
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default DeleteAccount;
