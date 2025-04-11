import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Heart, MessageCircle, Ellipsis  } from "lucide-react-native";
import { formatPostDate } from "../utils/formatPostDate";

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

  return (
    <View className="border-b border-gray-100 py-5">
      {/* Cabeçalho com informações do autor */}
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
            <View className=" space-x-2">
              <Text className="text-xs text-gray-500">
                {formatPostDate(date)}
              </Text>
              <Text className="text-xs text-gray-500">
                Categoria: {category}
              </Text>
            </View>
          </View>
        </View>

        {/* Três pontos verticais */}
        <TouchableOpacity className="mt-2 mr-2">
          <Ellipsis  size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Conteúdo do post */}
      <View className="px-4">
        <Text className="text-gray-800 text-base mb-4">{content}</Text>
      </View>

      {/* Imagem (se houver) */}
      {img && img.length > 0 && (
        <Image
          source={{ uri: img[0] }}
          className="w-full h-64 mx-auto"
          resizeMode="cover"
        />
      )}

      {/* Rodapé com ações */}
      <View className="flex-row items-center space-x-4 mt-4 px-5">
        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => setIsLiked(!isLiked)}
          activeOpacity={0.7}
        >
          <Heart
            size={24}
            color={isLiked ? "#dc2626" : "#4b5563"}
            fill={isLiked ? "#dc2626" : "transparent"}
            strokeWidth={2}
          />
          <Text className="text-sm text-gray-600 ml-2">{LikeCount}</Text>
        </TouchableOpacity>

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
