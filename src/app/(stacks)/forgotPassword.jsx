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
  const [step, setStep] = useState(1);
  const [state, setState] = useState({
    email: "",
    token: "",
    code: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleApiError = (error) => {
    log.debug("[handleApiError] Error details:", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      responseData: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
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
    log.error("[API Error]", message);
  };

  const validateStep = (currentStep, data) => {
    log.debug(`[validateStep] Validating step ${currentStep} with data:`, {
      email: data.email ? "******" : "empty",
      code: data.code ? "******" : "empty",
      password: data.password ? "******" : "empty",
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
      "[handleRequestCode] Starting password reset flow for email:",
      `${email.substring(0, 3)}...`
    );
    setLoading(true);
    setError("");

    const validationError = validateStep(1, { email });
    if (validationError) {
      log.warn("[handleRequestCode] Validation failed:", validationError);
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      log.debug("[handleRequestCode] Calling API: /user/forgot-password");
      const res = await api.post("/user/forgot-password", { email });

      log.debug("[handleRequestCode] API response:", {
        status: res.status,
        data: res.data,
      });

      if (res.status === 200) {
        log.info("[handleRequestCode] Code sent successfully");
        setState((prev) => ({ ...prev, email }));
        setStep(2);
      } else {
        const errorMsg = res.data?.message || "Erro desconhecido";
        log.warn("[handleRequestCode] API returned error:", errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      log.error("[handleRequestCode] Failed to request code:", err);
      handleApiError(err);
    } finally {
      setLoading(false);
      log.debug("[handleRequestCode] Finished request code flow");
    }
  };

  const handleVerifyCode = async (code) => {
    log.info("[handleVerifyCode] Verifying code");
    setLoading(true);
    setError("");
    setState((prev) => ({ ...prev, code }));

    const validationError = validateStep(2, { code });
    if (validationError) {
      log.warn("[handleVerifyCode] Code validation failed:", validationError);
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
        "[handleVerifyCode] Calling API: /user/verify-reset-code with payload:",
        {
          email: `${payload.email.substring(0, 3)}...`,
          code: "******",
        }
      );

      const res = await api.post("/user/verify-reset-code", payload);

      log.debug("[handleVerifyCode] API response:", {
        status: res.status,
        hasToken: !!res.data.resetToken,
      });

      if (res.status === 200) {
        const token = res.data.resetToken;
        log.info("[handleVerifyCode] Code verified successfully");
        setState((prev) => ({ ...prev, token }));

        log.debug("[handleVerifyCode] Storing token in SecureStore");
        await SecureStore.setItemAsync("resetToken", token);

        setStep(3);
      }
    } catch (err) {
      log.error("[handleVerifyCode] Failed to verify code:", err);
      handleApiError(err);
    } finally {
      setLoading(false);
      log.debug("[handleVerifyCode] Finished verification flow");
    }
  };

  const handleNewPassword = async (newPassword) => {
    log.info("[handleNewPassword] Setting new password");
    setLoading(true);
    setError("");
    setState((prev) => ({ ...prev, password: newPassword }));

    const validationError = validateStep(3, { password: newPassword });
    if (validationError) {
      log.warn(
        "[handleNewPassword] Password validation failed:",
        validationError
      );
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      log.debug("[handleNewPassword] Retrieving token from SecureStore");
      const token =
        (await SecureStore.getItemAsync("resetToken")) || state.token;

      log.debug("[handleNewPassword] Calling API: /user/reset-password with:", {
        email: `${state.email.substring(0, 3)}...`,
        hasToken: !!token,
      });

      const res = await api.post("/user/reset-password", {
        resetToken: token,
        newPassword,
      });
      resizeTo;
      log.debug("[handleNewPassword] API response:", {
        status: res.status,
        message: res.data?.message,
      });

      if (res.status === 200) {
        log.info("[handleNewPassword] Password reset successfully");
        Toast.show({
          type: "success",
          text1: "Senha alterada com sucesso!",
        });
        router.push("/(stacks)/login");
      } else {
        const errorMsg = res.data?.message || "Erro ao redefinir senha";
        log.warn("[handleNewPassword] API returned error:", errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      log.error("[handleNewPassword] Failed to set new password:", err);
      handleApiError(err);
    } finally {
      setLoading(false);
      log.debug("[handleNewPassword] Finished password reset flow");
    }
  };

  const handleResendCode = async () => {
    log.info("[handleResendCode] Resending code to email:", state.email);
    setLoading(true);
    setError("");

    if (!state.email) {
      setError("Email não encontrado");
      setLoading(false);
      return;
    }

    try {
      log.debug("[handleResendCode] Calling API: /user/forgot-password");
      const res = await api.post("/user/forgot-password", {
        email: state.email,
      });

      log.debug("[handleResendCode] API response:", {
        status: res.status,
        data: res.data,
      });

      if (res.status === 200) {
        log.info("[handleResendCode] Code resent successfully");
        Toast.show({
          type: "success",
          text1: "Código reenviado com sucesso!",
          text2: `Verifique o email ${state.email}`,
        });
      } else {
        const errorMsg = res.data?.message || "Erro ao reenviar código";
        log.warn("[handleResendCode] API returned error:", errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      log.error("[handleResendCode] Failed to resend code:", err);
      handleApiError(err);
    } finally {
      setLoading(false);
      log.debug("[handleResendCode] Finished resend code flow");
    }
  };

  React.useEffect(() => {
    log.debug("[State Update - Dados Completos]", {
      step,
      loading,
      error,
      state: {
        email: state.email ? `${state.email.substring(0, 3)}...` : "empty",
        token: state.token ? `${state.token.substring(0, 3)}...` : "empty",
        code: state.code ? `${state.code.substring(0, 3)}...` : "empty",
        password: state.password
          ? `${state.password.substring(0, 3)}...`
          : "empty",
      },
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
