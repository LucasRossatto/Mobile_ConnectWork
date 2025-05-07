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
  Alert,
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
} from "lucide-react-native";
import { useQuery, useInfiniteQuery, useMutation } from "@tanstack/react-query";
import api from "@/services/api";
import Ionicons from "react-native-vector-icons/Ionicons";

const VacanciesScreen = () => {
  const { user } = useContext(AuthContext);
  const [selectedWork, setSelectedWork] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [isCandidated, setIsCandidated] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

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

  // Rotas no estilo mobile
  const fetchAllVacancies = async () => {
    const response = await api.get("/company/vacancy", {
      headers: { Authorization: `Bearer ${user?.token}` }
    });
    return response.data;
  };

  const searchVacancies = async ({ pageParam = 0 }) => {
    const response = await api.post(
      "/user/searchvacancy",
      { keyword: searchTerm, offset: pageParam, limit: 10 },
      { headers: { Authorization: `Bearer ${user?.token}` } }
    );
    return {
      vacancies: response.data.vacancies,
      nextOffset: pageParam + 10,
      total: response.data.total
    };
  };

  // Queries
  const { 
    data: allVacanciesData,
    isLoading: isLoadingAllVacancies,
    refetch: refetchAllVacancies
  } = useQuery({
    queryKey: ["allVacancies"],
    queryFn: fetchAllVacancies,
    enabled: !!user?.token
  });

  const {
    data: searchResults,
    fetchNextPage,
    hasNextPage,
    isLoading: isSearching,
    refetch: refetchSearch
  } = useInfiniteQuery({
    queryKey: ["vacancySearch", searchTerm],
    queryFn: searchVacancies,
    getNextPageParam: (lastPage) => 
      lastPage.vacancies.length < 10 ? undefined : lastPage.nextOffset,
    enabled: searchTerm.trim() !== "" && !!user?.token,
    initialPageParam: 0
  });

  // Mutations
  const checkCandidateStatus = async (vacancyId) => {
    try {
      const response = await api.post(
        `/user/checkcandidate/${user.id}`,
        { vacancyId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setIsCandidated(response.data.candidated);
    } catch (error) {
      console.error("Erro ao verificar candidatura:", error);
    }
  };

  const applyForVacancy = async (vacancyId) => {
    try {
      setIsApplying(true);
      await api.post(
        `/user/applycandidate/${user.id}`,
        { vacancyId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setIsCandidated(true);
      setSelectedWork(null);
      setSuccessModalVisible(true);
    } catch (error) {
      Alert.alert(
        "Erro",
        error.response?.data?.error || "Falha ao se candidatar"
      );
    } finally {
      setIsApplying(false);
    }
  };

  const removeApplication = async (vacancyId) => {
    try {
      setIsApplying(true);
      await api.post(
        `/user/removeapply/${user.id}`,
        { vacancyId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setIsCandidated(false);
    } catch (error) {
      Alert.alert(
        "Erro",
        error.response?.data?.error || "Falha ao remover candidatura"
      );
    } finally {
      setIsApplying(false);
    }
  };

  const handleSelectWork = (work) => {
    setSelectedWork(work);
    checkCandidateStatus(work.id);
  };

  const handleApply = () => {
    if (!selectedWork) return;
    if (isCandidated) {
      removeApplication(selectedWork.id);
    } else {
      applyForVacancy(selectedWork.id);
    }
  };

  const displayedVacancies = searchTerm.trim() !== "" 
    ? searchResults?.pages.flatMap(page => page.vacancies) || []
    : allVacanciesData || [];

  // Render Items
  const renderWorkItem = ({ item }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 border-b border-gray-200 bg-white"
      onPress={() => handleSelectWork(item)}
    >
      {item.company?.profile_img ? (
        <Image
          source={{ uri: item.company.profile_img }}
          className="w-16 h-16 rounded-full mr-4"
        />
      ) : (
        <View className="w-16 h-16 rounded-full bg-gray-300 mr-4 justify-center items-center">
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

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-black p-4 flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Briefcase size={24} color="#f2f2f2" />
          <Text className="text-white font-bold text-lg ml-4">VAGAS</Text>
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
        onEndReached={() => {
          if (hasNextPage && !isSearching) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
      />

      {/* Work Details Modal */}
      {selectedWork && (
        <Modal
          visible={!!selectedWork}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedWork(null)}
        >
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
            <View style={{ backgroundColor: "white", width: "90%", maxHeight: "90%", borderRadius: 20, padding: 20, paddingTop: 40 }}>
              <TouchableOpacity
                style={{ position: "absolute", top: 15, right: 15, zIndex: 10 }}
                onPress={() => setSelectedWork(null)}
              >
                <X size={24} color="#6b7280" />
              </TouchableOpacity>

              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "#f3f4f6", justifyContent: "center", alignItems: "center", overflow: "hidden", marginRight: 15 }}>
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
                <Text style={{ fontSize: 20, color: "#374151" }}>{selectedWork.company?.nome || "Empresa"}</Text>
              </View>

              <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 5 }}>{selectedWork.name}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
                <Clock size={14} color="#6b7280" />
                <Text style={{ fontSize: 12, color: "#6b7280", marginLeft: 5 }}>{formatDate(selectedWork.createdAt)}</Text>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
                <Pin size={18} color="#6b7280" />
                <Text style={{ fontSize: 16, color: "#374151", marginLeft: 5 }}>{selectedWork.location}</Text>
              </View>

              <View style={{ marginBottom: 30 }}>
                <View style={{ flexDirection: "row", marginBottom: 10 }}>
                  <HandHelping size={20} color="#6b7280" style={{ marginRight: 10 }} />
                  <View style={{ flexDirection: "row", flexWrap: "wrap", flex: 1 }}>
                    {selectedWork.benefits?.split(",").map((benefit, index) => (
                      <View key={index} style={{ backgroundColor: "black", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginRight: 8, marginBottom: 8 }}>
                        <Text style={{ color: "white", fontSize: 12 }}>{benefit.trim()}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 15 }}>Mais Sobre a Empresa</Text>

              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 15 }}>
                <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: "#f3f4f6", justifyContent: "center", alignItems: "center", overflow: "hidden", marginRight: 10 }}>
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
                  <Text style={{ fontWeight: "600", fontSize: 16 }}>{selectedWork.company?.nome || "Empresa"}</Text>
                  <Text style={{ color: "#6b7280" }}>{selectedWork.company?.areaOfActivity || "Área de atuação não informada"}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={{
                  backgroundColor: isCandidated ? "#ef4444" : "#000",
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: "center",
                  marginTop: 10,
                }}
                onPress={handleApply}
                disabled={isApplying}
              >
                {isApplying ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    {isCandidated ? "Remover Candidatura" : "Candidatar-se"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Success Modal */}
      <Modal transparent={true} visible={successModalVisible} animationType="fade">
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View className="bg-white p-4 rounded-lg shadow-lg w-4/5">
            <View className="flex-row items-center mb-2">
              <Ionicons name="checkmark-circle" size={24} color="green" />
              <Text className="ml-2 text-lg font-bold text-green-700">Inscrição realizada!</Text>
            </View>
            <Text className="text-gray-700">
              Os recrutadores desta vaga receberam seu perfil. Fique atento ao seu e-mail!
            </Text>
            <TouchableOpacity 
              onPress={() => setSuccessModalVisible(false)} 
              className="mt-4 bg-black rounded-lg p-2"
            >
              <Text className="text-white text-center">OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default VacanciesScreen;