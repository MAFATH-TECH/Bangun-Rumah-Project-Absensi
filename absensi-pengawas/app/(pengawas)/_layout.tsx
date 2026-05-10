import { Redirect, Stack } from 'expo-router';
import { View } from 'react-native';
import { BottomNav } from '@/components/shared/BottomNav';
import { useAuth } from '@/lib/hooks/useAuth';

export default function PengawasLayout() {
  const { isLoading, isAuthenticated, isPengawas } = useAuth();

  if (!isLoading && (!isAuthenticated || !isPengawas)) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View className="flex-1 bg-slate-50">
      <View className="flex-1">
        <Stack screenOptions={{ headerShown: false }} />
      </View>
      <BottomNav role="pengawas" />
    </View>
  );
}
