import { Redirect, Stack } from 'expo-router';
import { View } from 'react-native';
import { BottomNav } from '@/components/shared/BottomNav';
import { PengawasGate } from '@/components/pengawas/PengawasGate';
import { useAuth } from '@/lib/hooks/useAuth';

export default function PengawasLayout() {
  const { isLoading, isAuthenticated, isPengawas } = useAuth();

  if (!isLoading && (!isAuthenticated || !isPengawas)) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <PengawasGate>
      <View className="flex-1 bg-slate-50">
        <View className="flex-1">
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="beranda" />
            <Stack.Screen name="absensi" />
            <Stack.Screen name="laporan" />
            <Stack.Screen name="lengkapi-laporan" />
            <Stack.Screen name="riwayat" />
            <Stack.Screen name="riwayat/[tanggal]" />
          </Stack>
        </View>
        <BottomNav role="pengawas" />
      </View>
    </PengawasGate>
  );
}
