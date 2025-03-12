import React, { useState } from "react";
import { View, Text, FlatList, Modal, TouchableOpacity } from "react-native";
import IconOcticons from "react-native-vector-icons/Octicons";
import VagaItem from "../../../components/VagaItem"; // Importe o componente VagaItem
import VagaDetalhes from "../../../components/VagaDetalhes"; // Importe o componente VagaDetalhes

// Dados fictícios de vagas
const vagas = [
  {
    id: "1",
    titulo: "Desenvolvedor Front-end",
    empresa: "Tech Solutions",
    local: "Remoto",
    logo: "https://www.libbs.com.br/guia-da-marca/wp-content/uploads/2023/06/libbs-compartilhamento.png",
    descricao:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
  },
  {
    id: "2",
    titulo: "Desenvolvedor Back-end",
    empresa: "InovaTech",
    local: "São Paulo, SP",
    logo: "https://www.libbs.com.br/guia-da-marca/wp-content/uploads/2023/06/libbs-compartilhamento.png",
    descricao:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
  },
  // Adicione mais vagas conforme necessário
];

const Vacancys = () => {
  const [vagaSelecionada, setVagaSelecionada] = useState(null); // Estado para armazenar a vaga selecionada
  const [modalVisivel, setModalVisivel] = useState(false); // Estado para controlar a visibilidade do modal

  const abrirDetalhes = (id) => {
    const vaga = vagas.find((v) => v.id === id); // Encontra a vaga pelo ID
    setVagaSelecionada(vaga); // Define a vaga selecionada
    setModalVisivel(true); // Abre o modal
  };

  const fecharDetalhes = () => {
    setModalVisivel(false); // Fecha o modal
  };

  return (
    <View className="flex-1 bg-gray-100 w-full">
      {/* Cabeçalho preto com ícone e texto "Vagas" */}
      <View className="bg-black p-4">
        <View className="flex-row items-center ml-6">
          <IconOcticons name="briefcase" size={24} color="#F2F2F2" />
          <Text className="text-lg font-bold text-white ml-6">VAGAS</Text>
        </View>
      </View>

      {/* Frase "Boa sorte nas suas candidaturas!" */}
      <View className="bg-gray-100 p-4 border-b border-gray-300">
        <Text className="text-lg font-bold text-gray-600 text-center">
          Boa sorte nas suas candidaturas!
        </Text>
      </View>

      {/* Lista de vagas */}
      <FlatList
        data={vagas}
        renderItem={({ item }) => (
          <VagaItem
            id={item.id}
            titulo={item.titulo}
            empresa={item.empresa}
            local={item.local}
            logo={item.logo}
            onPress={abrirDetalhes} // Passa a função onPress corretamente
          />
        )}
        keyExtractor={(item) => item.id}
      />

      {/* Modal para exibir os detalhes da vaga */}
      <Modal
        visible={modalVisivel}
        animationType="slide"
        onRequestClose={fecharDetalhes}
      >
        <VagaDetalhes vaga={vagaSelecionada} />
      </Modal>
    </View>
  );
};

export default Vacancys;