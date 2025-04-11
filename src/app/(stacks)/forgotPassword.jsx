import React, { useState } from "react";
import { View, SafeAreaView } from "react-native";
import RequestCodeStep from "@/components/forgotPassword/RequestCodeStep";
import VerifyCodeStep from "@/components/forgotPassword/VerifyCodeStep";
import NewPasswordStep from "@/components/forgotPassword/NewPasswordStep";
import api from "@/services/api";
import log from "@/utils/logger";
import { validateEmail, validatePassword } from "@/utils/validations";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import * as SecureStore from "expo-secure-store";

const ForgotPasswordScreen = () => {
  const router = useRouter();
  const [step, setStep] = useState(3);
  const [state, setState] = useState({
    email: "",
    token: "",
    code: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleApiError = (error) => {
    log.debug("[Erro na API] Detalhes do erro:", {
      mensagem: error.message,
      codigo: error.code,
      status: error.response?.status,
      dadosResposta: error.response?.data,
      configuracao: {
        url: error.config?.url,
        metodo: error.config?.method,
      },
    });

    const message =
      error.response?.data?.message ||
      (error.code === "ECONNABORTED"
        ? "Tempo de conexão esgotado"
        : error.message === "Network Error"
        ? "Erro de conexão com o servidor"
        : "Erro ao processar sua solicitação");

    setError(message);
    log.error("[Erro na API]", message);
  };

  const validateStep = (currentStep, data) => {
    log.debug(`[Validação] Validando passo ${currentStep} com dados:`, {
      email: data.email || "vazio",
      codigo: data.code || "vazio",
      senha: data.password ? "******" : "vazio",
    });

    if (currentStep === 1 && !validateEmail(data.email || "")) {
      return "Por favor, insira um email válido";
    }

    if (
      currentStep === 2 &&
      (!data.code || data.code.length !== 6 || !/^\d+$/.test(data.code))
    ) {
      return "Por favor, insira um código de 6 dígitos";
    }

    if (currentStep === 3) {
      const passwordValidation = validatePassword(data.password || "");
      if (passwordValidation !== true) {
        return passwordValidation;
      }
    }

    return "";
  };

  const handleRequestCode = async (email) => {
    log.info(
      "[Solicitação de Código] Iniciando fluxo de redefinição para o email:",
      `${email.substring(0, 3)}...`
    );
    setLoading(true);
    setError("");

    const validationError = validateStep(1, { email });
    if (validationError) {
      log.warn("[Solicitação de Código] Validação falhou:", validationError);
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      log.debug("[Solicitação de Código] Chamando API: /user/forgot-password");
      const res = await api.post("/user/forgot-password", { email });

      log.debug("[Solicitação de Código] Resposta da API:", {
        status: res.status,
        dados: res.data,
      });

      if (res.status === 200) {
        log.info("[Solicitação de Código] Código enviado com sucesso");
        setState((prev) => ({ ...prev, email }));
        setStep(2);
      } else {
        const errorMsg = res.data?.message || "Erro desconhecido";
        log.warn("[Solicitação de Código] API retornou erro:", errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      log.error("[Solicitação de Código] Falha ao solicitar código:", err);
      handleApiError(err);
    } finally {
      setLoading(false);
      log.debug("[Solicitação de Código] Fluxo de solicitação concluído");
    }
  };

  const handleVerifyCode = async (code) => {
    log.info("[Verificação de Código] Verificando código");
    setLoading(true);
    setError("");
    setState((prev) => ({ ...prev, code }));

    const validationError = validateStep(2, { code });
    if (validationError) {
      log.warn("[Verificação de Código] Validação falhou:", validationError);
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const payload = {
        email: state.email,
        code: parseInt(code),
      };

      log.debug(
        "[Verificação de Código] Chamando API: /user/verify-reset-code com:",
        {
          email: `${payload.email.substring(0, 3)}...`,
          codigo: "******",
        }
      );

      const res = await api.post("/user/verify-reset-code", payload);

      log.debug("[Verificação de Código] Resposta da API:", {
        status: res.status,
        possuiToken: !!res.data.resetToken,
      });

      if (res.status === 200) {
        const token = res.data.resetToken;
        log.info("[Verificação de Código] Código verificado com sucesso");
        setState((prev) => ({ ...prev, token }));

        log.debug("[Verificação de Código] Armazenando token no SecureStore");
        await SecureStore.setItemAsync("resetToken", token);

        setStep(3);
      }
    } catch (err) {
      log.error("[Verificação de Código] Falha ao verificar código:", err);
      handleApiError(err);
    } finally {
      setLoading(false);
      log.debug("[Verificação de Código] Fluxo de verificação concluído");
    }
  };

  const handleNewPassword = async (newPassword) => {
    log.info("[Nova Senha] Definindo nova senha");
    setLoading(true);
    setError("");
    setState((prev) => ({ ...prev, password: newPassword }));

    const validationError = validateStep(3, { password: newPassword });
    if (validationError) {
      log.warn("[Nova Senha] Validação falhou:", validationError);
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      log.debug("[Nova Senha] Recuperando token do SecureStore");
      const token =
        (await SecureStore.getItemAsync("resetToken")) || state.token;

      log.debug("[Nova Senha] Chamando API: /user/reset-password com:", {
        email: `${state.email.substring(0, 3)}...`,
        possuiToken: !!token,
      });

      const res = await api.post("/user/reset-password", {
        resetToken: token,
        newPassword,
      });

      log.debug("[Nova Senha] Resposta da API:", {
        status: res.status,
        mensagem: res.data?.message,
      });

      if (res.status === 200) {
        log.info("[Nova Senha] Senha redefinida com sucesso");
        Toast.show({
          type: "success",
          text1: "Senha alterada com sucesso!",
        });
        router.push("/(stacks)/login");
      } else {
        const errorMsg = res.data?.message || "Erro ao redefinir senha";
        log.warn("[Nova Senha] API retornou erro:", errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      log.error("[Nova Senha] Falha ao definir nova senha:", err);
      handleApiError(err);
    } finally {
      setLoading(false);
      log.debug("[Nova Senha] Fluxo de redefinição concluído");
    }
  };

  const handleResendCode = async () => {
    log.info("[Reenvio de Código] Reenviando código para:", state.email);
    setLoading(true);
    setError("");

    if (!state.email) {
      setError("Email não encontrado");
      setLoading(false);
      return;
    }

    try {
      log.debug("[Reenvio de Código] Chamando API: /user/forgot-password");
      const res = await api.post("/user/forgot-password", {
        email: state.email,
      });

      log.debug("[Reenvio de Código] Resposta da API:", {
        status: res.status,
        dados: res.data,
      });

      if (res.status === 200) {
        log.info("[Reenvio de Código] Código reenviado com sucesso");
        Toast.show({
          type: "success",
          text1: "Código reenviado com sucesso!",
          text2: `Verifique o email ${state.email}`,
        });
      } else {
        const errorMsg = res.data?.message || "Erro ao reenviar código";
        log.warn("[Reenvio de Código] API retornou erro:", errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      log.error("[Reenvio de Código] Falha ao reenviar código:", err);
      handleApiError(err);
    } finally {
      setLoading(false);
      log.debug("[Reenvio de Código] Fluxo de reenvio concluído");
    }
  };

  React.useEffect(() => {
    log.debug("[Atualização de Estado]", {
      passo: step,
      carregando: loading,
      erro: error,
      estado: {
        email: state.email ? `${state.email.substring(0, 3)}...` : 'vazio',
        token: state.token ? '*****' : 'vazio',
        codigo: state.code ? '******' : 'vazio',
        senha: state.password ? '*****' : 'vazio'
      }
    });
  }, [step, loading, error, state]);
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {step === 1 && (
          <RequestCodeStep
            onSubmit={handleRequestCode}
            loading={loading}
            error={error}
          />
        )}

        {step === 2 && (
          <VerifyCodeStep
            email={state.email}
            onSubmit={handleVerifyCode}
            loading={loading}
            error={error}
            resendCode={handleResendCode}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <NewPasswordStep
            onSubmit={handleNewPassword}
            loading={loading}
            error={error}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;
