import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const updateStorage = async () => {
      if (user) {
        await AsyncStorage.setItem("user", JSON.stringify(user));
        await AsyncStorage.setItem("role", user.role);
      } else {
        await AsyncStorage.removeItem("user");
        await AsyncStorage.removeItem("role");
      }
    };
    updateStorage();
  }, [user]);

  const login = (userData) => {
    setUser(userData);
    router.push("/(stacks)/(tabs)");
  };

  const logout = () => {
    setUser(null);
    router.push("/(stacks)/login");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
