import React, { createContext, useState, useEffect } from "react";
import jwt from "jsonwebtoken";
import { useRouter } from "expo-router";
import { AsyncStorage } from "react-native";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  const getUserIdFromToken = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) return null;

    const decoded = jwt.decode(token);

    if (decoded) {
      return decoded.id;
    }

    return null;
  };

  useEffect(() => {
    const loadUser = async () => {
      const userId = await getUserIdFromToken();
      if (userId) {
        setUser({ id: userId });
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const updateStorage = async () => {
      if (user) {
        await AsyncStorage.setItem("token", user.token);
      } else {
        await AsyncStorage.removeItem("token");
      }
    };
    updateStorage();
  }, [user]);

  const login = (token) => {
    const decoded = jwt.decode(token);
    if (decoded) {
      setUser({ id: decoded.id, token }); 
      router.push("/(stack)/(tabs)"); 
    }
  };

  const logout = () => {
    setUser(null);
    router.push("/(stack)/login")
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;