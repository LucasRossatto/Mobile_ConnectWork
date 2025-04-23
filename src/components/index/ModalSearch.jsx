import React, { useState } from "react";
import { View, TouchableOpacity, Text, TextInput } from "react-native";
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
      console.log("Realizando busca por:", searchText);
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

  if (!visible) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "white",
        zIndex: 30,
        elevation: 30,
        padding: 16,
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}
      >
        <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
          <CloseIcon size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: "bold", marginLeft: 16 }}>
          Pesquisar
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#F3F4F6",
          borderRadius: 8,
          paddingHorizontal: 16,
          paddingVertical: 8,
          marginBottom: 24,
        }}
      >
        <SearchIcon size={20} color="#6B7280" />
        <TextInput
          style={{ flex: 1, marginLeft: 12, fontSize: 16 }}
          placeholder="Pesquisar vagas, empresas, habilidades..."
          placeholderTextColor="#9CA3AF"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          autoFocus={true}
        />
        {searchText ? (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <CloseIcon size={20} color="#6B7280" />
          </TouchableOpacity>
        ) : null}
      </View>

      {searchText ? (
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#6B7280", marginBottom: 16 }}>
            Resultados para: "{searchText}"
          </Text>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text style={{ color: "#9CA3AF" }}>
              Nenhum resultado encontrado
            </Text>
          </View>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 16 }}>
            Últimas pesquisas
          </Text>

          {recentSearches.map((search, index) => (
            <TouchableOpacity
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: "#F3F4F6",
              }}
              onPress={() => setSearchText(search)}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <ClockIcon size={18} color="#6B7280" />
                <Text style={{ marginLeft: 12, color: "#374151" }}>
                  {search}
                </Text>
              </View>
              <TouchableOpacity onPress={() => removeRecentSearch(index)}>
                <CloseIcon size={18} color="#6B7280" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          {recentSearches.length > 0 && (
            <TouchableOpacity
              style={{
                marginTop: 16,
                flexDirection: "row",
                alignItems: "center",
              }}
              onPress={clearSearchHistory}
            >
              <Text style={{ color: "#3B82F6", fontWeight: "bold" }}>
                Limpar histórico
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default ModalSearch;
