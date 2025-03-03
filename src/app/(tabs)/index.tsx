import { Link } from "expo-router"
import { View, Text} from "react-native"

export default function Home() {
  return (
    <View className="flex-1 flex items-center justify-center">
        <Text>teste</Text>
        <Link href={"/(tabs)/login"}>login</Link>
        <Link href={"/(tabs)/register"}>cadastro</Link>

    </View>
  )
}
