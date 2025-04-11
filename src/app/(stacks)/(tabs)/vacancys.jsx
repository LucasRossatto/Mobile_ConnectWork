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
import {
  Briefcase,
  Search,
  Building2,
  X,
  Clock,
  Pin,
  HandHelping,
  UserRound,
} from "lucide-react-native";
import { useQuery, useInfiniteQuery, useMutation } from "@tanstack/react-query";
import api from "@/services/api";

const VacanciesScreen = () => {
  const { user } = useContext(AuthContext);
  const [selectedWork, setSelectedWork] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [isCandidated, setIsCandidated] = useState(false);
  const [showFullBiography, setShowFullBiography] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString("pt-BR")} às ${date.toLocaleTimeString(
      "pt-BR",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    )}`;
  };

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

  // Mutation para candidatura
  const { mutate: applyCandidate } = useMutation({
    mutationFn: async () => {
      const response = await api.post(
        `/user/applycandidate/${user.id}`,
        {
          vacancyId: selectedWork.id,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      setIsCandidated(true);
    },
    onError: (error) => {
      console.error("Erro ao candidatar-se", error);
    },
  });

  // Mutation para remover candidatura
  const { mutate: removeApply } = useMutation({
    mutationFn: async () => {
      const response = await api.post(
        `/user/removeapply/${user.id}`,
        {
          vacancyId: selectedWork.id,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      setIsCandidated(false);
    },
    onError: (error) => {
      console.error("Erro ao remover candidatura", error);
    },
  });

  // Query para verificar candidatura
  const { refetch: checkCandidate } = useQuery({
    queryKey: ["checkCandidate", selectedWork?.id],
    queryFn: async () => {
      const response = await api.post(
        `/user/checkcandidate/${user.id}`,
        {
          vacancyId: selectedWork.id,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      return response.data;
    },
    enabled: false,
    onSuccess: (data) => {
      setIsCandidated(data.candidated);
    },
    onError: (error) => {
      console.error("Erro ao verificar candidatura", error);
    },
  });

  // Efeitos
  React.useEffect(() => {
    if (searchTerm.trim() !== "") {
      saveRecentSearch(searchTerm);
    }
  }, [searchTerm]);

  React.useEffect(() => {
    if (selectedWork) {
      checkCandidate();
    }
  }, [selectedWork]);

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
          source={{ uri: item.company?.profile_img }}
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

  const toggleBiography = () => {
    setShowFullBiography(!showFullBiography);
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

      {/* Work Details Modal - Adaptado do web */}
      {selectedWork && (
        <Modal
          visible={!!selectedWork}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedWork(null)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* Container principal */}
            <View
              style={{
                backgroundColor: "white",
                width: "90%",
                maxHeight: "90%",
                borderRadius: 20,
                padding: 20,
                paddingTop: 40,
              }}
            >
              {/* Botão de fechar */}
              <TouchableOpacity
                style={{ position: "absolute", top: 15, right: 15, zIndex: 10 }}
                onPress={() => setSelectedWork(null)}
              >
                <X size={24} color="#6b7280" />
              </TouchableOpacity>

              {/* Cabeçalho com logo */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: "#f3f4f6",
                    justifyContent: "center",
                    alignItems: "center",
                    overflow: "hidden",
                    marginRight: 15,
                  }}
                >
                  {selectedWork.company?.profile_img ? (
                    <Image
                      source={{ uri: selectedWork.company.profile_img }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Building2 size={40} color="#6b7280" />
                  )}
                </View>
                <Text style={{ fontSize: 20, color: "#374151" }}>
                  {selectedWork.company?.nome || "Empresa"}
                </Text>
              </View>

              {/* Título e data */}
              <Text
                style={{ fontSize: 22, fontWeight: "bold", marginBottom: 5 }}
              >
                {selectedWork.name}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <Clock size={14} color="#6b7280" />
                <Text style={{ fontSize: 12, color: "#6b7280", marginLeft: 5 }}>
                  {formatDate(selectedWork.createdAt)}
                </Text>
              </View>

              {/* Localização */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <Pin size={18} color="#6b7280" />
                <Text style={{ fontSize: 16, color: "#374151", marginLeft: 5 }}>
                  {selectedWork.location}
                </Text>
              </View>

              {/* Benefícios */}
              <View style={{ marginBottom: 30 }}>
                <View style={{ flexDirection: "row", marginBottom: 10 }}>
                  <HandHelping
                    size={20}
                    color="#6b7280"
                    style={{ marginRight: 10 }}
                  />
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", flex: 1 }}
                  >
                    {selectedWork.benefits?.split(",").map((benefit, index) => (
                      <View
                        key={index}
                        style={{
                          backgroundColor: "black",
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 6,
                          marginRight: 8,
                          marginBottom: 8,
                        }}
                      >
                        <Text style={{ color: "white", fontSize: 12 }}>
                          {benefit.trim()}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              {/* Sobre a empresa */}
              <Text
                style={{ fontSize: 18, fontWeight: "bold", marginBottom: 15 }}
              >
                Mais Sobre a Empresa
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 15,
                }}
              >
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: "#f3f4f6",
                    justifyContent: "center",
                    alignItems: "center",
                    overflow: "hidden",
                    marginRight: 10,
                  }}
                >
                  {selectedWork.company?.profile_img ? (
                    <Image
                      source={{ uri: selectedWork.company.profile_img }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Building2 size={24} color="#6b7280" />
                  )}
                </View>
                <View>
                  <Text style={{ fontWeight: "600", fontSize: 16 }}>
                    {selectedWork.company?.nome || "Empresa"}
                  </Text>
                  <Text style={{ color: "#6b7280" }}>
                    {selectedWork.company?.areaOfActivity ||
                      "Área de atuação não informada"}
                  </Text>
                </View>
              </View>

              {selectedWork.company?.biography && (
                <View style={{ marginBottom: 20 }}>
                  <Text
                    numberOfLines={showFullBiography ? undefined : 4}
                    style={{ color: "#374151", lineHeight: 22 }}
                  >
                    {selectedWork.company.biography}
                  </Text>
                  <TouchableOpacity onPress={toggleBiography}>
                    <Text
                      style={{
                        color: "black",
                        fontWeight: "500",
                        marginTop: 5,
                      }}
                    >
                      {showFullBiography ? "Ver menos..." : "Ver mais..."}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Botão de ação */}
              <TouchableOpacity
                style={{
                  backgroundColor: isCandidated ? "#ef4444" : "#000",
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: "center",
                  marginTop: 10,
                }}
                onPress={isCandidated ? removeApply : applyCandidate}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  {isCandidated ? "Remover Candidatura" : "Candidatar-se"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default VacanciesScreen;
