import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import InputField from "@/components/register/InputField";
import log from "@/utils/logger";
import { post } from "@/services/api";

const MultiStepForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    cpf: "",
    email: "",
    password: "",
    ra: "",
    schoolUnit: "",
    course: "",
    class: "",
    verificationCode: "",
  });
  const [errors, setErrors] = useState({});
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [userId, setUserId] = useState(null);
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const router = useRouter();
  const inputsRef = useRef([]);

  const steps = ["Dados Pessoais", "Dados Acadêmicos", "Verificação"];

  const stepConfig = [
    {
      title: "Dados Pessoais",
      fields: [
        { name: "fullName", placeholder: "Nome Completo", required: true },
        { name: "cpf", placeholder: "CPF", required: true },
        { name: "email", placeholder: "E-mail", required: true },
        {
          name: "password",
          placeholder: "Senha",
          secureTextEntry: true,
          required: true,
        },
      ],
    },
    {
      title: "Dados Acadêmicos",
      fields: [
        { name: "ra", placeholder: "RA (Registro Acadêmico)", required: true },
        { name: "schoolUnit", placeholder: "Unidade Escolar", required: true },
        { name: "course", placeholder: "Curso", required: true },
        { name: "class", placeholder: "Turma", required: true },
      ],
    },
    {
      title: "Verificação",
      fields: [
        {
          name: "verificationCode",
          placeholder: "Código de Verificação (6 dígitos)",
          required: true,
        },
      ],
    },
  ];

  const currentStep = stepConfig[step - 1];

  // Função para validar o formato do e-mail
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateFields = () => {
    const newErrors = {};
    currentStep.fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = "Este campo é obrigatório.";
      }
    });

    // Validação específica para o campo de e-mail
    if (
      currentStep.title === "Dados Pessoais" &&
      formData.email &&
      !validateEmail(formData.email)
    ) {
      newErrors.email = "Por favor, insira um e-mail válido.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = async () => {
    if (!validateFields()) {
      Alert.alert("Erro", "Por favor, preencha todos os campos corretamente.");
      return;
    }

    if (step === 2) {
      await sendPersonalAndAcademicData();
    } else {
      setStep(step + 1);
    }
  };

  const prevStep = () => setStep(step - 1);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const sendPersonalAndAcademicData = async () => {
    try {
      setIsLoading(true);
      setErrors({});

      const payload = {
        nome: formData.fullName,
        email: formData.email,
        password: formData.password,
        cpf: formData.cpf,
        ra: formData.ra,
        school: formData.schoolUnit,
        course: formData.course,
        userClass: formData.class,
      };

      const response = await post("/user/register", payload);

      log.info("Resposta do backend:", response);

      if (
        response.status === 200 &&
        response.data.user &&
        response.data.user.id
      ) {
        log.debug("ID do usuário capturado:", response.data.user.id);
        setUserId(response.data.user.id);
        setIsCodeSent(true);
        await sendEmail();
        setStep(step + 1);
      } else {
        log.error(
          "Erro ao registrar usuário:",
          response.data.error || "Erro desconhecido"
        );
        setErrors({
          ...errors,
          general: response.data.error || "Erro ao registrar usuário.",
        });
      }
    } catch (error) {
      log.error("Erro ao enviar formulário:", error);
      if (error.response) {
        switch (error.response.status) {
          case 400:
            setErrors({
              ...errors,
              general: "Dados inválidos. Verifique os campos.",
            });
            break;
          case 409:
            setErrors({ ...errors, general: "Usuário já cadastrado." });
            break;
          case 500:
            setErrors({
              ...errors,
              general: "Erro interno do servidor. Tente novamente mais tarde.",
            });
            break;
          default:
            setErrors({ ...errors, general: "Erro ao enviar formulário." });
            break;
        }
      } else if (error.request) {
        setErrors({
          ...errors,
          general:
            "Sem resposta do servidor. Verifique sua conexão com a internet.",
        });
      } else {
        setErrors({ ...errors, general: "Erro ao enviar formulário." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sendEmail = async () => {
    try {
      const response = await post("/user/send-code", {
        email: formData.email,
      });

      if (response.status === 200) {
        setSuccess("Email enviado com sucesso!");
        handleUpdateVerifyEmail(formData.email);
      } else {
        setErrors({ ...errors, general: "Erro ao enviar email." });
      }
    } catch (error) {
      log.error("Erro ao enviar email:", error);
      if (error.response) {
        switch (error.response.status) {
          case 400:
            setErrors({
              ...errors,
              general: "Dados inválidos. Verifique o email.",
            });
            break;
          case 500:
            setErrors({
              ...errors,
              general: "Erro interno do servidor. Tente novamente mais tarde.",
            });
            break;
          default:
            setErrors({ ...errors, general: "Erro ao enviar email." });
            break;
        }
      } else if (error.request) {
        setErrors({
          ...errors,
          general:
            "Sem resposta do servidor. Verifique sua conexão com a internet.",
        });
      } else {
        setErrors({ ...errors, general: "Erro ao enviar email." });
      }
    }
  };

  const handleUpdateVerifyEmail = (newEmail) => {
    setVerifyEmail(newEmail);
  };

  const handleVerifyCode = async () => {
    try {
      setIsLoading(true);
      setErrors({});

      const code = formData.verificationCode;

      const response = await post("/user/verify-code", {
        email: verifyEmail,
        code: code,
      });

      if (
        response.status === 200 &&
        response.data.message === "Conta verificada com sucesso!"
      ) {
        Alert.alert("Sucesso", "Cadastro concluído com sucesso!", [
          {
            text: "OK",
            onPress: () => {
              router.push("/(stacks)/pendingAccount");
            },
          },
        ]);
      } else {
        setErrors({
          ...errors,
          verificationCode:
            response.data.error || "Código inválido ou não encontrado.",
        });
      }
    } catch (error) {
      log.error("Erro ao verificar código:", error);
      if (error.response) {
        switch (error.response.status) {
          case 400:
            setErrors({ ...errors, verificationCode: "Código inválido." });
            break;
          case 404:
            setErrors({
              ...errors,
              verificationCode: "Código não encontrado.",
            });
            break;
          case 500:
            setErrors({
              ...errors,
              verificationCode:
                "Erro interno do servidor. Tente novamente mais tarde.",
            });
            break;
          default:
            setErrors({
              ...errors,
              verificationCode: "Erro ao verificar o código.",
            });
            break;
        }
      } else if (error.request) {
        setErrors({
          ...errors,
          verificationCode:
            "Sem resposta do servidor. Verifique sua conexão com a internet.",
        });
      } else {
        setErrors({
          ...errors,
          verificationCode: "Erro ao verificar o código.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center p-4 bg-gray-100">
      <Text className="text-4xl font-medium mb-12 text-center">
        Crie sua conta!
      </Text>
      <Text className="text-2xl font-semibold mb-4 text-center">
        {currentStep.title}
      </Text>
      <View className="flex-row justify-between mb-6">
        {steps.map((label, index) => (
          <View key={index} className="flex-1 items-center">
            <View
              className={`w-[70%] h-2 ${
                index < step ? "bg-black" : "bg-gray-300"
              } rounded-full`}
            />
          </View>
        ))}
      </View>

      {currentStep.fields.map((field) => (
        <InputField
          key={field.name}
          placeholder={field.placeholder}
          value={formData[field.name] || ""}
          onChangeText={(text) => handleChange(field.name, text)}
          secureTextEntry={field.secureTextEntry}
          email={formData.email}
          isValid={!errors[field.name]}
          errorMessage={errors[field.name]}
        />
      ))}

      {errors.general && (
        <Text className="text-red-500 text-center mb-4">{errors.general}</Text>
      )}

      <View className="flex-row justify-between mt-6">
        {step > 1 && (
          <TouchableOpacity
            className="bg-gray-600 py-3 px-16 rounded-[14]"
            onPress={prevStep}
            disabled={isLoading}
          >
            <Text className="text-white text-lg">Anterior</Text>
          </TouchableOpacity>
        )}

        {step < steps.length ? (
          <TouchableOpacity
            className="bg-black py-3 px-16 rounded-[14]"
            onPress={nextStep}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white text-lg">Próximo</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="bg-green-600 py-3 px-16 rounded-[14]"
            onPress={handleVerifyCode}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white text-lg">Verificar Código</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default MultiStepForm;
