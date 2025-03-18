import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: "http://10.0.2.2:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  async (request) => {
    const token = await AsyncStorage.getItem("token");
    console.log("Token recuperado:", token);

    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }

    console.log("Headers da requisição:", request.headers);
    return request;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// Funções reutilizáveis para requisições HTTP
export const get = async (url, params = {}) => {
  try {
    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Erro na requisição GET:", error.response.data);
    } else {
      console.error("Erro de rede ou outro problema:", error.message);
    }
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