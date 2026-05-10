import { Text, View } from 'react-native';
import { ProfilePanel } from '@/components/shared/ProfilePanel';

export default function LogistikBerandaScreen() {
  return (
    <View className="flex-1 bg-black p-4">
      <Text className="mb-4 text-xl font-bold text-yellow-300">Beranda Logistik</Text>
      <ProfilePanel />
    </View>
  );
}
