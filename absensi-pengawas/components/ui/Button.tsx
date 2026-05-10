import { Pressable, Text } from 'react-native';

type ButtonProps = {
  label: string;
  onPress?: () => void;
};

export function Button({ label, onPress }: ButtonProps) {
  return (
    <Pressable className="rounded-lg bg-blue-600 px-4 py-3" onPress={onPress}>
      <Text className="text-center font-semibold text-white">{label}</Text>
    </Pressable>
  );
}
