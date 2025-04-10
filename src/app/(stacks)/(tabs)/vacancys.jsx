import React, { useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  Modal,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { AuthContext } from "@/contexts/AuthContext";
import { Briefcase, Search, Building2 } from "lucide-react-native";
import { useQuery, useInfiniteQuery, useMutation } from "@tanstack/react-query";
import api from "@/services/api";

const VacanciesScreen = () => {
  const { user } = useContext(AuthContext);
  const [selectedWork, setSelectedWork] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);

  // Query para buscar todas as vagas
  const {
    data: allVacanciesData,
    isLoading: isLoadingAllVacancies,
    error: allVacanciesError,
    refetch: refetchAllVacancies,
  } = useQuery({
    queryKey: ["allVacancies"],
    queryFn: async () => {
      const response = await api.get("/company/vacancy", {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      return response.data;
    },
    enabled: !!user?.token,
  });

  // Infinite query para busca paginada
  const {
    data: searchResults,
    fetchNextPage: fetchMoreSearchResults,
    hasNextPage: hasMoreSearchResults,
    isLoading: isSearching,
    error: searchError,
    refetch: refetchSearch,
  } = useInfiniteQuery({
    queryKey: ["vacancySearch", searchTerm],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await api.post(
        "/user/searchvacancy",
        { keyword: searchTerm, offset: pageParam, limit: 10 },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      return {
        vacancies: response.data.vacancies,
        nextOffset: pageParam + 10,
        total: response.data.total,
      };
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.vacancies.length < 10) return undefined;
      return lastPage.nextOffset;
    },
    enabled: searchTerm.trim() !== "" && !!user?.token,
    initialPageParam: 0,
  });

  // Mutation para salvar pesquisas recentes
  const { mutate: saveRecentSearch } = useMutation({
    mutationFn: (searchTerm) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(searchTerm);
        }, 300);
      });
    },
    onSuccess: (searchTerm) => {
      setRecentSearches((prev) => [
        { id: Date.now(), term: searchTerm },
        ...prev.slice(0, 4),
      ]);
    },
  });

  // Efeito para salvar pesquisa quando termo muda
  React.useEffect(() => {
    if (searchTerm.trim() !== "") {
      saveRecentSearch(searchTerm);
    }
  }, [searchTerm]);

  // Dados para exibição
  const displayedVacancies =
    searchTerm.trim() !== ""
      ? searchResults?.pages.flatMap((page) => page.vacancies) || []
      : allVacanciesData || [];

  const renderWorkItem = ({ item }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 border-b border-gray-200 bg-white"
      onPress={() => setSelectedWork(item)}
    >
      {item.company?.profile_img ? (
        <Image
          source={{ uri: item.company.profile_img }}
          className="w-16 h-16 rounded-full mr-4"
        />
      ) : (
        <View className="w-16 h-16 rounded-full bg-gray-300 mr-4 flex items-center justify-center">
          <Building2 size={24} color="#6b7280" />
        </View>
      )}
      <View className="flex-1">
        <Text className="text-lg font-bold text-gray-800">{item.name}</Text>
        <Text className="text-sm text-gray-600">{item.company?.nome}</Text>
        <Text className="text-sm text-gray-600">{item.location}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => {
    if (isLoadingAllVacancies || isSearching) {
      return (
        <View className="flex-1 justify-center items-center py-8">
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    }
    return (
      <View className="flex-1 justify-center items-center py-8">
        <Text className="text-lg text-gray-500">
          {searchTerm.trim() !== ""
            ? "Nenhuma vaga encontrada para sua pesquisa"
            : "Nenhuma vaga disponível no momento"}
        </Text>
      </View>
    );
  };

  const handleLoadMore = () => {
    if (hasMoreSearchResults && !isSearching) {
      fetchMoreSearchResults();
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-black p-4">
        <View className="flex-row items-center">
          <Briefcase size={24} color="#f2f2f2" />
          <Text className="text-lg font-bold text-white ml-4">VAGAS</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View className="p-4 bg-white">
        <View className="flex-row items-center bg-gray-200 rounded-full px-4 py-2">
          <Search size={20} color="#6b7280" />
          <TextInput
            className="flex-1 ml-2 text-gray-800"
            placeholder="Pesquisar vagas..."
            placeholderTextColor="#9CA3AF"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
      </View>

      {/* Boa sorte message */}
      <View className="bg-gray-100 p-4 border-b border-gray-300">
        <Text className="text-lg font-bold text-gray-600 text-center">
          Boa sorte nas suas candidaturas!
        </Text>
      </View>

      {/* Vagas List */}
      <FlatList
        data={displayedVacancies}
        renderItem={renderWorkItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={{ flexGrow: 1 }}
        onEndReached={searchTerm.trim() !== "" ? handleLoadMore : null}
        onEndReachedThreshold={0.5}
      />

      {/* Work Details Modal */}
      <Modal
        visible={!!selectedWork}
        animationType="slide"
        onRequestClose={() => setSelectedWork(null)}
      >
        {selectedWork && (
          <View className="flex-1 bg-white p-4">
            <View className="flex-row justify-between items-center mb-4">
              <TouchableOpacity onPress={() => setSelectedWork(null)}>
                <Text className="text-blue-500 text-lg">Voltar</Text>
              </TouchableOpacity>
              <Text className="text-lg font-bold">Detalhes da Vaga</Text>
              <View className="w-8" />
            </View>

            <View className="flex-row items-center mb-6">
              {selectedWork.company?.profile_img ? (
                <Image
                  source={{ uri: selectedWork.company.profile_img }}
                  className="w-20 h-20 rounded-full mr-4"
                />
              ) : (
                <View className="w-20 h-20 rounded-full bg-gray-300 mr-4 flex items-center justify-center">
                  <Building2 size={32} color="#6b7280" />
                </View>
              )}
              <View>
                <Text className="text-xl font-bold">{selectedWork.name}</Text>
                <Text className="text-lg text-gray-600">
                  {selectedWork.company?.nome}
                </Text>
                <Text className="text-gray-500">{selectedWork.location}</Text>
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-lg font-bold mb-2">Descrição</Text>
              <Text className="text-gray-700">{selectedWork.description}</Text>
            </View>

            <View className="mb-6">
              <Text className="text-lg font-bold mb-2">Requisitos</Text>
              <Text className="text-gray-700">{selectedWork.requirements}</Text>
            </View>

            <TouchableOpacity
              className="bg-blue-500 rounded-full p-4 items-center"
              onPress={() => {
                // Lógica para candidatura
              }}
            >
              <Text className="text-white font-bold">Candidatar-se</Text>
            </TouchableOpacity>
          </View>
        )}
      </Modal>
    </View>
  );
};

export default VacanciesScreen;
