import React, { createContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import api from "@/services/api";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
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
        console.error("Failed to load user", error);
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
        console.error("Storage update failed", error);
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
      router.replace("/(stacks)/(tabs)");
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(["user", "token", "role"]);
      setUser(null);
      router.replace("/(stacks)/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const refreshUserData = useCallback(async () => {
    if (!user?.id) {
      throw new Error("Usuário não autenticado");
    }

    try {
      const response = await api.get(`/user/users/${user.id}`);
      
      if (!response?.data.id) {
        throw new Error("Dados inválidos recebidos");
      }

      const updatedUser = { ...user, ...response };
      setUser(updatedUser);
      
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      throw error;
    }
  }, [user]);

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

export default AuthProvider;
