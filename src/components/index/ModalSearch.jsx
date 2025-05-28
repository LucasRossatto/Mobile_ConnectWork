import { useState } from "react";
import { 
  View, 
  TouchableOpacity, 
  Text, 
  TextInput, 
  Modal, 
  ActivityIndicator,
  Image, Dimensions
} from "react-native";
import log from "@/utils/logger";
import {
  Search as SearchIcon,
  X as CloseIcon,
  Clock as ClockIcon,
} from "lucide-react-native";
import api from "@/services/api"; 
import { Link } from 'expo-router';
import { FlashList } from "@shopify/flash-list";
import { formatPostDate } from "@/utils/formatPostDate";

const { width: screenWidth } = Dimensions.get("window");

const ModalSearch = ({ visible, onClose }) => {
  const [searchText, setSearchText] = useState("");
  const [recentSearches, setRecentSearches] = useState([
    "Desenvolvedor Front-end Junior",
    "Estágio em Marketing Digital",
    "Analista de Dados Pleno",
    "Designer UI/UX Sênior",
  ]);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

const handleSearch = async () => {
  const trimmedKeyword = searchText.trim();
  
  
  if (!trimmedKeyword || trimmedKeyword === "") {
    setError("Digite uma palavra-chave para buscar");
    return;
  }

  setIsLoading(true);
  setError(null);

  try {
   
    const response = await api.post('/user/search', {
      keyword: trimmedKeyword,  
      offset: 0,               
      limit: 20                
    });

 
    if (!response.data || !response.data.posts) {
      throw new Error("Formato de resposta inesperado");
    }


    setSearchResults(response.data.posts);

    
    setRecentSearches(prev => [
      trimmedKeyword,
      ...prev.filter(item => 
        item.toLowerCase() !== trimmedKeyword.toLowerCase()
      ).slice(0, 3)
    ]);

  } catch (err) {
   
    if (err.response) {
      if (err.response.status === 400) {
        setError(err.response.data.error || "Busca inválida");
      } else {
        setError("Erro no servidor. Tente novamente.");
      }
    } else {
      setError("Erro de conexão. Verifique sua internet.");
    }
    
    console.error("Detalhes do erro:", {
      message: err.message,
      response: err.response?.data,
      request: err.config
    });

  } finally {
    setIsLoading(false);
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

const renderImageItem = ({ item }) => {
  // Verifica se o item é uma string (pode ser URI ou base64)
  if (typeof item === 'string') {
    let imageUri = item;
    
    // Se não começar com 'data:' e não for uma URL válida, assume que é base64
    if (!imageUri.startsWith('data:') && !imageUri.startsWith('http')) {
      imageUri = `data:image/jpeg;base64,${item}`;
    }
    
    return (
      <View style={{ width: screenWidth, height: 300 }}>
        <Image
          source={{ uri: imageUri }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
          onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
        />
      </View>
    );
  }
  
  // Se for um objeto com propriedade uri ou url
  if (typeof item === 'object' && (item.uri || item.url)) {
    return (
      <View style={{ width: screenWidth, height: 300 }}>
        <Image
          source={{ uri: item.uri || item.url }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
          onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
        />
      </View>
    );
  }

  console.log('Unsupported image format:', item);
  return null;
};

const renderSearchResults = () => {
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }

  if (searchResults.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-400">Nenhum resultado encontrado</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <Text className="text-gray-500 mb-4">
        Resultados para: {searchText}
      </Text>
      
      <FlashList
        data={searchResults}
        estimatedItemSize={300}
        renderItem={({ item: post }) => (
          <View className="mb-4 border-b border-gray-100 pb-3">
            {/* Cabeçalho com info do autor */}
            <Link href={`/neighbor/${post.user?.id}`} asChild>
              <TouchableOpacity className="flex-row items-center mb-3">
                {post.user?.profile_img ? (
                  <Image 
                    source={{ uri: post.user.profile_img }} 
                    className="w-8 h-8 rounded-full mr-2"
                  />
                ) : (
                  <View className="w-8 h-8 rounded-full bg-gray-300 mr-2 justify-center items-center">
                    <Text className="text-xs font-bold">
                      {post.user?.nome?.[0]?.toUpperCase() || "A"}
                    </Text>
                  </View>
                )}
                <Text className="font-medium">{post.user?.nome || "Anônimo"}</Text>
              </TouchableOpacity>
            </Link>

            {/* Conteúdo textual do post */}
            {post.content && (
              <Text className="text-base mb-3">{post.content}</Text>
            )}

            {/* Imagens do post - agora usando a mesma lógica do componente Post */}
            {post.img && post.img.length > 0 && (
  <View style={{ position: 'relative', height: 300 }}>
    <FlashList
      data={post.img}
      horizontal
      pagingEnabled
      estimatedItemSize={screenWidth}
      renderItem={renderImageItem}
      keyExtractor={(item, index) => {
        // Tenta criar uma chave única baseada no conteúdo da imagem
        if (typeof item === 'string') return item.substring(0, 20) + index;
        if (item.uri) return item.uri + index;
        if (item.url) return item.url + index;
        return index.toString();
      }}
      showsHorizontalScrollIndicator={false}
    />
    
    {/* Indicadores só aparecem se houver mais de uma imagem */}
    {post.img.length > 1 && (
      <View style={{
        position: 'absolute',
        bottom: 10,
        alignSelf: 'center',
        flexDirection: 'row'
      }}>
        {post.img.map((_, idx) => (
          <View
            key={`indicator-${idx}`}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: idx === 0 ? 'white' : 'rgba(255,255,255,0.5)',
              marginHorizontal: 4
            }}
          />
        ))}
      </View>
    )}
  </View>
)}

            {/* Rodapé com categoria e data */}
            <View className="flex-row mt-3 justify-between">
              {post.category && (
                <Text className="text-gray-500 text-sm">{post.category}</Text>
              )}
              {post.date && (
                <Text className="text-gray-500 text-sm">
                  {formatPostDate(post.date)}
                </Text>
              )}
            </View>
          </View>
        )}
        keyExtractor={(post, index) => post.id || index.toString()}
      />
    </View>
  );
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
          renderSearchResults()
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