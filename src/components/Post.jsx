import React, { useState, useRef } from "react";
import { Image, Text, TouchableOpacity, View, FlatList, Dimensions } from "react-native";
import { Heart, MessageCircle, Ellipsis, ChevronLeft, ChevronRight } from "lucide-react-native";
import { formatPostDate } from "../utils/formatPostDate";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";

const { width: screenWidth } = Dimensions.get('window');
const AnimatedHeart = Animated.createAnimatedComponent(Heart);

export default function Post({
  author,
  author_profileImg,
  content,
  img,
  LikeCount,
  date,
  category,
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [isCommented, setIsCommented] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const likeScale = useSharedValue(1);
  const likeOpacity = useSharedValue(1);

  const animatedHeartStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: likeScale.value }],
      opacity: likeOpacity.value,
    };
  });

  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      likeScale.value = withSpring(0.8);
    })
    .onFinalize(() => {
      const newValue = !isLiked;
      likeScale.value = withSpring(1.2, {}, (finished) => {
        if (finished) {
          likeScale.value = withSpring(1);
          runOnJS(setIsLiked)(newValue);
        }
      });
      likeOpacity.value = withSpring(newValue ? 1 : 0.6);
    });

  const handleNext = () => {
    if (currentIndex < img.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      flatListRef.current.scrollToIndex({ index: currentIndex - 1 });
      setCurrentIndex(currentIndex - 1);
    }
  };

  const renderImageItem = ({ item }) => {
    // Verifica se o item já contém o prefixo data:image
    if (typeof item === 'string' && item.startsWith('data:image')) {
      return (
        <View style={{ width: screenWidth, height: 300 }}>
          <Image
            source={{ uri: item }}  // Usa a string diretamente
            style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
            onError={(e) => console.log('Erro ao carregar imagem:', e.nativeEvent.error)}
          />
        </View>
      );
    }
    
    // Se for base64 puro (sem prefixo)
    if (typeof item === 'string') {
      return (
        <View style={{ width: screenWidth, height: 300 }}>
          <Image
            source={{ uri: `data:image/jpeg;base64,${item}` }}
            style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
            onError={(e) => console.log('Erro ao carregar imagem:', e.nativeEvent.error)}
          />
        </View>
      );
    }
    
    console.warn('Formato de imagem não reconhecido:', item);
    return null;
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  return (
    <View className="border-b border-gray-100 py-5 bg-white">
      <View className="flex-row justify-between items-start mb-3 px-4">
        <View className="flex-row items-center">
          {author_profileImg ? (
            <Image
              source={{ uri: author_profileImg }}
              className="w-12 h-12 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-12 h-12 rounded-full bg-gray-300 items-center justify-center">
              <Text className="text-xl font-bold text-black">
                {author?.charAt(0)?.toUpperCase()}
              </Text>
            </View>
          )}
          <View className="ml-3">
            <Text className="font-bold text-lg text-gray-900">{author}</Text>
            <View className="space-x-2 flex-row">
              <Text className="text-xs text-gray-500">
                {formatPostDate(date)}
              </Text>
              <Text className="text-xs text-gray-500">{category}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity className="mt-2 mr-2">
          <Ellipsis size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {content && (
        <View className="px-4 mb-3">
          <Text className="text-gray-800 text-base">{content}</Text>
        </View>
      )}

      {img && img.length > 0 && (
        <View style={{ position: 'relative' }}>
          <FlatList
            ref={flatListRef}
            data={img}
            renderItem={renderImageItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          />
          
          {/* Controles do carrossel */}
          {img.length > 1 && (
            <>
              {currentIndex > 0 && (
                <TouchableOpacity 
                  onPress={handlePrev}
                  style={{
                    position: 'absolute',
                    left: 10,
                    top: '50%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    borderRadius: 20,
                    padding: 8,
                  }}
                >
                  <ChevronLeft size={24} color="white" />
                </TouchableOpacity>
              )}
              
              {currentIndex < img.length - 1 && (
                <TouchableOpacity 
                  onPress={handleNext}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    borderRadius: 20,
                    padding: 8,
                  }}
                >
                  <ChevronRight size={24} color="white" />
                </TouchableOpacity>
              )}
              
              <View style={{
                position: 'absolute',
                bottom: 10,
                alignSelf: 'center',
                flexDirection: 'row',
              }}>
                {img.map((_, index) => (
                  <View
                    key={index}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: index === currentIndex ? 'white' : 'rgba(255,255,255,0.5)',
                      marginHorizontal: 4,
                    }}
                  />
                ))}
              </View>
            </>
          )}
        </View>
      )}

      <View className="flex-row items-center mt-4 px-5 space-x-6">
        <GestureDetector gesture={tapGesture}>
          <View className="flex-row items-center">
            <AnimatedHeart
              size={24}
              color={isLiked ? "#dc2626" : "#4b5563"}
              fill={isLiked ? "#dc2626" : "transparent"}
              strokeWidth={2}
              style={animatedHeartStyle}
            />
            <Text className="text-sm text-gray-600 ml-2">{LikeCount}</Text>
          </View>
        </GestureDetector>

        <TouchableOpacity
          onPress={() => setIsCommented(!isCommented)}
          activeOpacity={0.7}
          className="ml-3"
        >
          <MessageCircle
            size={24}
            color={isCommented ? "#3b82f6" : "#4b5563"}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}