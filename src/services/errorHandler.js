import { Alert } from "react-native";
import log from "../utils/logger";

/**
 * Trata erros de API e operacionais de forma consistente
 * @param {Error} error - Objeto de erro
 * @param {string} context - Contexto da operação (ex: 'atualizar_experiencia')
 * @param {object} options - Configurações adicionais
 * @param {boolean} options.showToUser - Se deve exibir alerta ao usuário
 */
export const handleError = (
  error,
  context = "operacao",
  { showToUser = true } = {}
) => {
  // Log estruturado para debugging
  log.error(`[${context.toUpperCase()}]`, {
    errorMessage: error.message,
    stack: error.stack,
    responseData: error.response?.data,
  });

  // Mensagem amigável padrão
  const defaultMessages = {
    network: "Erro de conexão. Verifique sua internet.",
    timeout: "Servidor demorou para responder",
    default: `Erro ao ${context.replace("_", " ")}`,
  };

  // Determinar mensagem baseada no tipo de erro
  let userMessage = defaultMessages.default;

  if (error.message.includes("Network Error")) {
    userMessage = defaultMessages.network;
  } else if (error.message.includes("timeout")) {
    userMessage = defaultMessages.timeout;
  } else if (error.response?.data?.message) {
    userMessage = error.response.data.message;
  }

  // Exibir alerta visual (se necessário)
  if (showToUser) {
    Alert.alert("Erro", userMessage, [{ text: "OK", onPress: () => {} }]);
  }

  // Retornar objeto padronizado para tratamento posterior
  return {
    success: false,
    message: userMessage,
    originalError: error,
    context,
  };
};
