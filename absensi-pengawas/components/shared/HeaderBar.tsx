import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type HeaderBarProps = {
  title: string;
  subtitle?: string;
};

export function HeaderBar({ title, subtitle }: HeaderBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="border-b border-slate-200 bg-white px-4 pb-4"
      style={{ paddingTop: insets.top + 8 }}
    >
      <Text className="text-xl font-bold text-slate-900">{title}</Text>
      {subtitle ? <Text className="mt-0.5 text-sm text-slate-500">{subtitle}</Text> : null}
    </View>
  );
}
