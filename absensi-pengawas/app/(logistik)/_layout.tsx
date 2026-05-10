import { Redirect, Stack } from 'expo-router';
import { View } from 'react-native';
import { BottomNav } from '@/components/shared/BottomNav';
import { useAuth } from '@/lib/hooks/useAuth';

export default function LogistikLayout() {
  const { isLoading, isAuthenticated, isLogistik } = useAuth();

  if (!isLoading && (!isAuthenticated || !isLogistik)) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View className="flex-1 bg-slate-50">
      <View className="flex-1">
        <Stack screenOptions={{ headerShown: false }} />
      </View>
      <BottomNav role="logistik" />
    </View>
  );
}
