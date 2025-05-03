import { TouchableOpacity, Text } from "react-native";

export default function ActionButton({
  text,
  onPress,
  disabled = false,
  variant = "primary",
}) {
  const variantStyles = {
    primary: "bg-black",
    secondary: "bg-gray-100",
    disabled: "bg-gray-400",
    delete: "bg-red-100",
  };

  const textStyles = {
    primary: "text-white",
    secondary: "text-black",
    disabled: "text-white",
    delete: "text-red-600",
  };

  return (
    <TouchableOpacity
      className={`py-4 px-4 rounded-full ${
        disabled ? variantStyles.disabled : variantStyles[variant]
      }`}
      onPress={onPress}
      disabled={disabled}
    >
      <Text
        className={`${
          disabled ? textStyles.disabled : textStyles[variant]
        } text-center font-bold`}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}
