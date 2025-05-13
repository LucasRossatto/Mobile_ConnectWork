import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

const ProfileNeigthbor = () => {
   const { userId } = useLocalSearchParams();

  return (
    <View>
      <Text>Perfil do Usuário</Text>
      <Text>ID do Usuário: {userId || "404 usuário não encontrado"}</Text>
    </View>
  );
};
export default ProfileNeigthbor;
