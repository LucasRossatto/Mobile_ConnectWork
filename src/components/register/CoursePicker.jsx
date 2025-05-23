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
    "Logística",
    "Eletromecânica"
  ];

  return (
    <View className="mb-4">
      <View
        className={`w-full bg-white border ${
          isValid ? "border-gray-300" : "border-red-500"
        } rounded-2xl text-base`}
      >
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={{
            fontSize: 16,
            color: "#666666",
          }}
        >
          <Picker.Item
            label="Selecione um curso"
            style={{
              fontSize: 16,
              color: "#666666",
            }}
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
