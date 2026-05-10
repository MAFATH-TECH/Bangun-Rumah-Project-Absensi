import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { z } from 'zod';
import { useAuthStore } from '@/lib/store/authStore';
import { Profile } from '@/lib/types';

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const roleRouteMap: Record<Profile['role'], string> = {
  pengawas: '/(pengawas)/beranda',
  logistik: '/(logistik)/beranda',
  admin: '/(admin)/dashboard',
};

export default function LoginScreen() {
  const { signIn, isLoading, session, profile } = useAuthStore();
  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    const { error, role } = await signIn(values.email, values.password);

    if (error) {
      setError('root', {
        message: error,
      });
      return;
    }

    if (!role) {
      setError('root', {
        message: 'Role user tidak ditemukan. Hubungi admin.',
      });
      return;
    }

    router.replace(roleRouteMap[role] as never);
  };

  if (session && profile?.role) {
    return <Redirect href={roleRouteMap[profile.role] as never} />;
  }

  return (
    <View className="flex-1 justify-center bg-black px-6">
      <View className="mb-8 items-center">
        <View className="mb-4 h-20 w-20 items-center justify-center rounded-2xl bg-yellow-400">
          <Text className="text-3xl font-bold text-black">A</Text>
        </View>
        <Text className="text-2xl font-bold text-white">Absensi Pengawas</Text>
        <Text className="mt-1 text-sm text-yellow-200">Silakan login untuk melanjutkan</Text>
      </View>

      <View className="rounded-2xl border border-yellow-400 bg-white p-5">
        <Text className="mb-2 text-sm font-medium text-black">Email</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              value={value}
              onChangeText={onChange}
              placeholder="nama@email.com"
              placeholderTextColor="#6b7280"
              className="rounded-xl border border-yellow-500 bg-white px-4 py-3 text-black"
            />
          )}
        />
        {errors.email?.message ? (
          <Text className="mt-1 text-xs text-red-400">{errors.email.message}</Text>
        ) : null}

        <Text className="mb-2 mt-4 text-sm font-medium text-black">Password</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <TextInput
              secureTextEntry
              value={value}
              onChangeText={onChange}
              placeholder="Masukkan password"
              placeholderTextColor="#6b7280"
              className="rounded-xl border border-yellow-500 bg-white px-4 py-3 text-black"
            />
          )}
        />
        {errors.password?.message ? (
          <Text className="mt-1 text-xs text-red-400">{errors.password.message}</Text>
        ) : null}

        {errors.root?.message ? (
          <Text className="mt-3 text-sm text-red-400">{errors.root.message}</Text>
        ) : null}

        <Pressable
          disabled={isLoading}
          onPress={handleSubmit(onSubmit)}
          className="mt-6 items-center rounded-xl bg-yellow-400 px-4 py-3 disabled:opacity-70"
        >
          {isLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text className="font-semibold text-black">Masuk</Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => router.push('/(auth)/register' as never)}
          className="mt-4 items-center py-2"
        >
          <Text className="text-sm text-black">
            Belum punya akun? <Text className="font-semibold text-yellow-600">Daftar sekarang</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
