import React, { useContext, useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import log from "@/utils/logger";
import Icon from "react-native-vector-icons/Octicons";
import { Link, useRouter } from "expo-router";
import api from "@/services/api";
import { AuthContext } from "@/contexts/AuthContext";

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const router = useRouter();

  const validateLoginInputs = (email, password) => {
    if (!email || !password) {
      return "Todos os campos são obrigatórios.";
    }

    if (!validateEmail(email)) {
      return "Por favor, insira um e-mail válido.";
    }

    if (password.length < 6) {
      return "A senha deve ter pelo menos 6 caracteres.";
    }

    return null;
  };

  const getLoginErrorMessage = (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 400:
          return "Requisição inválida. Verifique os dados enviados.";
        case 401:
        case 404:
          return "Credenciais inválidas. Verifique seu e-mail e senha.";
        case 403:
          return "Acesso negado. Você não tem permissão para acessar este recurso.";
        case 500:
          return "Erro interno do servidor. Tente novamente mais tarde.";
        default:
          return "Erro ao realizar o login. Tente novamente.";
      }
    }

    if (error.request) {
      return "Sem resposta do servidor. Verifique sua conexão com a internet.";
    }

    return "Erro ao enviar formulário.";
  };

  const handleLogin = async () => {
    setError("");
    setSuccess("");

    const validationError = validateLoginInputs(email, password);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post("/user/login", { email, password });
      log.debug("Resposta ao tentar logar:", response.data);

      if (response.status === 200) {
        const userData = {
          id: response.data.id,
          token: response.data.token,
          email: response.data.email || email,
          role: response.role || "user",
        };

        await login(userData);
        setSuccess("Login realizado com sucesso!");
      } else {
        setError(response.message || "Erro inesperado ao realizar o login.");
      }
    } catch (error) {
      setError(getLoginErrorMessage(error));
      console.error("Erro no login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-4xl font-medium mb-4 mt-32 text-center">
        Entre com sua conta
      </Text>

      <Text className="text-2xl font-medium mb-10 text-gray-400 text-center">
        Bem-vindo de volta!
      </Text>

      <TextInput
        className="w-full bg-white border border-borderLight rounded-[14px] text-xl px-4 py-5 mb-4"
        placeholder="Email"
        placeholderTextColor="#666"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        accessibilityLabel="Campo de email"
      />

      <View className="relative mb-4">
        <TextInput
          className="w-full bg-white border border-borderLight rounded-[14px] text-xl px-4 py-5 pr-12"
          placeholder="Senha"
          placeholderTextColor="#666"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          accessibilityLabel="Campo de senha"
        />
        <TouchableOpacity
          className="absolute right-4 top-5"
          onPress={() => setShowPassword(!showPassword)}
          accessibilityLabel={showPassword ? "Ocultar senha" : "Mostrar senha"}
        >
          <Icon
            name={showPassword ? "eye" : "eye-closed"}
            size={24}
            color="#666"
          />
        </TouchableOpacity>
      </View>

      <View className="items-end mb-8">
        <Link
          href="/(stacks)/forgotPassword"
          className="text-gray-400 text-base font-medium underline"
          accessibilityRole="link"
        >
          Esqueceu a senha?
        </Link>
      </View>

      {error ? (
        <Text className="text-red-500 text-center mb-4">{error}</Text>
      ) : null}

      {success ? (
        <Text className="text-green-500 text-center mb-4">{success}</Text>
      ) : null}

      <View className="mt-40">
        <TouchableOpacity
          onPress={handleLogin}
          className="w-full bg-black p-5 rounded-full mb-8"
          disabled={isLoading}
          accessibilityRole="button"
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-center text-lg font-medium">
              Entre agora
            </Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center items-center">
          <Text className="text-gray-600">Não tem uma conta? </Text>
          <Link
            href="/(stacks)/register"
            className="text-blue-500 text-base font-medium underline"
            accessibilityRole="link"
          >
            Cadastre-se
          </Link>
        </View>
      </View>
    </View>
  );
}
