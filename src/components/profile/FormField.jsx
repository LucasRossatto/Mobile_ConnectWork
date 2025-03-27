import { View, Text, TextInput } from "react-native";

export default function FormField({
  label,
  value,
  onChangeText,
  inputMode,
  error,
  placeholder,
  required = false,
  multiline = false,
  ...props
}) {
  return (
    <View>
      <Text className="text-lg font-medium mb-2">
        {label} {required && "*"}
      </Text>
      <TextInput
        className={`w-full border mb-1 ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-md py-4 px-3 text-base ${
          multiline ? "h-34 text-align-top" : ""
        }`}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        {...props}
      />
      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
    </View>
  );
}
