import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import { Modal, TouchableOpacity, View, Text, FlatList } from "react-native";
import { TextInput } from "react-native";

const ModalSearch = ({ visible, onClose }) => {
  const [recentSearches, setRecentSearches] = useState([
    { id: 1, text: "Desenvolvedor FullStack" },
    { id: 2, text: "Operador Logístico" },
    { id: 3, text: "Auxiliar de Administração" },
  ]);
  const renderSearchItem = useCallback(
    ({ item }) => (
      <View className="flex-row justify-between items-center py-3 px-4">
        <Text className="text-base text-gray-800 flex-1">{item.text}</Text>
        <TouchableOpacity
          onPress={() => removeSearchItem(item.id)}
          className="p-2"
        >
          <Ionicons name="close" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    ),
    []
  );
  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white z-20">
        <View className="bg-white p-4 flex-row items-center border-b border-gray-200">
          <TouchableOpacity
            onRequestClose={onClose}
            className="flex-row items-center"
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>

          <View className="flex-1 mx-2">
            <TextInput
              className="bg-gray-100 rounded-full px-4 py-2 text-black"
              placeholder="Pesquisar vagas"
              placeholderTextColor="#9CA3AF"
              autoFocus={true}
            />
          </View>

          <TouchableOpacity>
            <MaterialIcons name="filter-list" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <View className="p-4">
          <Text className="text-lg font-bold mb-4 text-gray-800">
            Pesquisas recentes
          </Text>

          <FlatList
            data={recentSearches}
            renderItem={renderSearchItem}
            keyExtractor={(item) => item.id.toString()}
            ItemSeparatorComponent={() => (
              <View className="h-px bg-gray-200 mx-4" />
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

export default React.memo(ModalSearch);
