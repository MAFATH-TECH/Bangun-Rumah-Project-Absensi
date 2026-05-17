import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import supabase from '@/lib/supabase';
import { useAuthStore } from '@/lib/store/authStore';

export default function RootLayout() {
  const { loadSession, setSessionState } = useAuthStore();

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void setSessionState(nextSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSessionState]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(pengawas)" />
        <Stack.Screen name="(logistik)" />
        <Stack.Screen name="(admin)" />
      </Stack>
      <Toast />
    </>
  );
}
