import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_TIMEOUT = 15000;

const api = axios.create({
  baseURL: process.env.API_BASE_URL || "http://10.0.2.2:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: API_TIMEOUT,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error("Token error:", error);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
    }
    return Promise.reject(error);
  }
);

export const get = async (url, params = {}, config = {}) => {
  try {
    const response = await api.get(url, { ...config, params });
    return response.data;
  } catch (error) {
    handleApiError(error, "GET", url);
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
