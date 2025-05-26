import React, { useState, useRef, useCallback } from "react";
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
import { validateEmail, validateCPF, validateRA } from "@/utils/validations";
import Icon from "react-native-vector-icons/Feather";

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

  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });
  const [errors, setErrors] = useState({});
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [userId, setUserId] = useState(null);
  const [success, setSuccess] = useState("");
  const [verifyEmail, setVerifyEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const inputsRef = useRef([]);

  const RequirementItem = ({ met, text }) => (
    <View className="flex-row items-center">
      <Icon
        name={met ? "check-circle" : "x-circle"}
        size={16}
        color={met ? "#10B981" : "#9CA3AF"}
        style={{ marginRight: 8 }}
      />
      <Text className={`text-xs ${met ? "text-green-600" : "text-gray-500"}`}>
        {text}
      </Text>
    </View>
  );

  const validatePassword = useCallback((password) => {
    const validation = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
    setPasswordRequirements(validation);
    return Object.values(validation).every((req) => req);
  }, []);

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
          required: true},
      ],
    },
  ];

  const currentStep = stepConfig[step - 1];

  const formatCPF = useCallback((value) => {
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
  }, []);

  const validateFields = useCallback(() => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = "Nome completo é obrigatório.";
      }

      const emailError = validateEmail(formData.email);
      if (emailError !== true) {
        newErrors.email = emailError;
      }

      const cpfError = validateCPF(formData.cpf.replace(/\D/g, ""));
      if (cpfError !== true) {
        newErrors.cpf = cpfError;
      }

      const passwordValidation = validatePassword(formData.password);
      if (passwordValidation !== true) {
        newErrors.password = passwordValidation;
      }
    } else if (step === 2) {
      if (!formData.ra.trim()) {
        newErrors.ra = "O campo RA é obrigatório.";
      } else {
        const raValidation = validateRA(formData.ra);
        if (raValidation !== true) {
          newErrors.ra = raValidation;
        }
      }

      if (!formData.schoolUnit.trim()) {
        newErrors.schoolUnit = "O campo Unidade Escolar é obrigatório.";
      }

      if (!formData.course.trim()) {
        newErrors.course = "O campo Curso é obrigatório.";
      }

      if (!formData.class.trim()) {
        newErrors.class = "O campo Turma é obrigatório.";
      }
    } else if (step === 3) {
      if (!formData.verificationCode.trim()) {
        newErrors.verificationCode =
          "O campo Código de Verificação é obrigatório.";
      } else if (formData.verificationCode.length !== 6) {
        newErrors.verificationCode = "O código deve ter 6 dígitos.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [step, formData]);

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

  const handleChange = useCallback(
    (name, value) => {
      let formattedValue = value;

      if (name === "cpf") {
        formattedValue = formatCPF(value);
      }

      setFormData((prev) => ({ ...prev, [name]: formattedValue }));
      setErrors((prev) => ({ ...prev, [name]: "" }));

      if (name === "password") {
        validatePassword(value);
      }
    },
    [formatCPF, validatePassword]
  );

  const sendPersonalAndAcademicData = async () => {
    try {
      setIsLoading(true);
      setErrors({});

      const payload = {
        nome: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        cpf: formData.cpf.replace(/\D/g, ""),
        ra: formData.ra.trim(),
        school: formData.schoolUnit.trim(),
        course: formData.course.trim(),
        userClass: formData.class.trim(),
      };

      const response = await api.post("/user/register", payload);
      log.info("Resposta do backend:", response.data);

      if (response?.data?.user?.id) {
        log.debug("ID do usuário capturado:", response.data.user.id);
        setUserId(response.data.user.id);
        setIsCodeSent(true);
        await sendEmail();
        setStep(step + 1);
      } else {
        log.error("Erro ao registrar usuário:", response.error);
        setErrors({
          ...errors,
          general: response.error || "Erro ao registrar usuário.",
        });
      }
    } catch (error) {
      log.error("Erro ao enviar formulário:", error);
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiError = useCallback((error) => {
    if (error.response) {
      switch (error.response.status) {
        case 400:
          setErrors((prev) => ({
            ...prev,
            general: "Dados inválidos. Verifique os campos.",
          }));
          break;

        case 500:
          setErrors((prev) => ({
            ...prev,
            general: "Erro interno do servidor. Tente novamente mais tarde.",
          }));
          break;
        default:
          setErrors((prev) => ({
            ...prev,
            general: "Erro ao enviar formulário. Tente novamente.",
          }));
          break;
      }
    } else if (error.request) {
      setErrors((prev) => ({
        ...prev,
        general: "Sem resposta do servidor. Verifique sua conexão.",
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        general: "Erro ao enviar formulário. Tente novamente.",
      }));
    }
  }, []);

  const sendEmail = async () => {
    try {
      setIsLoading(true);
      setErrors({});

      const response = await api.post("/user/send-code", {
        email: formData.email.trim(),
      });

      log.debug("Resposta do backend:", response.data);

      if (response.status === 200) {
        setSuccess("Email enviado com sucesso!");
        handleUpdateVerifyEmail(formData.email);
      } else {
        const errorMessage = response.message || "Erro ao enviar email.";
        setErrors((prev) => ({ ...prev, general: errorMessage }));
      }
    } catch (error) {
      log.error("Erro ao enviar email:", error);
      handleEmailError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailError = useCallback((error) => {
    if (error.response) {
      switch (error.response.status) {
        case 400:
          if (error.response.data.message.includes("Aguarde")) {
            setErrors((prev) => ({
              ...prev,
              general: error.response.data.message,
            }));
          } else if (error.response.data.message.includes("Código inválido")) {
            setErrors((prev) => ({
              ...prev,
              general: "Código inválido ou não encontrado.",
            }));
          } else if (error.response.data.message.includes("O código expirou")) {
            setErrors((prev) => ({
              ...prev,
              general: "O código expirou. Solicite um novo.",
            }));
          } else {
            setErrors((prev) => ({
              ...prev,
              general: "Dados inválidos. Verifique o email.",
            }));
          }
          break;
        case 404:
          setErrors((prev) => ({
            ...prev,
            general: "Usuário não encontrado. Verifique o email digitado.",
          }));
          break;
        case 500:
          setErrors((prev) => ({
            ...prev,
            general: "Erro interno do servidor. Tente novamente mais tarde.",
          }));
          break;
        default:
          setErrors((prev) => ({
            ...prev,
            general: "Erro ao enviar email. Tente novamente.",
          }));
          break;
      }
    } else if (error.request) {
      setErrors((prev) => ({
        ...prev,
        general: "Sem resposta do servidor. Verifique sua conexão.",
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        general: "Erro ao enviar email. Tente novamente.",
      }));
    }
  }, []);

  const handleUpdateVerifyEmail = useCallback((newEmail) => {
    setVerifyEmail(newEmail);
  }, []);

  const handleVerifyCode = async () => {
    try {
      setIsLoading(true);
      setErrors({});

      const response = await api.post("/user/verify-code", {
        email: formData.email.trim(),
        code: formData.verificationCode,
      });

      log.debug("Resposta do backend:", response);

      if (response.data.message === "Conta verificada com sucesso!") {
        Alert.alert("Sucesso", "Cadastro concluído com sucesso!", [
          {
            text: "OK",
            onPress: () => router.push("/pendingAccount"),
          },
        ]);
      } else {
        setErrors((prev) => ({
          ...prev,
          verificationCode: response.message || "Código inválido.",
        }));
      }
    } catch (error) {
      log.error("Erro ao verificar código:", error);
      handleCodeVerificationError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeVerificationError = useCallback((error) => {
    if (error.response) {
      setErrors((prev) => ({
        ...prev,
        verificationCode:
          error.response.message || "Erro ao verificar o código.",
      }));
    } else if (error.request) {
      setErrors((prev) => ({
        ...prev,
        verificationCode: "Sem resposta do servidor. Verifique sua conexão.",
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        verificationCode: "Erro ao verificar o código.",
      }));
    }
  }, []);

  const renderField = useCallback(
    (field) => {
      if (field.name === "password") {
        return (
          <View key={field.name} className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              {field.placeholder} *
            </Text>

            <InputField
              placeholder={field.placeholder}
              value={formData[field.name]}
              onChangeText={(text) => handleChange(field.name, text)}
              secureTextEntry={field.secureTextEntry}
              isValid={!errors[field.name]}
              errorMessage={errors[field.name]}
            />

            {/* Visualização dos requisitos da senha */}
            <View className="bg-white-50 rounded-lg p-3 border border-gray-300">
              <Text className="text-black text-sm font-medium mb-2">
                Sua senha deve conter:
              </Text>
              <View className="ml-">
                <RequirementItem
                  met={passwordRequirements.length}
                  text="Pelo menos 8 caracteres"
                />
                <RequirementItem
                  met={passwordRequirements.uppercase}
                  text="1 letra maiúscula (A-Z)"
                />
                <RequirementItem
                  met={passwordRequirements.lowercase}
                  text="1 letra minúscula (a-z)"
                />
                <RequirementItem
                  met={passwordRequirements.number}
                  text="1 número (0-9)"
                />
                <RequirementItem
                  met={passwordRequirements.specialChar}
                  text="1 caractere especial (@$!%*?&)"
                />
              </View>
            </View>
          </View>
        );
      }

      if (field.name === "course") {
        return (
          <View>
            <Text className="text-xs font-medium text-gray-700 mb-1">
              {field.placeholder} *
            </Text>
            <CoursePicker
              key={field.name}
              selectedValue={formData.course}
              onValueChange={(value) => handleChange("course", value)}
              isValid={!errors.course}
              errorMessage={errors.course}
            />
          </View>
        );
      }

      return (
        <View key={field.name}>
          <Text className="text-xs font-medium text-gray-700 mb-1">
            {field.placeholder} *
          </Text>
          <InputField
            placeholder={field.placeholder}
            value={formData[field.name]}
            onChangeText={(text) => handleChange(field.name, text)}
            secureTextEntry={field.secureTextEntry}
            email={
              field.name === "verificationCode" ? formData.email : undefined
            }
            isValid={!errors[field.name]}
            errorMessage={errors[field.name]}
            keyboardType={
              field.name === "email"
                ? "email-address"
                : field.name === "cpf" ||
                  field.name === "ra" ||
                  field.name === "verificationCode"
                ? "numeric"
                : "default"
            }
            autoCapitalize={
              field.name === "fullName" || field.name === "schoolUnit"
                ? "words"
                : "none"
            }
            autoCorrect={false}
          />
        </View>
      );
    },
    [formData, errors, handleChange]
  );

  return (
    <View className="flex-1 justify-center p-4 bg-white">
      <Text className="text-3xl font-medium mb-4 text-center">
        Crie sua conta
      </Text>

      <View className="mb-6 px-4">
        <View className="flex-row justify-between relative">
          {/* Linha de fundo */}
          <View className="absolute h-0.5 bg-gray-200 top-1 left-0 right-0 mx-[15%]" />
          {steps.map((label, index) => (
            <View
              key={`step-${index}-${label}`}
              className="flex-1 items-center z-10"
            >
              {/* Etapa (bolinha + linha) */}
              <View className="flex-row items-center">
                {/* Linha conectora (antes da bolinha) */}
                {index > 0 && (
                  <View
                    className={`h-0.5 flex-1 ${
                      index < step ? "bg-black" : "bg-gray-300"
                    }`}
                  />
                )}

                {/* Bolinha da etapa */}
                <View
                  className={`w-4 h-4 rounded-full ${
                    index < step
                      ? "bg-black border-2 border-black"
                      : index === step - 1
                      ? "bg-white border-2 border-black"
                      : "bg-white border-2 border-gray-300"
                  }`}
                >
                  {index < step - 1 && (
                    <Icon
                      name="check"
                      size={12}
                      color="white"
                      className="m-auto"
                    />
                  )}
                </View>

                {/* Linha  (depois da bolinha) */}
                {index < steps.length - 1 && (
                  <View
                    className={`h-0.5 flex-1 ${
                      index < step - 1 ? "bg-black" : "bg-gray-300"
                    }`}
                  />
                )}
              </View>

              <Text
                className={`text-sm mt-2 font-medium ${
                  index < step ? "text-black" : "text-gray-500"
                }`}
                numberOfLines={1}
              >
                {label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {currentStep.fields.map(renderField)}

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
            className="bg-green-600 py-3 px-12 rounded-full"
            onPress={handleVerifyCode}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white text-lg">Verificar</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default MultiStepForm;
