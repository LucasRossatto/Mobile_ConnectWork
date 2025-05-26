import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import api from "@/services/api";
import { log } from "@/utils/logger";
import { Alert } from "react-native";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        const storedUser = await SecureStore.getItemAsync("user");
        const token = await SecureStore.getItemAsync("token");

        if (isMounted && storedUser && token) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        log.error("Erro ao carregar usuário", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const updateStorage = async () => {
      try {
        if (user) {
          await Promise.all([
            SecureStore.setItemAsync("user", JSON.stringify(user)),
            SecureStore.setItemAsync("token", user.token),
            user.role ? SecureStore.setItemAsync("role", user.role) : Promise.resolve(),
          ]);
        } else {
          await Promise.all([
            SecureStore.deleteItemAsync("user"),
            SecureStore.deleteItemAsync("token"),
            SecureStore.deleteItemAsync("role"),
          ]);
        }
      } catch (error) {
        log.error("Erro ao atualizar storage", error);
      }
    };

    if (isMounted) updateStorage();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const login = async (userData) => {
    try {
      const storageOperations = [
        SecureStore.setItemAsync("user", JSON.stringify(userData)),
        SecureStore.setItemAsync("token", userData.token),
      ];

      if (userData.role) {
        storageOperations.push(SecureStore.setItemAsync("role", userData.role));
      }

      await Promise.all(storageOperations);
      setUser(userData);
      router.replace("/(tabs)/");
    } catch (error) {
      log.error("Erro no Login", error);
      await Promise.all([
        SecureStore.deleteItemAsync("user"),
        SecureStore.deleteItemAsync("token"),
        SecureStore.deleteItemAsync("role"),
      ]);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync("user"),
        SecureStore.deleteItemAsync("token"),
        SecureStore.deleteItemAsync("role"),
      ]);
      
      setUser(null);
      router.replace("/");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível fazer logout. Tente novamente.");
      log.error("Logout failed", error);
    }
  };

  const refreshUserData = useCallback(async () => {
    try {
      if (!user?.id) return;

      const response = await api.get(`/user/users/${user.id}`);
      const userData = response.data;

      setUser((prev) => ({
        ...prev,
        ...userData,
      }));

      return userData;
    } catch (error) {
      log.error("Erro ao recarregar as informações do usuário:", error);
      throw error;
    }
  }, [user?.id]);

  const isAuthenticated = !!user?.token;

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
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};