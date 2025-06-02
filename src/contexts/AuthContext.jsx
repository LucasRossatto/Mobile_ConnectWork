import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { SplashScreen, useRouter } from "expo-router";
import api from "@/services/api";

SplashScreen.preventAutoHideAsync();

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const USER_KEY = "user";
  const ROLE_KEY = "role";
  const TOKEN_KEY = "token";

  const saveUserToStorage = async (userData) => {
    try {
      console.log(
        "[AUTH] Atualizando storage com estado do usuário:",
        userData ? "presente" : "null"
      );
      if (userData) {
        console.log("[AUTH] Salvando dados do usuário no storage:", {
          id: userData.id,
          role: userData.role,
        });
        await AsyncStorage.multiSet([
          [USER_KEY, JSON.stringify(userData)],
          [TOKEN_KEY, userData.token],
          [ROLE_KEY, userData.role],
        ]);
        console.log("[AUTH] Dados do usuário salvos com sucesso");
      } else {
        console.log("[AUTH] Removendo dados de autenticação do storage");
        await AsyncStorage.multiRemove([USER_KEY, TOKEN_KEY, ROLE_KEY]);
        console.log("[AUTH] Dados de autenticação removidos");
      }
    } catch (error) {
      console.error("[AUTH] Erro ao atualizar storage:", error);
    }
  };

  const login = async (userData) => {
    try {
      console.log("[AUTH] Iniciando processo de login com dados:", {
        id: userData.id,
        role: userData.role,
      });

      await saveUserToStorage(userData);
      setUser(userData);

      console.log("[AUTH] Aguardando montagem do RootLayout");
      router.replace("/(tabs)/home");
      console.log("[AUTH] Login concluído com sucesso");
    } catch (error) {
      console.error("[AUTH] Falha no login:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log("[AUTH] Iniciando logout");
      await saveUserToStorage(null);
      setUser(null);
      router.replace("/");
      console.log("[AUTH] Logout concluído com sucesso");
    } catch (error) {
      console.error("[AUTH] Falha no logout:", error);
      Alert.alert("Erro", "Não foi possível fazer logout. Tente novamente.");
    }
  };

  const refreshUserData = useCallback(async () => {
    try {
      if (!user?.id) {
        console.log("[AUTH] refreshUserData: Nenhum ID de usuário disponível");
        return;
      }

      console.log("[AUTH] Atualizando dados do usuário ID:", user.id);
      const response = await api.get(`/user/users/${user.id}`);
      const userData = response.data;

      console.log("[AUTH] Novos dados recebidos:", {
        id: userData.id,
        role: userData.role,
      });

      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      await saveUserToStorage(updatedUser);

      console.log("[AUTH] Dados do usuário atualizados com sucesso");
      return userData;
    } catch (error) {
      console.error("[AUTH] Erro ao atualizar dados do usuário:", error);
      throw error;
    }
  }, [user]);

  console.log("[AUTH] Estado atual:", {
    isLoading,
    user: user ? { id: user.id, role: user.role } : null,
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        console.log("[AUTH] Iniciando carregamento do usuário do storage");
        const [storedUser, token, role] = await Promise.all([
          AsyncStorage.getItem(USER_KEY),
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(ROLE_KEY),
        ]);

        console.log("[AUTH] Dados recuperados do storage:", {
          storedUser: storedUser ? "presente" : "ausente",
          token: token ? "***" + token.slice(-5) : "ausente",
          role: role ? "presente" : "ausente",
        });

        if (!storedUser && !token) {
          console.log("[AUTH] Nenhum usuário ou token encontrado no storage");
          await AsyncStorage.multiRemove([USER_KEY, TOKEN_KEY, ROLE_KEY]);
        } else {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          console.log(
            "[AUTH] Usuário e token encontrados, configurando estado"
          );
        }
      } catch (error) {
        console.error("[AUTH] Erro ao carregar usuário:", error);
      } finally {
        console.log("[AUTH] Finalizando carregamento inicial");
        setIsLoading(true);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    if (isLoading) {
      SplashScreen.hide();
    }
  }, [isLoading]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        refreshUserData,
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
