import { Link } from "expo-router";
import { View, Image } from "react-native";

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

      <View className="bg-white flex gap-4 pt-14 pr-6 pl-6 w-full rounded-t-[56]">
        <Link
          className="border bg-black text-white p-5 rounded-[14] text-center text-lg font-medium"
          href={"/(stacks)/login"}
        >
          Login
        </Link>

        <Link
          className="border p-5 rounded-[14] text-center text-lg font-medium"
          href={"/(stacks)/register"}
        >
          Cadastre-se
        </Link>
      </View>
    </View>
  );
}
