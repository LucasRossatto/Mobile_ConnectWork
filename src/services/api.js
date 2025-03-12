import axios from "axios";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
const api = axios.create({
  baseURL: "http://10.0.2.2:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento global de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Não autorizado. Redirecionando para login...");
      Alert.alert(
        "Erro",
        "Sua sessão expirou. Por favor, faça login novamente."
      );
    }
    return Promise.reject(error);
  }
);

// Funções reutilizáveis para requisições HTTP
export const get = async (url, params = {}) => {
  try {
    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    console.error("Erro na requisição GET:", error);
    throw error;
  }
};

export const post = async (url, data) => {
  try {
    const response = await api.post(url, data);
    return response.data;
  } catch (error) {
    console.error("Erro na requisição POST:", error);
    throw error;
  }
};

export const put = async (url, data) => {
  try {
    const response = await api.put(url, data);
    return response.data;
  } catch (error) {
    console.error("Erro na requisição PUT:", error);
    throw error;
  }
};

export const remove = async (url) => {
  try {
    const response = await api.delete(url);
    return response.data;
  } catch (error) {
    console.error("Erro na requisição DELETE:", error);
    throw error;
  }
};

export default api;
