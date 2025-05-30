import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import api from "@/services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();

    const loadUser = async () => {
      try {
        console.log('[AUTH] Iniciando carregamento do usuário do storage');
        const [storedUser, token] = await Promise.all([
          AsyncStorage.getItem("user"),
          AsyncStorage.getItem("token"),
        ]);

        console.log('[AUTH] Dados recuperados do storage:', {
          storedUser: storedUser ? 'presente' : 'ausente',
          token: token ? '***' + token.slice(-5) : 'ausente'
        });

        if (!controller.signal.aborted && storedUser && token) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            console.log('[AUTH] Usuário e token encontrados, configurando estado');
          } catch (parseError) {
            console.error('[AUTH] Erro ao fazer parse do usuário:', parseError);
            await AsyncStorage.multiRemove(["user", "token", "role"]);
          }
        } else {
          console.log('[AUTH] Nenhum usuário ou token encontrado no storage');
        }
      } catch (error) {
        console.error('[AUTH] Erro ao carregar usuário:', error);
      } finally {
        if (!controller.signal.aborted) {
          console.log('[AUTH] Finalizando carregamento inicial');
          setIsLoading(false);
        }
      }
    };

    loadUser();

    return () => controller.abort();
  }, []);

  const saveUserToStorage = async (userData) => {
    try {
      console.log('[AUTH] Atualizando storage com estado do usuário:', userData ? 'presente' : 'null');
      if (userData) {
        console.log('[AUTH] Salvando dados do usuário no storage:', {
          id: userData.id,
          role: userData.role
        });
        await AsyncStorage.multiSet([
          ["user", JSON.stringify(userData)],
          ["token", userData.token],
          ["role", userData.role],
        ]);
        console.log('[AUTH] Dados do usuário salvos com sucesso');
      } else {
        console.log('[AUTH] Removendo dados de autenticação do storage');
        await AsyncStorage.multiRemove(["user", "token", "role"]);
        console.log('[AUTH] Dados de autenticação removidos');
      }
    } catch (error) {
      console.error('[AUTH] Erro ao atualizar storage:', error);
    }
  };

  const login = async (userData) => {
    try {
      console.log('[AUTH] Iniciando processo de login com dados:', {
        id: userData.id,
        role: userData.role
      });

      await saveUserToStorage(userData);
      setUser(userData);
      console.log('[AUTH] Redirecionando para tabs');
      router.replace("/(tabs)");
      console.log('[AUTH] Login concluído com sucesso');
    } catch (error) {
      console.error('[AUTH] Falha no login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('[AUTH] Iniciando logout');
      await saveUserToStorage(null);
      setUser(null);
      router.replace("/");
      console.log('[AUTH] Logout concluído com sucesso');
    } catch (error) {
      console.error('[AUTH] Falha no logout:', error);
      Alert.alert("Erro", "Não foi possível fazer logout. Tente novamente.");
    }
  };

  const refreshUserData = useCallback(async () => {
    try {
      if (!user?.id) {
        console.log('[AUTH] refreshUserData: Nenhum ID de usuário disponível');
        return;
      }

      console.log('[AUTH] Atualizando dados do usuário ID:', user.id);
      const response = await api.get(`/user/users/${user.id}`);
      const userData = response.data;

      console.log('[AUTH] Novos dados recebidos:', {
        id: userData.id,
        role: userData.role
      });

      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      await saveUserToStorage(updatedUser);

      console.log('[AUTH] Dados do usuário atualizados com sucesso');
      return userData;
    } catch (error) {
      console.error('[AUTH] Erro ao atualizar dados do usuário:', error);
      throw error;
    }
  }, [user]);

  const isAuthenticated = !!user?.token;

  console.log('[AUTH] Estado atual:', {
    isLoading,
    isAuthenticated,
    user: user ? { id: user.id, role: user.role } : null
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        refreshUserData,
        isAuthenticated,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
