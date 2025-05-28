import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import log from "@/utils/logger"

const API_TIMEOUT = 15000;

const api = axios.create({
  baseURL: "https://backendconnectwork-production.up.railway.app/api",
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
      log.error("< API Interceptor > Token error:", error);
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
    log.error("< SERVICE API ERROR > Erro na requisição GET:", error);
    throw error;
  }
};

export const post = async (url, data) => {
  try {
    const response = await api.post(url, data);
    return response.data;
  } catch (error) {
    log.error("< SERVICE API ERROR > Erro na requisição POST:", error);
    throw error;
  }
};

export const put = async (url, data) => {
  try {
    const response = await api.put(url, data);
    return response.data;
  } catch (error) {
    log.error("< SERVICE API ERROR > Erro na requisição PUT:", error);
    throw error;
  }
};

export const remove = async (url) => {
  try {
    const response = await api.delete(url);
    return response.data;
  } catch (error) {
    log.error("< SERVICE API ERROR > Erro na requisição DELETE:", error);
    throw error;
  }
};

export default api;
