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
import CoursePicker from "@/components/register/CoursePicker";
import log from "@/utils/logger";
import api from "@/services/api";
import {
  validateEmail,
  validateCPF,
  validateRA,
  validateCourse,
  validatePassword,
} from "@/utils/validations";

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

  const formatCPF = (value) => {
    const cleanedValue = value.replace(/\D/g, "");

    if (cleanedValue.length <= 3) {
      return cleanedValue;
    } else if (cleanedValue.length <= 6) {
      return `${cleanedValue.slice(0, 3)}.${cleanedValue.slice(3)}`;
    } else if (cleanedValue.length <= 9) {
      return `${cleanedValue.slice(0, 3)}.${cleanedValue.slice(
        3,
        6
      )}.${cleanedValue.slice(6)}`;
    } else {
      return `${cleanedValue.slice(0, 3)}.${cleanedValue.slice(
        3,
        6
      )}.${cleanedValue.slice(6, 9)}-${cleanedValue.slice(9, 11)}`;
    }
  };

  const validateFields = () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.fullName) {
        newErrors.fullName = "O campo Nome Completo é obrigatório.";
      }

      const emailError = validateEmail(formData.email);
      if (emailError !== true) {
        newErrors.email = emailError;
      }

      const cpfError = validateCPF(formData.cpf);
      if (cpfError !== true) {
        newErrors.cpf = cpfError;
      }

      const passwordValidation = validatePassword(formData.password);
      if (passwordValidation !== true) {
        newErrors.password = passwordValidation;
      }
    } else if (step === 2) {
      // Validação dos campos da etapa 2 (Dados Acadêmicos)
      if (!formData.ra) {
        newErrors.ra = "O campo RA é obrigatório.";
      } else {
        const raValidation = validateRA(formData.ra);
        if (raValidation !== true) {
          newErrors.ra = raValidation;
        }
      }

      if (!formData.schoolUnit) {
        newErrors.schoolUnit = "O campo Unidade Escolar é obrigatório.";
      }

      if (!formData.course) {
        newErrors.course = "O campo Curso é obrigatório.";
      }

      if (!formData.class) {
        newErrors.class = "O campo Turma é obrigatório.";
      }
    } else if (step === 3) {
      if (!formData.verificationCode) {
        newErrors.verificationCode =
          "O campo Código de Verificação é obrigatório.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = async () => {
    if (isLoading) return;

    if (!validateFields()) {
      return;
    }

    try {
      setIsLoading(true);

      if (step === 2) {
        await sendPersonalAndAcademicData();
      } else {
        setStep(step + 1);
      }
    } catch (error) {
      log.error("Erro ao avançar para a próxima etapa:", error);
      setErrors({
        ...errors,
        general: "Erro ao processar a solicitação. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const prevStep = () => setStep(step - 1);

  const handleChange = (name, value) => {
    let formattedValue = value;

    if (name === "cpf") {
      formattedValue = formatCPF(value);
    }

    setFormData({ ...formData, [name]: formattedValue });
    setErrors({ ...errors, [name]: "" });
  };

  const sendPersonalAndAcademicData = async () => {
    try {
      setIsLoading(true);
      setErrors({});

      if (
        !formData.fullName ||
        !formData.email ||
        !formData.password ||
        !formData.cpf ||
        !formData.ra ||
        !formData.schoolUnit ||
        !formData.course ||
        !formData.class
      ) {
        setErrors({
          ...errors,
          general: "Todos os campos são obrigatórios.",
        });
        return;
      }

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

      console.log("Payload sendo enviado:", payload);

      const response = await api.post("/user/register", payload);
      log.info("Resposta do backend:", response.data);

      if (response && response.data.user && response.data.user.id) {
        log.debug("ID do usuário capturado:", response.data.user.id);
        setUserId(response.data.user.id);
        setIsCodeSent(true);
        await sendEmail();
        setStep(step + 1);
      } else {
        log.error(
          "Erro ao registrar usuário:",
          response.error || "Erro desconhecido"
        );
        setErrors({
          ...errors,
          general: response.error || "Erro ao registrar usuário.",
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
            setErrors({
              ...errors,
              general: "Erro ao enviar formulário. Tente novamente.",
            });
            break;
        }
      } else if (error.request) {
        setErrors({
          ...errors,
          general:
            "Sem resposta do servidor. Verifique sua conexão com a internet.",
        });
      } else {
        setErrors({
          ...errors,
          general: "Erro ao enviar formulário. Tente novamente.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sendEmail = async () => {
    try {
      setIsLoading(true);
      setErrors({});

      const response = await api.post("/user/send-code", {
        email: formData.email,
      });

      log.debug("Resposta do backend:", response.data);

      if (response.status == 200) {
        setSuccess("Email enviado com sucesso!");
        handleUpdateVerifyEmail(formData.email);
      } else {
        const errorMessage = response.message || "Erro ao enviar email.";
        setErrors({ ...errors, general: errorMessage });
      }
    } catch (error) {
      log.error("Erro ao enviar email:", error);

      if (error.response) {
        switch (error.response.status) {
          case 400:
            if (error.response.data.message.includes("Aguarde")) {
              setErrors({
                ...errors,
                general: error.response.data.message,
              });
            } else if (
              error.response.data.message.includes("Código inválido")
            ) {
              setErrors({
                ...errors,
                general: "Código inválido ou não encontrado.",
              });
            } else if (
              error.response.data.message.includes("O código expirou")
            ) {
              setErrors({
                ...errors,
                general: "O código expirou. Solicite um novo.",
              });
            } else {
              setErrors({
                ...errors,
                general: "Dados inválidos. Verifique o email.",
              });
            }
            break;
          case 404:
            setErrors({
              ...errors,
              general: "Usuário não encontrado. Verifique o email digitado.",
            });
            break;
          case 500:
            setErrors({
              ...errors,
              general: "Erro interno do servidor. Tente novamente mais tarde.",
            });
            break;
          default:
            setErrors({
              ...errors,
              general: "Erro ao enviar email. Tente novamente.",
            });
            break;
        }
      } else if (error.request) {
        // Erros de conexão (sem resposta do servidor)
        setErrors({
          ...errors,
          general:
            "Sem resposta do servidor. Verifique sua conexão com a internet.",
        });
      } else {
        // Erros inesperados
        setErrors({
          ...errors,
          general: "Erro ao enviar email. Tente novamente.",
        });
      }
    } finally {
      setIsLoading(false);
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
      log.debug(code);

      const response = await api.post("/user/verify-code", {
        email: formData.email,
        code: code,
      });

      log.debug("Resposta do backend:", response);

      if (response.data.message === "Conta verificada com sucesso!") {
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
            response.message || "Código inválido ou não encontrado.",
        });
      }
    } catch (error) {
      log.error("Erro ao verificar código:", error);
      if (error.response) {
        console.log("Erro na resposta:", error.response);
        setErrors({
          ...errors,
          verificationCode:
            error.response.message || "Erro ao verificar o código.",
        });
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
    <View className="flex-1 justify-center p-4 bg-white">
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

      {currentStep.fields.map((field) => {
        if (field.name === "course") {
          return (
            <CoursePicker
              key={field.name}
              selectedValue={formData.course}
              onValueChange={(value) => handleChange("course", value)}
              isValid={!errors.course}
              errorMessage={errors.course}
            />
          );
        }

        return (
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
        );
      })}

      {errors.general && (
        <Text className="text-red-500 text-center mb-4">{errors.general}</Text>
      )}

      <View className="flex-row justify-between mt-6">
        {step > 1 && (
          <TouchableOpacity
            className="bg-gray-600 py-3 px-16 rounded-full"
            onPress={prevStep}
            disabled={isLoading}
          >
            <Text className="text-white text-lg">Anterior</Text>
          </TouchableOpacity>
        )}

        {step < steps.length ? (
          <TouchableOpacity
            className="bg-black py-3 px-16 rounded-full"
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
