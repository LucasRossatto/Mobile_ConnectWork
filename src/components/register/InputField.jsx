import React, { useRef, useState, useCallback } from "react";
import { View, TextInput, TouchableOpacity, Text } from "react-native";
import Icon from "react-native-vector-icons/Octicons";

const DIGITS_LENGTH = 6;

const VerificationCodeInput = ({ 
  email, 
  value = "", 
  onChangeText, 
  isValid = true, 
  errorMessage 
}) => {
  const inputsRef = useRef([]);
  const [focusedIndex, setFocusedIndex] = useState(null);

  const handleCodeChange = useCallback((text, index) => {
    if (/^\d$/.test(text) || text === "") {
      const newValue = value.split("");
      newValue[index] = text;
      onChangeText(newValue.join(""));

      if (text !== "" && index < DIGITS_LENGTH - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    }
  }, [value, onChangeText]);

  const handleKeyPress = useCallback(({ nativeEvent }, index) => {
    if (nativeEvent.key === "Backspace" && value[index] === "" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }, [value]);

  return (
    <>
      <Text className="text-lg mb-4">
        Digite o código de verificação enviado para o seu e-mail:{" "}
        <Text className="font-bold">{email}</Text>
      </Text>
      <View className="flex-row justify-between mb-4" accessibilityRole="group">
        {Array.from({ length: DIGITS_LENGTH }).map((_, index) => (
          <TextInput
            key={index}
            ref={(el) => (inputsRef.current[index] = el)}
            className={`w-[15%] h-16 border ${
              focusedIndex === index 
                ? "border-blue-500 border-2" 
                : isValid 
                  ? "border-gray-400" 
                  : "border-red-500"
            } rounded-lg text-center text-lg`}
            placeholder="-"
            value={value[index] || ""}
            onChangeText={(text) => handleCodeChange(text, index)}
            keyboardType="number-pad"
            maxLength={1}
            onKeyPress={({ nativeEvent }) => handleKeyPress({ nativeEvent }, index)}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(null)}
            accessibilityLabel={`Dígito ${index + 1} do código de verificação`}
            selectTextOnFocus
          />
        ))}
      </View>
      {errorMessage && (
        <Text className="text-red-500 text-sm mt-2">{errorMessage}</Text>
      )}
    </>
  );
};

const RegularInput = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  isValid = true,
  errorMessage,
}) => {
  const [showPassword, setShowPassword] = useState(!secureTextEntry);

  return (
    <View className="relative mb-4">
      <TextInput
        className={`w-full bg-white border ${
          isValid ? "border-gray-300" : "border-red-500"
        } rounded-2xl text-xl px-4 py-5`}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!showPassword && secureTextEntry}
        keyboardType={placeholder.includes("Código") ? "numeric" : "default"}
      />

      {secureTextEntry && (
        <TouchableOpacity
          className="absolute right-4 top-5"
          onPress={() => setShowPassword(!showPassword)}
          accessibilityLabel={showPassword ? "Ocultar senha" : "Mostrar senha"}
        >
          <Icon
            name={showPassword ? "eye" : "eye-closed"}
            size={24}
            color="#666666"
          />
        </TouchableOpacity>
      )}

      {errorMessage && (
        <Text className="text-red-500 text-sm mt-2 ml-2">{errorMessage}</Text>
      )}
    </View>
  );
};

const InputField = (props) => {
  if (props.placeholder?.includes("Código")) {
    return <VerificationCodeInput {...props} />;
  }
  return <RegularInput {...props} />;
};

export default InputField;