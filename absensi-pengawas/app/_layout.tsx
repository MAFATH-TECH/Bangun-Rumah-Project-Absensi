import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import 'react-native-reanimated';

import Toast from 'react-native-toast-message';

import { isInvalidRefreshTokenError } from '@/lib/auth/errors';
import { clearLocalAuthSession } from '@/lib/auth/session';

import supabase from '@/lib/supabase';
import { useAuthStore } from '@/lib/store/authStore';

export default function RootLayout() {
  const { loadSession, setSessionState } = useAuthStore();

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      if (event === 'SIGNED_OUT' || !nextSession) {
        await setSessionState(null);
        return;
      }

      try {
        await setSessionState(nextSession);
      } catch (error) {
        if (isInvalidRefreshTokenError(error)) {
          await clearLocalAuthSession();
          await setSessionState(null);
        }
      }
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
