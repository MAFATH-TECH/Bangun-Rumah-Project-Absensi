import { Redirect, Stack } from 'expo-router';
import { View } from 'react-native';
import { BottomNav } from '@/components/shared/BottomNav';
import { useAuth } from '@/lib/hooks/useAuth';

export default function AdminLayout() {
  const { isLoading, isAuthenticated, isAdmin } = useAuth();

  if (!isLoading && (!isAuthenticated || !isAdmin)) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View className="flex-1 bg-slate-50">
      <View className="flex-1">
        <Stack screenOptions={{ headerShown: false }} />
      </View>
      <BottomNav role="admin" />
    </View>
  );
}
