import { router } from 'expo-router';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAuthStore } from '@/lib/store/authStore';

const ROLE_LABEL = {
  pengawas: 'Pengawas',
  logistik: 'Logistik',
  admin: 'Admin',
} as const;

export function ProfilePanel() {
  const { profile, user, role, isLoading } = useAuth();
  const { signOut } = useAuthStore();

  const onSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  if (isLoading) {
    return (
      <View className="rounded-2xl border border-yellow-400 bg-white p-5">
        <ActivityIndicator color="#000" />
      </View>
    );
  }

  return (
    <View className="rounded-2xl border border-yellow-400 bg-white p-5">
      <Text className="text-lg font-bold text-black">Profil Saya</Text>
      <Text className="mt-4 text-xs uppercase tracking-wide text-slate-500">Nama</Text>
      <Text className="text-base font-semibold text-black">{profile?.nama_lengkap ?? '-'}</Text>

      <Text className="mt-3 text-xs uppercase tracking-wide text-slate-500">Email</Text>
      <Text className="text-base text-black">{profile?.email ?? user?.email ?? '-'}</Text>

      <Text className="mt-3 text-xs uppercase tracking-wide text-slate-500">No. HP</Text>
      <Text className="text-base text-black">{profile?.no_hp ?? '-'}</Text>

      <Text className="mt-3 text-xs uppercase tracking-wide text-slate-500">Role</Text>
      <Text className="text-base font-semibold text-black">{role ? ROLE_LABEL[role] : '-'}</Text>

      <Pressable onPress={onSignOut} className="mt-6 items-center rounded-xl bg-black px-4 py-3">
        <Text className="font-semibold text-yellow-300">Logout</Text>
      </Pressable>
    </View>
  );
}
