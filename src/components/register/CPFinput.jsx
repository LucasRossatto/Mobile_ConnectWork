import React, { useState } from "react";
import { View, TextInput, Text } from "react-native";

const CPFInput = () => {
  const [cpf, setCpf] = useState("");

  const handleKeyPress = (e) => {
    const { key } = e.nativeEvent;
    let newValue = cpf;

    if (key === "Backspace") {
      newValue = newValue.slice(0, -1);
    } else if (/\d/.test(key)) {
      newValue = formatCPF(newValue + key);
    }

    setCpf(newValue);
  };

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

  return (
    <View>
      <TextInput
        placeholder="CPF"
        value={cpf}
        onKeyPress={handleKeyPress}
        keyboardType="numeric"
        maxLength={14}
      />
      <Text>CPF formatado: {cpf}</Text>
    </View>
  );
};

export default CPFInput;
