import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { handleError } from "./errorHandler";

const API_TIMEOUT = 15000;
const api = axios.create({
  baseURL: process.env.API_BASE_URL || "http://10.0.2.2:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: API_TIMEOUT,
});

// Interceptor de Request
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      // Tratamento específico para erros de token
      const handledError = handleError(error, "token_management", {
        showToUser: false,
      });
      console.error("Falha no token:", handledError);
      return config;
    }
  },
  (error) => {
    return Promise.reject(
      handleError(error, "request_interceptor", { showToUser: false })
    );
  }
);

// Interceptor de Response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tratamento especial para 401
    if (error.response?.status === 401) {
      handleError(error, "authentication_failed", {
        customMessage: "Sessão expirada. Faça login novamente.",
      });
      // futuro redirecionamento para login se necessário
    }

    return Promise.reject(
      handleError(error, "response_interceptor", { showToUser: false })
    );
  }
);

// Métodos HTTP com tratamento unificado
const apiClient = {
  get: async (url, params = {}, config = {}) => {
    try {
      const response = await api.get(url, { ...config, params });
      return response.data;
    } catch (error) {
      throw handleError(error, `get_${url.replace(/\//g, "_")}`);
    }
  },

  post: async (url, data, config = {}) => {
    try {
      const response = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw handleError(error, `post_${url.replace(/\//g, "_")}`, {
        metadata: { payload: data },
      });
    }
  },

  put: async (url, data, config = {}) => {
    try {
      const response = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw handleError(error, `put_${url.replace(/\//g, "_")}`, {
        metadata: { payload: data },
      });
    }
  },

  delete: async (url, config = {}) => {
    try {
      const response = await api.delete(url, config);
      return response.data;
    } catch (error) {
      throw handleError(error, `delete_${url.replace(/\//g, "_")}`);
    }
  },

  // Método para uploads com tratamento especial
  upload: async (url, file, data = {}, config = {}) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      Object.keys(data).forEach((key) => {
        formData.append(key, data[key]);
      });

      const response = await api.post(url, formData, {
        ...config,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw handleError(error, `upload_${url.replace(/\//g, "_")}`, {
        metadata: { fileInfo: file.name },
      });
    }
  },
};

// Tipos de erro exportáveis para tratamento específico
export const ErrorTypes = {
  NETWORK: "network_error",
  TIMEOUT: "timeout_error",
  AUTH: "authentication_error",
  SERVER: "server_error",
  VALIDATION: "validation_error",
};

// Utilitário para identificar tipo de erro
export const getErrorType = (error) => {
  if (!error.isAxiosError) return ErrorTypes.SERVER;

  if (error.code === "ECONNABORTED") return ErrorTypes.TIMEOUT;
  if (error.code === "ERR_NETWORK") return ErrorTypes.NETWORK;
  if (error.response?.status === 401) return ErrorTypes.AUTH;
  if (error.response?.status === 400) return ErrorTypes.VALIDATION;

  return ErrorTypes.SERVER;
};

export default apiClient;
