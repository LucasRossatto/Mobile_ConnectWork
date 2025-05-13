import { useState } from "react";
import { View, TouchableOpacity, Text, TextInput, Modal } from "react-native";
import log from "@/utils/logger";
import {
  Search as SearchIcon,
  X as CloseIcon,
  Clock as ClockIcon,
} from "lucide-react-native";

const ModalSearch = ({ visible, onClose }) => {
  const [searchText, setSearchText] = useState("");
  const [recentSearches, setRecentSearches] = useState([
    "Desenvolvedor Front-end Junior",
    "Estágio em Marketing Digital",
    "Analista de Dados Pleno",
    "Designer UI/UX Sênior",
  ]);

  const handleSearch = () => {
    if (searchText.trim()) {
      setRecentSearches((previousSearches) => [
        searchText,
        ...previousSearches
          .filter((item) => item.toLowerCase() !== searchText.toLowerCase())
          .slice(0, 3),
      ]);
      log.info("Realizando busca por:", searchText);
    }
  };

  const removeRecentSearch = (indexToRemove) => {
    setRecentSearches((previousSearches) =>
      previousSearches.filter((_, index) => index !== indexToRemove)
    );
  };

  const clearSearchHistory = () => {
    setRecentSearches([]);
  };

  return (
    <Modal
      animationType="slide"
      visible={visible}
      transparent={false}
      onRequestClose={onClose}
    >
      <View className="flex-1 p-4 bg-white">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity 
            onPress={onClose}
            className="p-2 mr-4"
            hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
          >
            <CloseIcon size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-bold">Pesquisar</Text>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-lg px-4 py-2 mb-6">
          <SearchIcon size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-3 text-base"
            placeholder="Pesquisar vagas, empresas, habilidades..."
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            autoFocus={true}
          />
          {searchText && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <CloseIcon size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        {searchText ? (
          <View className="flex-1">
            <Text className="text-gray-500 mb-4">Resultados para: {searchText}</Text>
            <View className="flex-1 justify-center items-center">
              <Text className="text-gray-400">Nenhum resultado encontrado</Text>
            </View>
          </View>
        ) : (
          <View className="flex-1">
            <Text className="font-bold text-lg mb-4">Últimas pesquisas</Text>

            {recentSearches.map((search, index) => (
              <TouchableOpacity
                key={index}
                className="flex-row items-center justify-between py-3 border-b border-gray-100"
                onPress={() => setSearchText(search)}
              >
                <View className="flex-row items-center">
                  <ClockIcon size={18} color="#6B7280" />
                  <Text className="ml-3 text-gray-700">{search}</Text>
                </View>
                <TouchableOpacity onPress={() => removeRecentSearch(index)}>
                  <CloseIcon size={18} color="#6B7280" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}

            {recentSearches.length > 0 && (
              <TouchableOpacity
                className="mt-4 flex-row items-center"
                onPress={clearSearchHistory}
              >
                <Text className="text-blue-500 font-bold">Limpar histórico</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
};

export default ModalSearch;