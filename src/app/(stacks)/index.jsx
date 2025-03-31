import { Link } from "expo-router";
import { View, Image, Text, TouchableOpacity } from "react-native";

export default function Home() {
  return (
    <View className="flex-1 justify-between bg-backgroundDark">
      <View className="flex-1 justify-center items-center">
        <Image
          source={require("../../../assets/images/logo.png")}
          className="w-screen h-20"
          resizeMode="contain"
        />
      </View>

      <View className="bg-white flex gap-4 pt-14 pr-6 pl-6 w-full pb-6 rounded-t-[56]">
        <Link href={"/(stacks)/login"} asChild>
          <TouchableOpacity
            className="border bg-black text-white p-5 rounded-full flex items-center"
          >
            <Text className="text-white text-lg font-medium">Login</Text>
          </TouchableOpacity>
        </Link>

        <Link href={"/(stacks)/register"} asChild>
          <TouchableOpacity
            className="border border-gray-300 shadow-md p-5 rounded-full flex items-center"
          >
            <Text className="text-black text-lg font-medium">Cadastre-se</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}