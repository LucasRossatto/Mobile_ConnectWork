import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, TextInput } from "react-native";
import Icon from "react-native-vector-icons/Octicons";

const InputField = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  email, // Nova prop para receber o e-mail
}) => {
  const [showPassword, setShowPassword] = useState(!secureTextEntry);

  const handleDigitChange = (text, index) => {
    const newValue = value.split("");
    newValue[index] = text;
    onChangeText(newValue.join(""));
  };

  if (placeholder.includes("Código")) {
    return (
      <>
        <Text className="text-lg mb-4">
          Digite o código de verificação enviado para o seu e-mail: <Text className="font-bold">{email}</Text>
        </Text>

        <View className="flex-row justify-between mb-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <TextInput
              key={index}
              className="w-[15%] h-16 border border-black rounded text-center text-lg"
              placeholder="-"
              value={value[index] || ""}
              onChangeText={(text) => handleDigitChange(text, index)}
              keyboardType="numeric"
              maxLength={1}
            />
          ))}
        </View>
      </>
    );
  }

  return (
    <View className="relative mb-4">
      <TextInput
        className="w-full bg-white border border-gray-300 rounded-2xl text-xl px-4 py-5"
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!showPassword && secureTextEntry}
        keyboardType={placeholder.includes("Código") ? "numeric" : "default"}
        maxLength={placeholder.includes("Código") ? 6 : undefined}
      />
      {secureTextEntry && (
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
      )}
    </View>
  );
};

export default function MultiStepForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});

  const steps = ["Dados Pessoais", "Dados Acadêmicos", "Verificação"];

  const stepConfig = [
    {
      title: "Dados Pessoais",
      fields: [
        { name: "fullName", placeholder: "Nome Completo" },
        { name: "cpf", placeholder: "CPF" },
        { name: "email", placeholder: "E-mail" },
        { name: "password", placeholder: "Senha", secureTextEntry: true },
      ],
    },
    {
      title: "Dados Acadêmicos",
      fields: [
        { name: "ra", placeholder: "RA (Registro Acadêmico)" },
        { name: "schoolUnit", placeholder: "Unidade Escolar" },
        { name: "course", placeholder: "Curso" },
        { name: "class", placeholder: "Turma" },
      ],
    },
    {
      title: "Verificação",
      fields: [
        {
          name: "verificationCode",
          placeholder: "Código de Verificação (6 dígitos)",
        },
      ],
    },
  ];

  const currentStep = stepConfig[step - 1];

  const nextStep = () => {
    if (currentStep.fields.some((field) => !formData[field.name])) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const submitForm = () => {
    if (!formData.verificationCode || formData.verificationCode.length !== 6) {
      Alert.alert("Erro", "O código de verificação deve ter 6 dígitos.");
      return;
    }
    Alert.alert("Sucesso", "Cadastro concluído com sucesso!", [
      { text: "OK", onPress: () => console.log("Dados enviados:", formData) },
    ]);
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
            {/** Mostra as etapas em cima das barrinhas
             * <Text className="text-sm font-medium mt-2">{label}</Text> */}
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
          email={formData.email} // Passando o e-mail como prop
        />
      ))}

      <View className="flex-row justify-between mt-6">
        {step > 1 && (
          <TouchableOpacity
            className="bg-gray-600 py-3 px-16 rounded-[14]"
            onPress={prevStep}
          >
            <Text className="text-white text-lg">Anterior</Text>
          </TouchableOpacity>
        )}

        {step < steps.length ? (
          <TouchableOpacity
            className="bg-black py-3 px-16 rounded-[14] "
            onPress={nextStep}
          >
            <Text className="text-white text-lg">Próximo</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="bg-green-600 py-3 px-10 rounded-[14]"
            onPress={submitForm}
          >
            <Text className="text-white text-lg">Verificar código</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}