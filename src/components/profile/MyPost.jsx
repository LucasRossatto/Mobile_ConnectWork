import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Heart, MessageCircle, Ellipsis } from "lucide-react-native";
import { formatPostDate } from "@/utils/formatPostDate";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
  runOnJS,
} from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";

const AnimatedHeart = Animated.createAnimatedComponent(Heart);

export default function MyPost({
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
            <View className="space-x-2 flex-row gap-2">
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
        <Image
          source={{ uri: img[0] }}
          className="w-full h-64"
          resizeMode="cover"
        />
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
