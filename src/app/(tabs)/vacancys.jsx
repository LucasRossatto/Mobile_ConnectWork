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
import { useAuth } from "@/contexts/AuthContext";
import {
  Briefcase,
  Search,
  Building2,
  X,
  Clock,
  Pin,
  HandHelping,
  UserCheck,
} from "lucide-react-native";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import api from "@/services/api";
import Ionicons from "react-native-vector-icons/Ionicons";

const VacanciesScreen = () => {
  const { user } = useAuth();
  const [selectedWork, setSelectedWork] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [isCandidated, setIsCandidated] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [activeTab, setActiveTab] = useState("todas");

  const formatDate = (dateString) => {
    if (!dateString) return "Data não disponível";
    const date = new Date(dateString);
    return `${date.toLocaleDateString("pt-BR")} às ${date.toLocaleTimeString(
      "pt-BR",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    )}`;
  };

  const fetchAllVacancies = async () => {
    const response = await api.get("/company/vacancy", {
      headers: { Authorization: `Bearer ${user?.token}` },
    });
    return response.data || [];
  };

  const fetchAppliedVacancies = async () => {
    try {
      const response = await api.get(`/user/appliedvacancies/${user.id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      return response.data?.vacancies || [];
    } catch (error) {
      console.error("Error fetching applied vacancies:", error);
      return [];
    }
  };

  const searchVacancies = async ({ pageParam = 0 }) => {
    const response = await api.post(
      "/user/searchvacancy",
      { keyword: searchTerm, offset: pageParam, limit: 10 },
      { headers: { Authorization: `Bearer ${user?.token}` } }
    );
    return {
      vacancies: response.data?.vacancies || [],
      nextOffset: pageParam + 10,
      total: response.data?.total || 0,
    };
  };

  const {
    data: allVacanciesData,
    isLoading: isLoadingAllVacancies,
    refetch: refetchAllVacancies,
  } = useQuery({
    queryKey: ["allVacancies"],
    queryFn: fetchAllVacancies,
    enabled: !!user?.token && activeTab === "todas",
  });

  const {
    data: appliedVacanciesData,
    isLoading: isLoadingAppliedVacancies,
    refetch: refetchAppliedVacancies,
  } = useQuery({
    queryKey: ["appliedVacancies"],
    queryFn: fetchAppliedVacancies,
    enabled: !!user?.token && activeTab === "candidatadas",
  });

  const {
    data: searchResults,
    fetchNextPage,
    hasNextPage,
    isLoading: isSearching,
    refetch: refetchSearch,
  } = useInfiniteQuery({
    queryKey: ["vacancySearch", searchTerm],
    queryFn: searchVacancies,
    getNextPageParam: (lastPage) =>
      lastPage.vacancies.length < 10 ? undefined : lastPage.nextOffset,
    enabled: searchTerm.trim() !== "" && !!user?.token && activeTab === "todas",
    initialPageParam: 0,
  });

  const checkCandidateStatus = async (vacancyId) => {
    try {
      const response = await api.post(
        `/user/checkcandidate/${user.id}`,
        { vacancyId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setIsCandidated(response.data?.candidated || false);
    } catch (error) {
      console.error("Erro ao verificar candidatura:", error);
      setIsCandidated(false);
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
      refetchAppliedVacancies();
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
      refetchAppliedVacancies();
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
    if (!work) return;
    setSelectedWork(work);
    if (activeTab === "todas") {
      checkCandidateStatus(work.id);
    }
  };

  const handleApply = () => {
    if (!selectedWork) return;
    if (isCandidated) {
      removeApplication(selectedWork.id);
    } else {
      applyForVacancy(selectedWork.id);
    }
  };

  const displayedVacancies = () => {
    if (activeTab === "candidatadas") {
      return (appliedVacanciesData || []).map(item => ({
        ...item.vacancy,
        status: item.status,
        applicationDate: item.createdAt,
        // Garante que todos os dados da empresa sejam passados
        company: {
          ...item.vacancy.company,
          nome: item.vacancy.company?.nome,
          profile_img: item.vacancy.company?.profile_img,
          areaOfActivity: item.vacancy.company?.areaOfActivity
        }
      }));
    }
  
    if (searchTerm.trim() !== "") {
      return (
        searchResults?.pages.flatMap((page) => page.vacancies || []) || []
      ).filter(Boolean);
    }
  
    return (allVacanciesData || []).filter(Boolean);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case "approved":
        return "Aprovado";
      case "pending":
        return "Pendente";
      default:
        return status || "Indefinido";
    }
  };

  const renderWorkItem = ({ item, index }) => {
    if (!item) return null;

    const status = activeTab === "candidatadas" ? item.status : null;

    return (
      <TouchableOpacity
        className="flex-row items-center p-4 border-b border-gray-200 bg-white"
        onPress={() => handleSelectWork(item)}
      >
        {item.company?.profile_img ? (
          <Image
            source={{ uri: item.company.profile_img }}
            className="w-12 h-12 rounded-full mr-4"
          />
        ) : (
          <View className="w-12 h-12 rounded-full bg-gray-200 mr-4 justify-center items-center">
            <Building2 size={24} color="#6b7280" />
          </View>
        )}
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-800">{item.name}</Text>
          <Text className="text-sm text-gray-600">
            {item.company?.nome || "Empresa não informada"}
          </Text>
          <Text className="text-sm text-gray-500">
            {item.location || "Local não informado"}
          </Text>
          {status && (
            <View
              className={`px-2 py-1 rounded-full self-start mt-1 ${getStatusStyle(
                status
              )}`}
            >
              <Text className="text-xs font-medium">
                {translateStatus(status)}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => {
    if (
      (isLoadingAllVacancies && activeTab === "todas") ||
      (isLoadingAppliedVacancies && activeTab === "candidatadas") ||
      isSearching
    ) {
      return (
        <View className="flex-1 justify-center items-center py-8">
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    }
    return (
      <View className="flex-1 justify-center items-center py-8">
        <Text className="text-lg text-gray-500">
          {searchTerm.trim() !== "" && activeTab === "todas"
            ? "Nenhuma vaga encontrada para sua pesquisa"
            : activeTab === "todas"
            ? "Nenhuma vaga disponível no momento"
            : "Nenhuma vaga candidatada"}
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
          <Text className="text-white font-bold text-lg ml-2">VAGAS</Text>
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
            editable={activeTab === "todas"}
          />
        </View>
      </View>

      {/* Tabs */}
      <View className="bg-white p-2 border-b border-gray-200 flex-row">
        <TouchableOpacity
          className={`flex-1 flex-row items-center justify-center p-3 rounded-lg mx-1 ${
            activeTab === "todas" ? "bg-black" : "bg-gray-100"
          }`}
          onPress={() => setActiveTab("todas")}
        >
          <Briefcase
            size={20}
            color={activeTab === "todas" ? "white" : "black"}
          />
          <Text
            className={`ml-2 font-medium ${
              activeTab === "todas" ? "text-white" : "text-black"
            }`}
          >
            Todas as Vagas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 flex-row items-center justify-center p-3 rounded-lg mx-1 ${
            activeTab === "candidatadas" ? "bg-black" : "bg-gray-100"
          }`}
          onPress={() => setActiveTab("candidatadas")}
        >
          <UserCheck
            size={20}
            color={activeTab === "candidatadas" ? "white" : "black"}
          />
          <Text
            className={`ml-2 font-medium ${
              activeTab === "candidatadas" ? "text-white" : "text-black"
            }`}
          >
            Minhas Candidaturas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Vagas List */}
      <FlatList
        data={displayedVacancies()}
        renderItem={renderWorkItem}
        keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={{ flexGrow: 1 }}
        onEndReached={() => {
          if (hasNextPage && !isSearching && activeTab === "todas")
            fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
      />

   {/* Modal para Todas as Vagas */}
{selectedWork && activeTab === "todas" && (
  <Modal
    visible={!!selectedWork}
    animationType="slide"
    transparent={true}
    onRequestClose={() => setSelectedWork(null)}
  >
    <View className="flex-1 justify-center items-center bg-black/50">
      <View className="bg-white w-[90%] max-h-[90%] rounded-xl p-5 pt-10">
        {/* Cabeçalho */}
        <TouchableOpacity
          className="absolute top-4 right-4 z-10"
          onPress={() => setSelectedWork(null)}
        >
          <X size={24} color="#6b7280" />
        </TouchableOpacity>

        {/* Informações da Vaga */}
        <View className="flex-row items-center mb-5">
          <View className="w-16 h-16 rounded-full bg-gray-100 justify-center items-center overflow-hidden mr-4">
            {selectedWork.company?.profile_img ? (
              <Image source={{ uri: selectedWork.company.profile_img }} className="w-full h-full" />
            ) : (
              <Building2 size={40} color="#6b7280" />
            )}
          </View>
          <Text className="text-lg text-gray-800 flex-1">
            {selectedWork.company?.nome || "Empresa"}
          </Text>
        </View>

        <Text className="text-xl font-bold mb-1">{selectedWork.name}</Text>
        
        <View className="flex-row items-center mb-5">
          <Clock size={14} color="#6b7280" />
          <Text className="text-xs text-gray-500 ml-1">
            {formatDate(selectedWork.createdAt)}
          </Text>
        </View>

        <View className="flex-row items-center mb-5">
          <Pin size={18} color="#6b7280" />
          <Text className="text-base text-gray-800 ml-1">
            {selectedWork.location || "Local não informado"}
          </Text>
        </View>

        {/* Benefícios */}
        <View className="mb-7">
          <View className="flex-row mb-2">
            <HandHelping size={20} color="#6b7280" className="mr-2" />
            <Text className="text-base font-bold">Benefícios</Text>
          </View>
          <View className="flex-row flex-wrap">
            {selectedWork.benefits?.split(",").map((benefit, index) => (
              <View key={index} className="bg-black px-3 py-1 rounded-md mr-2 mb-2">
                <Text className="text-white text-xs">{benefit.trim()}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mb-5">
          <Text className="text-lg font-bold mb-2">Descrição da Vaga</Text>
          <Text className="text-gray-700 text-sm">
            {selectedWork.description || "Descrição não disponível"}
          </Text>
        </View>

        {/* Sobre a Empresa */}
        <Text className="text-lg font-bold mb-4">Mais Sobre a Empresa</Text>
        <View className="flex-row items-center mb-5">
          <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center overflow-hidden mr-3">
            {selectedWork.company?.profile_img ? (
              <Image source={{ uri: selectedWork.company.profile_img }} className="w-full h-full" />
            ) : (
              <Building2 size={24} color="#6b7280" />
            )}
          </View>
          <View>
            <Text className="font-semibold">
              {selectedWork.company?.nome || "Empresa"}
            </Text>
            <Text className="text-gray-500">
              {selectedWork.company?.areaOfActivity || "Área de atuação não informada"}
            </Text>
          </View>
        </View>

        {/* Botão de Ação */}
        <TouchableOpacity
          className={`py-3 rounded-lg items-center mt-2 ${
            isCandidated ? "bg-red-500" : "bg-black"
          }`}
          onPress={handleApply}
          disabled={isApplying}
        >
          {isApplying ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold">
              {isCandidated ? "Remover Candidatura" : "Candidatar-se"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
)}

{/* Modal para Minhas Candidaturas */}
{selectedWork && activeTab === "candidatadas" && (
  <Modal
    visible={!!selectedWork}
    animationType="slide"
    transparent={true}
    onRequestClose={() => setSelectedWork(null)}
  >
    <View className="flex-1 justify-center items-center bg-black/50">
      <View className="bg-white w-[90%] max-h-[90%] rounded-xl p-5 pt-10">
        {/* Cabeçalho */}
        <TouchableOpacity
          className="absolute top-4 right-4 z-10"
          onPress={() => setSelectedWork(null)}
        >
          <X size={24} color="#6b7280" />
        </TouchableOpacity>

        {/* Informações da Vaga */}
        <View className="flex-row items-center mb-5">
          <View className="w-16 h-16 rounded-full bg-gray-100 justify-center items-center overflow-hidden mr-4">
            {selectedWork.company?.profile_img ? (
              <Image source={{ uri: selectedWork.company.profile_img }} className="w-full h-full" />
            ) : (
              <Building2 size={40} color="#6b7280" />
            )}
          </View>
          <Text className="text-lg text-gray-800 flex-1">
            {selectedWork.company?.nome || "Empresa"}
          </Text>
        </View>

        <Text className="text-xl font-bold mb-1">{selectedWork.name}</Text>
        
        <View className="flex-row items-center mb-5">
          <Clock size={14} color="#6b7280" />
          <Text className="text-xs text-gray-500 ml-1">
            {formatDate(selectedWork.applicationDate || selectedWork.createdAt)}
          </Text>
        </View>

        <View className="flex-row items-center mb-5">
          <Pin size={18} color="#6b7280" />
          <Text className="text-base text-gray-800 ml-1">
            {selectedWork.location || "Local não informado"}
          </Text>
        </View>

        {/* Status da Candidatura */}
        {selectedWork.status && (
          <View className={`px-3 py-1 rounded-full mb-5 ${getStatusStyle(selectedWork.status)}`}>
            <Text className="text-sm font-medium">
              Status: {translateStatus(selectedWork.status)}
            </Text>
          </View>
        )}

        {/* Benefícios */}
        <View className="mb-7">
          <View className="flex-row mb-2">
            <HandHelping size={20} color="#6b7280" className="mr-2" />
            <Text className="text-base font-bold">Benefícios</Text>
          </View>
          <View className="flex-row flex-wrap">
            {selectedWork.benefits?.split(",").map((benefit, index) => (
              <View key={index} className="bg-black px-3 py-1 rounded-md mr-2 mb-2">
                <Text className="text-white text-xs">{benefit.trim()}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mb-5">
          <Text className="text-lg font-bold mb-2">Descrição da Vaga</Text>
          <Text className="text-gray-700 text-sm">
            {selectedWork.description || "Descrição não disponível"}
          </Text>
        </View>

        {/* Sobre a Empresa */}
        <Text className="text-lg font-bold mb-4">Mais Sobre a Empresa</Text>
        <View className="flex-row items-center mb-5">
          <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center overflow-hidden mr-3">
            {selectedWork.company?.profile_img ? (
              <Image 
                source={{ uri: selectedWork.company.profile_img }} 
                className="w-full h-full" 
              />
            ) : (
              <Building2 size={24} color="#6b7280" />
            )}
          </View>
          <View>
            <Text className="font-semibold">
              {selectedWork.company?.nome || "Empresa"}
            </Text>
            {selectedWork.company?.areaOfActivity ? (
              <Text className="text-gray-500">
                {selectedWork.company.areaOfActivity}
              </Text>
            ) : (
              <Text className="text-gray-500 italic">
                Área de atuação não informada
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  </Modal>
)}
      {/* Success Modal */}
      <Modal
        transparent={true}
        visible={successModalVisible}
        animationType="fade"
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-4 rounded-lg w-4/5">
            <View className="flex-row items-center mb-2">
              <Ionicons name="checkmark-circle" size={24} color="green" />
              <Text className="ml-2 text-lg font-bold text-green-700">
                Inscrição realizada!
              </Text>
            </View>
            <Text className="text-gray-700 mb-4">
              Os recrutadores desta vaga receberam seu perfil. Fique atento ao
              seu e-mail!
            </Text>
            <TouchableOpacity
              onPress={() => setSuccessModalVisible(false)}
              className="bg-black rounded-lg p-2"
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
