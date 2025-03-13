import React, { useContext, useState } from "react";
import { Text, View, TextInput, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Octicons";
import { Link, useRouter } from "expo-router";
import { post } from "@/services/api";
import { AuthContext } from "@/contexts/AuthProvider";
import log from "@/utils/logger";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const { login } = useContext(AuthContext);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Todos os campos são obrigatórios.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Por favor, insira um e-mail válido.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    const formData = {
      email: email,
      password: password,
    };

    try {
      const response = await post("/user/login", formData);

      if ((response.message = "Login bem-sucedido!")) {
        const userData = response;
        log.info(response);
        if (userData.id && userData.token) {
          login({ id: userData.id, token: userData.token });
          setSuccess("Login realizado com sucesso!");
          log.debug("adicionado ao contexto");
        } else {
          setError("Erro ao processar os dados do usuário.");
        }
      } else {
        setError("Erro inesperado ao realizar o login.");
      }
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 400:
            setError("Requisição inválida. Verifique os dados enviados.");
            break;
          case 401:
            setError("Credenciais inválidas. Verifique seu e-mail e senha.");
            break;
          case 403:
            setError(
              "Acesso negado. Você não tem permissão para acessar este recurso."
            );
            break;
          case 404:
            setError("Credenciais inválidas. Verifique seu e-mail e senha.");
            break;
          case 500:
            setError("Erro interno do servidor. Tente novamente mais tarde.");
            break;
          default:
            setError("Erro ao realizar o login. Tente novamente.");
            break;
        }
      } else if (error.request) {
        setError(
          "Sem resposta do servidor. Verifique sua conexão com a internet."
        );
      } else {
        setError("Erro ao enviar formulário.");
      }
    }
  };

  return (
    <View className="flex-1 flex justify-center bg-backgroundLight p-4">
      <Text className="text-4xl font-medium mb-10 text-center">
        Faça o seu login
      </Text>

      <TextInput
        className="w-full bg-white border border-borderLight rounded-[14] text-xl px-4 py-5 mb-4"
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />

      <View className="relative mb-4">
        <TextInput
          className="w-full bg-white border border-borderLight rounded-[14] text-xl px-4 py-5 pr-12"
          placeholder="Senha"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
        <TouchableOpacity
          className="absolute right-4 top-5"
          onPress={() => setShowPassword(!showPassword)}
        >
          <Icon
            name={showPassword ? "eye" : "eye-closed"}
            size={24}
            color="#666666"
          />
        </TouchableOpacity>
      </View>

      <View className="flex justify-end items-end mb-14">
        <Link
          href={"/(stacks)/register"}
          className="text-gray-400 text-base font-medium underline flex"
        >
          Esqueceu a senha?
        </Link>
      </View>

      <TouchableOpacity
        onPress={handleLogin}
        className="border w-full bg-black text-white p-5 rounded-[14] text-center text-lg font-medium mb-8"
      >
        <Text className="text-white text-center text-lg font-medium">
          Entre agora
        </Text>
      </TouchableOpacity>

      {error ? (
        <Text className="text-red-500 text-center mb-4">{error}</Text>
      ) : null}
      {success ? (
        <Text className="text-green-500 text-center mb-4">{success}</Text>
      ) : null}

      <View className="flex-row flex justify-center items-center">
        <Text className="text-gray-600">Não tem uma conta? </Text>
        <Link
          href={"/(stack)/register"}
          className="text-blue-500 text-base font-medium underline"
        >
          Cadastre-se
        </Link>
      </View>
    </View>
  );
}
