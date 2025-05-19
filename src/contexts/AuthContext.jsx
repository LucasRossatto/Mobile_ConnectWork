import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import api from "@/services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        const [storedUser, token] = await Promise.all([
          AsyncStorage.getItem("user"),
          AsyncStorage.getItem("token"),
        ]);

        if (isMounted && storedUser && token) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        log.error("Erro ao carrecar usuário", error);
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
          await AsyncStorage.multiSet([
            ["user", JSON.stringify(user)],
            ["token", user.token],
            ["role", user.role],
          ]);
        } else {
          await AsyncStorage.multiRemove(["user", "token", "role"]);
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
      const storageData = [
        ["user", JSON.stringify(userData)],
        ["token", userData.token],
      ];

      if (userData.role) {
        storageData.push(["role", userData.role]);
      }

      await AsyncStorage.multiSet(storageData);
      setUser(userData);
      router.replace("/(tabs)/");
    } catch (error) {
      log.error("Erro no Login", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(["user", "token", "role"]);
      router.replace("/");
      setUser(null);

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
