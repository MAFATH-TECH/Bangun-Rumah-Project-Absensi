import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/lib/hooks/useAuth';

export default function IndexScreen() {
  const { isLoading, isAuthenticated, role } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (role === 'pengawas') {
    return <Redirect href="/(pengawas)/beranda" />;
  }

  if (role === 'logistik') {
    return <Redirect href="/(logistik)/beranda" />;
  }

  if (role === 'admin') {
    return <Redirect href="/(admin)/dashboard" />;
  }

  return <Redirect href="/(auth)/login" />;
}
