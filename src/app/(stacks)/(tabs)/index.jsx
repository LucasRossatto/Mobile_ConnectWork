import React from "react";
import {
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

export default function Home() {
  return (
    <ScrollView className="flex-1 bg-backgroundGray p-4">
      <View className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <TextInput
          className="text-gray-700 text-base"
          placeholder="O que você está pensando?"
          placeholderTextColor="#4B5563"
        />
      </View>

      {/* Primeiro Post */}
      <View className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <View className="flex-row items-center mb-3">
          <Image
            
            className="w-12 h-12 rounded-full bg-black"
          />
          <View className="ml-3">
            <Text className="font-bold text-lg text-gray-900">
              Helter Almeida
            </Text>
            <Text className="text-gray-600 text-sm">
              Desenvolvedor Front-end Jr.
            </Text>
          </View>
        </View>
        <View>
          <Text className="text-gray-800 text-base mb-4">
            Compartilho que conquistei esse novo certificação HTML 5 and CSS 3
            pela Wig Academy Edo.
          </Text>
        </View>

        <View className="mb-4">
          <Image
            source={{
              uri: "https://s3.amazonaws.com/blog.dentrodahistoria.com.br/wp-content/uploads/2022/09/14102229/relampago-mcqueen.png",
            }} 
            className="w-full h-48 rounded-lg"
          />
        </View>

        <View className="flex-row space-x-4">
          <TouchableOpacity className="flex-row items-center">
            <Icon name="heart" size={20} color="#4B5563" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center ml-4 mb-1">
            <Icon name="comment" size={20} color="#4B5563" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
