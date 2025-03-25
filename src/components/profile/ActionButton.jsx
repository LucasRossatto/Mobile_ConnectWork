import { TouchableOpacity, Text } from 'react-native';

export default function ActionButton({
  text,
  onPress,
  disabled = false,
  variant = 'primary',
}) {
  const variantStyles = {
    primary: 'bg-black',
    secondary: 'bg-gray-200',
    disabled: 'bg-gray-400',
  };

  const textStyles = {
    primary: 'text-white',
    secondary: 'text-black',
    disabled: 'text-white',
  };

  return (
    <TouchableOpacity
      className={`py-3 px-6 rounded-md ${
        disabled ? variantStyles.disabled : variantStyles[variant]
      }`}
      onPress={onPress}
      disabled={disabled}
    >
      <Text className={disabled ? textStyles.disabled : textStyles[variant]}>
        {text}
      </Text>
    </TouchableOpacity>
  );
}