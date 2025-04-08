import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

export default function Post({
  author,
  author_profileImg,
  content,
  img,
  LikeCount,
}) {
  return (
    <View className="mb-6 shadow-md bg-white p-4 rounded-lg">
      <View className="flex-row items-center mb-3">
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
        </View>
      </View>

      <View>
        <Text className="text-gray-800 text-base mb-4">{content}</Text>
      </View>
      {img && img.length > 0 && (
        <Image
          source={{ uri: img[0] }}
          className="w-64 h-64 rounded-lg"
          resizeMode="cover"
        />
      )}

      <View className="flex-row space-x-4 mt-4">
        <TouchableOpacity className="flex-row items-center">
          <Icon name="heart" size={20} color="#4B5563" />
          <Text className="text-black text-xl ml-2">{LikeCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center ml-4 mb-1">
          <Icon name="comment" size={20} color="#4B5563" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
