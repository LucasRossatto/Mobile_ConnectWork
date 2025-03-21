import React from "react";
import { Picker } from "@react-native-picker/picker";
import { View, Text } from "react-native";

const CoursePicker = ({
  selectedValue,
  onValueChange,
  isValid,
  errorMessage,
}) => {
  const validCourses = [
    "Desenvolvimento de sistemas",
    "Administração",
    "Logistica",
    "Eletromecânica",
  ];

  return (
    <View className="mb-4">
      <View
        className={`w-full bg-white border ${
          isValid ? "border-gray-300" : "border-red-500"
        } rounded-2xl text-xl px-4 py-1`}
      >
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={{
            fontSize: 16,
          }}
        >
          <Picker.Item
            label="Selecione um curso"
            className="text-gray-300"
            value=""
          />
          {validCourses.map((course, index) => (
            <Picker.Item key={index} label={course} value={course} />
          ))}
        </Picker>
      </View>
      {errorMessage && (
        <Text className="text-red-500 text-sm mt-2">{errorMessage}</Text>
      )}
    </View>
  );
};

export default CoursePicker;
